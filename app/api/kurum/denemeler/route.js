import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

// Giris yapmis kurum yoneticisine: aktif tum ucretli denemeleri, HER BIRI icin
// kendi kurumunun satin alip almadigi/odeme durumu ile birlikte listeler.
export async function GET(req) {
  const yonetici = await kurumYoneticisiCoz(req);
  if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

  const denemeler = await sql`
    SELECT d.id, d.ad, d.ders, d.sinif, d.fiyat_tl, d.kapsam, d.il,
           s.odendi, s.satin_alma_tarihi
    FROM ucretli_denemeler d
    LEFT JOIN kurum_deneme_satin_alma s ON s.deneme_id = d.id AND s.kurum_id = ${yonetici.kurumId}
    WHERE d.aktif = true
    ORDER BY d.olusturulma DESC
  `;
  return Response.json({ denemeler });
}
