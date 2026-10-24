import { KAZANIMLAR } from "@/lib/kazanimlar.data";

// Konuya ait RESMI MEB kazanimlarini bulur (2026-2027 cerceve plan dosyalarindan, bkz. kazanimlar.data.js).
// Eslestirme sadece KONU/UNITE sozcuklerinin kazanim metniyle ortusmesine bakar; emin degilse bos doner
// (yanlis kazanimi prompta koymaktansa hic koymamak daha guvenli).
const asc = (s) => String(s || "")
  .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").replace(/Ş/g, "s").replace(/ş/g, "s")
  .replace(/Ğ/g, "g").replace(/ğ/g, "g").replace(/Ü/g, "u").replace(/ü/g, "u").replace(/Ö/g, "o").replace(/ö/g, "o")
  .replace(/Ç/g, "c").replace(/ç/g, "c").replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u")
  .toLowerCase().replace(/[^a-z0-9 ]/g, " ");
const ETKISIZ = new Set(["ve", "ile", "icin", "olan", "konu", "unite", "bir", "bu", "de", "da", "gore", "gibi", "uzerine", "uzerinde"]);
const kok = (w) => w.slice(0, 5);
const sozcukler = (s) => asc(s).split(/\s+/).filter((w) => w.length >= 4 && !ETKISIZ.has(w)).map(kok);

export function kazanimlariGetir(ders, sinif, konu, unite = "", enFazla = 5) {
  const anahtar = ders === "T.C. Inkilap Tarihi" ? "Sosyal Bilgiler::8" : `${ders}::${sinif}`;
  const liste = KAZANIMLAR[anahtar];
  // Ingilizce 5-6: kazanim kodu tema numarasini tasir (ENG.5.<tema>.<beceri>) ve tema adi kayitlidir -> yalniz TEMA ADI ESLESIRSE doner.
  if (liste && ders === "Ingilizce" && [5, 6].includes(Number(sinif))) {
    const hedefTema = asc(unite || konu).replace(/^theme \d+\s*/, "").trim();
    if (!hedefTema) return [];
    const eslesen = liste.filter((k) => { const t = asc(k.unite).replace(/^theme \d+\s*/, "").trim(); return t && (t === hedefTema || t.includes(hedefTema) || hedefTema.includes(t)); });
    return eslesen.slice(0, Math.max(enFazla, 6));
  }
  // Turkce: ayni beceri kodlari her temada tekrar eder (T.O.5.1 gibi); konu bazli guvenli eslesme yok -> bos (yanlis kazanim vermemek icin).
  if (!liste || ders === "Ingilizce" || ders === "Turkce") return [];
  const hedef = new Set([...sozcukler(konu), ...sozcukler(unite)]);
  if (hedef.size === 0) return [];
  const kumeler = liste.map((k) => new Set(sozcukler(`${k.metin} ${k.unite} ${k.konu || ""}`)));
  const agirlik = new Map();
  for (const w of hedef) agirlik.set(w, 1 / Math.max(1, kumeler.filter((c) => c.has(w)).length));
  const skorlu = liste.map((k, i) => {
    let skor = 0;
    for (const w of hedef) if (kumeler[i].has(w)) skor += agirlik.get(w);
    return { k, skor };
  }).filter((x) => x.skor > 0);
  if (skorlu.length === 0) return [];
  skorlu.sort((a, b) => b.skor - a.skor);
  const enIyi = skorlu[0].skor;
  return skorlu.filter((x) => x.skor >= enIyi * 0.6).slice(0, enFazla).map((x) => x.k);
}

export function kazanimBlogu(ders, sinif, konu, unite = "") {
  const k = kazanimlariGetir(ders, sinif, konu, unite);
  if (k.length === 0) return "";
  return `RESMI MEB KAZANIMLARI (2026-2027 cerceve plani; bu konuyla ILGILI olanlari esas al, ilgisizleri yok say):\n${k.map((x) => `- ${x.kod}: ${x.metin}`).join("\n")}\n`;
}
