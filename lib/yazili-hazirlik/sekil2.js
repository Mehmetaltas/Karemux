// Yazılı kâğıtları için ek saf SVG şekilleri. Tüm sayılar çağıran tarafından verilir; burada veri uydurulmaz.
import { kacis } from "./render.js";
export { cizgiGrafik, sutunGrafik } from "./sekiller.js";

const F = 'font-family="Helvetica, Arial, sans-serif"';
const K = "#1b1b1b", V = "#c0392b", M = "#2c6fbb", Y = "#2e8b57", S = "#e8b339", G = "#8a8a8a";
const sv = (w, h, ic) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${F}>${ic}</svg>`;
const tx = (x, y, s, o = "") => `<text x="${x}" y="${y}"${/font-size=/.test(o) ? "" : ' font-size="13"'}${/text-anchor=/.test(o) ? "" : ' text-anchor="middle"'} ${o}>${kacis(s)}</text>`;
const ln = (x1, y1, x2, y2, c = K, w = 2, ex = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${ex}/>`;
const nk = (x, y, r = 3, c = K) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const dikAci = (x, y, dx, dy, s = 9) => `<path d="M${x + dx * s},${y} L${x + dx * s},${y + dy * s} L${x},${y + dy * s}" fill="none" stroke="${K}" stroke-width="1.3"/>`;
const KOSE = (pts, adlar) => pts.map((p, i) => tx(p[0] + (p[0] < 160 ? -12 : 12), p[1] + (p[1] < 100 ? -6 : 16), adlar[i], 'font-weight="700"')).join("");

