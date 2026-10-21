// Faz 1 (21 Ekim): /api/claude genel bir yapay zeka vekili ve ucretli ozelliklerin yetkisi yalnizca ISTEMCININ gonderdigi
// "gerekliPaket" alanina baglıydı - alan hic gonderilmezse ucretli ozellik (tatil programi, bursluluk) bedava calisiyordu.
// Burada sunucu, prompt'un KENDI sablonundan ucretli ozelligi taniyip gereken paketi kendisi belirler; istemci beyani
// sadece ek bir ipucudur, sunucunun bulgusu onceliklidir.
// SINIR: prompt yeniden yazilirsa kural eslesmez (kalan risk). Kalici cozum Faz 2: ucretli akislari sunucuda prompt kuran
// ozel route'lara tasimak (istemci prompt gondermez).
export const UCRETLI_PROMPT_KURALLARI = [
  {
    ad: "tatil_programi",
    esles: (p) => p.startsWith("Sen bir LGS calisma kocususun. ") && p.includes("donemine giriyor"),
    paket: (p) => (p.slice(0, 600).includes("Yaz Tatili") ? "yaz_tatili" : "ara_tatil"),
  },
  {
    ad: "bursluluk",
    esles: (p) => p.startsWith("Sen bursluluk sinavi (IOKBS) hazirlik uzmanisin"),
    paket: () => "bursluluk",
  },
];

// Prompt ucretli bir ozellige aitse gereken paket anahtarini, degilse null dondurur.
export function sunucuGerekliPaket(prompt) {
  if (typeof prompt !== "string") return null;
  const kural = UCRETLI_PROMPT_KURALLARI.find((k) => k.esles(prompt));
  return kural ? kural.paket(prompt) : null;
}
