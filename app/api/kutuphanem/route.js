import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ogrenci Kutuphanem (8 Eylul) - onceden urettigi/gordugu icerigin tek yerde
// kategorize gorunumu. Yeni veri UretMEZ, var olan tablolardan (hata_kitapcigi,
// sinav_sonuclari, tek_konu_oturumu) okur - hicbir yeni izleme eklenmedi.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ hatalar: [], sinavlar: [], tekKonular: [] });

    const hatalar = await sql`
      SELECT id, ders, alt_konu, soru, olusturulma
      FROM hata_kitapcigi
      WHERE kullanici_id = ${kullaniciId} AND cozuldu = false
      ORDER BY olusturulma DESC LIMIT 100
    `;

    const sinavlar = await sql`
      SELECT id, tur, ders, dogru, yanlis, bos, net, olusturulma
      FROM sinav_sonuclari
      WHERE kullanici_id = ${kullaniciId}
      ORDER BY olusturulma DESC LIMIT 50
    `;

    const tekKonular = await sql`
      SELECT id, sinif, ders, unite, konu, net, durum, olusturulma, tamamlanma
      FROM tek_konu_oturumu
      WHERE kullanici_id = ${kullaniciId}
      ORDER BY olusturulma DESC LIMIT 50
    `;

    return Response.json({ hatalar, sinavlar, tekKonular });
  } catch (e) {
    console.error(e);
    return Response.json({ hatalar: [], sinavlar: [], tekKonular: [] });
  }
}
