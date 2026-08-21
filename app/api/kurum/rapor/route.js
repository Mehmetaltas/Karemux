import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

// GUVENLIK GUNCELLEMESI (19 Agustos): eskiden kurum kodunu bilen HERKES bu
// raporu gorebiliyordu (kod sizdirilirsa - orn. ayrilan bir ogrenciden -
// sonsuza kadar gorulebilirdi). Artik SADECE giris yapmis, gercek kurum
// yoneticisi kendi kurumunun raporunu gorebiliyor (bugun kurulan kurumYoneticisiCoz
// oturum sistemine baglandi).
export async function GET(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });
    const kurumId = yonetici.kurumId;

    const kurum = await sql`SELECT ad FROM kurumlar WHERE id = ${kurumId}`;

    const ogrenciSayisi = await sql`SELECT COUNT(*) as sayi FROM kullanicilar WHERE kurum_id = ${kurumId}`;

    // Bu hafta en az 1 gun aktif olan benzersiz ogrenci sayisi
    const buHaftaAktif = await sql`
      SELECT COUNT(DISTINCT g.kullanici_id) as sayi FROM gunluk_kullanim g
      JOIN kullanicilar k ON k.id = g.kullanici_id
      WHERE k.kurum_id = ${kurumId} AND g.tarih >= (CURRENT_DATE - interval '7 days') AND g.ai_istek_sayisi > 0
    `;

    // Kurum genelinde tum derslerin ortalama neti (tek buyuk sayi icin)
    const genelOrtalamaNet = await sql`
      SELECT ROUND(AVG(s.net)::numeric, 2) as ortalama FROM sinav_sonuclari s
      JOIN kullanicilar k ON k.id = s.kullanici_id
      WHERE k.kurum_id = ${kurumId}
    `;

    // Son 7 gunun gunluk aktif ogrenci sayisi trendi (dashboard grafigi icin)
    const gunlukTrend = await sql`
      SELECT g.tarih, COUNT(DISTINCT g.kullanici_id) as aktif_ogrenci
      FROM gunluk_kullanim g
      JOIN kullanicilar k ON k.id = g.kullanici_id
      WHERE k.kurum_id = ${kurumId} AND g.tarih >= (CURRENT_DATE - interval '7 days') AND g.ai_istek_sayisi > 0
      GROUP BY g.tarih ORDER BY g.tarih ASC
    `;

    const sinifDagilimi = await sql`
      SELECT sinif, COUNT(*) as sayi FROM kullanicilar
      WHERE kurum_id = ${kurumId} AND sinif IS NOT NULL
      GROUP BY sinif ORDER BY sinif
    `;

    const dersBazindaNet = await sql`
      SELECT s.ders, ROUND(AVG(s.net)::numeric, 2) as ortalama_net, COUNT(*) as test_sayisi
      FROM sinav_sonuclari s
      JOIN kullanicilar k ON k.id = s.kullanici_id
      WHERE k.kurum_id = ${kurumId}
      GROUP BY s.ders ORDER BY ortalama_net ASC
    `;

    const zayifKonular = await sql`
      SELECT h.ders, h.alt_konu, COUNT(*) as hata_sayisi
      FROM hata_kitapcigi h
      JOIN kullanicilar k ON k.id = h.kullanici_id
      WHERE k.kurum_id = ${kurumId} AND h.alt_konu IS NOT NULL
      GROUP BY h.ders, h.alt_konu
      ORDER BY hata_sayisi DESC
      LIMIT 10
    `;

    const ulusalKarsilastirma = await sql`
      SELECT
        ud.id, ud.ad, ud.ders, ud.sinif,
        ROUND(AVG(uds.net) FILTER (WHERE uds.kurum_id = ${kurumId})::numeric, 2) AS kurum_ortalama,
        ROUND(AVG(uds.net)::numeric, 2) AS turkiye_ortalama,
        COUNT(*) FILTER (WHERE uds.kurum_id = ${kurumId})::int AS kurum_katilimci,
        COUNT(*)::int AS turkiye_katilimci
      FROM ulusal_deneme_sonuclari uds
      JOIN ulusal_denemeler ud ON ud.id = uds.ulusal_deneme_id
      GROUP BY ud.id, ud.ad, ud.ders, ud.sinif
      HAVING COUNT(*) FILTER (WHERE uds.kurum_id = ${kurumId}) > 0
      ORDER BY ud.id DESC
      LIMIT 10
    `;

    return Response.json({
      kurumAdi: kurum[0].ad,
      ogrenciSayisi: Number(ogrenciSayisi[0].sayi),
      buHaftaAktifOgrenci: Number(buHaftaAktif[0]?.sayi || 0),
      genelOrtalamaNet: genelOrtalamaNet[0]?.ortalama ? Number(genelOrtalamaNet[0].ortalama) : null,
      gunlukTrend,
      sinifDagilimi,
      dersBazindaNet,
      zayifKonular,
      ulusalKarsilastirma,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Rapor alinamadi" }, { status: 500 });
  }
}
