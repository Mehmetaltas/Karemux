// Matematik görselli sorular için ölçekli (etiket = çizim) SVG şekilleri. sekil2.js'ye dokunmadan yerel olarak üretilir.
import { kacis } from "../render.js";

const F = 'font-family="Helvetica, Arial, sans-serif"';
const K = "#1b1b1b", V = "#c0392b", M = "#2c6fbb";
const sv = (w, h, ic) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${F}>${ic}</svg>`;
const r1 = (n) => +n.toFixed(1);
const tx = (x, y, s, o = "") => `<text x="${r1(x)}" y="${r1(y)}"${/font-size=/.test(o) ? "" : ' font-size="13"'}${/text-anchor=/.test(o) ? "" : ' text-anchor="middle"'} ${o}>${kacis(s)}</text>`;
const ln = (x1, y1, x2, y2, c = K, w = 2, ex = "") => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w}" ${ex}/>`;
const nk = (x, y, r = 3, c = K) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${c}"/>`;
const RAD = Math.PI / 180;
const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy); return [dx / d, dy / d]; };

// Dik işareti: P köşesinde Q ve R yönlerinde kare
function dikIsaret(P, Q, R, s = 11) {
  const u = unit(P, Q), v = unit(P, R);
  const a = [P[0] + u[0] * s, P[1] + u[1] * s], b = [P[0] + (u[0] + v[0]) * s, P[1] + (u[1] + v[1]) * s], c = [P[0] + v[0] * s, P[1] + v[1] * s];
  return `<path d="M${r1(a[0])},${r1(a[1])} L${r1(b[0])},${r1(b[1])} L${r1(c[0])},${r1(c[1])}" fill="none" stroke="${K}" stroke-width="1.4"/>`;
}
// Eşit kenar işareti (kısa çizgi)
function esitIsaret(P, Q, n = 1) {
  const m = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], u = unit(P, Q), nx = -u[1], ny = u[0];
  let s = "";
  for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 5; s += ln(m[0] + u[0] * o - nx * 6, m[1] + u[1] * o - ny * 6, m[0] + u[0] * o + nx * 6, m[1] + u[1] * o + ny * 6, K, 1.8); }
  return s;
}
// Açısı verilen (ölçekli) üçgen: BC tabanı yatay, açılar derece. Köşeler tuvale sığdırılır.
export function ucgenAciOlcekli({ A, B, C, etiket = {}, ad = ["A", "B", "C"], esit = [], dik = null }) {
  const sA = Math.sin(A * RAD), AB = Math.sin(C * RAD) / sA;
  let pts = [[AB * Math.cos(B * RAD), -AB * Math.sin(B * RAD)], [0, 0], [1, 0]]; // A, B, C
  return ucgenCiz(fit(pts, 250, 135), { etiket, ad, esit, dik, aci: [A, B, C] });
}
// Köşeleri doğrudan verilen ölçekli üçgen (px)
export function ucgenNokta({ pts, etiket = {}, ad = ["A", "B", "C"], esit = [], dik = null, aci }) {
  return ucgenCiz(fit(pts, 250, 135), { etiket, ad, esit, dik, aci });
}
function fit(pts, bw, bh) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min(bw / (x1 - x0), bh / (y1 - y0));
  const ox = (330 - (x1 - x0) * k) / 2, oy = (215 - (y1 - y0) * k) / 2;
  return pts.map((p) => [ox + (p[0] - x0) * k, oy + (p[1] - y0) * k]);
}
function aciDeg(P, Q, R) { const u = unit(P, Q), v = unit(P, R); return Math.acos(u[0] * v[0] + u[1] * v[1]) / RAD; }
function ucgenCiz(P, { etiket, ad, esit, dik }) {
  let s = `<polygon points="${P.map((p) => r1(p[0]) + "," + r1(p[1])).join(" ")}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>`;
  const keys = ["A", "B", "C"];
  P.forEach((p, i) => {
    const q = P[(i + 1) % 3], r = P[(i + 2) % 3], u = unit(p, q), v = unit(p, r);
    let b = [u[0] + v[0], u[1] + v[1]]; const bl = Math.hypot(b[0], b[1]); b = [b[0] / bl, b[1] / bl];
    const ac = aciDeg(p, q, r), half = (ac / 2) * RAD;
    const kenar = Math.min(Math.hypot(q[0] - p[0], q[1] - p[1]), Math.hypot(r[0] - p[0], r[1] - p[1]));
    const d = Math.min(Math.max(22, 17 / Math.sin(half)), kenar * 0.5);
    if (etiket[keys[i]] && dik !== i) s += tx(p[0] + b[0] * d, p[1] + b[1] * d + 4, etiket[keys[i]], `fill="${V}" font-weight="700"`);
    s += tx(p[0] - b[0] * 15, p[1] - b[1] * 15 + 5, ad[i], 'font-weight="700"');
    if (dik === i) s += dikIsaret(p, q, r);
  });
  esit.forEach(([i, j, n]) => { s += esitIsaret(P[i], P[j], n || 1); });
  return sv(330, 215, s);
}

