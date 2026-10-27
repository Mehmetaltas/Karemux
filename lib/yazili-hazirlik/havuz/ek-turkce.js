// Plandaki boşluk konuları için eklenen sorular. Biçim: { "sınıf": { "ek": [ [soru, [seçenekler], doğruİndeks, açıklama, gorsel|null, {u:"ünite", k:"konu"}] ] } }
// Tüm metinler özgündür (ders kitabı metni kopyalanmamıştır). Q(): doğru seçenek ilk sırada yazılır; üretimde karıştırılır.
import { S, svg, tablo, Q } from "./gorselli-yardim.js";
const kart = (baslik, satirlar, renk) => svg(S.kart({ baslik, satirlar, renk }), "64%");
const T = (u, k, liste) => liste.map(([s, d, y, a, g]) => [...Q(s, d, y, a, g || null), { u, k }]);

const s4 = [
  ...T("Okuma Kültürü", "Hikâyesi Olmayan Kitap", [
    ["Dünya haritasında ülkelerin yerlerini görmek isteyen bir öğrenci hangi kitaba bakmalıdır?", "Atlas", ["Roman", "Masal kitabı", "Şiir kitabı"], "Haritaların toplandığı bilgi kitabı atlastır; hikâyesi yoktur."],
    ["Bir sözcüğün anlamını öğrenmek için aşağıdakilerden hangisine başvurulur?", "Sözlük", ["Atlas", "Roman", "Fabl kitabı"], "Sözcüklerin anlamları sözlükte bulunur."],
    ["“Arılar çiçeklerden topladığı özsuyunu bala dönüştürür. Kovandaki arılar kışı bu bal sayesinde geçirir.” Metne göre arılar kışı neyle geçirir?", "Bal ile", ["Şekerle", "Çiçekle", "Yağmur suyuyla"], "Metinde kışın bal sayesinde geçirildiği söylenmektedir."],
    ["Tabloya göre sözcüklerin anlamını öğrenmek isteyen kişi hangi kitaptan yararlanmalıdır?", "Sözlük", ["Atlas", "Ansiklopedi", "Hiçbir kitaptan yararlanamaz"], "Tabloda sözcük anlamı için sözlük gösterilmiştir.", tablo(["Kitap", "Ne için kullanılır?"], [["Sözlük", "Sözcüklerin anlamı"], ["Atlas", "Haritalar"], ["Ansiklopedi", "Genel bilgiler"]], "Hikâyesi olmayan kitaplar")],
  ]),
  ...T("Millî Mücadele ve Atatürk", "Hacı İbrahim Efendi: Mehmetçige Dikilen Botlar", [
    ["“Ayakkabı ustası, gece gündüz çalışıp askerler için bot dikti. Botların içine yün astar koydu, çünkü askerlerin ayakları üşümesin istiyordu.” Usta botlara neden yün astar koymuştur?", "Askerlerin ayakları üşümesin diye", ["Botlar daha güzel görünsün diye", "Botlar daha ağır olsun diye", "Botlar daha ucuza satılsın diye"], "Metinde nedeni açıkça belirtilmiştir: ayakları üşümesin."],
    ["Yukarıdaki metindeki ayakkabı ustasının hangi özelliği öne çıkmaktadır?", "Vatansever ve fedakâr olması", ["Tembel olması", "Korkak olması", "Cimri olması"], "Gece gündüz çalışarak askerleri düşünmesi fedakârlığını ve vatan sevgisini gösterir."],
    ["“Usta botları özenle dikti.” cümlesinin yüklemi hangisidir?", "dikti", ["Usta", "botları", "özenle"], "Cümlede iş, oluş ya da durumu bildiren sözcük “dikti”dir."],
    ["Aşağıdaki cümlelerden hangisinin yazımı doğrudur?", "Ayşe'nin babası ayakkabı ustasıdır.", ["Ayşenin babası ayakkabı ustasıdır.", "ayşe'nin babası ayakkabı ustasıdır.", "Ayşe'nin Babası ayakkabı ustasıdır."], "Özel adlara gelen ekler kesme işaretiyle ayrılır ve özel adlar büyük harfle başlar; “baba” cins addır."],
  ]),
  ...T("Erdemler", "Maysa ile Bulut", [
    ["“Maysa, kuruyan bahçe için gökyüzündeki buluta seslendi. Bulut yağmur olup bahçeyi suladı. Maysa teşekkür etti.” Bahçeyi kim sulamıştır?", "Bulut", ["Maysa", "Rüzgâr", "Bahçıvan"], "Metinde bulutun yağmur olup bahçeyi suladığı yazılıdır."],
    ["“Kuru” sözcüğünün zıt anlamlısı aşağıdakilerden hangisidir?", "Islak", ["Sert", "Eski", "Uzun"], "Kuru ve ıslak birbirinin karşıt anlamlısıdır."],
    ["Aşağıdaki cümlelerden hangisinin sonuna soru işareti konmalıdır?", "Bahçeyi kim suladı", ["Bulut yağmur yağdırdı", "Maysa çok sevindi", "Bahçe yeniden yeşerdi"], "Soru anlamı taşıyan cümlenin sonuna soru işareti konur; diğerleri bilgi verir."],
    ["Maysa'nın yardım edilince teşekkür etmesi hangi erdemi gösterir?", "Nezaket ve minnettarlığı", ["Bencilliği", "Kıskançlığı", "Tembelliği"], "İyiliğe teşekkürle karşılık vermek nezaket ve minnettarlık göstergesidir."],
  ]),
  ...T("Millî Kültürümüz", "Zamane Kedisi Fıldır: Yatıya Misafir", [
    ["“Fıldır, komşunun evine gidince kapıda ayakkabılarını çıkardı ve ev sahibine selam verdi.” Fıldır'ın bu davranışları neyi gösterir?", "Misafirlik adabına uyduğunu", ["Utangaç olduğunu", "Acelesi olduğunu", "Kızgın olduğunu"], "Ayakkabı çıkarmak ve selam vermek misafirlik adabındandır."],
    ["“Yatıya misafir olmak” ne demektir?", "Geceyi başkasının evinde geçirmek", ["Sabah erkenden ziyarete gitmek", "Öğle yemeğini dışarıda yemek", "Eve geç gelmek"], "Yatıya kalmak, geceyi misafir olunan evde geçirmek demektir."],
    ["Fıldır adlı kedinin yolculuğunu anlatan cümlelerden hangisinin yazımı doğrudur?", "Fıldır, Ankara'daki dedesine gitti.", ["Fıldır, ankara'daki dedesine gitti.", "Fıldır, Ankara'daki dedesi'ne gitti.", "Fıldır, Ankara'daki Dedesine gitti."], "Özel ad büyük harfle başlar; “dede” cins ad olduğundan küçük yazılır ve ek kesme işaretiyle ayrılmaz."],
    ["Aşağıdaki durumlardan hangisi misafirlik adabına uygun DEĞİLDİR?", "Ev sahibinin izni olmadan dolapları açmak", ["Eve girerken selam vermek", "İkramlar için teşekkür etmek", "Ayrılırken ev sahibine teşekkür etmek"], "İzinsiz dolap açmak uygun olmayan bir davranıştır."],
  ]),
  ...T("Çocuk Dünyası", "Beştaş ve İki Ceviz Bileti", [
    ["“Deniz, bahçedeki ağaçtan topladığı iki cevizi görevliye verip tiyatroya girdi.” Deniz tiyatroya nasıl girmiştir?", "Cevizleri bilet karşılığı vererek", ["Parayla bilet alarak", "Gizlice", "Öğretmeniyle birlikte"], "Metinde cevizleri görevliye verip girdiği anlatılmaktadır."],
    ["Biletteki bilgilere göre gösteri saat kaçta başlayacaktır?", "14.00", ["12.00", "15.30", "16.00"], "Biletteki saat bilgisi 14.00'tür.", kart("TİYATRO BİLETİ", ["Gösteri: Cevizli Masal", "Tarih: 12 Aralık", "Saat: 14.00", "Yer: Çocuk kültür merkezi"], "#c0504d")],
    ["“Deniz iki ceviz getirdi.” cümlesinde “iki” sözcüğü ne bildirir?", "Cevizlerin sayısını", ["Cevizlerin rengini", "Cevizlerin tadını", "Cevizlerin yerini"], "“İki” sözcüğü cevizin kaç tane olduğunu belirtir."],
    ["Aşağıdaki cümlelerden hangisinde noktalama doğru kullanılmıştır?", "Sepette ceviz, fındık ve badem vardı.", ["Sepette ceviz fındık, ve badem vardı.", "Sepette, ceviz fındık ve badem, vardı.", "Sepette ceviz, fındık, ve, badem vardı."], "Eş görevli sözcükler virgülle ayrılır; “ve”den önce virgül konmaz."],
  ]),
  ...T("Çocuk Dünyası", "Sağlığımı Korurum", [
    ["Yemekten önce ellerin sabunla yıkanmasının en önemli nedeni nedir?", "Mikroplardan korunmak", ["Elleri kokutmak", "Zaman geçirmek", "Yemeği soğutmak"], "El temizliği mikropların vücuda girmesini engeller."],
    ["Afişe göre aşağıdakilerden hangisi önerilen davranıştır?", "Bol su içmek", ["Geç saatlere kadar uyanık kalmak", "Sebze yemekten kaçınmak", "Dişleri haftada bir fırçalamak"], "Afişte “Bol su iç” önerisi vardır.", kart("SAĞLIKLI YAŞAM", ["Günde 8 saat uyu", "Bol su iç", "Dişlerini fırçala"], "#2e8b57")],
    ["“Temiz” sözcüğünün zıt anlamlısı aşağıdakilerden hangisidir?", "Kirli", ["Düzenli", "Parlak", "Hafif"], "Temiz ve kirli karşıt anlamlı sözcüklerdir."],
    ["Aşağıdaki cümlelerden hangisi soru cümlesidir?", "Dişlerini fırçaladın mı?", ["Dişlerini fırçalıyorum.", "Dişlerimi her gün fırçalarım.", "Dişlerim çok sağlam."], "“mı” soru ekiyle kurulan ve cevap isteyen cümle soru cümlesidir."],
  ]),
];

