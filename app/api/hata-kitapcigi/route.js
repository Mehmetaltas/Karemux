import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, ders, altKonu, soru, secenekler, dogruIndex, verilenIndex, aciklama } = await req.json();
    if (!ders || !soru || !Array.isArray(secenekler) || dogruIndex == null) {
      return Response.json({ error: "Eksik veri" }, { status: 400 });
    }
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    await sql`
      INSERT INTO hata_kitapcigi (kullanici_id, cihaz_id, ders, alt_konu, soru, secenekler, dogru_index, verilen_index, aciklama)
      VALUES (${kullaniciId}, ${cihazId || null}, ${ders}, ${altKonu || null}, ${soru}, ${JSON.stringify(secenekler)}, ${dogruIndex}, ${verilenIndex ?? null}, ${aciklama || null})
    `;

    // ADAPTIF OGRENME MOTORU: bu zayif konu sadece Hata Kitapcigi'nda kalmasin -
    // ayni rehberli Kademe 1/2/3 (Seviye Tamamlama) sistemine de otomatik girsin,
    // boylece nereden gelirse gelsin (soru coz, quiz, deneme...) her zayiflik ayni
    // yapilandirilmis telafi surecine baglanir. Ogrencinin sinifi bilinmiyorsa atlanir.
    if (kullaniciId && altKonu) {
      try {
        const kullaniciSatiri = await sql`SELECT sinif FROM kullanicilar WHERE id = ${kullaniciId}`;
        const ogrenciSinifi = kullaniciSatiri[0]?.sinif;
        if (ogrenciSinifi) {
          await sql`
            INSERT INTO seviye_tespit_kademe (kullanici_id, ders, unite, kaynak_sinif, kademe, tamamlandi)
            VALUES (${kullaniciId}, ${ders}, ${altKonu}, ${ogrenciSinifi}, 1, false)
            ON CONFLICT (kullanici_id, ders, unite, kaynak_sinif) DO NOTHING
          `;
        }
      } catch (e) {
        console.error("Adaptif motor kademe kaydi basarisiz (yoksayildi):", e.message);
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const cihazId = params.get("cihazId");
    const ders = params.get("ders");
    const istatistikMi = params.get("istatistik") === "true";
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    if (istatistikMi) {
      if (!kullaniciId) return Response.json({ istatistik: [] });

      const hataGrup = await sql`
        SELECT ders, alt_konu, COUNT(*)::int AS hata_sayisi
        FROM hata_kitapcigi
        WHERE kullanici_id = ${kullaniciId} AND cozuldu = false AND alt_konu IS NOT NULL
        GROUP BY ders, alt_konu
      `;

      const seviyeGrup = await sql`
        SELECT ders, unite AS alt_konu, (COUNT(*)::int * 3) AS hata_sayisi
        FROM seviye_tespit_kademe
        WHERE kullanici_id = ${kullaniciId} AND tamamlandi = false
        GROUP BY ders, unite
      `;

      const sinavGrup = await sql`
        SELECT ders,
          CASE tur
            WHEN 'deneme' THEN 'Deneme Sinavlari'
            WHEN 'yazili1' THEN 'Yazili 1'
            WHEN 'yazili2' THEN 'Yazili 2'
            WHEN 'yazili3' THEN 'Yazili 3'
          END AS alt_konu,
          SUM(yanlis)::int AS hata_sayisi
        FROM sinav_sonuclari
        WHERE kullanici_id = ${kullaniciId} AND yanlis > 0 AND tur IN ('deneme','yazili1','yazili2','yazili3')
        GROUP BY ders, tur
      `;

      // "ders_seviye" turunde ders alani "GercekDers::Unite" seklinde birlesik kaydediliyor -
      // burada ayristirip gercek konu adiyla gosteriyoruz.
      const dersSeviyeGrup = await sql`
        SELECT
          split_part(ders, '::', 1) AS ders,
          split_part(ders, '::', 2) AS alt_konu,
          SUM(yanlis)::int AS hata_sayisi
        FROM sinav_sonuclari
        WHERE kullanici_id = ${kullaniciId} AND yanlis > 0 AND tur = 'ders_seviye' AND ders LIKE '%::%'
        GROUP BY split_part(ders, '::', 1), split_part(ders, '::', 2)
      `;

      const istatistik = [...hataGrup, ...seviyeGrup, ...sinavGrup, ...dersSeviyeGrup].filter((r) => r.hata_sayisi > 0);
      return Response.json({ istatistik });
    }

    // NOT: Neon sql sablon etiketi ic ice sql`` parcalarini desteklemiyor -
    // NULL-guvenli tek kosul kullanildi (19 Agustos bulunan/duzeltilen kalip).
    const kayitlar = kullaniciId
      ? await sql`
          SELECT id, ders, alt_konu, soru, secenekler, dogru_index, aciklama, cozuldu, olusturulma
          FROM hata_kitapcigi
          WHERE kullanici_id = ${kullaniciId} AND cozuldu = false AND (${ders}::text IS NULL OR ders = ${ders})
          ORDER BY olusturulma DESC
          LIMIT 100
        `
      : await sql`
          SELECT id, ders, alt_konu, soru, secenekler, dogru_index, aciklama, cozuldu, olusturulma
          FROM hata_kitapcigi
          WHERE cihaz_id = ${cihazId} AND cozuldu = false AND (${ders}::text IS NULL OR ders = ${ders})
          ORDER BY olusturulma DESC
          LIMIT 100
        `;
    return Response.json({ kayitlar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id } = await req.json();
    if (!id) return Response.json({ error: "Eksik id" }, { status: 400 });
    await sql`UPDATE hata_kitapcigi SET cozuldu = true WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
