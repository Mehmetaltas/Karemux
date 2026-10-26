// El yazımı soru havuzu: HAVUZ[ders][sinif]["dönem.yazılı"] = [[soru, [seçenekler], doğruİndeks, açıklama], ...]
// Seçenek sırası üretimde deterministik karıştırılır; bu yüzden "hepsi / A ve B" türü seçenek KULLANILMAZ.
import mat from "./mat.js";
import fen from "./fen.js";
import sosyal from "./sosyal.js";
import turkce from "./turkce.js";
import din from "./din.js";
import ing from "./ing.js";
export const HAVUZ = { "Matematik": mat, "Fen Bilimleri": fen, "Sosyal Bilgiler": sosyal, "Turkce": turkce, "Din Kulturu": din, "Ingilizce": ing, "T.C. Inkilap Tarihi": sosyal.inkilap ? { 8: sosyal.inkilap } : {} };
for (const f of [mat, fen, sosyal, turkce, din, ing]) delete f.inkilap;