const s5 = [
  ...T("Oyun Dünyası", "Oyun Dünyası", [
    ["“Çocuklar bahçede saklambaç oynarken ağızları kulaklarına vardı.” Bu cümledeki deyim ne anlama gelir?", "Çok sevinmek", ["Çok yorulmak", "Çok susamak", "Çok korkmak"], "“Ağzı kulaklarına varmak”, çok sevinmek demektir."],
    ["“Mahallede bilye turnuvası düzenlendi. Her oyuncu üç hak kullanabiliyordu. Kuralı çiğneyen oyuncu bir tur bekliyordu.” Metne göre kuralı çiğneyen oyuncuya ne olur?", "Bir tur bekler", ["Oyundan atılır", "Üç hak kazanır", "Yeniden başlar"], "Metinde kuralı çiğneyenin bir tur beklediği yazılıdır."],
    ["Afişe göre şenlikte hangi oyun oynanacaktır?", "İp atlama", ["Saklambaç", "Misket", "Dokuz taş"], "Afişte oyun olarak ip atlama yazılıdır.", kart("MAHALLE OYUN ŞENLİĞİ", ["Oyun: İp atlama", "Tarih: 3 Mayıs Cumartesi", "Saat: 11.00", "Yer: Mahalle parkı"], "#e08a2b")],
    ["Aşağıdaki cümlelerden hangisinin yazımı doğrudur?", "Ali de bizimle oynadı.", ["Alide bizimle oynadı.", "Ali'de bizimle oynadı.", "Ali,de bizimle oynadı."], "Bağlaç olan “de” ayrı yazılır ve kesme işareti almaz."],
  ]),
  ...T("Atatürk'ü Tanımak", "Atatürk'ü Tanımak", [
    ["“Mustafa Kemal, 1881'de Selanik'te doğdu. Askerî okullarda okudu. Cumhuriyet'i 1923'te ilan etti.” Metne göre Cumhuriyet hangi yıl ilan edilmiştir?", "1923", ["1881", "1919", "1938"], "Metinde Cumhuriyet'in ilan yılı 1923 olarak verilmiştir."],
    ["Aşağıdaki cümlelerden hangisinde kesme işareti doğru kullanılmıştır?", "Atatürk'ün sözleri bugün de yol göstericidir.", ["Atatürkün sözleri bugün de yol göstericidir.", "Atatürk'ün' sözleri bugün de yol göstericidir.", "Atatürk ün sözleri bugün de yol göstericidir."], "Özel adlara gelen ekler kesme işaretiyle ayrılır."],
    ["“Önder” sözcüğünün eş anlamlısı aşağıdakilerden hangisidir?", "Lider", ["Asker", "Öğrenci", "Komşu"], "Önder ve lider aynı anlamdadır."],
    ["Tabloya göre Atatürk'ün vefatı, Cumhuriyet'in ilanından kaç yıl sonradır?", "15", ["10", "18", "57"], "1938 - 1923 = 15 yıl.", tablo(["Yıl", "Olay"], [["1881", "Doğum"], ["1923", "Cumhuriyet'in ilanı"], ["1938", "Vefat"]], "Atatürk'ün hayatından yıllar")],
  ]),
  ...T("Duygularımı Tanıyorum", "Duygularımı Tanıyorum", [
    ["“Doğum günü sürprizini görünce gözlerim parladı, ağzım kulaklarıma vardı.” Anlatıcı hangi duyguyu yaşamaktadır?", "Sevinç", ["Üzüntü", "Korku", "Kıskançlık"], "Gözlerin parlaması ve ağzın kulaklara varması sevinç belirtisidir."],
    ["“İçi içine sığmamak” deyimi aşağıdaki durumlardan hangisini anlatır?", "Çok heyecanlı ve sabırsız olmayı", ["Çok yorgun olmayı", "Çok acıkmayı", "Çok sinirlenmeyi"], "Bu deyim, çok heyecanlı ve sabırsız olmayı anlatır."],
    ["“Sevinç” sözcüğünün zıt anlamlısı aşağıdakilerden hangisidir?", "Üzüntü", ["Heyecan", "Merak", "Öfke"], "Sevinç ve üzüntü karşıt duygulardır."],
    ["Tabloda soru işareti yerine hangi duygu gelmelidir?", "Korku", ["Sevinç", "Gurur", "Merak"], "Karanlık odada yalnız kalınca duyulan duygu korkudur.", tablo(["Durum", "Duygu"], [["Kaybolan oyuncağı bulmak", "Sevinç"], ["Arkadaşı taşınınca ayrılmak", "Üzüntü"], ["Karanlık odada yalnız kalmak", "?"]], "Durum ve duygu")],
  ]),
  ...T("Geleneklerimiz", "Geleneklerimiz", [
    ["“Köyümüzde bayramın ilk günü büyükler ziyaret edilir, çocuklar el öpüp bayram harçlığı alır.” Metne göre bayramın ilk günü kimler ziyaret edilir?", "Büyükler", ["Komşu çocukları", "Öğretmenler", "Arkadaşlar"], "Metinde büyüklerin ziyaret edildiği yazılıdır."],
    ["“Bir elin nesi var, iki elin sesi var.” atasözü hangi anlamdadır?", "Birlikte yapılan iş daha etkili olur.", ["Her iş tek başına yapılmalıdır.", "Gürültü yapmak iyidir.", "Eller çok önemlidir."], "Atasözü, iş birliğinin gücünü anlatır."],
    ["“Bayramda ...... evinde sofralar kuruldu.” cümlesinde boşluğa hangisi gelmelidir?", "herkesin", ["her kesin", "her-kesin", "herkezin"], "“Herkes” bitişik yazılır ve s ile yazılır."],
    ["Afişe göre etkinlik saat kaçta başlayacaktır?", "14.00", ["10.00", "16.00", "18.00"], "Afişteki saat bilgisi 14.00'tür.", kart("GELENEK ŞENLİĞİ", ["Etkinlik: Ebru gösterisi", "Tarih: 20 Nisan", "Saat: 14.00", "Yer: Kültür evi"], "#7b4ea3")],
  ]),
  ...T("İletişim ve Sosyal İlişkiler", "İletişim ve Sosyal İlişkiler", [
    ["Ayşe, Mehmet'e bir mesaj yazdı. Bu iletişimde alıcı kimdir?", "Mehmet", ["Ayşe", "Mesaj", "Telefon"], "Mesajı alan kişi alıcıdır; mesajı gönderen Ayşe göndericidir."],
    ["Aşağıdakilerden hangisi sözsüz iletişim örneğidir?", "El sallayarak selam vermek", ["Telefonla konuşmak", "Mektup yazmak", "Radyo dinlemek"], "Beden hareketleriyle yapılan iletişim sözsüzdür."],
    ["“İletişim” sözcüğünün eş anlamlısı aşağıdakilerden hangisidir?", "Haberleşme", ["Yarışma", "Yolculuk", "Eğlence"], "İletişim, haberleşme anlamına gelir."],
    ["“Zeynep arkadaşını kırıcı sözlerle üzdü. Sonra hatasını anlayıp özür diledi.” Zeynep'in bu davranışı hangi özelliğini gösterir?", "Hatasını kabul edebildiğini", ["Kaba olduğunu", "Çekingen olduğunu", "İlgisiz olduğunu"], "Özür dilemek, hatayı kabul etmenin göstergesidir."],
  ]),
  ...T("Sağlıklı Yaşıyorum", "Sağlıklı Yaşıyorum", [
    ["Grafiğe göre öğrenci hangi gün en çok su içmiştir?", "Salı", ["Pazartesi", "Çarşamba", "Perşembe"], "En yüksek sütun Salı gününe aittir.", svg(S.sutunGrafik({ etiketler: ["Pzt", "Sal", "Çar", "Per"], degerler: [6, 8, 5, 7], max: 10, adim: 2, yBaslik: "Bardak sayısı" }), "78%")],
    ["“Sağlam kafa sağlam vücutta bulunur.” atasözü hangi anlamdadır?", "Bedenen sağlıklı olan zihnen de sağlıklı olur.", ["Başa her zaman miğfer takılmalıdır.", "Vücut güçlü olmalıdır, kafa önemli değildir.", "Sağlam eşyalar kullanılmalıdır."], "Atasözü beden ve zihin sağlığı arasındaki ilişkiyi anlatır."],
    ["“...... yarım saat yürüyüş yapıyorum.” cümlesinde boşluğa hangisi gelmelidir?", "Her gün", ["Hergün", "Her-gün", "Herg ün"], "“Her gün” ayrı yazılır."],
    ["“Sabah kahvaltısı yapan öğrenciler derste daha dikkatli oluyor.” cümlesinden hangi sonuç çıkarılır?", "Kahvaltı yapmak derse katılımı olumlu etkiler.", ["Kahvaltı yapmak gereksizdir.", "Dikkat için hiç uyumamak gerekir.", "Ders sabah yapılmalıdır."], "Cümle, kahvaltı ile dikkat arasında olumlu bir ilişki kurar."],
  ]),
];