// Açı şekli: verilen derecede iki ışın, kollar tuval içinde, uçlarda A ve C etiketi.
export function aciSekli({ derece, et, adlar = ["A", "B", "C"] }) {
  const ox = 110, oy = 180, L1 = 165, L2 = 150, a = derece * RAD;
  const x1 = ox + L1, x2 = ox + L2 * Math.cos(a), y2 = oy - L2 * Math.sin(a), yar = 38;
  const yx = ox + yar * Math.cos(a), yy = oy - yar * Math.sin(a), m = a / 2;
  let s = ln(ox, oy, x1, oy, K, 2.4) + ln(ox, oy, x2, y2, K, 2.4);
  s += `<path d="M${ox + yar},${oy} A${yar},${yar} 0 0 0 ${r1(yx)},${r1(yy)}" fill="none" stroke="${V}" stroke-width="2"/>`;
  s += tx(ox + 62 * Math.cos(m), oy - 62 * Math.sin(m) + 4, et, `fill="${V}" font-weight="700"`);
  s += nk(ox, oy, 3) + nk(x1, oy, 3) + nk(x2, y2, 3);
  s += tx(ox, oy + 20, adlar[1], 'font-weight="700"') + tx(x1 + 4, oy + 20, adlar[2], 'font-weight="700"') + tx(x2 + 14 * Math.cos(a), y2 - 14 * Math.sin(a) + 4, adlar[0], 'font-weight="700"');
  return sv(310, 215, s);
}

// Satır satır örüntü: adimlar = [[üstSatırKare, altSatırKare], ...] (soldan hizalı)
export function ornuntuSatir({ adimlar, kutu = 20 }) {
  let s = "", x0 = 14;
  adimlar.forEach((satirlar, i) => {
    const kol = Math.max(...satirlar);
    satirlar.forEach((n, r) => { for (let k = 0; k < n; k++) s += `<rect x="${x0 + k * (kutu + 3)}" y="${24 + r * (kutu + 3)}" width="${kutu}" height="${kutu}" fill="#7fb2e5" stroke="${K}" stroke-width="1.2"/>`; });
    s += tx(x0 + (kol * (kutu + 3)) / 2, 15, `${i + 1}. şekil`, 'font-size="11.5"');
    x0 += kol * (kutu + 3) + 28;
  });
  return sv(x0, 24 + 2 * (kutu + 3) + 8, s);
}

