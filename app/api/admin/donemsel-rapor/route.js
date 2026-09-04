import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

const DONEM_GUN = {
  aylik: 30,
  uc_aylik: 90,
  alti_aylik: 182,
  yillik: 365,
};

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "donemsel_rapor", 10, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "donemsel_rapor", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "donemsel_rapor", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const u = new URL(req.url);
    const sifre = u.searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const donem = DONEM_GUN[u.searchParams.get("donem")] ? u.searchParams.get("donem") : "aylik";
    const gunSayisi = DONEM_GUN[donem];

    const gelirBuDonem = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar, COALESCE(SUM(net_gelir_tl), 0)::float AS net, COUNT(*)::int AS adet
      FROM satislar WHERE olusturulma >= (CURRENT_DATE - (${gunSayisi}::text || ' days')::interval)
    `;
    const gelirOncekiDonem = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar, COUNT(*)::int AS adet
      FROM satislar
      WHERE olusturulma >= (CURRENT_DATE - (${gunSayisi * 2}::text || ' days')::interval)
        AND olusturulma < (CURRENT_DATE - (${gunSayisi}::text || ' days')::interval)
    `;
    const giderBuDonem = await sql`
      SELECT COALESCE(SUM(tutar_tl), 0)::float AS tutar FROM giderler WHERE tarih >= (CURRENT_DATE - (${gunSayisi}::text || ' days')::interval)
    `;
    const yeniKayitBuDonem = await sql`
      SELECT COUNT(*)::int AS adet FROM kullanicilar WHERE olusturulma >= (CURRENT_DATE - (${gunSayisi}::text || ' days')::interval)
    `;
    const yeniKayitOncekiDonem = await sql`
      SELECT COUNT(*)::int AS adet FROM kullanicilar
      WHERE olusturulma >= (CURRENT_DATE - (${gunSayisi * 2}::text || ' days')::interval)
        AND olusturulma < (CURRENT_DATE - (${gunSayisi}::text || ' days')::interval)
    `;
    const aiBuDonem = await sql`
      SELECT COALESCE(SUM(tahmini_maliyet_tl), 0)::float AS maliyet, COUNT(*)::int AS "cagriSayisi"
      FROM ai_kullanim_log WHERE olusturulma >= (CURRENT_DATE - (${gunSayisi}::text || ' days')::interval)
    `;
    const aiOncekiDonem = await sql`
      SELECT COALESCE(SUM(tahmini_maliyet_tl), 0)::float AS maliyet
      FROM ai_kullanim_log
      WHERE olusturulma >= (CURRENT_DATE - (${gunSayisi * 2}::text || ' days')::interval)
        AND olusturulma < (CURRENT_DATE - (${gunSayisi}::text || ' days')::interval)
    `;

    const aylikKirilim = await sql`
      SELECT date_trunc('month', olusturulma)::date AS ay, COALESCE(SUM(tutar_tl), 0)::float AS gelir, COUNT(*)::int AS satisAdedi
      FROM satislar WHERE olusturulma >= (CURRENT_DATE - (${gunSayisi}::text || ' days')::interval)
      GROUP BY ay ORDER BY ay ASC
    `;

    const g = gelirBuDonem[0], go = gelirOncekiDonem[0], gid = giderBuDonem[0];
    const ai = aiBuDonem[0], aio = aiOncekiDonem[0];

    const gelirDegisimYuzde = go.tutar > 0 ? Math.round(((g.tutar - go.tutar) / go.tutar) * 10000) / 100 : null;
    const aiDegisimYuzde = aio.maliyet > 0 ? Math.round(((ai.maliyet - aio.maliyet) / aio.maliyet) * 10000) / 100 : null;
    const brutKatki = g.net - gid.tutar;

    return Response.json({
      donem,
      gunSayisi,
      donemBaslangic: new Date(Date.now() - gunSayisi * 86400000).toISOString().slice(0, 10),
      donemBitis: new Date().toISOString().slice(0, 10),
      finans: {
        donemGelirTl: Math.round(g.tutar * 100) / 100,
        donemNetGelirTl: Math.round(g.net * 100) / 100,
        donemSatisAdedi: g.adet,
        donemGiderTl: Math.round(gid.tutar * 100) / 100,
        brutKatkiTl: Math.round(brutKatki * 100) / 100,
        oncekiDonemGelirTl: Math.round(go.tutar * 100) / 100,
        gelirDegisimYuzde,
      },
      kullanici: {
        yeniKayitBuDonem: yeniKayitBuDonem[0].adet,
        yeniKayitOncekiDonem: yeniKayitOncekiDonem[0].adet,
      },
      aiMaliyeti: {
        buDonemTl: Math.round(ai.maliyet * 100) / 100,
        buDonemCagriSayisi: ai.cagriSayisi,
        oncekiDonemTl: Math.round(aio.maliyet * 100) / 100,
        degisimYuzde: aiDegisimYuzde,
      },
      aylikKirilim: aylikKirilim.map((r) => ({ ay: r.ay, gelirTl: r.gelir, satisAdedi: r.satisadedi })),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Rapor olusturulamadi" }, { status: 500 });
  }
}