const s6 = [
  ...T("Dilimizin Zenginliği", "Dilimizin Zenginliği", [
    ["Aşağıdaki sözcüklerden hangisi türemiş bir sözcüktür?", "Çiçekçi", ["Masa", "Kalem", "Defter"], "Çiçek + çi: kök ve yapım eki vardır."],
    ["Tabloda soru işareti yerine hangi sözcük gelmelidir?", "Çiçekçi", ["Çiçekler", "Çiçeğe", "Çiçeksi"], "Çiçek köküne -çi yapım eki gelerek “çiçekçi” oluşur.", tablo(["Kök", "Ek", "Sözcük"], [["göz", "-lük", "gözlük"], ["kitap", "-lık", "kitaplık"], ["çiçek", "-çi", "?"]], "Kök ve ek")],
    ["Aşağıdaki sözcüklerden hangisi yansıma sözcüktür?", "Şırıl şırıl", ["Yavaş yavaş", "Sabah sabah", "Ağır ağır"], "Su sesini taklit eden “şırıl”, yansıma sözcüktür."],
    ["“Cesur” sözcüğünün eş anlamlısı aşağıdakilerden hangisidir?", "Yürekli", ["Çekingen", "Sessiz", "Titiz"], "Cesur ve yürekli eş anlamlıdır."],
  ]),
  ...T("Bağımsızlık Yolu", "Bağımsızlık Yolu", [
    ["“Yurdun dört bir yanında insanlar birlik olup vatanlarını savundu. Kadın erkek, genç yaşlı herkes elinden geleni yaptı.” Bu metnin ana düşüncesi nedir?", "Vatanı savunmak herkesin ortak görevidir.", ["Savaş yalnız askerlerin işidir.", "Yaşlılar savaşa katılamaz.", "Vatan korunmaya muhtaç değildir."], "Metin, herkesin bağımsızlık için çalıştığını vurgular."],
    ["Aşağıdaki cümlelerden hangisinin yazımı doğrudur?", "Türkiye Büyük Millet Meclisi 23 Nisan 1920'de açıldı.", ["Türkiye büyük millet meclisi 23 Nisan 1920'de açıldı.", "Türkiye Büyük Millet Meclisi 23 Nisan 1920de açıldı.", "Türkiye Büyük Millet Meclisi 23 Nisan 1920 'de açıldı."], "Kurum adı büyük harfle yazılır; rakama gelen ek kesme işaretiyle bitişik ayrılır."],
    ["“Bağımsız” sözcüğünün zıt anlamlısı aşağıdakilerden hangisidir?", "Bağımlı", ["Özgür", "Yalnız", "Güçlü"], "Bağımsız ve bağımlı karşıt anlamlıdır."],
    ["Tabloya göre aşağıdaki olaylardan hangisi en son gerçekleşmiştir?", "Cumhuriyet'in ilanı", ["Samsun'a çıkış", "TBMM'nin açılışı", "Hepsi aynı yılda olmuştur"], "En büyük yıl 1923'tür.", tablo(["Yıl", "Olay"], [["1919", "Samsun'a çıkış"], ["1920", "TBMM'nin açılışı"], ["1923", "Cumhuriyet'in ilanı"]], "Bağımsızlık yolunda olaylar")],
  ]),
  ...T("Farklı Dünyalar", "Farklı Dünyalar", [
    ["Tabloya göre Kai'yi sabahları uyandıran ses hangisidir?", "Dalga sesi", ["Araba sesi", "Kuş sesi", "Zil sesi"], "Tabloda Kai'nin sabah sesi dalga olarak verilmiştir.", tablo(["", "Kai", "Lara"], [["Yaşadığı yer", "Ada", "Şehir"], ["Sabah duyduğu ses", "Dalga sesi", "Araba sesi"]], "İki çocuğun dünyası")],
    ["Aşağıdaki cümlelerin hangisinde sözcük mecaz anlamda kullanılmıştır?", "Acı sözler kalbimi kırdı.", ["Sepeti kolayca kaldırdım.", "Kalem masanın üstünde duruyor.", "Bardak yere düşüp kırıldı."], "Kalbin kırılması gerçekte değil, üzülme anlamında kullanılmıştır."],
    ["“Odanın duvarları sarıya boyalıydı. Pencerenin önünde yeşil bir saksı duruyordu.” Bu parça hangi anlatım biçimine örnektir?", "Betimleme", ["Öyküleme", "Tartışma", "Açıklama"], "Bir yerin görünüşü anlatıldığı için betimleme vardır."],
    ["“Uzak bir adada yaşayan Kai, şehirde yaşayan kuzeni Lara'dan çok farklı bir hayat sürüyordu.” Cümlede hangi iki kişi karşılaştırılmaktadır?", "Kai ile Lara", ["Ada ile şehir", "Kai ile ada", "Lara ile şehir"], "Karşılaştırılan kişiler Kai ve Lara'dır."],
  ]),
  ...T("İletişim ve Sosyal İlişkiler", "İletişim ve Sosyal İlişkiler", [
    ["Aşağıdaki cümlelerden hangisinde iki nokta doğru kullanılmıştır?", "Sepete şunları koydum: elma, armut, kiraz.", ["Sepete: şunları koydum elma, armut, kiraz.", "Sepete şunları koydum elma: armut, kiraz.", "Sepete şunları: koydum elma, armut, kiraz."], "Açıklama yapılacak ifadeden önce iki nokta konur."],
    ["“Kendini karşısındakinin yerine koyup onu anlamaya çalışmak” davranışına ne ad verilir?", "Empati", ["Rekabet", "Kıskançlık", "Taklit"], "Empati, karşıdakinin duygularını anlamaktır."],
    ["Karşısındakinin gözlerine bakarak dinleyen bir kişi iletişimde neyi göstermiş olur?", "Saygı ve ilgi", ["Sıkıntı", "Acele", "İlgisizlik"], "Göz teması saygı ve ilgi göstergesidir."],
    ["Duyuruya göre aşağıdaki bilgilerden hangisi belirtilmemiştir?", "Toplantıya katılacak kişilerin adları", ["Toplantının konusu", "Toplantı saati", "Toplantı yeri"], "Duyuruda konu, tarih, saat ve yer vardır; katılımcı adı yoktur.", kart("TOPLANTI DUYURUSU", ["Konu: Sınıf gezisi", "Tarih: 9 Ocak Cuma", "Saat: 16.00", "Yer: Konferans salonu"], "#2f6fb0")],
  ]),
  ...T("Bilim ve Teknoloji", "Bilim ve Teknoloji", [
    ["“Bilim insanları uzayı incelemek için teleskop kullanır. Teleskopla uzaktaki yıldızlar daha yakın ve net görünür.” Metne göre teleskopun işlevi nedir?", "Uzaktaki cisimleri yakın ve net göstermek", ["Hava durumunu ölçmek", "Ses kaydı yapmak", "Zamanı göstermek"], "Metinde teleskop yıldızları yakın ve net gösteren bir araç olarak anlatılmıştır."],
    ["Grafiğe göre 2022'den 2024'e okuldaki bilgisayar sayısı kaç artmıştır?", "12", ["5", "7", "18"], "30 - 18 = 12.", svg(S.sutunGrafik({ etiketler: ["2021", "2022", "2023", "2024"], degerler: [12, 18, 25, 30], max: 35, adim: 5, yBaslik: "Bilgisayar sayısı" }), "78%")],
    ["“Teknoloji, ...... alanda hayatı kolaylaştırdı.” cümlesinde boşluğa hangisi gelmelidir?", "birçok", ["bir çok", "bir-çok", "birçök"], "“Birçok” bitişik yazılır."],
    ["“Bilim insanı yeni bir buluş için günlerce kafa yordu.” cümlesindeki “kafa yormak” ne anlama gelir?", "Uzun uzun düşünmek", ["Başını ağrıtmak", "Uyumak", "Bağırmak"], "“Kafa yormak”, bir konu üzerinde çok düşünmek demektir."],
  ]),
  ...T("Lider Ruhlar", "Lider Ruhlar", [
    ["“Kaptan, fırtınada paniğe kapılmadı; mürettebata sakin bir sesle görev verdi. Herkes güvenle gemiyi kurtardı.” Kaptanın hangi özelliği öne çıkmaktadır?", "Soğukkanlılığı", ["Tembelliği", "Korkaklığı", "Bencilliği"], "Paniğe kapılmayıp sakin davranması soğukkanlılığını gösterir."],
    ["Aşağıdakilerden hangisi bir liderde bulunması beklenen bir özellik DEĞİLDİR?", "Bencillik", ["Adil olmak", "Cesur olmak", "Sorumluluk almak"], "Bencillik, bir liderden beklenen bir özellik değildir."],
    ["“Kaptan ekibine görevleri anlattı.” cümlesinin yüklemi hangisidir?", "anlattı", ["Kaptan", "ekibine", "görevleri"], "Cümlede işi bildiren sözcük “anlattı”dır."],
    ["Tabloya göre “adalet” özelliği hangi davranışla eşleşir?", "Herkese eşit davranmak", ["Gece gündüz çalışmak", "Hiç konuşmamak", "Yalnız kendi görüşünü savunmak"], "Adalet, herkese eşit davranmayı gerektirir.", tablo(["Özellik", "Davranış"], [["Cesaret", "Tehlikede geri adım atmamak"], ["Adalet", "Herkese eşit davranmak"], ["Çalışkanlık", "Gece gündüz çalışmak"]], "Liderin özellikleri")],
  ]),
  ...T("Lider Ruhlar", "Türk Denizcileri-piri Reis", [
    ["Piri Reis hangi alanlarda ün kazanmış bir Türk denizcisidir?", "Denizcilik ve haritacılık", ["Tarım ve hayvancılık", "Müzik ve tiyatro", "Mimarlık ve heykel"], "Piri Reis, denizci ve haritacı olarak tanınır."],
    ["“Denizci, haritayı dikkatle inceleyerek rotasını belirledi. Pusula yönünü bulmasına yardımcı oldu.” Metne göre pusula ne işe yarar?", "Yön bulmaya", ["Hava durumunu söylemeye", "Gemiyi hızlandırmaya", "Balık tutmaya"], "Metinde pusulanın yön bulmaya yardımcı olduğu anlatılır."],
    ["Denizciyle ilgili cümlelerden hangisinin yazımı doğrudur?", "Piri Reis'in haritaları ilgi görür.", ["Piri Reisin haritaları ilgi görür.", "Piri reis'in haritaları ilgi görür.", "Piri Reis 'in haritaları ilgi görür."], "Özel adlara gelen ek kesme işaretiyle ayrılır; özel adlar büyük harfle başlar."],
    ["Tabloda soru işareti yerine hangisi gelmelidir?", "Gemiyi yönlendirme", ["Yön bulma", "Yer gösterme", "Yük taşıma"], "Dümen gemiyi yönlendirmeye yarar.", tablo(["Araç", "Görevi"], [["Pusula", "Yön bulma"], ["Harita", "Yer gösterme"], ["Dümen", "?"]], "Denizcilikte kullanılan araçlar")],
  ]),
];

