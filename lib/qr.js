// Bagimsiz, kucuk QR uretici (bayt modu, hata duzeltme M, surum 1-10, maske 0).
// Disariya istek atmaz, kutuphane gerektirmez; veri tarayiciya disaridan sizmaz.
// Cikti: qrMatris(metin) -> boolean[][] (true = koyu modul), en fazla ~213 bayt.

const ECC_BLOK = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26]; // M: blok basina ECC bayti (surum 1..10)
const BLOK_SAYI = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5]; // M: blok sayisi

function hamModulSayisi(v) {
  let r = (16 * v + 128) * v + 64;
  if (v >= 2) {
    const n = Math.floor(v / 7) + 2;
    r -= (25 * n - 10) * n - 55;
    if (v >= 7) r -= 36;
  }
  return r;
}
const veriBayti = (v) => Math.floor(hamModulSayisi(v) / 8) - ECC_BLOK[v - 1] * BLOK_SAYI[v - 1];

// GF(256) carpimi (x^8+x^4+x^3+x^2+1)
function gfCarp(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}
function reedSolomonBolen(derece) {
  const r = new Array(derece).fill(0);
  r[derece - 1] = 1;
  let kok = 1;
  for (let i = 0; i < derece; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = gfCarp(r[j], kok);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    kok = gfCarp(kok, 2);
  }
  return r;
}
function reedSolomonKalan(veri, bolen) {
  const r = new Array(bolen.length).fill(0);
  for (const b of veri) {
    const f = b ^ r.shift();
    r.push(0);
    bolen.forEach((k, i) => { r[i] ^= gfCarp(k, f); });
  }
  return r;
}

export function qrMatris(metin) {
  const bytes = Array.from(new TextEncoder().encode(metin));
  let ver = 1;
  for (; ver <= 10; ver++) {
    const sayiBit = ver < 10 ? 8 : 16;
    if (4 + sayiBit + bytes.length * 8 <= veriBayti(ver) * 8) break;
  }
  if (ver > 10) throw new Error("QR icin metin cok uzun");

  // --- bit akisi ---
  const bits = [];
  const ekle = (deger, n) => { for (let i = n - 1; i >= 0; i--) bits.push((deger >>> i) & 1); };
  ekle(4, 4);
  ekle(bytes.length, ver < 10 ? 8 : 16);
  bytes.forEach((b) => ekle(b, 8));
  const kapasiteBit = veriBayti(ver) * 8;
  ekle(0, Math.min(4, kapasiteBit - bits.length));
  while (bits.length % 8) bits.push(0);
  for (let p = 0xec; bits.length < kapasiteBit; p ^= 0xec ^ 0x11) ekle(p, 8);
  const veri = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    veri.push(b);
  }

  // --- bloklara bol + ECC + araya ekle ---
  const nBlok = BLOK_SAYI[ver - 1];
  const eccLen = ECC_BLOK[ver - 1];
  const hamBayt = Math.floor(hamModulSayisi(ver) / 8);
  const kisaBlok = Math.floor(hamBayt / nBlok);
  const kisaSayi = nBlok - (hamBayt % nBlok);
  const bolen = reedSolomonBolen(eccLen);
  const bloklar = [];
  for (let i = 0, k = 0; i < nBlok; i++) {
    const uz = kisaBlok - eccLen + (i < kisaSayi ? 0 : 1);
    const d = veri.slice(k, k + uz);
    k += uz;
    const e = reedSolomonKalan(d, bolen);
    if (i < kisaSayi) d.push(0);
    bloklar.push(d.concat(e));
  }
  const tum = [];
  for (let i = 0; i < bloklar[0].length; i++) {
    bloklar.forEach((b, j) => { if (i !== kisaBlok - eccLen || j >= kisaSayi) tum.push(b[i]); });
  }

  // --- matris ---
  const n = ver * 4 + 17;
  const mod = Array.from({ length: n }, () => new Array(n).fill(false));
  const fn = Array.from({ length: n }, () => new Array(n).fill(false));
  const koy = (x, y, d) => { mod[y][x] = d; fn[y][x] = true; };

  for (let i = 0; i < n; i++) { koy(6, i, i % 2 === 0); koy(i, 6, i % 2 === 0); }
  const bulucu = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      const x = cx + dx, y = cy + dy;
      if (x >= 0 && x < n && y >= 0 && y < n) koy(x, y, d !== 2 && d !== 4);
    }
  };
  bulucu(3, 3); bulucu(n - 4, 3); bulucu(3, n - 4);
  if (ver > 1) {
    const sayi = Math.floor(ver / 7) + 2;
    const adim = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (sayi * 2 - 2)) * 2;
    const poz = [6];
    for (let p = n - 7; poz.length < sayi; p -= adim) poz.splice(1, 0, p);
    for (let a = 0; a < poz.length; a++) for (let b = 0; b < poz.length; b++) {
      if ((a === 0 && b === 0) || (a === 0 && b === poz.length - 1) || (a === poz.length - 1 && b === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) koy(poz[a] + dx, poz[b] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
  // bicim bitleri (ECC M = 0b00, maske 0)
  {
    const veriBit = (0 << 3) | 0;
    let rem = veriBit;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bicim = ((veriBit << 10) | rem) ^ 0x5412;
    const bit = (i) => ((bicim >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) koy(8, i, bit(i));
    koy(8, 7, bit(6)); koy(8, 8, bit(7)); koy(7, 8, bit(8));
    for (let i = 9; i < 15; i++) koy(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) koy(n - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) koy(8, n - 15 + i, bit(i));
    koy(8, n - 8, true);
  }
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits18 = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const d = ((bits18 >>> i) & 1) !== 0;
      const a = n - 11 + (i % 3), b = Math.floor(i / 3);
      koy(a, b, d); koy(b, a, d);
    }
  }
  // veri yerlestirme (zigzag) + maske 0 ((x+y)%2==0)
  let bi = 0;
  for (let sag = n - 1; sag >= 1; sag -= 2) {
    if (sag === 6) sag = 5;
    for (let v = 0; v < n; v++) for (let j = 0; j < 2; j++) {
      const x = sag - j;
      const yukari = ((sag + 1) & 2) === 0;
      const y = yukari ? n - 1 - v : v;
      if (!fn[y][x] && bi < tum.length * 8) {
        mod[y][x] = ((tum[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0;
        bi++;
      }
    }
  }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fn[y][x] && (x + y) % 2 === 0) mod[y][x] = !mod[y][x];
  return mod;
}
