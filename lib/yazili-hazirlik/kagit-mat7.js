// 7. sınıf Matematik — 1. dönem 1. yazılı çalışma kâğıdı (SAYILAR VE NİCELİKLER (1), plan haftaları 1-7).
// Tüm sayısal değerler elle doğrulandı; özgün sorulardır. Kazanım kodları lib/kazanimlar.data.js ile aynıdır.
import { cizgiGrafik, hesapMakinesi, bolmeliSayiDogrusu } from "./sekiller.js";

const sd1 = bolmeliSayiDogrusu({ min: -6, max: 6, bolme: 1, tamEtiketler: [0], noktalar: [{ deger: -5, etiket: "A" }, { deger: -2, etiket: "B" }, { deger: 1, etiket: "C" }, { deger: 4, etiket: "D" }] });
const sd2 = bolmeliSayiDogrusu({ min: -1, max: 1, bolme: 4, tamEtiketler: [-1, 0, 1] });
const grafik = cizgiGrafik({ etiketler: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"], degerler: [-4, -7, -2, 1, 3], min: -8, max: 4, adim: 2, yukseklik: 225, yBaslik: "Sıcaklık (°C)" });
const makine = hesapMakinesi("2,727272727");

// Kahve çekirdeği çubuk modeli: 15 eş parça (her biri 0,5 kg), 7,5 kg
const parca = (i) => `<rect x="${20 + i * 32}" y="24" width="30" height="34" fill="#E4EFF9" stroke="#1b1b1b" stroke-width="1.3"/>`;
const cubuk = `<svg viewBox="0 0 520 96" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica, Arial, sans-serif">${Array.from({ length: 15 }, (_, i) => parca(i)).join("")}<path d="M20 72 H500" stroke="#1b1b1b" stroke-width="1.3"/><path d="M20 66 V78 M500 66 V78" stroke="#1b1b1b" stroke-width="1.3"/><text x="260" y="92" text-anchor="middle" font-size="13">Günlük hazırlanan kahve çekirdeği: 7 1/2 kg (her bölme 1/2 kg)</text></svg>`;

export const KAGIT_MAT7 = {
  sinif: 7, ders: "Matematik", donem: 1, yazili: 1,
  kapsam: "SAYILAR VE NİCELİKLER (1): tam sayılar, rasyonel sayılar ve farklı temsilleri; ondalık gösterim; karşılaştırma-sıralama; işlemler ve problemler",
  sayfalar: [
    { sorular: [
      { no: 1, paragraflar: ["Aşağıdaki sayı doğrusunda dört nokta işaretlenmiştir. Sayı doğrusu üzerindeki bölmeler birbirine eşittir."],
        gorsel: { tip: "svg", svg: sd1, genislik: "92%" },
        yonerge: "A, B, C ve D noktalarına karşılık gelen tam sayıları tabloya yazınız. Ardından bu sayıları küçükten büyüğe sıralayınız.",
        sonGorsel: { tip: "tablo", sinif: "yaz", kolonlar: ["Nokta", "A", "B", "C", "D"], satirlar: [["Tam sayı", "", "", "", ""]], genislik: "70%" },
        sonMetin: "**Sıralama:** ………………………………………………………………………………" },
      { no: 2, yonergeOnce: true, yonerge: "Aşağıdaki gerçek yaşam durumlarını uygun tam sayılarla ifade ediniz.",
        gorsel: { tip: "tablo", baslik: "Gerçek yaşam durumları", baslikEtiket: "Tablo 1", kolonlar: ["Gerçek yaşam durumu", "Tam sayı"],
          satirlar: [
            ["Bir dalgıç, deniz seviyesinin 24 metre altına inmiştir.", ""],
            ["Bir kişinin banka hesabında 350 TL borç vardır.", ""],
            ["Everest Tepesi, deniz seviyesinden 8849 metre yüksektedir.", ""],
            ["Bir şehirde hava sıcaklığı sıfırın 9 derece altındadır.", ""],
          ], ilkKolonBaslik: false, genislik: "88%" } },
    ] },
    { sorular: [
      { no: 3, paragraflar: ["Bir öğrenci, bazı rasyonel sayıların ondalık gösterimlerini inceleyerek aşağıdaki tabloyu hazırlamak istiyor."],
        gorsel: { tip: "tablo", baslik: "Rasyonel sayıların ondalık gösterimleri", baslikEtiket: "Tablo 2", kolonlar: ["Rasyonel sayı", "Ondalık gösterimi", "Sonlu mu, devirli mi?"],
          satirlar: [["[[3|8]]", "", ""], ["[[5|6]]", "", ""], ["[[7|25]]", "", ""], ["[[4|11]]", "", ""]], genislik: "86%" },
        yonerge: "Tablodaki boşlukları doldurunuz. Devirli ondalık gösterimleri devir çizgisiyle (üzeri çizili) yazınız.",
        altlar: [
          { harf: "a", yonerge: "Tablodaki sayıların paydalarını asal çarpanlarına ayırarak incelediğinizde, sonlu ve devirli ondalık gösterim arasındaki farkın nedenini bir cümleyle açıklayınız.", alan: 28 },
        ] },
      { no: 4, paragraflar: ["Zeynep, Kerem ve Defne okul panosunu süslemek için aynı rulodan kurdele kesmişlerdir. Zeynep [[3|4]] metre, Kerem 0,7 metre, Defne ise [[7|8]] metre kurdele kullanmıştır."],
        altlar: [
          { harf: "a", yonerge: "Kullanılan kurdele uzunluklarını küçükten büyüğe doğru sıralayınız. Sıralamanızı işlem yaparak gerekçelendiriniz.", alan: 42 },
          { harf: "b", yonerge: "En çok kurdele kullanan öğrenci ile en az kurdele kullanan öğrenci arasındaki uzunluk farkı kaç metredir? Ondalık gösterimle yazınız.", alan: 30 },
        ] },
    ] },
    { sorular: [
      { no: 5, paragraflar: ["Ayşe, “−[[3|4]] sayısı −[[1|2]] sayısından büyüktür; çünkü [[3|4]], [[1|2]]’den büyüktür.” demiştir. Aşağıda −1 ile 1 arasındaki bölmeler eş olacak biçimde çizilmiş bir sayı doğrusu verilmiştir."],
        gorsel: { tip: "svg", svg: sd2, genislik: "88%" },
        yonerge: "Ayşe’nin düşüncesindeki hatayı belirtiniz. −[[3|4]] ve −[[1|2]] sayılarını sayı doğrusunda işaretleyerek doğru karşılaştırmayı gerekçesiyle yazınız.", alan: 30 },
      { no: 6, paragraflar: ["Aşağıdaki çizgi grafiği, bir şehirde beş gün boyunca ölçülen en düşük hava sıcaklıklarını göstermektedir. (Grafikteki veriler örnek olarak hazırlanmıştır.)"],
        gorsel: { tip: "svg", svg: grafik, genislik: "92%" },
        yonerge: "Grafiğe göre aşağıdaki soruları cevaplayınız.",
        altlar: [
          { harf: "a", yonerge: "En düşük sıcaklığın ölçüldüğü günü ve sıcaklığını yazınız.", alan: 12 },
          { harf: "b", yonerge: "Salı günü ile Cuma günü arasındaki sıcaklık farkı kaç derecedir? İşlemi yazarak gösteriniz.", alan: 22 },
        ] },
    ] },
    { sorular: [
      { no: 7, paragraflar: ["Fatih, hesap makinesiyle bir doğal sayıyı sıfırdan farklı bir doğal sayıya bölmüştür. Sonucun devirli ondalık gösterimi hesap makinesinin ekranında görülmektedir."],
        gorsel: { tip: "svg", svg: makine, genislik: "24%" },
        yonerge: "Bu bölme işleminde bölünen ile bölenin toplamı **en az** kaçtır? Matematiksel gerekçesiyle yazınız.", alan: 24 },
      { no: 8, paragraflar: ["Bir kafede günlük 7 [[1|2]] kg kahve çekirdeği hazırlanmaktadır. Sabah vardiyasında bu miktarın [[2|5]]’si kullanılmış, öğleden sonra ise kalan miktarın [[3|4]]’ü kullanılmıştır."],
        gorsel: { tip: "svg", svg: cubuk, genislik: "82%" },
        altlar: [
          { harf: "a", yonerge: "Sabah vardiyasında kaç kg kahve çekirdeği kullanılmıştır?", alan: 15 },
          { harf: "b", yonerge: "Öğleden sonra kaç kg kahve çekirdeği kullanılmıştır? Sonucu ondalık ve kesir olarak yazınız.", alan: 19 },
          { harf: "c", yonerge: "Akşam vardiyası için kaç kg kahve çekirdeği kalmıştır? İşlemlerinizi göstererek yazınız.", alan: 22 },
        ] },
    ] },
  ],
  kazanimTablosu: [
    { kod: "MAT.7.1.1", metin: "Gerçek yaşam ya da matematiksel durumlarda doğal sayı, tam sayı ve rasyonel sayıları yorumlayabilme", sorular: "1, 2, 6" },
    { kod: "MAT.7.1.2", metin: "Gerçek yaşam durumlarında rasyonel sayıların ondalık gösterimlerini yansıtabilme", sorular: "3, 7" },
    { kod: "MAT.7.1.3", metin: "Rasyonel sayıların karşılaştırma ve sıralama ilişkilerini yorumlayabilme", sorular: "4, 5" },
    { kod: "MAT.7.1.4", metin: "Rasyonel sayılar ve işlemler içeren gerçek yaşam problemlerini çözebilme", sorular: "4b, 6, 8" },
  ],
  cozumSayfalari: [
    { cozumler: [
      { no: 1, paragraflar: ["A = −5, B = −2, C = 1, D = 4", "Sıralama: −5 < −2 < 1 < 4"] },
      { no: 2, paragraflar: ["−24; −350; +8849 (8849); −9"], kabul: "Her durumun işaretiyle (eksi/artı) doğru yazıldığı yanıtlar doğru kabul edilecektir." },
      { no: 3, paragraflar: ["[[3|8]] = 0,375 (sonlu); [[5|6]] = 0,8{{3}} (devirli); [[7|25]] = 0,28 (sonlu); [[4|11]] = 0,{{36}} (devirli).", "a) Kesir sadeleştirildiğinde paydanın asal çarpanları yalnızca 2 ve/veya 5 ise (8 = 2·2·2, 25 = 5·5) ondalık gösterim sonlu olur. Payda 2 ve 5 dışında bir asal çarpan içeriyorsa (6 = 2·3, 11) ondalık gösterim devirli olur."] },
      { no: 4, paragraflar: ["a) [[3|4]] = 0,75; [[7|8]] = 0,875; 0,7. Sıralama: 0,7 < [[3|4]] < [[7|8]] (Kerem < Zeynep < Defne). Ondalık gösterim ya da ortak payda (40) ile karşılaştırma yapan yanıtlar doğru kabul edilir.", "b) En çok kullanan Defne (0,875 m), en az kullanan Kerem (0,7 m): 0,875 − 0,7 = 0,175 metre."] },
      { no: 5, paragraflar: ["Ayşe, negatif sayılarda mutlak değeri büyük olan sayının daha küçük olduğunu dikkate almamıştır. Sayı doğrusunda −[[3|4]], −[[1|2]]’nin solunda yer aldığı için −[[3|4]] < −[[1|2]] olur (−0,75 < −0,5)."], kabul: "Hata: mutlak değerleri karşılaştırıp işareti dikkate almamak. Sayı doğrusuyla ya da ondalık gösterimle doğru sonuca ulaşan yanıtlar doğru kabul edilecektir." },
    ] },
    { cozumler: [
      { no: 6, paragraflar: ["a) Salı günü, −7 °C.", "b) Cuma günü sıcaklık 3 °C, Salı günü −7 °C olduğu için fark: 3 − (−7) = 3 + 7 = 10 °C."] },
      { no: 7, paragraflar: ["Ekrandaki sayı 2,{{72}} = 2 + [[8|11]] = [[30|11]]’dir. [[30|11]] sadeleşmeyen kesirdir. Eşit kesirler 30k / 11k biçiminde olduğundan toplam 41k olur; en küçük değer k = 1 için 30 + 11 = 41’dir."], kabul: "Cevap: 41" },
      { no: 8, paragraflar: ["a) 7 [[1|2]] · [[2|5]] = [[15|2]] · [[2|5]] = 3 kg.", "b) Kalan: 7,5 − 3 = 4,5 kg. Öğleden sonra: 4,5 · [[3|4]] = 3,375 kg = 3 [[3|8]] kg.", "c) Akşam kalan: 4,5 − 3,375 = 1,125 kg = 1 [[1|8]] kg."] },
    ] },
  ],
};
