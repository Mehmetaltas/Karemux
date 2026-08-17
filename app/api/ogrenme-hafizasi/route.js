import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ogrencinin genel ogrenme profilini tek bir yerde toplar: zayif konular,
// saatlik basari patern (hangi saat araliginda daha basarili) ve toplam
// aktivite. AI Koc gibi kisisellestirme yapan ozellikleri beslemek icindir.
// NOT: saatlik patern sunucu UTC saatine gore hesaplanir, kesin bir bilimsel
// olcum degil, kaba bir egilim gostergesidir.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cihazId = searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ zayifKonular: [], saatlikPatern: [], toplamSoru: 0 });

    const hataGrup = await sql`
      SELECT ders, alt_konu, COUNT(*)::int AS hata_sayisi
      FROM hata_kitapcigi
      WHERE kullanici_id = ${kullaniciId} AND cozuldu = false AND alt_konu IS NOT NULL
      GROUP BY ders, alt_konu
      ORDER BY hata_sayisi DESC
      LIMIT 5
    `;

    const saatlikSonuc = await sql`
      SELECT EXTRACT(HOUR FROM olusturulma)::int AS saat,
        ROUND(AVG(CASE WHEN (dogru + yanlis + bos) > 0 THEN dogru::float / (dogru + yanlis + bos) ELSE NULL END)::numeric, 2) AS basari_orani,
        COUNT(*)::int AS test_sayisi
      FROM sinav_sonuclari
      WHERE kullanici_id = ${kullaniciId}
      GROUP BY EXTRACT(HOUR FROM olusturulma)
      HAVING COUNT(*) >= 2
      ORDER BY basari_orani DESC
    `;

    const toplamSoruSonuc = await sql`
      SELECT COALESCE(SUM(toplam_soru), 0)::int AS toplam FROM ilerleme WHERE kullanici_id = ${kullaniciId}
    `;

    return Response.json({
      zayifKonular: hataGrup,
      saatlikPatern: saatlikSonuc,
      toplamSoru: toplamSoruSonuc[0].toplam,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ zayifKonular: [], saatlikPatern: [], toplamSoru: 0 });
  }
}
