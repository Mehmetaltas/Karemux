// "Yazılıya Hazırlanıyorum" kâğıt oluşturucu: saf fonksiyonlar (sunucu, tarayıcı ve PDF betiği aynı HTML'i kullanır).
// Tasarım: ders renkli başlık sekmesi, bant, not kutusu, açık uçlu sorular + cevap alanı, tablo/grafik/şekil, kazanım tablosu, ÇÖZÜMLER.
// MARKA: MEB logosu / T.C. arması KULLANILMAZ; Karemux logosu kullanılır. Bu kâğıtlar resmî sınav değildir.

export const DERS_TEMALARI = {
  "Matematik": { ad: "MATEMATİK", ana: "#6C9BD1", acik: "#B7D4EE", koyu: "#4A78AD", soluk: "#E4EFF9" },
  "Fen Bilimleri": { ad: "FEN BİLİMLERİ", ana: "#9B6BB0", acik: "#D4B8DD", koyu: "#7A4E8F", soluk: "#F0E6F4" },
  "Din Kulturu": { ad: "DİN KÜLTÜRÜ VE AHLAK BİLGİSİ", ana: "#2E8B63", acik: "#86CDAA", koyu: "#1F6B4A", soluk: "#E2F3EA" },
  "Ingilizce": { ad: "İNGİLİZCE", ana: "#D470A9", acik: "#EDA9CB", koyu: "#B04F88", soluk: "#F9E3EF" },
  "Sosyal Bilgiler": { ad: "SOSYAL BİLGİLER", ana: "#F0A35A", acik: "#FFD9AE", koyu: "#C9792F", soluk: "#FFF1E0" },
  "Turkce": { ad: "TÜRKÇE", ana: "#EE7A72", acik: "#F8B8B3", koyu: "#C85750", soluk: "#FCE6E4" },
  "T.C. Inkilap Tarihi": { ad: "T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK", ana: "#3FA7A0", acik: "#A8DCD8", koyu: "#2B7F79", soluk: "#E0F3F1" },
};
const DERS_KISA = { "Matematik": "Matematik", "Fen Bilimleri": "Fen Bilimleri", "Din Kulturu": "Din Kültürü ve Ahlak Bilgisi", "Ingilizce": "İngilizce", "Sosyal Bilgiler": "Sosyal Bilgiler", "Turkce": "Türkçe", "T.C. Inkilap Tarihi": "T.C. İnkılap Tarihi" };

export const kacis = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Satır içi biçim: **kalın**, __altı çizili__, [[a|b]] kesir (a negatif olabilir), {{3}} devir çizgisi, ^{2} üs, _{2} alt indis, \n → <br>
export function t(s) {
  let x = kacis(s);
  x = x.replace(/_{3,}/g, "\uE000").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/__(.+?)__/g, "<u>$1</u>");
  x = x.replace(/\[\[(-?)([^|\]]+)\|([^\]]+)\]\]([^\s<]{0,10})/g, (_, neg, a, b, ek) => `<span class="nb">${neg ? "<span class=\"neg\">−</span>" : ""}<span class="kesir"><span>${a}</span><span>${b}</span></span>${ek}</span>`);
  x = x.replace(/\{\{([^}]+)\}\}/g, '<span class="devir">$1</span>');
  x = x.replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>").replace(/_\{([^}]+)\}/g, "<sub>$1</sub>");
  return x.replace(/\uE000/g, "<span style=\"display:inline-block;min-width:3.2em;border-bottom:1px solid #222\">&nbsp;</span>").replace(/\n/g, "<br>");
}

// ---- Görsel blokları ----
function tabloHtml(g) {
  const bas = (g.kolonlar || []).map((k) => `<th>${t(k)}</th>`).join("");
  const govde = (g.satirlar || []).map((r) => `<tr>${r.map((h, i) => (i === 0 && g.ilkKolonBaslik !== false ? `<th class="satirbas">${t(h)}</th>` : `<td>${h === "" || h == null ? "&nbsp;" : t(h)}</td>`)).join("")}</tr>`).join("");
  return `<figure class="tablo ${g.sinif || ""}">${g.baslik ? `<figcaption><b>${t(g.baslikEtiket || "Tablo")}:</b> ${t(g.baslik)}</figcaption>` : ""}<table style="${g.genislik ? `width:${g.genislik}` : ""}">${bas ? `<thead><tr>${bas}</tr></thead>` : ""}<tbody>${govde}</tbody></table></figure>`;
}
const svgBlok = (svg, genislik) => `<figure class="svg" style="${genislik ? `width:${genislik}` : ""}">${svg}</figure>`;

