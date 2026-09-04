import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "gunluk_rapor", 10, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "gunluk_rapor", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "gunluk_rapor", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const gelirBugun = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar, COALESCE(SUM(net_gelir_tl), 0)::float AS net, COUNT(*)::int AS adet
      FROM satislar WHERE olusturulma::date = CURRENT_DATE
    `;
    const gelirDun = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar, COALESCE(SUM(net_gelir_tl), 0)::float AS net, COUNT(*)::int AS adet
      FROM satislar WHERE olusturulma::date = (CURRENT_DATE - INTERVAL '1 day')
    `;
    const giderBugun = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar FROM giderler WHERE tarih = CURRENT_DATE
    `;

    const yeniKayitBugun = await sql`
      SELECT COUNT(*)::int AS adet FROM kullanicilar WHERE olusturulma::date = CURRENT_DATE
    `;
    const aktifPremium = await sql`
      SELECT COUNT(*)::int AS adet FROM abonelikler WHERE durum = 'aktif'
    `;
    const toplamKullanici = await sql`SELECT COUNT(*)::int AS adet FROM kullanicilar`;

    const aiBugun = await sql`
      SELECT COALESCE(SUM(tahmini_maliyet_tl), 0)::float AS maliyet, COUNT(*)::int AS cagriSayisi
      FROM ai_kullanim_log WHERE olusturulma::date = CURRENT_DATE
    `;
    const aiDun = await sql`
      SELECT COALESCE(SUM(tahmini_maliyet_tl), 0)::float AS maliyet, COUNT(*)::int AS cagriSayisi
      FROM ai_kullanim_log WHERE olusturulma::date = (CURRENT_DATE - INTERVAL '1 day')
    `;

    const g = gelirBugun[0], gd = gelirDun[0], gid = giderBugun[0];
    const ai = aiBugun[0], aid = aiDun[0];

    const aiDegisimYuzde = aid.maliyet > 0 ? Math.round(((ai.maliyet - aid.maliyet) / aid.maliyet) * 10000) / 100 : null;
    const brutKatki = g.net - gid.tutar;

    let aiYorum = null;
    try {
      const ozetPrompt = `Sen bir teknoloji sirketinin CEO'suna gunluk rapor sunan finans analistisin. Asagidaki GERCEK verilere bakarak 2-3 cumlelik, SADECE risk veya firsat iceren KISA bir degerlendirme yaz - selamlama, giris cumlesi, tekrar YOK, direkt analiz. Eger veri cok azsa (yeni sistem, dusuk hacim) bunu da durustce belirt, abartili yorum yapma.
Gunluk gelir: ${Math.round(g.tutar)}TL (dun: ${Math.round(gd.tutar)}TL)
AI maliyeti: ${Math.round(ai.maliyet)}TL (dun: ${Math.round(aid.maliyet)}TL)
Yeni kayit: ${yeniKayitBugun[0].adet}
Aktif Premium: ${aktifPremium[0].adet}
SADECE Turkce yaz, markdown kullanma.`;
      aiYorum = await aiCagir({ prompt: ozetPrompt, maxTokens: 300, jsonModu: false });
    } catch (e) {
      console.error("Gunluk rapor AI yorum hatasi:", e);
    }

    return Response.json({
      tarih: new Date().toISOString().slice(0, 10),
      aiYorum,
      finans: {
        gunlukGelirTl: Math.round(g.tutar * 100) / 100,
        gunlukNetGelirTl: Math.round(g.net * 100) / 100,
        gunlukSatisAdedi: g.adet,
        gunlukGiderTl: Math.round(gid.tutar * 100) / 100,
        brutKatkiTl: Math.round(brutKatki * 100) / 100,
        dunkuGelirTl: Math.round(gd.tutar * 100) / 100,
        dunkuSatisAdedi: gd.adet,
      },
      kullanici: {
        yeniKayitBugun: yeniKayitBugun[0].adet,
        aktifPremiumSayisi: aktifPremium[0].adet,
        toplamKullaniciSayisi: toplamKullanici[0].adet,
      },
      aiMaliyeti: {
        bugunTl: Math.round(ai.maliyet * 100) / 100,
        bugunCagriSayisi: ai.cagriSayisi,
        dunTl: Math.round(aid.maliyet * 100) / 100,
        degisimYuzde: aiDegisimYuzde,
        not: "Cikti karakter sayisindan token TAHMIN edilerek hesaplanir, gercek saglayici faturasi degildir.",
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Rapor olusturulamadi" }, { status: 500 });
  }
}
