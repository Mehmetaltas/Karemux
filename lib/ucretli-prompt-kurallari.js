// Faz 2 (21 Ekim): bu ozellikler artik /api/ucretli-uret ucundan (prompt SUNUCUDA kurulur). /api/claude bu desenleri
// iceren prompt'u PAKET OLSA DA reddeder; esleme artik yalnizca baslangica degil metnin her yerine bakar.
// Faz 1 (21 Ekim): /api/claude genel bir yapay zeka vekili ve ucretli ozelliklerin yetkisi yalnizca ISTEMCININ gonderdigi
// "gerekliPaket" alanina baglıydı - alan hic gonderilmezse ucretli ozellik (tatil programi, bursluluk) bedava calisiyordu.
// Burada sunucu, prompt'un KENDI sablonundan ucretli ozelligi taniyip gereken paketi kendisi belirler; istemci beyani
// sadece ek bir ipucudur, sunucunun bulgusu onceliklidir.
// SINIR: prompt yeniden yazilirsa kural eslesmez (kalan risk). Kalici cozum Faz 2: ucretli akislari sunucuda prompt kuran
// ozel route'lara tasimak (istemci prompt gondermez).
export const UCRETLI_PROMPT_KURALLARI = [
  {
    ad: "tatil_programi",
    esles: (p) => p.includes("donemine giriyor") || /(ara|yar[ıi]y[ıi]l|yaz) tatil/i.test(p) && /calisma (program|plan)|gunluk gorev|gunluk program/i.test(p),
    paket: (p) => (p.slice(0, 600).includes("Yaz Tatili") ? "yaz_tatili" : "ara_tatil"),
  },
  {
    ad: "bursluluk",
    esles: (p) => /IOKBS|bursluluk sinav/i.test(p),
    paket: () => "bursluluk",
  },
];

// Prompt ucretli bir ozellige aitse gereken paket anahtarini, degilse null dondurur.
export function sunucuGerekliPaket(prompt) {
  if (typeof prompt !== "string") return null;
  const kural = UCRETLI_PROMPT_KURALLARI.find((k) => k.esles(prompt));
  return kural ? kural.paket(prompt) : null;
}
