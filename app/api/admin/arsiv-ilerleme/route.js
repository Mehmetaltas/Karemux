import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "arsiv_ilerleme_admin", 8, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "arsiv_ilerleme_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "arsiv_ilerleme_admin", true);
  return { izinVar: true };
}

// 5.350 arsiv hedefi: Hedef / Gercek / Bekleyen / Kalite hatali AYRI gosterilir, hepsi GERCEK DB taramasindan.
// Hedef = mufredattaki alt konu sayisi x 10 materyal. 5.350 sabit kabul EDILMEZ; mufredat tablosundan hesaplanir.
export async function GET(req) {
  const yetki = await yetkiKontrol(req, new URL(req.url).searchParams.get("sifre"));
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const altKonu = await sql`SELECT COUNT(*)::int AS c FROM (SELECT DISTINCT sinif, ders, unite, alt_konu FROM mufredat WHERE alt_konu IS NOT NULL) x`;
  const hedefAltKonu = altKonu[0]?.c || 0;
  const MATERYAL_BASINA = 10;

  const turler = await sql`
    SELECT icerik_turu,
      COUNT(*)::int AS toplam,
      COUNT(*) FILTER (WHERE onay_durumu = 'onaylandi')::int AS onayli,
      COUNT(*) FILTER (WHERE onay_durumu IS NULL)::int AS kalite_gecti,
      COUNT(*) FILTER (WHERE onay_durumu = 'bekliyor')::int AS bekleyen,
      COUNT(*) FILTER (WHERE onay_durumu IN ('reddedildi','red'))::int AS reddedilen
    FROM icerik_onbellek GROUP BY icerik_turu ORDER BY toplam DESC`;
  const soruBankasi = await sql`SELECT COUNT(*)::int AS c FROM soru_bankasi`;
  const gercek = turler.reduce((a, t) => a + t.onayli + t.kalite_gecti, 0);
  const bekleyen = turler.reduce((a, t) => a + t.bekleyen, 0);
  const hatali = turler.reduce((a, t) => a + t.reddedilen, 0);

  return Response.json({
    hedef: hedefAltKonu * MATERYAL_BASINA, hedefAltKonu, materyalBasina: MATERYAL_BASINA,
    gercek, bekleyen, kaliteHatali: hatali,
    eksik: Math.max(0, hedefAltKonu * MATERYAL_BASINA - gercek),
    soruBankasiSoruSayisi: soruBankasi[0]?.c || 0,
    turler,
    not: "Hedef, mufredat tablosundaki alt konu sayisi x 10'dur. 'gercek' = sunulabilir (onayli ya da kalite kontrolu gecmis) icerik_onbellek kayitlari; tekrar/duplicate satirlar dahil olabilir.",
  });
}