const s7 = [
  ...T("Hayat Boyu Gelişim", "Hayat Boyu Gelişim", [
    ["“Kitap okumak, bilgimizi artırır.” cümlesindeki “okumak” sözcüğü hangi fiilimsidir?", "İsim-fiil", ["Sıfat-fiil", "Zarf-fiil", "Edat"], "-mak ekiyle türetilen ve isim gibi kullanılan fiilimsi isim-fiildir."],
    ["“Koşan çocuk durup nefes aldı.” cümlesinde “koşan” sözcüğü hangi fiilimsidir?", "Sıfat-fiil", ["İsim-fiil", "Zarf-fiil", "Edat"], "-An eki fiilden sıfat türetir; “koşan” çocuğu niteler."],
    ["“Okuyarak öğrendi.” cümlesindeki “okuyarak” sözcüğü hangi fiilimsidir?", "Zarf-fiil", ["İsim-fiil", "Sıfat-fiil", "Bağlaç"], "-arak eki, fiili zarf gibi tamamlayan zarf-fiil ekidir."],
    ["Grafiğe göre öğrencinin okuduğu kitap sayısı hangi aylar arasında en çok artmıştır?", "Şubat - Mart", ["Ocak - Şubat", "Mart - Nisan", "Hepsinde aynıdır"], "Şubat'ta 3, Mart'ta 6 kitap vardır; artış 3'tür, diğerleri 1 ve 2.", svg(S.sutunGrafik({ etiketler: ["Ocak", "Şubat", "Mart", "Nisan"], degerler: [2, 3, 6, 8], max: 10, adim: 2, yBaslik: "Kitap sayısı" }), "78%")],
  ]),
  ...T("Bir Hilal Uğruna", "Bir Hilal Uğruna", [
    ["“Siperdeki asker ailesine mektup yazdı: Vatan için buradayım, merak etmeyin.” Asker bu sözüyle neyi anlatmak istemiştir?", "Vatan görevi için orada olduğunu", ["Eve dönmek istediğini", "Savaştan korktuğunu", "Para istediğini"], "Asker, vatan için görev yaptığını ve ailesinin endişelenmemesini söylemektedir."],
    ["Aşağıdaki cümlelerden hangisi doğrudan aktarımdır?", "Asker, “Vatan için buradayım.” dedi.", ["Asker vatan için orada olduğunu söyledi.", "Asker vatan için orada olduğunu belirtti.", "Asker vatan için çalışacağını bildirdi."], "Söylenen sözün aynen, tırnak içinde verilmesi doğrudan aktarımdır."],
    ["“Canını dişine takmak” deyimi ne anlama gelir?", "Çok çaba harcamak", ["Dişini fırçalamak", "Korkmak", "Dinlenmek"], "Bu deyim, bir iş için büyük bir çaba göstermek anlamındadır."],
    ["Programa göre anma etkinliğinin konusu nedir?", "Çanakkale şehitlerini anma", ["Fidan dikimi", "Kitap okuma", "Spor müsabakası"], "Afişte konu açıkça yazılıdır.", kart("ANMA PROGRAMI", ["Konu: Çanakkale Şehitlerini Anma", "Tarih: 18 Mart", "Saat: 10.00", "Yer: Okul bahçesi"], "#8b2e2e")],
  ]),
  ...T("İletişim ve Sosyal İlişkiler", "İletişim ve Sosyal İlişkiler", [
    ["Aşağıdaki cümlelerden hangisi edilgen çatılıdır?", "Kapı rüzgârla açıldı.", ["Öğrenci ödevini teslim etti.", "Ayşe pencereyi açtı.", "Mert topu attı."], "İşi yapanı belli olmayan, nesne özne olmuş cümle edilgendir."],
    ["“Mert ödevini bitirdi.” cümlesinin öznesi hangisidir?", "Mert", ["ödevini", "bitirdi", "Cümlenin öznesi yoktur"], "İşi yapan “Mert”tir."],
    ["İyi bir dinleyici aşağıdakilerden hangisini yapmaz?", "Karşısındakinin sözünü sık sık kesmek", ["Göz teması kurmak", "Konuşmayı anlamaya çalışmak", "Gerektiğinde soru sormak"], "Sözü kesmek iyi dinleme kurallarına aykırıdır."],
    ["Davete göre aşağıdaki bilgilerden hangisi verilmiştir?", "Görüşmenin yeri", ["Katılımcıların adları", "Görüşmenin sonucu", "Yemek menüsü"], "Davette yer bilgisi vardır.", kart("GÖRÜŞME DAVETİ", ["Konu: Sınıf kuralları", "Tarih: 5 Şubat", "Saat: 13.30", "Yer: Rehberlik odası"], "#2f6fb0")],
  ]),
  ...T("Türk Sanatı", "Türk Sanatı", [
    ["Tabloya göre hat sanatında hangi malzemeler kullanılır?", "Kalem ve mürekkep", ["Su ve boya", "Pişmiş toprak", "Yün ve iplik"], "Tabloda hat sanatının malzemesi kalem ve mürekkeptir.", tablo(["Sanat", "Malzeme"], [["Ebru", "Su ve boya"], ["Çini", "Pişmiş toprak"], ["Hat", "Kalem ve mürekkep"]], "Türk sanatları")],
    ["“Ebru, suyun üstüne damlatılan boyaların kâğıda aktarılmasıyla yapılır.” Bu cümleye göre ebruda hangi malzemeler vardır?", "Su, boya ve kâğıt", ["Kil, ateş ve su", "Yün ve boya", "Taş ve çekiç"], "Cümlede su, boya ve kâğıt geçmektedir."],
    ["“Ebru yapan usta çalışmasını sundu.” cümlesindeki “yapan” sözcüğü hangi fiilimsidir?", "Sıfat-fiil", ["İsim-fiil", "Zarf-fiil", "Edat"], "“Yapan”, ustayı niteleyen sıfat-fiildir."],
    ["Güzel yazı yazma sanatına ne ad verilir?", "Hat", ["Ebru", "Çini", "Minyatür"], "Güzel yazı sanatı hattır."],
  ]),
  ...T("Okuma Kültürü", "Okuma Kültürü", [
    ["Hayvanların konuşturulduğu, okuyucuya ders veren kısa öykülere ne ad verilir?", "Fabl", ["Roman", "Anı", "Gezi yazısı"], "Hayvanların insan gibi konuştuğu, ders verici metinler fabldır."],
    ["Grafiğe göre en çok kitap okuyan öğrenci kimdir?", "Elif", ["Ada", "Can", "Deniz"], "En yüksek sütun Elif'e aittir.", svg(S.sutunGrafik({ etiketler: ["Ada", "Can", "Deniz", "Elif"], degerler: [4, 6, 3, 9], max: 10, adim: 2, yBaslik: "Kitap sayısı" }), "78%")],
    ["“Gülerek içeri girdi.” cümlesindeki “gülerek” sözcüğü hangi fiilimsidir?", "Zarf-fiil", ["İsim-fiil", "Sıfat-fiil", "Edat"], "-erek eki zarf-fiil ekidir."],
    ["Düzenli kitap okumanın en önemli yararı aşağıdakilerden hangisidir?", "Söz varlığını ve bilgiyi artırması", ["Boş zamanı yok etmesi", "Arkadaşlardan uzaklaştırması", "Sınav yapılmasını engellemesi"], "Okuma, kelime hazinesini ve bilgi birikimini artırır."],
  ]),
  ...T("Hak ve Sorumluluklar", "Hak ve Sorumluluklar", [
    ["Aşağıdakilerden hangisi bir sorumluluk örneğidir?", "Ödevini zamanında yapmak", ["Okula gitme hakkı", "Eğitim görme hakkı", "Sağlık hizmeti alma hakkı"], "Ödev yapmak öğrencinin sorumluluğudur; diğerleri haklardır."],
    ["“Öğrenci kitabı okudu.” cümlesinde nesne hangisidir?", "kitabı", ["Öğrenci", "okudu", "Cümlede nesne yoktur"], "Yüklemin bildirdiği işten etkilenen ögedir."],
    ["Kurallara göre aşağıdakilerden hangisi yapılmalıdır?", "Sınıf eşyalarına zarar vermemek", ["Teneffüste koridorda koşmak", "Başkalarının eşyasını izinsiz kullanmak", "Ders sırasında yüksek sesle konuşmak"], "Afişte eşyalara zarar vermemek yazılıdır.", kart("SINIF KURALLARI", ["Söz alarak konuş", "Sınıf eşyalarına zarar verme", "Zamanında derse gir"], "#2e8b57")],
    ["“Her çocuğun eğitim hakkı vardır.” cümlesinden aşağıdakilerden hangisi çıkarılabilir?", "Eğitim herkes için bir haktır.", ["Eğitim yalnız zenginler içindir.", "Çocuklar okula gitmek zorunda değildir.", "Eğitim bir sorumluluk değildir."], "Cümle eğitimin her çocuğa tanınan bir hak olduğunu söyler."],
  ]),
];

