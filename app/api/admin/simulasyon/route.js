import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

// Gercek token verileri (app/page.js'teki gercek aiIstek() cagrilarindan
// cikarildi, tahmin degil):
//   Konu Anlatimi (oneriliUniteAnlat, konuAnlat): ort. 3600 cikti token
//   Soru Cozumu (oneriliUniteSoruCoz): 3000 cikti token
//   Tekrar Testi (dersTekrarTestiUret): ort. 3600 cikti token
//   Deneme/Yazili (sinavOlustur, 20 soru): ~8000 cikti token (tavan)
// Fiyat: Gemini 3.6 Flash resmi listesi - $1.50/MTok girdi, $7.50/MTok cikti
// (19 Agustos 2026 arastirmasi). Girdi tokenlari (baglam+prompt) ortalama
// ~800 varsayildi - bu bir tahmindir, cikti agirlikli maliyet daha guvenilir.
// Kur: 1 USD = 47.93 TL (19 Agustos 2026, canli arastirildi).
const USD_TRY = 47.93;
const GIRDI_FIYAT_USD_MTOK = 1.50;
const CIKTI_FIYAT_USD_MTOK = 7.50;
const ORTALAMA_GIRDI_TOKEN = 800;

const OZELLIKLER = {
  konu_anlatimi: { ad: "Konu Anlatimi", ciktiToken: 3600 },
  soru_cozumu: { ad: "Soru Cozumu", ciktiToken: 3000 },
  tekrar_testi: { ad: "Tekrar Testi", ciktiToken: 3600 },
  deneme_yazili: { ad: "Deneme/Yazili (20 soru)", ciktiToken: 8000 },
};

function maliyetHesapla(ciktiToken) {
  const girdiMaliyetUsd = (ORTALAMA_GIRDI_TOKEN / 1_000_000) * GIRDI_FIYAT_USD_MTOK;
  const ciktiMaliyetUsd = (ciktiToken / 1_000_000) * CIKTI_FIYAT_USD_MTOK;
  const toplamUsd = girdiMaliyetUsd + ciktiMaliyetUsd;
  return Math.round(toplamUsd * USD_TRY * 10000) / 10000; // TL, 4 ondalik (kucuk sayilar icin)
}

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "simulasyon_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "simulasyon_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "simulasyon_paneli", true);
  return { izinVar: true };
}

// GET: sabit birim maliyetleri dondurur (arayuz bunlari gosterip, kullanicinin
// girdigi sayilarla CLIENT tarafinda carpar - ekstra istek gerekmez).
export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const birimMaliyetler = Object.fromEntries(
      Object.entries(OZELLIKLER).map(([anahtar, ozellik]) => [
        anahtar,
        { ad: ozellik.ad, ciktiToken: ozellik.ciktiToken, maliyetTl: maliyetHesapla(ozellik.ciktiToken) },
      ])
    );

    return Response.json({
      birimMaliyetler,
      varsayimlar: { usdTry: USD_TRY, girdiFiyatUsdMtok: GIRDI_FIYAT_USD_MTOK, ciktiFiyatUsdMtok: CIKTI_FIYAT_USD_MTOK, ortalamaGirdiToken: ORTALAMA_GIRDI_TOKEN, model: "Gemini 3.6 Flash (birincil saglayici)" },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Hesaplanamadi" }, { status: 500 });
  }
}
