// ORTAK SORU HATTI (27 Ekim, madde 18): "ham soru -> format suzgeci -> bagimsiz denetim -> asgari esik" adimi tek yerde.
// Uretim istemleri, cache ve cevap anahtarini ayirma cagiranlarda kalir. AI cagri sayisi degismez (yalniz denetim cagrisi).
// suzgec: (s) => boolean (ornegin soruFormatGecerliMi veya sinavSorusuGecerliMi); azami: gecenlerden en fazla kac soru alinsin.
import { sorulariDenetle } from "@/lib/soruKalite";

export async function hamdanDenetliye(ham, { suzgec, baglam = "", butceMs, asgari = 1, azami, hamHata = "Gecerli soru uretilemedi", denetimHata = "Sorular kalite denetiminden gecemedi" } = {}) {
  let sorular = (Array.isArray(ham) ? ham : []).filter(suzgec || (() => true));
  if (azami) sorular = sorular.slice(0, azami);
  if (sorular.length < asgari) throw new Error(hamHata);
  const denetim = await sorulariDenetle(sorular, baglam, butceMs);
  if (denetim.gecenler.length < asgari) throw new Error(denetimHata);
  return { sorular: denetim.gecenler, elenen: denetim.elenenSayisi, ham: sorular.length };
}
