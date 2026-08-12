"use client";
import { useState, useEffect, useRef } from "react";
import { TURKIYE_IL_ILCE } from "@/lib/il-ilce";

const DUYURULAR = [
  { ikon: "🧭", baslik: "Seviye Tespiti ile basla", metin: "6 dersten 12 soru — nerede guclu, nerede zayif oldugunu 5 dakikada ogren." },
  { ikon: "🤖", baslik: "Yapay zeka 7/24 hazir", metin: "Gece yarisi bile olsa, istedigin konuyu aninda anlatir, soru uretir." },
  { ikon: "📸", baslik: "Fotografla soru coz", metin: "Cozemedigin sorunun fotografini cek, saniyeler icinde adim adim cozum al." },
  { ikon: "📊", baslik: "Gercek sonuc belgesi", metin: "Her denemede net hesaplamasi, zorluk kirilimi ve alt konu analizi." },
  { ikon: "🔒", baslik: "Sirali, kilitli ilerleme", metin: "Bir konu bitmeden digeri acilmaz — dagitmadan, duzenli calis." },
  { ikon: "🎯", baslik: "Kisisel calisma plani", metin: "Zayif olduguen dersler otomatik tespit edilir, haftalik program cikarilir." },
];

// Basari/hata gibi anlamsal renkler (dogru/yanlis, trafik isigi mantigi) BILEREK
// temadan bagimsiz tutulur - yesil her zaman "dogru" anlamina gelmeli, tema
// degisince degismemeli. Ama kod icinde 18+ yerde ayni hex kodu tekrar tekrar
// yazmak yerine TEK bir kaynaktan yonetiliyor - tutarlilik ve bakim kolayligi icin.
const RENK_BASARI = "#3DA35D";
const RENK_BASARI_ACIK = "#EAF7EE";

const TEMALAR = {
  minimal: {
    isim: "Minimal", ikon: "⚪",
    bg: "#F5F5F7", page: "#FFFFFF", ink: "#1D1D1F", muted: "#86868B",
    coral: "#0A84FF", mustard: "#FF9F0A", line: "#E5E5EA",
    gradient: "linear-gradient(160deg, #1D1D1F 0%, #000000 100%)", bgText: "#1D1D1F",
  },
  orman: {
    isim: "Orman", ikon: "🌲",
    bg: "#1F3D2E", page: "#FAF6EE", ink: "#1B2430", muted: "#6B7566",
    coral: "#FF6B5E", mustard: "#E8B339", line: "#DCD5C4",
    gradient: "linear-gradient(160deg, #24402F 0%, #1A2E22 100%)", bgText: "#FAF6EE",
  },
  galaktik: {
    isim: "Galaktik", ikon: "🌌",
    bg: "#0D0B1F", page: "#F4F2FF", ink: "#1A1730", muted: "#8A7FC7",
    coral: "#FF5CA8", mustard: "#7C4DFF", line: "#3A3268",
    gradient: "linear-gradient(160deg, #241B4A 0%, #0D0B1F 100%)", bgText: "#F4F2FF",
  },
  hologram: {
    isim: "Hologram", ikon: "💠",
    bg: "#071A22", page: "#EAFBFF", ink: "#062830", muted: "#4FB8C9",
    coral: "#00E5C7", mustard: "#00B8FF", line: "#0F3A44",
    gradient: "linear-gradient(160deg, #0D3A44 0%, #071A22 100%)", bgText: "#EAFBFF",
  },
  uzay: {
    isim: "Uzay", ikon: "🪐",
    bg: "#14121F", page: "#FDF6EC", ink: "#221D33", muted: "#9C8FB5",
    coral: "#FF9A3C", mustard: "#FFD166", line: "#3A3352",
    gradient: "linear-gradient(160deg, #241F3D 0%, #14121F 100%)", bgText: "#FDF6EC",
  },
};

const DERSLER = [
  { ad: "Matematik", emoji: "➗" }, { ad: "Fen Bilimleri", emoji: "🔬" },
  { ad: "Turkce", emoji: "📖" }, { ad: "T.C. Inkilap Tarihi", emoji: "🏛️" },
  { ad: "Sosyal Bilgiler", emoji: "🌍" },
  { ad: "Din Kulturu", emoji: "🕌" }, { ad: "Ingilizce", emoji: "🇬🇧" },
];

// "T.C. Inkilap Tarihi" SADECE 8. sinifta (LGS) var - 5/6/7. sinifta bunun yerine
// "Sosyal Bilgiler" dersi okutuluyor. Bu yuzden ham DERSLER listesini degil, ogrencinin
// sinifina gore filtrelenmis bu listeyi kullaniyoruz - boylece 6/7. sinif ogrencisine
// hic var olmayan bir ders (Inkilap Tarihi) gosterilmiyor, 8. sinifa da olmayan
// "Sosyal Bilgiler" gosterilmiyor.
function gorunurDersler(sinifNo) {
  if (sinifNo === 8) return DERSLER.filter((d) => d.ad !== "Sosyal Bilgiler");
  return DERSLER.filter((d) => d.ad !== "T.C. Inkilap Tarihi");
}

// Gercek MEB 8. sinif (LGS) mufredati - ders bazinda unite listesi.
// Kaynak: MEB güncel müfredat + LGS konu dağılımı analizleri (2026).
const MUFREDAT = {
  "Matematik": ["Carpanlar ve Katlar", "Uslu Ifadeler", "Karekoklu Ifadeler", "Veri Analizi", "Olasilik", "Cebirsel Ifadeler ve Ozdeslikler", "Dogrusal Denklemler", "Esitsizlikler", "Ucgenler", "Eslik ve Benzerlik", "Donusum Geometrisi", "Geometrik Cisimler"],
  "Fen Bilimleri": ["Mevsimler ve Iklim", "DNA ve Genetik Kod", "Basinc", "Madde ve Endustri", "Basit Makineler", "Enerji Donusumleri ve Cevre Bilimi", "Elektrik Yukleri ve Elektrik Enerjisi"],
  "Turkce": ["Fiilimsiler", "Cumlenin Ogeleri", "Cumle Turleri", "Anlatim Bozukluklari", "Yazim Kurallari", "Noktalama Isaretleri", "Paragrafta Anlam", "Soz Sanatlari", "Fiilde Cati"],
  "T.C. Inkilap Tarihi": ["Bir Kahraman Doguyor", "Milli Uyanis: Bagimsizlik Yolunda Atilan Adimlar", "Ya Istiklal Ya Olum", "Ataturkculuk ve Cagdaslasan Turkiye", "Demokratiklesme Cabalari", "Ataturk Donemi Turk Dis Politikasi", "Ataturk'un Olumu ve Sonrasi", "II. Dunya Savasi Surecinde Turkiye"],
  "Din Kulturu": ["Kader Inanci", "Zekat ve Sadaka", "Hz. Muhammed'in Ornekligi", "Kur'an-i Kerim'de Sunulan Ornek Sahsiyetler", "Din ve Hayat"],
  // 8. sinif Ingilizce - resmi PDF'ten (english-regular 2-8, Agustos 2026) DOGRULANDI.
  // Ingilizce'nin gecis takvimi diger derslerden FARKLI - 8. sinif da yeni mufredatta.
  "Ingilizce": ["School Life & Education", "Classroom Life & Learning", "Personal Life & Well-Being", "Family Life & Home", "Life in the Neighbourhood & City", "Life in the World and Culture", "Life in Nature & Global Problems", "Life in the Universe & Future"],
};

// 5/6/7. sinif icin ayri unite listeleri - MUFREDAT (yukarida) 8. sinif icindir (LGS
// sinifi - MEB henuz eski mufredati degistirmedi, o veri saglam/guncel).
//
// ONEMLI - MUFREDAT GECIS BELIRSIZLIGI (arastirilip GUNCELLENDI, Agustos 2026):
// MEB "Turkiye Yuzyili Maarif Modeli" adiyla YENI bir mufredati KADEMELI olarak
// devreye sokuyor: 2024-25'te 5. sinif, 2025-26'da 6. sinif, 2026-27'de (yani TAM
// SU AN) 7. sinifin gecmesi bekleniyor. Yani:
//  - 6. sinif ARTIK YENI mufredatta - Matematik unite isimleri/yapisi buna gore
//    GUNCELLENDI (geometri/cebir uniteleri birlestirildi). Diger 5 ders (Fen, Turkce,
//    Sosyal, Din, Ingilizce) HENUZ guncellenmedi, eski (2018) veriyle calisiyor -
//    bilinen bir eksik, ileride tamamlanmali.
//  - 7. sinif icin: kaynaklar "temel konular (Tam Sayilar, Rasyonel Sayilar, Cebirsel
//    Ifadeler, Oran-Oranti, Yuzdeler) KORUNUYOR, degisen daha cok YAKLASIM (ezber
//    yerine muhakeme)" diyor - yani mevcut 7. sinif unite listemiz icerik olarak byk
//    olcude hala gecerli, "baglam temelli soru" standardimiz zaten bu yeni yaklasima
//    denk dusuyor. Kesin ayrintilar icin MEB duyurulari takip edilmeli.
// Eski mufredat verisi, sinif seviyesine 8. sinif icerigi gostermekten kesinlikle
// daha dogrudur (konular hala pedagojik olarak gecerli, sadece YENIDEN
// gruplanmis/yer degistirmis olabilir) - ama YENI mufredat resmen yayinlanip
// netlesince bu veri GOZDEN GECIRILMELI ve guncellenmelidir.
const MUFREDAT_DIGER_SINIFLAR = {
  // 5. sinif: YENI mufredat (Turkiye Yuzyili Maarif Modeli, 2024-25'ten beri).
  // Kaynak: MEB resmi PDF + Ocak 2026 tarihli guncel haber kaynagi - nispeten
  // oturmus (2. yilina girdi) ama yine de en dikkatli ele alinmasi gereken sinif.
  // 5/6/7. sinif Matematik - resmi MEB PDF'inden (2024programmat5678Onayli.pdf,
  // kullanici tarafindan yuklendi, Agustos 2026) TAM DOGRULANDI. Onceki kucuk-unite
  // yapisi (Carpanlar ve Katlar, Kesirlerle Islemler gibi ayri ayri) YANLISTI - resmi
  // program her sinifta sadece 6-7 GENIS "TEMA" kullaniyor, kucuk konular bu temalarin
  // ICINDE isleniyor. 8. sinif hala eski (2018) mufredatta oldugu icin degistirilmedi.
  "5::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],
  // 6. sinif Matematik - Turkiye Yuzyili Maarif Modeli'ne (2025-26'da 6. sinifa gecti)
  // gore GUNCELLENDI. Sayilar alani (Carpanlar/EBOB-EKOK/Ondalik) buyuk olcude ayni
  // kaldi, ama geometri ve cebir uniteleri YENIDEN ADLANDIRILIP BIRLESTIRILDI (kaynak:
  // resmi MEB yillik plani + birden fazla egitim sitesi, Agustos 2026). Tam kazanim
  // derinligi (alt basliklar) bu yeniden yapilanmaya gore HENUZ guncellenmedi - AI
  // onerisine dusuyor, ileride ayrica derinlestirilmeli.
  "6::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme ve Degisimler", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],
  "7::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme ve Degisimler", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],

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
  "5::Turkce": ["Oyun Dunyasi", "Ataturk'u Tanimak", "Duygularimi Taniyorum", "Geleneklerimiz", "Iletisim ve Sosyal Iliskiler", "Saglikli Yasiyorum"],
  "5::Din Kulturu": ["Allah Inanci", "Namaz", "Kur'an-i Kerim", "Peygamber Kissalari", "Mimarimizde Dini Motifler"],
  // 5/6/7. sinif Ingilizce - resmi PDF'ten (english-regular 2-8, Agustos 2026) DOGRULANDI.
  "5::Ingilizce": ["School Life", "Classroom Life", "Personal Life", "Family Life", "Life in the Neighbourhood & City", "Life in the World", "Life in Nature", "Life in the Universe & Future"],
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

// Dersin (ve sinifin) unite listesini dondurur. O sinif icin ozel veri varsa onu,
// yoksa 8. sinifin (MUFREDAT) verisini kullanir - boylece hicbir kombinasyon bos kalmaz.
function dersinUniteleri(dersAdi, sinifNo) {
  const anahtarli = MUFREDAT_DIGER_SINIFLAR[`${sinifNo}::${dersAdi}`];
  return anahtarli || MUFREDAT[dersAdi] || [];
}

// DOGRULANMIS MEB kazanim verisi (8. sinif Matematik) - resmi ogretim programindan
// arastirilip alinmistir, AI tarafindan uydurulmamistir. Sadece dogrulanan uniteler
// burada var; digerleri icin sistem AI'a alt konu onerdirir (ayri, acik etiketle).
const DOGRULANMIS_ALT_KONULAR = {
  // ==== 5. SINIF MATEMATIK (yeni mufredat - Turkiye Yuzyili Maarif Modeli) ====
  "Matematik::Sayilar ve Nicelikler::5": ["Cok Basamakli Dogal Sayilar", "Dogal Sayilarla Dort Islem", "Kesirlerin Farkli Temsilleri"],
  "Matematik::Islemlerle Cebirsel Dusunme::5": ["Esitligin Korunumu", "Islem Onceligi", "Oruntuler"],
  "Matematik::Geometrik Sekiller::5": ["Temel Geometrik Cizimler", "Aci Olcme ve Cokgenler", "Cemberde Kesisim"],
  "Matematik::Geometrik Nicelikler::5": ["Dikdortgenin Cevre Uzunlugu", "Dikdortgenin Alani"],
  "Matematik::Istatistiksel Arastirma Sureci::5": ["Kategorik Veri ile Calisma", "Grafik Yorumlama"],
  "Matematik::Veriden Olasiliga::5": ["Olaylarin Oznel Olasiligi"],

  // ==== 6. SINIF FEN BILIMLERI (resmi MEB kazanimlarindan - F.6.x) ====
  // 6/7. sinif Fen Bilimleri alt konulari - resmi PDF'ten (2024programfen345678Onayli.pdf,
  // Agustos 2026) dogrulanmistir.
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
  "Din Kulturu::Allah Inanci::5": ["Allah'in Varligi ve Birligi", "Allah'in Sifatlari"],
  "Din Kulturu::Namaz::5": ["Namazin Onemi", "Namazin Kilinisi"],
  "Din Kulturu::Kur'an-i Kerim::5": ["Kur'an'i Tanima", "Kur'an Okuma Kurallarinin Temelleri"],
  "Din Kulturu::Peygamber Kissalari::5": ["Peygamber Kissalarindan Ornekler", "Kissalardan Alinacak Dersler"],
  "Din Kulturu::Mimarimizde Dini Motifler::5": ["Cami Mimarisi", "Dini Motiflerin Sanattaki Yansimalari"],

  // ==== 5. SINIF INGILIZCE (yeni mufredat - resmi MEB 10 unite) ====
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

function denemeKapsamiHesapla(dersAdi, tur, sinifNo) {
  const tumUniteler = dersinUniteleri(dersAdi, sinifNo || 8);
  const yari = Math.ceil(tumUniteler.length / 2);
  const donem1 = tumUniteler.slice(0, yari);
  const donem2 = tumUniteler.slice(yari);
  if (tur === "deneme" || tumUniteler.length === 0) return tumUniteler;
  const donem1Yari = Math.ceil(donem1.length / 2);
  if (tur === "yazili1") return donem1.slice(0, donem1Yari);
  if (tur === "yazili2") return donem1;
  return donem2; // yazili3
}

// Onerilen soru sayisi kapsam turune gore - kullanici yine de degistirebilir.
function onerilenSoruSayisi(kapsamTuru) {
  if (kapsamTuru === "konu") return 5;
  if (kapsamTuru === "unite") return 8;
  return 10; // donem
}

// Auth henuz yok — tarayicida kalici anonim bir kimlik uretip ilerlemeyi buna bagliyoruz.
function cihazIdAl() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("karemux_cihaz_id");
  if (!id) {
    id = "cihaz-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("karemux_cihaz_id", id);
  }
  return id;
}

// Tarayicidan DOGRUDAN Anthropic'e degil, kendi /api/claude route'umuza istek atiyoruz.
// API anahtari sadece sunucuda (Vercel env) tutulur.
async function aiIstek(prompt, maxTokens, cihazId, jsonModu) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens, cihazId, jsonModu }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "AI istegi basarisiz");
  return data.text;
}

// Uretilen sorulari kalici soru bankasina arsivler - sessizce, hata olsa da akisi bozmaz.
// Konu anlatimi metnini govde + "Dikkat Edilecek Noktalar" kutusuna ayirir - PDF kitap
// formatindaki gorsel yapiyi canli sistemde de yansitmak icin.
function konuMetniAyir(metin) {
  if (!metin) return { govde: "", dikkatMaddeleri: null };
  const upper = metin.toUpperCase().replace(/İ/g, "I");
  const idx = upper.indexOf("DIKKAT EDILECEK") !== -1 ? upper.indexOf("DIKKAT EDILECEK")
    : upper.indexOf("SIK YAPILAN HATALAR") !== -1 ? upper.indexOf("SIK YAPILAN HATALAR") : -1;
  if (idx === -1) return { govde: metin, dikkatMaddeleri: null };
  const govde = metin.slice(0, idx).trim();
  const dikkatBlok = metin.slice(idx).split("\n").slice(1).join("\n"); // baslik satirini at
  const maddeler = dikkatBlok.split("\n").map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter((s) => s.length > 3);
  return { govde, dikkatMaddeleri: maddeler.length > 0 ? maddeler : null };
}

// Kullaniciya gosterilecek hata mesajini temizler - JSON.parse gibi teknik/ham
// hata mesajlarinin ekrana ciplak sekilde dusmesini engeller.
function temizHataMesaji(e, varsayilan) {
  const ham = e && e.message ? e.message : "";
  if (!ham) return varsayilan;
  const teknikMi = /JSON|Unexpected token|position \d+|SyntaxError|is not a function|undefined is not|Cannot read prop/i.test(ham);
  return teknikMi ? varsayilan : ham;
}

// MEB'in "Turkiye Yuzyili Maarif Modeli" kapsaminda yayinladigi "Baglam Temelli
// Coktan Secmeli Soru Yazim Kilavuzu"na dayanan ortak talimat parcasi. Sorularin
// SADECE bilgi degil, bilgiyle ne yapilabildigini olcmesini; gercekci bir senaryo/veri
// baglaminda kurulmasini (baglam SUS DEGIL, cozum icin gerekli); ve celdiricilerin
// rastgele degil, spesifik kavram yanilgilarini hedeflemesini saglar. Puanlama zaten
// objektif (dogru/yanlis, net hesabi) oldugundan bu yontemle tam uyumludur, ayrica
// bir puanlama degisikligi gerektirmez.
const BAGLAM_TEMELLI_SORU_TALIMATI = `Sorulari "Baglam Temelli Soru" yaklasimiyla yaz: her soru gercekci bir senaryo, veri veya durum (gunluk hayat, bilimsel veri, tarihsel belge, etik ikilem vb.) icinde kurulsun - soyut "bir sayi" veya "bir sekil" gibi baglamsiz sorulardan kacin. ONEMLI: Baglam SUS DEGIL, cozum icin ZORUNLU olmali - baglamdaki veri kullanilmadan, sadece genel bilgiyle cozulebilen bir soru gecersizdir. Her soru sadece bilgiyi degil, o bilgiyle NE YAPILABILDIGINI (problem cozme, sorgulama, ust duzey dusunme) olcsun. Celdiriciler (yanlis siklar) rastgele olmamali, ogrencinin gercekten yapabilecegi SPESIFIK bir kavram yanilgisini yansitmali. YAZIM: Turkce'ye ozgu karakterleri (i, g, u, s, o, c, I harflerinin noktali/simgeli hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye indirgenmis (sadeleştirilmemiş, noktasiz) yazma - orn. "ogrenci" degil "öğrenci", "icin" degil "için" yaz.`;

// AI'dan gelen soru listesi JSON'unu ayiklar. Bazen cevap token limitine takilip
// yarida kesilebiliyor (ozellikle uzun/karmasik konularda) - bu durumda son
// TAMAMLANMIS soru nesnesine kadar olan kismi kurtarip listeyi oradan kapatir,
// boylece "5 istendi 4 geldi ama calisiyor" olur, tum sinav cokup atilmaz.
function soruJsonAyikla(temizMetin) {
  const ankor = temizMetin.indexOf('"soru"');
  let baslangic = ankor !== -1 ? temizMetin.lastIndexOf("[", ankor) : temizMetin.indexOf("[");
  if (baslangic === -1) baslangic = temizMetin.indexOf("[{");
  if (baslangic === -1) throw new Error("AI gecerli bir soru listesi dondurmedi, tekrar dene");

  const sonAnkor = temizMetin.lastIndexOf('"dogruIndex"');
  let bitis = sonAnkor !== -1 ? temizMetin.indexOf("]", sonAnkor) : temizMetin.lastIndexOf("]");
  if (bitis === -1) bitis = temizMetin.lastIndexOf("]");

  const denemeYolu = (metin) => {
    try { return JSON.parse(metin); } catch (e) { return null; }
  };

  let sonuc = bitis !== -1 ? denemeYolu(temizMetin.slice(baslangic, bitis + 1)) : null;

  if (!sonuc) {
    const govde = temizMetin.slice(baslangic);
    const sonTamObjeSonu = govde.lastIndexOf("}");
    if (sonTamObjeSonu !== -1) {
      const kirpilmis = govde.slice(0, sonTamObjeSonu + 1) + "]";
      sonuc = denemeYolu(kirpilmis);
    }
  }

  if (!Array.isArray(sonuc)) throw new Error("AI gecerli bir soru listesi dondurmedi, tekrar dene");
  const gecerli = sonuc.filter((s) => s && s.soru && Array.isArray(s.secenekler) && s.secenekler.length >= 2 && typeof s.dogruIndex === "number");
  if (gecerli.length === 0) throw new Error("AI gecerli soru uretemedi, tekrar dene");
  return gecerli;
}

