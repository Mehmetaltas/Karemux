// Faz E - TEK PUANLAMA MERKEZI.
// Tum sinav uc noktalari net/dogru/yanlis hesabini BURADAN almali; istemcinin
// gonderdigi net/skor degerine guvenilmez.
//
// PUANLAMA_SURUMU: sonuc satirlarina yazilir. NULL = Faz E oncesi (eski) kayit.
// Ucretli denemede eski kayitlar kitapcik karisikligi yuzunden hatali puanlanmis
// olabilir; surum alani bu kayitlari ayirt etmeyi saglar.
export const PUANLAMA_SURUMU = 2;

// --- A/B kitapcigi (ucretli-deneme/sorular ile GONDER AYNI kodu kullanir) ---
function seedliRastgele(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seedUret(metin) {
  let h = 0;
  for (let i = 0; i < metin.length; i++) {
    h = (Math.imul(31, h) + metin.charCodeAt(i)) | 0;
  }
  return h;
}

function seedliKaristir(dizi, rastgele) {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

// Algoritma onceki surumle BIREBIR ayni (ayni seed -> ayni kitapcik). Tek ekleme:
// her soruya orijinalNo (DB'deki sirasi) yazilir; rastgele sayi tuketimi degismez.
export function kitapcikOlustur(sorular, seedMetin) {
  const rastgele = seedliRastgele(seedUret(seedMetin));
  const numarali = sorular.map((s, i) => ({ ...s, orijinalNo: i }));
  const soruSirasiKarisik = seedliKaristir(numarali, rastgele);
  return soruSirasiKarisik.map((s) => {
    if (!s.secenekler || s.dogruIndex == null) return s;
    const dogruMetin = s.secenekler[s.dogruIndex];
    const harfsizSecenekler = s.secenekler.map((sec) => sec.replace(/^[A-D]\)\s*/, ""));
    const dogruMetinHarfsiz = dogruMetin.replace(/^[A-D]\)\s*/, "");
    const indeksler = seedliKaristir([0, 1, 2, 3].slice(0, harfsizSecenekler.length), rastgele);
    const yeniSecenekler = indeksler.map((eskiIdx, yeniIdx) => `${String.fromCharCode(65 + yeniIdx)}) ${harfsizSecenekler[eskiIdx]}`);
    const yeniDogruIndex = indeksler.findIndex((eskiIdx) => harfsizSecenekler[eskiIdx] === dogruMetinHarfsiz);
    return { ...s, secenekler: yeniSecenekler, dogruIndex: yeniDogruIndex };
  });
}

// --- Ortak hesap ---
export function netHesapla(dogru, yanlis) {
  return Math.max(0, dogru - yanlis / 3);
}

function gecerliCevapMi(v) {
  return Number.isInteger(v) && v >= 0 && v <= 3;
}

// sorular: cevap anahtari DAHIL (sunucu kopyasi) ve cevaplarin verildigi SIRADA.
// cevaplar: { "0": 2, "1": 0, ... } (indeks -> secenek indeksi). Gecersiz/eksik = bos.
export function puanla(sorular, cevaplar) {
  const kayit = cevaplar && typeof cevaplar === "object" ? cevaplar : {};
  let dogru = 0, yanlis = 0, bos = 0;
  const satirlar = [];
  for (let i = 0; i < sorular.length; i++) {
    const s = sorular[i];
    const verilen = kayit[i];
    let durum;
    if (!gecerliCevapMi(verilen)) { bos++; durum = "bos"; }
    else if (verilen === s.dogruIndex) { dogru++; durum = "dogru"; }
    else { yanlis++; durum = "yanlis"; }
    satirlar.push({ no: i + 1, durum, verilen: gecerliCevapMi(verilen) ? verilen : null, soru: s });
  }
  return { dogru, yanlis, bos, net: netHesapla(dogru, yanlis), satirlar };
}

// Istemcinin ozet sonuc gonderdigi uc noktalar icin (cevap anahtari sunucuda yok):
// sayilari dogrular, net'i SUNUCUDA yeniden hesaplar. Gecersizse null doner.
export function ozetSonucuDogrula({ dogru, yanlis, bos }, enFazlaSoru = 300) {
  const alanlar = [dogru, yanlis, bos];
  if (!alanlar.every((v) => Number.isInteger(v) && v >= 0)) return null;
  if (dogru + yanlis + bos > enFazlaSoru) return null;
  if (dogru + yanlis + bos === 0) return null;
  const net = Math.round(netHesapla(dogru, yanlis) * 100) / 100;
  return { dogru, yanlis, bos, net };
}