const s8 = [
  ...T("Millî Mücadele ve Atatürk", "215 Okkalık Mermi Nasıl Kaldırıldı?", [
    ["“Köylüler ağır cephaneyi yağmur ve çamur altında sırtlarında taşıdı.” Bu cümlede asıl vurgulanan duygu hangisidir?", "Fedakârlık ve dayanışma", ["Tembellik", "Kıskançlık", "Umursamazlık"], "Zor koşullarda cephane taşımak fedakârlık ve dayanışma gösterir."],
    ["“Okka” sözcüğü hangi anlamda kullanılan eski bir ölçü birimidir?", "Ağırlık", ["Uzunluk", "Hacim", "Zaman"], "Okka, eskiden kullanılan bir ağırlık ölçüsüdür."],
    ["“Köylüler cephaneyi sırtlarında taşıdı.” cümlesinin yüklemi hangisidir?", "taşıdı", ["Köylüler", "cephaneyi", "sırtlarında"], "Cümlede işi bildiren sözcük “taşıdı”dır."],
    ["Grafiğe göre en çok cephane hangi gün taşınmıştır?", "Çarşamba", ["Pazartesi", "Salı", "Perşembe"], "Çarşamba günü sütunu en yüksektir.", svg(S.sutunGrafik({ etiketler: ["Pzt", "Sal", "Çar", "Per"], degerler: [30, 45, 60, 50], max: 70, adim: 10, yBaslik: "Taşınan sandık" }), "78%")],
  ]),
  ...T("Millî Kültürümüz", "Millî Kültürümüz", [
    ["Aşağıdakilerden hangisi kültürü kuşaktan kuşağa aktaran unsurlardandır?", "Dil", ["Hava durumu", "Tesadüfler", "Alışveriş"], "Dil, kültürü aktaran en önemli unsurlardandır."],
    ["“Bu gelenek köyümüzde nesillerdir yaşatılıyor.” cümlesindeki “nesillerdir” sözcüğünün anlamı aşağıdakilerden hangisidir?", "Kuşaklardır", ["Aylardır", "Günlerdir", "Saatlerdir"], "Nesil, kuşak anlamına gelir."],
    ["Tabloya göre aşağıdaki geleneklerden hangisi “bayram” zamanı yapılır?", "Bayramlaşma", ["Kına gecesi", "Yağmur duası", "Hasat şenliği"], "Tabloda bayramlaşma bayram zamanı olarak gösterilmiştir.", tablo(["Gelenek", "Zaman"], [["Bayramlaşma", "Bayram"], ["Kına gecesi", "Düğün öncesi"], ["Hasat şenliği", "Hasat dönemi"]], "Geleneklerimiz")],
    ["“Çocuklar yaşlılara saygı göstermeyi büyüklerinden öğrenir.” cümlesinden hangi sonuç çıkarılır?", "Kültürel değerler yaşayarak öğrenilir.", ["Saygı doğuştan gelir.", "Yaşlılar çocuklara bakmaz.", "Kültür değişmez."], "Değerlerin büyüklerden öğrenildiği ifade edilmektedir."],
  ]),
  ...T("Duygular", "Umut…", [
    ["“Umut” sözcüğünün eş anlamlısı aşağıdakilerden hangisidir?", "Ümit", ["Korku", "Öfke", "Utanç"], "Umut ve ümit aynı anlamdadır."],
    ["“Umudunu kesmek” deyimi ne anlama gelir?", "Bir şeyden vazgeçmek", ["Umutlanmak", "Bir şeye sevinmek", "Hızla koşmak"], "Bir işin olacağına inancını yitirip vazgeçmek demektir."],
    ["Aşağıdaki cümlelerden hangisinde cümlenin yarım bırakıldığı üç noktayla gösterilmiştir?", "Her şey bitti sanmıştım, ama...", ["Bugün hava çok güzel.", "Ben yarın okula gideceğim.", "Annem akşam yemeği hazırladı."], "Yarım bırakılan cümlelerin sonuna üç nokta konur; diğerleri tamamlanmış cümlelerdir."],
    ["“Yağmur dindi, bulutlar çekildi ve gökyüzünde bir gökkuşağı belirdi.” Bu cümle şiirsel olarak hangi duyguyu çağrıştırır?", "Umut", ["Öfke", "Pişmanlık", "Sıkıntı"], "Gökkuşağı, zor bir günün ardından umudu çağrıştırır."],
  ]),
  ...T("Sağlık ve Spor", "Kahvaltının Önemi", [
    ["“Gece boyunca uyuyan vücut enerjisini harcar. Sabah kahvaltı yapan öğrenci derste daha dikkatli olur, yapmayan ise çabuk yorulur.” Bu parçanın ana düşüncesi hangisidir?", "Kahvaltı, güne zinde başlamak için gereklidir.", ["Öğrenciler gece geç saate kadar uyumalıdır.", "Yorgunluğun tek nedeni uykusuzluktur.", "Dikkat için yalnızca ders çalışmak yeterlidir."], "Parça, kahvaltının enerji ve dikkat için gerekli olduğunu vurgular."],
  ]),
  ...T("Sağlık ve Spor", "Spor Yap, Beynin Formda Kalsın!", [
    ["“Düzenli spor yapan kişilerde kan dolaşımı hızlanır; beyne daha fazla oksijen ulaşır. Bu durum öğrenmeyi ve hatırlamayı kolaylaştırır.” Metne göre spor beyni nasıl etkiler?", "Öğrenmeyi ve hatırlamayı kolaylaştırır.", ["Oksijen miktarını azaltır.", "Kan dolaşımını yavaşlatır.", "Dikkati dağıtır."], "Metinde sporun beyne oksijen ulaşmasını artırdığı ve öğrenmeyi kolaylaştırdığı belirtilmiştir."],
    ["Grafiğe göre Elif haftada en çok hangi gün spor yapmıştır?", "Cumartesi", ["Salı", "Perşembe", "Pazar"], "En yüksek sütun Cumartesi gününe aittir.", svg(S.sutunGrafik({ etiketler: ["Sal", "Per", "Cmt", "Paz"], degerler: [30, 40, 60, 20], max: 70, adim: 10, yBaslik: "Spor süresi (dk)" }), "78%")],
  ]),
  ...T("Sağlık ve Spor", "Obezite Nedir?", [
    ["“Hareketsiz yaşam ve dengesiz beslenme, vücutta sağlığı bozacak düzeyde yağ birikmesine yol açabilir.” Bu parçada anlatılan sağlık sorunu aşağıdakilerden hangisidir?", "Obezite", ["Kansızlık", "Görme bozukluğu", "Boğaz enfeksiyonu"], "Vücutta aşırı yağ birikmesine obezite denir."],
  ]),
  ...T("Sağlık ve Spor", "Atatürk ve Spor (Dinleme/İzleme Metni)", [
    ["Atatürk’ün “Ben sporcunun zeki, çevik ve aynı zamanda ahlaklısını severim.” sözüne göre aşağıdakilerden hangisi sporcuda aranan bir özellik değildir?", "Çok zengin olmak", ["Zeki olmak", "Çevik olmak", "Ahlaklı olmak"], "Sözde zekâ, çeviklik ve ahlak sayılır; zenginlikten söz edilmez."],
  ]),
];

export default { "4": { ek: s4 }, "5": { ek: s5 }, "6": { ek: s6 }, "7": { ek: s7 }, "8": { ek: s8 } };
