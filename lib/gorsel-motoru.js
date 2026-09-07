// KAREMUX Gorsel Motoru (7 Eylul) - kural-bazli SVG uretimi. AI SERBESTCE
// CIZMIYOR: sadece "hangi gorsel tipi + hangi parametreler" karar veriyor,
// gercek SVG'yi bu dosyadaki SAF, matematiksel olarak DOGRU fonksiyonlar
// ciziyor. Boylece geometri/grafik gorselleri her zaman dogru olur.

const RENK = { cizgi: "#1B2430", vurgu: "#E8503F", ikincil: "#3DA35D", nokta: "#E8B339", metin: "#1B2430", soluk: "#8A968E" };

// AI'dan gelen etiket metinleri SVG'ye ham yerlestiriliyor - enjeksiyon
// riskine karsi (< > " ' &) kacis. Sayisal/boolean parametreler bu
// fonksiyondan gecmez, sadece kullanici/AI kaynakli metin etiketleri gecer.
function kacis(deger) {
  if (deger === null || deger === undefined) return "";
  return String(deger)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function svgSar(icerik, genislik = 320, yukseklik = 240, viewBox = null) {
  const vb = viewBox || `0 0 ${genislik} ${yukseklik}`;
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:280px;font-family:system-ui,sans-serif">${icerik}</svg>`;
}

// ===================== GEOMETRI =====================

export function ucgenCiz({ a, b, c, kenarEtiketleri, aciEtiketleri, vurgulananKose } = {}) {
  let A = { x: 40, y: 200 }, B = { x: 260, y: 200 }, C = { x: 150, y: 40 };
  if (a && b && c && a > 0 && b > 0 && c > 0) {
    const olcek = 180 / Math.max(a, b, c);
    const aS = a * olcek, bS = b * olcek, cS = c * olcek;
    const cosB = (aS * aS + cS * cS - bS * bS) / (2 * aS * cS);
    const acB = Math.acos(Math.max(-1, Math.min(1, cosB)));
    const Ax = aS * Math.cos(acB), Ay = -aS * Math.sin(acB);
    B = { x: 60, y: 200 }; C = { x: 60 + cS, y: 200 }; A = { x: 60 + Ax, y: 200 + Ay };
  }
  const kenarOrta = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
  const abOrta = kenarOrta(A, B), bcOrta = kenarOrta(B, C), acOrta = kenarOrta(A, C);

  let icerik = `<polygon points="${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}" fill="none" stroke="${RENK.cizgi}" stroke-width="2.5" stroke-linejoin="round"/>`;
  icerik += `<text x="${A.x}" y="${A.y - 10}" text-anchor="middle" font-weight="700" font-size="14">A</text>`;
  icerik += `<text x="${B.x - 12}" y="${B.y + 18}" text-anchor="middle" font-weight="700" font-size="14">B</text>`;
  icerik += `<text x="${C.x + 12}" y="${C.y + 18}" text-anchor="middle" font-weight="700" font-size="14">C</text>`;

  if (kenarEtiketleri) {
    if (kenarEtiketleri.ab) icerik += `<text x="${abOrta.x - 14}" y="${abOrta.y}" fill="${RENK.vurgu}" font-size="12.5" font-weight="600">${kacis(kenarEtiketleri.ab)}</text>`;
    if (kenarEtiketleri.bc) icerik += `<text x="${bcOrta.x}" y="${bcOrta.y + 20}" text-anchor="middle" fill="${RENK.vurgu}" font-size="12.5" font-weight="600">${kacis(kenarEtiketleri.bc)}</text>`;
    if (kenarEtiketleri.ac) icerik += `<text x="${acOrta.x + 14}" y="${acOrta.y}" fill="${RENK.vurgu}" font-size="12.5" font-weight="600">${kacis(kenarEtiketleri.ac)}</text>`;
  }
  if (aciEtiketleri) {
    if (aciEtiketleri.a) icerik += `<text x="${A.x}" y="${A.y + 22}" text-anchor="middle" fill="${RENK.ikincil}" font-size="11.5">${kacis(aciEtiketleri.a)}</text>`;
    if (aciEtiketleri.b) icerik += `<text x="${B.x + 24}" y="${B.y - 8}" fill="${RENK.ikincil}" font-size="11.5">${kacis(aciEtiketleri.b)}</text>`;
    if (aciEtiketleri.c) icerik += `<text x="${C.x - 24}" y="${C.y - 8}" text-anchor="end" fill="${RENK.ikincil}" font-size="11.5">${kacis(aciEtiketleri.c)}</text>`;
  }
  if (vurgulananKose) {
    const nokta = { A, B, C }[vurgulananKose];
    if (nokta) icerik += `<circle cx="${nokta.x}" cy="${nokta.y}" r="5" fill="${RENK.nokta}"/>`;
  }
  return svgSar(icerik, 320, 240);
}

export function dortgenCiz({ tip = "dikdortgen", genislikDeger, yukseklikDeger, kenarEtiketleri } = {}) {
  const kenar = 220, yuks = tip === "kare" ? 160 : 140;
  const x0 = 50, y0 = 40;
  let icerik = `<rect x="${x0}" y="${y0}" width="${kenar}" height="${yuks}" fill="none" stroke="${RENK.cizgi}" stroke-width="2.5"/>`;
  const ustEtiket = kenarEtiketleri?.ust || genislikDeger || "";
  const solEtiket = kenarEtiketleri?.sol || yukseklikDeger || "";
  if (ustEtiket) icerik += `<text x="${x0 + kenar / 2}" y="${y0 - 10}" text-anchor="middle" fill="${RENK.vurgu}" font-size="13" font-weight="600">${kacis(ustEtiket)}</text>`;
  if (solEtiket) icerik += `<text x="${x0 - 12}" y="${y0 + yuks / 2}" text-anchor="end" fill="${RENK.vurgu}" font-size="13" font-weight="600">${kacis(solEtiket)}</text>`;
  return svgSar(icerik, 320, 220);
}

export function cemberCiz({ yaricapEtiketi, capGoster, kirisGoster } = {}) {
  const cx = 160, cy = 120, r = 90;
  let icerik = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${RENK.cizgi}" stroke-width="2.5"/>`;
  icerik += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${RENK.cizgi}"/>`;
  if (yaricapEtiketi) {
    icerik += `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${RENK.vurgu}" stroke-width="2"/>`;
    icerik += `<text x="${cx + r / 2}" y="${cy - 8}" text-anchor="middle" fill="${RENK.vurgu}" font-size="13" font-weight="600">${kacis(yaricapEtiketi)}</text>`;
  }
  if (capGoster) {
    icerik += `<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${RENK.ikincil}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  }
  return svgSar(icerik, 320, 240);
}

export function aciCiz({ derece = 60, etiket } = {}) {
  const ox = 60, oy = 200, uzunluk = 200;
  const radyan = (derece * Math.PI) / 180;
  const x2 = ox + uzunluk * Math.cos(radyan), y2 = oy - uzunluk * Math.sin(radyan);
  let icerik = `<line x1="${ox}" y1="${oy}" x2="${ox + uzunluk}" y2="${oy}" stroke="${RENK.cizgi}" stroke-width="2.5"/>`;
  icerik += `<line x1="${ox}" y1="${oy}" x2="${x2}" y2="${y2}" stroke="${RENK.cizgi}" stroke-width="2.5"/>`;
  const yayR = 40;
  const buyukMu = derece > 180 ? 1 : 0;
  const yayX = ox + yayR * Math.cos(radyan), yayY = oy - yayR * Math.sin(radyan);
  icerik += `<path d="M ${ox + yayR} ${oy} A ${yayR} ${yayR} 0 ${buyukMu} 0 ${yayX} ${yayY}" fill="none" stroke="${RENK.vurgu}" stroke-width="2"/>`;
  icerik += `<text x="${ox + yayR + 20}" y="${oy - 14}" fill="${RENK.vurgu}" font-size="13" font-weight="600">${kacis(etiket || derece + "°")}</text>`;
  icerik += `<circle cx="${ox}" cy="${oy}" r="3" fill="${RENK.cizgi}"/>`;
  return svgSar(icerik, 320, 220);
}

export function cokgenCiz({ kenarSayisi = 5, etiket } = {}) {
  const cx = 160, cy = 120, r = 90;
  const noktalar = [];
  for (let i = 0; i < kenarSayisi; i++) {
    const aci = (Math.PI * 2 * i) / kenarSayisi - Math.PI / 2;
    noktalar.push(`${cx + r * Math.cos(aci)},${cy + r * Math.sin(aci)}`);
  }
  let icerik = `<polygon points="${noktalar.join(" ")}" fill="none" stroke="${RENK.cizgi}" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (etiket) icerik += `<text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${RENK.soluk}" font-size="12">${kacis(etiket)}</text>`;
  return svgSar(icerik, 320, 240);
}

// ===================== SAYI / CEBIR =====================

export function sayiDogrusuCiz({ min = -5, max = 5, noktalar = [] } = {}) {
  const x0 = 30, x1 = 290, y = 100;
  const olcek = (deger) => x0 + ((deger - min) / (max - min)) * (x1 - x0);
  let icerik = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${RENK.cizgi}" stroke-width="2"/>`;
  icerik += `<polygon points="${x1},${y} ${x1 - 8},${y - 4} ${x1 - 8},${y + 4}" fill="${RENK.cizgi}"/>`;
  for (let i = min; i <= max; i++) {
    const x = olcek(i);
    icerik += `<line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="${RENK.cizgi}" stroke-width="1.5"/>`;
    icerik += `<text x="${x}" y="${y + 22}" text-anchor="middle" font-size="11" fill="${RENK.soluk}">${i}</text>`;
  }
  noktalar.forEach((n) => {
    const x = olcek(n.deger);
    icerik += `<circle cx="${x}" cy="${y}" r="6" fill="${n.doluMu === false ? "#fff" : RENK.vurgu}" stroke="${RENK.vurgu}" stroke-width="2"/>`;
    if (n.etiket) icerik += `<text x="${x}" y="${y - 14}" text-anchor="middle" font-size="12" font-weight="600" fill="${RENK.vurgu}">${kacis(n.etiket)}</text>`;
  });
  return svgSar(icerik, 320, 140);
}

export function koordinatDuzlemiCiz({ fonksiyonTipi, katsayilar = {}, noktalar = [], araliK = 6 } = {}) {
  const cx = 160, cy = 120, birim = 20;
  const olcekX = (x) => cx + x * birim;
  const olcekY = (y) => cy - y * birim;
  let icerik = "";
  icerik += `<line x1="20" y1="${cy}" x2="300" y2="${cy}" stroke="${RENK.soluk}" stroke-width="1.5"/>`;
  icerik += `<line x1="${cx}" y1="20" x2="${cx}" y2="220" stroke="${RENK.soluk}" stroke-width="1.5"/>`;
  icerik += `<polygon points="300,${cy} 292,${cy - 4} 292,${cy + 4}" fill="${RENK.soluk}"/>`;
  icerik += `<polygon points="${cx},20 ${cx - 4},28 ${cx + 4},28" fill="${RENK.soluk}"/>`;
  for (let i = -araliK; i <= araliK; i++) {
    if (i === 0) continue;
    icerik += `<line x1="${olcekX(i)}" y1="${cy - 3}" x2="${olcekX(i)}" y2="${cy + 3}" stroke="${RENK.soluk}" stroke-width="1"/>`;
  }
  if (fonksiyonTipi === "dogrusal") {
    const { m = 1, n = 0 } = katsayilar;
    const x1 = -araliK, x2 = araliK;
    icerik += `<line x1="${olcekX(x1)}" y1="${olcekY(m * x1 + n)}" x2="${olcekX(x2)}" y2="${olcekY(m * x2 + n)}" stroke="${RENK.vurgu}" stroke-width="2.5"/>`;
  } else if (fonksiyonTipi === "karesel") {
    const { a = 1, b = 0, c = 0 } = katsayilar;
    let yol = "";
    for (let xi = -araliK; xi <= araliK; xi += 0.2) {
      const yi = a * xi * xi + b * xi + c;
      const px = olcekX(xi), py = olcekY(yi);
      yol += (xi === -araliK ? "M" : "L") + `${px},${py} `;
    }
    icerik += `<path d="${yol}" fill="none" stroke="${RENK.vurgu}" stroke-width="2.5"/>`;
  }
  noktalar.forEach((n) => {
    icerik += `<circle cx="${olcekX(n.x)}" cy="${olcekY(n.y)}" r="4" fill="${RENK.nokta}"/>`;
    if (n.etiket) icerik += `<text x="${olcekX(n.x) + 8}" y="${olcekY(n.y) - 6}" font-size="11" font-weight="600">${kacis(n.etiket)}</text>`;
  });
  return svgSar(icerik, 320, 240);
}

// ===================== ISTATISTIK =====================

export function cizgiGrafigiCiz({ veriler = [], etiketler = [] } = {}) {
  const genislik = 300, yukseklik = 160, kenar = 30;
  const maxDeger = Math.max(...veriler, 1);
  const adim = (genislik - kenar * 2) / Math.max(1, veriler.length - 1);
  const noktalar = veriler.map((v, i) => ({ x: kenar + i * adim, y: yukseklik - kenar - (v / maxDeger) * (yukseklik - kenar * 2) }));
  const yol = noktalar.map((n, i) => `${i === 0 ? "M" : "L"}${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(" ");
  let icerik = `<line x1="${kenar}" y1="${yukseklik - kenar}" x2="${genislik - 10}" y2="${yukseklik - kenar}" stroke="${RENK.soluk}" stroke-width="1.5"/>`;
  icerik += `<path d="${yol}" fill="none" stroke="${RENK.vurgu}" stroke-width="2.5"/>`;
  noktalar.forEach((n, i) => {
    icerik += `<circle cx="${n.x}" cy="${n.y}" r="4" fill="${RENK.vurgu}"/>`;
    if (etiketler[i]) icerik += `<text x="${n.x}" y="${yukseklik - 10}" text-anchor="middle" font-size="10" fill="${RENK.soluk}">${kacis(etiketler[i])}</text>`;
  });
  return svgSar(icerik, genislik, yukseklik);
}

export function sutunGrafigiCiz({ veriler = [], etiketler = [] } = {}) {
  const genislik = 300, yukseklik = 180, kenar = 30, aralik = 10;
  const maxDeger = Math.max(...veriler, 1);
  const genGenislik = (genislik - kenar * 2 - aralik * (veriler.length - 1)) / veriler.length;
  let icerik = `<line x1="${kenar}" y1="${yukseklik - kenar}" x2="${genislik - 10}" y2="${yukseklik - kenar}" stroke="${RENK.soluk}" stroke-width="1.5"/>`;
  veriler.forEach((v, i) => {
    const h = (v / maxDeger) * (yukseklik - kenar * 2 - 10);
    const x = kenar + i * (genGenislik + aralik);
    const y = yukseklik - kenar - h;
    icerik += `<rect x="${x}" y="${y}" width="${genGenislik}" height="${h}" fill="${RENK.vurgu}" rx="3"/>`;
    icerik += `<text x="${x + genGenislik / 2}" y="${y - 5}" text-anchor="middle" font-size="10.5" font-weight="600">${v}</text>`;
    if (etiketler[i]) icerik += `<text x="${x + genGenislik / 2}" y="${yukseklik - 10}" text-anchor="middle" font-size="10" fill="${RENK.soluk}">${kacis(etiketler[i])}</text>`;
  });
  return svgSar(icerik, genislik, yukseklik);
}

export function pastaGrafigiCiz({ veriler = [], etiketler = [] } = {}) {
  const cx = 130, cy = 120, r = 90;
  const toplam = veriler.reduce((t, v) => t + v, 0) || 1;
  const renkler = [RENK.vurgu, RENK.ikincil, RENK.nokta, "#7C6FE0", "#4A9FE8", "#E86FA8"];
  let baslangicAci = -Math.PI / 2;
  let icerik = "";
  veriler.forEach((v, i) => {
    const oran = v / toplam;
    const bitisAci = baslangicAci + oran * Math.PI * 2;
    const x1 = cx + r * Math.cos(baslangicAci), y1 = cy + r * Math.sin(baslangicAci);
    const x2 = cx + r * Math.cos(bitisAci), y2 = cy + r * Math.sin(bitisAci);
    const buyukMu = oran > 0.5 ? 1 : 0;
    icerik += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${buyukMu} 1 ${x2},${y2} Z" fill="${renkler[i % renkler.length]}" stroke="#fff" stroke-width="1.5"/>`;
    baslangicAci = bitisAci;
  });
  let legendY = 20;
  icerik += veriler.map((v, i) => {
    const satir = `<rect x="240" y="${legendY - 9}" width="10" height="10" fill="${renkler[i % renkler.length]}"/><text x="255" y="${legendY}" font-size="10.5">${kacis(etiketler[i] || "")} (%${Math.round((v / toplam) * 100)})</text>`;
    legendY += 18;
    return satir;
  }).join("");
  return svgSar(icerik, 320, 240);
}

// ===================== FEN SEMALARI (sabit, elle hazirlanmis) =====================

const FEN_SEMALARI = {
  su_dongusu: svgSar(`
    <text x="160" y="20" text-anchor="middle" font-size="12" font-weight="700">Su Döngüsü</text>
    <path d="M40,180 Q80,60 160,50 Q240,60 280,180" fill="none" stroke="${RENK.cizgi}" stroke-width="2"/>
    <text x="160" y="45" text-anchor="middle" font-size="10">Yoğunlaşma</text>
    <path d="M60,180 L60,140" stroke="${RENK.ikincil}" stroke-width="2"/>
    <text x="60" y="130" text-anchor="middle" font-size="10">Buharlaşma</text>
    <path d="M260,60 L260,120" stroke="${RENK.vurgu}" stroke-width="2"/>
    <text x="260" y="135" text-anchor="middle" font-size="10">Yağış</text>
    <rect x="20" y="180" width="280" height="30" fill="#B8D8F0"/>
    <text x="160" y="200" text-anchor="middle" font-size="11">Deniz / Göl</text>
  `, 320, 220),
  gunes_sistemi: svgSar(`
    <text x="160" y="20" text-anchor="middle" font-size="12" font-weight="700">Güneş Sistemi (sıralama)</text>
    <circle cx="30" cy="120" r="16" fill="${RENK.nokta}"/>
    <circle cx="70" cy="120" r="4" fill="${RENK.soluk}"/><text x="70" y="140" text-anchor="middle" font-size="8">Merkür</text>
    <circle cx="100" cy="120" r="5" fill="#E8A05C"/><text x="100" y="140" text-anchor="middle" font-size="8">Venüs</text>
    <circle cx="135" cy="120" r="5" fill="#4A9FE8"/><text x="135" y="140" text-anchor="middle" font-size="8">Dünya</text>
    <circle cx="170" cy="120" r="4" fill="${RENK.vurgu}"/><text x="170" y="140" text-anchor="middle" font-size="8">Mars</text>
    <circle cx="215" cy="120" r="10" fill="#D9A066"/><text x="215" y="140" text-anchor="middle" font-size="8">Jüpiter</text>
    <circle cx="260" cy="120" r="9" fill="#E8D4A0"/><text x="260" y="140" text-anchor="middle" font-size="8">Satürn</text>
  `, 320, 160),
  elektrik_devresi: svgSar(`
    <text x="160" y="20" text-anchor="middle" font-size="12" font-weight="700">Basit Elektrik Devresi</text>
    <rect x="40" y="80" width="240" height="100" fill="none" stroke="${RENK.cizgi}" stroke-width="2.5"/>
    <line x1="130" y1="80" x2="130" y2="60" stroke="${RENK.cizgi}" stroke-width="2.5"/>
    <line x1="190" y1="80" x2="190" y2="60" stroke="${RENK.cizgi}" stroke-width="2.5"/>
    <line x1="115" y1="70" x2="145" y2="70" stroke="${RENK.cizgi}" stroke-width="4"/>
    <line x1="122" y1="60" x2="122" y2="80" stroke="${RENK.cizgi}" stroke-width="2"/>
    <line x1="183" y1="55" x2="197" y2="65" stroke="${RENK.cizgi}" stroke-width="2"/>
    <text x="160" y="55" text-anchor="middle" font-size="9">Pil</text>
    <circle cx="160" cy="180" r="14" fill="none" stroke="${RENK.vurgu}" stroke-width="2.5"/>
    <text x="160" y="185" text-anchor="middle" font-size="9">×</text>
    <text x="160" y="205" text-anchor="middle" font-size="9">Ampul</text>
  `, 320, 220),
  hucre_yapisi: svgSar(`
    <text x="160" y="20" text-anchor="middle" font-size="12" font-weight="700">Hayvan Hücresi (basit)</text>
    <ellipse cx="160" cy="120" rx="130" ry="85" fill="#F5F0E8" stroke="${RENK.cizgi}" stroke-width="2"/>
    <circle cx="160" cy="120" r="35" fill="#D8C8E8" stroke="${RENK.cizgi}" stroke-width="1.5"/>
    <text x="160" y="124" text-anchor="middle" font-size="9">Çekirdek</text>
    <ellipse cx="90" cy="90" rx="18" ry="8" fill="#F0D8A8" stroke="${RENK.cizgi}" stroke-width="1"/>
    <text x="90" y="75" text-anchor="middle" font-size="7">Mitokondri</text>
    <ellipse cx="230" cy="150" rx="14" ry="10" fill="#B8E0D8" stroke="${RENK.cizgi}" stroke-width="1"/>
    <text x="230" y="170" text-anchor="middle" font-size="7">Golgi</text>
  `, 320, 220),
  sindirim_sistemi: svgSar(`
    <text x="160" y="20" text-anchor="middle" font-size="12" font-weight="700">Sindirim Sistemi (basit)</text>
    <circle cx="160" cy="40" r="16" fill="none" stroke="${RENK.cizgi}" stroke-width="2"/><text x="160" y="44" text-anchor="middle" font-size="8">Ağız</text>
    <line x1="160" y1="56" x2="160" y2="90" stroke="${RENK.cizgi}" stroke-width="3"/><text x="195" y="75" font-size="8">Yemek Borusu</text>
    <ellipse cx="150" cy="120" rx="35" ry="25" fill="#F0D8C8" stroke="${RENK.cizgi}" stroke-width="2"/><text x="150" y="124" text-anchor="middle" font-size="8">Mide</text>
    <path d="M150,145 Q100,180 140,200 Q180,215 220,190 Q250,170 200,150" fill="none" stroke="${RENK.cizgi}" stroke-width="2.5"/>
    <text x="180" y="230" text-anchor="middle" font-size="8">Bağırsaklar</text>
  `, 320, 240),
};

export function fenSemasiGetir(anahtar) {
  return FEN_SEMALARI[anahtar] || null;
}

export const FEN_SEMASI_ANAHTARLARI = Object.keys(FEN_SEMALARI);

// ===================== MERKEZI DAGITICI =====================

export function gorselUret(gorselTipi, parametreler = {}) {
  try {
    switch (gorselTipi) {
      case "ucgen": return ucgenCiz(parametreler);
      case "dortgen": return dortgenCiz(parametreler);
      case "cember": return cemberCiz(parametreler);
      case "aci": return aciCiz(parametreler);
      case "cokgen": return cokgenCiz(parametreler);
      case "sayi_dogrusu": return sayiDogrusuCiz(parametreler);
      case "koordinat_duzlemi": return koordinatDuzlemiCiz(parametreler);
      case "cizgi_grafigi": return cizgiGrafigiCiz(parametreler);
      case "sutun_grafigi": return sutunGrafigiCiz(parametreler);
      case "pasta_grafigi": return pastaGrafigiCiz(parametreler);
      case "fen_semasi": return fenSemasiGetir(parametreler.anahtar);
      default: return null;
    }
  } catch (e) {
    console.error("Gorsel uretilemedi:", gorselTipi, e);
    return null;
  }
}
