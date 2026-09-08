import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

// Satis Lead Takibi (8 Eylul) - donusum_olayi'ndaki (premium_inceleme,
// satin_alma_baslatildi) GERCEK ilgi sinyallerini kullanir. Odeme yapmamis
// olanlari listeler - admin'in manuel takip edip ("merhaba, yardimci
// olabilir miyim?") donusum saglayabilecegi gercek bir lead listesi.
export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const leadler = await sql`
      SELECT
        k.id AS kullanici_id, k.ad, k.eposta, k.sinif,
        MAX(d.olusturulma) AS son_ilgi_tarihi,
        (SELECT olay_turu FROM donusum_olayi WHERE kullanici_id = k.id AND olay_turu IN ('premium_inceleme','satin_alma_baslatildi') ORDER BY olusturulma DESC LIMIT 1) AS son_olay_turu,
        COUNT(*)::int AS ilgi_sayisi
      FROM donusum_olayi d
      JOIN kullanicilar k ON k.id = d.kullanici_id
      WHERE d.olay_turu IN ('premium_inceleme', 'satin_alma_baslatildi')
        AND d.olusturulma >= now() - interval '14 days'
        AND NOT EXISTS (
          SELECT 1 FROM odemeler o WHERE o.kullanici_id = k.id AND o.durum = 'basarili' AND o.olusturulma >= now() - interval '14 days'
        )
      GROUP BY k.id, k.ad, k.eposta, k.sinif
      ORDER BY son_ilgi_tarihi DESC
      LIMIT 50
    `;

    return Response.json({ leadler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
