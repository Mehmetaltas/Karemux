// Yazılı kâğıtları için saf SVG şekilleri (negatif değerli çizgi grafiği, sütun grafiği, hesap makinesi, kartlar vb.).
// Tüm sayılar çağıran tarafından verilir; burada veri uydurulmaz.
import { kacis } from "./render.js";

const F = 'font-family="Helvetica, Arial, sans-serif"';

export function cizgiGrafik({ etiketler, degerler, min, max, adim = 1, birim = "°C", genislik = 520, yukseklik = 250, renk = "#4A78AD", yBaslik = "" }) {
  const sol = 56, sag = 24, ust = 24, alt = 40;
  const w = genislik - sol - sag, h = yukseklik - ust - alt;
  const y = (v) => ust + h - ((v - min) / (max - min)) * h;
  const x = (i) => sol + (w * (i + 0.5)) / etiketler.length;
  let s = `<svg viewBox="0 0 ${genislik} ${yukseklik}" xmlns="http://www.w3.org/2000/svg" ${F}>`;
  for (let v = min; v <= max + 1e-9; v += adim) {
    const yy = y(v);
    s += `<line x1="${sol}" y1="${yy}" x2="${sol + w}" y2="${yy}" stroke="${v === 0 ? "#111" : "#d4d4d4"}" stroke-width="${v === 0 ? 1.6 : 0.8}"/>`;
    s += `<text x="${sol - 8}" y="${yy + 4}" text-anchor="end" font-size="12">${String(v).replace("-", "−")}</text>`;
  }
  s += `<line x1="${sol}" y1="${ust}" x2="${sol}" y2="${ust + h}" stroke="#111" stroke-width="1.4"/>`;
  if (yBaslik) s += `<text x="12" y="${ust + h / 2}" font-size="12" transform="rotate(-90 12 ${ust + h / 2})" text-anchor="middle">${kacis(yBaslik)}</text>`;
  s += `<polyline fill="none" stroke="${renk}" stroke-width="2.6" points="${degerler.map((v, i) => `${x(i)},${y(v)}`).join(" ")}"/>`;
  degerler.forEach((v, i) => {
    s += `<circle cx="${x(i)}" cy="${y(v)}" r="5" fill="${renk}" stroke="#fff" stroke-width="1.6"/>`;
    s += `<text x="${x(i)}" y="${y(v) + (v >= 0 ? -10 : 18)}" text-anchor="middle" font-size="12" font-weight="700">${String(v).replace("-", "−")}${birim}</text>`;
    s += `<text x="${x(i)}" y="${ust + h + 22}" text-anchor="middle" font-size="12.5">${kacis(etiketler[i])}</text>`;
  });
  return s + "</svg>";
}

export function sutunGrafik({ etiketler, degerler, max, adim, genislik = 520, yukseklik = 240, renk = "#9B6BB0", yBaslik = "", degerYaz = true }) {
  const sol = 58, sag = 20, ust = 22, alt = 44;
  const w = genislik - sol - sag, h = yukseklik - ust - alt;
  const y = (v) => ust + h - (v / max) * h;
  let s = `<svg viewBox="0 0 ${genislik} ${yukseklik}" xmlns="http://www.w3.org/2000/svg" ${F}>`;
  for (let v = 0; v <= max + 1e-9; v += adim) {
    s += `<line x1="${sol}" y1="${y(v)}" x2="${sol + w}" y2="${y(v)}" stroke="${v === 0 ? "#111" : "#d9d9d9"}" stroke-width="${v === 0 ? 1.6 : 0.8}"/><text x="${sol - 8}" y="${y(v) + 4}" text-anchor="end" font-size="12">${v}</text>`;
  }
  s += `<line x1="${sol}" y1="${ust}" x2="${sol}" y2="${ust + h}" stroke="#111" stroke-width="1.4"/>`;
  if (yBaslik) s += `<text x="12" y="${ust + h / 2}" font-size="11.5" transform="rotate(-90 12 ${ust + h / 2})" text-anchor="middle">${kacis(yBaslik)}</text>`;
  const bw = (w / etiketler.length) * 0.56;
  degerler.forEach((v, i) => {
    const cx = sol + (w / etiketler.length) * (i + 0.5);
    s += `<rect x="${cx - bw / 2}" y="${y(v)}" width="${bw}" height="${ust + h - y(v)}" fill="${renk}" rx="2"/>`;
    if (degerYaz) s += `<text x="${cx}" y="${y(v) - 6}" text-anchor="middle" font-size="12" font-weight="700">${v}</text>`;
    s += `<text x="${cx}" y="${ust + h + 20}" text-anchor="middle" font-size="12.5">${kacis(etiketler[i])}</text>`;
  });
  return s + "</svg>";
}

