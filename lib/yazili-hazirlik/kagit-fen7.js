// 7. sınıf Fen Bilimleri — 1. dönem 1. yazılı çalışma kâğıdı (UZAY ÇAĞI, plan haftaları 1-4; FB.7.1.1–FB.7.1.5).
// Özgün sorulardır; bilgi içeriği 7. sınıf Fen Bilimleri öğrenme çıktılarıyla sınırlıdır.
import { sutunGrafik, kartSirasi } from "./sekiller.js";

// Yer teleskobu / uzay teleskobu karşılaştırma şeması (yalnızca kavramsal çizim)
const teleskop = `<svg viewBox="0 0 540 250" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica, Arial, sans-serif">
<rect width="540" height="250" fill="#0F1B3D" rx="10"/>
<g fill="#fff"><circle cx="40" cy="30" r="1.6"/><circle cx="120" cy="18" r="1.3"/><circle cx="210" cy="40" r="1.6"/><circle cx="330" cy="22" r="1.4"/><circle cx="430" cy="38" r="1.7"/><circle cx="500" cy="16" r="1.3"/><circle cx="470" cy="70" r="1.2"/><circle cx="60" cy="78" r="1.3"/></g>
<circle cx="270" cy="34" r="9" fill="#FFE08A"/><text x="270" y="22" text-anchor="middle" font-size="12" fill="#FFE08A">Yıldız</text>
<rect x="0" y="86" width="540" height="64" fill="#5C86C8" opacity=".45"/><text x="12" y="108" font-size="12" fill="#fff">Atmosfer (hava, bulut, toz)</text>
<path d="M0 232 Q270 190 540 232 L540 250 L0 250Z" fill="#2E6B4B"/><text x="270" y="244" text-anchor="middle" font-size="12" fill="#fff">Dünya yüzeyi</text>
<line x1="270" y1="43" x2="140" y2="198" stroke="#FFE08A" stroke-width="1.8" stroke-dasharray="5 4"/>
<line x1="270" y1="43" x2="400" y2="72" stroke="#FFE08A" stroke-width="1.8"/>
<g transform="translate(116,196) rotate(-40)"><rect x="-6" y="-10" width="38" height="20" rx="3" fill="#cfd6e4"/></g><text x="96" y="230" font-size="12.5" fill="#fff" font-weight="700">Teleskop I</text>
<g transform="translate(400,72)"><rect x="-4" y="-9" width="30" height="18" rx="3" fill="#cfd6e4"/><rect x="-16" y="-3" width="12" height="6" fill="#4B9CD3"/><rect x="26" y="-3" width="12" height="6" fill="#4B9CD3"/></g><text x="396" y="60" font-size="12.5" fill="#fff" font-weight="700">Teleskop II</text>
</svg>`;

const sutun = sutunGrafik({ etiketler: ["1970", "1990", "2010", "2020"], degerler: [2, 7, 16, 24], max: 30, adim: 10, yBaslik: "Nesne sayısı (bin)", yukseklik: 230, renk: "#9B6BB0" });
const kartlar = kartSirasi([{ harf: "A", metin: "Kızıl dev" }, { harf: "B", metin: "Gaz ve toz\nbulutu (bulutsu)" }, { harf: "C", metin: "Beyaz cüce" }, { harf: "D", metin: "Ana kol\nyıldızı" }]);

