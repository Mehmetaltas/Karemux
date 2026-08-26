// Ozel Ders / Canli Ders fiyatlandirma cekirdegi - 26 Agustos'ta degisen is
// modeline gore: Karemux artik ARACI degil, hizmeti ogretmenden SATIN ALIP
// kendi uzerine kar koyarak ogrenciye SATAN taraf (reseller). Fatura
// ogrenciye Karemux'tan kesilir, ogretmene Karemux odeme yapar.
//
// IKI AYRI FORMUL (kullanicinin ayrimi, 26 Agustos):
// - Toplu/Grup ders (Canli Ders): kapasiteye bolunerek satiliyor, Karemux
//   RISK aliyor (dusuk katilimda zarar, yuksek katilimda kar) - bu yuzden
//   kar marji + gizli gider ikisi de fiyata dahil.
// - 1-1 Ozel Ders (randevu): risk yok, tek kisiye direkt satiliyor - sade
//   kar marji yeterli, gizli gider katmani YOK.
//
// UYARI: GIZLI_GIDER_YUZDE TAHMINIDIR (Iyzico bilinen araligi %1.95-3.45 +
// 0.25TL'nin orta noktasina yakin, sabit degerler henuz baglanmadi). Mali
// musavir/Iyzico kesinlesince guncellenmeli - kesin oran degildir.
export const KAR_MARJI_YUZDE = 0.20;      // 23 Agustos KESIN karari - degismedi
export const GIZLI_GIDER_YUZDE = 0.03;    // TAHMINI - sadece toplu/grup derste

// 1-1 Ozel Ders (randevu) - sade kar marji, gizli gider katmani yok.
// ogretmenPayiTl: ogretmenin GERCEK alacagi tutar. Doner: ogrenciye gosterilecek fiyat.
export function ozelDersFiyatiHesapla(ogretmenPayiTl) {
  return Math.round((ogretmenPayiTl * (1 + KAR_MARJI_YUZDE)) * 100) / 100;
}

// Toplu/Grup ders (Canli Ders) - kar marji + gizli gider ikisi de dahil,
// Karemux'un kapasite riskini karsilamak icin.
// kisiBasiOgretmenPayi: ogretmen_payi_toplam / max_kapasite. Doner: kisi basi ogrenci fiyati.
export function topluDersFiyatiHesapla(kisiBasiOgretmenPayi) {
  const karliTutar = kisiBasiOgretmenPayi * (1 + KAR_MARJI_YUZDE);
  return Math.round((karliTutar / (1 - GIZLI_GIDER_YUZDE)) * 100) / 100;
}
