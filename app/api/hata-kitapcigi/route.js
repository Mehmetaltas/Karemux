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
            ELSE tur
          END AS alt_konu,
          SUM(yanlis)::int AS hata_sayisi
        FROM sinav_sonuclari
        WHERE kullanici_id = ${kullaniciId} AND yanlis > 0
        GROUP BY ders, tur
      `;

      const istatistik = [...hataGrup, ...seviyeGrup, ...sinavGrup].filter((r) => r.hata_sayisi > 0);
      return Response.json({ istatistik });
    }

    const kayitlar = kullaniciId
      ? await sql`
          SELECT id, ders, alt_konu, soru, secenekler, dogru_index, aciklama, cozuldu, olusturulma
          FROM hata_kitapcigi
          WHERE kullanici_id = ${kullaniciId} AND cozuldu = false ${ders ? sql`AND ders = ${ders}` : sql``}
          ORDER BY olusturulma DESC
          LIMIT 100
        `
      : await sql`
          SELECT id, ders, alt_konu, soru, secenekler, dogru_index, aciklama, cozuldu, olusturulma
          FROM hata_kitapcigi
          WHERE cihaz_id = ${cihazId} AND cozuldu = false ${ders ? sql`AND ders = ${ders}` : sql``}
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
