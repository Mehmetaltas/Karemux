// Otomasyon testlerinin (scripts/ogrenci-test.js) kullandigi SABIT cihaz
// kimligi. Gercek bir kullanici degil, hassas degil. konu-paketi bu kimlikle
// gelen istekte akisi TAM calistirir ama icerik_onbellek'e KALICI KAYIT
// yazmaz ve ogretmenlere bildirim e-postasi gondermez (her test kosusu
// yeni "bekliyor" satiri ve e-posta uretip haftalik denetimi kirmizi
// tutuyordu - 14 Ekim). scripts/ogrenci-test.js ayni degeri kullanmali.
export const OTOMASYON_TEST_CIHAZ_ID = "otomasyon-test-cihazi-23eylul";
