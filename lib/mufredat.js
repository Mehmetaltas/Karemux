// Bu dosya, app/page.js icindeki ayni-isimli sabitlerden 30 Agustos'ta
// OTOMATIK cikarilmistir (elle kopyalanmadi, veri kaybi riski yok).
// Tek gercek kaynak burasi olacak - DB migration scripti bunu kullanir.

export const MUFREDAT = {
  "Matematik": ["Carpanlar ve Katlar", "Uslu Ifadeler", "Karekoklu Ifadeler", "Veri Analizi", "Olasilik", "Cebirsel Ifadeler ve Ozdeslikler", "Dogrusal Denklemler", "Esitsizlikler", "Ucgenler", "Eslik ve Benzerlik", "Donusum Geometrisi", "Geometrik Cisimler"],
  "Fen Bilimleri": ["Mevsimler ve Iklim", "DNA ve Genetik Kod", "Basinc", "Madde ve Endustri", "Basit Makineler", "Enerji Donusumleri ve Cevre Bilimi", "Elektrik Yukleri ve Elektrik Enerjisi"],
  "Turkce": ["Fiilimsiler", "Cumlenin Ogeleri", "Cumle Turleri", "Anlatim Bozukluklari", "Yazim Kurallari", "Noktalama Isaretleri", "Paragrafta Anlam", "Soz Sanatlari", "Fiilde Cati"],
  "T.C. Inkilap Tarihi": ["Bir Kahraman Doguyor", "Milli Uyanis: Bagimsizlik Yolunda Atilan Adimlar", "Ya Istiklal Ya Olum", "Ataturkculuk ve Cagdaslasan Turkiye", "Demokratiklesme Cabalari", "Ataturk Donemi Turk Dis Politikasi", "Ataturk'un Olumu ve Sonrasi", "II. Dunya Savasi Surecinde Turkiye"],
  "Din Kulturu": ["Kader Inanci", "Zekat ve Sadaka", "Hz. Muhammed'in Ornekligi", "Kur'an-i Kerim'de Sunulan Ornek Sahsiyetler", "Din ve Hayat"],
  // 8. sinif Ingilizce - resmi PDF'ten (english-regular 2-8, Agustos 2026) DOGRULANDI.
  // Ingilizce'nin gecis takvimi diger derslerden FARKLI - 8. sinif da yeni mufredatta.
  "Ingilizce": ["School Life & Education", "Classroom Life & Learning", "Personal Life & Well-Being", "Family Life & Home", "Life in the Neighbourhood & City", "Life in the World and Culture", "Life in Nature & Global Problems", "Life in the Universe & Future"],
};