export function gorselHtml(g, gorselUret) {
  if (!g) return "";
  if (g.tip === "tablo") return tabloHtml(g);
  if (g.tip === "svg") return svgBlok(g.svg, g.genislik);
  if (g.tip === "motor" && gorselUret) { const s = gorselUret(g.gorselTipi, g.parametreler || {}); return s ? svgBlok(s, g.genislik) : ""; }
  if (g.tip === "grup") return `<div class="grup">${(g.ogeler || []).map((o) => gorselHtml(o, gorselUret)).join("")}</div>`;
  return "";
}

// ---- Sayfa iskeleti ----
const bant = (tm, logo, buyuk, etiket = "1. DÖNEM - 1. YAZILI") => buyuk
  ? `<div class="bant buyuk" style="--ana:${tm.ana}"><span class="b-sol">YAZILIYA HAZIRLANIYORUM</span><span class="b-logo"><img src="${logo}" alt=""></span><span class="b-sag">${etiket}</span></div>`
  : `<div class="bant kucuk" style="--ana:${tm.ana}"><span class="k-sol" style="background:${tm.ana}">YAZILIYA HAZIRLANIYORUM</span><span class="k-orta">KAREMUX · ÖĞRENME ÇIKTILARI</span><span class="k-sag" style="background:${tm.acik}">${etiket}</span></div>`;

const ustBaslik = (k, tm) => `<div class="ust"><div class="sinifrozet">${k.sinif}. SINIF</div><div class="dersrozet" style="background:${tm.acik}"><span>${tm.ad}</span></div></div>`;
const altBilgi = (k, tm, no, logo, dersAd) => `<div class="alt" style="--ana:${tm.ana}"><img class="alt-logo" src="${logo}" alt=""><span class="alt-cizgi"></span><span class="alt-no">${no}</span><span class="alt-cizgi"></span><span class="alt-ders">${t(dersAd)}</span></div>`;

function soruHtml(s, gorselUret) {
  const par = (s.paragraflar || []).map((p) => `<p class="par">${t(p)}</p>`).join("");
  const liste = s.liste ? `<ol class="liste">${s.liste.map((l) => `<li>${t(l)}</li>`).join("")}</ol>` : "";
  const yon = s.yonerge ? `<p class="yonerge">${t(s.yonerge)}</p>` : "";
  const g = gorselHtml(s.gorsel, gorselUret);
  const alan = (mm) => (mm ? `<div class="alan" style="height:${mm}mm"></div>` : "");
  const altlar = (s.altlar || []).map((a) => `<div class="alt-soru"><p class="yonerge"><b>${a.harf})</b> ${t(a.yonerge)}</p>${a.gorsel ? gorselHtml(a.gorsel, gorselUret) : ""}${alan(a.alan)}</div>`).join("");
  const son = (s.sonGorsel ? gorselHtml(s.sonGorsel, gorselUret) : "") + (s.sonMetin ? `<p class="par">${t(s.sonMetin)}</p>` : "");
  const sec = (s.secPar || []).map((p) => `<p class="par">${t(p)}</p>`).join("");
  const sira = s.yonergeOnce ? `${par}${yon}${g}${liste}${sec}` : `${par}${g}${liste}${yon}${sec}`;
  return `<section class="soru"><div class="no">${s.no}.</div><div class="icerik">${sira}${son}${alan(s.alan)}${altlar}</div></section>`;
}

