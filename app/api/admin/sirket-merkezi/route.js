import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

// Sirket Merkezi (8 Eylul) - tum departmanlarin tek sayfalik ozeti. Merkezi
// bir "analitik/log" panosu olmadigi icin (bugunku Faz B eksikler raporunda
// bulundu) - dagilmis rakamlari BIR YERE toplar. Yeni veri UretMEZ, var olan
// tablolardan gercek zamanli okur.
export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Gercek/test ayrimi (14 Eylul) - "Kullanici/Abone Takip" panelindeki AYNI
    // desen: anon.karemux.com (anonim cihaz izi) ve mehmetaltas/karemuxegitim
    // (kendi test hesaplari) sayimlardan HARIC tutulur - bu ekran YATIRIMCIYA/
    // gercek karar icin GERCEK musteri sayisini gostermeli, test verisi degil.
    const kullanicilar = await sql`
      SELECT COUNT(*)::int AS adet FROM kullanicilar
      WHERE sifre_hash != 'anon'
        AND eposta NOT LIKE '%@anon.karemux.com%'
        AND eposta NOT LIKE '%mehmetaltas%' AND eposta NOT LIKE '%karemuxegitim%'
        AND eposta NOT LIKE '%example.com%' AND eposta NOT LIKE 'test-%'
    `;
    const ogretmenler = await sql`
      SELECT COUNT(*)::int AS adet FROM ogretmenler
      WHERE eposta NOT LIKE '%mehmetaltas%' AND eposta NOT LIKE '%karemuxegitim%' AND eposta NOT LIKE 'test%'
    `;
    const kurumlar = await sql`
      SELECT COUNT(*)::int AS adet FROM kurumlar k
      WHERE NOT EXISTS (
        SELECT 1 FROM kullanicilar u WHERE u.kurum_id = k.id
        AND (u.eposta LIKE '%mehmetaltas%' OR u.eposta LIKE '%karemuxegitim%')
      )
    `;
    const bugunZiyaret = await sql`SELECT COUNT(DISTINCT cihaz_id)::int AS adet FROM donusum_olayi WHERE olay_turu = 'ziyaret' AND olusturulma >= CURRENT_DATE`;
    const buAyGelir = await sql`SELECT COALESCE(SUM(tutar), 0)::float AS toplam FROM odemeler WHERE durum = 'basarili' AND olusturulma >= date_trunc('month', CURRENT_DATE)`;
    const buAyGider = await sql`SELECT COALESCE(SUM(tutar_tl), 0)::float AS toplam FROM giderler WHERE tarih >= date_trunc('month', CURRENT_DATE)`;
    const acikDestek = await sql`SELECT COUNT(*)::int AS adet FROM destek_talebi WHERE durum = 'acik'`;
    const buAyAiMaliyet = await sql`SELECT COALESCE(SUM(tahmini_maliyet_tl), 0)::float AS toplam FROM ai_kullanim_log WHERE olusturulma >= date_trunc('month', CURRENT_DATE)`;
    const aktifAbonelik = await sql`
      SELECT COUNT(*)::int AS adet FROM abonelikler a
      JOIN kullanicilar u ON u.id = a.kullanici_id
      WHERE a.durum = 'aktif'
        AND u.eposta NOT LIKE '%mehmetaltas%' AND u.eposta NOT LIKE '%karemuxegitim%'
    `;
    const soruBankasi = await sql`SELECT COUNT(*)::int AS adet FROM soru_bankasi`;

    return Response.json({
      kullaniciSayisi: kullanicilar[0].adet,
      ogretmenSayisi: ogretmenler[0].adet,
      kurumSayisi: kurumlar[0].adet,
      bugunkuZiyaretci: bugunZiyaret[0].adet,
      buAyGelirTl: buAyGelir[0].toplam,
      buAyGiderTl: buAyGider[0].toplam,
      acikDestekTalebi: acikDestek[0].adet,
      buAyAiMaliyetTl: buAyAiMaliyet[0].toplam,
      aktifAbonelikSayisi: aktifAbonelik[0].adet,
      soruBankasiToplam: soruBankasi[0].adet,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