export const MUFREDAT_DIGER_SINIFLAR = {
  // 5. sinif: YENI mufredat (Turkiye Yuzyili Maarif Modeli, 2024-25'ten beri).
  // Kaynak: MEB resmi PDF + Ocak 2026 tarihli guncel haber kaynagi - nispeten
  // oturmus (2. yilina girdi) ama yine de en dikkatli ele alinmasi gereken sinif.
  // 5/6/7. sinif Matematik - resmi MEB PDF'inden (2024programmat5678Onayli.pdf,
  // kullanici tarafindan yuklendi, Agustos 2026) TAM DOGRULANDI. Onceki kucuk-unite
  // yapisi (Carpanlar ve Katlar, Kesirlerle Islemler gibi ayri ayri) YANLISTI - resmi
  // program her sinifta sadece 6-7 GENIS "TEMA" kullaniyor, kucuk konular bu temalarin
  // ICINDE isleniyor. 8. sinif hala eski (2018) mufredatta oldugu icin degistirilmedi.
  "4::Matematik": ["Sayilar ve Nicelikler", "Islemlerden Cebirsel Dusunmeye", "Nesnelerin Geometrisi", "Olaylarin Olasiligi ve Veriye Dayali Arastirma"],
  "5::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],
  // 6. sinif Matematik - Turkiye Yuzyili Maarif Modeli'ne (2025-26'da 6. sinifa gecti)
  // gore GUNCELLENDI. Sayilar alani (Carpanlar/EBOB-EKOK/Ondalik) buyuk olcude ayni
  // kaldi, ama geometri ve cebir uniteleri YENIDEN ADLANDIRILIP BIRLESTIRILDI (kaynak:
  // resmi MEB yillik plani + birden fazla egitim sitesi, Agustos 2026). Tam kazanim
  // derinligi (alt basliklar) bu yeniden yapilanmaya gore HENUZ guncellenmedi - AI
  // onerisine dusuyor, ileride ayrica derinlestirilmeli.
  "6::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme ve Degisimler", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],
  "7::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme ve Degisimler", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],

  "4::Fen Bilimleri": ["Bilime Yolculuk", "Saglikli Besleniyorum", "Dunyamizi Kesfedelim", "Maddenin Degisimi", "Miknatisi Kesfediyorum", "Enerji Dedektifleri", "Isigin Pesinde", "Surdurulebilir Sehirler ve Topluluklar"],
  "5::Fen Bilimleri": ["Gokyuzundeki Komsularimiz ve Biz", "Kuvveti Taniyalim", "Canlilarin Yapisina Yolculuk", "Isigin Dunyasi", "Maddenin Dogasi", "Yasamimizdaki Elektrik", "Surdurulebilir Yasam ve Geri Donusum"],
  // 6. sinif Fen Bilimleri - Maarif Modeli'ne gore GUNCELLENDI (Agustos 2026, coklu
  // kaynaktan dogrulandi: 7 unite, Vucudumuzdaki Sistemler/Uygulamali Bilim ayrimi
  // kaldirildi, Isik ve Madde ayri unite oldu).
  // 6/7. sinif Fen Bilimleri - resmi PDF'ten (2024programfen345678Onayli.pdf,
  // Agustos 2026) TAM DOGRULANDI. 7. sinif tamamen degisti (eski mufredat cikarildi).
  "6::Fen Bilimleri": ["Gunes Sistemi ve Tutulmalar", "Kuvvetin Etkisinde Hareket", "Canlilarda Sistemler", "Isigin Yansimasi ve Renkler", "Maddenin Ayirt Edici Ozellikleri", "Elektrigin Iletimi ve Direnc", "Surdurulebilir Yasam ve Etkilesim"],
  "7::Fen Bilimleri": ["Uzay Cagi", "Kuvvet ve Enerjiyi Kesfedelim", "Vucudumuzdaki Sistemler", "Isigin Kirilmasi ve Mercekler", "Maddenin Dogasina Yolculuk", "Elektriklenme", "Surdurulebilir Yasam ve Enerji"],
  // Turkce 6/7 - Matematik/Fen'in aksine Turkce kazanimlari numarali "unite" degil
  // beceri alani (Dinleme/Konusma/Okuma/Yazma) bazinda yapilandirilmis, bu yuzden asagidaki
  // liste 8. sinifta oldugu gibi standart konu basliklarindan derlenmistir - Matematik/Fen
  // kadar net resmi kaynaktan dogrulanmadi, ORTA guven seviyesi.
  // 5/6/7. sinif Turkce - resmi PDF'ten (2024programtur5678Onayli.pdf, Agustos 2026)
  // TAM DOGRULANDI. BUYUK FARK: yeni mufredat dilbilgisi konusu bazinda degil, YASAM
  // TEMASI bazinda ilerliyor (Oyun Dunyasi, Ataturk'u Tanimak gibi) - dilbilgisi
  // konulari (isim tamlamasi, fiilimsi vb.) bu temalarin ICINDE isleniyor. Biz de
  // gercek ders sirasina uygun sekilde, her temaya bir dilbilgisi/metin becerisi
  // alt basligi esliyoruz - LGS'nin dilbilgisi agirligi kaybolmasin diye.
  "4::Turkce": ["Dinleme ve Izleme", "Konusma", "Okuma", "Yazma"],
  "5::Turkce": ["Oyun Dunyasi", "Ataturk'u Tanimak", "Duygularimi Taniyorum", "Geleneklerimiz", "Iletisim ve Sosyal Iliskiler", "Saglikli Yasiyorum"],
  "4::Din Kulturu": ["Gunluk Hayat ve Din", "Allah Sevgisi", "Peygamberlerin Sevgisi", "Ahlaki Degerlerimiz", "Haklar ve Sorumluluklar"],
  "5::Din Kulturu": ["Allah Inanci", "Namaz", "Kur'an-i Kerim", "Peygamber Kissalari", "Mimarimizde Dini Motifler"],
  // 5/6/7. sinif Ingilizce - resmi PDF'ten (english-regular 2-8, Agustos 2026) DOGRULANDI.
  "4::Ingilizce": ["School Life", "Classroom Life", "Personal Life", "Family Life", "Homes Houses and the Neighbourhood", "Life in the City and the World"],
  "5::Ingilizce": ["School Life", "Classroom Life", "Personal Life", "Family Life", "Life in the Neighbourhood & City", "Life in the World", "Life in Nature", "Life in the Universe & Future"],
  "4::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],
  "5::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],
  "6::Turkce": ["Dilimizin Zenginligi", "Bagimsizlik Yolu", "Farkli Dunyalar", "Iletisim ve Sosyal Iliskiler", "Bilim ve Teknoloji", "Lider Ruhlar"],
  "7::Turkce": ["Hayat Boyu Gelisim", "Bir Hilal Ugruna", "Iletisim ve Sosyal Iliskiler", "Turk Sanati", "Okuma Kulturu", "Hak ve Sorumluluklar"],
  // Din Kulturu 6. sinif: sadece 3 unite dogrulanabildi, listenin eksik olma ihtimali var.
  // 6/7. sinif Din Kulturu - resmi PDF'ten (2025825154011486-din kulturu 4_8.pdf,
  // Agustos 2026) TAM DOGRULANDI. 5. sinif zaten dogruydu (web aramasi tutmus).
  "6::Din Kulturu": ["Peygamber ve Ilahi Kitap Inanci", "Ramazan ve Oruc", "Ahlaki Davranislar", "Peygamberliginden Once Hz. Muhammed", "Kulturumuzdeki Dini Motifler"],
  "7::Din Kulturu": ["Melek ve Ahiret Inanci", "Hac Umre ve Kurban", "Islam Dusuncesinde Yorumlar", "Peygamber Olarak Hz. Muhammed", "Yasayan Dunya Dinleri"],
  "6::Ingilizce": ["School Life", "Classroom Life", "Personal Life", "Family Life", "Life in the Neighbourhood & City", "Life in the World & Culture", "Life in Nature & Global Problems", "Life in the Universe & Future"],
  "7::Ingilizce": ["School Life & Education", "Classroom Life & Learning", "Personal Life & Well-Being", "Family Life & Home", "Life in the Neighbourhood & City", "Life in the World & Culture", "Life in Nature", "Life in the Universe & Future"],
  // 6. sinif Sosyal Bilgiler - resmi MEB PDF'inden (2024programsos4567Onayli.pdf)
  // DOGRULANDI (Agustos 2026): eski 7-alanli yapi (Birey ve Toplum vb.) YANLIS,
  // yeni mufredatta 4/5/6/7. siniflarin HEPSI AYNI 6 ogrenme alanini kullaniyor.
  "6::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],
  // 7. sinif Sosyal Bilgiler - ayni resmi PDF'den DOGRULANDI, 6. sinifla AYNI 6 alan.
  "7::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],
};

