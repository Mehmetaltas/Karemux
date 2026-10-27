// Görselli soru üretim yardımcıları: tüm sayılar kodla hesaplanır; seçeneklerin ilki doğrudur (üretimde karıştırılır).
import * as S from "../sekil2.js";
export { S };
export const svg = (s, genislik = "62%") => ({ tip: "svg", svg: s, genislik });
export const tablo = (kolonlar, satirlar, baslik, genislik) => ({ tip: "tablo", kolonlar, satirlar, baslik, genislik });
export const fmt = (n) => String(n).replace(".", ",");
// Q: doğru seçenek + yanlışlar (benzersiz olmalı); aciklama; görsel
export function Q(soru, dogru, yanlislar, aciklama, gorsel, etiket) {
  const opts = [dogru, ...yanlislar].map(String);
  if (new Set(opts).size !== opts.length) throw new Error("tekrar eden seçenek: " + soru + " :: " + opts.join(" | "));
  return etiket ? [soru, opts, 0, aciklama, gorsel, etiket] : [soru, opts, 0, aciklama, gorsel];
}
// Sayısal yanlışlar: doğru değerin çevresinde benzersiz, pozitif, mantıklı şıklar (adım farkları)
export function sayiSik(d, adimlar = [1, -1, 2, -2, 5, 10], { min = 0, birim = "" } = {}) {
  const out = []; for (const a of adimlar) { const v = +(d + a).toFixed(4); if (v !== d && v >= min && !out.includes(v)) out.push(v); if (out.length === 3) break; }
  return out.map((v) => fmt(v) + birim);
}
