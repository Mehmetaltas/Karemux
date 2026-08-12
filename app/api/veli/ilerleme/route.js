import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function GET(req) {
  const veliId = oturumdanKullaniciId(req);
  if (!veliId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

  try {
    const ogrenciler = await sql`
      SELECT k.id, k.ad, k.sinif FROM veli_ogrenci vo
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

      // Ders bazinda son 30 gunun net ortalamasi (deneme/yazili)
      const netSatirlari = await sql`
        SELECT ders, AVG(net)::numeric(5,2) AS ortalama_net, COUNT(*)::int AS test_sayisi
        FROM sinav_sonuclari
        WHERE kullanici_id = ${ogrenci.id} AND olusturulma >= now() - interval '30 days' AND (tur = 'deneme' OR tur = 'yazili')
        GROUP BY ders
      `;

      // Bu haftaki aktif gun sayisi (basit "ne kadar calisti" gostergesi)
      const aktifGunler = await sql`
        SELECT COUNT(*)::int AS gun FROM gunluk_kullanim
        WHERE kullanici_id = ${ogrenci.id} AND tarih >= (CURRENT_DATE - interval '7 days') AND ai_istek_sayisi > 0
      `;

      sonuc.push({
        ogrenci: { ad: ogrenci.ad, sinif: ogrenci.sinif },
        gecmis: satirlar,
        zayifDersler,
        netOzet: netSatirlari,
        buHaftaAktifGun: aktifGunler[0]?.gun || 0,
      });
    }

    return Response.json({ ogrenciler: sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
