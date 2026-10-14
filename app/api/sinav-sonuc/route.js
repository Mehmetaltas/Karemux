import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { ozetSonucuDogrula, PUANLAMA_SURUMU } from "@/lib/puanlama";

export async function POST(req) {
  try {
    const { cihazId, tur, ders, dogru, yanlis, bos } = await req.json();
    if (typeof tur !== "string" || typeof ders !== "string" || !tur || !ders || tur.length > 80 || ders.length > 200 || dogru == null || yanlis == null || bos == null) {
      return Response.json({ error: "Eksik veri" }, { status: 400 });
    }
    // Faz E: bu uc nokta cevap anahtarina sahip DEGIL (sinavlar istemcide
    // olusturuluyor), bu yuzden sayilar dogrulanir ve NET istemciden ALINMAZ,
    // sunucuda yeniden hesaplanir. Tam sunucu puanlamasi sinav turu basina ayrica yapilir.
    const ozet = ozetSonucuDogrula({ dogru, yanlis, bos });
    if (!ozet) return Response.json({ error: "Gecersiz sonuc degerleri" }, { status: 400 });
    const net = ozet.net;
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Kullanici belirlenemedi" }, { status: 400 });

    const kullaniciSatiri = await sql`SELECT hedef_il, hedef_ilce, kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    const il = kullaniciSatiri[0]?.hedef_il || null;
    const ilce = kullaniciSatiri[0]?.hedef_ilce || null;
    const kurumId = kullaniciSatiri[0]?.kurum_id || null;

    await sql`
      INSERT INTO sinav_sonuclari (kullanici_id, tur, ders, dogru, yanlis, bos, net, il, ilce, kurum_id, puanlama_surumu)
      VALUES (${kullaniciId}, ${tur}, ${ders}, ${dogru}, ${yanlis}, ${bos}, ${net}, ${il}, ${ilce}, ${kurumId}, ${PUANLAMA_SURUMU})
    `;

    // Ayni ders + tur icin bir onceki sonucu da donduruyoruz, "gecmise gore" kiyaslama icin
    const gecmis = await sql`
      SELECT net, olusturulma FROM sinav_sonuclari
      WHERE kullanici_id = ${kullaniciId} AND ders = ${ders} AND tur = ${tur}
      ORDER BY olusturulma DESC
      LIMIT 2
    `;
    const oncekiNet = gecmis.length > 1 ? Number(gecmis[1].net) : null;

    const testSayisi = await sql`
      SELECT COUNT(*)::int AS adet FROM sinav_sonuclari
      WHERE kullanici_id = ${kullaniciId} AND ders = ${ders} AND tur = ${tur}
    `;
    const testNo = testSayisi[0]?.adet || 1;

    return Response.json({ ok: true, oncekiNet, testNo });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const cihazId = params.get("cihazId");
    const dersFiltre = params.get("ders");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ sonuclar: [] });

    const sonuclar = dersFiltre
      ? await sql`
          SELECT tur, ders, dogru, yanlis, bos, net, olusturulma
          FROM sinav_sonuclari
          WHERE kullanici_id = ${kullaniciId} AND (ders = ${dersFiltre} OR ders LIKE ${dersFiltre + "::%"})
          ORDER BY olusturulma DESC
          LIMIT 100
        `
      : await sql`
          SELECT tur, ders, dogru, yanlis, bos, net, olusturulma
          FROM sinav_sonuclari
          WHERE kullanici_id = ${kullaniciId}
          ORDER BY olusturulma DESC
          LIMIT 200
        `;
    return Response.json({ sonuclar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
