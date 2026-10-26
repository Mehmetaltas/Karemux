// 1. dönem 1. yazılı kapsamı: yıllık plandan, ara tatilden (16 Kasım) önce biten üniteler.
// Kural: plan haftası <= SON_HAFTA'da biten üniteler; hiç yoksa ilk ünite. İSTİSNA tablosu, MEB'in yayımladığı 7. sınıf
// "Yazılıya Hazırlanıyorum" örneklerinde gözlenen farklı kapsamlar içindir (Sosyal Bilgiler ve Türkçe 7 ikinci üniteden de soru içeriyor).
import { YILLIK_PLAN } from "../yillik-plan.data.js";
import { KAZANIMLAR } from "../kazanimlar.data.js";

export const SON_HAFTA = 8;
const ISTISNA = {
  "Sosyal Bilgiler::7": { ekUniteler: ["Evimiz Dünya"] },
  "Turkce::7": { ekUniteler: ["Bir Hilal Uğruna"] },
};
const nrm = (s) => String(s || "").toLocaleLowerCase("tr-TR").replace(/\s*\(\d+\)\s*/g, " ").replace(/\s+/g, " ").trim();

export function kapsamBul(ders, sinif) {
  const anahtar = `${ders}::${sinif}`;
  const satirlar = YILLIK_PLAN[anahtar];
  if (!satirlar) return null;
  const uniteler = {};
  for (const [h, un] of satirlar) { for (const parca of String(un).split(" / ")) { const u = (uniteler[parca] = uniteler[parca] || [h, h]); u[0] = Math.min(u[0], h); u[1] = Math.max(u[1], h); } }
  let secili = Object.entries(uniteler).filter(([, v]) => v[1] <= SON_HAFTA).map(([n]) => n);
  if (!secili.length) secili = [Object.entries(uniteler).sort((a, b) => a[1][0] - b[1][0])[0][0]];
  const ist = ISTISNA[anahtar]; if (ist) for (const u of ist.ekUniteler) if (!secili.includes(u)) secili.push(u);
  const kzKey = ders === "T.C. Inkilap Tarihi" ? "Sosyal Bilgiler::8" : anahtar;
  const kz = (KAZANIMLAR[kzKey] || []).filter((k) => secili.some((u) => nrm(k.unite).includes(nrm(u)) || nrm(u).includes(nrm(k.unite))));
  const konular = [...new Set(satirlar.filter(([, un]) => secili.some((u) => String(un).split(" / ").includes(u))).map(([, , ko]) => ko))];
  return { ders, sinif: Number(sinif), uniteler: secili, konular, kazanimlar: kz };
}
