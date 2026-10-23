import { uniteleriGetir } from "@/lib/mufredat-veri";
import { dersYillikPlani, dersListesi } from "@/lib/plan-motoru";

// Icerik Cekirdegi (V3 Dalga 6): soru_bankasi, icerik_onbellek (konu_paketi), mufredat ve resmi yillik plan
// ayni "icerik kimligi" ile baglanir: sinif + ders + unite (+ alt_konu). Saf fonksiyonlar; DB'ye dokunmaz.
const HARITA = { "ç": "c", "ğ": "g", "ı": "i", "i̇": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u", "’": "'", "‘": "'" };
export function katla(s) {
  return String(s || "")
    .replace(/İ/g, "i").replace(/I/g, "i")
    .toLowerCase()
    .replace(/i̇|[çğıöşüâîû’‘]/g, (c) => HARITA[c] || c)
    .replace(/\s+/g, " ")
    .trim();
}

// Plan ile kod arasindaki yazim farklarini (parantez numarasi, "Theme 3:", "and"/"&", ek farklari) yok sayan anahtar.
const ESANLAMLI = { "kulturumuzdeki dini motifler": "kulturumuzde dini motifler", "mimarimizdeki dini motifler": "mimarimizde dini motifler", "isigin yansimasi ve renkleri": "isigin yansimasi ve renkler", "hac, umre ve kurban": "hac umre ve kurban", "life in nature": "life in nature ve global problems" };
export function uniteAnahtar(s) {
  let k = katla(s).replace(/^\d+-/, "").replace(/\s*\(\d+\)/g, "").replace(/^theme \d+:\s*/, "").replace(/ and /g, " ve ").replace(/ & /g, " ve ").replace(/\s+/g, " ").trim();
  return ESANLAMLI[k] || k;
}
function uniteEsles(planU, kodU) {
  const a = uniteAnahtar(planU), b = uniteAnahtar(kodU);
  return a === b || (b.length > 8 && (a.includes(b) || b.includes(a)) && Math.min(a.length, b.length) >= 0.6 * Math.max(a.length, b.length));
}

export function icerikKimligi(sinif, ders, unite, altKonu) {
  return [Number(sinif), katla(ders), katla(unite), katla(altKonu || "")].join("|");
}

// Bir resmi uniteyi yillik plandaki haftalara baglar (plandaki unite "A / B" birlesik olabilir).
export function uniteHaftalari(sinif, ders, unite) {
  const plan = dersYillikPlani(sinif, ders);
  if (!plan) return [];
  return plan
    .filter((p) => String(p.unite || "").split(" / ").some((u) => uniteEsles(u, unite)))
    .map((p) => p.hafta);
}

// Ders icin resmi unite listesi + plandaki haftalar + plana karsilik gelmeyen uniteler.
export function dersCekirdegi(sinif, ders) {
  const uniteler = uniteleriGetir(sinif, ders);
  const plan = dersYillikPlani(sinif, ders) || [];
  const kayitli = uniteler.map((u) => ({ unite: u, haftalar: uniteHaftalari(sinif, ders, u) }));
  const planUniteleri = [...new Set(plan.flatMap((p) => String(p.unite || "").split(" / ")).map(uniteAnahtar))]
    .filter((u) => u && !uniteler.some((k) => uniteEsles(u, k)) && !/^(okul temelli planlama|sosyal etkinlik|orientation|revision)$/.test(u));
  return { sinif: Number(sinif), ders, uniteler: kayitli, plandaOlupKoddaOlmayan: planUniteleri };
}

export function tumCekirdek() {
  const cikti = [];
  for (const sinif of [4, 5, 6, 7, 8]) for (const ders of dersListesi(sinif)) cikti.push(dersCekirdegi(sinif, ders));
  return cikti;
}
