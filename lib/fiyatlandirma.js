// Ozel Ders / Canli Ders fiyatlandirma cekirdegi - 26 Agustos'ta degisen is
// modeline gore: Karemux artik ARACI degil, hizmeti ogretmenden SATIN ALIP
// kendi uzerine kar koyarak ogrenciye SATAN taraf (reseller). Fatura
// ogrenciye Karemux'tan kesilir, ogretmene Karemux odeme yapar.
//
// Fiyat = ogretmen ucreti + Karemux kar marji + gorunmeyen giderler
//         (taksit komisyonu, banka masraflari vb.)
//
// UYARI: GIZLI_GIDER_YUZDE TAHMINIDIR (Iyzico bilinen araligi %1.95-3.45 +
// 0.25TL'nin orta noktasina yakin, sabit degerler henuz baglanmadi). Mali
// musavir/Iyzico kesinlesince guncellenmeli - kesin oran degildir.
export const KAR_MARJI_YUZDE = 0.20;      // 23 Agustos KESIN karari - degismedi
export const GIZLI_GIDER_YUZDE = 0.03;    // TAHMINI - Iyzico/mali musavir onayina acik

// ogretmenPayiTl: ogretmenin GERCEK alacagi tutar (kar/gider ICERMEZ).
// Donen fiyatTl: ogrenciye gosterilecek NIHAI tutar (kar + gizli giderler DAHIL, tek fiyat).
export function ozelDersFiyatiHesapla(ogretmenPayiTl) {
  const karliTutar = ogretmenPayiTl * (1 + KAR_MARJI_YUZDE);
  const fiyatTl = karliTutar / (1 - GIZLI_GIDER_YUZDE);
  return Math.round(fiyatTl * 100) / 100;
}
