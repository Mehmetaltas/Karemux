import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

// Kurumun satin aldigi tum lisanslari, HER BIRI icin kullanilan/bos koltuk
// sayisiyla birlikte listeler.
export async function GET(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const lisanslar = await sql`
      SELECT l.id, l.plan, l.koltuk_sayisi, l.tutar_tl, l.odendi, l.satin_alma_tarihi,
             COUNT(a.id)::int AS kullanilan_koltuk
      FROM kurum_lisans_satin_alma l
      LEFT JOIN abonelikler a ON a.kurum_lisans_id = l.id AND a.durum = 'aktif'
      WHERE l.kurum_id = ${yonetici.kurumId} AND l.odendi = true
      GROUP BY l.id
      ORDER BY l.satin_alma_tarihi DESC
    `;
    return Response.json({ lisanslar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Lisanslar alinamadi" }, { status: 500 });
  }
}