export const DOGRULANMIS_ALT_KONULAR = {
  // ==== 5. SINIF MATEMATIK (yeni mufredat - Turkiye Yuzyili Maarif Modeli) ====
  // 4. sinif - resmi PDF'ten (2024programmat1234Onayli.pdf, Agustos 2026) DOGRULANDI.
  "Matematik::Sayilar ve Nicelikler::4": ["Cok Basamakli Sayilarin Temsili", "Sayilari Siralama", "Ritmik Sayma", "Sayi ve Sekil Oruntuleri", "Basit-Bilesik-Tam Sayili Kesirler", "Denk Kesirler", "Paydalari Esit Kesirlerle Toplama-Cikarma"],
  "Matematik::Islemlerden Cebirsel Dusunmeye::4": ["Zihinden Toplama-Cikarma", "Dort Basamakli Sayilarla Islemler", "Carpma-Bolme Tahmini ve Kisa Yollari", "Dort Islem Gerektiren Problemler", "Esitligin Farkli Anlamlari"],
  "Matematik::Nesnelerin Geometrisi::4": ["Geometrik Cisimlerin Acinimlari", "Kose ve Kenarlarina Gore Sekiller", "Cevre Uzunlugu Olcme", "Alan Tahmini", "Aci Kavrami ve Olcme", "Dar-Genis Aci Siniflandirma", "Simetri"],
  "Matematik::Olaylarin Olasiligi ve Veriye Dayali Arastirma::4": ["Olasilik (Imkansiz-Olabilir-Kesin)", "Kategorik ve Nicel Veri ile Arastirma"],
  "Matematik::Sayilar ve Nicelikler::5": ["Cok Basamakli Dogal Sayilar", "Dogal Sayilarla Dort Islem", "Kesirlerin Farkli Temsilleri"],
  "Matematik::Islemlerle Cebirsel Dusunme::5": ["Esitligin Korunumu", "Islem Onceligi", "Oruntuler"],
  "Matematik::Geometrik Sekiller::5": ["Temel Geometrik Cizimler", "Aci Olcme ve Cokgenler", "Cemberde Kesisim"],
  "Matematik::Geometrik Nicelikler::5": ["Dikdortgenin Cevre Uzunlugu", "Dikdortgenin Alani"],
  "Matematik::Istatistiksel Arastirma Sureci::5": ["Kategorik Veri ile Calisma", "Grafik Yorumlama"],
  "Matematik::Veriden Olasiliga::5": ["Olaylarin Oznel Olasiligi"],

  // ==== 6. SINIF FEN BILIMLERI (resmi MEB kazanimlarindan - F.6.x) ====
  // 6/7. sinif Fen Bilimleri alt konulari - resmi PDF'ten (2024programfen345678Onayli.pdf,
  // Agustos 2026) dogrulanmistir.
  // 4. sinif - resmi PDF'ten (2024programfen345678Onayli.pdf, Agustos 2026) DOGRULANDI.
  // Not: 2 unitenin (Bilime Yolculuk, Isigin Pesinde) aciklamasi PDF'te sayfa
  // kesintisi yuzunden tam cikarilamadi, unite isminden makul cikarim yapildi.
  "Fen Bilimleri::Bilime Yolculuk::4": ["Bilimin Ozellikleri", "Bilimsel Bilgi Kaynaklarinin Guvenilirligi"],
  "Fen Bilimleri::Saglikli Besleniyorum::4": ["Besin Gruplari", "Dengeli Beslenme"],
  "Fen Bilimleri::Dunyamizi Kesfedelim::4": ["Dunyanin Sekli", "Dunyanin Yapisi (Hava-Su-Tas-Canli Kure)", "Dunyanin Hareketleri"],
  "Fen Bilimleri::Maddenin Degisimi::4": ["Maddelerin Hal Degisimi", "Isi Etkisiyle Degisim"],
  "Fen Bilimleri::Miknatisi Kesfediyorum::4": ["Miknatis Kutuplari ve Etkilesimi", "Miknatisin Etki Ettigi Maddeler"],
  "Fen Bilimleri::Enerji Dedektifleri::4": ["Basit Elektrik Devresi", "Yenilenebilir ve Yenilenemeyen Enerji Kaynaklari"],
  "Fen Bilimleri::Isigin Pesinde::4": ["Isik Kaynaklari", "Golge Olusumu"],
  "Fen Bilimleri::Surdurulebilir Sehirler ve Topluluklar::4": ["Surdurulebilir Yasam Alani Kurma"],
  "Fen Bilimleri::Gunes Sistemi ve Tutulmalar::6": ["Gezegenlerin Siniflandirilmasi", "Gunes Sistemi Modeli", "Gunes ve Ay Tutulmalari"],
  "Fen Bilimleri::Kuvvetin Etkisinde Hareket::6": ["Kuvvetin Olculmesi", "Surtunme Kuvveti", "Kuvvetin Cisimlere Etkisi"],
  "Fen Bilimleri::Canlilarda Sistemler::6": ["Destek ve Hareket Sistemi", "Sindirim Sistemi", "Dolasim Sistemi", "Solunum ve Bosaltim Sistemi"],
  "Fen Bilimleri::Isigin Yansimasi ve Renkler::6": ["Isigin Yansima Kanunlari", "Duzlem Aynada Goruntu", "Renklerin Olusumu"],
  "Fen Bilimleri::Maddenin Ayirt Edici Ozellikleri::6": ["Genlesme ve Buzulme", "Erime-Donma-Kaynama Noktasi", "Yogunluk Hesaplama"],
  "Fen Bilimleri::Elektrigin Iletimi ve Direnc::6": ["Iletken ve Yalitkan Maddeler", "Ampul Parlakligini Etkileyen Degiskenler", "Elektriksel Direnc"],
  "Fen Bilimleri::Surdurulebilir Yasam ve Etkilesim::6": ["Biyocesitlilik ve Tehditler", "Yakit Kullaniminin Cevresel Etkileri"],

  "Fen Bilimleri::Uzay Cagi::7": ["Uzay Arastirma Teknolojileri", "Uzay Gozlem Modeli", "Uzay Calismalarinin Sorunlari"],
  "Fen Bilimleri::Kuvvet ve Enerjiyi Kesfedelim::7": ["Fiziksel Anlamda Is Kavrami", "Is-Enerji Iliskisi"],
  "Fen Bilimleri::Vucudumuzdaki Sistemler::7": ["Sindirim-Dolasim-Solunum-Bosaltim Sistemleri", "Sistem Sagligi"],
  "Fen Bilimleri::Isigin Kirilmasi ve Mercekler::7": ["Kirilma Olayi", "Ince ve Kalin Kenarli Mercekler", "Merceklerin Kullanim Alanlari"],
  "Fen Bilimleri::Maddenin Dogasina Yolculuk::7": ["Atom Yapisi (Proton-Notron-Elektron)", "Element-Bilesik-Karisim Siniflandirmasi", "Sembol ve Formuller"],
  "Fen Bilimleri::Elektriklenme::7": ["Elektrik Yukleri", "Itme-Cekme Kuvvetleri", "Elektriklenme Cesitleri"],
  "Fen Bilimleri::Surdurulebilir Yasam ve Enerji::7": ["Besin Zinciri ve Enerji Iliskisi", "Su Tasarrufu ve Su Ayak Izi"],

  // ==== 5. SINIF FEN BILIMLERI (yeni mufredat - Turkiye Yuzyili Maarif Modeli) ====
  "Fen Bilimleri::Gokyuzundeki Komsularimiz ve Biz::5": ["Gunes'in Yapisi ve Donme Hareketi", "Ay'in Ozellikleri Donme ve Dolanma Hareketleri"],
  "Fen Bilimleri::Kuvveti Taniyalim::5": ["Kuvvetin Buyuklugu ve Dinamometre", "Agirlik ve Yer Cekimi", "Surtunme Kuvveti"],
  "Fen Bilimleri::Canlilarin Yapisina Yolculuk::5": ["Hucre ve Organelleri", "Destek ve Hareket Sistemi"],
  "Fen Bilimleri::Isigin Dunyasi::5": ["Isigin Yayilmasi", "Madde ve Isik (Saydam-Yari Saydam-Opak)", "Golge Olusumu"],
  "Fen Bilimleri::Maddenin Dogasi::5": ["Maddenin Tanecikli Yapisi", "Isi ve Sicaklik", "Isi Iletimi (Iletken-Yalitkan)"],
  "Fen Bilimleri::Yasamimizdaki Elektrik::5": ["Devre Elemanlari ve Sembolleri", "Devre Semalari"],
  "Fen Bilimleri::Surdurulebilir Yasam ve Geri Donusum::5": ["Geri Donusum ve Cevre Bilinci", "Dogal Kaynaklarin Korunumu"],

  // ==== 5/6/7. SINIF TURKCE (standart pedagojik siniflandirma - Matematik/Fen kadar
  // resmi kaynaktan tek tek dogrulanmadi, ORTA guven seviyesi) ====
  // 5/6/7. sinif Turkce - unite (tema) isimleri resmi PDF'ten dogrulanmis. Alt basliklar,
  // her temanin ders akisinda islenen gercek dilbilgisi/metin becerisi konularidir
  // (LGS'nin agirlikli sordugu dilbilgisi konularinin kaybolmamasi icin).
  // 4. sinif - resmi PDF'ten (2024programtur1234Onayli.pdf, Agustos 2026) DOGRULANDI.
  // Not: 1-4. sinif Turkce, 5-8'den FARKLI olarak tema degil DIL BECERISI
  // bazinda yapilandirilmis (Dinleme/Konusma/Okuma/Yazma).
  "Turkce::Dinleme ve Izleme::4": ["Dinleme/Izlemeyi Yonetme", "Dinlediklerinden Anlam Olusturma", "Dinlediklerini Cozumleme", "Dinleme Surecini Degerlendirme"],
  "Turkce::Konusma::4": ["Konusmayi Yonetme", "Konusmada Icerik Olusturma", "Konusma Kurallarini Uygulama", "Konusma Surecini Degerlendirme"],
  "Turkce::Okuma::4": ["Okuma Surecini Yonetme", "Okuduklarindan Anlam Olusturma", "Okuduklarini Cozumleme", "Okuma Surecini Degerlendirme"],
  "Turkce::Yazma::4": ["Yazili Anlatimi Yonetme", "Yazida Icerik Olusturma", "Yazim Kurallarini Uygulama", "Yazma Surecini Degerlendirme"],
  "Turkce::Oyun Dunyasi::5": ["Gercek ve Mecaz Anlam", "Es ve Zit Anlamli Kelimeler", "Oyun Temali Metin Okuma"],
  "Turkce::Ataturk'u Tanimak::5": ["Ana Fikir Bulma", "Bilgilendirici Metin Okuma"],
  "Turkce::Duygularimi Taniyorum::5": ["Cumlede Anlam", "Duygu Bildiren Sozcukler"],
  "Turkce::Geleneklerimiz::5": ["Buyuk Harflerin Kullanimi", "Kulturel Metin Okuma", "Deyim ve Atasozleri"],
  "Turkce::Iletisim ve Sosyal Iliskiler::5": ["Nokta ve Virgul", "Soru ve Unlem Isareti", "Diyalog Metinleri"],
  "Turkce::Saglikli Yasiyorum::5": ["Hikaye Unsurlari", "Bilgilendirici Metin Yazma"],

  "Turkce::Dilimizin Zenginligi::6": ["Gercek Mecaz ve Terim Anlam", "Isim Tamlamasi", "Sifat Tamlamasi"],
  "Turkce::Bagimsizlik Yolu::6": ["Ana Fikir Bulma", "Tarihi Metin Okuma"],
  "Turkce::Farkli Dunyalar::6": ["Zamirler", "Betimleyici Metin"],
  "Turkce::Iletisim ve Sosyal Iliskiler::6": ["Edat Baglac Unlem", "Diyalog Kurma"],
  "Turkce::Bilim ve Teknoloji::6": ["Neden-Sonuc ve Kosul Cumleleri", "Bilgilendirici Metin"],
  "Turkce::Lider Ruhlar::6": ["Yazim Kurallari", "Noktalama Isaretleri", "Biyografik Metin"],

  "Turkce::Hayat Boyu Gelisim::7": ["Fiilimsiler (Isim-Sifat-Zarf Fiil)", "Kisisel Gelisim Metni"],
  "Turkce::Bir Hilal Ugruna::7": ["Cumlenin Ogeleri", "Milli Mucadele Temali Metin"],
  "Turkce::Iletisim ve Sosyal Iliskiler::7": ["Fiilde Cati", "Diyalog Metinleri"],
  "Turkce::Turk Sanati::7": ["Anlatim Bozukluklari", "Sanat Temali Metin Okuma"],
  "Turkce::Okuma Kulturu::7": ["Cumle Turleri", "Paragrafta Ana Dusunce"],
  "Turkce::Hak ve Sorumluluklar::7": ["Soz Sanatlari (Benzetme Kisilestirme)", "Hak-Sorumluluk Temali Metin"],

  // ==== 6/7. SINIF DIN KULTURU ====
  "Din Kulturu::Peygamber ve Ilahi Kitap Inanci::6": ["Peygamberlik Kavrami", "Ilahi Kitaplar"],
  "Din Kulturu::Ramazan ve Oruc::6": ["Ramazan Ayinin Onemi", "Oruc Ibadeti ve Cesitleri"],
  "Din Kulturu::Ahlaki Davranislar::6": ["Dogru Sozlu Olma", "Merhamet ve Adab-i Muaseret"],
  "Din Kulturu::Peygamberliginden Once Hz. Muhammed::6": ["Cocukluk ve Genclik Donemi", "Ticaret Hayati"],
  "Din Kulturu::Kulturumuzdeki Dini Motifler::6": ["Mimaride Dini Ogeler", "Sanatta Dini Motifler"],
  "Din Kulturu::Melek ve Ahiret Inanci::7": ["Meleklere Iman", "Ahiret Hayati"],
  "Din Kulturu::Hac Umre ve Kurban::7": ["Hac Ibadeti", "Umre", "Kurban Ibadeti"],
  "Din Kulturu::Islam Dusuncesinde Yorumlar::7": ["Mezhep Kavrami", "Yorum Farkliliklarina Saygi"],
  "Din Kulturu::Peygamber Olarak Hz. Muhammed::7": ["Peygamberlik Gorevi", "Ornek Kisiligi"],
  "Din Kulturu::Yasayan Dunya Dinleri::7": ["Yahudilik ve Hristiyanlik", "Hinduizm ve Budizm"],

  // ==== 6/7. SINIF INGILIZCE (8. sinifla ayni beceri-bazli yapi: Dinleme/Konusma/Okuma/Yazma) ====
  "Ingilizce::School Life::6": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Classroom Life::6": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Personal Life::6": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Family Life::6": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the Neighbourhood & City::6": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the World & Culture::6": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in Nature & Global Problems::6": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the Universe & Future::6": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::School Life & Education::7": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Classroom Life & Learning::7": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Personal Life & Well-Being::7": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Family Life & Home::7": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the Neighbourhood & City::7": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the World & Culture::7": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in Nature::7": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the Universe & Future::7": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],

  // ==== 6/7. SINIF SOSYAL BILGILER (7 ortak ogrenme alani, standart alt basliklar) ====
  // Asagidaki 6./7. sinif Sosyal Bilgiler alt konulari, resmi MEB PDF'inden
  // (2024programsos4567Onayli.pdf, kullanici tarafindan yuklendi, Agustos 2026)
  // GERCEK kazanim metinlerinden cikarilmistir - tahmin degil.
  "Sosyal Bilgiler::Birlikte Yasamak::6": ["Gruplar ve Degisen Roller", "Kulturel Baglar ve Milli Degerler", "Toplumsal Sorunlara Cozum Onerileri"],
  "Sosyal Bilgiler::Evimiz Dunya::6": ["Ulkemizin Kitalar ve Okyanuslara Gore Konumu", "Dogal ve Beseri Cevre Iliskisi", "Turk Dunyasiyla Kulturel Is Birlikleri"],
  "Sosyal Bilgiler::Ortak Mirasimiz::6": ["Turkistan'daki Ilk Turk Devletleri", "Islam Medeniyetinin Katkilari (VII-XIII. yy)", "Islamiyet'in Kabulu ve Sosyal-Kulturel Hayat", "XI-XIII. Yuzyil Siyasi ve Askeri Faaliyetler"],
  "Sosyal Bilgiler::Yasayan Demokrasimiz::6": ["Yonetimde Karar Alma Sureci", "Temel Hak ve Sorumluluklar", "Dijitallesme ve Vatandaslik Haklari"],
  "Sosyal Bilgiler::Hayatimizdaki Ekonomi::6": ["Kaynaklar ve Ekonomik Faaliyetler", "Ekonomik Faaliyetler ve Meslekler", "Yatirim ve Pazarlama Projesi"],
  "Sosyal Bilgiler::Teknoloji ve Sosyal Bilimler::6": ["Ulasim-Iletisim Teknolojileri ve Kulturel Etkilesim", "Telif ve Patent Surecleri"],
  "Sosyal Bilgiler::Birlikte Yasamak::7": ["Ozel Gereksinimli Bireyler icin Firsat Esitligi", "Milli Meselelere Karsi Tutum ve Davranislar"],
  "Sosyal Bilgiler::Evimiz Dunya::7": ["Kureselleşmenin Insan ve Toplum Hayatina Etkisi", "Bolgesel-Kuresel Sorunlarda Ulkemizin Rolu"],
  "Sosyal Bilgiler::Ortak Mirasimiz::7": ["Osmanli'nin Cihan Devleti Olmasi", "Osmanli'nin Uyguladigi Yenilikler", "Osmanli Kultur ve Medeniyeti"],
  "Sosyal Bilgiler::Yasayan Demokrasimiz::7": ["Cumhuriyet'in Temel Nitelikleri", "Turkiye'nin Yonetim Yapisi", "Demokrasinin Gelisimi", "Demokraside Karsilasilan Sorunlar"],
  "Sosyal Bilgiler::Hayatimizdaki Ekonomi::7": ["Milli Kalkinma Hamleleri", "Ekonomik Gelismislik ve Uretim-Dagitim-Tuketim"],
  "Sosyal Bilgiler::Teknoloji ve Sosyal Bilimler::7": ["Bilimsel-Teknolojik Gelismelerin Gelecege Etkisi", "Sosyal Bilimlerin Calisma Alanlari", "Bilimsel Sorgulama"],

  // ==== 5. SINIF DIN KULTURU (yeni mufredat - resmi MEB 5 ana unite) ====
  // 4. sinif - resmi PDF'ten (din_kultur_4_8, Agustos 2026) DOGRULANDI.
  "Din Kulturu::Gunluk Hayat ve Din::4": ["Gunluk Hayatta Dini Ifadeler", "Temizlik ve Saglikli Beslenme", "Sukur"],
  "Din Kulturu::Allah Sevgisi::4": ["Allahin Birligi ve Yuceligi", "Allahin Kullarina Sevgisi", "Dua, Kelime-i Tevhit ve Sehadet"],
  "Din Kulturu::Peygamberlerin Sevgisi::4": ["Peygamberlerin Cocuklarla Iliskisi", "Cevre ve Calismayi Sevme"],
  "Din Kulturu::Ahlaki Degerlerimiz::4": ["Adalet", "Sabir", "Yardimseverlik"],
  "Din Kulturu::Haklar ve Sorumluluklar::4": ["Temel Hak ve Ozgurlukler", "Mahremiyet", "Allaha ve Insanlara Karsi Sorumluluklar"],
  "Din Kulturu::Allah Inanci::5": ["Allah'in Varligi ve Birligi", "Allah'in Sifatlari"],
  "Din Kulturu::Namaz::5": ["Namazin Onemi", "Namazin Kilinisi"],
  "Din Kulturu::Kur'an-i Kerim::5": ["Kur'an'i Tanima", "Kur'an Okuma Kurallarinin Temelleri"],
  "Din Kulturu::Peygamber Kissalari::5": ["Peygamber Kissalarindan Ornekler", "Kissalardan Alinacak Dersler"],
  "Din Kulturu::Mimarimizde Dini Motifler::5": ["Cami Mimarisi", "Dini Motiflerin Sanattaki Yansimalari"],

  // ==== 5. SINIF INGILIZCE (yeni mufredat - resmi MEB 10 unite) ====
  // 4. sinif - resmi PDF'ten (english-regular, Agustos 2026) DOGRULANDI.
  "Ingilizce::School Life::4": ["Okulda Kisiler", "Gunluk Rutinler", "Sevilen Aktiviteler", "Sevilen Aylar", "Milli Gunler"],
  "Ingilizce::Classroom Life::4": ["Ders Konulari", "Sinif Etkinlikleri", "Mevsimler"],
  "Ingilizce::Personal Life::4": ["Fiziksel Gorunum ve Kisilik", "Kiyafetler", "Hobiler ve Yetenekler", "Hava Durumu", "Karsilastirmalar"],
  "Ingilizce::Family Life::4": ["Aile Uyelerinin Meslekleri", "Aile Aliskanliklari", "Aile Islerinin Yurutulmesi"],
  "Ingilizce::Homes Houses and the Neighbourhood::4": ["Mahalledeki Hizmet Yerleri", "Deniz Canlilari ve Yasam Alanlari", "Ev Turleri"],
  "Ingilizce::Life in the City and the World::4": ["Saglikli-Saglisiz Yiyecekler", "Ulusal ve Uluslararasi Yemekler", "Ulkeler", "Tatiller"],
  "Ingilizce::School Life::5": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Classroom Life::5": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Personal Life::5": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Family Life::5": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the Neighbourhood & City::5": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the World::5": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in Nature::5": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the Universe & Future::5": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],

  // ==== 5. SINIF SOSYAL BILGILER (yeni mufredat - 6/7'den FARKLI ogrenme alani isimleri) ====
  // 5. sinif - PDF'den DOGRULANMIS/hassaslastirilmis (Agustos 2026)
  // 4. sinif - resmi PDF'ten (2024programsos4567Onayli.pdf, Agustos 2026) DOGRULANDI.
  "Sosyal Bilgiler::Birlikte Yasamak::4": ["Sosyal Bilgiler Dersinin Katkilari", "Bireysel Ozelliklere Saygi", "Toplumsal Birlik"],
  "Sosyal Bilgiler::Evimiz Dunya::4": ["Harita Kullanarak Konum ve Yon Bulma", "Doga ve Insan Iliskisi", "Afetlerin Etkilerini Azaltma"],
  "Sosyal Bilgiler::Ortak Mirasimiz::4": ["Gecmisten Gunumuze Oyun ve Oyuncaklar", "Aile Tarihi", "Yakin Cevredeki Ortak Miras Ogeleri"],
  "Sosyal Bilgiler::Yasayan Demokrasimiz::4": ["Cumhuriyetin Ilani ve Ataturk", "Cumhuriyetin Getirdigi Degisimler", "Okulda Demokratik Katilim"],
  "Sosyal Bilgiler::Hayatimizdaki Ekonomi::4": ["Dogal Kaynaklarin Tuketimi", "Istek ve Ihtiyac Arasindaki Secimler", "Uretim-Dagitim-Tuketim Sureci"],
  "Sosyal Bilgiler::Teknoloji ve Sosyal Bilimler::4": ["Cevrim Ici Guvenlik Kurallari", "Bilim Insanlarinin Cocukluk Hayati"],
  "Sosyal Bilgiler::Birlikte Yasamak::5": ["Gruplar ve Gruplardaki Roller", "Kulturel Ozelliklere Saygi", "Yardimlasma ve Dayanisma"],
  "Sosyal Bilgiler::Evimiz Dunya::5": ["Ilin Goreceli Konumu", "Dogal ve Beseri Cevre Degisimi", "Afetlere Karsi Farkindalik", "Komsu Devletler"],
  "Sosyal Bilgiler::Ortak Mirasimiz::5": ["Ildeki Ortak Miras Ogeleri", "Anadolu'daki Ilk Yerlesimler", "Mezopotamya ve Anadolu Medeniyetleri"],
  "Sosyal Bilgiler::Yasayan Demokrasimiz::5": ["Demokrasi-Cumhuriyet Iliskisi", "Etkin Vatandaslik", "Temel Hak ve Sorumluluklar", "Basvuru Yapilabilecek Kurumlar"],
  "Sosyal Bilgiler::Hayatimizdaki Ekonomi::5": ["Kaynaklari Verimli Kullanma", "Butce Planlama", "Ildeki Ekonomik Faaliyetler"],
  "Sosyal Bilgiler::Teknoloji ve Sosyal Bilimler::5": ["Teknolojik Urunlerin Bilincli Kullanimi", "Sosyal Bilimlerin Calisma Alanlari"],
  "Matematik::Carpanlar ve Katlar": ["Asal Carpanlara Ayirma", "EBOB Hesaplama", "EKOK Hesaplama", "Aralarinda Asal Sayilar"],
  "Matematik::Uslu Ifadeler": ["Tam Sayi Kuvvetleri", "Uslu Ifadelerde Temel Kurallar", "Bilimsel Gosterim"],
  "Matematik::Karekoklu Ifadeler": ["Tam Kare Olmayan Sayinin Karekoku", "Kareklu Ifadeleri Sadelestirme", "Kareklu Ifadelerde Carpma-Bolme", "Kareklu Ifadelerde Toplama-Cikarma", "Rasyonel ve Irrasyonel Sayilar"],
  "Matematik::Veri Analizi": ["Cizgi ve Sutun Grafigi Yorumlama", "Grafik Turleri Arasi Donusum"],
  "Matematik::Cebirsel Ifadeler ve Ozdeslikler": ["Ozdeslikler", "Cebirsel Ifadeleri Carpanlara Ayirma"],
  "Matematik::Dogrusal Denklemler": ["Birinci Dereceden Bir Bilinmeyenli Denklemler"],
  "Matematik::Olasilik": ["Olasilik Kavrami", "Basit Olaylarin Olma Olasiligi"],
  "Matematik::Esitsizlikler": ["Esitsizlik Cumleleri Yazma", "Sayi Dogrusunda Gosterim", "Esitsizlik Cozme"],
  "Matematik::Ucgenler": ["Kenarortay Acortay Yukseklik", "Ucgen Esitsizligi", "Kenar-Aci Iliskisi", "Pisagor Bagintisi"],
  "Matematik::Eslik ve Benzerlik": ["Es ve Benzer Sekiller", "Kenar ve Aci Iliskileri"],
  "Matematik::Donusum Geometrisi": ["Oteleme", "Yansima", "Cokgenlerin Oteleme ve Yansima Goruntusu"],
  "Matematik::Geometrik Cisimler": ["Dik Prizmalar", "Dik Dairesel Silindir", "Silindirin Yuzey Alani ve Hacmi", "Dik Piramit", "Dik Koni"],

  // ==== 6/7. SINIF MATEMATIK - resmi MEB PDF'inden (2024programmat5678Onayli.pdf,
  // kullanici tarafindan yuklendi, Agustos 2026) TAM DOGRULANDI ====
  "Matematik::Sayilar ve Nicelikler::6": ["Carpan ve Kat Iliskisi", "Bolunebilme Kurallari", "Asal Carpanlara Ayirma", "Ondalik Gosterimin Basamak Degeri"],
  "Matematik::Islemlerle Cebirsel Dusunme ve Degisimler::6": ["Bilinmeyen Niceliklerin Temsili", "Cebirsel Ifadelerin Anlami", "Oruntuler"],
  "Matematik::Geometrik Sekiller::6": ["Paralel Dogru ve Kesenle Olusan Acilar", "Ucgenin Acilari", "Dortgenlerin Ozellikleri"],
  "Matematik::Geometrik Nicelikler::6": ["Uzunluk-Alan Olcme Birimleri", "Paralelkenar ve Ucgenin Alani", "Cemberin Cap-Uzunluk Iliskisi"],
  "Matematik::Istatistiksel Arastirma Sureci::6": ["Kategorik/Nicel Veri ile Calisma", "Istatistiksel Sonuc Yorumlama"],
  "Matematik::Veriden Olasiliga::6": ["Olaylarin Deneysel Olasiligi"],

  "Matematik::Sayilar ve Nicelikler::7": ["Dogal-Tam-Rasyonel Sayi Iliskisi", "Oran Iliskileri Uzerinden Muhakeme"],
  "Matematik::Islemlerle Cebirsel Dusunme ve Degisimler::7": ["Cebirsel Ifadelerle Islemler", "Denklem ve Esitsizliklerle Problem Cozme"],
  "Matematik::Geometrik Sekiller::7": ["Yansima Donusumu", "Orta Dikme ve Acortay Insasi", "Ucgende Kenarortay"],
  "Matematik::Geometrik Nicelikler::7": ["Es Kuplerle Olusturulan Yapilar", "Yamuk-Eskenar Dortgen-Daire Alani"],
  "Matematik::Istatistiksel Arastirma Sureci::7": ["Nicel (Surekli) Veri ile Calisma", "Istatistiksel Arastirma Yurutme"],
  "Matematik::Veriden Olasiliga::7": ["Ayrik ve Esit Olasilikli Olaylar", "Tumleyen Olay Kavrami"],
  // Fen Bilimleri (8. sinif) - MEB resmi ogretim programi kazanimlarindan (F.8.1 - F.8.7)
  "Fen Bilimleri::Mevsimler ve Iklim": ["Mevsimlerin Olusumu", "Iklim ve Hava Hareketleri"],
  "Fen Bilimleri::DNA ve Genetik Kod": ["DNA ve Genetik Kod Yapisi", "Kalitim", "Mutasyon ve Modifikasyon", "Adaptasyon"],
  "Fen Bilimleri::Basinc": ["Kati Basinci", "Sivi Basinci"],
  "Fen Bilimleri::Madde ve Endustri": ["Periyodik Sistem", "Fiziksel ve Kimyasal Degisim", "Isinma ve Hal Degisimi"],
  "Fen Bilimleri::Basit Makineler": ["Basit Makineler"],
  "Fen Bilimleri::Enerji Donusumleri ve Cevre Bilimi": ["Besin Zinciri ve Enerji Akisi", "Fotosentez ve Solunum", "Kuresel Iklim Degisikligi"],
  "Fen Bilimleri::Elektrik Yukleri ve Elektrik Enerjisi": ["Elektrik Yukleri ve Elektriklenme", "Elektrik Yuklu Cisimler", "Elektrik Enerjisinin Donusumu"],
  // Turkce (8. sinif) - MEB resmi ogretim programindan (T.8.x) - sadece cok maddeli/net
  // dogrulanabilen uniteler eklendi, tek-kazanimli olanlar (Cumle Turleri, Fiilde Cati,
  // Yazim Kurallari, Noktalama, Soz Sanatlari) icin yeterli veri bulunamadi, AI onerisinde kaldi.
  "Turkce::Fiilimsiler": ["Isim-Fiil (Mastar)", "Sifat-Fiil (Ortac)", "Zarf-Fiil (Baglac-Fiil)"],
  "Turkce::Cumlenin Ogeleri": ["Ozne", "Yuklem", "Nesne", "Dolayli Tumlec", "Zarf Tumleci"],
  "Turkce::Anlatim Bozukluklari": ["Anlam Yonunden Anlatim Bozukluklari", "Dil Bilgisi Yonunden Anlatim Bozukluklari"],
  "Turkce::Paragrafta Anlam": ["Ana Fikir Belirleme", "Ozetleme", "Baslik Belirleme", "Yardimci Fikir Belirleme"],
  // Cumle Turleri (T.8.4.19) ve Fiilde Cati (T.8.4.20) resmi kazanimda TEK madde
  // ("kavramsal tanimlamalara girilmez") - asagidaki kirilim standart pedagojik
  // siniflandirma, resmi ayri kazanim numarasi degil.
  "Turkce::Cumle Turleri": ["Yapisina Gore Cumleler", "Anlamina Gore Cumleler", "Yuklemin Turune Gore Cumleler"],
  "Turkce::Fiilde Cati": ["Ozne-Yuklem Iliskisine Gore Fiil Catisi", "Nesne-Yuklem Iliskisine Gore Fiil Catisi"],
  "Turkce::Yazim Kurallari": ["Buyuk Harflerin Kullanimi", "Birlesik Kelimelerin Yazimi", "Sayilarin Yazimi", "Kisaltmalarin Yazimi"],
  "Turkce::Noktalama Isaretleri": ["Nokta ve Virgul", "Soru ve Unlem Isareti", "Tirnak ve Kesme Isareti"],
  "Turkce::Soz Sanatlari": ["Benzetme", "Kisilestirme", "Abartma", "Konusturma"],
  // T.C. Inkilap Tarihi ve Ataturkculuk (8. sinif) - MEB resmi ogretim programindan (ITA.8.x)
  "T.C. Inkilap Tarihi::Bir Kahraman Doguyor": ["Mustafa Kemal'in Cocuklugu ve Egitimi", "Askeri ve Idari Gorevleri", "I. Dunya Savasi'nda Osmanli Devleti"],
  "T.C. Inkilap Tarihi::Milli Uyanis: Bagimsizlik Yolunda Atilan Adimlar": ["Mondros Ateskes Antlasmasi ve Isgaller", "Kongreler Donemi (Amasya, Erzurum, Sivas)", "Misak-i Milli", "TBMM'nin Acilisi"],
  "T.C. Inkilap Tarihi::Ya Istiklal Ya Olum": ["Kurtulus Savasi Cepheleri", "Buyuk Taarruz ve Baskumandanlik Meydan Savasi", "Lozan Antlasmasi"],
  "T.C. Inkilap Tarihi::Ataturkculuk ve Cagdaslasan Turkiye": ["Ataturk Ilkeleri", "Siyasi Alanda Inkilaplar", "Hukuk Alaninda Inkilaplar", "Toplumsal Alanda Inkilaplar", "Ekonomi Alaninda Gelismeler"],
  "T.C. Inkilap Tarihi::Demokratiklesme Cabalari": ["Mustafa Kemal'e Suikast Girisimi", "Cumhuriyete Yonelik Ic Tehditler"],
  "T.C. Inkilap Tarihi::Ataturk Donemi Turk Dis Politikasi": ["Dis Politikanin Temel Ilkeleri", "Bogazlar ve Musul Sorunu", "Hatay'in Anavatana Katilmasi"],
  "T.C. Inkilap Tarihi::Ataturk'un Olumu ve Sonrasi": ["Ataturk'un Olumune Iliskin Degerlendirmeler", "Ataturk'un Fikir ve Eserlerinin Kalicilik Bilinci"],
  "T.C. Inkilap Tarihi::II. Dunya Savasi Surecinde Turkiye": ["Ataturk'un II. Dunya Savasi Oncesi Tespitleri", "II. Dunya Savasi'nin Turkiye'ye Etkileri", "Cok Partili Siyasi Hayata Gecis"],
  // Din Kulturu ve Ahlak Bilgisi (8. sinif) - MEB resmi ogretim programindan (DKAB.8.x)
  "Din Kulturu::Kader Inanci": ["Kader ve Kaza Inanci", "Ilim-Irade-Sorumluluk Iliskisi", "Kader ile Ilgili Yanlis Anlayislar"],
  "Din Kulturu::Zekat ve Sadaka": ["Zekat Ibadeti", "Sadaka Ibadeti", "Maun Suresi"],
  "Din Kulturu::Din ve Hayat": ["Din Birey ve Toplum Iliskisi", "Can Nesil Akil Mal Din Emniyeti", "Hz. Yusuf'un Ornek Hayati", "Asr Suresi"],
  "Din Kulturu::Hz. Muhammed'in Ornekligi": ["Cesaret ve Kararlilik", "Hakki Gozetme", "Insanlara Deger Verme", "Hikmetli Soz ve Davranislar", "Kureys Suresi"],
  "Din Kulturu::Kur'an-i Kerim'de Sunulan Ornek Sahsiyetler": ["Kur'an'in Temel Kaynaklari", "Kur'an'in Ana Konulari", "Kur'an'in Ozellikleri", "Hz. Nuh'un Tevhide Daveti"],
  // Ingilizce (8. sinif) - MEB resmi ogretim programi HER UNITEYI ayni beceri
  // cercevesiyle yapilandirir: Listening, Speaking, Reading, Writing (dogrulanmis format).
  "Ingilizce::School Life & Education": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Classroom Life & Learning": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Personal Life & Well-Being": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Family Life & Home": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the Neighbourhood & City": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the World and Culture": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in Nature & Global Problems": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Life in the Universe & Future": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
};


export function dersinUniteleri(dersAdi, sinifNo) {
  const anahtarli = MUFREDAT_DIGER_SINIFLAR[`${sinifNo}::${dersAdi}`];
  return anahtarli || MUFREDAT[dersAdi] || [];
}
