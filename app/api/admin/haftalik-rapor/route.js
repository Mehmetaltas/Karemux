import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "haftalik_rapor", 10, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "haftalik_rapor", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "haftalik_rapor", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const gelirBuHafta = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar, COALESCE(SUM(net_gelir_tl), 0)::float AS net, COUNT(*)::int AS adet
      FROM satislar WHERE olusturulma >= (CURRENT_DATE - INTERVAL '7 days')
    `;
    const gelirOncekiHafta = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar, COUNT(*)::int AS adet
      FROM satislar WHERE olusturulma >= (CURRENT_DATE - INTERVAL '14 days') AND olusturulma < (CURRENT_DATE - INTERVAL '7 days')
    `;
    const giderBuHafta = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar FROM giderler WHERE tarih >= (CURRENT_DATE - INTERVAL '7 days')
    `;

    const yeniKayitBuHafta = await sql`
      SELECT COUNT(*)::int AS adet FROM kullanicilar WHERE olusturulma >= (CURRENT_DATE - INTERVAL '7 days')
    `;
    const yeniKayitOncekiHafta = await sql`
      SELECT COUNT(*)::int AS adet FROM kullanicilar WHERE olusturulma >= (CURRENT_DATE - INTERVAL '14 days') AND olusturulma < (CURRENT_DATE - INTERVAL '7 days')
    `;

    const aiBuHafta = await sql`
      SELECT COALESCE(SUM(tahmini_maliyet_tl), 0)::float AS maliyet, COUNT(*)::int AS cagriSayisi
      FROM ai_kullanim_log WHERE olusturulma >= (CURRENT_DATE - INTERVAL '7 days')
    `;
    const aiOncekiHafta = await sql`
      SELECT COALESCE(SUM(tahmini_maliyet_tl), 0)::float AS maliyet
      FROM ai_kullanim_log WHERE olusturulma >= (CURRENT_DATE - INTERVAL '14 days') AND olusturulma < (CURRENT_DATE - INTERVAL '7 days')
    `;

    const gunlukKirilim = await sql`
      SELECT olusturulma::date AS tarih, COALESCE(SUM(tutar_tl), 0)::float AS gelir, COUNT(*)::int AS satisAdedi
      FROM satislar WHERE olusturulma >= (CURRENT_DATE - INTERVAL '7 days')
      GROUP BY olusturulma::date ORDER BY tarih ASC
    `;

    const g = gelirBuHafta[0], go = gelirOncekiHafta[0], gid = giderBuHafta[0];
    const ai = aiBuHafta[0], aio = aiOncekiHafta[0];

    const gelirDegisimYuzde = go.tutar > 0 ? Math.round(((g.tutar - go.tutar) / go.tutar) * 10000) / 100 : null;
    const aiDegisimYuzde = aio.maliyet > 0 ? Math.round(((ai.maliyet - aio.maliyet) / aio.maliyet) * 10000) / 100 : null;
    const brutKatki = g.net - gid.tutar;

    return Response.json({
      donemBaslangic: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
      donemBitis: new Date().toISOString().slice(0, 10),
      finans: {
        haftalikGelirTl: Math.round(g.tutar * 100) / 100,
        haftalikNetGelirTl: Math.round(g.net * 100) / 100,
        haftalikSatisAdedi: g.adet,
        haftalikGiderTl: Math.round(gid.tutar * 100) / 100,
        brutKatkiTl: Math.round(brutKatki * 100) / 100,
        oncekiHaftaGelirTl: Math.round(go.tutar * 100) / 100,
        gelirDegisimYuzde,
      },
      kullanici: {
        yeniKayitBuHafta: yeniKayitBuHafta[0].adet,
        yeniKayitOncekiHafta: yeniKayitOncekiHafta[0].adet,
      },
      aiMaliyeti: {
        buHaftaTl: Math.round(ai.maliyet * 100) / 100,
        buHaftaCagriSayisi: ai.cagriSayisi,
        oncekiHaftaTl: Math.round(aio.maliyet * 100) / 100,
        degisimYuzde: aiDegisimYuzde,
      },
      gunlukKirilim: gunlukKirilim.map((r) => ({ tarih: r.tarih, gelirTl: r.gelir, satisAdedi: r.satisadedi })),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Rapor olusturulamadi" }, { status: 500 });
  }
}