// Konu anlatimi govde metnini kavram basliklari + Tanim/Ornek/Kural etiketleriyle
// yapilandirilmis bir blok listesine cevirir - dijital kitap sayfasi hissi icin.
// AI bazen basligi ve etiketleri (Tanim/Ornek/Kural) ayri satira degil, ayni
// paragrafin icine gomerek yaziyor - bu yuzden hem paragraf basindaki basligi
// hem de paragraf icinde HERHANGI BIR YERDE gecen etiketleri ayiklar.
function konuMetniBloklaraAyir(govde) {
  if (!govde) return [];
  const rezerveEtiket = "Tanim|Tanım|Ornek|Örnek|Kural|Giris|Giriş|Not";
  const paragraflar = govde.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const bloklar = [];
  paragraflar.forEach((p) => {
    // Once: paragrafin TAMAMI kisa, iki nokta ustuste icermeyen, noktayla bitmeyen
    // tek basina bir baslik mi? (orn. "NEGATIF KUVVET VE TABAN ISARETI")
    const tekBasinaBaslikMi = !p.includes("\n") && !p.includes(":") && p.length < 90 && !/[.!?]$/.test(p);
    if (tekBasinaBaslikMi) {
      bloklar.push({ tur: "baslik", metin: p });
      return;
    }
    let govdeMetni = p;
    const baslikEslesme = p.match(/^([A-ZÇĞİÖŞÜ][\wÇĞİÖŞÜçğıöşü'’ ]{2,50}):\s+(.+)/s);
    if (baslikEslesme && !new RegExp(`^(${rezerveEtiket})$`, "i").test(baslikEslesme[1].trim())) {
      bloklar.push({ tur: "baslik", metin: baslikEslesme[1].trim() });
      govdeMetni = baslikEslesme[2];
    }
    const parcalar = govdeMetni.split(new RegExp(`(${rezerveEtiket})\\s*:\\s*`, "gi"));
    if (parcalar[0] && parcalar[0].trim()) bloklar.push({ tur: "govde", metin: parcalar[0].trim() });
    for (let i = 1; i < parcalar.length; i += 2) {
      const metin = (parcalar[i + 1] || "").trim();
      if (metin) bloklar.push({ tur: "etiketli", etiket: parcalar[i], metin });
    }
  });
  return bloklar;
}

function sorulariBankayaKaydet(ders, sinif, unite, sorular, kaynakTuru) {
  if (!sorular || sorular.length === 0) return;
  fetch("/api/soru-bankasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ders, sinif, unite, sorular, kaynakTuru }),
  }).catch(() => {});
}

export default function Ana() {
  const [mod, setMod] = useState("bos");
  const [secilenDers, setSecilenDers] = useState(null);
  const secilenDersRef = useRef(null);
  useEffect(() => { secilenDersRef.current = secilenDers; }, [secilenDers]);
  const [kocPaneliAcik, setKocPaneliAcik] = useState(false);
  const [kocPaneliDers, setKocPaneliDers] = useState(null);

  // Dersler ekraninda: gecmis yil zayifsa konu tekrari + test dongusu burada calisir.
  const [dersGecenYilZayifMi, setDersGecenYilZayifMi] = useState(null); // null=bilinmiyor, true/false
  const [dersTekrarSayaci, setDersTekrarSayaci] = useState({}); // { [ders]: sayi } (eski, geriye uyumluluk)
  const [soruAciklamalari, setSoruAciklamalari] = useState({}); // { [soruIndex]: aciklama metni }
  const [soruAciklamaYukleniyor, setSoruAciklamaYukleniyor] = useState(null); // hangi soru indexi yukleniyor

  async function soruAciklamasiGetir(index, soru, secenekler, dogruIndex, secilenIndex) {
    if (soruAciklamalari[index]) return; // zaten var
    setSoruAciklamaYukleniyor(index);
    try {
      const p = `Bir ogrenci su coktan secmeli soruyu yanlis cevapladi:
Soru: ${soru}
Secenekler: ${secenekler.join(" | ")}
Ogrencinin verdigi cevap: ${secenekler[secilenIndex] || "bos birakildi"}
Dogru cevap: ${secenekler[dogruIndex]}
Ogrenciye, dogru cevabin NEDEN dogru oldugunu ve ogrencinin verdigi cevabin NEDEN yanlis oldugunu, kisa (60-90 kelime), net ve ogretici bir dille acikla. SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma. Markdown kullanma, sadece duz metin.`;
      const cevap = await aiIstek(p, 500, cihazIdRef.current);
      const temiz = cevap.replace(/\*\*/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ");
      setSoruAciklamalari((eski) => ({ ...eski, [index]: temiz }));
    } catch (e) {
      setSoruAciklamalari((eski) => ({ ...eski, [index]: "Aciklama alinamadi, tekrar dene." }));
    } finally {
      setSoruAciklamaYukleniyor(null);
    }
  }
  const [dersTekrarSonuclari, setDersTekrarSonuclari] = useState({}); // { [ders]: [{tur, dogru, toplam}, ...] }
  const [tekrarAnlatimOnbellek, setTekrarAnlatimOnbellek] = useState({}); // { "ders::tur": metin } - ayni turda tekrar uretmemek icin
  const [randevuTarih, setRandevuTarih] = useState("");
  const [randevuSaat, setRandevuSaat] = useState("");
  const [randevuGonderildi, setRandevuGonderildi] = useState({}); // { [ders]: true }
  const [randevuGonderiliyor, setRandevuGonderiliyor] = useState(false);

  async function randevuTalebiGonder(dersAdi) {
    if (!randevuTarih || !randevuSaat) return;
    setRandevuGonderiliyor(true);
    try {
      await fetch("/api/randevu-talebi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, ders: dersAdi, tarih: randevuTarih, saat: randevuSaat }),
      });
      setRandevuGonderildi((eski) => ({ ...eski, [dersAdi]: true }));
    } catch (e) {}
    finally { setRandevuGonderiliyor(false); }
  }

  const [dersTekrarKontrolYukleniyor, setDersTekrarKontrolYukleniyor] = useState(false);

  // (Otomatik tetikleme effect'i asagida, temizleme effect'inden SONRA tanimlanacak -
  // dogru calisma sirasi icin, bkz. 240 civari.)

  useEffect(() => {
    try {
      const kayitli = localStorage.getItem("karemux_ders_tekrar_sayaci");
      if (kayitli) setDersTekrarSayaci(JSON.parse(kayitli));
      const kayitliSonuc = localStorage.getItem("karemux_ders_tekrar_sonuclari");
      if (kayitliSonuc) setDersTekrarSonuclari(JSON.parse(kayitliSonuc));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!secilenDers || !cihazIdRef.current) return;
    setDersGecenYilZayifMi(null); setAciklama(""); setQuiz(null); setGonderildi(false);
    setDersTekrarKontrolYukleniyor(true);
    fetch(`/api/sinav-sonuc?cihazId=${cihazIdRef.current}&ders=${encodeURIComponent(secilenDers)}`)
      .then((r) => r.json())
      .then((d) => {
        const sonuclar = d.sonuclar || [];
        const kayit = sonuclar.find((s) => s.tur === "gecen_yil_genel" && s.ders === secilenDers);
        if (!kayit) { setDersGecenYilZayifMi(false); }
        else {
          const toplam = kayit.dogru + kayit.yanlis + kayit.bos;
          const oran = toplam > 0 ? kayit.dogru / toplam : 0;
          setDersGecenYilZayifMi(oran < 0.4);
        }

        // Veritabanindaki ders_tekrar_N kayitlarini da yukleyip yerel duruma yansit -
        // boylece gizli sekme/farkli oturum arasi tutarlilik saglanir.
        const tekrarKayitlari = sonuclar
          .filter((s) => s.tur && s.tur.startsWith("ders_tekrar_") && s.ders === secilenDers)
          .map((s) => ({ tur: Number(s.tur.replace("ders_tekrar_", "")), dogru: s.dogru, toplam: s.dogru + s.yanlis + s.bos }))
          .reverse(); // API en yeniden eskiye donduruyor, kronolojik siraya cevir
        if (tekrarKayitlari.length > 0) {
          setDersTekrarSonuclari((eski) => ({ ...eski, [secilenDers]: tekrarKayitlari }));
        }
      })
      .catch(() => setDersGecenYilZayifMi(false))
      .finally(() => setDersTekrarKontrolYukleniyor(false));
  }, [secilenDers]);

  // Tur degistiginde (ornegin 1.tur basarisiz olup 2.tura geçildiginde) o turun
  // anlatimini otomatik goster - ogrenci butona basmadan tek bir akici oturum olsun.
  // NOT: bu effect yukaridaki temizleme effect'inden SONRA tanimli olmali, cunku
  // React effectleri tanim sirasina gore calistirir - once aciklama temizlenmeli,
  // sonra bu effect "aciklama bos mu" diye kontrol etmeli. Sira karisirsa eski
  // (baska bir dersten kalma) aciklama nedeniyle otomatik tetikleme atlanabilir.
  useEffect(() => {
    if (!secilenDers || dersTekrarKontrolYukleniyor || dersGecenYilZayifMi !== true) return;
    const durum = dersTekrarDurumuHesapla(secilenDers);
    if (durum.durum !== "devam") return;
    const anahtar = `${secilenDers}::${durum.tur}`;
    if (!tekrarAnlatimOnbellek[anahtar] && !aciklama && yukleniyor !== "aciklama") {
      dersKonuTekrariAnlat(secilenDers);
    }
  }, [secilenDers, dersGecenYilZayifMi, dersTekrarKontrolYukleniyor, dersTekrarSonuclari]);

  function dersTekrarSonucuKaydet(dersAdi, tur, dogru, toplam) {
    setDersTekrarSonuclari((eski) => {
      const liste = [...(eski[dersAdi] || []), { tur, dogru, toplam }];
      const guncel = { ...eski, [dersAdi]: liste };
      try { localStorage.setItem("karemux_ders_tekrar_sonuclari", JSON.stringify(guncel)); } catch (e) {}
      return guncel;
    });
    // Kalicilik icin veritabanina da yaz - sadece localStorage'a guvenmek
    // (gizli sekme/farkli cihaz durumlarinda) veri kaybina yol acabiliyordu.
    const yanlis = toplam - dogru;
    const net = Math.max(0, dogru - yanlis / 3);
    fetch("/api/sinav-sonuc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cihazId: cihazIdRef.current, tur: `ders_tekrar_${tur}`, ders: dersAdi, dogru, yanlis, bos: 0, net }),
    }).catch(() => {});
  }

  // Bir dersin tekrar durumunu hesaplar: hangi turda, kac test yapildi, gecti mi, canli gorusme gerekiyor mu.
  function dersTekrarDurumuHesapla(dersAdi) {
    const tumSonuclar = dersTekrarSonuclari[dersAdi] || [];
    const tur1 = tumSonuclar.filter((s) => s.tur === 1);
    const tur2 = tumSonuclar.filter((s) => s.tur === 2);
    const tur3 = tumSonuclar.filter((s) => s.tur === 3);

    function ortalamaBasariliMi(liste) {
      if (liste.length < 3) return null;
      const sonUc = liste.slice(-3); // SADECE en son 3 test - eski/birikmis kayitlar ortalamayi bozmasin
      const toplamDogru = sonUc.reduce((t, s) => t + s.dogru, 0);
      const toplamSoru = sonUc.reduce((t, s) => t + s.toplam, 0);
      return toplamSoru > 0 ? toplamDogru / toplamSoru >= 0.6 : false;
    }

    const tur1Sonuc = ortalamaBasariliMi(tur1); // null=devam ediyor, true=gecti, false=gecemedi
    if (tur1Sonuc === null) return { durum: "devam", tur: 1, testSayisi: Math.min(tur1.length, 3), soruSayisi: 5 };
    if (tur1Sonuc === true) return { durum: "tamamlandi", tur: 1, testSayisi: Math.min(tur1.length, 3), soruSayisi: 5 };

    const tur2Sonuc = ortalamaBasariliMi(tur2);
    if (tur2Sonuc === null) return { durum: "devam", tur: 2, testSayisi: Math.min(tur2.length, 3), soruSayisi: 10 };
    if (tur2Sonuc === true) return { durum: "tamamlandi", tur: 2, testSayisi: Math.min(tur2.length, 3), soruSayisi: 10 };

    const tur3Sonuc = ortalamaBasariliMi(tur3);
    if (tur3Sonuc === null) return { durum: "devam", tur: 3, testSayisi: Math.min(tur3.length, 3), soruSayisi: 15 };
    if (tur3Sonuc === true) return { durum: "tamamlandi", tur: 3, testSayisi: Math.min(tur3.length, 3), soruSayisi: 15 };

    // 3 tur da basarisiz - rehberlik/koc gorusme talebi
    return { durum: "gorusme_talebi", tur: 3, testSayisi: Math.min(tur3.length, 3), soruSayisi: 15 };
  }

  function dersTekrarSayaciArtir(dersAdi) {
    setDersTekrarSayaci((eski) => {
      const guncel = { ...eski, [dersAdi]: (eski[dersAdi] || 0) + 1 };
      try { localStorage.setItem("karemux_ders_tekrar_sayaci", JSON.stringify(guncel)); } catch (e) {}
      return guncel;
    });
  }

  async function dersKonuTekrariAnlat(dersAdi) {
    const oncekiSinif = Math.max(1, sinif - 1);
    const durum = dersTekrarDurumuHesapla(dersAdi);
    const onbellekAnahtari = `${dersAdi}::${durum.tur}`;

    // Bu tur icin daha once anlatim uretildiyse, TEKRAR URETME - ayniyi goster.
    // Boylece ogrenci butona tekrar tekrar basinca her seferinde farkli bir
    // anlatim gelmiyor, tur degismeden metin sabit kaliyor.
    if (tekrarAnlatimOnbellek[onbellekAnahtari]) {
      setAciklama(tekrarAnlatimOnbellek[onbellekAnahtari]);
      setQuiz(null); setGonderildi(false); setHata("");
      return;
    }

    setYukleniyor("aciklama"); setHata(""); setAciklama(""); setQuiz(null); setGonderildi(false);
    try {
      const p = durum.tur >= 2
        ? `Sen deneyimli, alaninda uzman bir "${dersAdi}" ogretmenisin. Ogrenciye ${oncekiSinif}. sinif "${dersAdi}" temel konularini DAHA ONCE bir kez anlattin ama ogrenci testte basarili olamadi - yani ilk anlatim yeterli gelmedi. Bu sefer FARKLI BIR YAKLASIMLA anlat: farkli, gunluk hayattan daha somut ornekler kullan, kavramlari daha yavas ve adim adim ac, olasi kafa karistirici noktalari ONCEDEN tahmin edip aciklayarak onle. Her alt kavram icin "Ornek:" diye etiketlenmis en az bir somut ornek coz. Bu, DAHA DETAYLI ve DAHA DERINLEMESINE bir anlatim olmali. En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle. Toplamda 550-650 kelime. SADECE duz metin yaz, markdown/LaTeX kullanma. SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma.`
        : `Sen deneyimli, alaninda uzman bir "${dersAdi}" ogretmenisin. Ogrencinin ${oncekiSinif}. sinif temeli zayif cikti, once bunu guclendirmemiz gerekiyor. ${oncekiSinif}. sinif "${dersAdi}" mufredatinin EN TEMEL ve EN ONEMLI kavramlarini, sade ve anlasilir bir dille anlat - once tanim, sonra "Ornek:" diye etiketlenmis somut ornek, gerekirse formul/kural. Konu basliklarina ayirarak yaz. En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle. Toplamda 350-450 kelime. SADECE duz metin yaz, markdown/LaTeX kullanma. SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma.`;
      const cevap = await aiIstek(p, durum.tur >= 2 ? 4200 : 3000, cihazIdRef.current);
      if (secilenDersRef.current !== dersAdi) return; // Bu sirada baska bir derse gecilmis - eski cevabi gosterme
      const temizMetin = cevap
        .replace(/\*\*/g, "").replace(/#+\s?/g, "").replace(/\$\$?/g, "")
        .replace(/\\sqrt\{([^}]*)\}/g, "karekok $1").replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
        .replace(/\\[a-zA-Z]+/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ");
      setAciklama(temizMetin);
      setTekrarAnlatimOnbellek((eski) => ({ ...eski, [onbellekAnahtari]: temizMetin }));
    } catch (e) { if (secilenDersRef.current === dersAdi) setHata(temizHataMesaji(e, "Anlatim alinamadi, tekrar dene.")); }
    finally { if (secilenDersRef.current === dersAdi) setYukleniyor(null); }
  }

  async function dersTekrarTestiUret(dersAdi) {
    const oncekiSinif = Math.max(1, sinif - 1);
    const durum = dersTekrarDurumuHesapla(dersAdi);
    const soruSayisi = durum.soruSayisi || 5;
    setYukleniyor("quiz"); setHata(""); setCevaplar({}); setGonderildi(false);
    try {
      const p = `Sen "${dersAdi}" dersi ogretmenisin. ${oncekiSinif}. sinif "${dersAdi}" mufredatinin temel konularindan ${soruSayisi} coktan secmeli soru hazirla. ${BAGLAM_TEMELLI_SORU_TALIMATI} ONEMLI: Her soruyu yazdiktan sonra HESABI KENDIN ADIM ADIM COZ ve dogruIndex'in GERCEKTEN dogru oldugundan emin ol - matematiksel hata yapma, cevaplar arasinda celiski olmasin. Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle, DOGRU VE TUTARLI bir sekilde anlat (ogrenci yanlis yaparsa bunu okuyup ogrensin). SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma. HER SORUDA MUTLAKA "secenekler" alaninda TAM 4 secenek (A,B,C,D) olsun:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"..."}]`;
      const cevap = await aiIstek(p, Math.min(8000, 600 + soruSayisi * 500), cihazIdRef.current, true);
      if (secilenDersRef.current !== dersAdi) return; // Bu sirada baska bir derse gecilmis - eski cevabi gosterme
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      const sorular = soruJsonAyikla(temiz);
      if (sorular.length === 0) throw new Error("AI gecerli soru uretemedi, tekrar dene");
      setQuiz(sorular);
    } catch (e) { if (secilenDersRef.current === dersAdi) setHata(temizHataMesaji(e, "Sorular uretilemedi, tekrar dene.")); }
    finally { if (secilenDersRef.current === dersAdi) setYukleniyor(null); }
  }

  function dersTekrarTestiGonder(dersAdi) {
    setGonderildi(true);
    const dogru = quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length;
    const durum = dersTekrarDurumuHesapla(dersAdi);
    dersTekrarSonucuKaydet(dersAdi, durum.tur, dogru, quiz.length);
    dersTekrarSayaciArtir(dersAdi);
    yanlislariHataKitapciginaKaydet(dersAdi, null);
  }

  // Bir quiz gonderildiginde YANLIS cevaplanan sorulari Hata Kitapcigi'na kaydeder.
  function yanlislariHataKitapciginaKaydet(dersAdi, altKonu) {
    if (!quiz) return;
    quiz.forEach((s, i) => {
      if (cevaplar[i] !== undefined && cevaplar[i] !== s.dogruIndex) {
        fetch("/api/hata-kitapcigi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cihazId: cihazIdRef.current, ders: dersAdi, altKonu: altKonu || s.altKonu || null,
            soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogruIndex,
            verilenIndex: cevaplar[i], aciklama: s.aciklama || null,
          }),
        }).catch(() => {});
      }
    });
  }

  const [hataKitapcigi, setHataKitapcigi] = useState(null);
  const [hataKitapcigiYukleniyor, setHataKitapcigiYukleniyor] = useState(false);
  const [hataKitapcigiAcik, setHataKitapcigiAcik] = useState(false);

  async function hataKitapciginiGetir(dersAdi) {
    setHataKitapcigiYukleniyor(true);
    try {
      const res = await fetch(`/api/hata-kitapcigi?cihazId=${cihazIdRef.current}&ders=${encodeURIComponent(dersAdi)}`);
      const data = await res.json();
      setHataKitapcigi(data.kayitlar || []);
      setHataKitapcigiAcik(true);
    } catch (e) { setHataKitapcigi([]); }
    finally { setHataKitapcigiYukleniyor(false); }
  }

  async function hataKitapciginaBenzerSorularUret(dersAdi) {
    if (!hataKitapcigi || hataKitapcigi.length === 0) return;
    const altKonular = [...new Set(hataKitapcigi.map((k) => k.alt_konu).filter(Boolean))];
    const konuListesi = altKonular.length > 0 ? altKonular.join(", ") : "gecmiste yanlis yapilan konular";
    setYukleniyor("quiz"); setHata(""); setCevaplar({}); setGonderildi(false);
    try {
      const p = `Sen "${dersAdi}" dersi ogretmenisin. Ogrencinin daha once yanlis yaptigi su konulardan: ${konuListesi} - bu konulari pekistirecek 5 YENI (birebir ayni olmayan, ama ayni beceriyi olcen) coktan secmeli soru hazirla. ${BAGLAM_TEMELLI_SORU_TALIMATI} Her soru icin "aciklama" alaninda dogru cevabin nedenini 1-2 cumleyle acikla. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"..."}]`;
      const cevap = await aiIstek(p, 3000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").trim();
      const sorular = soruJsonAyikla(temiz);
      setQuiz(sorular);
      setHataKitapcigiAcik(false);
    } catch (e) { setHata(temizHataMesaji(e, "Sorular uretilemedi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  const [tema, setTema] = useState("minimal");
  const [duyuruIndex, setDuyuruIndex] = useState(0);

  useEffect(() => {
    const zamanlayici = setInterval(() => {
      setDuyuruIndex((i) => (i + 1) % DUYURULAR.length);
    }, 4000);
    return () => clearInterval(zamanlayici);
  }, []);
  const COLORS = TEMALAR[tema];

  useEffect(() => {
    try {
      const kayitliTema = localStorage.getItem("karemux_tema");
      if (kayitliTema && TEMALAR[kayitliTema]) setTema(kayitliTema);
    } catch (e) {}
  }, []);

  function temaDegistir(yeniTema) {
    setTema(yeniTema);
    try { localStorage.setItem("karemux_tema", yeniTema); } catch (e) {}
  }
  const [menuAcik, setMenuAcik] = useState(false);

  function modGecis(yeniMod) {
    setMod(yeniMod);
    setMenuAcik(false);
    setDenemeSorulari(null); setDenemeCevaplar({}); setDenemeGonderildi(false); setDenemeBelgesi(null);
    setQuiz(null); setCevaplar({}); setGonderildi(false); setAciklama(""); setParagrafMetni("");
  }
  const [sinif, setSinif] = useState(8);
  const [ders, setDers] = useState(null);
  const [konu, setKonu] = useState("");
  const [uniteSec, setUniteSec] = useState(null);
  const [tamamlananUniteler, setTamamlananUniteler] = useState({}); // { [ders]: [unite1, unite2, ...] }
  const [tamamlananAltKonular, setTamamlananAltKonular] = useState({}); // { [ders+"::"+unite]: [altKonu1, ...] }
  const [altKonuCache, setAltKonuCache] = useState({}); // { [ders+"::"+unite]: [altKonu1, altKonu2, ...] }
  const [altKonuYukleniyor, setAltKonuYukleniyor] = useState(false);
  const [aktifAltKonu, setAktifAltKonu] = useState(null);

  useEffect(() => {
    try {
      const kayitli = localStorage.getItem("karemux_tamamlanan_uniteler");
      if (kayitli) setTamamlananUniteler(JSON.parse(kayitli));
      const kayitliAlt = localStorage.getItem("karemux_tamamlanan_alt_konular");
      if (kayitliAlt) setTamamlananAltKonular(JSON.parse(kayitliAlt));
    } catch (e) {}
  }, []);

  // GECEN SENE GENEL DEGERLENDIRME - bir kez yapilir, mevcut sinifa gecmeden once
  // onceki sinifin temel bilgisini olcer. Bu bolum AI onerisi ile olusturulur
  // (onceki sinif icin dogrulanmis MEB verimiz henuz yok), acikca etiketlenir.
  const [gecenYilSorulari, setGecenYilSorulari] = useState(null);
  const [gecenYilCevaplar, setGecenYilCevaplar] = useState({});
  const [gecenYilGonderildi, setGecenYilGonderildi] = useState(false);
  const [gecenYilRaporu, setGecenYilRaporu] = useState(null);
  const [gecenYilYukleniyor, setGecenYilYukleniyor] = useState(false);
  const [gecenYilGecmisYukleniyor, setGecenYilGecmisYukleniyor] = useState(false);
  const [gecenYilTamamlandiMi, setGecenYilTamamlandiMi] = useState(null); // null = henuz bilinmiyor

  useEffect(() => {
    if (!kocPaneliDers || !cihazIdRef.current) return;
    setGecenYilRaporu(null); setGecenYilSorulari(null); setGecenYilGonderildi(false); setGecenYilTamamlandiMi(null);
    setGecenYilGecmisYukleniyor(true);
    fetch(`/api/sinav-sonuc?cihazId=${cihazIdRef.current}&ders=${encodeURIComponent(kocPaneliDers)}`)
      .then((r) => r.json())
      .then((d) => {
        const kayit = (d.sonuclar || []).find((s) => s.tur === "gecen_yil_genel" && s.ders === kocPaneliDers);
        if (kayit) {
          const toplam = kayit.dogru + kayit.yanlis + kayit.bos;
          const oran = toplam > 0 ? kayit.dogru / toplam : 0;
          setGecenYilRaporu({ dogru: kayit.dogru, toplam, seviye: oran >= 0.7 ? "Saglam" : oran >= 0.4 ? "Orta" : "Zayif" });
          setGecenYilTamamlandiMi(true);
        } else {
          setGecenYilTamamlandiMi(false);
        }
      })
      .catch(() => setGecenYilTamamlandiMi(false))
      .finally(() => setGecenYilGecmisYukleniyor(false));
  }, [kocPaneliDers]);

  async function gecenYilDegerlendirmesiYap(dersAdi) {
    const oncekiSinif = Math.max(1, sinif - 1);
    setGecenYilYukleniyor(true); setHata(""); setGecenYilCevaplar({}); setGecenYilGonderildi(false); setGecenYilSorulari(null);
    try {
      const p = `Sen "${dersAdi}" dersi ölçme-değerlendirme uzmanısın. Öğrenci şimdi ${sinif}. sınıfa geçti, önce ${oncekiSinif}. sınıfı gerçekten öğrenmiş mi ölçmemiz gerekiyor. ${oncekiSinif}. sınıf "${dersAdi}" müfredatının GENEL VE TEMEL konularını kapsayan 10 soruluk bir GENEL DEĞERLENDİRME sınavı hazırla, farklı konu başlıklarına yayılsın. Sorular temel kavram anlayışını ölçsün, kolaydan zora doğru sıralı olsun. ÖNEMLİ: Tüm metinler SADECE Türkçe olmalı, Türkçe'ye özgü karakterleri (ı, ğ, ü, ş, ö, ç, İ) DOĞRU ve EKSİKSİZ kullan - ASCII'ye indirgenmiş (Turkce, sinif gibi) yazma. SADECE JSON döndür, başka hiçbir açıklama ekleme:
[{"konu":"...","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;
      const cevap = await aiIstek(p, 5000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      const sorular = soruJsonAyikla(temiz);
      setGecenYilSorulari(sorular);
      sorulariBankayaKaydet(dersAdi, oncekiSinif, null, sorular, "gecen_yil_genel");
    } catch (e) { setHata(temizHataMesaji(e, "Genel degerlendirme olusturulamadi, tekrar dene.")); }
    finally { setGecenYilYukleniyor(false); }
  }

  function gecenYilGonder(dersAdi) {
    setGecenYilGonderildi(true);
    const dogru = gecenYilSorulari.filter((s, i) => gecenYilCevaplar[i] === s.dogruIndex).length;
    const yanlis = gecenYilSorulari.length - dogru;
    const oran = dogru / gecenYilSorulari.length;
    const rapor = { dogru, toplam: gecenYilSorulari.length, seviye: oran >= 0.7 ? "Saglam" : oran >= 0.4 ? "Orta" : "Zayif" };
    setGecenYilRaporu(rapor);
    setGecenYilTamamlandiMi(true);
    const net = Math.max(0, dogru - yanlis / 3);
    fetch("/api/sinav-sonuc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cihazId: cihazIdRef.current, tur: "gecen_yil_genel", ders: dersAdi, dogru, yanlis, bos: 0, net }),
    }).catch(() => {});
  }


  const [dersSeviyeSorulari, setDersSeviyeSorulari] = useState(null);
  const [dersSeviyeCevaplar, setDersSeviyeCevaplar] = useState({});
  const [dersSeviyeGonderildi, setDersSeviyeGonderildi] = useState(false);
  const [dersSeviyeRaporu, setDersSeviyeRaporu] = useState(null);
  const [dersSeviyeYukleniyor, setDersSeviyeYukleniyor] = useState(false);
  const [dersSeviyeSonTarih, setDersSeviyeSonTarih] = useState(null);
  const [dersSeviyeGecmisYukleniyor, setDersSeviyeGecmisYukleniyor] = useState(false);

  useEffect(() => {
    if (!kocPaneliDers || !cihazIdRef.current) return;
    setDersSeviyeRaporu(null); setDersSeviyeSonTarih(null); setDersSeviyeSorulari(null); setDersSeviyeGonderildi(false);
    setDersSeviyeGecmisYukleniyor(true);
    fetch(`/api/sinav-sonuc?cihazId=${cihazIdRef.current}&ders=${encodeURIComponent(kocPaneliDers)}`)
      .then((r) => r.json())
      .then((d) => {
        const sonuclar = (d.sonuclar || []).filter((s) => s.tur === "ders_seviye" && s.ders.startsWith(`${kocPaneliDers}::`));
        if (sonuclar.length === 0) return;
        // Her unite icin son 3 degerlendirmenin ORTALAMASINI al - tek bir kotu/iyi
        // gunun sonucu carpitmasini onlemek icin. Ne kadar cok degerlendirme
        // birikirse, ogrencinin gercek seviyesine o kadar "tam hakimiyet" saglanir.
        const uniteBazliListe = {};
        sonuclar.forEach((s) => {
          const unite = s.ders.split("::")[1];
          if (!uniteBazliListe[unite]) uniteBazliListe[unite] = [];
          if (uniteBazliListe[unite].length < 3) uniteBazliListe[unite].push(s); // en yeni 3 tanesi (API zaten yeniden eskiye sirali)
        });
        const rapor = {};
        let enYeniTarih = null;
        Object.keys(uniteBazliListe).forEach((unite) => {
          const kayitlar = uniteBazliListe[unite];
          const toplamDogru = kayitlar.reduce((t, k) => t + k.dogru, 0);
          const toplamSoru = kayitlar.reduce((t, k) => t + k.dogru + k.yanlis + k.bos, 0);
          const oran = toplamSoru > 0 ? toplamDogru / toplamSoru : 0;
          rapor[unite] = {
            dogru: toplamDogru, toplam: toplamSoru,
            seviye: oran >= 0.8 ? "Ileri" : oran >= 0.5 ? "Orta" : "Baslangic",
            degerlendirmeSayisi: kayitlar.length,
          };
          const buUnitenSonTarih = kayitlar[0].olusturulma; // en yenisi listenin basinda
          if (!enYeniTarih || new Date(buUnitenSonTarih) > new Date(enYeniTarih)) enYeniTarih = buUnitenSonTarih;
        });
        if (Object.keys(rapor).length > 0) {
          setDersSeviyeRaporu(rapor);
          setDersSeviyeSonTarih(enYeniTarih);
        }
      })
      .catch(() => {})
      .finally(() => setDersSeviyeGecmisYukleniyor(false));
  }, [kocPaneliDers]);

  function donemGuncellemesiZamaniGeldiMi(sonTarih) {
    if (!sonTarih) return false;
    const gunFarki = (Date.now() - new Date(sonTarih).getTime()) / (1000 * 60 * 60 * 24);
    return gunFarki >= 45; // ~6 hafta - daha siki takip, tek gunun etkisini azaltmak icin sik guncelleme tesvik edilir
  }

  // Seviye raporu her guncellendiginde, "Ileri" cikan uniteleri otomatik tamamlandi
  // sayar - boylece kilitleme sirasi gercek seviyeye gore acilir/kapanir.
  useEffect(() => {
    if (!dersSeviyeRaporu || !kocPaneliDers) return;
    Object.keys(dersSeviyeRaporu).forEach((u) => {
      if (dersSeviyeRaporu[u].seviye === "Ileri") {
        uniteTamamlandiIsaretle(kocPaneliDers, u);
      }
    });
  }, [dersSeviyeRaporu, kocPaneliDers]);

  function oneriliUniteHesapla(dersAdi) {
    const tumUniteler = dersinUniteleri(dersAdi, sinif);
    const tamamlanan = tamamlananUniteler[dersAdi] || [];
    return tumUniteler.find((u) => !tamamlanan.includes(u)) || null;
  }

  async function gecmisYilTakviyesiAnlat() {
    const oncekiSinif = Math.max(1, sinif - 1);
    setYukleniyor("aciklama"); setHata(""); setAciklama(""); setQuiz(null); setGonderildi(false);
    try {
      const p = `Sen deneyimli, alaninda uzman bir "${kocPaneliDers}" ogretmenisin. Ogrencinin ${oncekiSinif}. sinif temeli zayif cikti, once bunu guclendirmemiz gerekiyor. ${oncekiSinif}. sinif "${kocPaneliDers}" mufredatinin EN TEMEL ve EN ONEMLI kavramlarini, sade ve anlasilir bir dille OZETLE - once tanim, sonra somut ornek. Toplamda 350-450 kelime, konu basliklarina ayirarak yaz. SADECE duz metin yaz, markdown/LaTeX kullanma. SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma.`;
      const cevap = await aiIstek(p, 3000, cihazIdRef.current);
      const temizMetin = cevap
        .replace(/\*\*/g, "").replace(/#+\s?/g, "").replace(/\$\$?/g, "")
        .replace(/\\sqrt\{([^}]*)\}/g, "karekok $1").replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
        .replace(/\\[a-zA-Z]+/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ");
      setAciklama(temizMetin);
    } catch (e) { setHata(temizHataMesaji(e, "Anlatim alinamadi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  async function gecmisYilTestiTekrarla() {
    setGecenYilRaporu(null); setGecenYilTamamlandiMi(false); setGecenYilSorulari(null); setGecenYilGonderildi(false);
  }

  async function oneriliUniteAnlat() {
    const dersAtCagri = secilenDers;
    const unite = dersSecimModu === "manuel" ? manuelUnite : oneriliUniteHesapla(secilenDers);
    if (!unite) return;
    setDers(secilenDers); setUniteSec(unite); setKonu(unite);
    setYukleniyor("aciklama"); setHata(""); setAciklama(""); setQuiz(null); setGonderildi(false);
    try {
      const zorlukMetni = { basit: "cok basit ve yavas", orta: "orta seviyede", zor: "ileri seviyede" }[zorlukSec] || "orta seviyede";
      const temelUyarisi = gecenYilRaporu && gecenYilRaporu.seviye === "Zayif"
        ? ` ONEMLI: Bu ogrencinin bir onceki sinif temeli zayif olcyuldu, bu yuzden konuya girmeden once cok kisa (1-2 cumle) bir "on bilgi hatirlatmasi" ekle, temel kavramlari atlamadan anlat.`
        : "";
      const kapsamSiniri = (dersSecimModu === "manuel" && manuelAltBaslik.length > 0)
        ? ` SADECE su alt basliklara odaklan: ${manuelAltBaslik.join(", ")}. Unitenin diger alt basliklarina girme.`
        : "";
      const p = `Sen deneyimli, alaninda uzman bir "${secilenDers}" ogretmenisin. "${unite}" unitesinin TAMAMINI, ${sinif}. sinifta okuyan bir ogrenciye ${zorlukMetni} ama PROFESYONEL ve KALITELI bir dille, piyasadaki en iyi LGS yayinlarindan daha derin ve daha kullanisli bir sekilde anlat.${temelUyarisi}${kapsamSiniri} ONEMLI: Konuyu OLDUGUNDAN KOLAY GOSTERME - piyasadaki bircok kaynak bu hatayi yapiyor ve gercek sinavda ogrenciler zorlaniyor. Gercek LGS sorularindaki zorluk seviyesini yansitacak derinlikte anlat, yuzeysel gecme. Su yapida yaz: (1) Once kisa bir GIRIS - konunun ne oldugu ve neden onemli oldugu. (2) Her ana kavram icin: TANIM, en az bir SOMUT ORNEK, varsa FORMUL/KURAL. (3) "HIZLI COZUM IPUCLARI" basligiyla, sinavda zaman kazandiran 2-3 pratik kisayol/teknik (piyasa yayinlarinin en degerli ozelligi budur, mutlaka ekle). (4) Eger konu birden fazla cozum yontemine uygunsa, "FARKLI COZUM YOLLARI" basligiyla ayni ornegi EN AZ IKI farkli yontemle coz (orn. cebirsel ve gorsel/sekilsel yontem gibi) - degilse bu basligi atla. (5) En sonda "DIKKAT EDILECEK NOKTALAR / SIK YAPILAN HATALAR" basligiyla 2-3 maddelik kisa liste. Toplamda 500-650 kelime olsun, yuzeysel gecme, gercekten ogretici ol. SADECE duz metin yaz: markdown (yildiz, dis) LaTeX kullanma. Matematik ifadelerini normal klavye karakterleriyle yaz (orn. "kok 12", "3 uzeri 2"). SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma.`;
      const cevap = await aiIstek(p, 4200, cihazIdRef.current);
      if (secilenDersRef.current !== dersAtCagri) return; // Bu sirada baska bir derse gecilmis - eski cevabi gosterme
      const temizMetin = cevap
        .replace(/\*\*/g, "").replace(/#+\s?/g, "").replace(/\$\$?/g, "")
        .replace(/\\sqrt\{([^}]*)\}/g, "karekok $1").replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
        .replace(/\\[a-zA-Z]+/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ");
      setAciklama(temizMetin);
    } catch (e) { if (secilenDersRef.current === dersAtCagri) setHata(temizHataMesaji(e, "Anlatim alinamadi, tekrar dene.")); }
    finally { if (secilenDersRef.current === dersAtCagri) setYukleniyor(null); }
  }

  async function oneriliUniteSoruCoz() {
    const dersAtCagri = secilenDers;
    const unite = dersSecimModu === "manuel" ? manuelUnite : oneriliUniteHesapla(secilenDers);
    if (!unite) return;
    setDers(secilenDers); setUniteSec(unite); setKonu(unite);
    setYukleniyor("quiz"); setHata(""); setCevaplar({}); setGonderildi(false);
    try {
      const kapsamSiniri = (dersSecimModu === "manuel" && manuelAltBaslik.length > 0)
        ? ` SADECE su alt basliklardan sorular hazirla: ${manuelAltBaslik.join(", ")}. Unitenin diger alt basliklarindan soru sorma.`
        : "";
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${secilenDers}" dersinin "${unite}" unitesinin TAMAMINI kapsayan, ${sinif}. sinif seviyesinde 5 coktan secmeli soru hazirla.${kapsamSiniri} ${BAGLAM_TEMELLI_SORU_TALIMATI} Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle anlat. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"..."}]`;
      const cevap = await aiIstek(p, 3000, cihazIdRef.current, true);
      if (secilenDersRef.current !== dersAtCagri) return; // Bu sirada baska bir derse gecilmis - eski cevabi gosterme
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      const sorular = soruJsonAyikla(temiz);
      setQuiz(sorular);
      sorulariBankayaKaydet(secilenDers, sinif, unite, sorular, "quiz");
    } catch (e) { if (secilenDersRef.current === dersAtCagri) setHata(temizHataMesaji(e, "Sorular uretilemedi, tekrar dene.")); }
    finally { if (secilenDersRef.current === dersAtCagri) setYukleniyor(null); }
  }

  async function dersSeviyeTespitiYap(dersAdi) {
    setDersSeviyeYukleniyor(true); setHata(""); setDersSeviyeCevaplar({}); setDersSeviyeGonderildi(false); setDersSeviyeSorulari(null); setDersSeviyeRaporu(null);
    try {
      const uniteler = dersinUniteleri(dersAdi, sinif);
      const uniteListesi = uniteler.length ? `Bu dersin uniteleri: ${uniteler.join(", ")}. Her uniteden en az 1 soru gelsin, tum unitelere yayilsin.` : "";
      const p = `Sen bir "${dersAdi}" dersi olcme-degerlendirme uzmanisin. Bu dersin TAMAMINA yayilan, ogrencinin genel seviyesini olcen 10 soruluk bir SEVIYE BELIRLEME sinavi hazirla, ${sinif}. sinif seviyesinde. ${uniteListesi} Her sorunun hangi uniteden oldugunu "unite" alaninda, hangi alt konuyu olctugunu "altKonu" alaninda belirt. Sorular kolaydan zora dogru sirali olsun, mantik yurutme gerektirsin. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Portekizce gibi bati dillerinden TEK KELIME bile kullanma. SADECE JSON dondur, baska hicbir aciklama ekleme:
[{"unite":"...","altKonu":"...","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;
      const cevap = await aiIstek(p, 5000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      const sorular = soruJsonAyikla(temiz);
      setDersSeviyeSorulari(sorular);
      sorulariBankayaKaydet(dersAdi, sinif, null, sorular, "ders_seviye");
    } catch (e) { setHata(temizHataMesaji(e, "Seviye belirleme sinavi olusturulamadi, tekrar dene.")); }
    finally { setDersSeviyeYukleniyor(false); }
  }

  function dersSeviyeGonder(dersAdi) {
    setDersSeviyeGonderildi(true);
    const rapor = {};
    dersSeviyeSorulari.forEach((s, i) => {
      const u = s.unite || "Genel";
      if (!rapor[u]) rapor[u] = { dogru: 0, toplam: 0 };
      rapor[u].toplam += 1;
      if (dersSeviyeCevaplar[i] === s.dogruIndex) rapor[u].dogru += 1;
    });
    Object.keys(rapor).forEach((u) => {
      const oran = rapor[u].dogru / rapor[u].toplam;
      rapor[u].seviye = oran >= 0.8 ? "Ileri" : oran >= 0.5 ? "Orta" : "Baslangic";
    });
    setDersSeviyeRaporu(rapor);
    setDersSeviyeSonTarih(new Date().toISOString());

    // Sonucu kalici olarak kaydet - her unite ayri satir, ogrenciye ozel (giris yapmissa
    // hesabina, yapmamissa cihaz kimligine bagli). Boylece "hafizada tutulur".
    Object.keys(rapor).forEach((u) => {
      const r = rapor[u];
      const yanlis = r.toplam - r.dogru;
      const net = Math.max(0, r.dogru - yanlis / 3);
      fetch("/api/sinav-sonuc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, tur: "ders_seviye", ders: `${dersAdi}::${u}`, dogru: r.dogru, yanlis, bos: 0, net }),
      }).catch(() => {});
    });
  }

  function uniteTamamlandiIsaretle(dersAdi, uniteAdi) {
    setTamamlananUniteler((eski) => {
      const guncel = { ...eski, [dersAdi]: [...new Set([...(eski[dersAdi] || []), uniteAdi])] };
      try { localStorage.setItem("karemux_tamamlanan_uniteler", JSON.stringify(guncel)); } catch (e) {}
      return guncel;
    });
  }

  function uniteAcikMi(dersAdi, uniteAdi) {
    const tumUniteler = dersinUniteleri(dersAdi, sinif);
    const indeks = tumUniteler.indexOf(uniteAdi);
    if (indeks <= 0) return true; // ilk unite her zaman acik
    const tamamlanan = tamamlananUniteler[dersAdi] || [];
    return tamamlanan.includes(tumUniteler[indeks - 1]); // bir onceki unite tamamlanmis mi
  }

  // Sinif bilgisini de anahtara katiyoruz ki 6./7./8. sinifta ayni isimli bir unite
  // olursa (orn. "Carpanlar ve Katlar") birbirinin alt konu verisini kullanmasin.
  function altKonuAnahtari(dersAdi, uniteAdi, sinifNo) { return `${dersAdi}::${uniteAdi}::${sinifNo || sinif}`; }
  // Eski (sinifsiz) format - TUM mevcut 8. sinif DOGRULANMIS_ALT_KONULAR kayitlari bu
  // formatta yazildi, geriye donuk uyumluluk icin fallback olarak kullanilir.
  function altKonuAnahtariEski(dersAdi, uniteAdi) { return `${dersAdi}::${uniteAdi}`; }

  async function altKonulariGetir(dersAdi, uniteAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    const eskiAnahtar = altKonuAnahtariEski(dersAdi, uniteAdi);
    if (altKonuCache[anahtar]) return; // zaten var, tekrar uretme
    if (DOGRULANMIS_ALT_KONULAR[anahtar]) {
      // Bu sinifa OZEL dogrulanmis veri var
      setAltKonuCache((eski) => ({ ...eski, [anahtar]: DOGRULANMIS_ALT_KONULAR[anahtar] }));
      return;
    }
    if (sinif === 8 && DOGRULANMIS_ALT_KONULAR[eskiAnahtar]) {
      // 8. sinif icin eski (sinifsiz) formatta yazilmis dogrulanmis veri var
      setAltKonuCache((eski) => ({ ...eski, [anahtar]: DOGRULANMIS_ALT_KONULAR[eskiAnahtar] }));
      return;
    }
    setAltKonuYukleniyor(true);
    try {
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${dersAdi}" dersinin "${uniteAdi}" unitesini, ogrencinin sirayla calisabilecegi 4-6 kisa ALT KONU basligina bol (orn. "Asal Carpanlar", "EBOB Hesabi" gibi kisa, 2-4 kelimelik basliklar). Bu senin onerdigin bir calisma sirasi olsun, MEB'in resmi bir listesi oldugunu iddia etme. SADECE JSON dizisi dondur, baska hicbir aciklama ekleme, markdown kullanma:
["Alt Konu 1","Alt Konu 2","Alt Konu 3"]`;
      const cevap = await aiIstek(p, 500, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      const baslangic = temiz.indexOf("[");
      const bitis = temiz.lastIndexOf("]");
      if (baslangic === -1 || bitis === -1) throw new Error("liste alinamadi");
      const liste = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setAltKonuCache((eski) => ({ ...eski, [anahtar]: liste }));
    } catch (e) {
      setAltKonuCache((eski) => ({ ...eski, [anahtar]: [] })); // basarisizsa bos liste, serbest metne dusulur
    } finally {
      setAltKonuYukleniyor(false);
    }
  }

  function altKonuAcikMi(dersAdi, uniteAdi, altKonuAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    const liste = altKonuCache[anahtar] || [];
    const indeks = liste.indexOf(altKonuAdi);
    if (indeks <= 0) return true;
    const tamamlanan = tamamlananAltKonular[anahtar] || [];
    return tamamlanan.includes(liste[indeks - 1]);
  }

  function altKonuTamamlandiMi(dersAdi, uniteAdi, altKonuAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    return (tamamlananAltKonular[anahtar] || []).includes(altKonuAdi);
  }

  function altKonuTamamlandiIsaretle(dersAdi, uniteAdi, altKonuAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    setTamamlananAltKonular((eski) => {
      const guncel = { ...eski, [anahtar]: [...new Set([...(eski[anahtar] || []), altKonuAdi])] };
      try { localStorage.setItem("karemux_tamamlanan_alt_konular", JSON.stringify(guncel)); } catch (e) {}
      // Tum alt konular tamamlandiysa uniteyi de tamamlandi say
      const liste = altKonuCache[anahtar] || [];
      if (liste.length > 0 && liste.every((ak) => guncel[anahtar].includes(ak))) {
        uniteTamamlandiIsaretle(dersAdi, uniteAdi);
      }
      return guncel;
    });
  }
  const [zorlukSec, setZorlukSec] = useState("orta"); // "basit" | "orta" | "zor"
  const [zorlukOtomatikMi, setZorlukOtomatikMi] = useState(true); // false olunca kullanicinin elle sectigi kalici olur (o ders icin)
  useEffect(() => {
    if (!secilenDers || !zorlukOtomatikMi) return;
    fetch(`/api/ilerleme?cihazId=${cihazIdRef.current}`).then((r) => r.json()).then((d) => {
      const buDersSatirlari = (d.gecmis || []).filter((s) => s.ders === secilenDers);
      const toplamDogru = buDersSatirlari.reduce((t, s) => t + Number(s.dogru), 0);
      const toplamSoru = buDersSatirlari.reduce((t, s) => t + Number(s.toplam), 0);
      if (toplamSoru < 5) { setZorlukSec("orta"); return; } // yeterli veri yok, guvenli varsayilan
      const basariOrani = toplamDogru / toplamSoru;
      setZorlukSec(basariOrani >= 0.8 ? "zor" : basariOrani >= 0.5 ? "orta" : "basit");
    }).catch(() => {});
  }, [secilenDers, zorlukOtomatikMi]);


  // Sinav (Yazili/Deneme ortak) - Kapsam: konu | unite | donem
  const [denemeDers, setDenemeDers] = useState(null);
  const [denemeTuru, setDenemeTuru] = useState("deneme"); // "deneme" | "yazili1" | "yazili2" | "yazili3"
  const [kapsamTuru, setKapsamTuru] = useState("donem"); // "konu" | "unite" | "donem"
  const [kapsamUnite, setKapsamUnite] = useState(null);
  const [kapsamKonu, setKapsamKonu] = useState("");
  const [kapsamAltBasliklar, setKapsamAltBasliklar] = useState([]);
  // Yazili/Deneme'de bir unite secilince, o unitenin (dogrulanmis veya AI onerili) alt
  // basliklarini onceden getirir - kullanici hemen tik isaretleyebilsin diye.
  useEffect(() => {
    if (kapsamUnite && denemeDers) { altKonulariGetir(denemeDers, kapsamUnite); setKapsamAltBasliklar([]); }
  }, [kapsamUnite, denemeDers]);
  const [sinavSoruSayisi, setSinavSoruSayisi] = useState(10);
  const [yaziliDonemNo, setYaziliDonemNo] = useState("yazili1"); // "yazili1" | "yazili2" | "yazili3"
  const [denemeDonemNo, setDenemeDonemNo] = useState("tam"); // "1" | "2" | "tam"

  // Seviye Tespit Sinavi
  const [seviyeSorulari, setSeviyeSorulari] = useState(null);
  const [seviyeCevaplar, setSeviyeCevaplar] = useState({});
  const [seviyeGonderildi, setSeviyeGonderildi] = useState(false);
  const [seviyeRaporu, setSeviyeRaporu] = useState(null); // { [ders]: { dogru, toplam, seviye } }
  const [denemeSorulari, setDenemeSorulari] = useState(null);
  const [denemeCevaplar, setDenemeCevaplar] = useState({});
  const [optikYukleniyor, setOptikYukleniyor] = useState(false);
  const [optikHata, setOptikHata] = useState("");

  async function optikOkumaYap(dosya) {
    if (!dosya || !denemeSorulari) return;
    setOptikYukleniyor(true); setOptikHata("");
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Dosya okunamadi"));
        r.readAsDataURL(dosya);
      });
      const res = await fetch("/api/optik-okuma", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: dosya.type, soruSayisi: denemeSorulari.length, cihazId: cihazIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optik okuma basarisiz");

      const harfIndex = { A: 0, B: 1, C: 2, D: 3 };
      const yeniCevaplar = {};
      data.cevaplar.forEach((harf, i) => {
        if (harf && harfIndex[harf.toUpperCase()] !== undefined) yeniCevaplar[i] = harfIndex[harf.toUpperCase()];
      });
      setDenemeCevaplar((eski) => ({ ...eski, ...yeniCevaplar }));
      const okunanSayi = Object.keys(yeniCevaplar).length;
      if (okunanSayi < denemeSorulari.length) {
        setOptikHata(`${okunanSayi}/${denemeSorulari.length} cevap okunabildi - kalanlari elle isaretleyebilirsin.`);
      }
    } catch (e) {
      setOptikHata(e.message || "Optik okuma basarisiz, tekrar dene.");
    } finally {
      setOptikYukleniyor(false);
    }
  }

  const [denemeGonderildi, setDenemeGonderildi] = useState(false);
  const [aciklama, setAciklama] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [cevaplar, setCevaplar] = useState({});
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(null);
  const [hata, setHata] = useState("");
  const cihazIdRef = useRef(null);

  const [zayifDersler, setZayifDersler] = useState([]);
  const [otomatikTespit, setOtomatikTespit] = useState(false);
  const [haftalikSaat, setHaftalikSaat] = useState(10);
  const [kalanHafta, setKalanHafta] = useState(8);
  const [plan, setPlan] = useState("");
  const [haftalikGorevListesi, setHaftalikGorevListesi] = useState(null);

  const [checkoutHtml, setCheckoutHtml] = useState("");
  const [odemeHata, setOdemeHata] = useState("");
  const [aktifAbonelik, setAktifAbonelik] = useState(null);
  const [profilOkul, setProfilOkul] = useState("");
  const [okulOnerileri, setOkulOnerileri] = useState([]);
  const [okulOnerileriAcik, setOkulOnerileriAcik] = useState(false);
  useEffect(() => {
    if (!profilOkul || profilOkul.trim().length < 2) { setOkulOnerileri([]); return; }
    const zamanlayici = setTimeout(() => {
      fetch(`/api/okul-ara?q=${encodeURIComponent(profilOkul.trim())}`)
        .then((r) => r.json()).then((d) => setOkulOnerileri(d.sonuclar || []))
        .catch(() => setOkulOnerileri([]));
    }, 300); // yazarken her tusa basista sorgu atmasin diye kisa bir bekleme
    return () => clearTimeout(zamanlayici);
  }, [profilOkul]);
  const [profilTelefon, setProfilTelefon] = useState("");
  const [profilSinifSec, setProfilSinifSec] = useState("");
  const [profilKaydediliyor, setProfilKaydediliyor] = useState(false);
  const [profilMesaj, setProfilMesaj] = useState("");
  const [profilDuzenleAcik, setProfilDuzenleAcik] = useState(false);

  async function profilKaydet() {
    setProfilKaydediliyor(true); setProfilMesaj("");
    try {
      await fetch("/api/auth/profil-guncelle", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ okul: profilOkul, telefon: profilTelefon, sinif: profilSinifSec ? Number(profilSinifSec) : null }),
      });
      setHesap((h) => ({ ...h, okul: profilOkul, telefon: profilTelefon, sinif: profilSinifSec }));
      setProfilMesaj("Kaydedildi."); setProfilDuzenleAcik(false);
    } catch (e) { setProfilMesaj("Kaydedilemedi, tekrar dene."); }
    finally { setProfilKaydediliyor(false); }
  }

  const [iptalMesaji, setIptalMesaji] = useState("");

  // Hesap
  const [hesap, setHesap] = useState(null); // {ad, eposta, rol, eposta_dogrulandi, veli_baglanti_kodu} | null
  const [seriVeri, setSeriVeri] = useState(null); // {guncelSeri, enUzunSeri, toplamAktifGun}
  useEffect(() => {
    if (!hesap) return;
    fetch(`/api/streak?cihazId=${cihazIdRef.current}`).then((r) => r.json()).then(setSeriVeri).catch(() => {});
  }, [hesap?.eposta]);
  // KRITIK: hesabin gercek sinifi (kayitta/profilde secilen) buraya kadar hic
  // yansitilmiyordu - "sinif" state'i hep varsayilan 8'de kaliyordu. Hesap
  // yuklendiginde veya sinifi degistiginde, uygulama genelinde kullanilan
  // "sinif" state'ini gercek degerle senkronize ediyoruz.
  useEffect(() => {
    if (hesap && hesap.sinif) setSinif(Number(hesap.sinif));
  }, [hesap?.sinif]);
  const [profilGunlukGorevler, setProfilGunlukGorevler] = useState(null);
  const [karneAcik, setKarneAcik] = useState(false);
  const [netTrendVeri, setNetTrendVeri] = useState(null);
  const [netTrendYukleniyor, setNetTrendYukleniyor] = useState(false);

  const [tekrarSorulari, setTekrarSorulari] = useState(null);
  const [tekrarIndex, setTekrarIndex] = useState(0);
  const [tekrarCevap, setTekrarCevap] = useState(null);
  const [tekrarGosterildi, setTekrarGosterildi] = useState(false);
  const [tekrarSonMesaj, setTekrarSonMesaj] = useState("");
  const [tekrarSayisi, setTekrarSayisi] = useState(0); // ana sayfa rozeti icin - bugun kac tane bekliyor

  async function tekrarSorulariniGetir() {
    try {
      const res = await fetch(`/api/aralikli-tekrar?cihazId=${cihazIdRef.current}`);
      const data = await res.json();
      setTekrarSorulari(data.kayitlar || []);
      setTekrarSayisi((data.kayitlar || []).length);
      setTekrarIndex(0); setTekrarCevap(null); setTekrarGosterildi(false); setTekrarSonMesaj("");
    } catch (e) {
      setTekrarSorulari([]);
    }
  }
  useEffect(() => { if (mod === "tekrarzamani") tekrarSorulariniGetir(); }, [mod]);
  useEffect(() => { if (hesap) fetch(`/api/aralikli-tekrar?cihazId=${cihazIdRef.current}`).then((r) => r.json()).then((d) => setTekrarSayisi((d.kayitlar || []).length)).catch(() => {}); }, [hesap?.eposta]);

  async function tekrarCevapVer(secilenIndex) {
    if (tekrarGosterildi) return;
    setTekrarCevap(secilenIndex); setTekrarGosterildi(true);
    const soru = tekrarSorulari[tekrarIndex];
    const dogruMu = secilenIndex === soru.dogru_index;
    try {
      const res = await fetch("/api/aralikli-tekrar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: soru.id, dogruMu, cihazId: cihazIdRef.current }),
      });
      const data = await res.json();
      setTekrarSonMesaj(data.ustesindenGelindi ? "🎉 Bu konunun üstesinden geldin!" : `${data.sonrakiTekrarGun} gün sonra tekrar karşına çıkacak.`);
    } catch (e) { /* sessiz gec */ }
  }
  function tekrarSonrakiSoru() {
    setTekrarIndex((i) => i + 1); setTekrarCevap(null); setTekrarGosterildi(false); setTekrarSonMesaj("");
  }

  const [kelimeKartiDers, setKelimeKartiDers] = useState(null); // "Ingilizce" | "Turkce"
  const [kelimeKartiUnite, setKelimeKartiUnite] = useState(null);
  const [kelimeKartlari, setKelimeKartlari] = useState(null);
  const [kelimeKartiIndex, setKelimeKartiIndex] = useState(0);
  const [kelimeKartiCevrildi, setKelimeKartiCevrildi] = useState(false);
  const [kelimeKartiYukleniyor, setKelimeKartiYukleniyor] = useState(false);

  async function kelimeKartlariUret() {
    setKelimeKartiYukleniyor(true); setHata(""); setKelimeKartlari(null); setKelimeKartiIndex(0); setKelimeKartiCevrildi(false);
    try {
      const p = kelimeKartiDers === "Ingilizce"
        ? `Sen Ingilizce ogretmenisin. "${kelimeKartiUnite}" konusuyla ilgili, ${sinif}. sinif seviyesine uygun 10 Ingilizce kelime karti hazirla. Her kart icin: Ingilizce kelime, Turkce anlami, ve o kelimeyi kullanan BASIT bir Ingilizce ornek cumle (parantez icinde Turkce cevirisiyle). SADECE JSON dondur, markdown kullanma:
[{"kelime":"...","anlam":"...","ornekCumle":"... (Turkce ceviri)"}]`
        : `Sen Turkce ogretmenisin. ${sinif}. sinif seviyesine uygun, ogrencilerin kelime hazinesini zenginlestirecek 10 Turkce kelime (az bilinen ama seviyeye uygun, edebi metinlerde/LGS'de karsilarina cikabilecek kelimeler) hazirla. Her kart icin: kelime, kisa ve net anlami, ve o kelimeyi kullanan bir ornek cumle. SADECE JSON dondur, markdown kullanma:
[{"kelime":"...","anlam":"...","ornekCumle":"..."}]`;
      const cevap = await aiIstek(p, 1800, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").trim();
      const baslangic = temiz.indexOf("[");
      const bitis = temiz.lastIndexOf("]");
      if (baslangic === -1 || bitis === -1) throw new Error("Kartlar olusturulamadi");
      const kartlar = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setKelimeKartlari(kartlar);
    } catch (e) {
      setHata(temizHataMesaji(e, "Kelime kartlari olusturulamadi, tekrar dene."));
    } finally {
      setKelimeKartiYukleniyor(false);
    }
  }

  async function netTrendiGetir() {
    setNetTrendYukleniyor(true);
    try {
      const res = await fetch(`/api/sinav-sonuc?cihazId=${cihazIdRef.current}`);
      const data = await res.json();
      const sonuclar = (data.sonuclar || []).filter((s) => s.tur === "deneme" || s.tur === "yazili");
      // Tarihe gore eskiden yeniye sirala, son 12 sonucu al (cok kalabalik olmasin)
      const sirali = [...sonuclar].sort((a, b) => new Date(a.olusturulma) - new Date(b.olusturulma)).slice(-12);
      setNetTrendVeri(sirali.map((s) => ({ tarih: s.olusturulma, net: Number(s.net), ders: s.ders.split("::")[0] })));
    } catch (e) {
      setNetTrendVeri([]);
    } finally {
      setNetTrendYukleniyor(false);
    }
  }
  useEffect(() => {
    if (mod === "hesap" && hesap) netTrendiGetir();
  }, [mod, hesap?.eposta]);

  const [dersSecimModu, setDersSecimModu] = useState("koc"); // "koc" | "manuel"
  const [manuelUnite, setManuelUnite] = useState(null);
  const [manuelAltBaslik, setManuelAltBaslik] = useState([]);
  const [puanGirdi, setPuanGirdi] = useState({
    Turkce: { d: "", y: "" }, Matematik: { d: "", y: "" }, "Fen Bilimleri": { d: "", y: "" },
    "T.C. Inkilap Tarihi": { d: "", y: "" }, "Din Kulturu": { d: "", y: "" }, Ingilizce: { d: "", y: "" },
  });
  const [formulKartDers, setFormulKartDers] = useState(null);
  const [formulKartUnite, setFormulKartUnite] = useState(null);
  const [formulKartCache, setFormulKartCache] = useState({}); // anahtar: ders::unite::sinif -> metin
  const [formulKartYukleniyor, setFormulKartYukleniyor] = useState(false);
  const [zayifHaritaVeri, setZayifHaritaVeri] = useState(null);
  const [zayifHaritaYukleniyor, setZayifHaritaYukleniyor] = useState(false);
  const [hedefIl, setHedefIl] = useState("");
  const [hedefIlce, setHedefIlce] = useState("");
  const [hedefOkulAdi, setHedefOkulAdi] = useState("");
  const [hedefPuanDeger, setHedefPuanDeger] = useState("");
  const [hedefKaydediliyor, setHedefKaydediliyor] = useState(false);
  const [hedefKaydedildi, setHedefKaydedildi] = useState(false);

  useEffect(() => {
    if (mod !== "hedefokul" || !hesap) return;
    fetch(`/api/hedef-okul?cihazId=${cihazIdRef.current}`).then((r) => r.json()).then((d) => {
      if (d.hedef) {
        setHedefIl(d.hedef.hedef_il || ""); setHedefIlce(d.hedef.hedef_ilce || "");
        setHedefOkulAdi(d.hedef.hedef_okul || ""); setHedefPuanDeger(d.hedef.hedef_puan || "");
      }
    }).catch(() => {});
  }, [mod, hesap?.eposta]);

  async function hedefOkuluKaydet() {
    setHedefKaydediliyor(true); setHedefKaydedildi(false);
    try {
      await fetch("/api/hedef-okul", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, hedefIl, hedefIlce, hedefOkul: hedefOkulAdi, hedefPuan: hedefPuanDeger ? Number(hedefPuanDeger) : null }),
      });
      setHedefKaydedildi(true);
    } finally {
      setHedefKaydediliyor(false);
    }
  }

  const SEVIYELER = [
    { ad: "Çaylak", esik: 0, ikon: "🌱" },
    { ad: "Azimli", esik: 100, ikon: "🔰" },
    { ad: "Gayretli", esik: 300, ikon: "⚡" },
    { ad: "Uzman", esik: 700, ikon: "🎯" },
    { ad: "Usta", esik: 1500, ikon: "🏆" },
    { ad: "Efsane", esik: 3000, ikon: "👑" },
  ];
  const GENEL_ROZETLER = [
    { key: "ilkAdim", ikon: "🎯", ad: "İlk Adım", aciklama: "İlk sorunu çözdün", kosul: (v) => v.toplamSoru >= 1 },
    { key: "seri3", ikon: "🔥", ad: "Ateşli Başlangıç", aciklama: "3 gün üst üste çalıştın", kosul: (v) => v.enUzunSeri >= 3 },
    { key: "seri7", ikon: "🔥🔥", ad: "Kararlı", aciklama: "7 gün üst üste çalıştın", kosul: (v) => v.enUzunSeri >= 7 },
    { key: "seri30", ikon: "🔥🔥🔥", ad: "Demir İrade", aciklama: "30 gün üst üste çalıştın", kosul: (v) => v.enUzunSeri >= 30 },
    { key: "mukemmel", ikon: "💯", ad: "Mükemmeliyetçi", aciklama: "Bir testte hiç hata yapmadın", kosul: (v) => v.enYuksekYuzde >= 1 },
    { key: "soru50", ikon: "📚", ad: "Kitap Kurdu", aciklama: "50 soru çözdün", kosul: (v) => v.toplamSoru >= 50 },
    { key: "soru200", ikon: "🌟", ad: "Yıldız Öğrenci", aciklama: "200 soru çözdün", kosul: (v) => v.toplamSoru >= 200 },
    { key: "soru500", ikon: "💎", ad: "Elmas Öğrenci", aciklama: "500 soru çözdün", kosul: (v) => v.toplamSoru >= 500 },
    { key: "sinav5", ikon: "📝", ad: "Sınav Deneyimli", aciklama: "5 sınav tamamladın", kosul: (v) => v.tamamlananSinavSayisi >= 5 },
    { key: "sinav20", ikon: "🎓", ad: "Sınav Savaşçısı", aciklama: "20 sınav tamamladın", kosul: (v) => v.tamamlananSinavSayisi >= 20 },
  ];
  function seviyeHesapla(xp) {
    let mevcut = SEVIYELER[0], sonraki = SEVIYELER[1];
    for (let i = 0; i < SEVIYELER.length; i++) {
      if (xp >= SEVIYELER[i].esik) { mevcut = SEVIYELER[i]; sonraki = SEVIYELER[i + 1] || null; }
    }
    return { mevcut, sonraki };
  }
  const [basariVeri, setBasariVeri] = useState(null);
  useEffect(() => {
    if ((mod !== "basarilarim" && mod !== "hesap") || !hesap) return;
    Promise.all([
      fetch(`/api/basarilar?cihazId=${cihazIdRef.current}`).then((r) => r.json()),
      fetch(`/api/streak?cihazId=${cihazIdRef.current}`).then((r) => r.json()),
    ]).then(([b, s]) => setBasariVeri({ ...b, enUzunSeri: s.enUzunSeri || 0 })).catch(() => {});
  }, [mod, hesap?.eposta]);

  const [kurumOlusturAdi, setKurumOlusturAdi] = useState("");
  const [kurumOlusturSonuc, setKurumOlusturSonuc] = useState(null); // {kurumKodu, ad}
  const [kurumOlusturYukleniyor, setKurumOlusturYukleniyor] = useState(false);
  const [kurumRaporKodu, setKurumRaporKodu] = useState("");
  const [kurumRaporu, setKurumRaporu] = useState(null);
  const [kurumRaporYukleniyor, setKurumRaporYukleniyor] = useState(false);
  const [kurumBaglanKodu, setKurumBaglanKodu] = useState("");
  const [kurumBaglaniyor, setKurumBaglaniyor] = useState(false);
  const [kurumBaglandi, setKurumBaglandi] = useState(false);
  const [liderlikVeri, setLiderlikVeri] = useState(null);
  useEffect(() => {
    if (mod !== "kurumpaneli" || !hesap || hesap.rol !== "ogrenci") return;
    fetch(`/api/kurum/liderlik?cihazId=${cihazIdRef.current}`).then((r) => r.json()).then(setLiderlikVeri).catch(() => {});
  }, [mod, hesap?.eposta]);

  const [ulusalAktif, setUlusalAktif] = useState(null);
  const [ulusalGelecek, setUlusalGelecek] = useState(null);
  const [ulusalSorular, setUlusalSorular] = useState(null);
  const [ulusalCevaplar, setUlusalCevaplar] = useState({});
  const [ulusalSonuc, setUlusalSonuc] = useState(null);
  const [ulusalZatenCozmus, setUlusalZatenCozmus] = useState(false);
  const [ulusalGonderiliyor, setUlusalGonderiliyor] = useState(false);
  const [ulusalYukleniyor, setUlusalYukleniyor] = useState(false);
  // Yonetici (Mehmet) icin gizli tetikleme paneli
  const [ulusalYoneticiAcik, setUlusalYoneticiAcik] = useState(false);
  const [ulusalYoneticiSifre, setUlusalYoneticiSifre] = useState("");
  const [ulusalYoneticiAd, setUlusalYoneticiAd] = useState("");
  const [ulusalYoneticiSinif, setUlusalYoneticiSinif] = useState(8);
  const [ulusalYoneticiDers, setUlusalYoneticiDers] = useState("Matematik");
  const [ulusalYoneticiSaat, setUlusalYoneticiSaat] = useState(24);
  const [ulusalYoneticiOlusturuluyor, setUlusalYoneticiOlusturuluyor] = useState(false);
  const [maliyetRaporu, setMaliyetRaporu] = useState(null);
  const [maliyetRaporuYukleniyor, setMaliyetRaporuYukleniyor] = useState(false);
  async function maliyetRaporunuGetir() {
    setMaliyetRaporuYukleniyor(true); setHata("");
    try {
      const res = await fetch(`/api/admin/maliyet-raporu?sifre=${encodeURIComponent(ulusalYoneticiSifre)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMaliyetRaporu(data);
    } catch (e) {
      setHata(temizHataMesaji(e, "Rapor alinamadi."));
    } finally {
      setMaliyetRaporuYukleniyor(false);
    }
  }

  async function ulusalDenemeyiGetir() {
    setUlusalYukleniyor(true);
    try {
      const res = await fetch(`/api/ulusal-deneme/aktif?cihazId=${cihazIdRef.current}`);
      const data = await res.json();
      setUlusalAktif(data.aktifDeneme || null);
      setUlusalGelecek(data.gelecekDeneme || null);
      setUlusalSorular(data.sorular || null);
      setUlusalZatenCozmus(data.zatenCozmus || false);
    } catch (e) { /* sessiz gec */ }
    finally { setUlusalYukleniyor(false); }
  }
  useEffect(() => { if (mod === "ulusaldeneme") ulusalDenemeyiGetir(); }, [mod]);

  async function ulusalCevaplariGonder() {
    if (!ulusalAktif) return;
    setUlusalGonderiliyor(true); setHata("");
    try {
      const res = await fetch("/api/ulusal-deneme/gonder", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ulusalDenemeId: ulusalAktif.id, cevaplar: ulusalCevaplar, cihazId: cihazIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUlusalSonuc(data);
    } catch (e) {
      setHata(temizHataMesaji(e, "Gonderilemedi, tekrar dene."));
    } finally {
      setUlusalGonderiliyor(false);
    }
  }

  async function ulusalDenemeOlustur() {
    setUlusalYoneticiOlusturuluyor(true); setHata("");
    try {
      const res = await fetch("/api/ulusal-deneme/olustur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad: ulusalYoneticiAd, sinif: ulusalYoneticiSinif, ders: ulusalYoneticiDers, soruSayisi: 20, acikKalmaSaati: ulusalYoneticiSaat, yoneticiSifre: ulusalYoneticiSifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUlusalYoneticiAcik(false); setUlusalYoneticiSifre(""); setUlusalYoneticiAd("");
      ulusalDenemeyiGetir();
    } catch (e) {
      setHata(temizHataMesaji(e, "Olusturulamadi."));
    } finally {
      setUlusalYoneticiOlusturuluyor(false);
    }
  }

  async function kurumOlustur() {
    if (!kurumOlusturAdi.trim()) return;
    setKurumOlusturYukleniyor(true); setHata("");
    try {
      const res = await fetch("/api/kurum/olustur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad: kurumOlusturAdi.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKurumOlusturSonuc(data);
    } catch (e) {
      setHata(temizHataMesaji(e, "Kurum olusturulamadi, tekrar dene."));
    } finally {
      setKurumOlusturYukleniyor(false);
    }
  }

  async function kurumRaporuGetir() {
    if (!kurumRaporKodu.trim()) return;
    setKurumRaporYukleniyor(true); setHata(""); setKurumRaporu(null);
    try {
      const res = await fetch(`/api/kurum/rapor?kod=${encodeURIComponent(kurumRaporKodu.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKurumRaporu(data);
    } catch (e) {
      setHata(temizHataMesaji(e, "Rapor alinamadi, kodu kontrol et."));
    } finally {
      setKurumRaporYukleniyor(false);
    }
  }

  async function kurumaOgrenciOlarakBaglan() {
    if (!kurumBaglanKodu.trim()) return;
    setKurumBaglaniyor(true); setHata("");
    try {
      const res = await fetch("/api/kurum/baglan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kurumKodu: kurumBaglanKodu.trim(), cihazId: cihazIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKurumBaglandi(true);
    } catch (e) {
      setHata(temizHataMesaji(e, "Baglanamadi, kodu kontrol et."));
    } finally {
      setKurumBaglaniyor(false);
    }
  }

  const TATIL_TURLERI = [
    { key: "ara", ad: "Ara Tatil", gun: 7, aciklama: "Kısa toparlanma, eksik konuları kapatma" },
    { key: "yariyil", ad: "Yarıyıl Tatili", gun: 14, aciklama: "2 haftalık dengeli tekrar programı" },
    { key: "yaz", ad: "Yaz Tatili (İlk Ay)", gun: 30, aciklama: "Uzun soluklu, sürdürülebilir tempo" },
  ];
  const [tatilTuru, setTatilTuru] = useState(null);
  const [tatilProgramiMesaj, setTatilProgramiMesaj] = useState("");
  const [tatilProgramiListesi, setTatilProgramiListesi] = useState(null);
  const [tatilProgramiYukleniyor, setTatilProgramiYukleniyor] = useState(false);

  async function tatilProgramiOlustur() {
    if (!tatilTuru) return;
    const secilenTatil = TATIL_TURLERI.find((t) => t.key === tatilTuru);
    setTatilProgramiYukleniyor(true); setHata(""); setTatilProgramiMesaj(""); setTatilProgramiListesi(null);
    try {
      const ogrenciAdi = hesap?.ad ? hesap.ad.split(" ")[0] : null;
      const zayifMetni = zayifDersler.length > 0 ? `Ozellikle zayif oldugu dersler: ${zayifDersler.join(", ")}.` : "";
      const p = `Sen bir LGS calisma kocususun. ${ogrenciAdi ? `Ogrencinin adi ${ogrenciAdi}.` : ""} ${zayifMetni} Ogrenci ${sinif}. sinifta, "${secilenTatil.ad}" donemine giriyor (${secilenTatil.gun} gunluk). ${secilenTatil.key === "yaz" ? "Yaz tatili UZUN oldugu icin, tempo dusuk-orta tutulmali, her gun 1-1.5 saatlik hafif ama DUZENLI bir aliskanlik kurmali, tukenmisligi onlemek icin haftada 1 gun tam dinlenme olmali." : secilenTatil.key === "yariyil" ? "Yariyil tatili orta uzunlukta, eksik konulari kapatmaya ve 2. donem'e hazirliga odaklanmali." : "Ara tatil kisa, sadece son donemdeki eksikleri toparlamaya ve dinlenmeye odaklanmali, agir yeni konu YOK."} Iki parca uret: (1) "mesaj": ogrenciye sicak, kisa (120-160 kelime) bir konusma - tatilin ruhuna uygun (dinlenmeyi de onemsediginizi belirt). (2) "program": ${secilenTatil.gun} GUNUN HER BIRI icin bir gorev nesnesi - {"gunNo":1,"ders":"Matematik","gorev":"Kisa, somut, TEK CUMLELIK gorev"}. Haftada en az 1 gun "Dinlenme" olarak ayarla (agir calisma yok). SADECE JSON dondur, markdown kullanma:
{"mesaj":"...","program":[{"gunNo":1,"ders":"...","gorev":"..."}, ...]}`;
      const cevap = await aiIstek(p, Math.min(6000, 800 + secilenTatil.gun * 120), cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").trim();
      const baslangic = temiz.indexOf("{");
      const bitis = temiz.lastIndexOf("}");
      if (baslangic === -1 || bitis === -1) throw new Error("Program olusturulamadi, tekrar dene");
      const veri = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setTatilProgramiMesaj(veri.mesaj || "");
      if (Array.isArray(veri.program) && veri.program.length > 0) {
        setTatilProgramiListesi(veri.program);
        // Gunluk gorevler tablosuna, bugunden baslayarak gercek tarihlerle kaydediyoruz.
        const bugun = new Date();
        const gorevlerTarihli = veri.program.map((g, i) => {
          const tarih = new Date(bugun);
          tarih.setDate(bugun.getDate() + i);
          return { gun: tarih.toISOString().slice(0, 10), ders: g.ders, gorev: g.gorev };
        });
        fetch("/api/gunluk-gorevler", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cihazId: cihazIdRef.current, haftaBaslangic: bugun.toISOString().slice(0, 10), gorevler: gorevlerTarihli }),
        }).catch(() => {});
      }
    } catch (e) {
      setHata(temizHataMesaji(e, "Tatil programi olusturulamadi, tekrar dene."));
    } finally {
      setTatilProgramiYukleniyor(false);
    }
  }

  const [burslulukSoruSayisi, setBurslulukSoruSayisi] = useState(5);
  const [burslulukBasladi, setBurslulukBasladi] = useState(false);
  const [burslulukSorular, setBurslulukSorular] = useState(null); // { Turkce: [...], Matematik: [...], ... }
  const [burslulukYukleniyor, setBurslulukYukleniyor] = useState(false);
  const [burslulukAsama, setBurslulukAsama] = useState("");
  const [burslulukCevaplar, setBurslulukCevaplar] = useState({}); // "Turkce::0" -> secenekIndex
  const [burslulukGonderildi, setBurslulukGonderildi] = useState(false);

  async function burslulukSinaviUret() {
    setBurslulukYukleniyor(true); setHata(""); setBurslulukSorular(null); setBurslulukCevaplar({}); setBurslulukGonderildi(false); setBurslulukBasladi(true);
    const sonuc = {};
    try {
      for (const dersAdi of BURSLULUK_DERSLER) {
        setBurslulukAsama(dersAdi);
        const uniteler = dersinUniteleri(dersAdi, sinif).join(", ");
        const sosyalDinNotu = dersAdi === "Sosyal Bilgiler" ? ` ONEMLI: Gercek IOKBS'de Sosyal Bilgiler sorularinin bir kismi Din Kulturu ve Ahlak Bilgisi konularini da icerir - hazirladigin ${burslulukSoruSayisi} sorunun yaklasik %20-25'ini (${sinif}. sinif Din Kulturu mufredatindan) Din Kulturu konularindan yap, kalanini Sosyal Bilgiler'den yap.` : "";
        const p = `Sen bursluluk sinavi (IOKBS) hazirlik uzmanisin. "${dersAdi}" dersinden, ${sinif}. sinif mufredatinin TAMAMINI (uniteler: ${uniteler}) kapsayacak sekilde, dengeli dagilmis ${burslulukSoruSayisi} coktan secmeli soru hazirla.${sosyalDinNotu} ${BAGLAM_TEMELLI_SORU_TALIMATI} Sorular gercek IOKBS sinavi zorlugunda ve tarzinda olsun. Her soru icin "aciklama" alaninda dogru cevabin nedenini 1-2 cumleyle anlat. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"..."}]`;
        const cevap = await aiIstek(p, Math.min(6000, 500 + burslulukSoruSayisi * 450), cihazIdRef.current, true);
        const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
        sonuc[dersAdi] = soruJsonAyikla(temiz);
        setBurslulukSorular({ ...sonuc });
      }
    } catch (e) {
      setHata(temizHataMesaji(e, "Bursluluk denemesi olusturulamadi, tekrar dene."));
    } finally {
      setBurslulukYukleniyor(false); setBurslulukAsama("");
      // Gercek IOKBS: 80 soru (4 ders x 20) icin 100 dakika - orani koruyarak hesapliyoruz.
      const toplamSoruSayisi = burslulukSoruSayisi * BURSLULUK_DERSLER.length;
      kronometreyiBaslat(Math.round((toplamSoruSayisi / 80) * 100));
    }
  }

  const PARAGRAF_TURLERI = [
    { ad: "Ana Fikir Bulma", aciklama: "Paragrafın temel mesajını yakala" },
    { ad: "Yardımcı Fikir Bulma", aciklama: "Ana fikri destekleyen düşünceler" },
    { ad: "Başlık Bulma", aciklama: "Paragrafa en uygun başlığı seç" },
    { ad: "Paragraf Tamamlama", aciklama: "Akışa uygun cümleyi bul" },
    { ad: "Paragrafı İkiye Bölme", aciklama: "Konu değişim noktasını yakala" },
    { ad: "Düşünceyi Geliştirme Yolları", aciklama: "Tanımlama, örnekleme, tanık gösterme" },
    { ad: "Anlatım Biçimleri", aciklama: "Öznel-nesnel anlatım ayrımı" },
    { ad: "Grafik ve Tablo Yorumlama", aciklama: "Görsel veri okuma becerisi" },
  ];
  const [paragrafTuru, setParagrafTuru] = useState(null);
  const [paragrafZorluk, setParagrafZorluk] = useState("orta");
  const [paragrafSoru, setParagrafSoru] = useState(null);
  const [paragrafYukleniyor, setParagrafYukleniyor] = useState(false);
  const [paragrafCevap, setParagrafCevap] = useState(null);
  const [paragrafGonderildi, setParagrafGonderildi] = useState(false);

  async function paragrafSorusuUret() {
    setParagrafYukleniyor(true); setHata(""); setParagrafSoru(null); setParagrafCevap(null); setParagrafGonderildi(false);
    try {
      const zorlukMetni = { kolay: "kisa ve net, temel seviyede", orta: "orta uzunlukta, LGS standart zorlukta", zor: "uzun, cok katmanli, ust duzey dusunme gerektiren (LGS'nin en zor sorulari tarzinda)" }[paragrafZorluk];
      const p = `Sen bir Turkce ogretmenisin ve LGS paragraf sorulari konusunda uzmansin. ${sinif}. sinif seviyesinde, "${paragrafTuru}" turunde, ${zorlukMetni} BIR paragraf sorusu hazirla. ${BAGLAM_TEMELLI_SORU_TALIMATI} Paragraf gercek bir LGS paragrafi kalitesinde olsun - 100-180 kelime arasi, akici, gercek bir konu (bilim, sanat, tarih, gunluk hayat, cevre vb.) hakkinda olsun, yapay/bosluk doldurma hissi vermesin. Celdiriciler ozellikle bu paragraf turune ozgu tipik hatalari yansitsin (orn. Ana Fikir sorusunda "dogru ama paragrafin butununu kapsamayan" bir secenegi celdirici olarak kullan). SADECE JSON dondur, markdown kullanma:
{"paragraf":"...","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"..."}`;
      const cevap = await aiIstek(p, 1800, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").trim();
      const baslangic = temiz.indexOf("{");
      const bitis = temiz.lastIndexOf("}");
      if (baslangic === -1 || bitis === -1) throw new Error("Paragraf sorusu olusturulamadi, tekrar dene");
      const veri = JSON.parse(temiz.slice(baslangic, bitis + 1));
      if (!veri.paragraf || !veri.soru || !Array.isArray(veri.secenekler)) throw new Error("Paragraf sorusu olusturulamadi, tekrar dene");
      setParagrafSoru(veri);
    } catch (e) {
      setHata(temizHataMesaji(e, "Paragraf sorusu olusturulamadi, tekrar dene."));
    } finally {
      setParagrafYukleniyor(false);
    }
  }



  async function zayifHaritayiGetir() {
    setZayifHaritaYukleniyor(true);
    try {
      const res = await fetch(`/api/hata-kitapcigi?cihazId=${cihazIdRef.current}&istatistik=true`);
      const data = await res.json();
      setZayifHaritaVeri(data.istatistik || []);
    } catch (e) {
      setZayifHaritaVeri([]);
    } finally {
      setZayifHaritaYukleniyor(false);
    }
  }
  useEffect(() => {
    if (mod === "zayifharita") zayifHaritayiGetir();
  }, [mod]);


  async function formulKartiGetir(dersAdi, uniteAdi) {
    const anahtar = `${dersAdi}::${uniteAdi}::${sinif}`;
    if (formulKartCache[anahtar]) return;
    setFormulKartYukleniyor(true);
    try {
      const p = `Sen "${dersAdi}" dersi ogretmenisin. "${uniteAdi}" unitesinin EN ONEMLI 8-10 formulunu/kuralini/sinavda-dikkat noktasini, ${sinif}. sinif seviyesinde, COK KISA bir "hizli bakis karti" formatinda listele. HER MADDE TEK SATIR ve EN FAZLA 12 KELIME olsun (formul + 2-4 kelimelik aciklama) - uzun cumle YASAK. SADECE Turkce yaz, markdown kullanma (yildiz vb.), her maddeyi yeni satirda '•' ile basla. Son maddeyi MUTLAKA tamamla, yarim birakma.`;
      const cevap = await aiIstek(p, 1800, cihazIdRef.current);
      const temiz = cevap.replace(/\*\*/g, "").replace(/#+\s?/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "")
        .split("\n").filter((satir) => satir.trim().length > 3).join("\n"); // yarim kalmis (sadece "•" gibi) satirlari at
      setFormulKartCache((eski) => ({ ...eski, [anahtar]: temiz }));
    } catch (e) {
      setFormulKartCache((eski) => ({ ...eski, [anahtar]: "Kart hazırlanamadı, tekrar dene." }));
    } finally {
      setFormulKartYukleniyor(false);
    }
  }

  useEffect(() => {
    setAciklama(""); setQuiz(null); setGonderildi(false); setCevaplar({});
  }, [manuelUnite, manuelAltBaslik, dersSecimModu]);
  useEffect(() => {
    if (manuelUnite && secilenDers) { altKonulariGetir(secilenDers, manuelUnite); setManuelAltBaslik([]); }
  }, [manuelUnite, secilenDers]);
  const [karneOzet, setKarneOzet] = useState(null);
  const [karneYorum, setKarneYorum] = useState("");
  const [karneYukleniyor, setKarneYukleniyor] = useState(false);

  async function karneyiHazirla() {
    setKarneYukleniyor(true); setKarneAcik(true); setKarneYorum(""); setKarneOzet(null);
    try {
      const res = await fetch(`/api/sinav-sonuc?cihazId=${cihazIdRef.current}`);
      const data = await res.json();
      const tumSonuclar = data.sonuclar || [];

      // Net puanli olanlar (deneme/yazili) - ders bazinda ortalama
      const netliTurler = tumSonuclar.filter((s) => s.tur === "deneme" || s.tur === "yazili");
      const dersBazinda = {};
      netliTurler.forEach((s) => {
        const anaDers = s.ders.split("::")[0];
        if (!dersBazinda[anaDers]) dersBazinda[anaDers] = { toplamNet: 0, adet: 0, sonNet: null };
        dersBazinda[anaDers].toplamNet += Number(s.net);
        dersBazinda[anaDers].adet += 1;
        if (dersBazinda[anaDers].sonNet === null) dersBazinda[anaDers].sonNet = Number(s.net); // en yeni (DESC siralida ilk)
      });

      const ozet = Object.entries(dersBazinda).map(([ders, v]) => ({
        ders, testSayisi: v.adet, ortalamaNet: (v.toplamNet / v.adet).toFixed(1), sonNet: v.sonNet.toFixed(1),
      }));
      setKarneOzet(ozet);

      if (ozet.length === 0) {
        setKarneYorum("Henuz yeterli sinav gecmisin yok. Bir kac Deneme ya da Yazili tamamladiktan sonra burada derin bir performans yorumu gorebileceksin.");
        return;
      }

      const ogrenciAdi = hesap?.ad ? hesap.ad.split(" ")[0] : null;
      const veriMetni = ozet.map((o) => `${o.ders}: ${o.testSayisi} test, ortalama net ${o.ortalamaNet}, en son net ${o.sonNet}`).join("; ");
      const p = `Sen bir egitim kocususun. ${ogrenciAdi ? `Ogrencinin adi ${ogrenciAdi}.` : ""} Su gercek sinav verilerine dayanarak DERIN, KISISEL bir karne/durum degerlendirmesi yaz: ${veriMetni}. Su noktalara deg: (1) En guclu oldugu 1-2 dersi somut sayilarla ovun, (2) En cok destege ihtiyaci olan 1-2 dersi nazik ama net sekilde belirt, (3) Son sinav ile ortalamasini kiyaslayip bir trend yorumu yap (yukseliyor mu, sabit mi, dususte mi), (4) Somut, uygulanabilir 2-3 tavsiye ver. Sicak, samimi, gercekci bir mentor tonu kullan - ne asiri ovucu ne cesaret kirici ol. 250-320 kelime, SADECE Turkce duz metin, markdown kullanma. Turkce'ye ozgu noktali/simgeli karakterleri DOGRU ve EKSIKSIZ kullan.`;
      const yorum = await aiIstek(p, 1600, cihazIdRef.current);
      setKarneYorum(yorum);
    } catch (e) {
      setKarneYorum("Karne olusturulamadi, tekrar dene.");
    } finally {
      setKarneYukleniyor(false);
    }
  }


  useEffect(() => {
    if (!hesap || !cihazIdRef.current) return;
    fetch(`/api/gunluk-gorevler?cihazId=${cihazIdRef.current}`)
      .then((r) => r.json())
      .then((d) => setProfilGunlukGorevler((d.gorevler || []).filter((g) => !g.tamamlandi)))
      .catch(() => setProfilGunlukGorevler([]));
  }, [hesap]);

  async function gorevTamamlandiIsaretle(id) {
    setProfilGunlukGorevler((liste) => liste.filter((g) => g.id !== id));
    fetch("/api/gunluk-gorevler", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  }

  useEffect(() => {
    if (hesap) {
      setProfilOkul(hesap.okul || ""); setProfilTelefon(hesap.telefon || ""); setProfilSinifSec(hesap.sinif || "");
    }
  }, [hesap]);

  const [hesapModu, setHesapModu] = useState("giris"); // "giris" | "kayit"
  const [epostaGir, setEpostaGir] = useState("");
  const [sifreGir, setSifreGir] = useState("");
  const [adGir, setAdGir] = useState("");
  const [rolSec, setRolSec] = useState("ogrenci"); // "ogrenci" | "veli"
  const [hesapHata, setHesapHata] = useState("");
  const [sifreUnutAcik, setSifreUnutAcik] = useState(false);
  const [sifreUnutAsama, setSifreUnutAsama] = useState("eposta"); // "eposta" | "kod"
  const [sifreUnutEposta, setSifreUnutEposta] = useState("");
  const [sifreUnutKod, setSifreUnutKod] = useState("");
  const [sifreUnutYeniSifre, setSifreUnutYeniSifre] = useState("");
  const [sifreUnutMesaj, setSifreUnutMesaj] = useState("");
  const [sifreUnutYukleniyor, setSifreUnutYukleniyor] = useState(false);

  async function sifreSifirlamaKoduGonder() {
    if (!sifreUnutEposta) return;
    setSifreUnutYukleniyor(true); setSifreUnutMesaj("");
    try {
      await fetch("/api/auth/sifre-sifirlama-iste", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: sifreUnutEposta }),
      });
      setSifreUnutAsama("kod");
      setSifreUnutMesaj("Eger bu e-posta kayitliysa, bir kod gonderildi. Gelen kutunu kontrol et.");
    } catch (e) { setSifreUnutMesaj("Bir hata olustu, tekrar dene."); }
    finally { setSifreUnutYukleniyor(false); }
  }

  async function sifreSifirlamayiTamamla() {
    if (!sifreUnutKod || !sifreUnutYeniSifre) return;
    setSifreUnutYukleniyor(true); setSifreUnutMesaj("");
    try {
      const res = await fetch("/api/auth/sifre-sifirlama-tamamla", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: sifreUnutEposta, kod: sifreUnutKod, yeniSifre: sifreUnutYeniSifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSifreUnutMesaj("Sifren degistirildi! Simdi yeni sifrenle giris yapabilirsin.");
      setTimeout(() => {
        setSifreUnutAcik(false); setSifreUnutAsama("eposta"); setSifreUnutEposta(""); setSifreUnutKod(""); setSifreUnutYeniSifre(""); setSifreUnutMesaj("");
      }, 2500);
    } catch (e) { setSifreUnutMesaj(e.message || "Sifirlanamadi, tekrar dene."); }
    finally { setSifreUnutYukleniyor(false); }
  }



  // E-posta dogrulama
  const [dogrulamaKoduGir, setDogrulamaKoduGir] = useState("");
  const [dogrulamaMesaj, setDogrulamaMesaj] = useState("");

  // Veli baglantisi
  const [baglantiKoduGir, setBaglantiKoduGir] = useState("");
  const [veliMesaj, setVeliMesaj] = useState("");
  const [veliOgrenciler, setVeliOgrenciler] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.girisYapmis) setHesap(d.kullanici);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (hesap?.rol === "veli") {
      fetch("/api/veli/ilerleme").then((r) => r.json()).then((d) => {
        if (d.ogrenciler) setVeliOgrenciler(d.ogrenciler);
      }).catch(() => {});
    }
  }, [hesap]);

  useEffect(() => {
    if (hesap) {
      fetch("/api/abonelik/durum").then((r) => r.json()).then((d) => setAktifAbonelik(d.aktifAbonelik)).catch(() => {});
    }
  }, [hesap]);

  async function abonelikIptalEt() {
    setIptalMesaji("");
    try {
      const res = await fetch("/api/abonelik/iptal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIptalMesaji(data.mesaj);
      setAktifAbonelik(null);
    } catch (e) {
      setIptalMesaji("Iptal edilemedi: " + e.message);
    }
  }

  // Soru Coz (fotografla)
  const [soruGorseli, setSoruGorseli] = useState(null);
  const [soruCozumu, setSoruCozumu] = useState("");
  const [soruSohbetGecmisi, setSoruSohbetGecmisi] = useState([]);
  const [soruSohbetMetni, setSoruSohbetMetni] = useState("");
  const [soruSohbetYukleniyor, setSoruSohbetYukleniyor] = useState(false);

  async function soruSohbetGonder() {
    const mesaj = soruSohbetMetni.trim();
    if (!mesaj || soruSohbetYukleniyor) return;
    setSoruSohbetMetni("");
    setSoruSohbetGecmisi((eski) => [...eski, { rol: "ogrenci", metin: mesaj }]);
    setSoruSohbetYukleniyor(true);
    try {
      const res = await fetch("/api/soru-coz-devam", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orijinalCozum: soruCozumu, sohbetGecmisi: soruSohbetGecmisi, yeniMesaj: mesaj, ders, sinif, cihazId: cihazIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSoruSohbetGecmisi((eski) => [...eski, { rol: "asistan", metin: data.cevap }]);
    } catch (e) {
      setSoruSohbetGecmisi((eski) => [...eski, { rol: "asistan", metin: "Bir sorun oldu, tekrar sorar mısın?" }]);
    } finally {
      setSoruSohbetYukleniyor(false);
    }
  }


  useEffect(() => {
    cihazIdRef.current = cihazIdAl();
    if (!cihazIdRef.current) return;
    fetch(`/api/ilerleme?cihazId=${cihazIdRef.current}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.zayifDersler?.length) {
          setZayifDersler(d.zayifDersler);
          setOtomatikTespit(true);
        }
      })
      .catch(() => {}); // ilk kullanimda gecmis yoktur, sessizce gec
  }, []);

  function dersToggle(ad) {
    setOtomatikTespit(false);
    setZayifDersler((l) => (l.includes(ad) ? l.filter((x) => x !== ad) : [...l, ad]));
  }

  async function ilerlemeyiKaydet(dersAdi, konuAdi, dogru, toplam) {
    if (!cihazIdRef.current) return;
    try {
      await fetch("/api/ilerleme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, ders: dersAdi, konu: konuAdi, dogruSayisi: dogru, toplamSoru: toplam }),
      });
    } catch (e) { /* sessizce gec - ilerleme kaydi kritik degil */ }
  }

  async function hesapGonder() {
    setHesapHata("");
    const url = hesapModu === "giris" ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: epostaGir, sifre: sifreGir, ad: adGir, rol: rolSec }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Tam kullanici bilgisini (rol, dogrulama durumu, veli kodu dahil) tazele
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (me.girisYapmis) setHesap(me.kullanici);
      const p = await fetch(`/api/ilerleme?cihazId=${cihazIdRef.current}`).then((r) => r.json());
      if (p.zayifDersler?.length) { setZayifDersler(p.zayifDersler); setOtomatikTespit(true); }
    } catch (e) {
      setHesapHata(e.message || "Islem basarisiz");
    }
  }

  async function cikisYap() {
    await fetch("/api/auth/logout", { method: "POST" });
    setHesap(null);
    setVeliOgrenciler([]);
  }

  async function dogrulaGonder() {
    setDogrulamaMesaj("");
    try {
      const res = await fetch("/api/auth/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: dogrulamaKoduGir }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHesap((h) => ({ ...h, eposta_dogrulandi: true }));
      setDogrulamaMesaj("E-postan dogrulandi!");
    } catch (e) {
      setDogrulamaMesaj(e.message || "Dogrulama basarisiz");
    }
  }

  async function kodTekrarGonder() {
    setDogrulamaMesaj("");
    try {
      const res = await fetch("/api/auth/dogrulama-kodu-gonder", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDogrulamaMesaj("Yeni kod gonderildi, gelen kutunu kontrol et.");
    } catch (e) {
      setDogrulamaMesaj(e.message || "Kod gonderilemedi");
    }
  }

  async function veliBaglan() {
    setVeliMesaj("");
    try {
      const res = await fetch("/api/veli/baglan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: baglantiKoduGir }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVeliMesaj(`${data.ogrenciAdi} adli ogrenciye baglandin.`);
      setBaglantiKoduGir("");
      const d = await fetch("/api/veli/ilerleme").then((r) => r.json());
      if (d.ogrenciler) setVeliOgrenciler(d.ogrenciler);
    } catch (e) {
      setVeliMesaj(e.message || "Baglanti kurulamadi");
    }
  }

  async function soruGorseliCoz(dosya) {
    setYukleniyor("soru"); setHata(""); setSoruCozumu(""); setSoruSohbetGecmisi([]);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result.split(",")[1]);
        r.onerror = reject;
        r.readAsDataURL(dosya);
      });
      const res = await fetch("/api/soru-coz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: dosya.type, ders, sinif, cihazId: cihazIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSoruCozumu(data.cozum);
    } catch (e) {
      setHata(temizHataMesaji(e, "Soru cozulemedi, tekrar dene."));
    } finally {
      setYukleniyor(null);
    }
  }

  async function konuAnlat() {
    if (!ders || !konu.trim()) return;
    setYukleniyor("aciklama"); setHata(""); setAciklama(""); setQuiz(null); setGonderildi(false);
    try {
      const uniteMetni = uniteSec ? ` (${uniteSec} unitesinden)` : "";
      const yasMetni = { 5: "10-11", 6: "11-12", 7: "12-13", 8: "13-14" }[sinif] || "13-14";
      const zorlukMetni = { basit: "cok basit ve yavas, temel seviyeden baslayarak", orta: "orta seviyede, ders kitabi diline uygun", zor: "ileri seviyede, LGS'de sik cikan zorlayici detaylara da deginerek" }[zorlukSec];
      const p = `Sen deneyimli, alaninda uzman bir "${ders}" ogretmenisin. "${konu}" konusunu${uniteMetni}, ${sinif}. sinifta okuyan ${yasMetni} yasindaki bir ogrenciye ${zorlukMetni} ama PROFESYONEL ve KALITELI bir dille, ozel ders yayinlarinin (MEB yayinlarindan daha ust seviye) kalitesinde anlat. ONEMLI: Konuyu OLDUGUNDAN KOLAY GOSTERME, gercek sinav zorlugunu yansit. AYNEN SU FORMATTA yaz (basliklari birebir kullan): once konunun tanimini ve neden onemli oldugunu 2-3 cumleyle ver. Sonra her alt kavram icin "Ornek:" diye etiketlenmis en az bir somut, sayisal ornek coz (adim adim). En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle (sik yapilan hatalar, ipuclari). Toplamda 350-450 kelime. SADECE duz metin yaz: markdown (yildiz **, baslik #), LaTeX (dolar isareti $, \\\\sqrt, \\\\frac gibi komutlar) KULLANMA. Matematik ifadelerini normal klavye karakterleriyle yaz (ornek: "karekok 12", "3 uzeri 2", "1/2" gibi). SADECE Turkce yaz, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan.`;
      const cevap = await aiIstek(p, 3200, cihazIdRef.current);
      const temizMetin = cevap
        .replace(/\*\*/g, "")
        .replace(/#+\s?/g, "")
        .replace(/\$\$?/g, "")
        .replace(/\\sqrt\{([^}]*)\}/g, "karekok $1")
        .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
        .replace(/\\[a-zA-Z]+/g, "")
        .replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ");
      setAciklama(temizMetin);
    } catch (e) { setHata(temizHataMesaji(e, "Anlatim alinamadi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  async function soruUret(fasikulModu) {
    if (!ders || !konu.trim()) return;
    setYukleniyor("quiz"); setHata(""); setCevaplar({}); setGonderildi(false); setParagrafMetni(""); setParagrafPufNoktalari("");
    try {
      const uniteMetni2 = uniteSec ? ` (${uniteSec} unitesinden, gercek LGS tarzinda)` : "";
      const p = fasikulModu
        ? `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni2} "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde TAM 15 coktan secmeli soru hazirla: ILK 5 SORU KOLAY, SONRAKI 5 SORU ORTA, SON 5 SORU ZOR seviyede olsun (sirali ver, kolaydan zora). ${BAGLAM_TEMELLI_SORU_TALIMATI} Bu, meshur ozel yayin kaynaklarinin (MEB yayinlarindan daha ust seviye, sik tercih edilen ek kaynaklar seviyesinde) fasikul formatinda olsun. Sorular mantik yurutme ve yorum gerektiren tarzda olsun, ezber bilgi sorma. SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Portekizce gibi bati dillerinden TEK KELIME bile kullanma:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]`
        : `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni2} "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde 5 coktan secmeli soru hazirla. ${BAGLAM_TEMELLI_SORU_TALIMATI} SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;
      const cevap = await aiIstek(p, fasikulModu ? 7000 : 3000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      const uretilenSorular = soruJsonAyikla(temiz);
      setQuiz(uretilenSorular);
      sorulariBankayaKaydet(ders, sinif, uniteSec, uretilenSorular, fasikulModu ? "fasikul" : "quiz");
    } catch (e) { setHata(temizHataMesaji(e, "Sorular uretilemedi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  const [paragrafMetni, setParagrafMetni] = useState("");
  const [paragrafPufNoktalari, setParagrafPufNoktalari] = useState("");

  async function paragrafPratigiUret() {
    if (!ders || !konu.trim()) return;
    setYukleniyor("paragraf"); setHata(""); setCevaplar({}); setGonderildi(false); setParagrafMetni(""); setParagrafPufNoktalari("");
    try {
      const uniteMetni3 = uniteSec ? ` (${uniteSec} unitesinden)` : "";
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni3} "${konu}" konusuyla ilgili once orta uzunlukta (120-180 kelime) bir metin/paragraf yaz, sonra bu metne dayali 20 coktan secmeli soru hazirla (${sinif}. sinif seviyesinde, kolaydan zora dogru sirali). ${BAGLAM_TEMELLI_SORU_TALIMATI} Son olarak bu konuyla ilgili 3-5 maddelik kisa "puf noktalari / altin kurallar" listesi ekle (formul, dikkat edilecek nokta, sik yapilan hatalar gibi). Sorular okudugunu anlama, yorumlama ve dikkat gerektirsin. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Portekizce gibi bati dillerinden TEK KELIME bile kullanma. SADECE JSON dondur, baska hicbir aciklama ekleme, markdown kullanma:
{"metin":"...","pufNoktalari":["...","..."],"sorular":[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]}`;
      const cevap = await aiIstek(p, 8000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      const baslangic = temiz.indexOf("{");
      const bitis = temiz.lastIndexOf("}");
      if (baslangic === -1 || bitis === -1) throw new Error("Paragraf pratigi olusturulamadi, tekrar dene");
      const veri = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setParagrafMetni(veri.metin || "");
      setParagrafPufNoktalari((veri.pufNoktalari || []).join("\n"));
      setQuiz(veri.sorular || []);
      sorulariBankayaKaydet(ders, sinif, uniteSec, veri.sorular, "paragraf");
    } catch (e) { setHata(temizHataMesaji(e, "Paragraf pratigi olusturulamadi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  async function planOlustur() {
    if (zayifDersler.length === 0) return;
    setYukleniyor("plan"); setHata(""); setPlan(""); setHaftalikGorevListesi(null);
    try {
      const ogrenciAdi = hesap?.ad ? hesap.ad.split(" ")[0] : null;
      const ilerlemeOzeti = zayifDersler.map((d) => {
        const tamamlanan = (tamamlananUniteler[d] || []).length;
        const toplam = dersinUniteleri(d, sinif).length;
        return toplam > 0 ? `${d}: ${tamamlanan}/${toplam} unite tamamlanmis` : null;
      }).filter(Boolean).join(", ");
      const kisiselBaglam = [
        ogrenciAdi ? `Ogrencinin adi ${ogrenciAdi}, ona ismiyle hitap et.` : "",
        ilerlemeOzeti ? `Guncel ilerlemesi: ${ilerlemeOzeti}. Bu gercek veriyi dikkate alarak konus.` : "",
      ].filter(Boolean).join(" ");
      const p = `Sen bir LGS calisma kocususun - samimi bir MENTOR gibi konus. ${kisiselBaglam} Zayif dersler: ${zayifDersler.join(", ")}. Haftalik ${haftalikSaat} saat, sinava ${kalanHafta} hafta kaldi. Iki parca uret: (1) "mesaj": ogrenciye sicak, kisa (150-200 kelime) bir konusma metni - programi ozetle, plato/basari notunu ekle. (2) "program": Pazartesi'den Pazar'a kadar HER GUN icin bir gorev nesnesi (bos gunler icin de "Dinlenme" gibi bir ders yaz) - {"gun":"Pazartesi","ders":"Matematik","gorev":"Kisa, somut, TEK CUMLELIK gorev tanimi"}. SADECE su JSON formatinda don, baska aciklama ekleme, markdown kullanma:
{"mesaj":"...","program":[{"gun":"Pazartesi","ders":"...","gorev":"..."},{"gun":"Sali","ders":"...","gorev":"..."},{"gun":"Carsamba","ders":"...","gorev":"..."},{"gun":"Persembe","ders":"...","gorev":"..."},{"gun":"Cuma","ders":"...","gorev":"..."},{"gun":"Cumartesi","ders":"...","gorev":"..."},{"gun":"Pazar","ders":"...","gorev":"..."}]}`;
      const cevap = await aiIstek(p, 2200, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").trim();
      const baslangic = temiz.indexOf("{");
      const bitis = temiz.lastIndexOf("}");
      if (baslangic === -1 || bitis === -1) throw new Error("Plan olusturulamadi, tekrar dene");
      const veri = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setPlan(veri.mesaj || "");
      if (Array.isArray(veri.program) && veri.program.length > 0) {
        setHaftalikGorevListesi(veri.program);
        const bugununPazartesiTarihi = (() => {
          const d = new Date();
          const gun = d.getDay() === 0 ? 7 : d.getDay(); // Pazartesi=1..Pazar=7
          d.setDate(d.getDate() - (gun - 1));
          return d.toISOString().slice(0, 10);
        })();
        fetch("/api/gunluk-gorevler", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cihazId: cihazIdRef.current, haftaBaslangic: bugununPazartesiTarihi, gorevler: veri.program }),
        }).catch(() => {});
      }
    } catch (e) { setHata(temizHataMesaji(e, "Plan olusturulamadi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  const [sinavKapsamMetni, setSinavKapsamMetni] = useState("");
  const [sinavKayitTuru, setSinavKayitTuru] = useState("");

  async function sinavOlustur(sinavTuru) { // "yazili" | "deneme"
    if (!denemeDers) return;
    setYukleniyor(sinavTuru); setHata(""); setDenemeCevaplar({}); setDenemeGonderildi(false); setDenemeSorulari(null); setDenemeBelgesi(null);
    try {
      const tumUniteler = dersinUniteleri(denemeDers, sinif);
      let kapsamUniteler = tumUniteler;
      let kapsamAciklama = "";
      let kayitTuru = sinavTuru;

      if (kapsamTuru === "konu") {
        kapsamUniteler = kapsamUnite ? [kapsamUnite] : [];
        if (kapsamAltBasliklar.length > 0) {
          kapsamAciklama = `SADECE "${kapsamUnite}" unitesinin su alt basliklarindan sorular hazirla: ${kapsamAltBasliklar.join(", ")}. Baska alt basliklardan soru sorma.`;
        } else {
          kapsamAciklama = kapsamKonu.trim()
            ? `SADECE "${kapsamUnite}" unitesindeki "${kapsamKonu.trim()}" konusundan sorular hazirla.`
            : `SADECE "${kapsamUnite || "(ders geneli)"}" unitesinden sorular hazirla.`;
        }
        kayitTuru = `${sinavTuru}_konu`;
      } else if (kapsamTuru === "unite") {
        kapsamUniteler = kapsamUnite ? [kapsamUnite] : [];
        kapsamAciklama = `SADECE "${kapsamUnite || "(ders geneli)"}" unitesinden, unitenin TAMAMINI kapsayacak sekilde sorular hazirla.`;
        kayitTuru = `${sinavTuru}_unite`;
      } else { // donem
        if (sinavTuru === "yazili") {
          kapsamUniteler = denemeKapsamiHesapla(denemeDers, yaziliDonemNo, sinif);
          kayitTuru = yaziliDonemNo;
        } else {
          if (denemeDonemNo === "tam") { kapsamUniteler = tumUniteler; kayitTuru = "deneme_tam"; }
          else {
            const yari = Math.ceil(tumUniteler.length / 2);
            kapsamUniteler = denemeDonemNo === "1" ? tumUniteler.slice(0, yari) : tumUniteler.slice(yari);
            kayitTuru = `deneme_donem${denemeDonemNo}`;
          }
        }
        kapsamAciklama = kapsamUniteler.length
          ? `Bu sinavin kapsayacagi uniteler: ${kapsamUniteler.join(", ")}. Sorulari SADECE bu unitelerden hazirla, kapsam disina cikma.`
          : "";
      }

      const baslikMetni = sinavTuru === "yazili"
        ? `okul donem ici YAZILI SINAVI formatinda (sinirli kapsamli, ${{ yazili1: "1. Yazili", yazili2: "2. Yazili", yazili3: "3. Yazili" }[yaziliDonemNo] || ""})`
        : "gercek LGS DENEME SINAVI formatinda";

      const p = `Sen bir LGS/ortaokul olcme-degerlendirme uzmanisin. "${denemeDers}" dersi icin ${baslikMetni} hazirla, ${sinif}. sinif seviyesinde, toplam ${sinavSoruSayisi} soru olsun. ${kapsamAciklama} Sorulari, 2022-2026 yillari arasindaki gercek sinavlarin soru tarzina, uslubuna ve zorluk seviyesine birebir benzet - ama sorularin kendisi ozgun olsun, gercek gecmis sorulari birebir kopyalama ya da "gecmis yil cikti" diye sunma. 2026 LGS onceki yillara gore belirgin sekilde daha zor ve secici geldi (uzmanlar hemfikir) - sorulari buna gore kalibre et: ezber bilgiden cok dikkat, zaman yonetimi, yorumlama ve strateji gerektiren sorular olsun, Turkce'de uzun paragraflar/celdiriciler, Matematik'te islem degil dikkat ve mantik agirlikli sorular kullan. Zorluk dagilimi GERCEK 2026 LGS oranina yakin olsun: soru sayisinin yaklasik %20'si kolay, %55'i orta, %25'i zor olsun (orn. 20 soruda ~4 kolay, ~11 orta, ~5 zor). ${BAGLAM_TEMELLI_SORU_TALIMATI} Her sorunun hangi ALT KONUYU/KAZANIMI olctugunu 2-4 kelimeyle "altKonu" alaninda belirt (orn. "Asal Carpanlar", "EBOB Hesabi" gibi kisa ve spesifik). Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle, dogru ve tutarli bir sekilde anlat. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan. SADECE JSON dondur, baska hicbir aciklama ekleme:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","altKonu":"...","aciklama":"..."}]`;
      const cevap = await aiIstek(p, Math.min(8000, 500 + sinavSoruSayisi * 480), cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      setSinavKapsamMetni(kapsamAciklama);
      setSinavKayitTuru(kayitTuru);
      const uretilenSinavSorulari = soruJsonAyikla(temiz);
      setDenemeSorulari(uretilenSinavSorulari);
      sorulariBankayaKaydet(denemeDers, sinif, kapsamUnite, uretilenSinavSorulari, sinavTuru);
      // Deneme gercek sinav kosullarini simule etsin diye kronometre baslatilir
      // (Yazili'da bu kadar kati bir zaman baskisi olmadigi icin baslatilmaz).
      if (sinavTuru === "deneme") kronometreyiBaslat(Math.round(sinavSoruSayisi * 1.5));
    } catch (e) { setHata(temizHataMesaji(e, "Sinav olusturulamadi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  const [denemeBelgesi, setDenemeBelgesi] = useState(null);
  // Gercek geri sayim kronometresi - Deneme/Bursluluk sinavlari basladiginda
  // baslar, gonderilince ya da sure dolunca durur.
  const [kronometreSaniye, setKronometreSaniye] = useState(null); // null = aktif degil
  const kronometreRef = useRef(null);
  function kronometreyiBaslat(dakika) {
    setKronometreSaniye(dakika * 60);
  }
  function kronometreyiDurdur() {
    setKronometreSaniye(null);
  }
  useEffect(() => {
    if (kronometreSaniye === null) { if (kronometreRef.current) clearInterval(kronometreRef.current); return; }
    kronometreRef.current = setInterval(() => {
      setKronometreSaniye((eski) => (eski !== null && eski > 0 ? eski - 1 : eski));
    }, 1000);
    return () => clearInterval(kronometreRef.current);
  }, [kronometreSaniye === null]);
  function sureFormatla(saniye) {
    const dk = Math.floor(saniye / 60);
    const sn = saniye % 60;
    return `${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
  }
  useEffect(() => {
    if (kronometreSaniye !== 0) return;
    if (denemeSorulari && !denemeGonderildi) denemeGonder();
    if (burslulukSorular && !burslulukGonderildi) setBurslulukGonderildi(true);
  }, [kronometreSaniye]);

  async function denemeGonder() {
    setDenemeGonderildi(true);
    kronometreyiDurdur();
    const dogru = denemeSorulari.filter((s, i) => denemeCevaplar[i] === s.dogruIndex).length;
    const bos = denemeSorulari.filter((s, i) => denemeCevaplar[i] === undefined).length;
    const yanlis = denemeSorulari.length - dogru - bos;
    const net = Math.max(0, dogru - yanlis / 3);

    const zorlukKirilim = { kolay: { dogru: 0, toplam: 0 }, orta: { dogru: 0, toplam: 0 }, zor: { dogru: 0, toplam: 0 } };
    const altKonuKirilim = {};
    denemeSorulari.forEach((s, i) => {
      const z = s.zorluk || "orta";
      if (!zorlukKirilim[z]) zorlukKirilim[z] = { dogru: 0, toplam: 0 };
      zorlukKirilim[z].toplam += 1;
      if (denemeCevaplar[i] === s.dogruIndex) zorlukKirilim[z].dogru += 1;

      if (s.altKonu) {
        if (!altKonuKirilim[s.altKonu]) altKonuKirilim[s.altKonu] = { dogru: 0, toplam: 0 };
        altKonuKirilim[s.altKonu].toplam += 1;
        if (denemeCevaplar[i] === s.dogruIndex) altKonuKirilim[s.altKonu].dogru += 1;
      }

      // Yanlis cevaplanan sorulari Hata Kitapcigi'na kaydet - boylece Koc bu
      // konulari "odev" olarak takip edebilir.
      if (denemeCevaplar[i] !== undefined && denemeCevaplar[i] !== s.dogruIndex) {
        fetch("/api/hata-kitapcigi", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cihazId: cihazIdRef.current, ders: denemeDers, altKonu: s.altKonu || null,
            soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogruIndex,
            verilenIndex: denemeCevaplar[i], aciklama: s.aciklama || null,
          }),
        }).catch(() => {});
      }
    });

    // Unite/konu kapsamli sinavlarda ders adini o unite ile zenginlestiriyoruz,
    // boylece "bu unitede kacinci test" sayaci dogru tutulur.
    const kayitDersAdi = (kapsamTuru === "unite" || kapsamTuru === "konu") && kapsamUnite
      ? `${denemeDers} · ${kapsamUnite}`
      : denemeDers;

    let oncekiNet = null;
    let testNo = 1;
    try {
      const res = await fetch("/api/sinav-sonuc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, tur: sinavKayitTuru || denemeTuru, ders: kayitDersAdi, dogru, yanlis, bos, net }),
      });
      const data = await res.json();
      if (res.ok) { oncekiNet = data.oncekiNet; testNo = data.testNo || 1; }
    } catch (e) { /* kayit basarisiz olsa da sonuc belgesini yine de goster */ }

    setDenemeBelgesi({ dogru, yanlis, bos, net, toplam: denemeSorulari.length, zorlukKirilim, altKonuKirilim, oncekiNet, testNo, kayitDersAdi });
  }

  async function seviyeTespitiYap() {
    setYukleniyor("seviye"); setHata(""); setSeviyeCevaplar({}); setSeviyeGonderildi(false); setSeviyeSorulari(null); setSeviyeRaporu(null);
    try {
      const dersListesi = gorunurDersler(sinif).map((d) => d.ad).join(", ");
      const p = `Sen bir egitim kurumunda seviye tespit sinavi hazirlayan bir olcme-degerlendirme uzmanisin. Su derslerin HER BIRINDEN 2'ser soru olmak uzere toplam 12 soruluk bir SEVIYE TESPIT SINAVI hazirla: ${dersListesi}. ${sinif}. sinif seviyesinde, her dersten 1 kolay 1 orta zorlukta soru olsun. Her sorunun hangi derse ait oldugunu "ders" alaninda MUTLAKA belirt (yukaridaki isimlerle BIREBIR ayni yaz). Sorular mantik yurutme gerektirsin, ezber bilgi sorma. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, ayrica Ingilizce/Almanca/Fransizca/Portekizce gibi baska dilden TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan. SADECE JSON dondur, baska hicbir aciklama ekleme:
[{"ders":"Matematik","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;
      const cevap = await aiIstek(p, 5000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      const seviyeSorulariUretilen = soruJsonAyikla(temiz);
      setSeviyeSorulari(seviyeSorulariUretilen);
      const dersGruplari = {};
      seviyeSorulariUretilen.forEach((s) => {
        if (!dersGruplari[s.ders]) dersGruplari[s.ders] = [];
        dersGruplari[s.ders].push(s);
      });
      Object.keys(dersGruplari).forEach((d) => sorulariBankayaKaydet(d, sinif, null, dersGruplari[d], "seviye"));
    } catch (e) { setHata(temizHataMesaji(e, "Seviye tespit sinavi olusturulamadi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  function seviyeGonder() {
    setSeviyeGonderildi(true);
    const rapor = {};
    seviyeSorulari.forEach((s, i) => {
      if (!rapor[s.ders]) rapor[s.ders] = { dogru: 0, toplam: 0 };
      rapor[s.ders].toplam += 1;
      if (seviyeCevaplar[i] === s.dogruIndex) rapor[s.ders].dogru += 1;
    });
    Object.keys(rapor).forEach((d) => {
      const oran = rapor[d].dogru / rapor[d].toplam;
      rapor[d].seviye = oran >= 0.8 ? "Ileri" : oran >= 0.5 ? "Orta" : "Baslangic";
    });
    setSeviyeRaporu(rapor);
  }

  function zayifDersleriKoclugaAktar() {
    if (!seviyeRaporu) return;
    const zayiflar = Object.keys(seviyeRaporu).filter((d) => seviyeRaporu[d].seviye !== "Ileri");
    setZayifDersler(zayiflar);
    setOtomatikTespit(true);
    setMod("kocluk");
  }

  async function premiumSatinAl(plan) {
    setOdemeHata(""); setCheckoutHtml("");
    if (!hesap) {
      setOdemeHata("Odeme yapabilmek icin once giris yapmalisin.");
      return;
    }
    try {
      const [ad, ...soyadParcalari] = (hesap.ad || "Kullanici").split(" ");
      const soyad = soyadParcalari.join(" ") || "-";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          kullanici: { ad, soyad, eposta: hesap.eposta || "", adres: "Belirtilmedi", sehir: "Belirtilmedi" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCheckoutHtml(data.checkoutFormContent);
    } catch (e) {
      setOdemeHata("Odeme baslatilamadi: " + e.message);
    }
  }

  const dogruSayisi = quiz && gonderildi ? quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length : null;

  function cevaplariGonder() {
    setGonderildi(true);
    const dogru = quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length;
    ilerlemeyiKaydet(ders, konu, dogru, quiz.length);
    yanlislariHataKitapciginaKaydet(ders, aktifAltKonu);
    if (dogru / quiz.length >= 0.7) {
      if (uniteSec && aktifAltKonu) {
        altKonuTamamlandiIsaretle(ders, uniteSec, aktifAltKonu);
      } else if (uniteSec) {
        // Alt konu listesi henuz yoksa (AI onerisi basarisiz oldu) direkt uniteyi tamamlandi say
        uniteTamamlandiIsaretle(ders, uniteSec);
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "system-ui, sans-serif", padding: "24px 14px" }}>
      <style>{`
        @keyframes kxFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes kxFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes kxShine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes kxPop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes kxLogoAcilis { 0% { opacity: 0; transform: scale(0.4) rotate(-25deg); } 60% { opacity: 1; transform: scale(1.08) rotate(4deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
        .kx-fadein { animation: kxFadeUp 0.45s ease both; }
        .kx-float { display: inline-block; animation: kxFloat 3s ease-in-out infinite; }
        .kx-pop { animation: kxPop 0.3s ease both; }
        .kx-logo-acilis { animation: kxLogoAcilis 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .kx-logo-header { transition: transform 0.2s ease; }
        .kx-logo-header:hover { transform: rotate(-8deg) scale(1.08); }
        .kx-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .kx-card:active { transform: scale(0.97); }
        .kx-btn { transition: transform 0.12s ease, box-shadow 0.15s ease, filter 0.15s ease; }
        .kx-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
        .kx-btn:active { transform: scale(0.96); }
        .kx-hero { background-size: 200% 100%; }
        .kx-hero::after { content: ""; }
      `}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, position: "relative" }}>
          <img src="/icons/icon-192.png" alt="Karemux logo" className="kx-logo-header" style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, display: "block", objectFit: "cover" }} />
          <button onClick={() => setMenuAcik((a) => !a)} style={{
            width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${COLORS.line}`, background: COLORS.page,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 18,
          }}>☰</button>
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, color: COLORS.mustard, margin: "0 0 2px", textTransform: "uppercase" }}>Karemux Egitim Sistemleri</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.bgText || COLORS.page, margin: 0 }}>5.Siniftan LGS'ye Hazirlik</h1>
          </div>
        </div>
        <p style={{ color: COLORS.bgText || "#C9D4C7", opacity: 0.75, fontSize: 13, margin: "6px 0 16px" }}>5. siniftan LGS'ye kadar tek sistem</p>

        {mod === "bos" && !secilenDers && (
          <div style={{
            background: COLORS.gradient, borderRadius: 16, padding: "28px 20px",
            border: `1px solid ${COLORS.panelBorder || COLORS.line}`, textAlign: "center", marginBottom: 16,
          }}>
            <img src="/icons/icon-192.png" alt="Karemux" className="kx-logo-acilis" style={{ width: 32, height: 32, borderRadius: 9, marginBottom: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.22)" }} />
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: COLORS.page, fontWeight: 700, fontSize: 19, marginBottom: 8 }}>Hoş geldiniz</p>
            <p style={{ color: "#B7C4BC", fontSize: 13.5, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
              Seviye tespiti, konu anlatimi, deneme/yazili sinavlari ve kisisel calisma plani — hepsi tek sistemde.
              Baslamak icin bir ders sec.
            </p>
          </div>
        )}

        {mod === "bos" && !secilenDers && (() => {
          // LGS 2027 tarihi MEB tarafindan henuz resmi olarak aciklanmadi (Agustos 2026
          // itibariyle) - geçmis yillarin duzenine gore (Haziran ayinin 2. hafta sonu)
          // TAHMINI bir tarih kullaniyoruz, kesin degil, acikca "tahmini" etiketliyoruz.
          const tahminiLgsTarihi = new Date("2027-06-13T09:30:00");
          const simdi = new Date();
          const kalanMs = tahminiLgsTarihi - simdi;
          const kalanGun = Math.max(0, Math.ceil(kalanMs / (1000 * 60 * 60 * 24)));
          if (sinif < 5 || sinif > 8 || kalanGun <= 0) return null;
          return (
            <div className="kx-fadein" style={{ background: "#1B2430", borderRadius: 14, padding: "16px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#8A968E", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, marginBottom: 3 }}>LGS 2027'YE (TAHMİNİ)</p>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Kesin tarih MEB tarafından henüz açıklanmadı</p>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0, marginLeft: 12 }}>
                <p style={{ color: COLORS.mustard, fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{kalanGun}</p>
                <p style={{ color: "#8A968E", fontSize: 10, fontWeight: 700 }}>GÜN</p>
              </div>
            </div>
          );
        })()}

        {mod === "bos" && !secilenDers && hesap && seriVeri && seriVeri.guncelSeri > 0 && (
          <div className="kx-fadein kx-pop" style={{ background: "#FEF8E8", border: `1.5px solid ${COLORS.mustard}`, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🔥</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1B2430" }}>{seriVeri.guncelSeri} gün üst üste çalıştın!</p>
              <p style={{ fontSize: 11, color: COLORS.muted }}>
                {seriVeri.enUzunSeri > seriVeri.guncelSeri ? `En uzun serin: ${seriVeri.enUzunSeri} gün — geç onu!` : "Bu senin en uzun serin, devam et!"}
              </p>
            </div>
          </div>
        )}

        {mod === "bos" && !secilenDers && hesap && tekrarSayisi > 0 && (
          <button onClick={() => { setSecilenDers(null); setMod("tekrarzamani"); }} className="kx-fadein kx-btn" style={{ width: "100%", textAlign: "left", background: "#1B2430", border: "none", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <span style={{ fontSize: 26 }}>🔁</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Bugün {tekrarSayisi} tekrar seni bekliyor</p>
              <p style={{ fontSize: 11, color: "#8A968E" }}>Unutmadan pekiştirmek için hemen bak →</p>
            </div>
          </button>
        )}

        {mod === "bos" && !secilenDers && (
          <div className="kx-fadein" style={{ marginBottom: 18 }}>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10, paddingLeft: 2 }}>Senin için hazırladıklarımız</p>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, paddingTop: 2, paddingLeft: 2, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
              {[
                { mod: "paragrafstudyo", ikon: "📝", baslik: "Paragraf Stüdyosu", alt: "LGS'nin en çok soru çıkan alanı", taban: "#F4ECD8", serit: "#8B5A2B", yazi: "#3D2B1F", cta: "8 türde pratik" },
                { mod: "puanhesap", ikon: "🧮", baslik: "Puan Hesaplayıcı", alt: "Kaç net yapman gerekiyor, hemen gör", taban: "#E4EEF2", serit: "#0B3D5C", yazi: "#0B2B3D", cta: "Hesapla" },
                { mod: "hedefokul", ikon: "🏫", baslik: "Hedef Okulum", alt: "Hayalindeki okulu belirle, ona çalış", taban: "#E7EFE7", serit: "#1F3D2E", yazi: "#1A2E22", cta: "Hedef koy" },
                { mod: "zayifharita", ikon: "🗺️", baslik: "Zayıf Konu Haritası", alt: "Nerede eksiğin var, tek bakışta gör", taban: "#F3E3E0", serit: "#B23A2E", yazi: "#5C231D", cta: "Haritanı gör" },
                { mod: "formulkart", ikon: "📐", baslik: "Formül Kartları", alt: "Sınav öncesi son dakika tekrarı", taban: "#EAE4F2", serit: "#5B3F94", yazi: "#2E2249", cta: "Karta bak" },
              ].map((k) => (
                <button key={k.mod} onClick={() => { setSecilenDers(null); setMod(k.mod); }} className="kx-btn"
                  style={{ flex: "0 0 auto", width: 172, scrollSnapAlign: "start", position: "relative", background: k.taban, borderRadius: "4px 14px 14px 4px", padding: "18px 16px 16px 18px", textAlign: "left", border: "none", cursor: "pointer", boxShadow: "0 3px 10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 5, background: k.serit }} />
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>{k.ikon}</div>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: k.yazi, fontWeight: 700, fontSize: 14, marginBottom: 5, lineHeight: 1.25 }}>{k.baslik}</p>
                  <p style={{ color: k.yazi, opacity: 0.7, fontSize: 10.5, lineHeight: 1.45, marginBottom: 12, minHeight: 30 }}>{k.alt}</p>
                  <p style={{ color: k.serit, fontWeight: 800, fontSize: 10.5, letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 4 }}>{k.cta} <span style={{ fontSize: 12 }}>→</span></p>
                </button>
              ))}
            </div>
          </div>
        )}

        {mod === "bos" && !secilenDers && (
          <div className="kx-fadein" style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10, paddingLeft: 2 }}>Dersini seç</p>
            <div className="kx-pop" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
              {gorunurDersler(sinif).map((d) => (
                <button key={d.ad} onClick={() => { setSecilenDers(d.ad); setMod("ders"); }} className="kx-card kx-btn" style={{
                  position: "relative", padding: "18px 8px 14px", borderRadius: "4px 12px 12px 4px", cursor: "pointer", textAlign: "center",
                  border: "none", background: COLORS.page, overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: COLORS.gradient }} />
                  <div style={{ fontSize: 22, marginBottom: 7 }}>{d.emoji}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.25 }}>{d.ad}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {mod === "bos" && !secilenDers && (
          <div style={{
            background: COLORS.page, borderRadius: 14, padding: "18px 20px", marginBottom: 16,
            border: `1.5px solid ${COLORS.mustard}`, minHeight: 90, position: "relative", overflow: "hidden",
          }}>
            <div key={duyuruIndex} style={{
              display: "flex", alignItems: "center", gap: 12,
              animation: "duyuruFadeIn 0.6s ease",
            }}>
              <div style={{ fontSize: 30, flexShrink: 0 }}>{DUYURULAR[duyuruIndex].ikon}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink, margin: "0 0 3px" }}>{DUYURULAR[duyuruIndex].baslik}</p>
                <p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>{DUYURULAR[duyuruIndex].metin}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 12 }}>
              {DUYURULAR.map((_, i) => (
                <div key={i} onClick={() => setDuyuruIndex(i)} style={{
                  width: i === duyuruIndex ? 16 : 6, height: 6, borderRadius: 999, cursor: "pointer",
                  background: i === duyuruIndex ? COLORS.coral : COLORS.line, transition: "width 0.3s ease",
                }} />
              ))}
            </div>
            <style>{`@keyframes duyuruFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        )}

        {menuAcik && (
          <>
            <div onClick={() => setMenuAcik(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
            <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 260, background: COLORS.bg, borderRight: `1px solid ${COLORS.panelBorder || COLORS.line}`, zIndex: 50, padding: "20px 14px", overflowY: "auto", boxShadow: "4px 0 20px rgba(0,0,0,0.3)" }}>
              <button onClick={() => { setSecilenDers(null); setMod("bos"); setMenuAcik(false); }} style={{
                display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 14, borderRadius: 8,
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
                background: !secilenDers && mod === "bos" ? COLORS.page : "transparent", color: !secilenDers && mod === "bos" ? COLORS.ink : (COLORS.bgText ? COLORS.bgText + "99" : "#C9D4C7"),
              }}>🏠 Ana Sayfa</button>

              <p style={{ color: COLORS.bgText || COLORS.page, fontWeight: 700, fontSize: 15, marginBottom: 2 }}>📚 Ders Çalışma Odası</p>
              <p style={{ color: COLORS.bgText ? COLORS.bgText + "80" : "#8A968E", fontSize: 10.5, marginBottom: 10 }}>Konu anlat, test coz - asil calisma burada</p>
              {gorunurDersler(sinif).map((d) => (
                <button key={d.ad} onClick={() => { setSecilenDers(d.ad); setMod("ders"); setMenuAcik(false); }} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 4, borderRadius: 8,
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: secilenDers === d.ad ? 700 : 500,
                  background: secilenDers === d.ad ? COLORS.page : "transparent", color: secilenDers === d.ad ? COLORS.ink : (COLORS.bgText ? COLORS.bgText + "99" : "#C9D4C7"),
                }}>{d.emoji} {d.ad}</button>
              ))}

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              <p style={{ color: COLORS.bgText ? COLORS.bgText + "80" : "#8A968E", fontSize: 10.5, marginBottom: 4 }}>Karne, rapor, gecmis - sadece bakilir</p>
              <button onClick={() => { setSecilenDers(null); setMod("kocpanel"); setMenuAcik(false); }} style={{
                display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 4, borderRadius: 8,
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: mod === "kocpanel" ? 700 : 500,
                background: mod === "kocpanel" ? COLORS.page : "transparent", color: mod === "kocpanel" ? COLORS.ink : (COLORS.bgText ? COLORS.bgText + "99" : "#C9D4C7"),
              }}>🎯 Koc Paneli (Rapor)</button>

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              <p style={{ color: COLORS.bgText ? COLORS.bgText + "80" : "#8A968E", fontSize: 10.5, marginBottom: 4 }}>Okul/LGS sinavina hazirlik testleri</p>
              {[
                ["yazili", "✏️ Yazili Hazirligi"],
                ["deneme", "📝 Deneme Sinavi"],
              ].map(([k, etiket]) => (
                <button key={k} onClick={() => { setSecilenDers(null); setMod(k); setMenuAcik(false); }} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 4, borderRadius: 8,
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: mod === k ? 700 : 500,
                  background: mod === k ? COLORS.page : "transparent", color: mod === k ? COLORS.ink : (COLORS.bgText ? COLORS.bgText + "99" : "#C9D4C7"),
                }}>{etiket}</button>
              ))}

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              <p style={{ color: COLORS.bgText ? COLORS.bgText + "80" : "#8A968E", fontSize: 10.5, marginBottom: 4 }}>Rehberlik</p>
              {[
                ["formulkart", "📐 Formul ve Kural Kartlari"],
                ["sinavstratejisi", "🎯 Sinav Stratejisi Rehberi"],
                ["zayifharita", "🗺️ Zayif Konu Haritasi"],
                ["sinavkaygisi", "🧘 Sinav Kaygisi Destegi"],
                ["hedefokul", "🏫 Hedef Okulum"],
                ["paragrafstudyo", "📝 Paragraf Studyosu"],
                ["burslulukdeneme", "🎓 Bursluluk Sinavi (IOKBS)"],
                ["tatilprogrami", "🏖️ Tatil Calisma Programi"],
                ["basarilarim", "🏅 Basarilarim"],
                ["tekrarzamani", "🔁 Bugun Tekrar Zamani"],
                ["kelimekartlari", "🗂️ Kelime Kartlari"],
                ["kurumpaneli", "🏢 Kurum Paneli"],
                ["ulusaldeneme", "🇹🇷 Turkiye Geneli Deneme"],
                ["velipaneli", "👪 Veli Paneli"],
              ].map(([k, etiket]) => (
                <button key={k} onClick={() => { setSecilenDers(null); setMod(k); setMenuAcik(false); }} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 4, borderRadius: 8,
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: mod === k ? 700 : 500,
                  background: mod === k ? COLORS.page : "transparent", color: mod === k ? COLORS.ink : (COLORS.bgText ? COLORS.bgText + "99" : "#C9D4C7"),
                }}>{etiket}</button>
              ))}

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              <p style={{ color: COLORS.bgText ? COLORS.bgText + "80" : "#8A968E", fontSize: 10.5, marginBottom: 4 }}>Ek araclar</p>
              {[
                ["sorucoz", "📷 Soru Coz (Fotograf)"],
                ["kocluk", "📅 Haftalik Calisma Plani"],
                ["puanhesap", "🧮 LGS Puan Hesaplayici"],
              ].map(([k, etiket]) => (
                <button key={k} onClick={() => { setSecilenDers(null); setMod(k); setMenuAcik(false); }} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 4, borderRadius: 8,
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: mod === k ? 700 : 500,
                  background: mod === k ? COLORS.page : "transparent", color: mod === k ? COLORS.ink : (COLORS.bgText ? COLORS.bgText + "99" : "#C9D4C7"),
                }}>{etiket}</button>
              ))}

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              {[
                ["premium", "💳 Premium"],
              ].map(([k, etiket]) => (
                <button key={k} onClick={() => { setSecilenDers(null); setMod(k); setMenuAcik(false); }} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 4, borderRadius: 8,
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: mod === k ? 700 : 500,
                  background: mod === k ? COLORS.page : "transparent", color: mod === k ? COLORS.ink : (COLORS.bgText ? COLORS.bgText + "99" : "#C9D4C7"),
                }}>{etiket}</button>
              ))}

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              <button onClick={() => { setSecilenDers(null); setMod("hesap"); setMenuAcik(false); }} style={{
                display: "block", width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: 8,
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: mod === "hesap" ? 700 : 500,
                background: mod === "hesap" ? COLORS.page : "transparent", color: mod === "hesap" ? COLORS.ink : (COLORS.bgText ? COLORS.bgText + "99" : "#C9D4C7"),
              }}>{hesap ? `👤 ${hesap.ad} (${hesap.rol === "veli" ? "Veli" : "Ogrenci"})` : "👤 Giris / Kayit"}</button>

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              <p style={{ color: COLORS.bgText || COLORS.page, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Tema</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {Object.keys(TEMALAR).map((t) => (
                  <button key={t} onClick={() => temaDegistir(t)} style={{
                    padding: "10px 6px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                    border: `2px solid ${tema === t ? TEMALAR[t].mustard : "transparent"}`,
                    background: TEMALAR[t].gradient, color: TEMALAR[t].page, fontSize: 11, fontWeight: 700,
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 3 }}>{TEMALAR[t].ikon}</div>
                    {TEMALAR[t].isim}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {hata && (
          <div className="kx-fadein" style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF1EF", border: "1.5px solid #FF6B5E", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <p style={{ color: "#B23A2E", fontSize: 13, fontWeight: 600, margin: 0 }}>{hata}</p>
          </div>
        )}

        {mod === "kocpanel" && !kocPaneliDers && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, textAlign: "center" }}>🎯 Koc Paneli</p>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 18, textAlign: "center" }}>
              Hangi ders icin koclugunu gormek istiyorsun? (Bu bolumu ayrica daha detayli tasarlayacagiz.)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {gorunurDersler(sinif).map((d) => (
                <button key={d.ad} onClick={() => setKocPaneliDers(d.ad)} style={{
                  padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.line}`, background: "#FAF6EE",
                  fontWeight: 600, fontSize: 13, cursor: "pointer", color: "#1B2430",
                }}>{d.emoji} {d.ad}</button>
              ))}
            </div>
          </div>
        )}

        {mod === "kocpanel" && kocPaneliDers && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 14, textAlign: "center" }}>{kocPaneliDers}</p>

            {gecenYilGecmisYukleniyor && (
              <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center" }}>Geçmiş kontrol ediliyor...</p>
            )}

            {gecenYilTamamlandiMi === false && !gecenYilGecmisYukleniyor && !gecenYilSorulari && !gecenYilRaporu && (
              <div style={{ background: "#FFF8E8", borderRadius: 12, padding: 18, textAlign: "center", border: `1.5px solid ${COLORS.mustard}` }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>📊 Önce Genel Değerlendirme</p>
                <p style={{ fontSize: 13, color: "#6B7566", marginBottom: 14 }}>
                  {kocPaneliDers} için ilk kez buradasın. {Math.max(1, sinif - 1)}. sınıftan gerçek temelinin ne kadar sağlam olduğunu ölçelim,
                  sonra {sinif}. sınıf takibine geçeriz. (Bu, AI tarafından oluşturulan genel bir değerlendirmedir, resmi MEB sınavı değildir.)
                </p>
                <button onClick={() => gecenYilDegerlendirmesiYap(kocPaneliDers)} disabled={gecenYilYukleniyor} style={{ padding: "11px 20px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  {gecenYilYukleniyor ? "Hazırlanıyor..." : "Genel Değerlendirmeyi Başlat"}
                </button>
              </div>
            )}

            {gecenYilSorulari && !gecenYilGonderildi && (
              <div>
                {gecenYilSorulari.map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      {s.konu && <span style={{ color: COLORS.coral, fontSize: 11 }}>{s.konu}</span>} — {i + 1}. {s.soru}
                    </div>
                    {(s.secenekler || []).map((sec, j) => (
                      <button key={j} onClick={() => setGecenYilCevaplar((c) => ({ ...c, [i]: j }))} style={{
                        display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13, cursor: "pointer",
                        border: `1.5px solid ${gecenYilCevaplar[i] === j ? COLORS.mustard : COLORS.line}`, background: gecenYilCevaplar[i] === j ? "#FEF8E8" : "#fff",
                      }}>{sec}</button>
                    ))}
                  </div>
                ))}
                <button onClick={() => gecenYilGonder(kocPaneliDers)} disabled={Object.keys(gecenYilCevaplar).length < gecenYilSorulari.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  Sonuclari Gor
                </button>
              </div>
            )}

            {gecenYilRaporu && gecenYilGonderildi && (
              <div style={{ background: "#EAF7EE", borderRadius: 10, padding: 16, textAlign: "center", marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Genel Değerlendirme Sonucu</p>
                <p style={{ fontSize: 13 }}>Önceki sınıf temelin: <strong>{gecenYilRaporu.seviye}</strong> ({gecenYilRaporu.dogru}/{gecenYilRaporu.toplam})</p>
                <p style={{ fontSize: 12, color: "#6B7566", marginTop: 8 }}>Simdi {sinif}. sinif takibine geciyoruz.</p>
              </div>
            )}

            {gecenYilTamamlandiMi === true && (
              <>
                {gecenYilRaporu && (
                  <div style={{ background: gecenYilRaporu.seviye === "Zayif" ? "#FFF1EF" : "#EAF7EE", borderRadius: 8, padding: 10, marginBottom: 16, textAlign: "center" }}>
                    <p style={{ fontSize: 11.5, color: "#1B2430" }}>
                      📊 {Math.max(1, sinif - 1)}. sinif temeli: <strong>{gecenYilRaporu.seviye}</strong>
                      {gecenYilRaporu.seviye === "Zayif" && " — konu tekrari icin Dersler'den bu dersi sec"}
                    </p>
                  </div>
                )}

            {dersSeviyeGecmisYukleniyor && (
              <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center" }}>Geçmiş kontrol ediliyor...</p>
            )}

            {!dersSeviyeGecmisYukleniyor && !dersSeviyeSorulari && !dersSeviyeRaporu && (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 14 }}>
                  Once seviyeni belirleyelim — {kocPaneliDers} dersinin tumune yayilan 10 soruluk bir sinav.
                </p>
                <button onClick={() => dersSeviyeTespitiYap(kocPaneliDers)} disabled={dersSeviyeYukleniyor} style={{ padding: "11px 20px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  {dersSeviyeYukleniyor ? "Hazirlaniyor..." : `🧭 ${kocPaneliDers} Seviyeni Belirle`}
                </button>
              </div>
            )}

            {dersSeviyeSorulari && !dersSeviyeGonderildi && (
              <div>
                {dersSeviyeSorulari.map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: COLORS.coral, fontSize: 11 }}>{s.unite}</span> — {i + 1}. {s.soru}
                    </div>
                    {(s.secenekler || []).map((sec, j) => (
                      <button key={j} onClick={() => setDersSeviyeCevaplar((c) => ({ ...c, [i]: j }))} style={{
                        display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13, cursor: "pointer",
                        border: `1.5px solid ${dersSeviyeCevaplar[i] === j ? COLORS.mustard : COLORS.line}`, background: dersSeviyeCevaplar[i] === j ? "#FEF8E8" : "#fff",
                      }}>{sec}</button>
                    ))}
                  </div>
                ))}
                <button onClick={() => dersSeviyeGonder(kocPaneliDers)} disabled={Object.keys(dersSeviyeCevaplar).length < dersSeviyeSorulari.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  Sonuclari Gor
                </button>
              </div>
            )}

            {dersSeviyeRaporu && !dersSeviyeGecmisYukleniyor && (dersSeviyeGonderildi || !dersSeviyeSorulari) && (
              <div>
                {!dersSeviyeGonderildi && donemGuncellemesiZamaniGeldiMi(dersSeviyeSonTarih) && (
                  <div style={{ background: "#FFF8E8", border: `1px solid ${COLORS.mustard}`, borderRadius: 8, padding: 12, marginBottom: 14, textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📅 Donem seviye guncellemesi zamani geldi</p>
                    <button onClick={() => dersSeviyeTespitiYap(kocPaneliDers)} disabled={dersSeviyeYukleniyor} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      {dersSeviyeYukleniyor ? "Hazirlaniyor..." : "Yeniden Degerlendir"}
                    </button>
                  </div>
                )}
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, textAlign: "center" }}>{kocPaneliDers} Seviye Raporun</p>
                {dersSeviyeSonTarih && (
                  <p style={{ fontSize: 11, color: COLORS.muted, textAlign: "center", marginBottom: 10 }}>
                    Son guncelleme: {new Date(dersSeviyeSonTarih).toLocaleDateString("tr-TR")}
                  </p>
                )}
                {Object.keys(dersSeviyeRaporu).map((u) => {
                  const r = dersSeviyeRaporu[u];
                  const renk = r.seviye === "Ileri" ? RENK_BASARI : r.seviye === "Orta" ? "#B8860B" : COLORS.coral;
                  return (
                    <div key={u} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.line}` }}>
                      <span style={{ fontSize: 13 }}>{u}{r.degerlendirmeSayisi > 1 && <span style={{ fontSize: 10, color: COLORS.muted }}> ({r.degerlendirmeSayisi} degerlendirme ort.)</span>}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: renk }}>{r.seviye} ({r.dogru}/{r.toplam})</span>
                    </div>
                  );
                })}
                <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, textAlign: "center" }}>
                  🎯 Koc bu sonuca gore senin icin ozel bir calisma sirasi belirledi, asagida gorebilirsin.
                </p>
                {!donemGuncellemesiZamaniGeldiMi(dersSeviyeSonTarih) && dersSeviyeSonTarih && (
                  <p style={{ fontSize: 11, color: COLORS.muted, textAlign: "center", marginTop: 8 }}>
                    Sonraki degerlendirme: {new Date(new Date(dersSeviyeSonTarih).getTime() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString("tr-TR")}
                    <br />(Guvenilir bir seviye olcumu icin sik tekrar onerilmez.)
                  </p>
                )}
              </div>
            )}

            {dersSeviyeRaporu && (() => {
              const tumUniteler = dersinUniteleri(kocPaneliDers, sinif);
              const tamamlanan = tamamlananUniteler[kocPaneliDers] || [];
              const onerilenUnite = tumUniteler.find((u) => !tamamlanan.includes(u));
              if (!onerilenUnite) {
                return (
                  <div style={{ background: "#EAF7EE", borderRadius: 10, padding: 14, marginTop: 16, textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#2E7D4F" }}>🎉 Tum uniteleri tamamladin!</p>
                  </div>
                );
              }
              return (
                <div style={{ background: COLORS.gradient, borderRadius: 10, padding: 16, marginTop: 16, textAlign: "center" }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.mustard, letterSpacing: 1, marginBottom: 4 }}>🎯 KOC ONERISI</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.page, marginBottom: 8 }}>Şimdi buna odaklan: {onerilenUnite}</p>
                  {gecenYilRaporu && gecenYilRaporu.seviye === "Zayif" && (
                    <p style={{ fontSize: 11.5, color: "#FFD5D0", marginBottom: 10 }}>
                      ⚠ Onceki sinif temelin zayif gorunuyor, konu anlatimi bunu dikkate alacak.
                    </p>
                  )}
                  <button onClick={() => { setSecilenDers(kocPaneliDers); setMod("ders"); setMenuAcik(false); }} style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    📚 Derslere Git ve Calis
                  </button>
                </div>
              );
            })()}

            <div style={{ marginTop: 16, borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
              <button onClick={() => hataKitapciginiGetir(kocPaneliDers)} disabled={hataKitapcigiYukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {hataKitapcigiYukleniyor ? "Yukleniyor..." : "📕 Hata Kitapcigim"}
              </button>

              {hataKitapcigiAcik && hataKitapcigi && (
                <div style={{ background: "#FAF6EE", borderRadius: 10, padding: 16, marginTop: 12, border: `1px solid ${COLORS.line}` }}>
                  {hataKitapcigi.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#6B7566", textAlign: "center" }}>Henuz kayitli yanlisin yok - guzel gidiyor!</p>
                  ) : (
                    <>
                      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#1B2430" }}>{hataKitapcigi.length} kayitli yanlis</p>
                      {Object.entries(hataKitapcigi.reduce((acc, k) => {
                        const key = k.alt_konu || "Genel";
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                      }, {})).map(([konu, sayi]) => (
                        <p key={konu} style={{ fontSize: 12.5, color: "#1B2430", margin: "4px 0" }}>⚠ {konu}: {sayi} yanlis</p>
                      ))}
                      <button onClick={() => hataKitapciginaBenzerSorularUret(kocPaneliDers)} disabled={yukleniyor} style={{ width: "100%", marginTop: 12, padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                        {yukleniyor === "quiz" ? "Hazirlaniyor..." : "🔁 Benzer Sorularla Pratik Yap"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {quiz && (
                <div style={{ background: "#FAF6EE", borderRadius: 10, padding: 16, marginTop: 12, border: `1px solid ${COLORS.line}` }}>
                  {quiz.map((s, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#1B2430" }}>{i + 1}. {s.soru}</div>
                      {(s.secenekler || []).map((sec, j) => {
                        const secili = cevaplar[i] === j, dogru = gonderildi && j === s.dogruIndex, yanlis = gonderildi && secili && j !== s.dogruIndex;
                        return (
                          <button key={j} onClick={() => !gonderildi && setCevaplar((c) => ({ ...c, [i]: j }))} style={{
                            display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13,
                            cursor: gonderildi ? "default" : "pointer",
                            border: `1.5px solid ${dogru ? RENK_BASARI : yanlis ? "#FF6B5E" : secili ? "#E8B339" : COLORS.line}`,
                            background: dogru ? "#EAF7EE" : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff", color: "#1B2430",
                          }}>{sec}</button>
                        );
                      })}
                      {gonderildi && cevaplar[i] !== s.dogruIndex && s.aciklama && (
                        <p style={{ fontSize: 12, color: "#1B2430", background: "#FFF8E8", borderRadius: 6, padding: 8, marginTop: 4, lineHeight: 1.5 }}>💡 {s.aciklama}</p>
                      )}
                    </div>
                  ))}
                  {!gonderildi ? (
                    <button onClick={() => { setGonderildi(true); yanlislariHataKitapciginaKaydet(kocPaneliDers, null); }} disabled={Object.keys(cevaplar).length < quiz.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#1B2430", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Cevaplari Gonder</button>
                  ) : (
                    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, paddingTop: 4, color: "#1B2430" }}>
                      Sonuc: {quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length} / {quiz.length} dogru
                    </div>
                  )}
                </div>
              )}
            </div>
              </>
            )}
          </div>
        )}

        {secilenDers && !kocPaneliDers && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 2, textAlign: "center" }}>{secilenDers}</p>
            <p style={{ fontSize: 11, color: COLORS.muted, textAlign: "center", marginBottom: 10, fontWeight: 600 }}>
              {sinif}. Sinif
              {(dersSecimModu === "manuel" ? manuelUnite : oneriliUniteHesapla(secilenDers)) && ` · ${dersSecimModu === "manuel" ? manuelUnite : oneriliUniteHesapla(secilenDers)}`}
              {dersSecimModu === "manuel" && manuelAltBaslik.length > 0 && ` · ${manuelAltBaslik.join(", ")}`}
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 10, color: COLORS.muted }}>{zorlukOtomatikMi ? "🤖 Zorluk (adaptif):" : "Zorluk:"}</span>
              {["basit", "orta", "zor"].map((k) => (
                <button key={k} onClick={() => { setZorlukSec(k); setZorlukOtomatikMi(false); }} style={{
                  padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, cursor: "pointer",
                  border: `1.5px solid ${zorlukSec === k ? COLORS.coral : COLORS.line}`, background: zorlukSec === k ? "#FFF1EF" : "#fff", color: COLORS.ink,
                }}>{{ basit: "Basit", orta: "Orta", zor: "Zor" }[k]}</button>
              ))}
              {!zorlukOtomatikMi && (
                <button onClick={() => setZorlukOtomatikMi(true)} title="Adaptife geri don" style={{ border: "none", background: "none", color: COLORS.coral, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>↺</button>
              )}
            </div>

            {dersTekrarKontrolYukleniyor && (
              <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center" }}>Kontrol ediliyor...</p>
            )}

            {!dersTekrarKontrolYukleniyor && dersGecenYilZayifMi === false && (() => {
              const onerilenUnite = oneriliUniteHesapla(secilenDers);
              if (!onerilenUnite) {
                return (
                  <div style={{ background: "#EAF7EE", borderRadius: 10, padding: 16, textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#2E7D4F" }}>🎉 Bu dersin tum unitelerini tamamladin!</p>
                  </div>
                );
              }
              return (
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, background: "#FAF6EE", padding: 4, borderRadius: 10 }}>
                    {[["koc", "🎯 Koc Onerisi"], ["manuel", "✋ Kendim Seceyim"]].map(([k, etiket]) => (
                      <button key={k} onClick={() => setDersSecimModu(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: dersSecimModu === k ? COLORS.ink : "transparent", color: dersSecimModu === k ? "#fff" : COLORS.muted, transition: "all 0.15s" }}>{etiket}</button>
                    ))}
                  </div>

                  {dersSecimModu === "manuel" && (
                    <div className="kx-fadein" style={{ background: COLORS.page, borderRadius: 12, padding: 14, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8, letterSpacing: 0.5 }}>ÜNİTE SEÇ</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: manuelUnite ? 14 : 0 }}>
                        {dersinUniteleri(secilenDers, sinif).map((u, idx) => {
                          const secili = manuelUnite === u;
                          return (
                            <button key={u} onClick={() => setManuelUnite(secili ? null : u)} className="kx-btn" style={{
                              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                              border: `1.5px solid ${secili ? COLORS.coral : COLORS.line}`, background: secili ? "#FFF1EF" : "#FAF6EE",
                            }}>
                              <span style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: secili ? COLORS.coral : "#fff", color: secili ? "#fff" : COLORS.muted, border: `1.5px solid ${secili ? COLORS.coral : COLORS.line}` }}>{secili ? "✓" : idx + 1}</span>
                              <span style={{ fontSize: 12, fontWeight: secili ? 700 : 500, color: COLORS.ink }}>{u}</span>
                            </button>
                          );
                        })}
                      </div>

                      {manuelUnite && (() => {
                        const altBasliklar = altKonuCache[altKonuAnahtari(secilenDers, manuelUnite)] || [];
                        if (altBasliklar.length === 0) return null;
                        return (
                          <div>
                            <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8, letterSpacing: 0.5 }}>ALT BAŞLIK SEÇ (isteğe bağlı)</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {altBasliklar.map((ab) => {
                                const secili = manuelAltBaslik.includes(ab);
                                return (
                                  <button key={ab} onClick={() => setManuelAltBaslik((eski) => secili ? eski.filter((x) => x !== ab) : [...eski, ab])} className="kx-btn" style={{
                                    display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                                    border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}`, background: secili ? "#FEF8E8" : "#FAF6EE",
                                  }}>
                                    <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: secili ? COLORS.mustard : "#fff", color: secili ? "#fff" : "transparent", border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}` }}>✓</span>
                                    <span style={{ fontSize: 12, fontWeight: secili ? 700 : 500, color: COLORS.ink }}>{ab}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {(dersSecimModu === "koc" || manuelUnite) && (
                  <div style={{ background: COLORS.gradient, borderRadius: 12, padding: 16, marginBottom: 14, textAlign: "center" }}>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.mustard, letterSpacing: 0.5, marginBottom: 4 }}>{dersSecimModu === "koc" ? "🎯 KOC ONERISI" : "✋ SECIMIN"}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.page, marginBottom: 12 }}>
                      {dersSecimModu === "koc" ? `Şimdi buna odaklan: ${onerilenUnite}` : `${manuelUnite}${manuelAltBaslik.length > 0 ? " — " + manuelAltBaslik.join(", ") : ""}`}
                    </p>
                    <div className="kx-pop" style={{ display: "flex", gap: 8 }}>
                      <button className="kx-btn" onClick={oneriliUniteAnlat} disabled={yukleniyor} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                        {yukleniyor === "aciklama" ? "Hazirlaniyor..." : "📘 Konuyu Anlat"}
                      </button>
                      <button className="kx-btn" onClick={oneriliUniteSoruCoz} disabled={yukleniyor} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1.5px solid ${COLORS.page}`, background: "transparent", color: COLORS.page, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                        {yukleniyor === "quiz" ? "Uretiliyor..." : "✍️ 5 Soru Coz"}
                      </button>
                    </div>
                  </div>
                  )}

                  {aciklama && (() => {
                    const { govde, dikkatMaddeleri } = konuMetniAyir(aciklama);
                    const bloklar = konuMetniBloklaraAyir(govde);
                    return (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ background: "#FDFBF6", borderRadius: 12, border: `1px solid ${COLORS.line}`, boxShadow: "0 3px 14px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                          <div style={{ height: 5, background: COLORS.gradient }} />
                          <div style={{ padding: "22px 20px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            {bloklar.map((b, i) => b.tur === "baslik" ? (
                              <p key={i} style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.coral, marginTop: i === 0 ? 0 : 20, marginBottom: 8, borderBottom: `2px solid ${COLORS.line}`, paddingBottom: 6 }}>{b.metin}</p>
                            ) : b.tur === "etiketli" ? (
                              <p key={i} style={{ fontSize: 14.5, lineHeight: 1.85, color: "#2A2A2A", margin: "0 0 12px" }}><span style={{ fontWeight: 700, color: COLORS.mustard, fontStyle: "italic" }}>{b.etiket}: </span>{b.metin}</p>
                            ) : (
                              <p key={i} style={{ fontSize: 14.5, lineHeight: 1.85, color: "#2A2A2A", margin: "0 0 12px" }}>{b.metin}</p>
                            ))}
                          </div>
                        </div>
                        {dikkatMaddeleri && (
                          <div style={{ background: "#E8503F", borderRadius: 10, padding: 14, marginTop: 10 }}>
                            <p style={{ color: "#fff", fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>⚠ DIKKAT EDILECEK NOKTALAR</p>
                            {dikkatMaddeleri.map((m, i) => <p key={i} style={{ color: "#fff", fontSize: 12, lineHeight: 1.6, margin: "2px 0" }}>• {m}</p>)}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {quiz && (
                    <div style={{ background: "#FAF6EE", borderRadius: 10, padding: 16, border: `1px solid ${COLORS.line}` }}>
                      {quiz.map((s, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#1B2430" }}>{i + 1}. {s.soru}</div>
                          {(s.secenekler || []).map((sec, j) => {
                            const secili = cevaplar[i] === j, dogru = gonderildi && j === s.dogruIndex, yanlis = gonderildi && secili && j !== s.dogruIndex;
                            return (
                              <button key={j} onClick={() => !gonderildi && setCevaplar((c) => ({ ...c, [i]: j }))} style={{
                                display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13,
                                cursor: gonderildi ? "default" : "pointer",
                                border: `1.5px solid ${dogru ? RENK_BASARI : yanlis ? "#FF6B5E" : secili ? "#E8B339" : COLORS.line}`,
                                background: dogru ? "#EAF7EE" : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff", color: "#1B2430",
                              }}>{sec}</button>
                            );
                          })}
                          {gonderildi && cevaplar[i] !== s.dogruIndex && s.aciklama && (
                            <p style={{ fontSize: 12, color: "#1B2430", background: "#FFF8E8", borderRadius: 6, padding: 8, marginTop: 4, lineHeight: 1.5 }}>💡 {s.aciklama}</p>
                          )}
                        </div>
                      ))}
                      {!gonderildi ? (
                        <button className="kx-btn" onClick={cevaplariGonder} disabled={Object.keys(cevaplar).length < quiz.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#1B2430", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Cevaplari Gonder</button>
                      ) : (
                        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, paddingTop: 4, color: "#1B2430" }}>
                          Sonuc: {quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length} / {quiz.length} dogru
                          {quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length / quiz.length >= 0.7 && (
                            <p style={{ fontSize: 12, color: RENK_BASARI, marginTop: 6, fontWeight: 600 }}>🎉 Basarili! Bu unite ilerlemene eklendi.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {!dersTekrarKontrolYukleniyor && dersGecenYilZayifMi === true && (() => {
              const durum = dersTekrarDurumuHesapla(secilenDers);

              if (durum.durum === "tamamlandi") {
                return (
                  <div style={{ background: "#EAF7EE", borderRadius: 10, padding: 16, textAlign: "center" }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>✅ Geçmiş Yıl Tekrarı Tamamlandı</p>
                    <p style={{ fontSize: 12.5, color: "#6B7566" }}>
                      {durum.tur}. tur testlerini gectin. Artik normal takip icin Koc Panel'den {secilenDers}'i sec.
                    </p>
                  </div>
                );
              }

              if (durum.durum === "gorusme_talebi") {
                return (
                  <div style={{ background: "#FFF1EF", borderRadius: 10, padding: 16, textAlign: "center", border: `1.5px solid ${COLORS.coral}` }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: COLORS.coral }}>🙋 Rehber Öğretmen / Koç Görüşmesi Önerilir</p>
                    <p style={{ fontSize: 12.5, color: "#6B7566", marginBottom: 14 }}>
                      Uc tur tekrar denemesine ragmen zorlaniyorsun - bu normal, bazen birebir destek gerekir.
                    </p>
                    {randevuGonderildi[secilenDers] ? (
                      <p style={{ fontSize: 13, fontWeight: 600, color: RENK_BASARI }}>✓ Talebin alindi, tercih ettigin zamana yakin bir egitmen seninle iletisime gececek.</p>
                    ) : (
                      <>
                        <p style={{ fontSize: 11.5, color: "#6B7566", marginBottom: 10, fontStyle: "italic" }}>
                          (Not: bu, gorusme icin tercih tarihi/saatini kaydeder - gercek goruntulu gorusme ozelligi ayrica eklenecek, once bir egitmen sizinle iletisime gececek.)
                        </p>
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                          <input type="date" value={randevuTarih} onChange={(e) => setRandevuTarih(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13 }} />
                          <input type="time" value={randevuSaat} onChange={(e) => setRandevuSaat(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13 }} />
                        </div>
                        <button onClick={() => randevuTalebiGonder(secilenDers)} disabled={!randevuTarih || !randevuSaat || randevuGonderiliyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                          {randevuGonderiliyor ? "Gonderiliyor..." : "Gorusme Talebi Gonder"}
                        </button>
                      </>
                    )}
                  </div>
                );
              }

              // devam ediyor
              return (
                <div>
                  <div style={{ background: "#FFF8E8", borderRadius: 10, padding: 14, marginBottom: 16, border: `1.5px solid ${COLORS.mustard}`, textAlign: "center" }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>📚 Gecmis Yil Tekrari — {durum.tur}. Tur ({durum.soruSayisi} soru/test)</p>
                    <p style={{ fontSize: 11.5, color: "#6B7566", marginBottom: 10 }}>
                      Test: {durum.testSayisi} / 3 — 3 test sonunda ortalama %60+ ile bu tur tamamlanir.
                      {durum.tur === 2 && " (1. turda yeterli basari saglanamadi, konu tekrari yenilendi, soru sayisi 10'a cikti.)"}
                      {durum.tur === 3 && " (2. turda da yeterli basari saglanamadi, son deneme: soru sayisi 15'e cikti.)"}
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => dersKonuTekrariAnlat(secilenDers)} disabled={yukleniyor} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        {yukleniyor === "aciklama" ? "Hazirlaniyor..." : "📘 Konu Tekrari"}
                      </button>
                      <button onClick={() => dersTekrarTestiUret(secilenDers)} disabled={yukleniyor} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", color: "#1B2430", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        {yukleniyor === "quiz" ? "Uretiliyor..." : "✍️ Test Ol"}
                      </button>
                    </div>
                  </div>

                  {aciklama && (() => {
                    const { govde, dikkatMaddeleri } = konuMetniAyir(aciklama);
                    const bloklar = konuMetniBloklaraAyir(govde);
                    return (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ background: "#FDFBF6", borderRadius: 12, border: `1px solid ${COLORS.line}`, boxShadow: "0 3px 14px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                          <div style={{ height: 5, background: COLORS.gradient }} />
                          <div style={{ padding: "22px 20px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            {bloklar.map((b, i) => b.tur === "baslik" ? (
                              <p key={i} style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.coral, marginTop: i === 0 ? 0 : 20, marginBottom: 8, borderBottom: `2px solid ${COLORS.line}`, paddingBottom: 6 }}>{b.metin}</p>
                            ) : b.tur === "etiketli" ? (
                              <p key={i} style={{ fontSize: 14.5, lineHeight: 1.85, color: "#2A2A2A", margin: "0 0 12px" }}><span style={{ fontWeight: 700, color: COLORS.mustard, fontStyle: "italic" }}>{b.etiket}: </span>{b.metin}</p>
                            ) : (
                              <p key={i} style={{ fontSize: 14.5, lineHeight: 1.85, color: "#2A2A2A", margin: "0 0 12px" }}>{b.metin}</p>
                            ))}
                          </div>
                        </div>
                        {dikkatMaddeleri && (
                          <div style={{ background: "#E8503F", borderRadius: 10, padding: 14, marginTop: 10 }}>
                            <p style={{ color: "#fff", fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>⚠ DIKKAT EDILECEK NOKTALAR</p>
                            {dikkatMaddeleri.map((m, i) => (
                              <p key={i} style={{ color: "#fff", fontSize: 12, lineHeight: 1.6, margin: "2px 0" }}>• {m}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {quiz && (
                    <div style={{ background: "#FAF6EE", borderRadius: 10, padding: 16, border: `1px solid ${COLORS.line}` }}>
                      {quiz.map((s, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#1B2430" }}>{i + 1}. {s.soru}</div>
                          {(s.secenekler || []).map((sec, j) => {
                            const secili = cevaplar[i] === j, dogru = gonderildi && j === s.dogruIndex, yanlis = gonderildi && secili && j !== s.dogruIndex;
                            return (
                              <button key={j} onClick={() => !gonderildi && setCevaplar((c) => ({ ...c, [i]: j }))} style={{
                                display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13,
                                cursor: gonderildi ? "default" : "pointer",
                                border: `1.5px solid ${dogru ? RENK_BASARI : yanlis ? COLORS.coral : secili ? COLORS.mustard : COLORS.line}`,
                                background: dogru ? "#EAF7EE" : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff", color: "#1B2430",
                              }}>{sec}</button>
                            );
                          })}
                          {gonderildi && cevaplar[i] !== s.dogruIndex && (
                            <div style={{ marginTop: 4 }}>
                              {s.aciklama ? (
                                <p style={{ fontSize: 12, color: "#1B2430", background: "#FFF8E8", borderRadius: 6, padding: 8, marginTop: 4, lineHeight: 1.5 }}>💡 {s.aciklama}</p>
                              ) : !soruAciklamalari[i] ? (
                                <button onClick={() => soruAciklamasiGetir(i, s.soru, s.secenekler, s.dogruIndex, cevaplar[i])} disabled={soruAciklamaYukleniyor === i} style={{ border: "none", background: "none", color: COLORS.coral, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                                  {soruAciklamaYukleniyor === i ? "Aciklaniyor..." : "💡 Neden? (aciklama al)"}
                                </button>
                              ) : (
                                <p style={{ fontSize: 12, color: "#1B2430", background: "#FFF8E8", borderRadius: 6, padding: 8, marginTop: 4, lineHeight: 1.5 }}>{soruAciklamalari[i]}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {!gonderildi ? (
                        <button onClick={() => dersTekrarTestiGonder(secilenDers)} disabled={Object.keys(cevaplar).length < quiz.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#1B2430", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Cevaplari Gonder</button>
                      ) : (
                        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, paddingTop: 4, color: "#1B2430" }}>
                          Sonuc: {quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length} / {quiz.length} dogru
                          <p style={{ fontSize: 12, color: RENK_BASARI, marginTop: 6, fontWeight: 600 }}>✓ Kaydedildi ({durum.testSayisi + 1}/3, {durum.tur}. tur)</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}


        {mod === "seviye" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
              6 dersin hepsinden 2'ser soru (toplam 12) — nerede guclu, nerede zayif oldugunu gorup calisma planini ona gore kur. Tipki bir dershanenin yaptigi ilk seviye tespitine benzer.
            </p>
            {!seviyeSorulari && (
              <button onClick={seviyeTespitiYap} disabled={yukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>
                {yukleniyor === "seviye" ? "Hazirlaniyor..." : "Seviye Tespit Sinavini Baslat"}
              </button>
            )}

            {seviyeSorulari && !seviyeRaporu && (
              <div>
                {seviyeSorulari.map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: COLORS.coral, fontSize: 11 }}>{s.ders}</span> — {i + 1}. {s.soru}
                    </div>
                    {(s.secenekler || []).map((sec, j) => {
                      const secili = seviyeCevaplar[i] === j;
                      return (
                        <button key={j} onClick={() => setSeviyeCevaplar((c) => ({ ...c, [i]: j }))} style={{
                          display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13, cursor: "pointer",
                          border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}`, background: secili ? "#FEF8E8" : "#fff",
                        }}>{sec}</button>
                      );
                    })}
                  </div>
                ))}
                <button onClick={seviyeGonder} disabled={Object.keys(seviyeCevaplar).length < seviyeSorulari.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600 }}>
                  Sonuclari Gor
                </button>
              </div>
            )}

            {seviyeRaporu && (
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Seviye Raporun</p>
                {Object.keys(seviyeRaporu).map((d) => {
                  const r = seviyeRaporu[d];
                  const renk = r.seviye === "Ileri" ? RENK_BASARI : r.seviye === "Orta" ? "#B8860B" : COLORS.coral;
                  return (
                    <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.line}` }}>
                      <span style={{ fontSize: 13 }}>{d}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: renk }}>{r.seviye} ({r.dogru}/{r.toplam})</span>
                    </div>
                  );
                })}
                <button onClick={zayifDersleriKoclugaAktar} style={{ width: "100%", marginTop: 14, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>
                  Zayif Derslerimi Kocluk Planina Aktar
                </button>
              </div>
            )}
          </div>
        )}

        {mod === "yazili" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p className="kx-float" style={{ fontSize: 26, marginBottom: 4 }}>✏️</p>
              <p style={{ fontWeight: 700, fontSize: 16, color: COLORS.page, marginBottom: 4 }}>Yazılı Hazırlığı</p>
              <p style={{ fontSize: 12, color: "#B7C4BC", lineHeight: 1.5 }}>
                Okul yazılı sınavına hazırlık — kapsam seç, soru sayısını ayarla.<br/>
                <em>Sorular gerçek sınav tarzında özgün üretilir, birebir geçmiş soru değildir.</em>
              </p>
            </div>

            <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.coral, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Ders Seç</p>
                <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 700, color: COLORS.muted, background: "#F0EBDC", padding: "3px 9px", borderRadius: 999 }}>{sinif}. Sinif</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }} className="kx-pop">
                {gorunurDersler(sinif).map((d) => (
                  <button key={d.ad} onClick={() => { setDenemeDers(d.ad); setKapsamUnite(null); setDenemeSorulari(null); }} style={{
                    padding: "12px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                    border: `2px solid ${denemeDers === d.ad ? COLORS.coral : COLORS.line}`,
                    background: denemeDers === d.ad ? "#FFF1EF" : "#FAF6EE",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{d.emoji}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{d.ad}</div>
                  </button>
                ))}
              </div>
            </div>

            {denemeDers && (
              <div className="kx-fadein">
            <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.coral, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Kapsamı Belirle</p>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, background: "#FAF6EE", padding: 4, borderRadius: 10 }}>
                {[["konu", "Konu"], ["unite", "Ünite"], ["donem", "Dönem"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => { setKapsamTuru(k); setSinavSoruSayisi(onerilenSoruSayisi(k)); setDenemeSorulari(null); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: kapsamTuru === k ? COLORS.ink : "transparent", color: kapsamTuru === k ? "#fff" : COLORS.muted, transition: "all 0.15s" }}>{etiket}</button>
                ))}
              </div>

            {(kapsamTuru === "konu" || kapsamTuru === "unite") && denemeDers && dersinUniteleri(denemeDers, sinif).length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8, letterSpacing: 0.5 }}>ÜNİTE SEÇ</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {dersinUniteleri(denemeDers, sinif).map((u, idx) => {
                    const secili = kapsamUnite === u;
                    return (
                      <button key={u} onClick={() => setKapsamUnite(secili ? null : u)} className="kx-btn" style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        border: `1.5px solid ${secili ? COLORS.coral : COLORS.line}`, background: secili ? "#FFF1EF" : "#FAF6EE",
                      }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10.5, fontWeight: 700, background: secili ? COLORS.coral : "#fff", color: secili ? "#fff" : COLORS.muted, border: `1.5px solid ${secili ? COLORS.coral : COLORS.line}`,
                        }}>{secili ? "✓" : idx + 1}</span>
                        <span style={{ fontSize: 12.5, fontWeight: secili ? 700 : 500, color: COLORS.ink }}>{u}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {kapsamTuru === "konu" && kapsamUnite && (() => {
              const anahtar = altKonuAnahtari(denemeDers, kapsamUnite);
              const altBasliklar = altKonuCache[anahtar] || [];
              if (altBasliklar.length === 0) {
                return (
                  <input value={kapsamKonu} onChange={(e) => setKapsamKonu(e.target.value)} placeholder={altKonuYukleniyor ? "Alt başlıklar hazırlanıyor..." : "Alt konu (isteğe bağlı, spesifik bir başlık yaz)"} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.line}`, marginBottom: 4, fontSize: 13, background: "#FAF6EE" }} />
                );
              }
              return (
                <div style={{ marginBottom: 4 }}>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8, letterSpacing: 0.5 }}>
                    ALT BAŞLIK SEÇ (isteğe bağlı, hiç seçmezsen ünitenin tamamı kullanılır)
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {altBasliklar.map((ab) => {
                      const secili = kapsamAltBasliklar.includes(ab);
                      return (
                        <button key={ab} onClick={() => setKapsamAltBasliklar((eski) => secili ? eski.filter((x) => x !== ab) : [...eski, ab])}
                          className="kx-btn" style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                            border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}`, background: secili ? "#FEF8E8" : "#FAF6EE",
                          }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, background: secili ? COLORS.mustard : "#fff", color: secili ? "#fff" : "transparent", border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}`,
                          }}>✓</span>
                          <span style={{ fontSize: 12, fontWeight: secili ? 700 : 500, color: COLORS.ink }}>{ab}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {kapsamTuru === "donem" && (
              <div style={{ display: "flex", gap: 6 }}>
                {[["yazili1", "1. Yazılı"], ["yazili2", "2. Yazılı"], ["yazili3", "3. Yazılı"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => setYaziliDonemNo(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${yaziliDonemNo === k ? COLORS.coral : COLORS.line}`, background: yaziliDonemNo === k ? "#FFF1EF" : "#FAF6EE", color: COLORS.ink }}>{etiket}</button>
                ))}
              </div>
            )}

            {denemeDers && kapsamTuru === "donem" && dersinUniteleri(denemeDers, sinif).length > 0 && (
              <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 10, fontStyle: "italic", lineHeight: 1.5 }}>
                📋 Kapsam: {denemeKapsamiHesapla(denemeDers, yaziliDonemNo, sinif).join(", ")}
              </p>
            )}
            </div>

            <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}`, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.coral, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>3</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Soru Sayısı</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="range" min={3} max={20} value={sinavSoruSayisi} onChange={(e) => setSinavSoruSayisi(Number(e.target.value))} style={{ flex: 1, accentColor: COLORS.coral }} />
                <div style={{ width: 44, height: 34, borderRadius: 10, background: "#FAF6EE", border: `1.5px solid ${COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{sinavSoruSayisi}</div>
              </div>
            </div>

            <button className="kx-btn" onClick={() => sinavOlustur("yazili")} disabled={!denemeDers || yukleniyor} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: !denemeDers ? 0.5 : 1, boxShadow: "0 4px 14px rgba(255,107,94,0.35)" }}>
              {yukleniyor === "yazili" ? "Hazırlanıyor..." : `📝 ${sinavSoruSayisi} Soruluk Yazılı Hazırla`}
            </button>
              </div>
            )}
          </div>
        )}

        {mod === "deneme" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p className="kx-float" style={{ fontSize: 26, marginBottom: 4 }}>📝</p>
              <p style={{ fontWeight: 700, fontSize: 16, color: COLORS.page, marginBottom: 4 }}>Deneme Sınavı</p>
              <p style={{ fontSize: 12, color: "#C9BE9E", lineHeight: 1.5 }}>
                LGS deneme sınavına hazırlık — kapsam seç, soru sayısını ayarla.<br/>
                <em>Sorular 2022-2026 gerçek LGS tarzında özgün üretilir, birebir geçmiş yıl sorusu değildir.</em>
              </p>
            </div>

            <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.mustard, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Ders Seç</p>
                <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 700, color: COLORS.muted, background: "#F0EBDC", padding: "3px 9px", borderRadius: 999 }}>{sinif}. Sinif</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }} className="kx-pop">
                {gorunurDersler(sinif).map((d) => (
                  <button key={d.ad} onClick={() => { setDenemeDers(d.ad); setKapsamUnite(null); setDenemeSorulari(null); }} style={{
                    padding: "12px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                    border: `2px solid ${denemeDers === d.ad ? COLORS.mustard : COLORS.line}`,
                    background: denemeDers === d.ad ? "#FEF8E8" : "#FAF6EE",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{d.emoji}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{d.ad}</div>
                  </button>
                ))}
              </div>
            </div>

            {denemeDers && (
              <div className="kx-fadein">
            <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.mustard, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Kapsamı Belirle</p>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, background: "#FAF6EE", padding: 4, borderRadius: 10 }}>
                {[["konu", "Konu"], ["unite", "Ünite"], ["donem", "Dönem/Tam"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => { setKapsamTuru(k); setSinavSoruSayisi(onerilenSoruSayisi(k)); setDenemeSorulari(null); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: kapsamTuru === k ? COLORS.ink : "transparent", color: kapsamTuru === k ? "#fff" : COLORS.muted }}>{etiket}</button>
                ))}
              </div>

            {(kapsamTuru === "konu" || kapsamTuru === "unite") && denemeDers && dersinUniteleri(denemeDers, sinif).length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8, letterSpacing: 0.5 }}>ÜNİTE SEÇ</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {dersinUniteleri(denemeDers, sinif).map((u, idx) => {
                    const secili = kapsamUnite === u;
                    return (
                      <button key={u} onClick={() => setKapsamUnite(secili ? null : u)} className="kx-btn" style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}`, background: secili ? "#FEF8E8" : "#FAF6EE",
                      }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10.5, fontWeight: 700, background: secili ? COLORS.mustard : "#fff", color: secili ? "#fff" : COLORS.muted, border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}`,
                        }}>{secili ? "✓" : idx + 1}</span>
                        <span style={{ fontSize: 12.5, fontWeight: secili ? 700 : 500, color: COLORS.ink }}>{u}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {kapsamTuru === "konu" && (
              <input value={kapsamKonu} onChange={(e) => setKapsamKonu(e.target.value)} placeholder="Alt konu (isteğe bağlı)" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 13, background: "#FAF6EE" }} />
            )}
            {kapsamTuru === "donem" && (
              <div style={{ display: "flex", gap: 6 }}>
                {[["1", "1. Dönem"], ["2", "2. Dönem"], ["tam", "Tam Yıl"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => setDenemeDonemNo(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${denemeDonemNo === k ? COLORS.mustard : COLORS.line}`, background: denemeDonemNo === k ? "#FEF8E8" : "#FAF6EE", color: COLORS.ink }}>{etiket}</button>
                ))}
              </div>
            )}
            </div>

            <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}`, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.mustard, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>3</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Soru Sayısı</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="range" min={3} max={20} value={sinavSoruSayisi} onChange={(e) => setSinavSoruSayisi(Number(e.target.value))} style={{ flex: 1, accentColor: COLORS.mustard }} />
                <div style={{ width: 44, height: 34, borderRadius: 10, background: "#FAF6EE", border: `1.5px solid ${COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{sinavSoruSayisi}</div>
              </div>
            </div>

            <button className="kx-btn" onClick={() => sinavOlustur("deneme")} disabled={!denemeDers || yukleniyor} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: COLORS.mustard, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: !denemeDers ? 0.5 : 1, boxShadow: "0 4px 14px rgba(232,179,57,0.4)" }}>
              {yukleniyor === "deneme" ? "Hazırlanıyor..." : `📝 ${sinavSoruSayisi} Soruluk Deneme Oluştur`}
            </button>
              </div>
            )}
          </div>
        )}

        {(mod === "yazili" || mod === "deneme") && denemeSorulari && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginTop: 12 }}>
            {sinavKapsamMetni && <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10, fontStyle: "italic" }}>{sinavKapsamMetni}</p>}
            {!denemeGonderildi && (
              <div style={{ background: "#FAF6EE", borderRadius: 10, padding: 12, marginBottom: 14, border: `1.5px dashed ${COLORS.line}`, textAlign: "center" }}>
                <label style={{ cursor: "pointer" }}>
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files[0]; if (f) optikOkumaYap(f); }} />
                  <span className="kx-btn" style={{ display: "inline-block", padding: "8px 16px", borderRadius: 8, background: COLORS.mustard, color: "#fff", fontWeight: 600, fontSize: 12 }}>
                    {optikYukleniyor ? "Okunuyor..." : "📷 Optik Okuma ile Doldur"}
                  </span>
                </label>
                <p style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 6 }}>Kagida isaretlediğin (A/B/C/D) cevapların fotoğrafını yükle, otomatik doldursun.</p>
                {optikHata && <p style={{ fontSize: 11.5, color: COLORS.coral, marginTop: 6, fontWeight: 600 }}>{optikHata}</p>}
              </div>
            )}
            {kronometreSaniye !== null && !denemeGonderildi && (
              <div style={{ position: "sticky", top: 8, zIndex: 15, display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <div style={{ background: kronometreSaniye < 60 ? "#E8503F" : "#1B2430", color: "#fff", padding: "8px 20px", borderRadius: 999, fontWeight: 800, fontSize: 15, boxShadow: "0 3px 10px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                  ⏱️ {sureFormatla(kronometreSaniye)}
                </div>
              </div>
            )}
            {denemeSorulari.map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                  {i + 1}. {s.soru}
                  {s.zorluk && (
                    <span style={{
                      marginLeft: 6, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                      background: s.zorluk === "kolay" ? "#EAF7EE" : s.zorluk === "orta" ? "#FFF8E8" : "#FFF1EF",
                      color: s.zorluk === "kolay" ? RENK_BASARI : s.zorluk === "orta" ? "#B8860B" : COLORS.coral,
                    }}>{s.zorluk}</span>
                  )}
                </div>
                {(s.secenekler || []).map((sec, j) => {
                  const secili = denemeCevaplar[i] === j;
                  const dogru = denemeGonderildi && j === s.dogruIndex;
                  const yanlis = denemeGonderildi && secili && j !== s.dogruIndex;
                  return (
                    <button key={j} onClick={() => !denemeGonderildi && setDenemeCevaplar((c) => ({ ...c, [i]: j }))} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13,
                      cursor: denemeGonderildi ? "default" : "pointer",
                      border: `1.5px solid ${dogru ? RENK_BASARI : yanlis ? COLORS.coral : secili ? COLORS.mustard : COLORS.line}`,
                      background: dogru ? "#EAF7EE" : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff",
                    }}>{sec}</button>
                  );
                })}
                {denemeGonderildi && denemeCevaplar[i] !== s.dogruIndex && s.aciklama && (
                  <p style={{ fontSize: 12, color: "#1B2430", background: "#FFF8E8", borderRadius: 6, padding: 8, marginTop: 4, lineHeight: 1.5 }}>💡 {s.aciklama}</p>
                )}
              </div>
            ))}
            {!denemeGonderildi ? (
              <button onClick={denemeGonder} disabled={Object.keys(denemeCevaplar).length < denemeSorulari.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600 }}>
                Cevaplari Gonder
              </button>
            ) : denemeBelgesi ? (
              <div className="kx-fadein" style={{ marginTop: 16 }}>
                <div style={{ background: "#FDFBF6", borderRadius: 16, border: `1px solid ${COLORS.line}`, boxShadow: "0 4px 18px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div style={{ background: COLORS.gradient, padding: "18px 20px", textAlign: "center" }}>
                    <img src="/icons/icon-192.png" alt="Karemux" style={{ width: 26, height: 26, borderRadius: 7, marginBottom: 8 }} />
                    <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.page, margin: 0 }}>📄 Sonuç Belgesi</p>
                    {denemeBelgesi.testNo > 1 && (
                      <p style={{ fontSize: 11, color: "#B7C4BC", marginTop: 4 }}>{denemeBelgesi.kayitDersAdi} — {denemeBelgesi.testNo}. Test</p>
                    )}
                  </div>

                  <div style={{ padding: "20px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                      <div style={{
                        width: 96, height: 96, borderRadius: 999, border: `6px solid ${denemeBelgesi.net >= (denemeBelgesi.dogru + denemeBelgesi.yanlis + denemeBelgesi.bos) * 0.6 ? RENK_BASARI : denemeBelgesi.net >= (denemeBelgesi.dogru + denemeBelgesi.yanlis + denemeBelgesi.bos) * 0.35 ? COLORS.mustard : COLORS.coral}`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff",
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.ink, lineHeight: 1 }}>{denemeBelgesi.net.toFixed(2)}</div>
                        <div style={{ fontSize: 9, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5 }}>NET</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 14, textAlign: "center" }}>
                      <div><div style={{ fontSize: 19, fontWeight: 700, color: RENK_BASARI }}>{denemeBelgesi.dogru}</div><div style={{ fontSize: 9.5, color: COLORS.muted, fontWeight: 600 }}>DOĞRU</div></div>
                      <div><div style={{ fontSize: 19, fontWeight: 700, color: COLORS.coral }}>{denemeBelgesi.yanlis}</div><div style={{ fontSize: 9.5, color: COLORS.muted, fontWeight: 600 }}>YANLIŞ</div></div>
                      <div><div style={{ fontSize: 19, fontWeight: 700, color: COLORS.muted }}>{denemeBelgesi.bos}</div><div style={{ fontSize: 9.5, color: COLORS.muted, fontWeight: 600 }}>BOŞ</div></div>
                    </div>
                    <p style={{ fontSize: 10.5, color: COLORS.muted, textAlign: "center", marginBottom: 16, fontStyle: "italic" }}>
                      Net = Doğru − Yanlış/3 (LGS resmi hesaplama yöntemi - 3 yanlış 1 doğruyu götürür)
                    </p>

                    {denemeBelgesi.oncekiNet != null && (
                      <div style={{
                        textAlign: "center", fontSize: 12.5, fontWeight: 700, marginBottom: 16, padding: "9px 12px", borderRadius: 10,
                        background: denemeBelgesi.net > denemeBelgesi.oncekiNet ? "#EAF7EE" : denemeBelgesi.net < denemeBelgesi.oncekiNet ? "#FFF1EF" : "#FAF6EE",
                        color: denemeBelgesi.net > denemeBelgesi.oncekiNet ? "#2E7D4F" : denemeBelgesi.net < denemeBelgesi.oncekiNet ? "#B23A2E" : COLORS.muted,
                      }}>
                        {denemeBelgesi.net > denemeBelgesi.oncekiNet ? `⬆ Bir önceki sonucuna göre ${(denemeBelgesi.net - denemeBelgesi.oncekiNet).toFixed(2)} net arttın!` :
                         denemeBelgesi.net < denemeBelgesi.oncekiNet ? `⬇ Bir önceki sonucuna göre ${(denemeBelgesi.oncekiNet - denemeBelgesi.net).toFixed(2)} net azaldı, tekrar çalış.` :
                         "Bir önceki sonucunla aynı nettesin."}
                      </div>
                    )}

                    <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
                      <p style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 8 }}>ZORLUĞA GÖRE DAĞILIM</p>
                      {["kolay", "orta", "zor"].map((z) => {
                        const veri = denemeBelgesi.zorlukKirilim[z];
                        if (!veri || veri.toplam === 0) return null;
                        const yuzde = Math.round((veri.dogru / veri.toplam) * 100);
                        return (
                          <div key={z} style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3, textTransform: "capitalize" }}>
                              <span style={{ fontWeight: 600 }}>{z}</span>
                              <span style={{ color: COLORS.muted }}>{veri.dogru}/{veri.toplam}</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 999, background: "#EDE8DC", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${yuzde}%`, borderRadius: 999, background: yuzde >= 60 ? RENK_BASARI : yuzde >= 35 ? COLORS.mustard : COLORS.coral }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {denemeBelgesi.altKonuKirilim && Object.keys(denemeBelgesi.altKonuKirilim).length > 0 && (
                      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14, marginTop: 14 }}>
                        <p style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 8 }}>ALT KONU BAZLI PERFORMANS</p>
                        {Object.keys(denemeBelgesi.altKonuKirilim).map((ak) => {
                          const k = denemeBelgesi.altKonuKirilim[ak];
                          const zayifMi = k.dogru / k.toplam < 0.5;
                          return (
                            <div key={ak} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${COLORS.line}`, fontSize: 12 }}>
                              <span style={{ color: COLORS.ink }}>{zayifMi ? "⚠️ " : "✅ "}{ak}</span>
                              <span style={{ fontWeight: 700, color: zayifMi ? COLORS.coral : RENK_BASARI }}>{k.dogru}/{k.toplam}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                      <button className="kx-btn" onClick={() => {
                        setZayifDersler((l) => (l.includes(denemeDers) ? l : [...l, denemeDers]));
                        setOtomatikTespit(true);
                        setMod("kocluk");
                      }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🎯 Koçluk Planına Ekle</button>
                      <button className="kx-btn" onClick={() => window.print()} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🖨️ PDF / Yazdır</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {mod === "hesap" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            {hesap ? (
              <div>
                {hesap.rol === "ogrenci" && basariVeri && (() => {
                  const xp = Math.round((basariVeri.toplamSoru || 0) * 5 + Object.values(basariVeri.dersBazinda || {}).reduce((t, n) => t + n, 0) * 50 + (basariVeri.tamamlananSinavSayisi || 0) * 20);
                  const { mevcut } = seviyeHesapla(xp);
                  return (
                    <div className="kx-fadein" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                        <p style={{ fontSize: 20 }}>{mevcut.ikon}</p>
                        <p style={{ color: COLORS.mustard, fontSize: 12, fontWeight: 800 }}>{mevcut.ad}</p>
                        <p style={{ color: "#8A968E", fontSize: 8.5 }}>SEVİYEN</p>
                      </div>
                      <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                        <p style={{ color: "#FF6B5E", fontSize: 20, fontWeight: 900 }}>{seriVeri?.guncelSeri ?? 0}🔥</p>
                        <p style={{ color: "#8A968E", fontSize: 8.5, marginTop: 2 }}>GÜNLÜK SERİ</p>
                      </div>
                      <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                        <p style={{ color: RENK_BASARI, fontSize: 20, fontWeight: 900 }}>{basariVeri.toplamSoru || 0}</p>
                        <p style={{ color: "#8A968E", fontSize: 8.5, marginTop: 2 }}>ÇÖZÜLEN SORU</p>
                      </div>
                      <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                        <p style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>{tekrarSayisi}</p>
                        <p style={{ color: "#8A968E", fontSize: 8.5, marginTop: 2 }}>BEKLEYEN TEKRAR</p>
                      </div>
                    </div>
                  );
                })()}

                <p style={{ fontSize: 14, marginBottom: 4 }}>
                  Giris yapildi: <strong>{hesap.ad}</strong> <span style={{ color: COLORS.muted, fontSize: 12 }}>({hesap.rol === "veli" ? "veli hesabi" : "ogrenci hesabi"})</span>
                </p>

                {!hesap.eposta_dogrulandi && (
                  <div style={{ background: "#FFF8E8", border: `1px solid ${COLORS.mustard}`, borderRadius: 8, padding: 12, margin: "10px 0" }}>
                    <p style={{ fontSize: 13, marginBottom: 8 }}>E-postan henuz dogrulanmadi. Gelen kutunu kontrol et.</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={dogrulamaKoduGir} onChange={(e) => setDogrulamaKoduGir(e.target.value)} placeholder="6 haneli kod" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
                      <button onClick={dogrulaGonder} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Dogrula</button>
                    </div>
                    <button onClick={kodTekrarGonder} style={{ marginTop: 8, padding: 0, border: "none", background: "none", color: COLORS.muted, fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>Kodu tekrar gonder</button>
                    {dogrulamaMesaj && <p style={{ fontSize: 12, marginTop: 6 }}>{dogrulamaMesaj}</p>}
                  </div>
                )}

                {hesap.rol === "ogrenci" && hesap.veli_baglanti_kodu && (
                  <div style={{ background: "#EAF7EE", borderRadius: 8, padding: 12, margin: "10px 0" }}>
                    <p style={{ fontSize: 13, margin: 0 }}>
                      Veli baglanti kodun: <strong style={{ fontFamily: "monospace", fontSize: 15 }}>{hesap.veli_baglanti_kodu}</strong>
                    </p>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: "4px 0 0" }}>Bu kodu velinle paylas, ilerlemeni gorebilsin.</p>
                  </div>
                )}

                {hesap.rol === "ogrenci" && !kurumBaglandi && (
                  <div style={{ background: "#F4F0E4", borderRadius: 8, padding: 12, margin: "10px 0" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🏢 Okulunun/Dershanenin Kurum Kodu Var mı?</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={kurumBaglanKodu} onChange={(e) => setKurumBaglanKodu(e.target.value.toUpperCase())} placeholder="Kurum kodu"
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 12.5, letterSpacing: 1 }} />
                      <button className="kx-btn" onClick={kurumaOgrenciOlarakBaglan} disabled={kurumBaglaniyor || !kurumBaglanKodu.trim()}
                        style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        {kurumBaglaniyor ? "..." : "Bağlan"}
                      </button>
                    </div>
                  </div>
                )}
                {kurumBaglandi && (
                  <div style={{ background: RENK_BASARI_ACIK, borderRadius: 8, padding: 10, margin: "10px 0", textAlign: "center" }}>
                    <p style={{ fontSize: 12, color: "#2E7D4F", fontWeight: 600 }}>✓ Kuruma bağlandın</p>
                  </div>
                )}

                <div style={{ margin: "14px 0", borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>Profil Bilgilerin</p>
                    <button onClick={() => setProfilDuzenleAcik((a) => !a)} style={{ border: "none", background: "none", color: COLORS.coral, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {profilDuzenleAcik ? "Vazgec" : "Duzenle"}
                    </button>
                  </div>

                  {!profilDuzenleAcik ? (
                    <div style={{ fontSize: 13, lineHeight: 1.9 }}>
                      <p style={{ margin: 0 }}>👤 <strong>{hesap.ad}</strong></p>
                      <p style={{ margin: 0, color: COLORS.muted }}>✉️ {hesap.eposta}</p>
                      <p style={{ margin: 0, color: COLORS.muted }}>🎓 Sinif: {hesap.sinif || "Belirtilmedi"}</p>
                      <p style={{ margin: 0, color: COLORS.muted }}>🏫 Okul: {hesap.okul || "Belirtilmedi"}</p>
                      <p style={{ margin: 0, color: COLORS.muted }}>📞 Telefon: {hesap.telefon || "Belirtilmedi"}</p>
                      <p style={{ margin: 0, color: aktifAbonelik ? RENK_BASARI : COLORS.muted }}>
                        {aktifAbonelik ? `✓ Premium aktif (${aktifAbonelik.plan})` : "○ Premium yok"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <select value={profilSinifSec} onChange={(e) => setProfilSinifSec(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }}>
                        <option value="">Sınıf seç</option>
                        <option value="5">5. Sınıf</option>
                        <option value="6">6. Sınıf</option>
                        <option value="7">7. Sınıf</option>
                        <option value="8">8. Sınıf</option>
                      </select>
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        <input value={profilOkul}
                          onChange={(e) => { setProfilOkul(e.target.value); setOkulOnerileriAcik(true); }}
                          onFocus={() => setOkulOnerileriAcik(true)}
                          onBlur={() => setTimeout(() => setOkulOnerileriAcik(false), 150)}
                          placeholder="Okulun (yazmaya başla, öneriler çıksın)"
                          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
                        {okulOnerileriAcik && okulOnerileri.length > 0 && (
                          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1.5px solid ${COLORS.line}`, borderRadius: 8, marginTop: 4, maxHeight: 220, overflowY: "auto", zIndex: 20, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
                            {okulOnerileri.map((o) => (
                              <button key={o.id} onClick={() => { setProfilOkul(o.okul_adi); setOkulOnerileriAcik(false); }}
                                style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 10px", border: "none", borderBottom: `1px solid ${COLORS.line}`, background: "transparent", cursor: "pointer", fontSize: 12.5 }}>
                                <div style={{ fontWeight: 600 }}>{o.okul_adi} {!o.onaylandi && <span style={{ fontSize: 9.5, color: COLORS.mustard, fontWeight: 700 }}>🆕 yeni eklendi</span>}</div>
                                <div style={{ fontSize: 10.5, color: COLORS.muted }}>{o.il || "İl bilinmiyor"} {o.ilce ? `/ ${o.ilce}` : ""}</div>
                              </button>
                            ))}
                          </div>
                        )}
                        <p style={{ fontSize: 9.5, color: COLORS.muted, marginTop: 4 }}>Listede bulamazsan endişelenme, olduğu gibi yazabilirsin.</p>
                      </div>
                      <input value={profilTelefon} onChange={(e) => setProfilTelefon(e.target.value)} placeholder="Telefon" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                      <button onClick={profilKaydet} disabled={profilKaydediliyor} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                        {profilKaydediliyor ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                    </div>
                  )}
                  {profilMesaj && <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>{profilMesaj}</p>}
                </div>

                {hesap.rol === "ogrenci" && (
                  <div style={{ margin: "14px 0", borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Bekleyen Ödevlerin (Koç önerileri)</p>
                    {gorunurDersler(sinif).map((d) => {
                      const onerilen = oneriliUniteHesapla(d.ad);
                      if (!onerilen) return null;
                      return (
                        <div key={d.ad} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 12.5, borderBottom: `1px solid ${COLORS.line}` }}>
                          <span>{d.emoji} {d.ad}: <strong>{onerilen}</strong></span>
                          <span style={{ color: COLORS.mustard, fontWeight: 600, fontSize: 11 }}>bekliyor</span>
                        </div>
                      );
                    })}
                    {gorunurDersler(sinif).every((d) => !oneriliUniteHesapla(d.ad)) && (
                      <p style={{ fontSize: 12.5, color: COLORS.muted }}>Su an bekleyen bir odevin yok.</p>
                    )}

                    {profilGunlukGorevler && profilGunlukGorevler.length > 0 && (
                      <>
                        <p style={{ fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 6, color: COLORS.muted }}>📅 Haftalık Programından Günlük Görevler</p>
                        {profilGunlukGorevler.map((g) => (
                          <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 12.5, borderBottom: `1px solid ${COLORS.line}` }}>
                            <button onClick={() => gorevTamamlandiIsaretle(g.id)} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${COLORS.line}`, background: "#fff", cursor: "pointer", flexShrink: 0, padding: 0 }} title="Tamamlandi olarak isaretle" />
                            <span style={{ flex: 1 }}><strong>{g.gun}</strong> · {g.ders}: {g.gorev}</span>
                            <span style={{ fontSize: 9.5, color: COLORS.muted, textTransform: "uppercase" }}>{g.kaynak}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {hesap.rol === "ogrenci" && (
                  <div style={{ margin: "14px 0", borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Ders Durumların</p>
                    {gorunurDersler(sinif).map((d) => {
                      const tumUnite = dersinUniteleri(d.ad, sinif).length;
                      const tamamlanan = (tamamlananUniteler[d.ad] || []).length;
                      return (
                        <div key={d.ad} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12.5 }}>
                          <span>{d.emoji} {d.ad}</span>
                          <span style={{ color: tamamlanan > 0 ? RENK_BASARI : COLORS.muted, fontWeight: 600 }}>
                            {tumUnite > 0 ? `${tamamlanan}/${tumUnite} unite tamamlandi` : "veri yok"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {hesap.rol === "ogrenci" && netTrendVeri && netTrendVeri.length >= 2 && (() => {
                  const genislik = 280, yukseklik = 90, kenar = 10;
                  const maxNet = Math.max(...netTrendVeri.map((v) => v.net), 1);
                  const adimGenislik = (genislik - kenar * 2) / (netTrendVeri.length - 1);
                  const noktalar = netTrendVeri.map((v, i) => {
                    const x = kenar + i * adimGenislik;
                    const y = yukseklik - kenar - (v.net / maxNet) * (yukseklik - kenar * 2);
                    return { x, y, net: v.net };
                  });
                  const yol = noktalar.map((n, i) => `${i === 0 ? "M" : "L"}${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(" ");
                  return (
                    <div style={{ margin: "14px 0", borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📈 Net Trendin (Son {netTrendVeri.length} Sınav)</p>
                      <svg viewBox={`0 0 ${genislik} ${yukseklik}`} style={{ width: "100%", height: 100 }}>
                        <path d={yol} fill="none" stroke={COLORS.coral} strokeWidth="2.5" />
                        {noktalar.map((n, i) => (
                          <circle key={i} cx={n.x} cy={n.y} r="3.5" fill={COLORS.coral} />
                        ))}
                      </svg>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.muted, marginTop: 4 }}>
                        <span>İlk: {netTrendVeri[0].net.toFixed(1)} net</span>
                        <span style={{ fontWeight: 700, color: netTrendVeri[netTrendVeri.length - 1].net >= netTrendVeri[0].net ? "#2E7D4F" : COLORS.coral }}>
                          Son: {netTrendVeri[netTrendVeri.length - 1].net.toFixed(1)} net {netTrendVeri[netTrendVeri.length - 1].net >= netTrendVeri[0].net ? "↑" : "↓"}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {hesap.rol === "ogrenci" && (
                  <div style={{ margin: "14px 0", borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 700 }}>🎓 Karnem</p>
                      {!karneAcik && (
                        <button onClick={karneyiHazirla} disabled={karneYukleniyor} style={{ border: "none", background: "none", color: COLORS.coral, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          {karneYukleniyor ? "Hazirlaniyor..." : "Karneyi Goruntule"}
                        </button>
                      )}
                    </div>

                    {karneAcik && (
                      <div id="karne-yazdirilacak">
                        {karneYukleniyor ? (
                          <p style={{ fontSize: 12.5, color: COLORS.muted, textAlign: "center" }}>Sınav geçmişin analiz ediliyor...</p>
                        ) : (
                          <>
                            {karneOzet && karneOzet.length > 0 && (
                              <div style={{ marginBottom: 12 }}>
                                {karneOzet.map((o) => (
                                  <div key={o.ders} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12.5, borderBottom: `1px solid ${COLORS.line}` }}>
                                    <span style={{ fontWeight: 600 }}>{o.ders}</span>
                                    <span style={{ color: COLORS.muted }}>{o.testSayisi} test · ort. net {o.ortalamaNet} · son {o.sonNet}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {karneYorum && (
                              <div style={{ background: "#FDFBF6", borderRadius: 10, border: `1px solid ${COLORS.line}`, padding: 16, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 13.5, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                                {karneYorum}
                              </div>
                            )}
                            {karneOzet && karneOzet.length > 0 && (
                              <button onClick={() => window.print()} style={{ width: "100%", marginTop: 10, padding: "9px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                                🖨️ PDF / Yazdir
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {hesap.rol === "veli" && (
                  <div style={{ margin: "14px 0" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>OGRENCI BAGLA</label>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <input value={baglantiKoduGir} onChange={(e) => setBaglantiKoduGir(e.target.value)} placeholder="Ogrencinin baglanti kodu" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
                      <button onClick={veliBaglan} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Bagla</button>
                    </div>
                    {veliMesaj && <p style={{ fontSize: 12, marginBottom: 10 }}>{veliMesaj}</p>}

                    {veliOgrenciler.map((o, i) => (
                      <div key={i} style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 10, marginTop: 10 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{o.ogrenci.ad}</p>
                        {o.zayifDersler.length > 0 && (
                          <p style={{ fontSize: 12, color: COLORS.coral, marginBottom: 6 }}>Zayif dersler: {o.zayifDersler.join(", ")}</p>
                        )}
                        {o.gecmis.length === 0 ? (
                          <p style={{ fontSize: 12, color: COLORS.muted }}>Henuz quiz cozmemis.</p>
                        ) : (
                          o.gecmis.map((g, j) => (
                            <p key={j} style={{ fontSize: 12, margin: "2px 0" }}>
                              {g.ders} · {g.konu}: {g.dogru}/{g.toplam} dogru
                            </p>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={cikisYap} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, cursor: "pointer" }}>Çıkış Yap</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => setHesapModu("giris")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: hesapModu === "giris" ? COLORS.coral : "#fff", color: hesapModu === "giris" ? "#fff" : COLORS.ink, fontWeight: 600, cursor: "pointer" }}>Giriş Yap</button>
                  <button onClick={() => setHesapModu("kayit")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: hesapModu === "kayit" ? COLORS.coral : "#fff", color: hesapModu === "kayit" ? "#fff" : COLORS.ink, fontWeight: 600, cursor: "pointer" }}>Kayıt Ol</button>
                </div>
                {hesapModu === "kayit" && (
                  <>
                    <input value={adGir} onChange={(e) => setAdGir(e.target.value)} placeholder="Adin" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <button onClick={() => setRolSec("ogrenci")} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${rolSec === "ogrenci" ? COLORS.coral : COLORS.line}`, background: rolSec === "ogrenci" ? "#FFF1EF" : "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🎓 Öğrenciyim</button>
                      <button onClick={() => setRolSec("veli")} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${rolSec === "veli" ? COLORS.coral : COLORS.line}`, background: rolSec === "veli" ? "#FFF1EF" : "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>👪 Veliyim</button>
                    </div>
                  </>
                )}
                <input value={epostaGir} onChange={(e) => setEpostaGir(e.target.value)} placeholder="E-posta" type="email" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                <input value={sifreGir} onChange={(e) => setSifreGir(e.target.value)} placeholder="Sifre (en az 6 karakter)" type="password" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 10 }} />
                {hesapHata && <p style={{ color: COLORS.coral, fontSize: 13, marginBottom: 8 }}>{hesapHata}</p>}
                <button onClick={hesapGonder} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  {hesapModu === "giris" ? "Giris Yap" : "Hesap Olustur"}
                </button>

                {hesapModu === "giris" && !sifreUnutAcik && (
                  <button onClick={() => setSifreUnutAcik(true)} style={{ display: "block", margin: "10px auto 0", border: "none", background: "none", color: COLORS.muted, fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
                    Sifremi unuttum
                  </button>
                )}

                {sifreUnutAcik && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.line}` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Şifre Sıfırlama</p>
                    {sifreUnutAsama === "eposta" ? (
                      <>
                        <input value={sifreUnutEposta} onChange={(e) => setSifreUnutEposta(e.target.value)} placeholder="Kayitli e-postan" type="email" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                        <button onClick={sifreSifirlamaKoduGonder} disabled={sifreUnutYukleniyor || !sifreUnutEposta} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                          {sifreUnutYukleniyor ? "Gonderiliyor..." : "Kod Gonder"}
                        </button>
                      </>
                    ) : (
                      <>
                        <input value={sifreUnutKod} onChange={(e) => setSifreUnutKod(e.target.value)} placeholder="6 haneli kod" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                        <input value={sifreUnutYeniSifre} onChange={(e) => setSifreUnutYeniSifre(e.target.value)} placeholder="Yeni sifre (en az 6 karakter)" type="password" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                        <button onClick={sifreSifirlamayiTamamla} disabled={sifreUnutYukleniyor || !sifreUnutKod || !sifreUnutYeniSifre} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                          {sifreUnutYukleniyor ? "Gonderiliyor..." : "Sifreyi Degistir"}
                        </button>
                      </>
                    )}
                    {sifreUnutMesaj && <p style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 8 }}>{sifreUnutMesaj}</p>}
                    <button onClick={() => { setSifreUnutAcik(false); setSifreUnutAsama("eposta"); setSifreUnutMesaj(""); }} style={{ display: "block", margin: "8px auto 0", border: "none", background: "none", color: COLORS.muted, fontSize: 12, cursor: "pointer" }}>
                      Vazgec
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mod === "premium" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            {aktifAbonelik ? (
              <div>
                <p style={{ fontSize: 14, marginBottom: 10 }}>
                  Aktif plan: <strong>{aktifAbonelik.plan}</strong>
                  {aktifAbonelik.bitis && ` · Yenilenme: ${new Date(aktifAbonelik.bitis).toLocaleDateString("tr-TR")}`}
                </p>
                <button onClick={abonelikIptalEt} style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.coral}`, background: "transparent", color: COLORS.coral, fontWeight: 600, cursor: "pointer" }}>
                  Aboneligi Iptal Et
                </button>
                {iptalMesaji && <p style={{ fontSize: 13, marginTop: 8, color: COLORS.muted }}>{iptalMesaji}</p>}
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
                  Sinirsiz konu anlatimi, soru uretimi ve calisma plani icin Premium'a gec.
                  <br /><em>Istedigin an, tek tikla, hic ugrasmadan iptal edebilirsin.</em>
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => premiumSatinAl("premium_aylik")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>
                    Aylik 99,90₺
                  </button>
                  <button onClick={() => premiumSatinAl("premium_yillik")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", color: COLORS.ink, fontWeight: 600 }}>
                    Yillik 899,90₺
                  </button>
                </div>
                {odemeHata && <p style={{ color: COLORS.coral, fontSize: 13 }}>{odemeHata}</p>}
                {checkoutHtml && <div dangerouslySetInnerHTML={{ __html: checkoutHtml }} />}
              </>
            )}
          </div>
        )}

        {mod === "sorucoz" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p className="kx-float" style={{ fontSize: 26, marginBottom: 4 }}>📷</p>
              <p style={{ fontWeight: 700, fontSize: 16, color: COLORS.page, marginBottom: 4 }}>Soru Çöz</p>
              <p style={{ fontSize: 12, color: "#A8C4C9", lineHeight: 1.5 }}>
                Çözemediğin sorunun fotoğrafını yükle, yapay zekâ saniyeler içinde adım adım çözsün.
              </p>
            </div>

            <div style={{ background: COLORS.page, borderRadius: 14, padding: 20, border: `2px dashed ${COLORS.line}`, marginBottom: 14, textAlign: "center" }}>
              <label style={{ cursor: "pointer", display: "block" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Fotoğraf Yükle</p>
                <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 12 }}>Kameradan çek ya da galeriden seç</p>
                <input
                  type="file" accept="image/*" capture="environment"
                  onChange={(e) => { const f = e.target.files[0]; if (f) { setSoruGorseli(URL.createObjectURL(f)); soruGorseliCoz(f); } }}
                  style={{ display: "none" }}
                />
                <span className="kx-btn" style={{ display: "inline-block", padding: "9px 20px", borderRadius: 10, background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 12.5 }}>Dosya Seç</span>
              </label>
            </div>

            {soruGorseli && (
              <div style={{ background: COLORS.page, borderRadius: 14, padding: 12, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
                <img src={soruGorseli} alt="Yuklenen soru" style={{ width: "100%", borderRadius: 10, display: "block" }} />
              </div>
            )}

            {yukleniyor === "soru" && (
              <div style={{ background: COLORS.page, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: COLORS.muted }}>🧠 Çözülüyor…</p>
              </div>
            )}

            {soruCozumu && (() => {
              // "CEVAP: X" satirini metnin geri kalanindan ayirip, cevabi one cikan bir rozet olarak gosteriyoruz.
              const satirlar = soruCozumu.split("\n").map((s) => s.trim()).filter(Boolean);
              const cevapSatiriIndex = satirlar.findIndex((s) => /^CEVAP\s*:/i.test(s));
              const cevapMetni = cevapSatiriIndex !== -1 ? satirlar[cevapSatiriIndex].replace(/^CEVAP\s*:\s*/i, "") : null;
              const adimSatirlari = cevapSatiriIndex !== -1 ? satirlar.slice(0, cevapSatiriIndex) : satirlar;
              return (
                <div className="kx-fadein" style={{ background: "#FDFBF6", borderRadius: 16, border: `1px solid ${COLORS.line}`, boxShadow: "0 4px 18px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div style={{ background: COLORS.gradient, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <img src="/icons/icon-192.png" alt="Karemux" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
                    <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.page, margin: 0 }}>Karemux Çözüm</p>
                  </div>
                  <div style={{ padding: "20px 20px 8px" }}>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 12 }}>ADIM ADIM ÇÖZÜM</p>
                    {adimSatirlari.map((satir, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.coral, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#2A2A2A", margin: 0, fontFamily: "Georgia, 'Times New Roman', serif" }}>{satir.replace(/^Adım\s*\d+\s*[:.]\s*/i, "")}</p>
                      </div>
                    ))}
                  </div>
                  {cevapMetni && (
                    <div style={{ margin: "8px 20px 20px", background: RENK_BASARI_ACIK, border: `1.5px solid ${RENK_BASARI}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                      <p style={{ fontSize: 10.5, fontWeight: 700, color: "#2E7D4F", letterSpacing: 0.5, marginBottom: 4 }}>SONUÇ</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: "#1B2430" }}>{cevapMetni}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {soruCozumu && (
              <div className="kx-fadein" style={{ background: COLORS.page, borderRadius: 14, border: `1px solid ${COLORS.line}`, padding: 16, marginTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 10 }}>💬 ANLAMADIĞIN BİR YER Mİ VAR?</p>
                {soruSohbetGecmisi.length > 0 && (
                  <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {soruSohbetGecmisi.map((m, i) => (
                      <div key={i} style={{ alignSelf: m.rol === "ogrenci" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                        <div style={{
                          padding: "8px 12px", borderRadius: m.rol === "ogrenci" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                          background: m.rol === "ogrenci" ? COLORS.coral : "#FAF6EE", color: m.rol === "ogrenci" ? "#fff" : "#1B2430",
                          fontSize: 12.5, lineHeight: 1.6, border: m.rol === "ogrenci" ? "none" : `1px solid ${COLORS.line}`,
                        }}>{m.metin}</div>
                      </div>
                    ))}
                    {soruSohbetYukleniyor && (
                      <div style={{ alignSelf: "flex-start", fontSize: 11.5, color: COLORS.muted, fontStyle: "italic" }}>Karemux yazıyor...</div>
                    )}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={soruSohbetMetni} onChange={(e) => setSoruSohbetMetni(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") soruSohbetGonder(); }}
                    placeholder="Örn: 3. adımı anlamadım, tekrar açıklar mısın?"
                    style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 12.5 }} />
                  <button className="kx-btn" onClick={soruSohbetGonder} disabled={soruSohbetYukleniyor || !soruSohbetMetni.trim()}
                    style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Sor</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mod === "zayifharita" && (() => {
          const gruplu = {};
          (zayifHaritaVeri || []).forEach((r) => {
            if (!gruplu[r.ders]) gruplu[r.ders] = [];
            gruplu[r.ders].push(r);
          });
          const maxSayi = Math.max(1, ...(zayifHaritaVeri || []).map((r) => Number(r.hata_sayisi)));
          return (
            <div>
              <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
                <p style={{ fontSize: 22, marginBottom: 4 }}>🗺️</p>
                <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Zayıf Konu Haritası</p>
                <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Hata Kitapçığı verine göre — koyu renk, daha çok tekrar hata demektir.</p>
              </div>
              {zayifHaritaYukleniyor ? (
                <p style={{ textAlign: "center", color: COLORS.muted, fontSize: 13 }}>Hazırlanıyor...</p>
              ) : Object.keys(gruplu).length === 0 ? (
                <div style={{ background: "#EAF7EE", borderRadius: 10, padding: 16, textAlign: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#2E7D4F" }}>🎉 Henüz hiç hata kaydın yok, harika gidiyorsun!</p>
                </div>
              ) : (
                Object.keys(gruplu).map((ders) => (
                  <div key={ders} style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{ders}</p>
                    {gruplu[ders].sort((a, b) => b.hata_sayisi - a.hata_sayisi).map((r) => {
                      const oran = Number(r.hata_sayisi) / maxSayi;
                      const renk = oran > 0.66 ? "#E8503F" : oran > 0.33 ? COLORS.mustard : "#3DA35D";
                      return (
                        <div key={r.alt_konu} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
                            <span>{r.alt_konu}</span>
                            <span style={{ fontWeight: 700, color: renk }}>{r.hata_sayisi} hata</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 999, background: "#EDE8DC", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.max(8, oran * 100)}%`, borderRadius: 999, background: renk }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          );
        })()}

        {mod === "sinavkaygisi" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>🧘</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Sınav Kaygısı Desteği</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Heyecanlanmak normal — onu yönetmeyi öğrenebilirsin.</p>
            </div>
            {[
              { baslik: "🌬️ 4-7-8 Nefes Tekniği", metin: "4 saniye burundan nefes al, 7 saniye tut, 8 saniyede ağızdan yavaşça ver. 3-4 kez tekrarla. Sınav öncesi veya bir soruda panikleyince kullanabilirsin — sinir sistemini sakinleştirir." },
              { baslik: "🎯 Kontrol Edebildiğine Odaklan", metin: "Sınavın zorluğunu ya da diğer öğrencileri kontrol edemezsin. Ama ne kadar çalıştığını, o an önündeki soruya nasıl yaklaştığını kontrol edebilirsin. Zihnini bu ikisine odakla." },
              { baslik: "💬 Kendine Söylediklerine Dikkat Et", metin: "'Yapamayacağım' yerine 'Bu soru zor ama bir sonrakine geçip geri dönebilirim' de. İç sesin, performansını gerçekten etkiler." },
              { baslik: "😴 Uyku ve Beslenme", metin: "Sınavdan önceki hafta düzenli uyu (7-9 saat). Kafein ve şekerli atıştırmalıkları abartma — ani enerji düşüşüne sebep olabilir." },
              { baslik: "🏃 Hareket Et", metin: "Çalışma aralarında 5-10 dakika yürüyüş ya da esneme, biriken gerginliği azaltır ve odaklanmayı artırır." },
            ].map((k) => (
              <div key={k.baslik} style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
                <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>{k.baslik}</p>
                <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "#3A4550" }}>{k.metin}</p>
              </div>
            ))}
            <div style={{ background: "#FEF8E8", border: `1px solid ${COLORS.mustard}`, borderRadius: 10, padding: 14, marginTop: 4 }}>
              <p style={{ fontSize: 11.5, color: "#6B5A1E", lineHeight: 1.6 }}>
                💡 Eğer kaygın günlük hayatını ciddi şekilde etkiliyorsa (uyku, iştah, sürekli endişe), bunu bir yetişkinle (ailen, okul rehberlik servisi) konuşmak en doğrusu — bu tamamen normal ve yardım istemek güçlü bir adımdır.
              </p>
            </div>
          </div>
        )}

        {mod === "velipaneli" && (() => {
          if (!hesap || hesap.rol !== "veli") {
            return (
              <div className="kx-fadein" style={{ background: COLORS.page, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                <p style={{ fontSize: 30, marginBottom: 10 }}>👪</p>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Bu panel veli hesaplarına özel</p>
                <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>Veli hesabıyla giriş yapıp öğrenci bağlanma koduyla çocuğunu eklersen, ilerlemesini burada detaylı görebilirsin.</p>
              </div>
            );
          }
          return (
            <div>
              <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
                <p style={{ fontSize: 22, marginBottom: 4 }}>👪</p>
                <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Veli Paneli</p>
                <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Çocuğunun ilerlemesini takip et.</p>
              </div>

              <div style={{ background: COLORS.page, borderRadius: 12, padding: 14, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8 }}>YENİ ÖĞRENCİ BAĞLA</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={baglantiKoduGir} onChange={(e) => setBaglantiKoduGir(e.target.value)} placeholder="Öğrencinin bağlantı kodu"
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 12.5 }} />
                  <button onClick={veliBaglan} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Bağla</button>
                </div>
                {veliMesaj && <p style={{ fontSize: 11.5, marginTop: 8, color: COLORS.coral }}>{veliMesaj}</p>}
              </div>

              {veliOgrenciler.length === 0 ? (
                <p style={{ textAlign: "center", color: COLORS.muted, fontSize: 12.5 }}>Henüz bağlı bir öğrenci yok. Yukarıdan bağlantı kodunu gir.</p>
              ) : (
                veliOgrenciler.map((o, i) => (
                  <div key={i} className="kx-fadein" style={{ background: "#FDFBF6", borderRadius: 14, border: `1px solid ${COLORS.line}`, padding: 18, marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 16 }}>{o.ogrenci.ad}</p>
                      {o.ogrenci.sinif && <span style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, background: "#F0EBDC", padding: "3px 9px", borderRadius: 999 }}>{o.ogrenci.sinif}. Sınıf</span>}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                      <div style={{ flex: 1, background: "#1B2430", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                        <p style={{ color: COLORS.mustard, fontSize: 20, fontWeight: 900 }}>{o.buHaftaAktifGun || 0}</p>
                        <p style={{ color: "#8A968E", fontSize: 9 }}>BU HAFTA AKTİF GÜN</p>
                      </div>
                      <div style={{ flex: 1, background: "#1B2430", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                        <p style={{ color: RENK_BASARI, fontSize: 20, fontWeight: 900 }}>{o.zayifDersler.length}</p>
                        <p style={{ color: "#8A968E", fontSize: 9 }}>DİKKAT GEREKTİREN DERS</p>
                      </div>
                    </div>

                    {o.netOzet?.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, marginBottom: 6 }}>SON 30 GÜN — DERS BAZINDA ORTALAMA NET</p>
                        {o.netOzet.map((n) => (
                          <div key={n.ders} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${COLORS.line}`, fontSize: 12 }}>
                            <span>{n.ders}</span>
                            <span style={{ fontWeight: 700 }}>{n.ortalama_net} <span style={{ color: COLORS.muted, fontWeight: 400 }}>({n.test_sayisi} test)</span></span>
                          </div>
                        ))}
                      </div>
                    )}

                    {o.zayifDersler.length > 0 && (
                      <div style={{ background: "#FFF1EF", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                        <p style={{ fontSize: 11.5, color: "#B23A2E", fontWeight: 600 }}>⚠️ Zayıf dersler: {o.zayifDersler.join(", ")}</p>
                      </div>
                    )}

                    {o.gecmis.length === 0 ? (
                      <p style={{ fontSize: 11.5, color: COLORS.muted }}>Henüz konu çalışması yapmamış.</p>
                    ) : (
                      <details>
                        <summary style={{ fontSize: 11, color: COLORS.coral, fontWeight: 700, cursor: "pointer" }}>Tüm konu geçmişini gör ({o.gecmis.length})</summary>
                        <div style={{ marginTop: 8 }}>
                          {o.gecmis.slice(0, 15).map((g, j) => (
                            <p key={j} style={{ fontSize: 11, margin: "3px 0", color: "#3A4550" }}>{g.ders} · {g.konu}: {g.dogru}/{g.toplam} doğru</p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })()}

        {mod === "ulusaldeneme" && !hesap && (
          <div className="kx-fadein" style={{ background: COLORS.page, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
            <p style={{ fontSize: 30, marginBottom: 10 }}>🔒</p>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Bu özellik için hesap gerekiyor</p>
            <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16, lineHeight: 1.6 }}>Türkiye geneli sıralamada yer alman için gerçek bir hesapla giriş yapman lazım — misafir kullanımla bu özelliğe erişilemez.</p>
            <button className="kx-btn" onClick={() => setMod("hesap")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Giriş Yap / Kayıt Ol</button>
          </div>
        )}
        {mod === "ulusaldeneme" && hesap && (
          <div>
            <div className="kx-fadein" style={{ background: "linear-gradient(135deg,#B23A2E,#1F3D2E)", borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>🇹🇷</p>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Türkiye Geneli Deneme</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4 }}>Herkes aynı soruları çözüyor — gerçek sıralamanı gör.</p>
            </div>

            {ulusalYukleniyor && <p style={{ textAlign: "center", color: COLORS.muted, fontSize: 13 }}>Yükleniyor...</p>}

            {!ulusalYukleniyor && !ulusalAktif && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                {ulusalGelecek ? (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Sıradaki Deneme: {ulusalGelecek.ad}</p>
                    <p style={{ fontSize: 12, color: COLORS.muted }}>{ulusalGelecek.sinif}. Sınıf · {ulusalGelecek.ders}</p>
                    <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>Açılış: {new Date(ulusalGelecek.acilis).toLocaleString("tr-TR")}</p>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: COLORS.muted }}>Şu an açık bir Türkiye geneli deneme yok. Yeni bir tane planlandığında burada göreceksin.</p>
                )}
              </div>
            )}

            {ulusalAktif && ulusalZatenCozmus && !ulusalSonuc && (
              <div style={{ background: "#EAF7EE", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#2E7D4F" }}>✓ Bu denemeyi zaten tamamladın</p>
                <p style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 4 }}>Sonuçlar deneme kapandığında burada güncellenmeye devam eder.</p>
              </div>
            )}

            {ulusalAktif && ulusalSorular && !ulusalSonuc && (
              <div>
                <div style={{ background: COLORS.page, borderRadius: 12, padding: 14, border: `1px solid ${COLORS.line}`, marginBottom: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700 }}>{ulusalAktif.ad}</p>
                  <p style={{ fontSize: 11, color: COLORS.muted }}>{ulusalAktif.sinif}. Sınıf · {ulusalAktif.ders} · {ulusalAktif.soruSayisi} soru</p>
                  <p style={{ fontSize: 10.5, color: COLORS.coral, marginTop: 4, fontWeight: 600 }}>Kapanış: {new Date(ulusalAktif.kapanis).toLocaleString("tr-TR")}</p>
                </div>
                {ulusalSorular.map((s, i) => (
                  <div key={i} style={{ background: COLORS.page, borderRadius: 10, padding: 14, border: `1px solid ${COLORS.line}`, marginBottom: 8 }}>
                    <p style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 8 }}>{i + 1}. {s.soru}</p>
                    {s.secenekler.map((sec, j) => (
                      <button key={j} onClick={() => setUlusalCevaplar((eski) => ({ ...eski, [i]: j }))} style={{
                        display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 5, borderRadius: 7, fontSize: 12.5, cursor: "pointer",
                        border: `1.5px solid ${ulusalCevaplar[i] === j ? COLORS.coral : COLORS.line}`, background: ulusalCevaplar[i] === j ? "#FFF1EF" : "#fff",
                      }}>{sec}</button>
                    ))}
                  </div>
                ))}
                <button className="kx-btn" onClick={ulusalCevaplariGonder} disabled={ulusalGonderiliyor || Object.keys(ulusalCevaplar).length === 0}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "#1B2430", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {ulusalGonderiliyor ? "Gönderiliyor..." : `Gönder (${Object.keys(ulusalCevaplar).length}/${ulusalSorular.length})`}
                </button>
              </div>
            )}

            {ulusalSonuc && (
              <div className="kx-fadein" style={{ background: "#1B2430", borderRadius: 16, padding: 24, textAlign: "center" }}>
                <p style={{ color: COLORS.mustard, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>SONUCUN</p>
                <p style={{ color: "#fff", fontSize: 40, fontWeight: 900, marginBottom: 4 }}>{ulusalSonuc.net.toFixed(2)}</p>
                <p style={{ color: "#8A968E", fontSize: 11, marginBottom: 16 }}>NET</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 18 }}>
                  <div><p style={{ color: RENK_BASARI, fontSize: 16, fontWeight: 800 }}>{ulusalSonuc.dogru}</p><p style={{ color: "#8A968E", fontSize: 9.5 }}>DOĞRU</p></div>
                  <div><p style={{ color: "#FF6B5E", fontSize: 16, fontWeight: 800 }}>{ulusalSonuc.yanlis}</p><p style={{ color: "#8A968E", fontSize: 9.5 }}>YANLIŞ</p></div>
                  <div><p style={{ color: "#8A968E", fontSize: 16, fontWeight: 800 }}>{ulusalSonuc.bos}</p><p style={{ color: "#8A968E", fontSize: 9.5 }}>BOŞ</p></div>
                </div>
                {ulusalSonuc.yuzdelikDilim !== null && (
                  <div style={{ background: "rgba(232,179,57,0.15)", border: `1.5px solid ${COLORS.mustard}`, borderRadius: 10, padding: 12 }}>
                    <p style={{ color: COLORS.mustard, fontSize: 15, fontWeight: 800 }}>Türkiye'de %{ulusalSonuc.yuzdelikDilim}'lik dilimdesin</p>
                    <p style={{ color: "#8A968E", fontSize: 10.5, marginTop: 3 }}>{ulusalSonuc.toplamKatilimci} katılımcı arasında {ulusalSonuc.siram}. sıradasın</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 20, borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
              <button onClick={() => setUlusalYoneticiAcik(!ulusalYoneticiAcik)} style={{ border: "none", background: "none", color: COLORS.muted, fontSize: 10.5, cursor: "pointer" }}>⚙️ Yönetici Paneli</button>
              {ulusalYoneticiAcik && (
                <div style={{ background: "#F4F0E4", borderRadius: 10, padding: 14, marginTop: 8 }}>
                  <input type="password" value={ulusalYoneticiSifre} onChange={(e) => setUlusalYoneticiSifre(e.target.value)} placeholder="Yönetici şifresi"
                    style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 12.5, marginBottom: 8 }} />
                  <input value={ulusalYoneticiAd} onChange={(e) => setUlusalYoneticiAd(e.target.value)} placeholder="Deneme adı (örn: 15. Hafta Türkiye Denemesi)"
                    style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 12.5, marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <select value={ulusalYoneticiSinif} onChange={(e) => setUlusalYoneticiSinif(Number(e.target.value))} style={{ flex: 1, padding: 8, borderRadius: 8, border: `1.5px solid ${COLORS.line}` }}>
                      {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
                    </select>
                    <select value={ulusalYoneticiDers} onChange={(e) => setUlusalYoneticiDers(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: `1.5px solid ${COLORS.line}` }}>
                      {["Matematik", "Fen Bilimleri", "Turkce"].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 11.5 }}>Açık kalma süresi:</span>
                    <input type="number" value={ulusalYoneticiSaat} onChange={(e) => setUlusalYoneticiSaat(Number(e.target.value))} style={{ width: 60, padding: 6, borderRadius: 6, border: `1.5px solid ${COLORS.line}` }} />
                    <span style={{ fontSize: 11.5 }}>saat</span>
                  </div>
                  <button className="kx-btn" onClick={ulusalDenemeOlustur} disabled={ulusalYoneticiOlusturuluyor || !ulusalYoneticiSifre || !ulusalYoneticiAd}
                    style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    {ulusalYoneticiOlusturuluyor ? "Oluşturuluyor..." : "Şimdi Başlat"}
                  </button>

                  <button onClick={maliyetRaporunuGetir} disabled={maliyetRaporuYukleniyor || !ulusalYoneticiSifre}
                    style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 700, fontSize: 12, cursor: "pointer", marginTop: 8 }}>
                    {maliyetRaporuYukleniyor ? "Getiriliyor..." : "📊 Kullanım/Maliyet Raporu Göster"}
                  </button>

                  {maliyetRaporu && (
                    <div style={{ background: "#1B2430", borderRadius: 10, padding: 14, marginTop: 10 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <p style={{ color: COLORS.mustard, fontSize: 18, fontWeight: 900 }}>{maliyetRaporu.toplamKullanici}</p>
                          <p style={{ color: "#8A968E", fontSize: 8.5 }}>KAYITLI KULLANICI</p>
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <p style={{ color: RENK_BASARI, fontSize: 18, fontWeight: 900 }}>{maliyetRaporu.premiumSayisi}</p>
                          <p style={{ color: "#8A968E", fontSize: 8.5 }}>PREMIUM</p>
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <p style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>{maliyetRaporu.anonimKullanici}</p>
                          <p style={{ color: "#8A968E", fontSize: 8.5 }}>MİSAFİR (CİHAZ)</p>
                        </div>
                      </div>
                      <div style={{ borderTop: "1px solid #2A3540", paddingTop: 10, fontSize: 11.5, color: "#fff" }}>
                        <p>Bugün: <strong>{maliyetRaporu.istekSayilari.bugun}</strong> istek</p>
                        <p>Bu hafta: <strong>{maliyetRaporu.istekSayilari.buHafta}</strong> istek</p>
                        <p>Bu ay: <strong>{maliyetRaporu.istekSayilari.buAy}</strong> istek</p>
                      </div>
                      {maliyetRaporu.enAktifKullanicilar?.length > 0 && (
                        <div style={{ borderTop: "1px solid #2A3540", paddingTop: 10, marginTop: 10 }}>
                          <p style={{ color: "#8A968E", fontSize: 9.5, marginBottom: 6 }}>BU HAFTA EN AKTİF 5 KULLANICI</p>
                          {maliyetRaporu.enAktifKullanicilar.map((k, i) => (
                            <p key={i} style={{ fontSize: 11, color: "#fff", margin: "3px 0" }}>{k.ad}: {k.istek_sayisi} istek</p>
                          ))}
                        </div>
                      )}
                      <p style={{ fontSize: 9.5, color: "#5A6A72", marginTop: 10, lineHeight: 1.5 }}>{maliyetRaporu.not}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {mod === "kurumpaneli" && !hesap && (
          <div className="kx-fadein" style={{ background: COLORS.page, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
            <p style={{ fontSize: 30, marginBottom: 10 }}>🔒</p>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Bu özellik için hesap gerekiyor</p>
            <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16, lineHeight: 1.6 }}>Kurum Paneli'ni kullanmak için gerçek bir hesapla giriş yapman lazım.</p>
            <button className="kx-btn" onClick={() => setMod("hesap")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Giriş Yap / Kayıt Ol</button>
          </div>
        )}
        {mod === "kurumpaneli" && hesap && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>🏢</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Kurum Paneli</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Okul/dershane yöneticileri için toplu, anonim öğrenci raporu.</p>
            </div>

            {hesap.rol === "ogrenci" && liderlikVeri && !liderlikVeri.kurumaBagliDegil && liderlikVeri.siralama?.length > 0 && (
              <div className="kx-fadein" style={{ background: "#1B2430", borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <p style={{ color: COLORS.mustard, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🏆 Sınıf Sıralaman</p>
                <p style={{ color: "#8A968E", fontSize: 10.5, marginBottom: 12 }}>Aynı kuruma bağlı, en az 2 test çözmüş sınıf arkadaşların arasında — isimler kısmi gizlenmiştir.</p>
                {liderlikVeri.kendiSiran && (
                  <p style={{ color: "#fff", fontSize: 12.5, fontWeight: 700, marginBottom: 10, textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 8 }}>
                    Sen {liderlikVeri.kendiSiran}. sıradasın ({liderlikVeri.siralama.length} kişi arasında)
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {liderlikVeri.siralama.slice(0, 10).map((s) => (
                    <div key={s.sira} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: s.benMi ? "rgba(232,179,57,0.18)" : "transparent", border: s.benMi ? `1px solid ${COLORS.mustard}` : "none" }}>
                      <span style={{ width: 22, fontSize: 12, fontWeight: 800, color: s.sira <= 3 ? COLORS.mustard : "#8A968E" }}>{s.sira <= 3 ? ["🥇", "🥈", "🥉"][s.sira - 1] : s.sira}</span>
                      <span style={{ flex: 1, fontSize: 12, color: "#fff", fontWeight: s.benMi ? 700 : 500 }}>{s.isim}{s.benMi ? " (sen)" : ""}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: RENK_BASARI }}>{s.ortalamaNet}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!kurumRaporu && (
              <>
                <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>1) Yeni Kurum Oluştur</p>
                  {!kurumOlusturSonuc ? (
                    <>
                      <input value={kurumOlusturAdi} onChange={(e) => setKurumOlusturAdi(e.target.value)} placeholder="Okul / Dershane Adı"
                        style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13, marginBottom: 10 }} />
                      <button className="kx-btn" onClick={kurumOlustur} disabled={kurumOlusturYukleniyor || !kurumOlusturAdi.trim()}
                        style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                        {kurumOlusturYukleniyor ? "Oluşturuluyor..." : "Kurum Oluştur"}
                      </button>
                    </>
                  ) : (
                    <div style={{ background: RENK_BASARI_ACIK, borderRadius: 10, padding: 14, textAlign: "center" }}>
                      <p style={{ fontSize: 12, color: "#2E7D4F", marginBottom: 6 }}>"{kurumOlusturSonuc.ad}" oluşturuldu!</p>
                      <p style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, color: "#1B2430" }}>{kurumOlusturSonuc.kurumKodu}</p>
                      <p style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 6 }}>Bu kodu öğrencilerine ver — Profil sayfasından bu koda bağlanabilirler. Kodu ayrıca aşağıya girip raporu görebilirsin.</p>
                    </div>
                  )}
                </div>

                <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>2) Kurum Raporunu Görüntüle</p>
                  <input value={kurumRaporKodu} onChange={(e) => setKurumRaporKodu(e.target.value.toUpperCase())} placeholder="Kurum Kodu (örn: A7K2M9XP)"
                    style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13, marginBottom: 10, letterSpacing: 1 }} />
                  <button className="kx-btn" onClick={kurumRaporuGetir} disabled={kurumRaporYukleniyor || !kurumRaporKodu.trim()}
                    style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#1B2430", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                    {kurumRaporYukleniyor ? "Getiriliyor..." : "Raporu Getir"}
                  </button>
                </div>
              </>
            )}

            {kurumRaporu && (
              <div className="kx-fadein">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{kurumRaporu.kurumAdi}</p>
                  <button onClick={() => { setKurumRaporu(null); setKurumRaporKodu(""); }} style={{ border: "none", background: "none", color: COLORS.coral, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>← Geri</button>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
                    <p style={{ color: COLORS.mustard, fontSize: 22, fontWeight: 900 }}>{kurumRaporu.ogrenciSayisi}</p>
                    <p style={{ color: "#8A968E", fontSize: 9 }}>TOPLAM ÖĞRENCİ</p>
                  </div>
                  <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
                    <p style={{ color: RENK_BASARI, fontSize: 22, fontWeight: 900 }}>{kurumRaporu.buHaftaAktifOgrenci}</p>
                    <p style={{ color: "#8A968E", fontSize: 9 }}>BU HAFTA AKTİF</p>
                  </div>
                  <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
                    <p style={{ color: COLORS.coral, fontSize: 22, fontWeight: 900 }}>{kurumRaporu.genelOrtalamaNet ?? "—"}</p>
                    <p style={{ color: "#8A968E", fontSize: 9 }}>GENEL ORT. NET</p>
                  </div>
                </div>

                {kurumRaporu.gunlukTrend?.length >= 2 && (() => {
                  const genislik = 280, yukseklik = 80, kenar = 10;
                  const maxDeger = Math.max(...kurumRaporu.gunlukTrend.map((v) => Number(v.aktif_ogrenci)), 1);
                  const adim = (genislik - kenar * 2) / (kurumRaporu.gunlukTrend.length - 1);
                  const noktalar = kurumRaporu.gunlukTrend.map((v, i) => ({
                    x: kenar + i * adim,
                    y: yukseklik - kenar - (Number(v.aktif_ogrenci) / maxDeger) * (yukseklik - kenar * 2),
                  }));
                  const yol = noktalar.map((n, i) => `${i === 0 ? "M" : "L"}${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(" ");
                  return (
                    <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10 }}>SON 7 GÜN — GÜNLÜK AKTİF ÖĞRENCİ</p>
                      <svg viewBox={`0 0 ${genislik} ${yukseklik}`} style={{ width: "100%", height: 90 }}>
                        <path d={yol} fill="none" stroke={RENK_BASARI} strokeWidth="2.5" />
                        {noktalar.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r="3.5" fill={RENK_BASARI} />)}
                      </svg>
                    </div>
                  );
                })()}

                {kurumRaporu.sinifDagilimi?.length > 0 && (
                  <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10 }}>SINIF DAĞILIMI</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {kurumRaporu.sinifDagilimi.map((s) => (
                        <div key={s.sinif} style={{ background: "#FAF6EE", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                          <strong>{s.sinif}. Sınıf:</strong> {s.sayi} öğrenci
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {kurumRaporu.dersBazindaNet?.length > 0 && (() => {
                  const maxNet = Math.max(...kurumRaporu.dersBazindaNet.map((d) => Number(d.ortalama_net)), 1);
                  return (
                    <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10 }}>DERS BAZINDA ORTALAMA NET (düşükten yükseğe)</p>
                      {kurumRaporu.dersBazindaNet.map((d) => {
                        const oran = Number(d.ortalama_net) / maxNet;
                        const renk = oran > 0.66 ? "#3DA35D" : oran > 0.33 ? COLORS.mustard : "#E8503F";
                        return (
                          <div key={d.ders} style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
                              <span>{d.ders}</span>
                              <span style={{ fontWeight: 700 }}>{d.ortalama_net} <span style={{ color: COLORS.muted, fontWeight: 400 }}>({d.test_sayisi} test)</span></span>
                            </div>
                            <div style={{ height: 7, borderRadius: 999, background: "#EDE8DC", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.max(6, oran * 100)}%`, borderRadius: 999, background: renk }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {kurumRaporu.zayifKonular?.length > 0 && (
                  <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10 }}>KURUM GENELİ EN ÇOK HATA YAPILAN KONULAR</p>
                    {kurumRaporu.zayifKonular.map((z, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12 }}>
                        <span>{z.ders} — {z.alt_konu}</span>
                        <span style={{ fontWeight: 700, color: COLORS.coral }}>{z.hata_sayisi}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mod === "kelimekartlari" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>🗂️</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Kelime Kartları</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Karta dokun, çevir, öğren.</p>
            </div>

            {!kelimeKartlari && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8 }}>DERS</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {[["Ingilizce", "🇬🇧 İngilizce"], ["Turkce", "📖 Türkçe Sözcük Hazinesi"]].map(([k, etiket]) => (
                    <button key={k} onClick={() => { setKelimeKartiDers(k); setKelimeKartiUnite(null); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${kelimeKartiDers === k ? COLORS.coral : COLORS.line}`, background: kelimeKartiDers === k ? "#FFF1EF" : "#fff" }}>{etiket}</button>
                  ))}
                </div>

                {kelimeKartiDers === "Ingilizce" && (
                  <>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8 }}>ÜNİTE / KONU</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, maxHeight: 240, overflowY: "auto" }}>
                      {dersinUniteleri("Ingilizce", sinif).map((u) => (
                        <button key={u} onClick={() => setKelimeKartiUnite(u)} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left", border: `1.5px solid ${kelimeKartiUnite === u ? COLORS.mustard : COLORS.line}`, background: kelimeKartiUnite === u ? "#FEF8E8" : "#FAF6EE" }}>{u}</button>
                      ))}
                    </div>
                  </>
                )}

                <button className="kx-btn" onClick={kelimeKartlariUret} disabled={!kelimeKartiDers || (kelimeKartiDers === "Ingilizce" && !kelimeKartiUnite) || kelimeKartiYukleniyor}
                  style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: kelimeKartiDers ? COLORS.coral : COLORS.line, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {kelimeKartiYukleniyor ? "Hazırlanıyor..." : "🗂️ Kartları Oluştur"}
                </button>
              </div>
            )}

            {kelimeKartlari && kelimeKartiIndex < kelimeKartlari.length && (() => {
              const kart = kelimeKartlari[kelimeKartiIndex];
              return (
                <div className="kx-fadein">
                  <p style={{ textAlign: "center", fontSize: 11.5, color: COLORS.muted, marginBottom: 12 }}>{kelimeKartiIndex + 1} / {kelimeKartlari.length}</p>
                  <div onClick={() => setKelimeKartiCevrildi(!kelimeKartiCevrildi)} style={{
                    background: kelimeKartiCevrildi ? "#1B2430" : "#FDFBF6", borderRadius: 20, padding: "50px 24px", minHeight: 200,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
                    cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", border: `1px solid ${COLORS.line}`,
                  }}>
                    {!kelimeKartiCevrildi ? (
                      <>
                        <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 28, fontWeight: 700, color: "#1B2430" }}>{kart.kelime}</p>
                        <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 16 }}>Anlamını görmek için dokun</p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{kart.anlam}</p>
                        <p style={{ fontSize: 12.5, color: "#B7C4BC", fontStyle: "italic", lineHeight: 1.6 }}>{kart.ornekCumle}</p>
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button onClick={() => { setKelimeKartiIndex((i) => Math.max(0, i - 1)); setKelimeKartiCevrildi(false); }} disabled={kelimeKartiIndex === 0}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, background: "#fff", fontWeight: 600, cursor: "pointer" }}>← Önceki</button>
                    <button onClick={() => { setKelimeKartiIndex((i) => i + 1); setKelimeKartiCevrildi(false); }}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                      {kelimeKartiIndex + 1 < kelimeKartlari.length ? "Sonraki →" : "Bitir"}
                    </button>
                  </div>
                </div>
              );
            })()}

            {kelimeKartlari && kelimeKartiIndex >= kelimeKartlari.length && (
              <div style={{ background: "#EAF7EE", borderRadius: 14, padding: 24, textAlign: "center" }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>🎉</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#2E7D4F", marginBottom: 12 }}>{kelimeKartlari.length} kelimeyi tamamladın!</p>
                <button className="kx-btn" onClick={() => { setKelimeKartlari(null); setKelimeKartiDers(null); setKelimeKartiUnite(null); }} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Yeni Kart Seti</button>
              </div>
            )}
          </div>
        )}

        {mod === "tekrarzamani" && (() => {
          if (!hesap) {
            return (
              <div className="kx-fadein" style={{ background: COLORS.page, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                <p style={{ fontSize: 30, marginBottom: 10 }}>🔒</p>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Bu özellik için hesap gerekiyor</p>
                <button className="kx-btn" onClick={() => setMod("hesap")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 6 }}>Giriş Yap / Kayıt Ol</button>
              </div>
            );
          }
          if (tekrarSorulari === null) return <p style={{ textAlign: "center", color: COLORS.muted, fontSize: 13 }}>Yükleniyor...</p>;
          if (tekrarSorulari.length === 0) {
            return (
              <div style={{ background: "#EAF7EE", borderRadius: 12, padding: 24, textAlign: "center" }}>
                <p style={{ fontSize: 30, marginBottom: 8 }}>🎉</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#2E7D4F" }}>Bugün tekrarı gelen bir şey yok!</p>
                <p style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 4 }}>Yanlış yaptığın sorular, unutmadan tekrar önüne gelecek şekilde burada birikir.</p>
              </div>
            );
          }
          if (tekrarIndex >= tekrarSorulari.length) {
            return (
              <div style={{ background: "#1B2430", borderRadius: 16, padding: 26, textAlign: "center" }}>
                <p style={{ fontSize: 30, marginBottom: 8 }}>🏁</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Bugünkü tekrarları bitirdin!</p>
                <p style={{ color: "#8A968E", fontSize: 12, marginTop: 4 }}>{tekrarSorulari.length} soru tekrar ettin.</p>
              </div>
            );
          }
          const soru = tekrarSorulari[tekrarIndex];
          return (
            <div>
              <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "16px 18px", marginBottom: 14, textAlign: "center" }}>
                <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 15 }}>🔁 Bugün Tekrar Zamanı</p>
                <p style={{ color: "#B7C4BC", fontSize: 11.5, marginTop: 3 }}>{tekrarIndex + 1} / {tekrarSorulari.length} · {soru.ders}{soru.alt_konu ? ` — ${soru.alt_konu}` : ""}</p>
              </div>
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>{soru.soru}</p>
                {soru.secenekler.map((sec, j) => {
                  const secili = tekrarCevap === j, dogru = tekrarGosterildi && j === soru.dogru_index, yanlis = tekrarGosterildi && secili && j !== soru.dogru_index;
                  return (
                    <button key={j} onClick={() => tekrarCevapVer(j)} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 6, borderRadius: 8, fontSize: 12.5,
                      cursor: tekrarGosterildi ? "default" : "pointer",
                      border: `1.5px solid ${dogru ? RENK_BASARI : yanlis ? "#FF6B5E" : COLORS.line}`,
                      background: dogru ? RENK_BASARI_ACIK : yanlis ? "#FFF1EF" : "#fff",
                    }}>{sec}</button>
                  );
                })}
                {tekrarGosterildi && (
                  <div style={{ marginTop: 10 }}>
                    {soru.aciklama && <p style={{ fontSize: 11.5, color: "#1B2430", background: "#FFF8E8", borderRadius: 6, padding: 8, marginBottom: 8, lineHeight: 1.5 }}>💡 {soru.aciklama}</p>}
                    <p style={{ fontSize: 11.5, color: COLORS.coral, fontWeight: 700, marginBottom: 8 }}>{tekrarSonMesaj}</p>
                    <button className="kx-btn" onClick={tekrarSonrakiSoru} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: "#1B2430", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                      {tekrarIndex + 1 < tekrarSorulari.length ? "Sonraki Soru →" : "Bitir"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {mod === "basarilarim" && (() => {
          if (!hesap) {
            return (
              <div className="kx-fadein" style={{ background: COLORS.page, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                <p style={{ fontSize: 30, marginBottom: 10 }}>🔒</p>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Bu özellik için hesap gerekiyor</p>
                <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16, lineHeight: 1.6 }}>Rozetlerini ve seviyeni kaydedebilmemiz için gerçek bir hesapla giriş yapman lazım.</p>
                <button className="kx-btn" onClick={() => setMod("hesap")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Giriş Yap / Kayıt Ol</button>
              </div>
            );
          }
          if (!basariVeri) {
            return (
              <div style={{ textAlign: "center", padding: 30 }}>
                <p style={{ fontSize: 13, color: COLORS.muted }}>Başarıların yükleniyor...</p>
              </div>
            );
          }
          const xp = Math.round((basariVeri.toplamSoru || 0) * 5 + Object.values(basariVeri.dersBazinda || {}).reduce((t, n) => t + n, 0) * 50 + (basariVeri.tamamlananSinavSayisi || 0) * 20);
          const { mevcut, sonraki } = seviyeHesapla(xp);
          const ilerlemeYuzdesi = sonraki ? Math.min(100, Math.round(((xp - mevcut.esik) / (sonraki.esik - mevcut.esik)) * 100)) : 100;
          const kazanilanRozetler = GENEL_ROZETLER.filter((r) => r.kosul(basariVeri));

          return (
            <div>
              <div className="kx-fadein" style={{ background: "#1B2430", borderRadius: 16, padding: 22, marginBottom: 16, textAlign: "center" }}>
                <p className="kx-float" style={{ fontSize: 34, marginBottom: 6 }}>{mevcut.ikon}</p>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 2 }}>{mevcut.ad}</p>
                <p style={{ color: "#8A968E", fontSize: 11, marginBottom: 14 }}>{xp} XP {sonraki ? `· ${sonraki.esik - xp} XP kaldı: ${sonraki.ad}` : "· En yüksek seviyedesin!"}</p>
                {sonraki && (
                  <div style={{ height: 8, borderRadius: 999, background: "#2A3540", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${ilerlemeYuzdesi}%`, borderRadius: 999, background: `linear-gradient(90deg, ${COLORS.coral}, ${COLORS.mustard})` }} />
                  </div>
                )}
              </div>

              <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>Genel Rozetler ({kazanilanRozetler.length}/{GENEL_ROZETLER.length})</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {GENEL_ROZETLER.map((r) => {
                  const kazanildi = r.kosul(basariVeri);
                  return (
                    <div key={r.key} style={{ background: kazanildi ? "#FEF8E8" : "#F4F0E4", border: `1.5px solid ${kazanildi ? COLORS.mustard : COLORS.line}`, borderRadius: 12, padding: "12px 10px", textAlign: "center", opacity: kazanildi ? 1 : 0.45 }}>
                      <p style={{ fontSize: 22, marginBottom: 4 }}>{kazanildi ? r.ikon : "🔒"}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink, marginBottom: 2 }}>{r.ad}</p>
                      <p style={{ fontSize: 9.5, color: COLORS.muted, lineHeight: 1.4 }}>{r.aciklama}</p>
                    </div>
                  );
                })}
              </div>

              <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>Ders Rozetleri</p>
              {gorunurDersler(sinif).map((d) => {
                const tamamlanan = basariVeri.dersBazinda?.[d.ad] || 0;
                const toplam = dersinUniteleri(d.ad, sinif).length || 1;
                const oran = tamamlanan / toplam;
                const kademe = oran >= 0.99 ? "altin" : oran >= 0.5 ? "gumus" : oran >= 0.25 ? "bronz" : null;
                const kademeRenk = { altin: "#E8B339", gumus: "#B0B8BE", bronz: "#B5651D" }[kademe] || COLORS.line;
                const kademeAd = { altin: "Altın", gumus: "Gümüş", bronz: "Bronz" }[kademe] || "Henüz Yok";
                return (
                  <div key={d.ad} style={{ display: "flex", alignItems: "center", gap: 12, background: COLORS.page, borderRadius: 10, padding: "10px 14px", border: `1px solid ${COLORS.line}`, marginBottom: 6 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 999, background: kademe ? kademeRenk : "#F0EBDC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{d.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700 }}>{d.ad}</p>
                      <p style={{ fontSize: 10.5, color: COLORS.muted }}>{tamamlanan}/{toplam} ünite · <span style={{ color: kademe ? kademeRenk : COLORS.muted, fontWeight: 700 }}>{kademeAd}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {mod === "tatilprogrami" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>🏖️</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Tatil Çalışma Programı</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Tatilde de ritmini kaybetme — ama dinlenmek de plana dahil.</p>
            </div>

            {!tatilProgramiListesi && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8 }}>TATİL TÜRÜ</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {TATIL_TURLERI.map((t) => {
                    const secili = tatilTuru === t.key;
                    return (
                      <button key={t.key} onClick={() => setTatilTuru(t.key)} className="kx-btn" style={{
                        display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        border: `1.5px solid ${secili ? COLORS.coral : COLORS.line}`, background: secili ? "#FFF1EF" : "#FAF6EE",
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{t.ad} <span style={{ fontWeight: 500, color: COLORS.muted, fontSize: 11 }}>({t.gun} gün)</span></span>
                        <span style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{t.aciklama}</span>
                      </button>
                    );
                  })}
                </div>
                <button className="kx-btn" onClick={tatilProgramiOlustur} disabled={!tatilTuru || tatilProgramiYukleniyor}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: tatilTuru ? COLORS.coral : COLORS.line, color: "#fff", fontWeight: 700, fontSize: 13, cursor: tatilTuru ? "pointer" : "default" }}>
                  {tatilProgramiYukleniyor ? "Hazırlanıyor..." : "🏖️ Programı Oluştur"}
                </button>
              </div>
            )}

            {tatilProgramiMesaj && (
              <div className="kx-fadein" style={{ display: "flex", gap: 10, marginTop: 14, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: COLORS.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🎯</div>
                <div style={{ flex: 1, background: COLORS.page, borderRadius: "4px 14px 14px 14px", padding: "12px 14px", border: `1px solid ${COLORS.line}`, fontSize: 12.5, lineHeight: 1.7 }}>{tatilProgramiMesaj}</div>
              </div>
            )}

            {tatilProgramiListesi && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 12 }}>{tatilProgramiListesi.length} GÜNLÜK PROGRAM</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto" }}>
                  {tatilProgramiListesi.map((g, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < tatilProgramiListesi.length - 1 ? `1px solid ${COLORS.line}` : "none" }}>
                      <span style={{ width: 26, height: 26, borderRadius: 999, background: g.ders === "Dinlenme" ? "#EDE8DC" : "#FFF1EF", color: g.ders === "Dinlenme" ? COLORS.muted : COLORS.coral, fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{g.gunNo}</span>
                      <div>
                        <p style={{ fontSize: 11.5, fontWeight: 700, color: g.ders === "Dinlenme" ? COLORS.muted : COLORS.ink, marginBottom: 2 }}>{g.ders}</p>
                        <p style={{ fontSize: 11.5, color: "#3A4550", lineHeight: 1.5 }}>{g.gorev}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 12, textAlign: "center" }}>✓ Bu program Profilindeki "Günlük Görevler"e de kaydedildi.</p>
                <button className="kx-btn" onClick={() => { setTatilProgramiListesi(null); setTatilProgramiMesaj(""); setTatilTuru(null); }} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginTop: 12 }}>Yeni Program Oluştur</button>
              </div>
            )}
          </div>
        )}

        {mod === "burslulukdeneme" && (() => {
          const tumSorularHazir = burslulukSorular && BURSLULUK_DERSLER.every((d) => burslulukSorular[d]);
          const toplamSoru = burslulukSorular ? BURSLULUK_DERSLER.reduce((t, d) => t + (burslulukSorular[d]?.length || 0), 0) : 0;
          const cevaplananSayi = Object.keys(burslulukCevaplar).length;

          let dogruSayisi = 0, yanlisSayisi = 0, bosSayisi = 0;
          if (tumSorularHazir) {
            BURSLULUK_DERSLER.forEach((ders) => {
              (burslulukSorular[ders] || []).forEach((s, i) => {
                const anahtar = `${ders}::${i}`;
                if (!(anahtar in burslulukCevaplar)) bosSayisi++;
                else if (burslulukCevaplar[anahtar] === s.dogruIndex) dogruSayisi++;
                else yanlisSayisi++;
              });
            });
          }
          const genelNet = Math.max(0, dogruSayisi - yanlisSayisi / 3);

          return (
            <div>
              <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
                <p style={{ fontSize: 22, marginBottom: 4 }}>🎓</p>
                <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Bursluluk Sınavı (İOKBS) Denemesi</p>
                <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Gerçek sınav: 4 ders × 20 soru, 100 dakika, 3 yanlış 1 doğruyu götürür.</p>
              </div>

              {!burslulukBasladi && (
                <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                  <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "#3A4550", marginBottom: 14 }}>
                    İOKBS (Bursluluk Sınavı), devlet okulunda okuyan öğrencilere aylık burs kazandıran resmi bir MEB sınavıdır. Türkçe, Matematik, Fen Bilimleri ve Sosyal Bilgiler'den eşit sayıda soru sorulur.
                  </p>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8 }}>DERS BAŞINA SORU SAYISI</label>
                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    {[5, 10, 20].map((n) => (
                      <button key={n} onClick={() => setBurslulukSoruSayisi(n)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${burslulukSoruSayisi === n ? COLORS.coral : COLORS.line}`, background: burslulukSoruSayisi === n ? "#FFF1EF" : "#fff" }}>
                        {n} {n === 20 ? "(Gerçek Sınav)" : ""}
                      </button>
                    ))}
                  </div>
                  <button className="kx-btn" onClick={burslulukSinaviUret} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    🎓 Denemeyi Başlat (Toplam {burslulukSoruSayisi * 4} Soru)
                  </button>
                </div>
              )}

              {burslulukYukleniyor && (
                <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>Hazırlanıyor: <strong>{burslulukAsama}</strong></p>
                  <p style={{ fontSize: 11, color: COLORS.muted }}>{BURSLULUK_DERSLER.filter((d) => burslulukSorular?.[d]).length} / 4 ders tamamlandı</p>
                </div>
              )}

              {kronometreSaniye !== null && !burslulukGonderildi && (
                <div style={{ position: "sticky", top: 8, zIndex: 15, display: "flex", justifyContent: "center", marginTop: 12, marginBottom: -4 }}>
                  <div style={{ background: kronometreSaniye < 60 ? "#E8503F" : "#1B2430", color: "#fff", padding: "8px 20px", borderRadius: 999, fontWeight: 800, fontSize: 15, boxShadow: "0 3px 10px rgba(0,0,0,0.2)" }}>
                    ⏱️ {sureFormatla(kronometreSaniye)}
                  </div>
                </div>
              )}
              {burslulukSorular && BURSLULUK_DERSLER.map((ders) => burslulukSorular[ders] && (
                <div key={ders} style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginTop: 12 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: COLORS.coral }}>{ders}</p>
                  {burslulukSorular[ders].map((s, i) => {
                    const anahtar = `${ders}::${i}`;
                    return (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <p style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 6 }}>{i + 1}. {s.soru}</p>
                        {(s.secenekler || []).map((sec, j) => {
                          const secili = burslulukCevaplar[anahtar] === j, dogru = burslulukGonderildi && j === s.dogruIndex, yanlis = burslulukGonderildi && secili && j !== s.dogruIndex;
                          return (
                            <button key={j} onClick={() => !burslulukGonderildi && setBurslulukCevaplar((eski) => ({ ...eski, [anahtar]: j }))} style={{
                              display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 5, borderRadius: 7, fontSize: 12.5,
                              cursor: burslulukGonderildi ? "default" : "pointer",
                              border: `1.5px solid ${dogru ? RENK_BASARI : yanlis ? "#FF6B5E" : secili ? COLORS.mustard : COLORS.line}`,
                              background: dogru ? RENK_BASARI_ACIK : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff",
                            }}>{sec}</button>
                          );
                        })}
                        {burslulukGonderildi && burslulukCevaplar[anahtar] !== s.dogruIndex && s.aciklama && (
                          <p style={{ fontSize: 11.5, color: "#1B2430", background: "#FFF8E8", borderRadius: 6, padding: 7, marginTop: 4, lineHeight: 1.5 }}>💡 {s.aciklama}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {tumSorularHazir && !burslulukGonderildi && (
                <button className="kx-btn" onClick={() => { setBurslulukGonderildi(true); kronometreyiDurdur(); }} disabled={cevaplananSayi < toplamSoru}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "#1B2430", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 12 }}>
                  Sınavı Bitir ({cevaplananSayi}/{toplamSoru} cevaplandı)
                </button>
              )}

              {burslulukGonderildi && (
                <div className="kx-fadein" style={{ background: "#1B2430", borderRadius: 16, padding: 24, textAlign: "center", marginTop: 14 }}>
                  <p style={{ color: COLORS.mustard, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>BURSLULUK DENEMESİ SONUCU</p>
                  <p style={{ color: "#fff", fontSize: 40, fontWeight: 900, marginBottom: 4 }}>{genelNet.toFixed(2)}</p>
                  <p style={{ color: "#8A968E", fontSize: 11, marginBottom: 16 }}>NET (Doğru − Yanlış/3)</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                    <div><p style={{ color: RENK_BASARI, fontSize: 18, fontWeight: 800 }}>{dogruSayisi}</p><p style={{ color: "#8A968E", fontSize: 10 }}>DOĞRU</p></div>
                    <div><p style={{ color: "#FF6B5E", fontSize: 18, fontWeight: 800 }}>{yanlisSayisi}</p><p style={{ color: "#8A968E", fontSize: 10 }}>YANLIŞ</p></div>
                    <div><p style={{ color: "#8A968E", fontSize: 18, fontWeight: 800 }}>{bosSayisi}</p><p style={{ color: "#8A968E", fontSize: 10 }}>BOŞ</p></div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {mod === "paragrafstudyo" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>📝</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Paragraf Stüdyosu</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>LGS'nin en çok soru çıkan alanı — türe göre derinlemesine pratik.</p>
            </div>

            <div style={{ background: COLORS.page, borderRadius: 12, padding: 14, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8 }}>PARAGRAF TÜRÜ</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {PARAGRAF_TURLERI.map((t) => {
                  const secili = paragrafTuru === t.ad;
                  return (
                    <button key={t.ad} onClick={() => setParagrafTuru(t.ad)} className="kx-btn" style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                      border: `1.5px solid ${secili ? COLORS.coral : COLORS.line}`, background: secili ? "#FFF1EF" : "#FAF6EE",
                    }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{t.ad}</span>
                      <span style={{ fontSize: 10.5, color: COLORS.muted }}>{t.aciklama}</span>
                    </button>
                  );
                })}
              </div>

              <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8 }}>ZORLUK</label>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[["kolay", "Kolay"], ["orta", "Orta"], ["zor", "Zor"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => setParagrafZorluk(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${paragrafZorluk === k ? COLORS.coral : COLORS.line}`, background: paragrafZorluk === k ? "#FFF1EF" : "#fff" }}>{etiket}</button>
                ))}
              </div>

              <button className="kx-btn" onClick={paragrafSorusuUret} disabled={!paragrafTuru || paragrafYukleniyor} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: paragrafTuru ? COLORS.coral : COLORS.line, color: "#fff", fontWeight: 700, fontSize: 13, cursor: paragrafTuru ? "pointer" : "default" }}>
                {paragrafYukleniyor ? "Hazırlanıyor..." : "📝 Paragraf Sorusu Üret"}
              </button>
            </div>

            {paragrafSoru && (
              <div className="kx-fadein" style={{ background: "#FDFBF6", borderRadius: 14, border: `1px solid ${COLORS.line}`, padding: 20, boxShadow: "0 3px 14px rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14.5, lineHeight: 1.85, color: "#2A2A2A", marginBottom: 18, paddingBottom: 16, borderBottom: `2px dashed ${COLORS.line}` }}>
                  {paragrafSoru.paragraf}
                </div>
                <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>{paragrafSoru.soru}</p>
                {paragrafSoru.secenekler.map((sec, j) => {
                  const secili = paragrafCevap === j, dogru = paragrafGonderildi && j === paragrafSoru.dogruIndex, yanlis = paragrafGonderildi && secili && j !== paragrafSoru.dogruIndex;
                  return (
                    <button key={j} onClick={() => !paragrafGonderildi && setParagrafCevap(j)} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 6, borderRadius: 8, fontSize: 13,
                      cursor: paragrafGonderildi ? "default" : "pointer",
                      border: `1.5px solid ${dogru ? RENK_BASARI : yanlis ? "#FF6B5E" : secili ? COLORS.mustard : COLORS.line}`,
                      background: dogru ? RENK_BASARI_ACIK : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff",
                    }}>{sec}</button>
                  );
                })}
                {!paragrafGonderildi ? (
                  <button className="kx-btn" onClick={() => setParagrafGonderildi(true)} disabled={paragrafCevap === null} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#1B2430", color: "#fff", fontWeight: 600, marginTop: 8, cursor: "pointer" }}>Cevabı Gönder</button>
                ) : (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ textAlign: "center", fontWeight: 700, fontSize: 15, color: paragrafCevap === paragrafSoru.dogruIndex ? RENK_BASARI : "#E8503F", marginBottom: 8 }}>
                      {paragrafCevap === paragrafSoru.dogruIndex ? "🎉 Doğru!" : "❌ Yanlış"}
                    </p>
                    <p style={{ fontSize: 12.5, color: "#1B2430", background: "#FFF8E8", borderRadius: 8, padding: 10, lineHeight: 1.6, marginBottom: 10 }}>💡 {paragrafSoru.aciklama}</p>
                    <button className="kx-btn" onClick={paragrafSorusuUret} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, cursor: "pointer" }}>🔄 Aynı Türde Yeni Soru</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mod === "hedefokul" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>🏫</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Hedef Okulum</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Hedefini belirle, ona göre çalış.</p>
            </div>

            <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 6 }}>İL</label>
              <select value={hedefIl} onChange={(e) => { setHedefIl(e.target.value); setHedefIlce(""); }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 13, marginBottom: 14, background: "#FAF6EE" }}>
                <option value="">İl seç...</option>
                {TURKIYE_IL_ILCE.map((i) => <option key={i.plaka} value={i.il}>{i.il}</option>)}
              </select>

              {hedefIl && (
                <>
                  <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 6 }}>İLÇE</label>
                  <select value={hedefIlce} onChange={(e) => setHedefIlce(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 13, marginBottom: 14, background: "#FAF6EE" }}>
                    <option value="">İlçe seç...</option>
                    {(TURKIYE_IL_ILCE.find((i) => i.il === hedefIl)?.ilceler || []).map((ilce) => <option key={ilce} value={ilce}>{ilce}</option>)}
                  </select>
                </>
              )}

              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 6 }}>HEDEF OKUL ADI</label>
              <input value={hedefOkulAdi} onChange={(e) => setHedefOkulAdi(e.target.value)} placeholder="Örn: XYZ Fen Lisesi"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 13, marginBottom: 14, background: "#FAF6EE" }} />

              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 6 }}>HEDEF PUAN (100-500 arası, kendi araştırdığın)</label>
              <input type="number" min="100" max="500" value={hedefPuanDeger} onChange={(e) => setHedefPuanDeger(e.target.value)} placeholder="Örn: 470"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 13, marginBottom: 16, background: "#FAF6EE" }} />

              <button className="kx-btn" onClick={hedefOkuluKaydet} disabled={hedefKaydediliyor} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {hedefKaydediliyor ? "Kaydediliyor..." : hedefKaydedildi ? "✓ Kaydedildi" : "Kaydet"}
              </button>

              <p style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 10, lineHeight: 1.6, textAlign: "center" }}>
                ℹ️ Okul taban puanları her yıl değişir ve resmi olarak yayınlanmaz — hedef puanını güncel kaynaklardan kendin araştırıp gir.
              </p>
            </div>
          </div>
        )}

        {mod === "formulkart" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>📐</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Formül ve Kural Kartları</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Sınav öncesi hızlı tekrar için — ders ve ünite seç.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {gorunurDersler(sinif).map((d) => (
                <button key={d.ad} onClick={() => { setFormulKartDers(d.ad); setFormulKartUnite(null); }} className="kx-btn" style={{
                  padding: "12px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                  border: `1.5px solid ${formulKartDers === d.ad ? COLORS.coral : COLORS.line}`, background: formulKartDers === d.ad ? "#FFF1EF" : COLORS.page,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{d.emoji}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700 }}>{d.ad}</div>
                </button>
              ))}
            </div>

            {formulKartDers && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 14, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 8, letterSpacing: 0.5 }}>ÜNİTE SEÇ</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {dersinUniteleri(formulKartDers, sinif).map((u, idx) => {
                    const secili = formulKartUnite === u;
                    return (
                      <button key={u} onClick={() => { setFormulKartUnite(u); formulKartiGetir(formulKartDers, u); }} className="kx-btn" style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}`, background: secili ? "#FEF8E8" : "#FAF6EE",
                      }}>
                        <span style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: secili ? COLORS.mustard : "#fff", color: secili ? "#fff" : COLORS.muted, border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}` }}>{secili ? "✓" : idx + 1}</span>
                        <span style={{ fontSize: 12, fontWeight: secili ? 700 : 500 }}>{u}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {formulKartUnite && (
              <div className="kx-fadein" style={{ background: "#1B2430", borderRadius: 14, padding: 20 }}>
                <p style={{ color: COLORS.mustard, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>⚡ {formulKartUnite} — Hızlı Bakış</p>
                {formulKartYukleniyor && !formulKartCache[`${formulKartDers}::${formulKartUnite}::${sinif}`] ? (
                  <p style={{ color: "#8A968E", fontSize: 12.5, textAlign: "center" }}>Hazırlanıyor...</p>
                ) : (
                  <div style={{ color: "#fff", fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
                    {formulKartCache[`${formulKartDers}::${formulKartUnite}::${sinif}`]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mod === "sinavstratejisi" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>🎯</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Sınav Stratejisi Rehberi</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Bilgi kadar, sınavı iyi yönetmek de önemli.</p>
            </div>

            {[
              { baslik: "⏱️ Zaman Yönetimi", maddeler: [
                "LGS'de sözel oturum 75 dakika (50 soru), sayısal oturum 80 dakika (40 soru) — soru başına ortalama 1.5-2 dakikan var.",
                "Bir soruda 2 dakikadan fazla takılıyorsan işaretle, geç — sona dönersin.",
                "Sınavın son 10 dakikasını, işaretlediğin ama boş bıraktığın sorulara ayır.",
              ]},
              { baslik: "❌ Hangi Soruyu Atlamalı", maddeler: [
                "Hiç fikrin olmayan bir soruda zaman kaybetme, işaretle geç.",
                "İki seçeneğe indirip emin olamadığın sorularda mantıklı tahmin yap (LGS'de boş ile yanlış net kaybı benzer olabilir, ama kör tahmin yerine eleme yap).",
                "Uzun paragraflı sorularda önce SORUYU oku, sonra paragrafa o gözle bak — zaman kazandırır.",
              ]},
              { baslik: "✅ Eleme Stratejisi", maddeler: [
                "Kesin yanlış olduğunu bildiğin şıkları hemen çiz, kalan 2 şık arasında karar ver.",
                "Çeldiricilere dikkat et — 'her zaman', 'asla' gibi kesin ifadeler genelde yanlış şıklarda olur.",
                "Matematikte işlem yapmadan önce şıklara bak — bazen tahminle eleme yapılabilir.",
              ]},
              { baslik: "🧠 Sınav Günü", maddeler: [
                "Sınavdan önceki gece yeni konu çalışma, sadece hafif tekrar yap ve erken uyu.",
                "Sınav sabahı ağır/yağlı kahvaltıdan kaçın, kan şekerini dengede tutacak hafif bir kahvaltı yap.",
                "İlk soruda zorlanırsan panikleme — kolay sorulardan başlayıp geri dönebilirsin, sıralamayı takip etmek zorunda değilsin.",
              ]},
            ].map((bolum) => (
              <div key={bolum.baslik} style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{bolum.baslik}</p>
                {bolum.maddeler.map((m, i) => (
                  <p key={i} style={{ fontSize: 12.5, lineHeight: 1.7, color: "#3A4550", marginBottom: 8, paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: COLORS.coral, fontWeight: 900 }}>•</span>{m}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {mod === "puanhesap" && (() => {
          const KATSAYILAR = { Turkce: 4, Matematik: 4, "Fen Bilimleri": 4, "T.C. Inkilap Tarihi": 1, "Din Kulturu": 1, Ingilizce: 1 };
          const MAX_SORU = { Turkce: 20, Matematik: 20, "Fen Bilimleri": 20, "T.C. Inkilap Tarihi": 10, "Din Kulturu": 10, Ingilizce: 10 };
          let toplamAgirlikliNet = 0;
          let herhangiGirdiVar = false;
          const netler = {};
          Object.keys(KATSAYILAR).forEach((ders) => {
            const d = Number(puanGirdi[ders]?.d) || 0;
            const y = Number(puanGirdi[ders]?.y) || 0;
            if (puanGirdi[ders]?.d !== "" || puanGirdi[ders]?.y !== "") herhangiGirdiVar = true;
            const net = Math.max(0, d - y / 3);
            netler[ders] = net;
            toplamAgirlikliNet += net * KATSAYILAR[ders];
          });
          const MAX_AGIRLIKLI_NET = 20 * 4 + 20 * 4 + 20 * 4 + 10 * 1 + 10 * 1 + 10 * 1; // 270
          const tahminiPuan = herhangiGirdiVar ? Math.round(100 + (toplamAgirlikliNet / MAX_AGIRLIKLI_NET) * 400) : null;

          return (
            <div>
              <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
                <p style={{ fontSize: 22, marginBottom: 4 }}>🧮</p>
                <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>LGS Puan Hesaplayıcı</p>
                <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Her dersten doğru/yanlış sayını gir, tahmini puanını gör.</p>
              </div>

              <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
                {Object.keys(KATSAYILAR).map((ders) => (
                  <div key={ders} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${COLORS.line}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{ders}</span>
                      <span style={{ fontSize: 10.5, color: COLORS.muted }}>{MAX_SORU[ders]} soru · Katsayı ×{KATSAYILAR[ders]}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" min="0" max={MAX_SORU[ders]} value={puanGirdi[ders].d} placeholder="Doğru"
                        onChange={(e) => setPuanGirdi((eski) => ({ ...eski, [ders]: { ...eski[ders], d: e.target.value } }))}
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13, background: "#FAF6EE" }} />
                      <input type="number" min="0" max={MAX_SORU[ders]} value={puanGirdi[ders].y} placeholder="Yanlış"
                        onChange={(e) => setPuanGirdi((eski) => ({ ...eski, [ders]: { ...eski[ders], y: e.target.value } }))}
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13, background: "#FAF6EE" }} />
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, color: COLORS.coral }}>
                        Net: {netler[ders].toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {herhangiGirdiVar && (
                <div className="kx-pop" style={{ background: "#1B2430", borderRadius: 14, padding: 20, textAlign: "center" }}>
                  <p style={{ color: "#8A968E", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>TAHMİNİ PUAN (100-500 arası)</p>
                  <p style={{ color: COLORS.mustard, fontSize: 44, fontWeight: 900, lineHeight: 1, marginBottom: 6 }}>{tahminiPuan}</p>
                  <p style={{ color: "#C9D4C7", fontSize: 11.5, marginBottom: 10 }}>Ağırlıklı Net Toplamı: {toplamAgirlikliNet.toFixed(2)} / {MAX_AGIRLIKLI_NET}</p>
                  <p style={{ color: "#6B7566", fontSize: 10, lineHeight: 1.6, borderTop: "1px solid #2A3540", paddingTop: 10 }}>
                    ⚠️ Bu, basitleştirilmiş bir TAHMİNDİR. Gerçek LGS puanı, ülke geneli ortalama ve standart sapmaya göre hesaplanır (MEB her yıl açıklar) — bu yüzden gerçek sonuçtan farklı çıkabilir. Sadece fikir vermesi içindir.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {mod === "kocluk" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p className="kx-float" style={{ fontSize: 26, marginBottom: 4 }}>📅</p>
              <p style={{ fontWeight: 700, fontSize: 16, color: COLORS.page, marginBottom: 4 }}>Haftalık Çalışma Planı</p>
              <p style={{ fontSize: 12, color: "#B7C4BC", lineHeight: 1.5 }}>Koç, zayıf derslerine göre sana özel bir program hazırlar.</p>
            </div>

            <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}`, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.coral, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Zayıf Dersler</p>
                {otomatikTespit && <span style={{ fontSize: 10, color: COLORS.coral, fontWeight: 600 }}>· otomatik tespit edildi</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }} className="kx-pop">
                {gorunurDersler(sinif).map((d) => {
                  const s = zayifDersler.includes(d.ad);
                  return (
                    <button key={d.ad} onClick={() => dersToggle(d.ad)} style={{
                      padding: "12px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                      border: `2px solid ${s ? COLORS.coral : COLORS.line}`,
                      background: s ? "#FFF1EF" : "#FAF6EE",
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{d.emoji}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{d.ad}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}`, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: COLORS.coral, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Zaman Planın</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "#FAF6EE", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, marginBottom: 6 }}>HAFTALIK SAAT</p>
                  <input type="number" value={haftalikSaat} onChange={(e) => setHaftalikSaat(Number(e.target.value))} style={{ width: "100%", boxSizing: "border-box", textAlign: "center", padding: "6px 0", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 16, fontWeight: 700, background: "#fff" }} />
                </div>
                <div style={{ flex: 1, background: "#FAF6EE", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, marginBottom: 6 }}>KALAN HAFTA</p>
                  <input type="number" value={kalanHafta} onChange={(e) => setKalanHafta(Number(e.target.value))} style={{ width: "100%", boxSizing: "border-box", textAlign: "center", padding: "6px 0", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 16, fontWeight: 700, background: "#fff" }} />
                </div>
              </div>
            </div>

            <button className="kx-btn" onClick={planOlustur} disabled={zayifDersler.length === 0 || yukleniyor} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: zayifDersler.length === 0 ? 0.5 : 1, boxShadow: "0 4px 14px rgba(255,107,94,0.35)" }}>
              {yukleniyor === "plan" ? "Hazırlanıyor…" : "📅 Çalışma Planı Oluştur"}
            </button>

            {plan && (
              <div className="kx-fadein" style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: COLORS.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>🎯</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 4 }}>Koçun</p>
                  <div style={{ background: COLORS.page, borderRadius: "4px 16px 16px 16px", padding: 16, border: `1px solid ${COLORS.line}`, whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.7 }}>
                    {plan}
                  </div>

                  {haftalikGorevListesi && (
                    <div style={{ background: COLORS.page, borderRadius: 12, padding: 14, marginTop: 10, border: `1px solid ${COLORS.line}` }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 10, letterSpacing: 0.5 }}>📅 GUNLUK GOREVLER</p>
                      {haftalikGorevListesi.map((g, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < haftalikGorevListesi.length - 1 ? `1px solid ${COLORS.line}` : "none" }}>
                          <span style={{ width: 62, flexShrink: 0, fontSize: 11, fontWeight: 700, color: COLORS.coral }}>{g.gun}</span>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{g.ders}</span>
                            <p style={{ fontSize: 12, color: COLORS.muted, margin: "2px 0 0" }}>{g.gorev}</p>
                          </div>
                        </div>
                      ))}
                      <p style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 10, fontStyle: "italic" }}>Bu görevler Profilinde "Bekleyen Ödevlerin" altında da görünecek.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mod === "anlatim" && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[5, 6, 7, 8].map((s) => (
                <button key={s} onClick={() => setSinif(s)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${sinif === s ? COLORS.coral : COLORS.line}`, background: sinif === s ? "#FFF1EF" : "#fff", color: COLORS.ink }}>
                  {s}. Sinif
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
              {gorunurDersler(sinif).map((d) => (
                <button key={d.ad} onClick={() => { setDers(d.ad); setUniteSec(null); }} style={{ padding: "12px 6px", borderRadius: 10, border: `1.5px solid ${ders === d.ad ? COLORS.coral : COLORS.line}`, background: ders === d.ad ? "#FFF1EF" : COLORS.page, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{d.emoji}</div>{d.ad}
                </button>
              ))}
            </div>
            <div style={{ background: COLORS.page, borderRadius: 12, padding: 14, marginBottom: 14, border: `1px solid ${COLORS.line}` }}>
              {ders && sinif === 8 && MUFREDAT[ders] && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>UNITE SEC (sirayla acilir - MEB mufredati, dogrulanmis)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {MUFREDAT[ders].map((u) => {
                      const acikMi = uniteAcikMi(ders, u);
                      const tamamMi = (tamamlananUniteler[ders] || []).includes(u);
                      return (
                        <button key={u} onClick={() => { if (acikMi) { const yeni = uniteSec === u ? null : u; setUniteSec(yeni); setAktifAltKonu(null); if (yeni) altKonulariGetir(ders, yeni); } }} disabled={!acikMi} style={{
                          padding: "5px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: acikMi ? "pointer" : "not-allowed",
                          border: `1.5px solid ${uniteSec === u ? COLORS.coral : COLORS.line}`,
                          background: uniteSec === u ? "#FFF1EF" : tamamMi ? "#EAF7EE" : "#fff",
                          color: acikMi ? COLORS.ink : "#B8B8B8", opacity: acikMi ? 1 : 0.6,
                        }}>{tamamMi ? "✓ " : !acikMi ? "🔒 " : ""}{u}</button>
                      );
                    })}
                  </div>
                  {uniteSec && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLORS.line}` }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>
                        ALT KONULAR {altKonuYukleniyor && "(hazirlaniyor…)"} <em style={{ fontWeight: 400 }}>
                          {(DOGRULANMIS_ALT_KONULAR[altKonuAnahtari(ders, uniteSec)] || DOGRULANMIS_ALT_KONULAR[altKonuAnahtariEski(ders, uniteSec)]) ? "(MEB kazanimi - dogrulanmis)" : "(AI onerisi, resmi liste degil)"}
                        </em>
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {(altKonuCache[altKonuAnahtari(ders, uniteSec)] || []).map((ak) => {
                          const acik = altKonuAcikMi(ders, uniteSec, ak);
                          const tam = altKonuTamamlandiMi(ders, uniteSec, ak);
                          return (
                            <button key={ak} onClick={() => { if (acik) { setAktifAltKonu(ak); setKonu(ak); } }} disabled={!acik} style={{
                              padding: "5px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: acik ? "pointer" : "not-allowed",
                              border: `1.5px solid ${aktifAltKonu === ak ? COLORS.mustard : COLORS.line}`,
                              background: aktifAltKonu === ak ? "#FEF8E8" : tam ? "#EAF7EE" : "#fff",
                              color: acik ? COLORS.ink : "#B8B8B8", opacity: acik ? 1 : 0.6,
                            }}>{tam ? "✓ " : !acik ? "🔒 " : ""}{ak}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {ders && sinif !== 8 && (
                <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10, fontStyle: "italic" }}>
                  {sinif}. sinif icin dogrulanmis unite listesi henuz eklenmedi, konuyu asagiya kendin yaz.
                </p>
              )}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[["basit", "Basit"], ["orta", "Orta"], ["zor", "Zor"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => setZorlukSec(k)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${zorlukSec === k ? COLORS.coral : COLORS.line}`, background: zorlukSec === k ? "#FFF1EF" : "#fff", color: COLORS.ink }}>
                    {etiket}
                  </button>
                ))}
              </div>
              <input value={konu} onChange={(e) => setKonu(e.target.value)} placeholder="orn. Uslu Sayilar..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 14, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button onClick={konuAnlat} disabled={!ders || !konu.trim() || yukleniyor} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>{yukleniyor === "aciklama" ? "Hazirlaniyor…" : "Konuyu Anlat"}</button>
                <button onClick={() => soruUret(false)} disabled={!ders || !konu.trim() || yukleniyor} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600 }}>{yukleniyor === "quiz" ? "Uretiliyor…" : "5 Soru"}</button>
                <button onClick={() => soruUret(true)} disabled={!ders || !konu.trim() || yukleniyor} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.coral}`, background: "transparent", color: COLORS.coral, fontWeight: 600, fontSize: 12 }}>{yukleniyor === "quiz" ? "Uretiliyor…" : "15 Soru (Fasikul)"}</button>
              </div>
              <button onClick={paragrafPratigiUret} disabled={!ders || !konu.trim() || yukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.mustard}`, background: "transparent", color: "#8A6D00", fontWeight: 600, fontSize: 12.5 }}>
                {yukleniyor === "paragraf" ? "Hazirlaniyor…" : "📖 20 Soruluk Paragraf Pratigi + Puf Noktalari"}
              </button>
            </div>
            {paragrafMetni && (
              <div style={{ background: "#FFF8E8", borderRadius: 12, padding: 16, marginBottom: 14, border: `1px solid ${COLORS.mustard}`, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#8A6D00" }}>📖 METIN</p>
                {paragrafMetni}
                {paragrafPufNoktalari && (
                  <>
                    <p style={{ fontWeight: 700, fontSize: 12, margin: "14px 0 8px", color: "#8A6D00" }}>💡 PUF NOKTALARI / ALTIN KURALLAR</p>
                    {paragrafPufNoktalari}
                  </>
                )}
              </div>
            )}
            {aciklama && (() => {
              const { govde, dikkatMaddeleri } = konuMetniAyir(aciklama);
              const bloklar = konuMetniBloklaraAyir(govde);
              return (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ background: "#FDFBF6", borderRadius: 12, border: `1px solid ${COLORS.line}`, boxShadow: "0 3px 14px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ height: 5, background: COLORS.gradient }} />
                    <div style={{ padding: "22px 20px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                      {bloklar.map((b, i) => b.tur === "baslik" ? (
                        <p key={i} style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.coral, marginTop: i === 0 ? 0 : 20, marginBottom: 8, borderBottom: `2px solid ${COLORS.line}`, paddingBottom: 6 }}>{b.metin}</p>
                      ) : b.tur === "etiketli" ? (
                        <p key={i} style={{ fontSize: 14.5, lineHeight: 1.85, color: "#2A2A2A", margin: "0 0 12px" }}><span style={{ fontWeight: 700, color: COLORS.mustard, fontStyle: "italic" }}>{b.etiket}: </span>{b.metin}</p>
                      ) : (
                        <p key={i} style={{ fontSize: 14.5, lineHeight: 1.85, color: "#2A2A2A", margin: "0 0 12px" }}>{b.metin}</p>
                      ))}
                    </div>
                  </div>
                  {dikkatMaddeleri && (
                    <div style={{ background: "#E8503F", borderRadius: 10, padding: 14, marginTop: 10 }}>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>⚠ DIKKAT EDILECEK NOKTALAR</p>
                      {dikkatMaddeleri.map((m, i) => (
                        <p key={i} style={{ color: "#fff", fontSize: 12, lineHeight: 1.6, margin: "2px 0" }}>• {m}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            {quiz && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                {quiz.map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                      {i + 1}. {s.soru}
                      {s.zorluk && (
                        <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: s.zorluk === "kolay" ? "#EAF7EE" : s.zorluk === "orta" ? "#FFF8E8" : "#FFF1EF", color: s.zorluk === "kolay" ? RENK_BASARI : s.zorluk === "orta" ? "#B8860B" : COLORS.coral }}>{s.zorluk}</span>
                      )}
                    </div>
                    {(s.secenekler || []).map((sec, j) => {
                      const secili = cevaplar[i] === j, dogru = gonderildi && j === s.dogruIndex, yanlis = gonderildi && secili && j !== s.dogruIndex;
                      return <button key={j} onClick={() => !gonderildi && setCevaplar((c) => ({ ...c, [i]: j }))} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13, cursor: gonderildi ? "default" : "pointer", border: `1.5px solid ${dogru ? RENK_BASARI : yanlis ? COLORS.coral : secili ? COLORS.mustard : COLORS.line}`, background: dogru ? "#EAF7EE" : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff" }}>{sec}</button>;
                    })}
                  </div>
                ))}
                {!gonderildi ? (
                  <button onClick={cevaplariGonder} disabled={Object.keys(cevaplar).length < quiz.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600 }}>Cevaplari Gonder</button>
                ) : (
                  <>
                    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 18, paddingTop: 4, marginBottom: 10 }}>Sonuc: {dogruSayisi} / {quiz.length} dogru</div>
                    <button onClick={() => window.print()} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🖨️ PDF Olarak Kaydet / Yazdir</button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#7C8AA5", marginTop: 24 }}>
        <a href="/gizlilik" style={{ color: "#7C8AA5" }}>Gizlilik Politikasi</a> · <a href="/kullanim-sartlari" style={{ color: "#7C8AA5" }}>Kullanim Sartlari</a> · <a href="/erisilebilirlik" style={{ color: "#7C8AA5" }}>Erisilebilirlik</a>
      </p>
    </div>
  );
}