// Eşkenar dörtgen: köşegen uzunlukları cm cinsinden, 17,5 px/cm (dikey d1, yatay d2)
export function eskenarDortgen({ d1, d2, d1Et, d2Et }) {
  const k = 17.5, cx = 160, cy = 105, hx = (d2 * k) / 2, hy = (d1 * k) / 2;
  let s = `<polygon points="${cx},${cy - hy} ${cx + hx},${cy} ${cx},${cy + hy} ${cx - hx},${cy}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>`;
  s += ln(cx, cy - hy, cx, cy + hy, V, 1.8, 'stroke-dasharray="5,4"') + ln(cx - hx, cy, cx + hx, cy, M, 1.8, 'stroke-dasharray="5,4"');
  s += dikIsaret([cx, cy], [cx + 1, cy], [cx, cy - 1], 9);
  s += tx(cx + 8, cy - 18, d1Et, `fill="${V}" font-weight="700" text-anchor="start"`) + tx(cx + 8, cy + 20, d2Et, `fill="${M}" font-weight="700" text-anchor="start"`);
  return sv(320, 210, s);
}

// Paralelkenar: taban ve yükseklik cm, yan kenar cm (kayma √(yan²−yük²)); taban 200 px olacak şekilde ölçekli
export function paralelkenar({ taban, yuk, yan, tEt, yEt, yanEt }) {
  const k = 200 / taban, kayma = Math.sqrt(yan * yan - yuk * yuk) * k, h = yuk * k, x = 50, yb = 30 + h;
  const A = [x, yb], B = [x + 200, yb], C = [x + 200 + kayma, yb - h], D = [x + kayma, yb - h];
  let s = `<polygon points="${[A, B, C, D].map((p) => r1(p[0]) + "," + r1(p[1])).join(" ")}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>`;
  s += ln(D[0], D[1], D[0], yb, V, 1.6, 'stroke-dasharray="5,4"') + dikIsaret([D[0], yb], [D[0] + 1, yb], [D[0], yb - 1], 10);
  s += tx(x + 100, yb + 20, tEt, `fill="${V}" font-weight="700"`) + tx(D[0] + 8, yb - h / 2 + 4, yEt, `fill="${V}" font-weight="700" text-anchor="start"`);
  if (yanEt) s += tx((B[0] + C[0]) / 2 + 8, yb - h / 2 + 4, yanEt, 'font-weight="700" text-anchor="start"');
  return sv(x + 200 + kayma + 70, yb + 40, s);
}

// Tepesi tabana göre konumlanan ölçekli üçgen (taban 240 px); tepe = tabanda x oranı (0..1)
export function ucgenAlan({ taban, yuk, tEt, yEt, tepe = 1 / 3 }) {
  const k = 240 / taban, h = yuk * k, x = 40, yb = 25 + h, tx0 = x + 240 * tepe;
  let s = `<polygon points="${x},${yb} ${x + 240},${yb} ${r1(tx0)},${yb - h}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>`;
  s += ln(tx0, yb - h, tx0, yb, V, 1.6, 'stroke-dasharray="5,4"') + dikIsaret([tx0, yb], [tx0 + 1, yb], [tx0, yb - 1], 10);
  s += tx(x + 120, yb + 20, tEt, `fill="${V}" font-weight="700"`) + tx(tx0 + 8, yb - h / 2 + 4, yEt, `fill="${V}" font-weight="700" text-anchor="start"`);
  return sv(320, yb + 36, s);
}