const CSS = (tm) => `
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;background:#e9e6df;font-family:"Helvetica Neue",Arial,"Liberation Sans",sans-serif;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sayfa{width:210mm;height:297mm;position:relative;overflow:hidden;background:#fff;margin:0 auto 6mm;page-break-after:always;break-after:page}
@media print{body{background:#fff}.sayfa{margin:0}}
.ust{position:absolute;left:0;right:0;top:0;height:30mm}
.sinifrozet{position:absolute;left:8mm;top:0;width:34mm;height:13mm;border:1.4px dashed ${tm.ana};border-top:none;border-radius:0 0 4mm 4mm;background:#fff;text-align:center;font-weight:700;font-size:12pt;line-height:13mm}
.dersrozet{position:absolute;left:60mm;right:34mm;top:0;height:25mm;border-radius:0 0 22mm 22mm;text-align:center}
.dersrozet span{display:block;font-weight:800;font-size:19pt;line-height:1.1;color:#111;margin-top:11mm;padding:0 6mm}
.bant.buyuk{position:absolute;left:0;right:0;top:34mm;height:11mm;background:var(--ana);border-radius:6mm;border:1.4px dashed rgba(255,255,255,.8);color:#fff;font-weight:800;font-size:10.5pt;display:flex;align-items:center;justify-content:space-between;padding:0 14mm}
.bant.buyuk .b-logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:17mm;height:17mm;border-radius:50%;background:#fff;border:1.6px solid ${tm.koyu};display:flex;align-items:center;justify-content:center;overflow:hidden}
.bant.buyuk .b-logo img{width:13mm;height:13mm;object-fit:contain}
.bant.kucuk{position:absolute;left:0;right:0;top:8mm;height:8mm;border-bottom:1.2px dashed ${tm.ana};display:flex;align-items:flex-end;font-size:8pt;color:#111}
.bant.kucuk .k-sol{position:absolute;left:0;top:0;height:7mm;width:68mm;border-radius:0 4mm 4mm 0;color:#fff;line-height:7mm;padding-left:9mm}
.bant.kucuk .k-orta{position:absolute;left:0;right:0;text-align:center;bottom:.6mm;letter-spacing:.2px}
.bant.kucuk .k-sag{position:absolute;right:0;top:0;height:7mm;width:60mm;border-radius:4mm 0 0 4mm;color:#111;line-height:7mm;text-align:center}
.alt{position:absolute;left:8mm;right:8mm;bottom:7mm;height:9mm;display:flex;align-items:center;gap:3mm;font-size:8.5pt}
.alt-logo{height:8mm;width:8mm;object-fit:contain}
.alt-cizgi{flex:1;border-top:1.2px solid ${tm.ana}}
.alt-no{width:11mm;height:6.4mm;border:1.2px dashed ${tm.ana};border-radius:3mm;text-align:center;line-height:5.4mm;font-size:9pt}
.alt-ders{border:1.2px dashed ${tm.ana};border-radius:3mm;padding:0 4mm;height:6.4mm;line-height:5.4mm;min-width:34mm;text-align:center}
.icerik-alani{position:absolute;left:17mm;right:17mm;top:50mm;bottom:20mm;font-size:10.4pt;line-height:1.38}
.sayfa.ilk .icerik-alani{top:50mm}.sayfa.devam .icerik-alani{top:24mm}
.not{border:1.4px solid #111;border-radius:5mm;padding:3.2mm 6mm;font-style:italic;font-size:8.4pt;line-height:1.35;text-align:center;margin:0 0 5mm}
.soru{display:flex;gap:3mm;margin:0 0 5mm}
.soru .no{font-weight:800;min-width:8mm}
.soru .icerik{flex:1;min-width:0}
.par{margin:0 0 2.6mm;text-align:left}
.yonerge{margin:0 0 2.4mm;font-weight:700}
.alt-soru{margin-top:3mm}
.alan{border-bottom:0;margin:1mm 0 0}
.liste{margin:1.5mm 0 3mm;padding-left:6mm}.liste li{margin-bottom:1.2mm}
figure{margin:2.4mm auto 3.4mm}
figure.svg{display:block;max-width:100%;text-align:center}
figure.svg svg{max-width:100%;height:auto}
.grup{display:flex;gap:4mm;align-items:flex-start;justify-content:center;flex-wrap:wrap}
.tablo figcaption{font-size:8.4pt;margin-bottom:1mm}
.tablo table{border-collapse:collapse;margin:0 auto;font-size:9.6pt;min-width:60%}
.tablo th,.tablo td{border:1.2px solid #1b1b1b;padding:1.6mm 3mm;text-align:center;vertical-align:middle}
.tablo thead th{background:${tm.ana};color:#fff;font-weight:600}
.tablo th.satirbas{background:${tm.acik};font-weight:600;color:#111}
.tablo td{background:${tm.soluk}}
.tablo.yaz td{background:#fff}
.kesir{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;margin:0 .6mm;line-height:1.05;font-size:.92em}
.kesir span:first-child{border-bottom:1px solid currentColor;padding:0 .8mm .3mm}
.kesir span:last-child{padding:.3mm .8mm 0}
.neg{margin-right:.5mm}.nb{white-space:nowrap}
.devir{text-decoration:overline;text-decoration-thickness:1.2px}
.kaz{border-collapse:collapse;width:100%;font-size:9.6pt;margin:0 0 6mm}
.kaz th{background:${tm.ana};color:#fff;padding:2mm 3mm;border:1.2px solid #1b1b1b;font-weight:700}
.kaz td{border:1.2px solid #1b1b1b;padding:1.6mm 3mm;background:${tm.soluk}}
.kaz td.sn{text-align:center;width:26mm}
.cozum-baslik{text-align:center;font-weight:800;font-size:12pt;margin:2mm 0 5mm}
.cozum{margin:0 0 4.4mm;display:flex;gap:3mm}
.cozum .no{font-weight:800;min-width:8mm}
.cozum .g{flex:1;min-width:0}
.cozum p{margin:0 0 1.6mm}
.cozum .kabul{font-weight:700}
.cozum .ornek{color:#111}
`;

