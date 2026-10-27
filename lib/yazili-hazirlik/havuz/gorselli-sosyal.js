// Sosyal Bilgiler (4-7) ve T.C. İnkılap Tarihi (8): görselli sorular.
import { S, svg, tablo, Q } from "./gorselli-yardim.js";
export default {
  "4": {
    "1.1": [
      Q("Zaman şeridine göre Elif'in hayatındaki olaylardan en son gerçekleşen hangisidir?", "Okula başlama", ["Doğum", "İlk adımını atma", "Hepsi aynı yıl gerçekleşmiştir"], "Olaylar tarih sırasına göre dizilir; en son yıl 2022'dir.", svg(S.zamanSeridi({ olaylar: [{ yil: "2016", ad: "Doğum" }, { yil: "2017", ad: "İlk adım" }, { yil: "2022", ad: "Okula başlama" }] }), "86%")),
      Q("Grafiğe göre okulda en çok öğrencinin katıldığı kulüp hangisidir?", "Satranç", ["Resim", "Spor", "Hepsine eşit katılım var"], "En büyük dilim satranç kulübüne aittir (%40).", svg(S.pasta({ etiketler: ["Satranç (%40)", "Resim (%35)", "Spor (%25)"], degerler: [40, 35, 25] }), "80%")),
    ],
    "1.2": [
      Q("Haritaya göre Park, Okul'un hangi yönündedir?", "Kuzey", ["Güney", "Doğu", "Batı"], "Park, Okul'un üst (kuzey) tarafındadır.", svg(S.yonHaritasi({ merkez: "Okul", kuzey: "Park", dogu: "Hastane", guney: "Market", bati: "Kütüphane" }), "70%")),
      Q("Haritaya göre Okul'un doğusunda hangi yer bulunur?", "Hastane", ["Park", "Market", "Kütüphane"], "Doğu yönünde Hastane vardır.", svg(S.yonHaritasi({ merkez: "Okul", kuzey: "Park", dogu: "Hastane", guney: "Market", bati: "Kütüphane" }), "70%")),
    ],
    "1.3": [
      Q("Tabloya göre yangın anında hangi davranış doğrudur?", "Asansör yerine merdiveni kullanmak", ["Asansöre binmek", "Eşyaları toplamaya çalışmak", "Saklanmak"], "Yangında asansör kullanılmaz; yetkililerin yönlendirmesiyle merdivenle tahliye edilir.", tablo(["Afet", "Doğru davranış"], [["Deprem", "Çök-Kapan-Tutun"], ["Yangın", "?"]], "Afet anında davranışlar")),
      Q("Haritaya göre Müze'nin batısında hangi yer bulunur?", "Belediye", ["Okul", "Postane", "Park"], "Batı yönünde Belediye vardır.", svg(S.yonHaritasi({ merkez: "Müze", kuzey: "Okul", dogu: "Postane", guney: "Park", bati: "Belediye" }), "70%")),
    ],
    "2.1": [
      Q("Grafiğe göre ailenin bütçesinde en büyük pay hangi harcamaya aittir?", "Yiyecek", ["Kira", "Fatura", "Diğer"], "En büyük dilim yiyeceğe aittir (%40).", svg(S.pasta({ etiketler: ["Yiyecek (%40)", "Kira (%30)", "Fatura (%20)", "Diğer (%10)"], degerler: [40, 30, 20, 10] }), "80%")),
      Q("Şemada soru işareti yerine hangisi gelmelidir?", "Tüketim", ["Atık", "Hammadde", "Yatırım"], "Ürünler üretilir, dağıtılır ve tüketilir.", svg(S.zincir({ adlar: ["Üretim", "Dağıtım", "?"], renk: "#e4f1fb" }), "70%")),
    ],
    "2.2": [
      Q("Zaman şeridine göre TBMM hangi yılda açılmıştır?", "1920", ["1919", "1922", "1923"], "TBMM 23 Nisan 1920'de açılmıştır.", svg(S.zamanSeridi({ olaylar: [{ yil: "1919", ad: "19 Mayıs" }, { yil: "1920", ad: "TBMM açıldı" }, { yil: "1923", ad: "Cumhuriyet" }] }), "86%")),
      Q("Tabloya göre Ayşe'nin bir ayda tasarruf ettiği tutar kaç liradır?", "80", ["420", "500", "920"], "Tasarruf = gelir − gider = 500 − 420 = 80 TL.", tablo(["Gelir (TL)", "Gider (TL)"], [["500", "420"]], "Ayşe'nin aylık bütçesi")),
    ],
    "2.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Afrika", ["Asya", "Avrupa", "Güney Amerika"], "Mısır'ın başkenti Kahire'dir ve Afrika kıtasındadır.", tablo(["Ülke", "Başkent", "Kıta"], [["Fransa", "Paris", "Avrupa"], ["Japonya", "Tokyo", "Asya"], ["Mısır", "Kahire", "?"]], "Ülkeler")),
      Q("Tabloya göre Zafer Bayramı hangi tarihte kutlanır?", "30 Ağustos", ["23 Nisan", "19 Mayıs", "29 Ekim"], "Zafer Bayramı 30 Ağustos'ta kutlanır.", tablo(["Bayram", "Tarih"], [["Ulusal Egemenlik ve Çocuk Bayramı", "23 Nisan"], ["Atatürk'ü Anma, Gençlik ve Spor Bayramı", "19 Mayıs"], ["Zafer Bayramı", "?"], ["Cumhuriyet Bayramı", "29 Ekim"]], "Millî bayramlar")),
    ],
  },
  "5": {
    "1.1": [
      Q("Haritaya göre Y İli, Merkez İl'in hangi yönündedir?", "Doğu", ["Batı", "Kuzey", "Güney"], "Y İli, Merkez İl'in sağında (doğusunda) yer alır.", svg(S.yonHaritasi({ merkez: "Merkez İl", kuzey: "X İli", dogu: "Y İli", guney: "T İli", bati: "Z İli" }), "70%")),
      Q("Grafiğe göre yardım kampanyasında dört sınıfın topladığı toplam koli sayısı kaçtır?", "60", ["45", "55", "70"], "18 + 12 + 14 + 16 = 60.", svg(S.sutunGrafik({ etiketler: ["5/A", "5/B", "5/C", "5/D"], degerler: [18, 12, 14, 16], max: 20, adim: 5, yBaslik: "Koli sayısı" }), "78%")),
    ],
    "1.2": [
      Q("Tabloya göre Türkiye'nin batısında komşu olan devlet hangisidir?", "Yunanistan", ["Gürcistan", "İran", "Irak"], "Yunanistan, Türkiye'nin batısındadır.", tablo(["Komşu devlet", "Türkiye'ye göre yönü"], [["Yunanistan", "Batı"], ["Gürcistan", "Kuzeydoğu"], ["İran", "Doğu"], ["Irak", "Güney"]], "Komşu devletler")),
      Q("Haritaya göre Gölbaşı'nın güneyinde hangi yerleşim bulunur?", "Çiftlik", ["Dağköy", "Ovakent", "Limanlı"], "Güney yönünde Çiftlik vardır.", svg(S.yonHaritasi({ merkez: "Gölbaşı", kuzey: "Dağköy", dogu: "Ovakent", guney: "Çiftlik", bati: "Limanlı" }), "70%")),
    ],
    "1.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Para", ["Matbaa", "Pusula", "Barut"], "Parayı ilk kullananlardan biri Lidyalılardır.", tablo(["Medeniyet", "Katkısı"], [["Sümerler", "Çivi yazısı"], ["Lidyalılar", "?"]], "Medeniyetlerin katkıları")),
      Q("Zaman şeridine göre yazının icadıyla hangi dönem başlar?", "Tarihî çağlar", ["Taş devri", "Maden devri", "Tarih öncesi dönemler"], "Yazının bulunuşu tarihî çağların başlangıcıdır.", svg(S.zamanSeridi({ olaylar: [{ yil: "Taş Devri", ad: "Tarih öncesi" }, { yil: "Maden Devri", ad: "Tarih öncesi" }, { yil: "Yazının icadı", ad: "Tarihî çağlar başlar" }] }), "86%")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Çevreyi korumak", ["Çevreyi kirletmek", "Çevreyi görmezden gelmek", "Yalnızca haklarını istemek"], "Sağlıklı çevrede yaşama hakkının sorumluluğu çevreyi korumaktır.", tablo(["Hak", "Sorumluluk"], [["Eğitim görme", "Derslere düzenli devam etmek"], ["Sağlıklı çevrede yaşama", "?"]], "Hak ve sorumluluklar")),
      Q("Grafiğe göre okul meclisi seçiminde kazanan aday kimdir?", "A adayı", ["B adayı", "C adayı", "Oylar eşittir"], "En çok oyu A adayı almıştır (%45).", svg(S.pasta({ etiketler: ["A adayı (%45)", "B adayı (%35)", "C adayı (%20)"], degerler: [45, 35, 20] }), "80%")),
    ],
    "2.2": [
      Q("Grafiğe göre ailenin gelirinin yüzde kaçı tasarrufa ayrılmıştır?", "25", ["15", "35", "40"], "Tasarruf dilimi %25'tir.", svg(S.pasta({ etiketler: ["Market (%35)", "Fatura (%25)", "Ulaşım (%15)", "Tasarruf (%25)"], degerler: [35, 25, 15, 25] }), "80%")),
      Q("Tabloya göre ailenin bu ay bütçesinde artan para kaç liradır?", "2000", ["6000", "8000", "14000"], "Artan = gelir − gider = 8000 − 6000 = 2000 TL.", tablo(["Gelir (TL)", "Gider (TL)"], [["8000", "6000"]], "Ailenin aylık bütçesi")),
    ],
    "2.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Sanayi", ["Tarım", "Hizmet", "Ticaret"], "Fabrika işçiliği sanayi sektöründedir.", tablo(["Meslek", "Ekonomik sektör"], [["Çiftçi", "Tarım"], ["Öğretmen", "Hizmet"], ["Fabrika işçisi", "?"]], "Meslekler ve sektörler")),
      Q("Grafiğe göre haftalık ekran süresi en fazla olan gün hangisidir?", "Cumartesi", ["Pazartesi", "Çarşamba", "Cuma"], "En yüksek sütun cumartesiye aittir.", svg(S.sutunGrafik({ etiketler: ["Pzt", "Çar", "Cum", "Cmt"], degerler: [1, 2, 3, 5], max: 6, adim: 1, yBaslik: "Saat" }), "78%")),
    ],
  },
  "6": {
    "1.1": [
      Q("Tabloya göre alanı en büyük olan okyanus hangisidir?", "Büyük (Pasifik) Okyanus", ["Atlas Okyanusu", "Hint Okyanusu", "Üçü de eşittir"], "Pasifik Okyanusu en büyük okyanustur.", tablo(["Okyanus", "Yaklaşık alan (milyon km²)"], [["Büyük (Pasifik)", "165"], ["Atlas", "106"], ["Hint", "70"]], "Okyanusların alanları")),
      Q("Grafiğe göre alanı en büyük ikinci kıta hangisidir?", "Afrika", ["Asya", "Kuzey Amerika", "Avrupa"], "Asya 44,6; Afrika 30,4; Kuzey Amerika 24,7 milyon km² alana sahiptir.", svg(S.sutunGrafik({ etiketler: ["Asya", "Afrika", "K. Amerika"], degerler: [44.6, 30.4, 24.7], max: 50, adim: 10, yBaslik: "Milyon km²" }), "78%")),
    ],
    "1.2": [
      Q("Tabloya göre soru işareti yerine hangisi gelmelidir?", "Ormancılık", ["Balıkçılık", "Madencilik", "Gemicilik"], "Geniş ormanlık alanlarda ormancılık gelişir.", tablo(["Doğal çevre", "Beşerî faaliyet"], [["Verimli ova", "Tarım"], ["Kıyı şeridi", "Balıkçılık"], ["Geniş ormanlık alan", "?"]], "Doğal çevre ve faaliyetler")),
      Q("Zaman şeridine göre kuruluş tarihi en eski olan devlet hangisidir?", "Göktürk Devleti", ["Uygur Devleti", "Karahanlı Devleti", "Üçü de aynı yılda kurulmuştur"], "552 en eski tarihtir.", svg(S.zamanSeridi({ olaylar: [{ yil: "552", ad: "Göktürk" }, { yil: "744", ad: "Uygur" }, { yil: "840", ad: "Karahanlı" }] }), "86%")),
    ],
    "1.3": [
      Q("Zaman şeridine göre Malazgirt Savaşı hangi yılda yapılmıştır?", "1071", ["751", "1176", "1243"], "Malazgirt Savaşı 1071'de yapılmıştır.", svg(S.zamanSeridi({ olaylar: [{ yil: "751", ad: "Talas" }, { yil: "1071", ad: "Malazgirt" }, { yil: "1176", ad: "Miryokefalon" }] }), "86%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Matematik", ["Tıp", "Müzik", "Edebiyat"], "Harezmî matematik alanında (cebir) çalışmalarıyla bilinir.", tablo(["Bilim insanı", "Çalıştığı alan"], [["İbn-i Sina", "Tıp"], ["Harezmî", "?"]], "İslam medeniyetinde bilim insanları")),
    ],
    "2.1": [
      Q("Grafiğe göre sınıf başkanı seçiminde 3. sırada yer alan aday kimdir?", "C adayı", ["A adayı", "B adayı", "Oylar eşittir"], "Adaylar oy oranına göre A (%45), B (%35), C (%20) diye sıralanır; 3. sırada C adayı yer alır.", svg(S.pasta({ etiketler: ["A adayı (%45)", "B adayı (%35)", "C adayı (%20)"], degerler: [45, 35, 20] }), "80%")),
      Q("Karar alma sürecini gösteren şemada soru işareti yerine hangisi gelmelidir?", "Karar alma (oylama)", ["Unutma", "Vazgeçme", "Görmezden gelme"], "Önce sorun belirlenir, çözüm önerilir, sonra oylama ile karar alınır ve uygulanır.", svg(S.zincir({ adlar: ["Sorun belirleme", "Çözüm önerme", "?", "Uygulama"], renk: "#e4f1fb" }), "90%")),
    ],
    "2.2": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Hizmet", ["Tarım", "Sanayi", "Madencilik"], "Doktorluk hizmet sektöründedir.", tablo(["Meslek", "Sektör"], [["Çiftçi", "Tarım"], ["Doktor", "?"]], "Meslekler ve sektörler")),
      Q("Grafiğe göre öğrencilerin yüzde kaçı en çok kullandığı araç olarak bilgisayarı belirtmiştir?", "30", ["25", "45", "55"], "Bilgisayar dilimi %30'dur.", svg(S.pasta({ etiketler: ["Telefon (%45)", "Tablet (%25)", "Bilgisayar (%30)"], degerler: [45, 25, 30] }), "80%")),
    ],
    "2.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Karadeniz", ["Ege", "Akdeniz", "İç Anadolu"], "Fındık en çok Karadeniz Bölgesi'nde yetiştirilir.", tablo(["Ürün", "Yetiştirildiği bölge"], [["Çay", "Doğu Karadeniz"], ["Zeytin", "Ege"], ["Fındık", "?"]], "Tarım ürünleri")),
      Q("Grafiğe göre en çok çalışan hangi sektördedir?", "Hizmet", ["Sanayi", "Tarım", "Eşit dağılım"], "Hizmet dilimi %55'tir (örnek veri).", svg(S.pasta({ etiketler: ["Hizmet (%55)", "Sanayi (%30)", "Tarım (%15)"], degerler: [55, 30, 15] }), "80%")),
    ],
  },
  "7": {
    "1.1": [
      Q("Şemada gösterilen sıraya göre en son ortaya çıkan iletişim aracı hangisidir?", "İnternet", ["Mektup", "Telgraf", "Telefon"], "Sıralama: mektup, telgraf, telefon, internet.", svg(S.zincir({ adlar: ["Mektup", "Telgraf", "Telefon", "İnternet"], renk: "#e4f1fb" }), "90%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Olumsuz", ["Olumlu", "Tarafsız", "Etkisiz"], "Yerel kültürlerin zayıflaması küreselleşmenin olumsuz etkisidir.", tablo(["Küreselleşmenin etkisi", "Değerlendirme"], [["Kültürel etkileşimin artması", "Olumlu"], ["Yerel kültürlerin zayıflaması", "?"]], "Küreselleşme")),
    ],
    "1.2": [
      Q("Zaman şeridine göre İstanbul'un fethi hangi yılda gerçekleşmiştir?", "1453", ["1299", "1517", "1389"], "İstanbul 1453'te fethedilmiştir.", svg(S.zamanSeridi({ olaylar: [{ yil: "1299", ad: "Osmanlı kuruluşu" }, { yil: "1453", ad: "İstanbul'un fethi" }, { yil: "1517", ad: "Mısır'ın alınması" }] }), "86%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "İstimalet", ["İskân", "Devşirme", "Vergi"], "Fethedilen yerlerde halkın gönlünü kazanma politikasına istimalet denir.", tablo(["Politika", "Amacı"], [["İskân", "Fethedilen yerlere Türk nüfus yerleştirmek"], ["?", "Fethedilen yerlerde halkın gönlünü kazanmak"]], "Osmanlı fetih politikaları")),
    ],
    "1.3": [
      Q("Zaman şeridine göre Tanzimat Fermanı hangi yılda ilan edilmiştir?", "1839", ["1856", "1876", "1908"], "Tanzimat Fermanı 1839'da ilan edilmiştir.", svg(S.zamanSeridi({ olaylar: [{ yil: "1839", ad: "Tanzimat" }, { yil: "1856", ad: "Islahat Fermanı" }, { yil: "1876", ad: "I. Meşrutiyet" }] }), "86%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Din ve devlet işlerinin ayrı olması", ["Halkın yönetime katılmaması", "Devletin dinî kurallara göre yönetilmesi", "Hukukun yok sayılması"], "Laiklik, din ve devlet işlerinin birbirinden ayrılmasıdır.", tablo(["Cumhuriyetin niteliği", "Anlamı"], [["Demokratik", "Yönetimde halkın söz sahibi olması"], ["Laik", "?"]], "Türkiye Cumhuriyeti'nin nitelikleri")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Mahkemeler", ["TBMM", "Valilikler", "Belediyeler"], "Yargı yetkisini bağımsız mahkemeler kullanır.", tablo(["Kuvvet", "Kullanan organ"], [["Yasama", "TBMM"], ["Yürütme", "Cumhurbaşkanı ve bakanlar"], ["Yargı", "?"]], "Kuvvetler ayrılığı")),
      Q("Zaman şeridine göre TBMM hangi yılda açılmıştır?", "1920", ["1908", "1923", "1876"], "TBMM 23 Nisan 1920'de açılmıştır.", svg(S.zamanSeridi({ olaylar: [{ yil: "1876", ad: "I. Meşrutiyet" }, { yil: "1908", ad: "II. Meşrutiyet" }, { yil: "1920", ad: "TBMM" }, { yil: "1923", ad: "Cumhuriyet" }] }), "90%")),
    ],
    "2.2": [
      Q("Tabloya göre Birinci Beş Yıllık Sanayi Planı hangi yıl uygulamaya konmuştur?", "1934", ["1923", "1933", "1938"], "Birinci Beş Yıllık Sanayi Planı 1934'tedir.", tablo(["Kalkınma hamlesi", "Yıl"], [["İzmir İktisat Kongresi", "1923"], ["Sümerbank'ın kuruluşu", "1933"], ["Birinci Beş Yıllık Sanayi Planı", "?"]], "Millî kalkınma hamleleri")),
      Q("Grafiğe göre seçime katılım oranı en düşük olan yıl hangisidir?", "2010", ["2000", "2005", "2015"], "En kısa sütun 2010'a aittir.", svg(S.sutunGrafik({ etiketler: ["2000", "2005", "2010", "2015"], degerler: [80, 74, 62, 70], max: 100, adim: 20, yBaslik: "Katılım (%) - örnek veri" }), "78%")),
    ],
    "2.3": [
      Q("Grafiğe göre ekonomik gelişmişlik düzeyi en yüksek olan ülke hangisidir?", "A ülkesi", ["B ülkesi", "C ülkesi", "Hepsi eşittir"], "Kişi başına gelir en yüksek olan A ülkesidir (örnek veri).", svg(S.sutunGrafik({ etiketler: ["A ülkesi", "B ülkesi", "C ülkesi"], degerler: [40, 25, 8], max: 50, adim: 10, yBaslik: "Kişi başı gelir (bin $)" }), "78%")),
      Q("Grafiğe göre gelişmiş bir ülkede çalışanların en büyük bölümü hangi sektördedir?", "Hizmet", ["Tarım", "Sanayi", "Madencilik"], "Hizmet dilimi %60'tır (örnek veri).", svg(S.pasta({ etiketler: ["Hizmet (%60)", "Sanayi (%30)", "Tarım (%10)"], degerler: [60, 30, 10] }), "80%")),
    ],
  },
  "8": {
    "1.1": [
      Q("Zaman şeridine göre Mustafa Kemal hangi yılda doğmuştur?", "1881", ["1893", "1899", "1908"], "Mustafa Kemal 1881'de Selanik'te doğmuştur.", svg(S.zamanSeridi({ olaylar: [{ yil: "1881", ad: "Doğum" }, { yil: "1899", ad: "Harbiye'ye giriş" }, { yil: "1905", ad: "Kurmay subay" }] }), "86%")),
      Q("Zaman şeridine göre Trablusgarp Savaşı hangi yılda başlamıştır?", "1911", ["1908", "1912", "1914"], "Trablusgarp Savaşı 1911'de başlamıştır.", svg(S.zamanSeridi({ olaylar: [{ yil: "1908", ad: "II. Meşrutiyet" }, { yil: "1911", ad: "Trablusgarp" }, { yil: "1912", ad: "Balkan Savaşı" }] }), "86%")),
    ],
    "1.2": [
      Q("Tabloya göre Misakımillî hangi tarihte kabul edilmiştir?", "28 Ocak 1920", ["22 Haziran 1919", "23 Nisan 1920", "19 Mayıs 1919"], "Misakımillî 28 Ocak 1920'de Meclis-i Mebusan'da kabul edilmiş, 17 Şubat 1920'de ilan edilmiştir.", tablo(["Belge / olay", "Tarih"], [["Amasya Genelgesi", "22 Haziran 1919"], ["Misakımillî", "?"], ["TBMM'nin açılışı", "23 Nisan 1920"]], "Millî Mücadele belgeleri")),
      Q("Zaman şeridine göre Amasya Genelgesi hangi tarihte yayımlanmıştır?", "22 Haziran 1919", ["19 Mayıs 1919", "23 Nisan 1920", "30 Ağustos 1922"], "Amasya Genelgesi 22 Haziran 1919'da yayımlanmıştır.", svg(S.zamanSeridi({ olaylar: [{ yil: "19 Mayıs 1919", ad: "Samsun" }, { yil: "22 Haziran 1919", ad: "Amasya" }, { yil: "23 Nisan 1920", ad: "TBMM" }] }), "90%")),
    ],
    "1.3": [
      Q("Tabloya göre Güney Cephesi'nde Fransa ile imzalanan antlaşma hangisidir?", "Ankara Antlaşması (1921)", ["Gümrü Antlaşması", "Mudanya Ateşkesi", "Lozan Antlaşması"], "Güney Cephesi'nde Fransa ile 1921'de Ankara Antlaşması imzalanmıştır.", tablo(["Cephe", "Sonuç"], [["Doğu Cephesi", "Gümrü Antlaşması (1920)"], ["Batı Cephesi", "Sakarya Meydan Muharebesi (1921)"], ["Güney Cephesi", "?"]], "Millî Mücadele cepheleri")),
      Q("Zaman şeridine göre Büyük Taarruz hangi yılda başlamıştır?", "1922", ["1921", "1920", "1923"], "Büyük Taarruz 26 Ağustos 1922'de başlamıştır.", svg(S.zamanSeridi({ olaylar: [{ yil: "1921", ad: "II. İnönü" }, { yil: "1921", ad: "Sakarya" }, { yil: "1922", ad: "Büyük Taarruz" }] }), "86%")),
    ],
    "2.1": [
      Q("Tabloya göre Harf İnkılabı, Halifeliğin kaldırılmasından kaç yıl sonra yapılmıştır?", "4", ["6", "2", "10"], "Halifelik 1924'te kaldırılmış, Harf İnkılabı 1928'de yapılmıştır; 1928 - 1924 = 4 yıl.", tablo(["İnkılap", "Yıl"], [["Saltanatın kaldırılması", "1922"], ["Halifeliğin kaldırılması", "1924"], ["Harf İnkılabı", "?"]], "Atatürk inkılapları")),
      Q("Tabloya göre Medeni Kanun'un kabul edildiği yıl, Cumhuriyet'in ilanından kaç yıl sonradır?", "3", ["5", "1", "11"], "Cumhuriyet 1923'te ilan edilmiş, Medeni Kanun 1926'da kabul edilmiştir; 1926 - 1923 = 3 yıl.", tablo(["İnkılap", "Yıl"], [["Cumhuriyet'in ilanı", "1923"], ["Medeni Kanun", "?"], ["Harf İnkılabı", "1928"]], "Atatürk inkılapları")),
    ],
    "2.2": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Din ve devlet işlerinin birbirinden ayrılması", ["Egemenliğin kişiye ait olması", "Devletin ekonomiye hiç karışmaması", "Halkın yönetime katılmaması"], "Laiklik, din ve devlet işlerinin ayrılmasıdır.", tablo(["Atatürk ilkesi", "Anlamı"], [["Cumhuriyetçilik", "Egemenliğin millete ait olması"], ["Laiklik", "?"]], "Atatürk ilkeleri")),
      Q("Zaman şeridine göre Serbest Cumhuriyet Fırkası hangi yılda kurulmuştur?", "1930", ["1924", "1926", "1938"], "Serbest Cumhuriyet Fırkası 1930'da kurulmuştur.", svg(S.zamanSeridi({ olaylar: [{ yil: "1924", ad: "Terakkiperver Fırka" }, { yil: "1930", ad: "Serbest Cumhuriyet Fırkası" }] }), "80%")),
    ],
    "2.3": [
      Q("Zaman şeridine göre Sadabat Paktı hangi yılda imzalanmıştır?", "1937", ["1934", "1936", "1939"], "Sadabat Paktı 1937'de imzalanmıştır.", svg(S.zamanSeridi({ olaylar: [{ yil: "1934", ad: "Balkan Antantı" }, { yil: "1936", ad: "Montrö" }, { yil: "1937", ad: "Sadabat Paktı" }, { yil: "1939", ad: "Hatay" }] }), "92%")),
      Q("Tabloya göre Atatürk'ün naaşı hangi yıl Anıtkabir'e nakledilmiştir?", "1953", ["1938", "1939", "1945"], "Atatürk'ün naaşı 10 Kasım 1953'te Anıtkabir'e nakledilmiştir.", tablo(["Olay", "Tarih"], [["Atatürk'ün vefatı", "10 Kasım 1938"], ["II. Dünya Savaşı'nın başlaması", "1939"], ["Anıtkabir'e nakil", "?"]], "Atatürk sonrası gelişmeler")),
    ],
  },
};
