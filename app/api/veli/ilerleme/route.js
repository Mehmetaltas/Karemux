import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function GET(req) {
  const veliId = oturumdanKullaniciId(req);
  if (!veliId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

  try {
    const ogrenciler = await sql`
      SELECT k.id, k.ad FROM veli_ogrenci vo
      JOIN kullanicilar k ON k.id = vo.ogrenci_id
      WHERE vo.veli_id = ${veliId}
    `;

    const sonuc = [];
    for (const ogrenci of ogrenciler) {
      const satirlar = await sql`
        SELECT ders, konu, SUM(dogru_sayisi) AS dogru, SUM(toplam_soru) AS toplam, MAX(olusturulma) AS son_calisma
        FROM ilerleme
        WHERE kullanici_id = ${ogrenci.id}
        GROUP BY ders, konu
        ORDER BY (SUM(dogru_sayisi)::float / NULLIF(SUM(toplam_soru), 0)) ASC
      `;
      const zayifDersler = [...new Set(
        satirlar.filter((s) => s.dogru / s.toplam < 0.6).map((s) => s.ders)
      )];
      sonuc.push({ ogrenci: { ad: ogrenci.ad }, gecmis: satirlar, zayifDersler });
    }

    return Response.json({ ogrenciler: sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