// Dikdörtgenler prizması (eğik izdüşüm): ön yüz ölçekli (px/cm = k), derinlik yarı ölçekte
export function kutu({ a, b, c, aEt, bEt, cEt, k = 24 }) {
  const W = a * k, H = c * k, dx = b * k * 0.5 * 0.8, dy = -b * k * 0.5 * 0.6, x = 30, y = 30 + H - dy;
  const P = (pts) => pts.map((p) => r1(p[0]) + "," + r1(p[1])).join(" ");
  let s = `<polygon points="${P([[x, y], [x + W, y], [x + W, y - H], [x, y - H]])}" fill="#eaf2fb" stroke="${K}" stroke-width="2.2"/>`;
  s += `<polygon points="${P([[x, y - H], [x + W, y - H], [x + W + dx, y - H + dy], [x + dx, y - H + dy]])}" fill="#d7e8f8" stroke="${K}" stroke-width="2.2"/>`;
  s += `<polygon points="${P([[x + W, y], [x + W + dx, y + dy], [x + W + dx, y - H + dy], [x + W, y - H]])}" fill="#c3dcf2" stroke="${K}" stroke-width="2.2"/>`;
  s += tx(x + W / 2, y + 20, aEt, `fill="${V}" font-weight="700"`) + tx(x + W + dx + 6, y - H / 2 + dy + 4, cEt, `fill="${V}" font-weight="700" text-anchor="start"`) + tx(x + W + dx / 2 + 8, y + dy / 2 + 18, bEt, `fill="${V}" font-weight="700" text-anchor="start"`);
  return sv(x + W + dx + 70, y + 32, s);
}

// Silindir: r etiketi sağ üstte (elipsin dışında), h etiketi sağda
export function silindir({ rEt, hEt, fs = 13 }) {
  const cx = 110, rx = 60, ry = 18, top = 45, bot = 145;
  let s = `<ellipse cx="${cx}" cy="${bot}" rx="${rx}" ry="${ry}" fill="#c3dcf2" stroke="${K}" stroke-width="2.2"/><rect x="${cx - rx}" y="${top}" width="${2 * rx}" height="${bot - top}" fill="#d9e9f8" stroke="none"/><path d="M${cx - rx},${top} L${cx - rx},${bot} M${cx + rx},${top} L${cx + rx},${bot}" stroke="${K}" stroke-width="2.2" fill="none"/><ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="#eaf2fb" stroke="${K}" stroke-width="2.2"/>`;
  s += ln(cx, top, cx + rx, top, V, 1.8) + nk(cx, top, 3, V);
  s += tx(cx + rx + 8, top + 4, rEt, `fill="${V}" font-weight="700" font-size="${fs}" text-anchor="start"`);
  s += tx(cx + rx + 8, (top + bot) / 2 + 24, hEt, `fill="${V}" font-weight="700" font-size="${fs}" text-anchor="start"`);
  s += ln(cx + rx + 3, top + 4, cx + rx + 3, bot - 4, V, 1.2, 'stroke-dasharray="4,3"');
  return sv(290, 190, s);
}
// Koni: h etiketi yükseklik çizgisinin sağında (koni içinde, alt bölgede), r etiketi elipsin altında
export function koni({ rEt, hEt, fs = 12 }) {
  const cx = 150, rx = 96, ry = 22, ap = 20, bot = 150;
  let s = `<path d="M${cx - rx},${bot} L${cx},${ap} L${cx + rx},${bot}" fill="#d9e9f8" stroke="${K}" stroke-width="2.2"/><ellipse cx="${cx}" cy="${bot}" rx="${rx}" ry="${ry}" fill="#c3dcf2" stroke="${K}" stroke-width="2.2"/>`;
  s += ln(cx, ap, cx, bot, V, 1.6, 'stroke-dasharray="5,4"') + ln(cx, bot, cx + rx, bot, V, 1.8) + nk(cx, bot, 3, V);
  s += tx(cx + 6, 108, hEt, `fill="${V}" font-weight="700" font-size="${fs}" text-anchor="start"`);
  s += tx(cx + rx / 2, bot + ry + 17, rEt, `fill="${V}" font-weight="700" font-size="${fs}"`);
  return sv(300, 200, s);
}

// Kare: kenarı ölçekli çizilir; üstte kenar etiketi, içinde alan etiketi
export function kare({ ic, ust }) {
  const x = 80, y = 40, w = 150;
  return sv(310, 220, `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="#eaf2fb" stroke="${K}" stroke-width="2.4"/>` + tx(x + w / 2, y - 10, ust, `fill="${V}" font-weight="700"`) + tx(x + w / 2, y + w / 2 + 5, ic, `fill="${V}" font-weight="700"`));
}