export function dikdortgen({ w, h, wEt, hEt, kare = false }) {
  const W = 220, H = kare ? 220 : Math.max(70, Math.min(150, Math.round(220 * h / w))), x = 70, y = 30;
  const wd = kare ? 150 : W, hd = kare ? 150 : H;
  return sv(340, hd + 60, `<rect x="${x}" y="${y}" width="${wd}" height="${hd}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>` + tx(x + wd / 2, y - 8, wEt, `fill="${V}" font-weight="700"`) + tx(x - 10, y + hd / 2 + 4, hEt, `fill="${V}" font-weight="700" text-anchor="end"`));
}
export function izgara({ cols, rows, dolu, hucre = 26, ad = "" }) {
  const set = new Set(dolu.map((d) => d.join(",")));
  let s = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<rect x="${20 + c * hucre}" y="${14 + r * hucre}" width="${hucre}" height="${hucre}" fill="${set.has(r + "," + c) ? "#9cc4ee" : "#fff"}" stroke="#7a7a7a" stroke-width="1"/>`;
  return sv(40 + cols * hucre, 30 + rows * hucre + (ad ? 20 : 0), s + (ad ? tx(20 + cols * hucre / 2, 30 + rows * hucre + 8, ad, 'font-size="12" fill="#444"') : ""));
}
export function ucgen({ taban, yuk, tEt, yEt, dik = false }) {
  const bx = 70, by = 190, bw = 240, tx2 = dik ? 70 : 180, ty = 40;
  const pts = `${bx},${by} ${bx + bw},${by} ${tx2},${ty}`;
  let s = `<polygon points="${pts}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>`;
  s += ln(tx2, ty, tx2, by, V, 1.6, 'stroke-dasharray="5,4"') + dikAci(tx2, by, tx2 > bx ? 1 : 1, -1, 10);
  s += tx(bx + bw / 2 + (dik ? 0 : 0), by + 22, tEt, `fill="${V}" font-weight="700"`) + tx(tx2 + (dik ? -10 : 8), (ty + by) / 2 + 4, yEt, `fill="${V}" font-weight="700" text-anchor="${dik ? "end" : "start"}"`);
  return sv(350, 230, s);
}
export function paralelkenar({ taban, yuk, tEt, yEt, yanEt }) {
  const s = `<polygon points="70,190 270,190 320,60 120,60" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>` + ln(120, 60, 120, 190, V, 1.6, 'stroke-dasharray="5,4"') + dikAci(120, 190, 1, -1, 10) + tx(170, 210, tEt, `fill="${V}" font-weight="700"`) + tx(128, 130, yEt, `fill="${V}" font-weight="700" text-anchor="start"`) + (yanEt ? tx(312, 130, yanEt, `font-weight="700" text-anchor="start"`) : "");
  return sv(380, 225, s);
}
export function yamuk({ aEt, cEt, yEt }) {
  const s = `<polygon points="50,190 290,190 230,60 110,60" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>` + ln(110, 60, 110, 190, V, 1.6, 'stroke-dasharray="5,4"') + dikAci(110, 190, 1, -1, 10) + tx(170, 50, aEt, `fill="${V}" font-weight="700"`) + tx(170, 212, cEt, `fill="${V}" font-weight="700"`) + tx(118, 130, yEt, `fill="${V}" font-weight="700" text-anchor="start"`);
  return sv(340, 225, s);
}
export function eskenarDortgen({ d1Et, d2Et }) {
  const s = `<polygon points="160,20 270,100 160,180 50,100" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>` + ln(160, 20, 160, 180, V, 1.8, 'stroke-dasharray="5,4"') + ln(50, 100, 270, 100, M, 1.8, 'stroke-dasharray="5,4"') + tx(168, 62, d1Et, `fill="${V}" font-weight="700" text-anchor="start"`) + tx(100, 90, d2Et, `fill="${M}" font-weight="700"`);
  return sv(320, 200, s);
}
export function daire({ et, cap = false, kesen = false }) {
  const cx = 160, cy = 100, r = 80;
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>${nk(cx, cy, 3)}`;
  s += cap ? ln(cx - r, cy, cx + r, cy, V, 2) + tx(cx, cy - 11, et, `fill="${V}" font-weight="700"`) : ln(cx, cy, cx + r, cy, V, 2) + tx(cx + r / 2, cy - 8, et, `fill="${V}" font-weight="700"`);
  return sv(320, 200, s);
}
export function daireDilimi({ derece, yEt, aEt }) {
  const cx = 130, cy = 120, r = 90, a = (derece * Math.PI) / 180;
  const x2 = cx + r * Math.cos(-a), y2 = cy + r * Math.sin(-a);
  const s = `<path d="M${cx},${cy} L${cx + r},${cy} A${r},${r} 0 ${derece > 180 ? 1 : 0} 0 ${x2},${y2} Z" fill="#cfe3f7" stroke="${K}" stroke-width="2.4"/>` + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="4,4"/>` + tx(cx + r / 2, cy + 18, yEt, `fill="${V}" font-weight="700"`) + tx(cx + 30, cy - 12, aEt, `fill="${M}" font-weight="700" text-anchor="start"`);
  return sv(300, 240, s);
}
export function aciSekli({ derece, et, adlar = ["A", "B", "C"] }) {
  const ox = 70, oy = 180, L = 165, a = (derece * Math.PI) / 180;
  const x2 = ox + L * Math.cos(a), y2 = oy - L * Math.sin(a);
  const yar = 38, yx = ox + yar * Math.cos(a), yy = oy - yar * Math.sin(a);
  const s = ln(ox, oy, ox + L, oy, K, 2.4) + ln(ox, oy, x2, y2, K, 2.4) + `<path d="M${ox + yar},${oy} A${yar},${yar} 0 ${derece > 180 ? 1 : 0} 0 ${yx},${yy}" fill="none" stroke="${V}" stroke-width="2"/>` + tx(ox + 60, oy - 12, et, `fill="${V}" font-weight="700"`) + nk(ox, oy, 3) + tx(ox - 6, oy + 18, adlar[1], 'font-weight="700"') + tx(ox + L + 4, oy + 18, adlar[2], 'font-weight="700"') + tx(x2, y2 - 8, adlar[0], 'font-weight="700"');
  return sv(310, 215, s);
}
export function ucgenAci({ a, b, ad = ["A", "B", "C"], sorulan = "C", etiketler }) {
  const A = [160, 30], B = [40, 180], C = [290, 180];
  const e = etiketler || {};
  let s = `<polygon points="${A} ${B} ${C}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>` + tx(160, 22, ad[0], 'font-weight="700"') + tx(26, 190, ad[1], 'font-weight="700"') + tx(304, 190, ad[2], 'font-weight="700"');
  s += tx(160, 66, e.A ?? "", `fill="${V}" font-weight="700"`) + tx(76, 172, e.B ?? "", `fill="${V}" font-weight="700"`) + tx(254, 172, e.C ?? "", `fill="${V}" font-weight="700"`);
  return sv(330, 210, s);
}
export function sayiDogrusu({ min, max, adim = 1, noktalar = [], etiketAdim = 1, kesirPay = 0, genis = 380 }) {
  const x0 = 24, x1 = genis - 24, y = 58;
  const X = (v) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  let s = ln(x0 - 10, y, x1 + 10, y, K, 2) + `<polygon points="${x1 + 14},${y} ${x1 + 5},${y - 4} ${x1 + 5},${y + 4}" fill="${K}"/><polygon points="${x0 - 14},${y} ${x0 - 5},${y - 4} ${x0 - 5},${y + 4}" fill="${K}"/>`;
  const n = Math.round((max - min) / adim);
  for (let i = 0; i <= n; i++) {
    const v = +(min + i * adim).toFixed(6);
    const bas = i % etiketAdim === 0;
    s += ln(X(v), y - (bas ? 7 : 4), X(v), y + (bas ? 7 : 4), K, bas ? 1.8 : 1.2);
    if (bas) s += tx(X(v), y + 24, String(v).replace("-", "−").replace(".", ","), 'font-size="12"');
  }
  noktalar.forEach((p) => { s += nk(X(p.v), y, 5.5, V) + tx(X(p.v), y - 14, p.e, `fill="${V}" font-weight="700"`); });
  return sv(genis, 92, s);
}
export function kesirModel({ parca, boyali, sekil = "cubuk", renk = "#7fb2e5" }) {
  let s = "";
  if (sekil === "cubuk") { const w = 300 / parca; for (let i = 0; i < parca; i++) s += `<rect x="${20 + i * w}" y="14" width="${w}" height="44" fill="${i < boyali ? renk : "#fff"}" stroke="${K}" stroke-width="1.8"/>`; return sv(340, 72, s); }
  const cx = 90, cy = 90, r = 70; // daire
  for (let i = 0; i < parca; i++) { const a0 = (2 * Math.PI * i) / parca - Math.PI / 2, a1 = (2 * Math.PI * (i + 1)) / parca - Math.PI / 2; s += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" fill="${i < boyali ? renk : "#fff"}" stroke="${K}" stroke-width="1.8"/>`; }
  return sv(180, 180, s);
}
const RENKLER = ["#4a78ad", "#e8803a", "#5aa469", "#c0504d", "#8e6bb0", "#e8b339"];
export function pasta({ etiketler, degerler }) {
  const top = degerler.reduce((a, b) => a + b, 0), cx = 110, cy = 100, r = 85;
  let a0 = -Math.PI / 2, s = "";
  degerler.forEach((v, i) => {
    const a1 = a0 + (2 * Math.PI * v) / top, buyuk = a1 - a0 > Math.PI ? 1 : 0;
    s += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${buyuk} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" fill="${RENKLER[i % 6]}" stroke="#fff" stroke-width="2"/>`;
    s += `<rect x="226" y="${30 + i * 28}" width="16" height="16" fill="${RENKLER[i % 6]}"/>` + tx(250, 43 + i * 28, `${etiketler[i]}`, 'text-anchor="start" font-size="13"');
    a0 = a1;
  });
  return sv(380, 200, s);
}
export function saat({ s: sa, d }) {
  const cx = 100, cy = 100, r = 82;
  let o = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${K}" stroke-width="3"/>`;
  for (let i = 1; i <= 12; i++) { const a = (i * Math.PI) / 6 - Math.PI / 2; o += tx(cx + (r - 17) * Math.cos(a), cy + (r - 17) * Math.sin(a) + 5, String(i), 'font-weight="700" font-size="14"'); }
  for (let i = 0; i < 60; i++) { const a = (i * Math.PI) / 30 - Math.PI / 2, u = i % 5 === 0 ? 7 : 3.5; o += ln(cx + (r - 3) * Math.cos(a), cy + (r - 3) * Math.sin(a), cx + (r - 3 - u) * Math.cos(a), cy + (r - 3 - u) * Math.sin(a), K, i % 5 === 0 ? 1.6 : 0.8); }
  const aD = (d * Math.PI) / 30 - Math.PI / 2, aS = (((sa % 12) + d / 60) * Math.PI) / 6 - Math.PI / 2;
  o += ln(cx, cy, cx + 44 * Math.cos(aS), cy + 44 * Math.sin(aS), K, 5) + ln(cx, cy, cx + 64 * Math.cos(aD), cy + 64 * Math.sin(aD), K, 3) + nk(cx, cy, 5);
  return sv(200, 200, o);
}
export function olcuSilindiri({ max, adim, deger, birim = "mL" }) {
  const x = 60, w = 56, top = 20, h = 190, y = (v) => top + h - (v / max) * h;
  let s = `<rect x="${x}" y="${y(deger)}" width="${w}" height="${top + h - y(deger)}" fill="#9fd0f0"/><path d="M${x},${top} L${x},${top + h} L${x + w},${top + h} L${x + w},${top}" fill="none" stroke="${K}" stroke-width="2.4"/>`;
  for (let v = 0; v <= max + 1e-9; v += adim) s += ln(x, y(v), x + 14, y(v), K, 1.4) + tx(x - 8, y(v) + 4, String(v), 'text-anchor="end" font-size="12"');
  s += tx(x + w / 2, top + h + 22, birim, 'font-size="12"');
  return sv(190, 250, s);
}
export function kutu({ a, b, c, aEt, bEt, cEt }) { // izometrik dikdörtgenler prizması (a: genişlik, b: derinlik, c: yükseklik)
  const x = 60, y = 150, W = 150, D = 70, H = 90, dx = 55, dy = -35;
  const f = `<polygon points="${x},${y} ${x + W},${y} ${x + W},${y - H} ${x},${y - H}" fill="#eaf2fb" stroke="${K}" stroke-width="2.2"/>`;
  const u = `<polygon points="${x},${y - H} ${x + W},${y - H} ${x + W + dx},${y - H + dy} ${x + dx},${y - H + dy}" fill="#d7e8f8" stroke="${K}" stroke-width="2.2"/>`;
  const r = `<polygon points="${x + W},${y} ${x + W + dx},${y + dy} ${x + W + dx},${y - H + dy} ${x + W},${y - H}" fill="#c3dcf2" stroke="${K}" stroke-width="2.2"/>`;
  return sv(330, 190, f + u + r + tx(x + W / 2, y + 20, aEt, `fill="${V}" font-weight="700"`) + tx(x + W + dx + 6, y - H / 2 + dy / 2 + 4, cEt, `fill="${V}" font-weight="700" text-anchor="start"`) + tx(x + W + dx / 2 + 10, y + dy / 2 + 18, bEt, `fill="${V}" font-weight="700" text-anchor="start"`));
}
export function silindirCisim({ rEt, hEt }) {
  const s = `<ellipse cx="130" cy="150" rx="60" ry="18" fill="#c3dcf2" stroke="${K}" stroke-width="2.2"/><rect x="70" y="50" width="120" height="100" fill="#d9e9f8" stroke="none"/><path d="M70,50 L70,150 M190,50 L190,150" stroke="${K}" stroke-width="2.2" fill="none"/><ellipse cx="130" cy="50" rx="60" ry="18" fill="#eaf2fb" stroke="${K}" stroke-width="2.2"/>` + ln(130, 50, 190, 50, V, 1.8) + nk(130, 50, 3, V) + tx(168, 38, rEt, `fill="${V}" font-weight="700" font-size="12"`) + tx(198, 106, hEt, `fill="${V}" font-weight="700" text-anchor="start"`);
  return sv(290, 190, s);
}
export function koniCisim({ rEt, hEt }) {
  const s = `<path d="M70,150 L130,30 L190,150" fill="#d9e9f8" stroke="${K}" stroke-width="2.2"/><ellipse cx="130" cy="150" rx="60" ry="18" fill="#c3dcf2" stroke="${K}" stroke-width="2.2"/>` + ln(130, 30, 130, 150, V, 1.6, 'stroke-dasharray="5,4"') + ln(130, 150, 190, 150, V, 1.8) + nk(130, 150, 3, V) + tx(166, 176, rEt, `fill="${V}" font-weight="700" font-size="12"`) + tx(116, 96, hEt, `fill="${V}" font-weight="700" text-anchor="end"`);
  return sv(260, 190, s);
}
export function koordinat({ noktalar, min = -5, max = 5, cokgen = null }) {
  const u = 30, pad = 26, boy = (max - min) * u + 2 * pad, cx = (v) => pad + (v - min) * u, cy = (v) => pad + (max - v) * u;
  let s = "";
  for (let v = min; v <= max; v++) {
    s += ln(cx(v), cy(max), cx(v), cy(min), v === 0 ? K : "#d6d6d6", v === 0 ? 2 : 0.9) + ln(cx(min), cy(v), cx(max), cy(v), v === 0 ? K : "#d6d6d6", v === 0 ? 2 : 0.9);
    if (v !== 0) s += tx(cx(v), cy(0) + 15, String(v).replace("-", "−"), 'font-size="10.5" fill="#444"') + tx(cx(0) - 8, cy(v) + 4, String(v).replace("-", "−"), 'font-size="10.5" fill="#444" text-anchor="end"');
  }
  s += tx(cx(max) + 2, cy(0) - 6, "x", 'font-weight="700" font-size="13" text-anchor="end"') + tx(cx(0) + 10, cy(max) + 12, "y", 'font-weight="700" font-size="13" text-anchor="start"');
  if (cokgen) s += `<polygon points="${cokgen.map((p) => `${cx(p[0])},${cy(p[1])}`).join(" ")}" fill="#cfe3f7" fill-opacity=".7" stroke="${M}" stroke-width="2"/>`;
  noktalar.forEach((p) => { s += nk(cx(p.x), cy(p.y), 5, V) + (p.e ? tx(cx(p.x) + 10, cy(p.y) - 7, p.e, `fill="${V}" font-weight="700" text-anchor="start"`) : ""); });
  return sv(boy, boy, s);
}
export function torba({ topKirmizi = 0, topMavi = 0, topYesil = 0, topSari = 0 }) {
  const liste = [["#d9382c", topKirmizi], ["#2f6fc0", topMavi], ["#3a9d58", topYesil], ["#e8b339", topSari]].flatMap(([c, n]) => Array(n).fill(c));
  const kol = Math.min(6, liste.length), satir = Math.ceil(liste.length / kol);
  let s = `<rect x="14" y="14" width="${kol * 38 + 24}" height="${satir * 38 + 24}" rx="12" fill="#f7f1e3" stroke="${K}" stroke-width="2.2"/>`;
  liste.forEach((c, i) => { s += `<circle cx="${14 + 24 + (i % kol) * 38 + 8}" cy="${14 + 24 + Math.floor(i / kol) * 38 + 8}" r="15" fill="${c}" stroke="${K}" stroke-width="1.4"/>`; });
  return sv(kol * 38 + 52, satir * 38 + 52, s);
}
export function denge({ sol, sag, eksen = "x" }) {
  const s = ln(60, 120, 280, 120, K, 4) + ln(170, 120, 170, 170, K, 4) + ln(130, 172, 210, 172, K, 4) + ln(60, 120, 60, 100, K, 2) + ln(280, 120, 280, 100, K, 2) + `<rect x="20" y="62" width="90" height="38" rx="6" fill="#eaf2fb" stroke="${K}" stroke-width="2"/><rect x="230" y="62" width="90" height="38" rx="6" fill="#fdf0d5" stroke="${K}" stroke-width="2"/>` + tx(65, 87, sol, 'font-weight="700" font-size="15"') + tx(275, 87, sag, 'font-weight="700" font-size="15"');
  return sv(340, 190, s);
}
export function ornuntu({ adimlar, kutu = 18 }) {
  let s = "", x0 = 14;
  adimlar.forEach((n, i) => {
    const kol = Math.ceil(Math.sqrt(n));
    for (let k = 0; k < n; k++) s += `<rect x="${x0 + (k % kol) * (kutu + 3)}" y="${22 + Math.floor(k / kol) * (kutu + 3)}" width="${kutu}" height="${kutu}" fill="#7fb2e5" stroke="${K}" stroke-width="1.2"/>`;
    s += tx(x0 + (kol * (kutu + 3)) / 2, 14, `${i + 1}. şekil`, 'font-size="11.5"');
    x0 += kol * (kutu + 3) + 30;
  });
  return sv(x0, 22 + 6 * (kutu + 3), s);
}
function pil(x, y) { // yatay devre kolunda pil: sol uç (+) uzun çizgi
  return ln(x, y, x + 14, y) + ln(x + 14, y - 16, x + 14, y + 16, K, 3) + ln(x + 24, y - 9, x + 24, y + 9, K, 5) + ln(x + 24, y, x + 38, y) + tx(x + 8, y - 20, "+", 'font-size="13" font-weight="700"');
}
function ampul(x, y, ad, yanik = true) {
  return `<circle cx="${x}" cy="${y}" r="15" fill="${yanik ? "#ffe680" : "#fff"}" stroke="${K}" stroke-width="2"/>` + ln(x - 10, y - 10, x + 10, y + 10, K, 1.6) + ln(x + 10, y - 10, x - 10, y + 10, K, 1.6) + tx(x, y + 32, ad, 'font-weight="700"');
}
function anahtar(x, y, acik) { return nk(x, y, 4) + nk(x + 44, y, 4) + (acik ? ln(x, y, x + 38, y - 22, K, 2.6) : ln(x, y, x + 44, y, K, 2.6)); }
export function devre({ tip = "seri", ampuller = ["K", "L"], acikAnahtar = false, yanik = null, anahtarYok = false }) {
  const yn = (i) => (yanik ? yanik[i] : !acikAnahtar);
  let s = "";
  if (tip === "seri") { // üst kolda pil + ampuller, alt kolda anahtar
    s += ln(30, 50, 30, 150) + ln(30, 150, 320, 150) + ln(320, 150, 320, 50) + ln(30, 50, 60, 50) + pil(60, 50);
    let x = 98;
    ampuller.forEach((a, i) => { s += ln(x, 50, x + 28, 50) + ampul(x + 43, 50, a, yn(i)) + ln(x + 58, 50, x + 78, 50); x += 78; });
    s += ln(x, 50, 320, 50);
    if (!anahtarYok) s += ln(30, 150, 140, 150, "#fff", 4) + ln(30, 150, 140, 150) + anahtar(140, 150, acikAnahtar) + tx(162, 176, "Anahtar", 'font-size="12"');
    return sv(350, 190, s);
  }
  // paralel: pil solda; iki kol
  s = ln(30, 40, 70, 40) + ln(30, 160, 70, 160) + ln(30, 40, 30, 92) + ln(14, 92, 46, 92, K, 3) + ln(21, 104, 39, 104, K, 6) + ln(30, 104, 30, 160) + tx(52, 90, "+", 'font-size="13" font-weight="700"');
  s += ln(70, 40, 70, 160) + ln(70, 40, 120, 40) + ln(70, 160, 120, 160);
  ampuller.slice(0, 2).forEach((a, i) => { const yy = i ? 160 : 40; s += ln(120, yy, 180, yy) + ampul(195, yy, a, yn(i)) + ln(210, yy, 300, yy); });
  s += ln(300, 40, 300, 160);
  return sv(340, 205, s);
}
export function zincir({ adlar, renk = "#e9f1d8" }) {
  let s = "", x = 10; const w = 92;
  adlar.forEach((a, i) => { s += `<rect x="${x}" y="14" width="${w}" height="38" rx="8" fill="${renk}" stroke="${K}" stroke-width="1.8"/>` + tx(x + w / 2, 38, a, 'font-weight="700" font-size="12.5"'); if (i < adlar.length - 1) s += ln(x + w + 2, 33, x + w + 22, 33, K, 2) + `<polygon points="${x + w + 26},33 ${x + w + 18},28 ${x + w + 18},38" fill="${K}"/>`; x += w + 30; });
  return sv(x - 20, 66, s);
}
export function zamanSeridi({ olaylar }) {
  const w = 460, n = olaylar.length; let s = ln(20, 70, w - 10, 70, K, 3) + `<polygon points="${w},70 ${w - 12},64 ${w - 12},76" fill="${K}"/>`;
  olaylar.forEach((o, i) => { const x = 85 + (i * (w - 170)) / (n - 1 || 1), up = i % 2 === 0; s += nk(x, 70, 6, V) + ln(x, 70, x, up ? 40 : 100, G, 1.2) + tx(x, up ? 30 : 114, o.yil, 'font-weight="700" font-size="13" fill="' + V + '"') + tx(x, up ? 18 : 130, o.ad, 'font-size="12"'); });
  return sv(w + 10, 142, s);
}
export function termometre({ deger, min = -10, max = 50, adim = 10, kucuk = 0 }) {
  const x = 60, top = 14, h = 200, y = (v) => top + h - ((v - min) / (max - min)) * h;
  let s = `<rect x="${x}" y="${top}" width="16" height="${h}" rx="8" fill="#fff" stroke="${K}" stroke-width="2.2"/><rect x="${x + 4}" y="${y(deger)}" width="8" height="${top + h - y(deger)}" fill="#d9382c"/><circle cx="${x + 8}" cy="${top + h + 10}" r="13" fill="#d9382c" stroke="${K}" stroke-width="2.2"/>`;
  for (let v = min; v <= max; v += adim) s += ln(x + 20, y(v), x + 32, y(v), K, 1.4) + tx(x + 38, y(v) + 4, String(v).replace("-", "−"), 'text-anchor="start" font-size="12"');
  if (kucuk) for (let v = min; v <= max; v += kucuk) s += ln(x + 20, y(v), x + 26, y(v), K, 1);
  return sv(150, 250, s);
}
export function hucre({ tip = "hayvan", etiketler = null }) { // etiketler: {cekirdek:"K", organel:"L", zar:"M", duvar:"N", kloroplast:"P"}
  const e = etiketler || {};
  let s = tip === "hayvan"
    ? `<ellipse cx="160" cy="100" rx="130" ry="85" fill="#fdf0d5" stroke="${K}" stroke-width="2.4"/>`
    : `<rect x="30" y="20" width="260" height="160" rx="14" fill="#e7f4dd" stroke="${K}" stroke-width="3.6"/>`;
  s += `<circle cx="160" cy="100" r="30" fill="#c8b6e2" stroke="${K}" stroke-width="2"/><circle cx="160" cy="100" r="9" fill="#8e6bb0"/>`;
  s += `<ellipse cx="95" cy="70" rx="17" ry="9" fill="#f4b183" stroke="${K}" stroke-width="1.6"/><ellipse cx="235" cy="135" rx="17" ry="9" fill="#f4b183" stroke="${K}" stroke-width="1.6"/>`;
  if (tip === "bitki") s += `<ellipse cx="82" cy="135" rx="18" ry="11" fill="#5aa469" stroke="${K}" stroke-width="1.6"/><ellipse cx="240" cy="60" rx="18" ry="11" fill="#5aa469" stroke="${K}" stroke-width="1.6"/>`;
  const L = (x1, y1, x2, y2, ad) => ln(x1, y1, x2, y2, V, 1.4) + tx(x2 + (x2 > x1 ? 8 : -8), y2 + 4, ad, `fill="${V}" font-weight="700" font-size="15"`);
  if (e.cekirdek) s += L(160, 100, 160, 8, e.cekirdek).replace(/<text x="160" y="12"/, '<text x="160" y="10"');
  if (e.organel) s += L(95, 70, 40, 40, e.organel);
  if (e.zar) s += L(tip === "hayvan" ? 285 : 290, tip === "hayvan" ? 70 : 100, 308, 60, e.zar);
  if (e.kloroplast) s += L(82, 135, 40, 175, e.kloroplast);
  if (e.duvar) s += L(30, 100, 10, 100, e.duvar).replace(/text-anchor="middle"/, 'text-anchor="end"');
  return sv(330, 200, s);
}
export function dinamometre({ deger, max = 10 }) {
  const x = 90, top = 20, h = 180, y = (v) => top + (v / max) * h;
  let s = `<rect x="${x - 18}" y="${top - 12}" width="36" height="${h + 40}" rx="6" fill="#f4f4f4" stroke="${K}" stroke-width="2.2"/>` + ln(x, top - 22, x, top - 12, K, 3) + `<circle cx="${x}" cy="${top - 26}" r="4" fill="none" stroke="${K}" stroke-width="2"/>`;
  for (let v = 0; v <= max; v++) s += ln(x - 18, y(v), x - 6, y(v), K, v % 5 === 0 ? 2 : 1.2) + tx(x - 24, y(v) + 4, String(v), 'text-anchor="end" font-size="12"');
  s += ln(x - 18, y(deger), x + 18, y(deger), V, 2.4) + ln(x, y(max) + 24, x, y(max) + 54, K, 2) + `<circle cx="${x}" cy="${y(max) + 66}" r="12" fill="#9aa5b1" stroke="${K}" stroke-width="2"/>` + tx(x + 34, 14, "N", 'font-weight="700"');
  return sv(180, 280, s);
}
export function kuvvet({ sol, sag, kutu = "Cisim" }) { // sol/sag: N cinsinden sayı (0 olabilir)
  let s = `<rect x="110" y="60" width="100" height="50" rx="6" fill="#dbe9f7" stroke="${K}" stroke-width="2.4"/>` + tx(160, 91, kutu, 'font-weight="700"');
  const ok = (x1, x2, ad) => ln(x1, 85, x2, 85, V, 3.4) + `<polygon points="${x2},85 ${x2 + (x2 < x1 ? 12 : -12)},78 ${x2 + (x2 < x1 ? 12 : -12)},92" fill="${V}"/>` + tx((x1 + x2) / 2, 74, ad, `fill="${V}" font-weight="700"`);
  if (sol) s += ok(110, 110 - Math.min(90, sol * 9), sol + " N");
  if (sag) s += ok(210, 210 + Math.min(90, sag * 9), sag + " N");
  return sv(320, 130, s);
}
export function golge({ yakin = false }) {
  const kx = 30, cx = yakin ? 110 : 170, ex = 270;
  const h = yakin ? 56 : 40; // gölge yüksekliği büyüklüğü için oran: kaynaktan uzaklaştıkça küçülür
  const sh = yakin ? 100 : 60;
  let s = `<circle cx="${kx}" cy="90" r="12" fill="#ffe680" stroke="${K}" stroke-width="2"/>` + tx(kx, 125, "Işık kaynağı", 'font-size="11"') + `<rect x="${cx}" y="${90 - h / 2}" width="8" height="${h}" fill="#7a7a7a" stroke="${K}" stroke-width="1.6"/>` + tx(cx + 4, 90 + h / 2 + 16, "Cisim", 'font-size="11"');
  s += ln(ex, 20, ex, 160, K, 3) + `<rect x="${ex - 6}" y="${90 - sh / 2}" width="6" height="${sh}" fill="#444"/>` + tx(ex, 178, "Perde", 'font-size="11"') + ln(kx + 12, 90, cx, 90 - h / 2, "#e8b339", 1.2) + ln(kx + 12, 90, cx, 90 + h / 2, "#e8b339", 1.2);
  return sv(310, 190, s);
}
export function yansima({ aci }) {
  const x = 160, y = 150, L = 120, a = (aci * Math.PI) / 180;
  const gx = x - L * Math.sin(a), gy = y - L * Math.cos(a), rx = x + L * Math.sin(a), ry = gy;
  const ok = (x1, y1, x2, y2, c) => ln(x1, y1, x2, y2, c, 2.6) + `<polygon points="${x2},${y2} ${x2 - (x2 - x1) / 12 + (y2 - y1) / 22},${y2 - (y2 - y1) / 12 - (x2 - x1) / 22} ${x2 - (x2 - x1) / 12 - (y2 - y1) / 22},${y2 - (y2 - y1) / 12 + (x2 - x1) / 22}" fill="${c}"/>`;
  const s = ln(30, y, 290, y, K, 4) + `<g stroke="#777" stroke-width="1.4">${Array.from({ length: 12 }, (_, i) => `<line x1="${34 + i * 22}" y1="${y}" x2="${24 + i * 22}" y2="${y + 12}"/>`).join("")}</g>` + ln(x, y, x, y - 135, G, 1.6, 'stroke-dasharray="6,4"') + ok(gx, gy, x, y, M) + ok(x, y, rx, ry, Y) + tx(x - 38, y - 78, "Gelen ışın", `fill="${M}" font-size="11.5" text-anchor="end"`) + tx(x + 40, y - 80, "Yansıyan ışın", `fill="${Y}" font-size="11.5" text-anchor="start"`) + tx(x + 6, y - 138, "Normal", 'font-size="11.5" fill="#555" text-anchor="start"') + `<path d="M${x},${y - 55} A55,55 0 0 0 ${x - 55 * Math.sin(a)},${y - 55 * Math.cos(a)}" fill="none" stroke="${V}" stroke-width="2"/>` + tx(x - 30 * Math.sin(a / 2) - 12, y - 66 * Math.cos(a / 2) - 4, aci + "°", `fill="${V}" font-weight="700"`) + tx(160, y + 34, "Düzlem ayna", 'font-size="12"');
  return sv(320, 200, s);
}
export function kirilma() { // havadan suya geçen ışın
  const y = 100, x = 160;
  const g = (a) => (a * Math.PI) / 180;
  const ok = (x1, y1, x2, y2, c) => ln(x1, y1, x2, y2, c, 2.6) + `<polygon points="${x2},${y2} ${x2 - (x2 - x1) / 10 + (y2 - y1) / 20},${y2 - (y2 - y1) / 10 - (x2 - x1) / 20} ${x2 - (x2 - x1) / 10 - (y2 - y1) / 20},${y2 - (y2 - y1) / 10 + (x2 - x1) / 20}" fill="${c}"/>`;
  const s = `<rect x="20" y="${y}" width="280" height="90" fill="#cfe7f7"/>` + ln(20, y, 300, y, K, 2.4) + ln(x, 10, x, 190, G, 1.5, 'stroke-dasharray="6,4"') + ok(x - 70, y - 90, x, y, M) + ok(x, y, x + 36, y + 80, M) + tx(36, 24, "Hava", 'font-weight="700" text-anchor="start"') + tx(36, 118, "Su", 'font-weight="700" text-anchor="start"') + tx(x + 8, 24, "Normal", 'font-size="11.5" fill="#555" text-anchor="start"');
  return sv(320, 200, s);
}
export function mercek() { // ince kenarlı (çift dışbükey) mercek, paralel ışınlar odakta toplanır
  const s = `<path d="M160,20 C200,60 200,140 160,180 C120,140 120,60 160,20 Z" fill="#cfe7f7" stroke="${K}" stroke-width="2.4"/>` + ln(20, 100, 300, 100, G, 1.2, 'stroke-dasharray="6,4"') + [60, 80, 120, 140].map((yy) => ln(20, yy, 160, yy, M, 2) + ln(160, yy, 250, 100, M, 2)).join("") + nk(250, 100, 4, V) + tx(250, 124, "Odak", `fill="${V}" font-weight="700"`);
  return sv(320, 200, s);
}
export function yukler({ sol = "+", sag = "−" }) {
  const c = (x, t) => `<circle cx="${x}" cy="60" r="28" fill="${t === "+" ? "#f3c6c0" : "#c4d6f0"}" stroke="${K}" stroke-width="2.4"/>` + tx(x, 70, t === "−" ? "−" : t, 'font-size="30" font-weight="700"');
  return sv(300, 120, c(80, sol) + c(220, sag) + tx(150, 110, "Yüklü iki cisim", 'font-size="12"'));
}
export function kaldirac({ yukEt, kuvvetEt, yukKol, kuvvetKol }) {
  const u = 200 / (yukKol + kuvvetKol), fx = 40 + yukKol * u;
  const s = `<polygon points="${fx - 18},170 ${fx + 18},170 ${fx},146" fill="#7a7a7a" stroke="${K}" stroke-width="2"/>` + ln(40, 144, 240, 144, K, 7) + ln(40, 144, 40, 90, "#fff", 0) + `<rect x="${40 - 22}" y="92" width="44" height="44" rx="4" fill="#d9e2ec" stroke="${K}" stroke-width="2"/>` + tx(40, 120, yukEt, 'font-weight="700" font-size="12"') + ln(240, 144, 240, 98, V, 3.4) + `<polygon points="240,90 233,104 247,104" fill="${V}"/>` + tx(240, 80, kuvvetEt, `fill="${V}" font-weight="700"`) + ln(40, 200, fx, 200, M, 1.6) + tx((40 + fx) / 2, 216, yukKol + " m", `fill="${M}" font-size="12"`) + ln(fx, 200, 240, 200, M, 1.6) + tx((fx + 240) / 2, 216, kuvvetKol + " m", `fill="${M}" font-size="12"`) + tx(fx, 184, "Dayanak", 'font-size="11"');
  return sv(280, 225, s);
}
export function etiketliCizgi(svgStr, notlar) { return svgStr; }
// Metin kutuya sığsın: yazı tipi boyutu, yaklaşık karakter genişliğine göre küçültülür
const uyum = (m, genis, boy, oran) => +Math.min(boy, genis / (String(m).length * oran)).toFixed(1);
export function kart({ baslik, satirlar, renk = "#2c6fbb", genis = 340 }) {
  let s = `<rect x="10" y="10" width="${genis - 20}" height="${46 + satirlar.length * 24}" rx="10" fill="#fff" stroke="${renk}" stroke-width="3"/><rect x="10" y="10" width="${genis - 20}" height="34" rx="10" fill="${renk}"/>` + tx(genis / 2, 33, baslik, `fill="#fff" font-weight="700" font-size="${uyum(baslik, genis - 44, 15, 0.72)}"`);
  satirlar.forEach((l, i) => { s += tx(genis / 2, 70 + i * 24, l, `font-size="${uyum(l, genis - 44, 13.5, 0.56)}"`); });
  return sv(genis, 62 + satirlar.length * 24, s);
}
export function cami({ harfler = true }) { // A kubbe, B minare, C mihrap işareti (içeride), D şadırvan
  let s = `<rect x="30" y="150" width="260" height="10" fill="#bbb"/><rect x="70" y="100" width="150" height="50" fill="#f3e7cf" stroke="${K}" stroke-width="2"/><path d="M80,100 A60,60 0 0 1 210,100 Z" fill="#c6dcef" stroke="${K}" stroke-width="2"/><rect x="40" y="60" width="18" height="90" fill="#f3e7cf" stroke="${K}" stroke-width="2"/><polygon points="40,60 58,60 49,34" fill="#c6dcef" stroke="${K}" stroke-width="2"/><rect x="240" y="60" width="18" height="90" fill="#f3e7cf" stroke="${K}" stroke-width="2"/><polygon points="240,60 258,60 249,34" fill="#c6dcef" stroke="${K}" stroke-width="2"/><path d="M130,150 L130,125 A15,15 0 0 1 160,125 L160,150 Z" fill="#fff" stroke="${K}" stroke-width="2"/>`;
  s += tx(145, 56, "K", `fill="${V}" font-weight="700" font-size="15"`) + tx(30, 52, "L", `fill="${V}" font-weight="700" font-size="15"`);
  s += ln(145, 60, 145, 76, V, 1.4) + ln(31, 56, 40, 66, V, 1.4);
  return sv(320, 190, s);
}
export function yonHaritasi({ merkez, kuzey, dogu, guney, bati }) {
  const kutu = (x, y, ad, vurgu) => `<rect x="${x - 46}" y="${y - 16}" width="92" height="32" rx="7" fill="${vurgu ? "#fde9c9" : "#eaf2fb"}" stroke="${K}" stroke-width="1.8"/>` + tx(x, y + 5, ad, 'font-weight="700" font-size="12.5"');
  let s = ln(170, 55, 170, 170, G, 1.4, 'stroke-dasharray="5,4"') + ln(60, 112, 280, 112, G, 1.4, 'stroke-dasharray="5,4"');
  s += kutu(170, 112, merkez, true) + (kuzey ? kutu(170, 36, kuzey) : "") + (guney ? kutu(170, 188, guney) : "") + (dogu ? kutu(290, 112, dogu) : "") + (bati ? kutu(50, 112, bati) : "");
  s += tx(170, 14, "K", 'font-weight="700" fill="#c0392b"') + tx(170, 224, "G", 'font-weight="700" fill="#c0392b"') + tx(334, 117, "D", 'font-weight="700" fill="#c0392b"') + tx(6, 117, "B", 'font-weight="700" fill="#c0392b" text-anchor="start"');
  return sv(344, 230, s);
}
