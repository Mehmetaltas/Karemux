// Türkçe: görselli sorular (afiş/duyuru/davetiye kartları, tablolar, grafikler).
import { S, svg, tablo, Q } from "./gorselli-yardim.js";
const kart = (baslik, satirlar, renk) => svg(S.kart({ baslik, satirlar, renk }), "64%");
export default {
  "4": {
    "1.1": [
      Q("Afişe göre etkinlik nerede yapılacaktır?", "Okul kütüphanesinde", ["Spor salonunda", "Müzik odasında", "Okul bahçesinde"], "Afişte yer bilgisi: Okul kütüphanesi.", kart("KİTAP OKUMA ETKİNLİĞİ", ["Yer: Okul kütüphanesi", "Tarih: 14 Kasım Cuma", "Saat: 10.30", "Katılım: 4. sınıflar"])),
      Q("Tabloya göre en çok sayfa okuyan öğrenci kimdir?", "Mert", ["Zeynep", "Elif", "Üçü de eşit sayfa okumuştur"], "31 sayfa ile en çok okuyan Mert'tir.", tablo(["Öğrenci", "Okuduğu sayfa"], [["Zeynep", "24"], ["Mert", "31"], ["Elif", "18"]], "Okunan sayfa sayısı")),
    ],
    "1.2": [
      Q("Grafiğe göre en az kitap okuyan öğrenci kimdir?", "Can", ["Ada", "Berk", "Deniz"], "En kısa sütun Can'a aittir.", svg(S.sutunGrafik({ etiketler: ["Ada", "Berk", "Can", "Deniz"], degerler: [7, 5, 3, 6], max: 8, adim: 2, yBaslik: "Kitap sayısı" }), "78%")),
      Q("Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Kısa", ["Uzak", "Geniş", "Dar"], "Uzun sözcüğünün zıt anlamlısı kısadır.", tablo(["Sözcük", "Zıt anlamlısı"], [["Açık", "Kapalı"], ["Uzun", "?"]], "Zıt anlamlı sözcükler")),
    ],
    "1.3": [
      Q("Davetiyede aşağıdaki bilgilerden hangisi eksiktir?", "Davet edenin adı", ["Tarih", "Saat", "Yer"], "Davetiyede tarih, saat ve yer vardır; davet eden kişinin adı yazılmamıştır.", kart("DAVETİYE", ["Doğum günü partisi", "Tarih: 8 Mart", "Saat: 15.00", "Yer: Çocuk parkı"], "#c0504d")),
      Q("Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Çocuklar", ["Çocukta", "Çocuğu", "Çocuksu"], "Çoğul eki -lar: çocuklar.", tablo(["Tekil", "Çoğul"], [["Kalem", "Kalemler"], ["Çocuk", "?"]], "Tekil ve çoğul")),
    ],
    "2.1": [
      Q("Afişe göre yarışmaya hangi sınıflar katılabilir?", "4. ve 5. sınıflar", ["Yalnız 4. sınıflar", "6. ve 7. sınıflar", "Tüm sınıflar"], "Afişte katılım: 4. ve 5. sınıflar yazmaktadır.", kart("ROBOT YARIŞMASI", ["Tarih: 5 Mayıs", "Yer: Spor salonu", "Katılım: 4. ve 5. sınıflar"], "#2e8b57")),
      Q("Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Çabuk", ["Yavaş", "Büyük", "Sessiz"], "Hızlı sözcüğünün eş anlamlısı çabuktur.", tablo(["Sözcük", "Eş anlamlısı"], [["Güzel", "Hoş"], ["Hızlı", "?"]], "Eş anlamlı sözcükler")),
    ],
    "2.2": [
      Q("Afişe göre spor yarışmaları saat kaçta başlayacaktır?", "13.00", ["10.00", "11.00", "15.00"], "Afişte spor yarışmalarının saati 13.00'tür.", kart("23 NİSAN ŞENLİĞİ", ["Gösteriler: 10.00", "Spor yarışmaları: 13.00", "Yer: Okul bahçesi"], "#e8803a")),
      Q("Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Yapraklar", ["Yaprakta", "Yaprağı", "Yapraklı"], "Çoğul eki -lar: yapraklar.", tablo(["Tekil", "Çoğul"], [["Ağaç", "Ağaçlar"], ["Yaprak", "?"]], "Tekil ve çoğul")),
    ],
    "2.3": [
      Q("Grafiğe göre en çok rüzgârlı gün hangi ayda yaşanmıştır?", "Mart", ["Şubat", "Nisan", "Mayıs"], "En yüksek sütun Mart'a aittir.", svg(S.sutunGrafik({ etiketler: ["Şubat", "Mart", "Nisan", "Mayıs"], degerler: [6, 11, 8, 4], max: 12, adim: 2, yBaslik: "Gün sayısı" }), "78%")),
      Q("Afişe göre uçurtma yarışması hangi gün yapılacaktır?", "Cumartesi", ["Cuma", "Pazar", "Pazartesi"], "Afişte gün bilgisi: Cumartesi.", kart("UÇURTMA YARIŞMASI", ["Gün: Cumartesi", "Saat: 14.00", "Yer: Sahil parkı"], "#2c6fbb")),
    ],
  },
  "5": {
    "1.1": [
      Q("Duyuruya göre oyun günü nerede yapılacaktır?", "Okul bahçesinde", ["Sınıfta", "Kütüphanede", "Spor salonunda"], "Duyuruda yer: Okul bahçesi.", kart("OYUN GÜNÜ DUYURUSU", ["Gün: Cuma", "Saat: 13.30", "Yer: Okul bahçesi"], "#e8803a")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Ünlem cümlesi", ["Soru cümlesi", "Emir cümlesi", "Olumsuz cümle"], "“Ne güzel bir gün!” duygu belirten bir ünlem cümlesidir.", tablo(["Cümle", "Türü"], [["Kapıyı kapat.", "Emir cümlesi"], ["Ne güzel bir gün!", "?"]], "Cümle türleri")),
    ],
    "1.2": [
      Q("Grafiğe göre en çok sevilen oyun hangisidir?", "İp atlama", ["Saklambaç", "Misket", "Üçü eşit sevilmektedir"], "En yüksek sütun ip atlamaya aittir.", svg(S.sutunGrafik({ etiketler: ["Saklambaç", "Misket", "İp atlama"], degerler: [12, 8, 15], max: 16, adim: 4, yBaslik: "Öğrenci sayısı" }), "78%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "İsim (ad)", ["Sıfat", "Fiil (eylem)", "Zarf"], "Kitap varlık adı olduğundan isimdir.", tablo(["Sözcük", "Türü"], [["Güzel", "Sıfat"], ["Koşmak", "Fiil (eylem)"], ["Kitap", "?"]], "Sözcük türleri")),
    ],
    "1.3": [
      Q("Mektubu yazan kişi kimdir?", "Ela", ["Anneanne", "Anne", "Baba"], "Mektubu yazan kişi imzasında yazan Ela'dır.", svg(S.kart({ baslik: "MEKTUP", satirlar: ["Sevgili Anneanne,", "Seni çok özledim.", "Hafta sonu sana geleceğim.", "Torunun Ela"], renk: "#8e6bb0", genis: 340 }), "64%")),
      Q("Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Yanlış", ["Güzel", "Hızlı", "Büyük"], "Doğru sözcüğünün zıt anlamlısı yanlıştır.", tablo(["Sözcük", "Zıt anlamlısı"], [["Sevinç", "Üzüntü"], ["Doğru", "?"]], "Zıt anlamlı sözcükler")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine hangi anlam gelmelidir?", "Gelecek için birikim yapmak gerekir", ["Para harcamak güzeldir", "Beyaz renk en güzel renktir", "Kara günde para yoktur"], "“Ak akçe kara gün içindir” sözü ihtiyaç anı için tasarruf edilmesini öğütler.", tablo(["Atasözü", "Anlamı"], [["Damlaya damlaya göl olur.", "Küçük birikimler zamanla büyür."], ["Ak akçe kara gün içindir.", "?"]], "Atasözleri")),
      Q("Grafiğe göre en fazla kitap okuyan sınıf hangisidir?", "5/B", ["5/A", "5/C", "5/D"], "En yüksek sütun 5/B'ye aittir.", svg(S.sutunGrafik({ etiketler: ["5/A", "5/B", "5/C", "5/D"], degerler: [40, 55, 35, 48], max: 60, adim: 10, yBaslik: "Kitap sayısı" }), "78%")),
    ],
    "2.2": [
      Q("Duyuruya göre kitap kampanyasında hangi tarihe kadar kitap getirilebilir?", "20 Mayıs", ["10 Mayıs", "30 Mayıs", "5 Haziran"], "Son tarih duyuruda 20 Mayıs olarak verilmiştir.", kart("KİTAP KAMPANYASI", ["Okul kütüphanesine kitap bağışlayın.", "Son tarih: 20 Mayıs", "Teslim yeri: Müdür yardımcısı odası"], "#2e8b57")),
      Q("Tabloda soru işareti yerine hangi anlam gelmelidir?", "Cömert", ["Cimri", "Yorgun", "Sessiz"], "“Eli açık” cömert kişi anlamındadır.", tablo(["Deyim", "Anlamı"], [["Gözü tok", "Açgözlü olmayan"], ["Eli açık", "?"]], "Deyimler")),
    ],
    "2.3": [
      Q("Programa göre yürüyüş saat kaçta başlayacaktır?", "09.00", ["08.00", "10.00", "11.30"], "Programda yürüyüşün başlangıç saati 09.00'dır.", kart("DOĞA YÜRÜYÜŞÜ", ["Toplanma: 08.30 (okul bahçesi)", "Yürüyüş başlangıcı: 09.00", "Dönüş: 12.00"], "#2e8b57")),
      Q("Tabloda “yüz” sözcüğü ikinci cümlede hangi anlamda kullanılmıştır?", "Sayı (100)", ["Surat", "Yüzmek", "Kaplamak"], "“Sınıfta yüz öğrenci var.” cümlesinde yüz, sayı bildirir.", tablo(["Cümle", "“Yüz” sözcüğünün anlamı"], [["Yüzünü yıkadı.", "Surat"], ["Sınıfta yüz öğrenci var.", "?"]], "Sesteş sözcükler")),
    ],
  },
  "6": {
    "1.1": [
      Q("Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Okul", ["Ders", "Hoca", "Kitap"], "Mektep sözcüğünün günümüz Türkçesindeki karşılığı okuldur.", tablo(["Eski sözcük", "Günümüz Türkçesi"], [["Hâdise", "Olay"], ["Mektep", "?"]], "Sözcüklerin karşılıkları")),
      Q("Grafiğe göre en az okunan kitap türü hangisidir?", "Şiir", ["Roman", "Hikâye", "Hepsi eşit okunmaktadır"], "En kısa sütun şiire aittir.", svg(S.sutunGrafik({ etiketler: ["Roman", "Hikâye", "Şiir"], degerler: [14, 9, 6], max: 16, adim: 4, yBaslik: "Okuyan sayısı" }), "76%")),
    ],
    "1.2": [
      Q("Afişe göre sergi hangi saatler arasında açıktır?", "10.00 – 17.00", ["09.00 – 12.00", "13.00 – 20.00", "08.00 – 16.00"], "Afişte açık olduğu saat aralığı 10.00 – 17.00'dir.", kart("RESİM SERGİSİ", ["Yer: Kültür Merkezi", "Tarih: 3 – 9 Aralık", "Saat: 10.00 – 17.00", "Giriş ücretsizdir."], "#8e6bb0")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Dikkatle dinlemek", ["Yüksek sesle konuşmak", "Uzaklaşmak", "Susmak"], "“Kulak vermek” dikkatle dinlemek anlamındadır.", tablo(["Deyim", "Anlamı"], [["Ağzı kulaklarında", "Çok sevinçli"], ["Kulak vermek", "?"]], "Deyimler")),
    ],
    "1.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Emir cümlesi", ["Soru cümlesi", "Ünlem cümlesi", "Olumsuz cümle"], "“Kitabı masaya bırak.” bir şeyin yapılmasını isteyen emir cümlesidir.", tablo(["Cümle", "Türü"], [["Yarın okula gidecek misin?", "Soru cümlesi"], ["Kitabı masaya bırak.", "?"]], "Cümle türleri")),
      Q("Grafiğe göre yüzde kaç öğrenci spor kitabı okumayı tercih etmektedir?", "25", ["15", "35", "40"], "Spor dilimi %25'tir.", svg(S.pasta({ etiketler: ["Macera (%40)", "Bilim (%35)", "Spor (%25)"], degerler: [40, 35, 25] }), "80%")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Sessiz", ["Hareketli", "Büyük", "Hızlı"], "Gürültülü sözcüğünün zıt anlamlısı sessizdir.", tablo(["Sözcük", "Zıt anlamlısı"], [["İleri", "Geri"], ["Gürültülü", "?"]], "Zıt anlamlı sözcükler")),
      Q("Kılavuza göre yeni mahalleye alışmak için ilk adım nedir?", "Komşularla tanışmak", ["Eve kapanmak", "Evden hiç çıkmamak", "Komşulardan uzak durmak"], "Kılavuzda ilk adım komşularla tanışmaktır.", svg(S.zincir({ adlar: ["Komşuyla tanış", "Çevreyi gez", "Arkadaş edin"], renk: "#e4f1fb" }), "80%"), {u:"İletişim ve Sosyal İlişkiler", k:"Yeni Mahalleye Alışma Kılavuzu"}),
    ],
    "2.2": [
      Q("Grafiğe göre en uzun süre ekrana bakan öğrenci kimdir?", "Eda", ["Ali", "Selin", "Burak"], "En yüksek sütun Eda'ya aittir.", svg(S.sutunGrafik({ etiketler: ["Ali", "Eda", "Selin", "Burak"], degerler: [2, 5, 3, 1], max: 6, adim: 1, yBaslik: "Günlük saat" }), "78%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "İlgisiz, sevgisiz bakış", ["Güzel bakış", "Hızlı bakış", "Gizli bakış"], "“Soğuk bakış” mecaz anlamda ilgisiz, sevgisiz bakıştır.", tablo(["Söz", "Anlamı"], [["Tatlı dil", "Yumuşak, nazik konuşma"], ["Soğuk bakış", "?"]], "Mecaz anlamlı sözler")),
    ],
    "2.3": [
      Q("Afişe göre bilim şenliğinin son günü hangisidir?", "12 Mayıs", ["10 Mayıs", "11 Mayıs", "13 Mayıs"], "Afişte şenlik 10 – 12 Mayıs tarihleri arasındadır.", kart("BİLİM ŞENLİĞİ", ["Tarih: 10 – 12 Mayıs", "Yer: Okul bahçesi", "Deneyler ve robot gösterisi"], "#2c6fbb")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Millî Eğitim Bakanlığı", ["Millî Emniyet Birliği", "Mahalli Eğitim Birimi", "Merkezî Eğitim Bürosu"], "MEB kısaltması Millî Eğitim Bakanlığı'nın açılımıdır.", tablo(["Kısaltma", "Açılımı"], [["TDK", "Türk Dil Kurumu"], ["TBMM", "Türkiye Büyük Millet Meclisi"], ["MEB", "?"]], "Kısaltmalar")),
    ],
  },
  "7": {
    "1.1": [
      Q("Afişe göre spor etkinliğine hangi sınıflar katılacaktır?", "7. sınıflar", ["5. sınıflar", "6. sınıflar", "8. sınıflar"], "Afişte katılım: 7. sınıflar.", kart("SPOR ETKİNLİĞİ", ["Katılım: 7. sınıflar", "Gün: Çarşamba", "Yer: Spor salonu"], "#e8803a")),
      Q("Tabloda soru işareti yerine hangi söz sanatı gelmelidir?", "Kişileştirme", ["Benzetme", "Abartma", "Konuşturma"], "Güneşe insana ait gülümseme özelliği verilmiştir; kişileştirmedir.", tablo(["Cümle", "Söz sanatı"], [["Gözleri elmas gibi parlıyordu.", "Benzetme"], ["Güneş gülümsedi.", "?"]], "Söz sanatları")),
    ],
    "1.2": [
      Q("Grafiğe göre okuma saatleri en yüksek olan gün hangisidir?", "Pazar", ["Cuma", "Cumartesi", "Pazartesi"], "En yüksek sütun pazar gününe aittir.", svg(S.sutunGrafik({ etiketler: ["Cuma", "Cmt", "Pazar", "Pzt"], degerler: [1, 2, 3, 1], max: 4, adim: 1, yBaslik: "Saat" }), "76%")),
      Q("Tabloda soru işareti yerine hangi anlatım biçimi gelmelidir?", "Öyküleyici anlatım", ["Betimleyici anlatım", "Açıklayıcı anlatım", "Tartışmacı anlatım"], "Bir olayın sırayla anlatıldığı metinlerde öyküleyici anlatım kullanılır.", tablo(["Metin", "Anlatım biçimi"], [["Bir eşyanın özelliklerini anlatan metin", "Betimleyici anlatım"], ["Bir olayın sırayla anlatıldığı metin", "?"]], "Anlatım biçimleri")),
    ],
    "1.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Okudu", ["Ali", "Kitabı", "Cümle"], "“Ali kitabı okudu.” cümlesinde yüklem okudu'dur.", tablo(["Cümle", "Yüklem"], [["Çocuklar bahçede oynadı.", "Oynadı"], ["Ali kitabı okudu.", "?"]], "Cümlenin ögeleri")),
      Q("Davetiyeye göre toplantı hangi gün yapılacaktır?", "Salı", ["Pazartesi", "Çarşamba", "Perşembe"], "Davetiyede gün bilgisi salıdır.", kart("TOPLANTI DAVETİ", ["Gün: Salı", "Saat: 14.00", "Yer: Konferans salonu"], "#2c6fbb")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Kitap", ["Kitapçı", "Kitapta", "Okuma"], "Kitaplık sözcüğü kitap köküne -lık ekiyle türetilmiştir.", tablo(["Sözcük", "Kökü"], [["Gözlük", "Göz"], ["Kitaplık", "?"]], "Sözcüklerin kökleri")),
      Q("Grafiğe göre en çok tercih edilen sanat dalı hangisidir?", "Ebru", ["Tiyatro", "Kilim", "Hepsi eşit"], "En yüksek sütun ebruya aittir.", svg(S.sutunGrafik({ etiketler: ["Ebru", "Tiyatro", "Kilim"], degerler: [18, 11, 7], max: 20, adim: 5, yBaslik: "Öğrenci sayısı" }), "76%")),
    ],
    "2.2": [
      Q("Afişe göre sergide ne sergilenmektedir?", "Kilimler", ["Resimler", "Heykeller", "Fotoğraflar"], "Afişte sergilenen eserler kilimdir.", kart("KİLİM SERGİSİ", ["Yer: Halk Eğitim Merkezi", "Tarih: 1 – 7 Mart", "Anadolu kilimleri sergilenecektir."], "#c0504d")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Sahnede oyuncuların canlandırdığı oyun", ["Su üzerine yapılan resim", "Dokuma halı", "Tarih yazma sanatı"], "Tiyatro, oyuncuların bir oyunu sahnede canlandırmasıdır.", tablo(["Kavram", "Anlamı"], [["Ebru", "Su üzerine boyayla yapılan kâğıt süsleme sanatı"], ["Tiyatro", "?"]], "Sanat terimleri")),
    ],
    "2.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Okula gitme", ["Hastaneye gitmeyi reddetme", "Çalışma zorunluluğu", "Oy kullanamama"], "Eğitim hakkı, okula gidebilme hakkıdır.", tablo(["Hak", "Anlamı"], [["Sağlık hakkı", "Hastalandığında tedavi olabilme"], ["Eğitim hakkı", "?"]], "Çocuk hakları")),
      Q("Kurallara göre kütüphanede hangisi yapılabilir?", "Sessizce kitap okumak", ["Yüksek sesle konuşmak", "Yemek yemek", "Kitapların sayfalarını koparmak"], "Kütüphane kurallarında sessizlik esastır.", kart("KÜTÜPHANE KURALLARI", ["1. Sessiz olalım.", "2. Yiyecek içecek getirmeyelim.", "3. Kitaplara özen gösterelim."], "#2e8b57")),
    ],
  },
  "8": {
    "1.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Sıfat-fiil", ["Zarf-fiil", "İsim-fiil", "Yüklem"], "“Okunacak kitap” ifadesinde fiil kitabı niteler; sıfat-fiildir.", tablo(["İfade", "Fiilimsi türü"], [["Koşarak geldi.", "Zarf-fiil"], ["Okunacak kitap", "?"]], "Fiilimsiler")),
      Q("Afişe göre kitap fuarı ne zaman başlayacaktır?", "4 Kasım", ["11 Kasım", "20 Kasım", "1 Aralık"], "Afişte fuarın başlama tarihi 4 Kasım'dır.", kart("KİTAP FUARI", ["Başlangıç: 4 Kasım", "Bitiş: 11 Kasım", "Yer: Fuar alanı"], "#8e6bb0")),
    ],
    "1.2": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Mektup", ["Haber", "Anı", "Tiyatro"], "“Sevgili dostum, …” diye başlayan metin mektuptur.", tablo(["Metin", "Türü"], [["Yarın yağmur bekleniyor.", "Haber"], ["Sevgili dostum, …", "?"]], "Metin türleri")),
      Q("Grafiğe göre en çok okunan bölüm hangisidir?", "Teknoloji", ["Tarih", "Spor", "Sanat"], "En yüksek sütun teknolojiye aittir.", svg(S.sutunGrafik({ etiketler: ["Tarih", "Spor", "Teknoloji", "Sanat"], degerler: [8, 12, 20, 6], max: 24, adim: 4, yBaslik: "Okuyucu sayısı" }), "78%")),
    ],
    "1.3": [
      Q("Tabloda soru işareti yerine hangi yazar gelmelidir?", "Kaşgarlı Mahmud", ["Yusuf Has Hacib", "Yunus Emre", "Fuzuli"], "Divanü Lügati't-Türk'ün yazarı Kaşgarlı Mahmud'dur.", tablo(["Eser", "Yazarı"], [["Kutadgu Bilig", "Yusuf Has Hacib"], ["Divanü Lügati't-Türk", "?"]], "Eserler ve yazarları")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Eylem (fiil)", ["İsim", "Sıfat", "Edat"], "Gelmek eylem bildiren sözcüktür.", tablo(["Sözcük", "Türü"], [["Masa", "İsim"], ["Gelmek", "?"], ["Güzel", "Sıfat"]], "Sözcük türleri")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Açıklama yapılacak cümlenin sonunda", ["Cümlenin başında", "Soru cümlesinin sonunda", "Hiçbir cümlede"], "İki nokta, açıklama yapılacak cümlenin sonuna konur.", tablo(["Noktalama işareti", "Kullanıldığı yer"], [["Virgül (,)", "Sıralı sözcükleri ayırırken"], ["İki nokta (:)", "?"]], "Noktalama işaretleri")),
      Q("Afişe göre robot sergisi hangi saatte başlayacaktır?", "10.00", ["09.00", "11.00", "14.00"], "Afişte başlangıç saati 10.00'dur.", kart("ROBOT SERGİSİ", ["Gün: Cumartesi", "Saat: 10.00", "Yer: Bilim merkezi"], "#2c6fbb")),
    ],
    "2.2": [
      Q("Grafiğe göre en çok ilgi gören bilim dalı hangisidir?", "Uzay", ["Tarih", "Kimya", "Hepsi eşit"], "En yüksek sütun uzaya aittir.", svg(S.sutunGrafik({ etiketler: ["Uzay", "Kimya", "Tarih"], degerler: [22, 14, 9], max: 24, adim: 4, yBaslik: "Öğrenci sayısı" }), "76%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Karşıtlık bildirir", ["Ekleme bildirir", "Zaman bildirir", "Soru bildirir"], "“Ama” bağlacı karşıtlık bildirir.", tablo(["Bağlaç", "Görevi"], [["Ve", "Eş görevli sözcükleri bağlar"], ["Ama", "?"]], "Bağlaçlar")),
    ],
    "2.3": [
      Q("Mektuba göre yazar nereden yazmaktadır?", "Ardahan'dan", ["Kars'tan", "Erzurum'dan", "Van'dan"], "Mektubun başlığında yazarın bulunduğu yer Ardahan olarak verilmiştir.", kart("MEKTUP", ["Ardahan, 3 Şubat", "Sevgili dostum,", "Burada kar çok yağdı. Seni özledim.", "Yaren"], "#8e6bb0")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Güneşe yönelir", ["Karanlığa yönelir", "Hiç hareket etmez", "Kökünü havaya çıkarır"], "Ayçiçeği güneş ışığına doğru yönelir.", tablo(["Bitki", "Hareketi"], [["Ayçiçeği", "?"], ["Küsmenot (mimoza)", "Dokunulunca yapraklarını kapatır"]], "Bitkilerde hareket")),
    ],
  },
};
