// El yazımı soru havuzu: HAVUZ[ders][sinif]["dönem.yazılı"] = [[soru, [seçenekler], doğruİndeks, açıklama], ...]
// Seçenek sırası üretimde deterministik karıştırılır; bu yüzden "hepsi / A ve B" türü seçenek KULLANILMAZ.
// Dosyalar dönem/yazılı bazında bölünür; burada birleştirilir.
import mat1 from "./mat.js"; import fen1 from "./fen.js"; import sosyal1 from "./sosyal.js"; import turkce1 from "./turkce.js"; import din1 from "./din.js"; import ing1 from "./ing.js";
import mat2 from "./mat-y2.js"; import fen2 from "./fen-y2.js"; import sosyal2 from "./sosyal-y2.js"; import turkce2 from "./turkce-y2.js"; import din2 from "./din-y2.js"; import ing2 from "./ing-y2.js";
import mat3 from "./mat-y3.js"; import fen3 from "./fen-y3.js"; import sosyal3 from "./sosyal-y3.js"; import turkce3 from "./turkce-y3.js"; import din3 from "./din-y3.js"; import ing3 from "./ing-y3.js";

function birlestir(...dosyalar) {
  const out = {};
  for (const d of dosyalar) for (const [sinif, yazililar] of Object.entries(d)) { if (sinif === "inkilap") continue; out[sinif] = { ...(out[sinif] || {}), ...yazililar }; }
  return out;
}
const inkilap = { ...(sosyal1.inkilap || {}), ...(sosyal2.inkilap || {}), ...(sosyal3.inkilap || {}) };
export const HAVUZ = {
  "Matematik": birlestir(mat1, mat2, mat3),
  "Fen Bilimleri": birlestir(fen1, fen2, fen3),
  "Sosyal Bilgiler": birlestir(sosyal1, sosyal2, sosyal3),
  "Turkce": birlestir(turkce1, turkce2, turkce3),
  "Din Kulturu": birlestir(din1, din2, din3),
  "Ingilizce": birlestir(ing1, ing2, ing3),
  "T.C. Inkilap Tarihi": { 8: inkilap },
};
