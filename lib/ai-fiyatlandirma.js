// Paylasilan AI fiyatlandirma/kur kaynagi (28 Eylul 2026).
// Once app/api/admin/simulasyon/route.js VE app/api/cron/paket-deneme-otomatik/route.js'de
// AYNI 4 sabit (USD_TRY, GIRDI/CIKTI_FIYAT_USD_MTOK) kopya duruyordu, biri
// guncellenip digeri unutulabilirdi (USD_TRY orada 47.93 sabit kalmisti - 19
// Agustos'tan beri kur degismedi). Artik TEK kaynak, ikisi de bunu kullanir.

// Google'in resmi fiyat sayfasindan (ai.google.dev/gemini-api/docs/pricing,
// 28 Eylul 2026'da dogrulandi): Gemini 3.6 Flash SU AN tanitim fiyatinda -
// eskiden kullanilan 1.50/7.50 aslinda 1 Ocak 2027'den GECERLI OLACAK standart
// fiyatti, simdiki gercek maliyeti ~2x fazla gosteriyordu.
export const GEMINI_3_6_FLASH_FIYAT = {
  girdiUsdMtok: 0.75,
  ciktiUsdMtok: 3.75,
  standartGirdiUsdMtok: 1.50, // 1 Ocak 2027'den itibaren gecerli
  standartCiktiUsdMtok: 7.50,
  standartBaslangic: "2027-01-01",
  kaynak: "https://ai.google.dev/gemini-api/docs/pricing",
  dogrulamaTarihi: "2026-09-28",
};

// Kuru Frankfurter'dan (Avrupa Merkez Bankasi verisi, anahtarsiz, ucretsiz)
// canli cekiyor - eskiden USD_TRY = 47.93 sabit yaziliydi, hic guncellenmiyordu.
// Bellek-ici onbellek: ayni fonksiyon cagrisinda (lambda omru boyunca) tekrar
// aglamaz. Basarisiz olursa SON BILINEN kura (ya da bu sabit yedege) duser,
// hicbir zaman patlamaz.
const YEDEK_USD_TRY = 48.52; // Frankfurter, 28 Eylul 2026'da dogrulandi
let sonBilinenKur = null;
let sonCekmeZamani = 0;
const ONBELLEK_MS = 6 * 60 * 60 * 1000; // 6 saat

export async function usdTryKuruGetir() {
  const simdi = Date.now();
  if (sonBilinenKur && simdi - sonCekmeZamani < ONBELLEK_MS) return sonBilinenKur;
  try {
    const controller = new AbortController();
    const zamanlayici = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://api.frankfurter.dev/v2/rate/USD/TRY", { signal: controller.signal });
    clearTimeout(zamanlayici);
    if (!res.ok) throw new Error(`Frankfurter API hatasi: ${res.status}`);
    const veri = await res.json();
    const kur = veri.rate;
    if (!kur || typeof kur !== "number") throw new Error("Gecersiz kur yaniti");
    sonBilinenKur = kur;
    sonCekmeZamani = simdi;
    return kur;
  } catch (e) {
    console.error("usdTryKuruGetir basarisiz, yedek kur kullaniliyor:", e.message);
    return sonBilinenKur || YEDEK_USD_TRY;
  }
}

// Gemini 3.6 Flash icin TL maliyeti hesaplar. `standartFiyat` true verilirse
// 1 Ocak 2027'den sonraki fiyatla hesaplar (ileriye donuk simulasyon icin).
export async function geminiMaliyetTlHesapla(girdiToken, ciktiToken, standartFiyat = false) {
  const kur = await usdTryKuruGetir();
  const girdiFiyat = standartFiyat ? GEMINI_3_6_FLASH_FIYAT.standartGirdiUsdMtok : GEMINI_3_6_FLASH_FIYAT.girdiUsdMtok;
  const ciktiFiyat = standartFiyat ? GEMINI_3_6_FLASH_FIYAT.standartCiktiUsdMtok : GEMINI_3_6_FLASH_FIYAT.ciktiUsdMtok;
  const girdiUsd = (girdiToken / 1_000_000) * girdiFiyat;
  const ciktiUsd = (ciktiToken / 1_000_000) * ciktiFiyat;
  return { maliyetTl: Math.round((girdiUsd + ciktiUsd) * kur * 10000) / 10000, usdTry: kur };
}
