import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";
import { GEMINI_3_6_FLASH_FIYAT, usdTryKuruGetir, geminiMaliyetTlHesapla } from "@/lib/ai-fiyatlandirma";

// Gercek token verileri (app/page.js'teki gercek aiIstek() cagrilarindan
// cikarildi, tahmin degil):
//   Konu Anlatimi (oneriliUniteAnlat, konuAnlat): ort. 3600 cikti token
//   Soru Cozumu (oneriliUniteSoruCoz): 3000 cikti token
//   Tekrar Testi (dersTekrarTestiUret): ort. 3600 cikti token
//   Deneme/Yazili (sinavOlustur, 20 soru): ~8000 cikti token (tavan)
// Fiyat + kur artik lib/ai-fiyatlandirma.js'ten (28 Eylul 2026) - TEK kaynak,
// paket-deneme-otomatik cron'u da AYNI fonksiyonu kullaniyor. Girdi tokenlari
// (baglam+prompt) ortalama ~800 varsayildi - bu bir tahmindir, cikti agirlikli
// maliyet daha guvenilir.
const ORTALAMA_GIRDI_TOKEN = 800;

const OZELLIKLER = {
  konu_anlatimi: { ad: "Konu Anlatimi", ciktiToken: 3600 },
  soru_cozumu: { ad: "Soru Cozumu", ciktiToken: 3000 },
  tekrar_testi: { ad: "Tekrar Testi", ciktiToken: 3600 },
  deneme_yazili: { ad: "Deneme/Yazili (20 soru)", ciktiToken: 8000 },
};

async function maliyetHesapla(ciktiToken) {
  const { maliyetTl } = await geminiMaliyetTlHesapla(ORTALAMA_GIRDI_TOKEN, ciktiToken);
  return maliyetTl;
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

    const birimMaliyetlerListe = await Promise.all(
      Object.entries(OZELLIKLER).map(async ([anahtar, ozellik]) => [
        anahtar,
        { ad: ozellik.ad, ciktiToken: ozellik.ciktiToken, maliyetTl: await maliyetHesapla(ozellik.ciktiToken) },
      ])
    );
    const birimMaliyetler = Object.fromEntries(birimMaliyetlerListe);
    const guncelKur = await usdTryKuruGetir();

    return Response.json({
      birimMaliyetler,
      varsayimlar: { usdTry: guncelKur, girdiFiyatUsdMtok: GEMINI_3_6_FLASH_FIYAT.girdiUsdMtok, ciktiFiyatUsdMtok: GEMINI_3_6_FLASH_FIYAT.ciktiUsdMtok, ortalamaGirdiToken: ORTALAMA_GIRDI_TOKEN, model: "Gemini 3.6 Flash (birincil saglayici)" },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Hesaplanamadi" }, { status: 500 });
  }
}