function sayfaKabuk(k, tm, logo, dersAd, no, tur, ic) {
  const ilk = tur === "ilk";
  return `<div class="sayfa ${ilk ? "ilk" : "devam"}">${ilk ? ustBaslik(k, tm) + bant(tm, logo, true, `${k.donem || 1}. DÖNEM - ${k.yazili || 1}. YAZILI`) : bant(tm, logo, false, `${k.donem || 1}. DÖNEM - ${k.yazili || 1}. YAZILI`)}<div class="icerik-alani">${ic}</div>${altBilgi(k, tm, no, logo, dersAd)}</div>`;
}

// kagit: { sinif, ders, notMetni?, sayfalar:[{sorular:[...]}], kazanimTablosu:[{kod,metin,sorular:"1-2"}], cozumSayfalari:[{cozumler:[{no, html|paragraflar, kabul, ornek}]}] }
export function kagitHtml(k, { logoUri = "", gorselUret = null } = {}) {
  const tm = DERS_TEMALARI[k.ders] || DERS_TEMALARI["Matematik"];
  const dersAd = DERS_KISA[k.ders] || k.ders;
  let no = 0; const sayfalar = [];
  const not = `<div class="not">${t(k.notMetni || "Bu içerik, öğrencilerin yazılı öncesi çalışmaları amacıyla Karemux tarafından hazırlanmıştır. Resmî sınav sorusu değildir; öğrenme çıktılarını kapsayan çalışma sorularıdır. Hazırlanan sorular, belirtilen ünitelerin öğrenme çıktılarını kapsamaktadır.")}</div>`;
  (k.sayfalar || []).forEach((sf, i) => {
    no++;
    sayfalar.push(sayfaKabuk(k, tm, logoUri, dersAd, no, i === 0 ? "ilk" : "devam", (i === 0 ? not : "") + (sf.sorular || []).map((s) => soruHtml(s, gorselUret)).join("")));
  });
  no++;
  const kaz = !(k.kazanimTablosu || []).length ? "" : `<table class="kaz"><thead><tr><th>ÖĞRENME ÇIKTISI</th><th>SORU NO</th></tr></thead><tbody>${(k.kazanimTablosu || []).map((r) => `<tr><td>${t(r.kod)}. ${t(r.metin)}</td><td class="sn">${t(r.sorular)}</td></tr>`).join("")}</tbody></table>`;
  const cozumBlok = (c) => `<div class="cozum"><div class="no">${c.no}.</div><div class="g">${(c.paragraflar || []).map((p) => `<p>${t(p)}</p>`).join("")}${c.gorsel ? gorselHtml(c.gorsel, gorselUret) : ""}${c.kabul ? `<p class="kabul">${t(c.kabul)}</p>` : ""}${c.ornek ? `<p class="ornek">Örnek yanıt: ${t(c.ornek)}</p>` : ""}</div></div>`;
  (k.cozumSayfalari || []).forEach((cs, i) => {
    sayfalar.push(sayfaKabuk(k, tm, logoUri, dersAd, no++, "devam", (i === 0 ? kaz + `<div class="cozum-baslik">ÇÖZÜMLER</div>` : "") + (cs.cozumler || []).map(cozumBlok).join("")));
  });
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t(dersAd)} ${k.sinif}. Sınıf — 1. Dönem 1. Yazılı Çalışması</title><style>${CSS(tm)}</style></head><body>${sayfalar.join("")}</body></html>`;
}
