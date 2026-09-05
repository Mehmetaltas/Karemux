import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ogrencinin hata kitapcigindan, HENUZ COZULMEMIS (cozuldu=false) en sik
// tekrar eden zayif konuyu bulur - Tek Konu Motoru'nun "Sistem Onerisi"
// karti icin (5 Eylul).
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ oneri: null });

    const kullanici = await sql`SELECT sinif FROM kullanicilar WHERE id = ${kullaniciId}`;
    const sinif = kullanici[0]?.sinif;

    const sonuc = await sql`
      SELECT ders, alt_konu, COUNT(*) AS hata_sayisi
      FROM hata_kitapcigi
      WHERE kullanici_id = ${kullaniciId} AND cozuldu = false AND alt_konu IS NOT NULL
      GROUP BY ders, alt_konu
      ORDER BY hata_sayisi DESC
      LIMIT 1
    `;

    if (sonuc.length === 0) return Response.json({ oneri: null, sinif });

    return Response.json({
      oneri: { ders: sonuc[0].ders, konu: sonuc[0].alt_konu, hataSayisi: Number(sonuc[0].hata_sayisi) },
      sinif,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ oneri: null });
  }
}
