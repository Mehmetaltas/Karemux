// 22 Ekim: canli kanit - Ingilizce dersi icerigi (konu paketi, pratik, sinav...) "Tum metinler SADECE Turkce, Ingilizce
// dahil baska dilden TEK KELIME bile kullanma" kurali yuzunden Turkce cumlelerle uretiliyordu (Ingilizce konu paketinde
// "Ayse her sabah okula otobusle gider ... hangisi Simple Present kuralina uygundur?" gibi anlamsiz sorular).
// Kural ucretsiz modellerin Turkce icerige yabanci dil/alfabe sizdirmasini onlemek icin konmustu; bu yuzden Turkce
// derslerde AYNEN korunur, yalniz Ingilizce dersinde yerini asagidaki kural alir.

export function ingilizceDersiMi(ders) {
  const d = String(ders || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  return d.startsWith("ingilizce");
}

const INGILIZCE_KURALI =
  "Bu bir INGILIZCE dersidir: aciklama, anlatim, yonerge ve cozum metinleri Turkce yazilsin (ogrenci Turkce konusan bir ortaokul ogrencisidir); " +
  "ANCAK ogretilen/olculen Ingilizce icerik (ornek cumleler, kelimeler, diyaloglar, paragraflar, soru metinleri ve SECENEKLER) INGILIZCE yazilmali. " +
  "Turkce bir cumleyi Ingilizce kurala gore degerlendirmeyi isteyen soru YAZMA. Cince/Arapca/Kiril gibi baska alfabeler kullanma. " +
  "Turkce metinlerde Türkçe'ye özgü harfleri (ı, İ, ğ, Ğ, ü, Ü, ş, Ş, ö, Ö, ç, Ç) MUTLAKA doğru ve eksiksiz kullan; ASCII'ye sadeleştirilmiş yazma (örnek: 'şimdi', 'günlük', 'düzenli', 'alışkanlık' yaz; 'simdi', 'gunluk', 'duzenli', 'aliskanlik' YAZMA)";

// varsayilan: dersin Turkce icin kullanilan ORIJINAL kural metni; Ingilizce disindaki derslerde AYNEN dondurulur.
export function dilKurali(ders, varsayilan) {
  return ingilizceDersiMi(ders) ? INGILIZCE_KURALI : varsayilan;
}
