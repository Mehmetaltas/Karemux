// Fen Bilimleri: görselli sorular.
import { S, svg, tablo, Q } from "./gorselli-yardim.js";
export default {
  "4": {
    "1.1": [
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Gece ve gündüzün oluşması", ["Mevsimlerin oluşması", "Ayın evrelerinin oluşması", "Depremlerin oluşması"], "Dünya'nın kendi etrafında dönmesi gece ve gündüzü oluşturur.", tablo(["Dünya'nın hareketi", "Sonucu"], [["Kendi etrafında dönme", "?"], ["Güneş etrafında dolanma", "Mevsimlerin oluşması"]], "Dünya'nın hareketleri")),
      Q("Tabloya göre vücudumuza en çok enerji veren (karbonhidratça zengin) besin hangisidir?", "Makarna", ["Yumurta", "Zeytinyağı", "Portakal"], "Makarna karbonhidratça zengindir; karbonhidratlar vücudumuza enerji verir.", tablo(["Besin", "Zengin olduğu besin ögesi"], [["Yumurta", "Protein"], ["Makarna", "Karbonhidrat"], ["Zeytinyağı", "Yağ"], ["Portakal", "Vitamin"]], "Besinler ve besin ögeleri")),
    ],
    "1.2": [
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Şeklini değiştirir", ["Hareket ettirir", "Hareketini durdurur", "Yönünü değiştirir"], "Hamuru sıkınca uygulanan kuvvet hamurun şeklini değiştirir.", tablo(["Olay", "Kuvvetin etkisi"], [["Durgun topa vurmak", "Hareket ettirir"], ["Hareket eden topu tutmak", "Hareketini durdurur"], ["Hamuru sıkmak", "?"]], "Kuvvetin etkileri")),
      Q("Grafiğe göre kahvaltıda süt içen öğrenci sayısı çay içenlerden kaç fazladır?", "5", ["3", "7", "17"], "12 − 7 = 5.", svg(S.sutunGrafik({ etiketler: ["Süt", "Çay", "Ayran"], degerler: [12, 7, 5], max: 14, adim: 2, yBaslik: "Öğrenci sayısı" }), "74%")),
    ],
    "1.3": [
      Q("Tabloya göre mıknatıs tarafından çekilen cisimlerin sayısı kaçtır?", "2", ["1", "3", "4"], "Yalnızca demir çivi ve demir ataş çekilir.", tablo(["Cisim", "Mıknatıs çeker mi?"], [["Demir çivi", "Evet"], ["Plastik kalem", "Hayır"], ["Demir ataş", "Evet"], ["Bakır para", "Hayır"]], "Mıknatısın çektiği cisimler")),
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Sıvı", ["Katı", "Gaz", "Plazma"], "Süt akışkan olup bulunduğu kabın şeklini alır; sıvıdır.", tablo(["Madde", "Hâli"], [["Taş", "Katı"], ["Süt", "?"], ["Hava", "Gaz"]], "Maddenin hâlleri")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Sıvı → Gaz", ["Katı → Sıvı", "Gaz → Sıvı", "Sıvı → Katı"], "Su buharlaşırken sıvıdan gaza geçer.", tablo(["Olay", "Hâl değişimi"], [["Buzun erimesi", "Katı → Sıvı"], ["Suyun buharlaşması", "?"], ["Suyun donması", "Sıvı → Katı"]], "Hâl değişimleri")),
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Karışım", ["Saf madde", "Element", "Atom"], "Ayran, yoğurt ve su gibi maddelerin karışımıdır.", tablo(["Madde", "Türü"], [["Saf su", "Saf madde"], ["Ayran", "?"], ["Şeker", "Saf madde"]], "Maddeler")),
    ],
    "2.2": [
      Q("Tabloya göre ses kirliliği bakımından en riskli ortam hangisidir?", "Konser alanı", ["Kütüphane", "Sakin sokak", "Sınıf (ders sırasında)"], "Ses şiddeti en yüksek olan ortam konser alanıdır (110 dB).", tablo(["Ortam", "Ses şiddeti (dB)"], [["Kütüphane", "30"], ["Sakin sokak", "50"], ["Sınıf (ders sırasında)", "60"], ["Konser alanı", "110"]], "Ortamların ses şiddeti")),
      Q("Bilinçli bir tüketici, aynı kalitedeki ürünü tabloya göre hangi marketten alır?", "B marketi", ["A marketi", "Hangisinden aldığı fark etmez", "Fiyata bakmadan en yakın marketten"], "Bilinçli tüketici aynı kalitedeki ürünü daha uygun fiyata satan B marketinden alır.", tablo(["Market", "Fiyat (TL)"], [["A marketi", "12"], ["B marketi", "10"]], "Aynı kalitedeki ürünün fiyatı")),
    ],
    "2.3": [
      Q("Şekildeki devrede anahtar açıkken K ve L ampulleri için ne söylenebilir?", "İkisi de yanmaz", ["İkisi de yanar", "Yalnız K yanar", "Yalnız L yanar"], "Anahtar açıkken devre tamamlanmadığı için akım geçmez, ampuller yanmaz.", svg(S.devre({ tip: "seri", ampuller: ["K", "L"], acikAnahtar: true }), "78%")),
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Yalıtkan", ["İletken", "Mıknatıs", "Pil"], "Plastik elektriği iletmez; yalıtkandır.", tablo(["Madde", "Elektriği iletme"], [["Bakır tel", "İletken"], ["Plastik", "?"], ["Demir çivi", "İletken"]], "İletken ve yalıtkanlar")),
    ],
  },
  "5": {
    "1.1": [
      Q("Şekildeki dinamometre kaç N'luk kuvveti göstermektedir?", "6", ["5", "7", "4"], "İbre 6 çizgisindedir.", svg(S.dinamometre({ deger: 6 }), "28%")),
      Q("Tabloya göre kendi ışığını yayan gök cisimlerinin sayısı kaçtır?", "2", ["1", "3", "4"], "Güneş ve yıldız kendi ışığını yayar.", tablo(["Gök cismi", "Kendi ışığını yayar mı?"], [["Güneş", "Evet"], ["Ay", "Hayır"], ["Dünya", "Hayır"], ["Yıldız", "Evet"]], "Gök cisimleri")),
    ],
    "1.2": [
      Q("Tabloya göre kütlesi 5 kg olan cismin ağırlığı kaç N'dur?", "50", ["5", "15", "100"], "Ağırlık = kütle × 10: 5 × 10 = 50 N.", tablo(["Kütle (kg)", "Ağırlık (N)"], [["2", "20"], ["3", "30"], ["5", "?"]], "Kütle ve ağırlık (g = 10 N/kg)")),
      Q("Şekilde K ile gösterilen yapı hangisidir?", "Hücre çekirdeği", ["Hücre zarı", "Mitokondri", "Hücre duvarı"], "Hücrenin yönetim merkezi olan, ortada yer alan yapı çekirdektir.", svg(S.hucre({ tip: "hayvan", etiketler: { cekirdek: "K", organel: "L", zar: "M" } }), "52%")),
    ],
    "1.3": [
      Q("Şekildeki hücrede N ile gösterilen yapı hangisidir?", "Hücre duvarı", ["Hücre zarı", "Çekirdek", "Mitokondri"], "Hücre duvarı yalnızca bitki hücresinde bulunur ve hücreye şekil verir.", svg(S.hucre({ tip: "bitki", etiketler: { duvar: "N", cekirdek: "M", organel: "L", kloroplast: "P" } }).replace('>K</text>', '>K</text>'), "52%")),
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Vücuda destek olmak ve şekil vermek", ["Besinleri sindirmek", "Kanı temizlemek", "Havayı vücuda almak"], "İskeletin görevlerinden biri vücuda destek olmak ve şekil vermektir.", tablo(["Yapı", "Görevi"], [["İskelet", "?"], ["Kaslar", "Hareketi sağlamak"]], "Destek ve hareket sistemi")),
    ],
    "2.1": [
      Q("Termometredeki sıcaklık kaç °C'dir?", "25", ["20", "30", "15"], "Sıvı sütunu 20 ile 30 arasında tam ortadadır: 25 °C.", svg(S.termometre({ deger: 25, kucuk: 5 }), "26%")),
      Q("Işık kaynağı ile cisim arasındaki uzaklık azaltılırsa perdedeki gölgenin boyutu nasıl değişir?", "Büyür", ["Küçülür", "Değişmez", "Kaybolur"], "Cisim ışık kaynağına yaklaştıkça gölge büyür.", svg(S.golge({ yakin: true }), "70%")),
    ],
    "2.2": [
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Sıvı → Katı", ["Katı → Sıvı", "Sıvı → Gaz", "Gaz → Sıvı"], "Suyun donması sıvıdan katıya geçiştir.", tablo(["Olay", "Hâl değişimi"], [["Buzun erimesi", "Katı → Sıvı"], ["Suyun donması", "?"]], "Hâl değişimleri")),
      Q("Şekildeki devrede ampulün yanması için ne yapılmalıdır?", "Anahtar kapatılmalıdır", ["Anahtar açık bırakılmalıdır", "Pil çıkarılmalıdır", "Ampul çıkarılmalıdır"], "Akımın geçmesi için devre kapalı olmalıdır.", svg(S.devre({ tip: "seri", ampuller: ["K"], acikAnahtar: true }), "78%")),
    ],
    "2.3": [
      Q("Tabloya göre geri dönüşüme gönderilebilen atık aşağıdakilerden hangisidir?", "Cam şişe", ["Meyve kabuğu", "Kullanılmış peçete", "Yemek artığı"], "Cam, kâğıt, plastik ve metal atıklar geri dönüştürülebilir.", tablo(["Atık", "Türü"], [["Cam şişe", "Cam"], ["Meyve kabuğu", "Organik"], ["Kullanılmış peçete", "Kirli kâğıt"], ["Yemek artığı", "Organik"]], "Evsel atıklar")),
      Q("Tabloya göre devreye ikinci bir pil eklendiğinde ampulün parlaklığı nasıl değişir?", "Artar", ["Azalır", "Değişmez", "Ampul söner"], "Pil sayısı arttıkça devredeki enerji artar, ampul daha parlak yanar.", tablo(["Pil sayısı", "Ampulün parlaklığı"], [["1", "Normal"], ["2", "?"]], "Pil sayısı ve parlaklık")),
    ],
  },
  "6": {
    "1.1": [
      Q("Şekildeki cisme etki eden net kuvvet kaç N'dur?", "4", ["10", "3", "7"], "Zıt yönlü kuvvetlerde bileşke fark kadardır: 7 − 3 = 4 N.", svg(S.kuvvet({ sol: 3, sag: 7 }), "74%")),
      Q("Tabloya göre cismin sürati kaç m/s'dir?", "5", ["20", "10", "4"], "Süratin sabit olduğu görülür: 5 m ÷ 1 s = 5 m/s.", tablo(["Zaman (s)", "Yol (m)"], [["1", "5"], ["2", "10"], ["3", "15"], ["4", "20"]], "Sabit süratli hareket")),
    ],
    "1.2": [
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Doğurarak", ["Yumurtlayarak", "Tomurcuklanarak", "Sporla"], "İnek memeli bir hayvandır, yavrusunu doğurarak üretir.", tablo(["Canlı", "Üreme şekli"], [["Tavuk", "Yumurtlayarak"], ["İnek", "?"]], "Hayvanlarda üreme")),
      Q("Kelebeğin gelişim evrelerinde soru işareti yerine hangisi gelmelidir?", "Pupa (koza)", ["Larva", "Ergin", "Yumurta"], "Kelebek: yumurta → tırtıl (larva) → pupa (koza) → ergin kelebek.", svg(S.zincir({ adlar: ["Yumurta", "Tırtıl", "?", "Kelebek"], renk: "#fde9c9" }), "88%")),
    ],
    "1.3": [
      Q("Şekilde gelme açısı 40° olan ışının yansıma açısı kaç derecedir?", "40", ["50", "80", "20"], "Yansıma yasasına göre yansıma açısı gelme açısına eşittir: 40°.", svg(S.yansima({ aci: 40 }), "62%")),
      Q("Düzlem aynadan 3 m uzakta duran bir kişi görüntüsünü aynadan kaç m uzakta görür?", "3", ["6", "1,5", "0"], "Düzlem aynada görüntü, cisim ayna önünde ne kadar uzaktaysa aynanın arkasında o kadar uzaktadır.", tablo(["Cismin aynaya uzaklığı", "Görüntünün aynaya uzaklığı"], [["3 m", "?"]], "Düzlem ayna")),
    ],
    "2.1": [
      Q("Grafiğe göre maddenin kaynama noktası kaç °C'dir?", "100", ["0", "40", "70"], "Sıcaklığın sabit kaldığı ikinci düzlük kaynama noktasıdır: 100 °C.", svg(S.cizgiGrafik({ etiketler: ["0", "1", "2", "3", "4", "5", "6", "7", "8"], degerler: [-10, 0, 0, 0, 40, 70, 100, 100, 100], min: -20, max: 120, adim: 20, yBaslik: "Sıcaklık (°C)" }), "88%")),
      Q("Tabloya göre hangi cisim suda yüzer? (Suyun yoğunluğu 1 g/cm³)", "L", ["K", "Her ikisi de", "Hiçbiri"], "K'nin yoğunluğu 40/20 = 2 g/cm³ (batar); L'nin yoğunluğu 15/30 = 0,5 g/cm³ (yüzer).", tablo(["Cisim", "Kütle (g)", "Hacim (cm³)"], [["K", "40", "20"], ["L", "15", "30"]], "Cisimlerin kütle ve hacmi")),
    ],
    "2.2": [
      Q("Aynı maddeden yapılmış tellerden hangisinin elektrik direnci en büyüktür?", "L teli", ["K teli", "M teli", "Dirençleri eşittir"], "Direnç, telin boyu arttıkça büyür, kalınlığı arttıkça küçülür; en uzun ve en ince tel L'dir.", tablo(["Tel", "Uzunluk", "Kalınlık"], [["K", "1 m", "İnce"], ["L", "2 m", "İnce"], ["M", "1 m", "Kalın"]], "Teller")),
      Q("Şekildeki seri devrede K ampulü çıkarılırsa L ampulü için ne söylenebilir?", "Söner", ["Daha parlak yanar", "Aynı parlaklıkta yanmaya devam eder", "Patlar"], "Seri devrede tek yol olduğundan bir ampul çıkarılınca devre açılır, diğeri de söner.", svg(S.devre({ tip: "seri", ampuller: ["K", "L"] }), "78%")),
    ],
    "2.3": [
      Q("Tabloya göre aynı maddeden yapılmış 3 m uzunluğundaki telin direnci kaç Ω'dur?", "6", ["3", "9", "12"], "Direnç uzunlukla doğru orantılıdır: 1 m için 2 Ω ise 3 m için 6 Ω.", tablo(["Tel uzunluğu (m)", "Direnç (Ω)"], [["1", "2"], ["2", "4"], ["3", "?"]], "Telin boyu ve direnci")),
      Q("Grafiğe göre biyoçeşitliliği en fazla olan alan hangisidir?", "Orman", ["Tarla", "Şehir merkezi", "Çöl"], "Tür sayısı en fazla olan alan en yüksek biyoçeşitliliğe sahiptir.", svg(S.sutunGrafik({ etiketler: ["Orman", "Tarla", "Şehir", "Çöl"], degerler: [120, 40, 25, 15], max: 140, adim: 20, yBaslik: "Tür sayısı" }), "78%")),
    ],
  },
  "7": {
    "1.1": [
      Q("Tabloya göre cisme yapılan iş kaç J'dür?", "50", ["15", "2", "5"], "İş = kuvvet × yol = 10 × 5 = 50 J.", tablo(["Kuvvet (N)", "Yol (m)", "İş (J)"], [["10", "5", "?"]], "İş hesabı")),
      Q("Ampulde gerçekleşen enerji dönüşümünde soru işareti yerine hangisi gelmelidir?", "Işık ve ısı enerjisi", ["Hareket enerjisi", "Kimyasal enerji", "Ses enerjisi"], "Ampul elektrik enerjisini ışık ve ısı enerjisine dönüştürür.", svg(S.zincir({ adlar: ["Elektrik enerjisi", "Ampul", "?"], renk: "#fff4c2" }), "70%")),
    ],
    "1.2": [
      Q("Tabloya göre proteinlerin sindirimi nerede başlar?", "Mide", ["Ağız", "İnce bağırsak", "Yemek borusu"], "Proteinlerin kimyasal sindirimi midede başlar.", tablo(["Besin ögesi", "Sindirimin başladığı yer"], [["Karbonhidrat", "Ağız"], ["Protein", "?"], ["Yağ", "İnce bağırsak"]], "Sindirim")),
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Kanı kalbe getirir", ["Kanı kalpten uzaklaştırır", "Besin sindirir", "Havayı süzer"], "Toplardamarlar vücuttan kanı kalbe taşır.", tablo(["Kan damarı", "Görevi"], [["Atardamar", "Kanı kalpten uzaklaştırır"], ["Toplardamar", "?"]], "Kan damarları")),
    ],
    "1.3": [
      Q("Işık ışını havadan suya geçerken şekildeki gibi nasıl hareket eder?", "Normale yaklaşarak kırılır", ["Normalden uzaklaşarak kırılır", "Hiç kırılmadan doğrusal gider", "Tamamen yansır"], "Işık az yoğun ortamdan çok yoğun ortama geçerken normale yaklaşır.", svg(S.kirilma(), "62%")),
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Kandaki atıkları süzmek", ["Besinleri öğütmek", "Oksijen taşımak", "Kanı pompalamak"], "Böbrekler kandaki zararlı atıkları süzerek idrarı oluşturur.", tablo(["Organ", "Görevi"], [["Akciğer", "Gaz alışverişi"], ["Böbrek", "?"]], "Organlar ve görevleri")),
    ],
    "2.1": [
      Q("Şekildeki mercek hangi türdendir?", "İnce kenarlı (yakınsak) mercek", ["Kalın kenarlı (ıraksak) mercek", "Düz ayna", "Çukur ayna"], "Paralel ışınları bir noktada toplayan, ortası kalın kenarları ince mercek yakınsak (ince kenarlı) mercektir.", svg(S.mercek(), "62%")),
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Karışım", ["Element", "Bileşik", "Atom"], "Çorba birden fazla maddenin karışımıdır.", tablo(["Madde", "Sınıflandırma"], [["Altın", "Element"], ["Su", "Bileşik"], ["Çorba", "?"]], "Maddelerin sınıflandırılması")),
    ],
    "2.2": [
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Süzme", ["Buharlaştırma", "Mıknatısla ayırma", "Eleme"], "Kum suda çözünmediğinden süzme ile ayrılır.", tablo(["Karışım", "Ayırma yöntemi"], [["Tuz-su", "Buharlaştırma"], ["Demir tozu-kum", "Mıknatısla ayırma"], ["Kum-su", "?"]], "Karışımların ayrılması")),
      Q("Şekildeki yüklü cisimler birbirine yaklaştırılırsa ne olur?", "Birbirini çeker", ["Birbirini iter", "Hiçbir etkileşim olmaz", "Yükleri yok olur"], "Zıt yüklü cisimler birbirini çeker.", svg(S.yukler({ sol: "+", sag: "−" }), "62%")),
    ],
    "2.3": [
      Q("Şekildeki besin zincirinde üretici hangisidir?", "Ot", ["Çekirge", "Kurbağa", "Yılan"], "Besin üreten canlı bitkidir (ot).", svg(S.zincir({ adlar: ["Ot", "Çekirge", "Kurbağa", "Yılan"] }), "86%")),
      Q("Grafiğe göre enerjinin yaklaşık %10'unun bir sonraki basamağa aktarıldığı bilindiğine göre yılana aktarılan enerji kaç birimdir?", "1", ["10", "100", "0,1"], "Kurbağadaki 10 birim enerjinin %10'u yılana geçer: 1 birim.", svg(S.sutunGrafik({ etiketler: ["Ot", "Çekirge", "Kurbağa"], degerler: [1000, 100, 10], max: 1000, adim: 250, yBaslik: "Enerji (birim)" }), "78%")),
    ],
  },
  "8": {
    "1.1": [
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Kuzey Yarım Küre'de gündüzlerin en kısa olduğu gün (kış başlangıcı)", ["Kuzey Yarım Küre'de gündüzlerin en uzun olduğu gün", "Gece ve gündüzün eşit olduğu gün", "Kuzey Yarım Küre'de ilkbahar başlangıcı"], "22 Aralık'ta Kuzey Yarım Küre'de gündüzler en kısadır (kış başlangıcı).", tablo(["Tarih", "Kuzey Yarım Küre'de olay"], [["21 Haziran", "Gündüzün en uzun olduğu gün (yaz başlangıcı)"], ["22 Aralık", "?"]], "Mevsimler")),
      Q("Tabloda DNA'nın iki zinciri baz eşleşmesine uygun yazıldığına göre soru işareti yerine hangi baz gelmelidir?", "C", ["A", "T", "G"], "Guanin (G) her zaman sitozin (C) ile eşleşir.", tablo(["", "1", "2", "3", "4", "5"], [["Zincir 1", "A", "T", "G", "C", "T"], ["Zincir 2", "T", "A", "?", "G", "A"]], "DNA baz dizisi")),
    ],
    "1.2": [
      Q("Tabloya göre 200 N'luk kuvvetin 4 m²'lik yüzeye uyguladığı basınç kaç Pa'dır?", "50", ["800", "204", "0,02"], "Basınç = kuvvet ÷ yüzey alanı = 200 ÷ 4 = 50 Pa.", tablo(["Kuvvet (N)", "Yüzey alanı (m²)", "Basınç (Pa)"], [["200", "4", "?"]], "Basınç hesabı")),
      Q("Tabloya göre sıvı basıncı derinlikle orantılıdır. 4 m derinlikte sıvı basıncı kaç kPa'dır?", "40", ["30", "20", "80"], "Basınç derinlikle doğru orantılı: 1 m için 10 kPa ise 4 m için 40 kPa.", tablo(["Derinlik (m)", "Sıvı basıncı (kPa)"], [["1", "10"], ["2", "20"], ["4", "?"]], "Sıvı basıncı")),
    ],
    "1.3": [
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Kimyasal değişim", ["Fiziksel değişim", "Hâl değişimi", "Çözünme"], "Sütün ekşimesinde yeni bir madde oluşur; kimyasal değişimdir.", tablo(["Olay", "Değişim türü"], [["Demirin paslanması", "Kimyasal değişim"], ["Buzun erimesi", "Fiziksel değişim"], ["Sütün ekşimesi", "?"]], "Değişimler")),
      Q("Tabloya göre bazik özellik gösteren madde hangisidir?", "Sabunlu su", ["Limon suyu", "Saf su", "Hiçbiri"], "pH değeri 7'den büyük olan maddeler baziktir; sabunlu suyun pH'ı 10'dur.", tablo(["Madde", "pH değeri"], [["Limon suyu", "2"], ["Saf su", "7"], ["Sabunlu su", "10"]], "pH değerleri")),
    ],
    "2.1": [
      Q("Grafikte maddenin erime sırasında sıcaklığı nasıl değişir?", "Sabit kalır", ["Sürekli artar", "Sürekli azalır", "Önce artar sonra azalır"], "Saf maddeler hâl değiştirirken sıcaklık sabit kalır.", svg(S.cizgiGrafik({ etiketler: ["0", "1", "2", "3", "4", "5", "6"], degerler: [-10, 0, 0, 0, 20, 40, 60], min: -20, max: 80, adim: 20, yBaslik: "Sıcaklık (°C)" }), "86%")),
      Q("Tepkime denkleminde soru işareti yerine hangi katsayı gelmelidir?", "2", ["1", "3", "4"], "2H₂ + O₂ → 2H₂O: kütlenin korunumu için sağ tarafta 2 gelmelidir.", tablo(["Tepkime"], [["2H₂ + O₂ → ? H₂O"]], "Kimyasal tepkime")),
    ],
    "2.2": [
      Q("Şekildeki kaldıraç dengede olduğuna göre F kuvveti kaç N'dur? (Yük 60 N, yük kolu 2 m, kuvvet kolu 6 m)", "20", ["60", "180", "40"], "Yük × yük kolu = kuvvet × kuvvet kolu: 60 × 2 = F × 6, F = 20 N.", svg(S.kaldirac({ yukEt: "60 N", kuvvetEt: "F", yukKol: 2, kuvvetKol: 6 }), "62%")),
      Q("Tabloya göre eğik düzlemde kuvvet kazancı kaç katıdır?", "4", ["2", "3", "5"], "Eğik düzlemde kuvvet kazancı yol ÷ yükseklik = 4 ÷ 1 = 4 katıdır.", tablo(["Eğik düzlemin boyu (m)", "Yüksekliği (m)"], [["4", "1"]], "Eğik düzlem")),
    ],
    "2.3": [
      Q("Grafiğe göre üçüncü basamaktaki canlıya aktarılan enerji kaç birimdir?", "100", ["1000", "10 000", "10"], "Enerji her basamakta yaklaşık %10'a düşer: 10 000 → 1 000 → 100.", svg(S.sutunGrafik({ etiketler: ["1. basamak", "2. basamak", "3. basamak"], degerler: [10000, 1000, 100], max: 10000, adim: 2500, yBaslik: "Enerji (birim)" }), "78%")),
      Q("Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", "Sera gazlarının artması", ["Ormanların artması", "Ozon tabakasının kalınlaşması", "Temiz enerji kullanımı"], "Küresel ısınmanın başlıca nedeni atmosferde sera gazlarının artmasıdır.", tablo(["Çevre sorunu", "Başlıca neden"], [["Asit yağmuru", "Kükürt dioksit gazı"], ["Küresel ısınma", "?"]], "Çevre sorunları")),
    ],
  },
};
