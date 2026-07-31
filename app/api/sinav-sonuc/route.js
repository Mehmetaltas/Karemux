import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, tur, ders, dogru, yanlis, bos, net } = await req.json();
    if (!tur || !ders || dogru == null || yanlis == null || bos == null || net == null) {
      return Response.json({ error: "Eksik veri" }, { status: 400 });
    }
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Kullanici belirlenemedi" }, { status: 400 });

    await sql`
      INSERT INTO sinav_sonuclari (kullanici_id, tur, ders, dogru, yanlis, bos, net)
      VALUES (${kullaniciId}, ${tur}, ${ders}, ${dogru}, ${yanlis}, ${bos}, ${net})
    `;

    // Ayni ders + tur icin bir onceki sonucu da donduruyoruz, "gecmise gore" kiyaslama icin
    const gecmis = await sql`
      SELECT net, olusturulma FROM sinav_sonuclari
      WHERE kullanici_id = ${kullaniciId} AND ders = ${ders} AND tur = ${tur}
      ORDER BY olusturulma DESC
      LIMIT 2
    `;
    const oncekiNet = gecmis.length > 1 ? Number(gecmis[1].net) : null;

    return Response.json({ ok: true, oncekiNet });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ sonuclar: [] });

    const sonuclar = await sql`
      SELECT tur, ders, dogru, yanlis, bos, net, olusturulma
      FROM sinav_sonuclari
      WHERE kullanici_id = ${kullaniciId}
      ORDER BY olusturulma DESC
      LIMIT 30
    `;
    return Response.json({ sonuclar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