export const KAGIT_FEN7 = {
  sinif: 7, ders: "Fen Bilimleri", donem: 1, yazili: 1,
  kapsam: "UZAY ÇAĞI: uzay araştırma teknolojileri, uzay gözlem araçları, uzay çöpleri, yıldızların yaşamı, yıldız-galaksi-evren",
  sayfalar: [
    { sorular: [
      { no: 1, yonergeOnce: true, paragraflar: ["Bir bilim merkezindeki sergide dört uzay teknolojisi tanıtılmaktadır: **yapay uydu, uzay istasyonu, uzay teleskobu, uzay sondası.** Her teknolojinin görevi aşağıdaki tabloda verilmiştir."],
        yonerge: "Tablodaki her göreve uygun uzay teknolojisini yazınız.",
        gorsel: { tip: "tablo", baslik: "Uzay teknolojilerinin görevleri", baslikEtiket: "Tablo 1", kolonlar: ["Görev", "Uzay teknolojisi"],
          satirlar: [
            ["Dünya çevresinde dolanarak haberleşme ve hava durumu gibi verilerin toplanmasını sağlar.", ""],
            ["Astronotların uzun süre yaşayıp bilimsel deneyler yaptığı, Dünya yörüngesindeki laboratuvardır.", ""],
            ["Atmosferin etkisinin dışından uzak gök cisimlerinin görüntülerini alır.", ""],
            ["Gezegenlere ve diğer gök cisimlerine yaklaşarak topladığı verileri Dünya’ya gönderen insansız araçtır.", ""],
          ], ilkKolonBaslik: false, genislik: "94%" } },
      { no: 2, paragraflar: ["Aşağıdaki şekilde aynı yıldızdan gelen ışığı gözlemleyen iki teleskop gösterilmiştir. Teleskop I Dünya yüzeyinde, Teleskop II ise Dünya’nın dışında uzayda bulunmaktadır."],
        gorsel: { tip: "svg", svg: teleskop, genislik: "60%" },
        altlar: [
          { harf: "a", yonerge: "Şekle göre iki teleskop arasındaki en temel farkı yazınız.", alan: 9 },
          { harf: "b", yonerge: "Teleskop II ile alınan görüntülerin genellikle daha net olmasının nedenini şekilden yararlanarak açıklayınız.", alan: 12 },
        ] },
    ] },
    { sorular: [
      { no: 3, paragraflar: ["Görevini tamamlamış uydular, roketlerden kopan parçalar ve boya parçaları “uzay çöpü” olarak Dünya’nın yörüngesinde dolanmaktadır. Aşağıdaki sütun grafiğinde Dünya yörüngesinde izlenen nesne sayısının yıllara göre değişimi gösterilmiştir. (Grafikteki veriler örnek olarak hazırlanmıştır.)"],
        gorsel: { tip: "svg", svg: sutun, genislik: "86%" },
        altlar: [
          { harf: "a", yonerge: "Grafiğe göre uzay çöplerinin zaman içindeki değişimini yorumlayınız.", alan: 16 },
          { harf: "b", yonerge: "Bu durumun gelecekteki uzay çalışmaları için oluşturabileceği bir sorunu yazınız.", alan: 16 },
          { harf: "c", yonerge: "Bu sorunu azaltmak için bir çözüm önerisi yazınız ve önerinizin neden etkili olacağını açıklayınız.", alan: 26 },
        ] },
    ] },
    { sorular: [
      { no: 4, paragraflar: ["Aşağıda, Güneş gibi bir yıldızın yaşamındaki dört evre karışık sırada verilmiştir."],
        gorsel: { tip: "svg", svg: kartlar, genislik: "94%" },
        altlar: [
          { harf: "a", yonerge: "Bu evreleri yıldızın oluşumundan sonuna doğru sıralayınız.", alan: 12 },
          { harf: "b", yonerge: "Güneş’in şu anda bu evrelerden hangisinde olduğunu yazınız.", alan: 10 },
          { harf: "c", yonerge: "Kütlesi Güneş’ten çok daha büyük olan bir yıldızın yaşamının sonunda hangi gök cisimlerinden birine dönüşebileceğini yazınız.", alan: 14 },
        ] },
      { no: 5, paragraflar: ["Yıldız, galaksi ve evren kavramlarını öğrenen Ali, arkadaşı Zeynep’e şunları söylemiştir: “Işık yılı bir zaman birimidir. Güneş’ten başka bir yıldız 4 ışık yılı uzaklıkta ise bu yıldızdan gelen ışık bize 4 saniyede ulaşır.”"],
        altlar: [
          { harf: "a", yonerge: "Ali’nin düşüncesindeki hataları belirtiniz ve ışık yılının ne olduğunu doğru biçimde yazınız.", alan: 24 },
          { harf: "b", yonerge: "Güneş, Güneş Sistemi, Samanyolu Galaksisi ve Evren kavramlarını küçükten büyüğe doğru sıralayınız.", alan: 12 },
        ] },
    ] },
  ],
  kazanimTablosu: [
    { kod: "FB.7.1.1", metin: "Uzay araştırmaları için geliştirilen teknolojileri karşılaştırabilme", sorular: "1" },
    { kod: "FB.7.1.2", metin: "Uzay gözlem araçları ile ilgili bilimsel model oluşturabilme", sorular: "2" },
    { kod: "FB.7.1.3", metin: "Uzay araştırmalarının yol açabileceği problemleri çözebilme", sorular: "3" },
    { kod: "FB.7.1.4", metin: "Yıldızların yaşamını açıklayarak yapılandırabilme", sorular: "4" },
    { kod: "FB.7.1.5", metin: "Yıldız, galaksi ve evren kavramlarını açıklayarak yapılandırabilme", sorular: "5" },
  ],
  cozumSayfalari: [
    { cozumler: [
      { no: 1, paragraflar: ["Yapay uydu; uzay istasyonu; uzay teleskobu; uzay sondası (tablodaki sırayla)."] },
      { no: 2, paragraflar: ["a) Teleskop I, Dünya’nın atmosferi içinde (yüzeyde); Teleskop II, atmosferin dışında uzaydadır.", "b) Teleskop II’ye ulaşan ışık atmosferden geçmez. Atmosferdeki hava, bulut ve toz ışığı dağıttığı ve soğurduğu için Teleskop I’e gelen ışık bozulur; Teleskop II’ye gelen ışık bozulmadığı için görüntüler daha nettir."], kabul: "Atmosferin ışığı bozmasından/engellemesinden söz eden her açıklama doğru kabul edilecektir." },
      { no: 3, paragraflar: ["a) Yörüngedeki nesne sayısı yıllar geçtikçe sürekli artmıştır (örnek veride 1970’te 2 bin iken 2020’de 24 bine ulaşmıştır).", "b) Çöpler çalışan uydu ve uzay araçlarıyla çarpışabilir; yeni görevlerin güvenliğini tehlikeye atar.", "c) Örnek: Görevini tamamlayan uyduların yörüngeden çıkarılarak atmosferde yakılması. Böylece yörüngedeki çöp miktarı artmaz."], kabul: "Sorunla ilgili, gerekçesi açıklanmış her makul öneri doğru kabul edilecektir." },
    ] },
    { cozumler: [
      { no: 4, paragraflar: ["a) B → D → A → C (bulutsu → ana kol yıldızı → kızıl dev → beyaz cüce).", "b) D — ana kol yıldızı.", "c) Nötron yıldızı ya da kara delik (büyük kütleli yıldızlar süpernova patlamasıyla sona erer)."] },
      { no: 5, paragraflar: ["a) Işık yılı bir zaman birimi değil, uzunluk (uzaklık) birimidir; ışığın bir yılda aldığı yoldur. 4 ışık yılı uzaklıktaki bir yıldızdan gelen ışık bize 4 yılda ulaşır.", "b) Güneş < Güneş Sistemi < Samanyolu Galaksisi < Evren."] },
    ] },
  ],
};