// Hesap makinesi ekranı (yalnızca görüntü): ekran metni çağıran tarafından verilir.
export function hesapMakinesi(ekran, renk = "#1f3a5f") {
  const tus = ["C", "√", "÷", "×", "7", "8", "9", "−", "4", "5", "6", "+", "1", "2", "3", ","];
  let s = `<svg viewBox="0 0 220 292" xmlns="http://www.w3.org/2000/svg" ${F}><rect x="2" y="2" width="216" height="288" rx="16" fill="${renk}"/><rect x="14" y="14" width="192" height="40" rx="8" fill="#2c5282"/><text x="198" y="42" text-anchor="end" font-size="19" fill="#fff" font-weight="600">${kacis(ekran)}</text>`;
  tus.forEach((k, i) => {
    const cx = 14 + (i % 4) * 49, cy = 66 + Math.floor(i / 4) * 42;
    s += `<rect x="${cx}" y="${cy}" width="43" height="35" rx="7" fill="${k === "C" ? "#e5e7eb" : "#2f5d94"}"/><text x="${cx + 21.5}" y="${cy + 24}" text-anchor="middle" font-size="17" fill="${k === "C" ? "#111" : "#fff"}">${k}</text>`;
  });
  s += `<rect x="14" y="236" width="43" height="35" rx="7" fill="#2f5d94"/><text x="35.5" y="260" text-anchor="middle" font-size="17" fill="#fff">0</text><rect x="63" y="236" width="143" height="35" rx="7" fill="#22a05a"/><text x="134" y="260" text-anchor="middle" font-size="19" fill="#fff">=</text>`;
  return s + "</svg>";
}

// Etiketli kartlar (ör. yıldızın yaşam evreleri karışık sırada). kartlar: [{harf, metin}]
export function kartSirasi(kartlar, { genislik = 540, renk = "#9B6BB0" } = {}) {
  const n = kartlar.length, aralik = 10, kw = (genislik - aralik * (n - 1)) / n, kh = 74;
  let s = `<svg viewBox="0 0 ${genislik} ${kh + 6}" xmlns="http://www.w3.org/2000/svg" ${F}>`;
  kartlar.forEach((k, i) => {
    const x = i * (kw + aralik);
    s += `<rect x="${x}" y="3" width="${kw}" height="${kh}" rx="9" fill="#F0E6F4" stroke="${renk}" stroke-width="1.6"/><circle cx="${x + 16}" cy="20" r="11" fill="${renk}"/><text x="${x + 16}" y="25" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">${kacis(k.harf)}</text>`;
    const parcalar = String(k.metin).split("\n");
    parcalar.forEach((p, j) => { s += `<text x="${x + kw / 2}" y="${48 + j * 15}" text-anchor="middle" font-size="12.5">${kacis(p)}</text>`; });
  });
  return s + "</svg>";
}

// Kesirli sayı doğrusu: [min,max] arası, her birim `bolme` parçaya bölünmüş; noktalar [{deger, etiket}]
export function bolmeliSayiDogrusu({ min, max, bolme = 4, noktalar = [], genislik = 540, tamEtiketler = true, kesirEtiket = false }) {
  const x0 = 28, x1 = genislik - 28, y = 64;
  const ox = (v) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  let s = `<svg viewBox="0 0 ${genislik} 120" xmlns="http://www.w3.org/2000/svg" ${F}><line x1="${x0 - 10}" y1="${y}" x2="${x1 + 10}" y2="${y}" stroke="#111" stroke-width="2"/><polygon points="${x1 + 10},${y} ${x1 + 2},${y - 4} ${x1 + 2},${y + 4}" fill="#111"/><polygon points="${x0 - 10},${y} ${x0 - 2},${y - 4} ${x0 - 2},${y + 4}" fill="#111"/>`;
  for (let i = min * bolme; i <= max * bolme; i++) {
    const v = i / bolme, tam = i % bolme === 0, xx = ox(v);
    s += `<line x1="${xx}" y1="${y - (tam ? 8 : 5)}" x2="${xx}" y2="${y + (tam ? 8 : 5)}" stroke="#111" stroke-width="${tam ? 1.8 : 1}"/>`;
    if (tam && (Array.isArray(tamEtiketler) ? tamEtiketler.includes(v) : tamEtiketler)) s += `<text x="${xx}" y="${y + 26}" text-anchor="middle" font-size="13">${String(v).replace("-", "−")}</text>`;
  }
  noktalar.forEach((p) => { const xx = ox(p.deger); s += `<circle cx="${xx}" cy="${y}" r="6.5" fill="#E8503F" stroke="#fff" stroke-width="1.5"/>` + (p.etiket ? `<text x="${xx}" y="${y - 16}" text-anchor="middle" font-size="14" font-weight="700" fill="#B3392B">${kacis(p.etiket)}</text>` : ""); });
  return s + "</svg>";
}
