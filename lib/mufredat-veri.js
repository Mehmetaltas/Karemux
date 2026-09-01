// Ana ogrenci uygulamasindaki (app/page.js) MUFREDAT + MUFREDAT_DIGER_SINIFLAR
// sabitlerinin BIREBIR KOPYASI (1 Eylul) - ogretmen materyal araclarinin
// gercek, tam (5-8. sinif) unite listelerine erisebilmesi icin. app/page.js
// DEGISTIRILMEDI (risk almamak icin), veri burada AYRI tutuluyor - ikisi
// senkron olmali, biri guncellenirse digeri de guncellenmeli.

export const MUFREDAT = {
  "Matematik": ["Carpanlar ve Katlar", "Uslu Ifadeler", "Karekoklu Ifadeler", "Veri Analizi", "Olasilik", "Cebirsel Ifadeler ve Ozdeslikler", "Dogrusal Denklemler", "Esitsizlikler", "Ucgenler", "Eslik ve Benzerlik", "Donusum Geometrisi", "Geometrik Cisimler"],
  "Fen Bilimleri": ["Mevsimler ve Iklim", "DNA ve Genetik Kod", "Basinc", "Madde ve Endustri", "Basit Makineler", "Enerji Donusumleri ve Cevre Bilimi", "Elektrik Yukleri ve Elektrik Enerjisi"],
  "Turkce": ["Fiilimsiler", "Cumlenin Ogeleri", "Cumle Turleri", "Anlatim Bozukluklari", "Yazim Kurallari", "Noktalama Isaretleri", "Paragrafta Anlam", "Soz Sanatlari", "Fiilde Cati"],
  "T.C. Inkilap Tarihi": ["Bir Kahraman Doguyor", "Milli Uyanis: Bagimsizlik Yolunda Atilan Adimlar", "Ya Istiklal Ya Olum", "Ataturkculuk ve Cagdaslasan Turkiye", "Demokratiklesme Cabalari", "Ataturk Donemi Turk Dis Politikasi", "Ataturk'un Olumu ve Sonrasi", "II. Dunya Savasi Surecinde Turkiye"],
  "Din Kulturu": ["Kader Inanci", "Zekat ve Sadaka", "Hz. Muhammed'in Ornekligi", "Kur'an-i Kerim'de Sunulan Ornek Sahsiyetler", "Din ve Hayat"],
  "Ingilizce": ["School Life & Education", "Classroom Life & Learning", "Personal Life & Well-Being", "Family Life & Home", "Life in the Neighbourhood & City", "Life in the World and Culture", "Life in Nature & Global Problems", "Life in the Universe & Future"],
};

export const MUFREDAT_DIGER_SINIFLAR = {
  "4::Matematik": ["Sayilar ve Nicelikler", "Islemlerden Cebirsel Dusunmeye", "Nesnelerin Geometrisi", "Olaylarin Olasiligi ve Veriye Dayali Arastirma"],
  "5::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],
  "6::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme ve Degisimler", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],
  "7::Matematik": ["Sayilar ve Nicelikler", "Islemlerle Cebirsel Dusunme ve Degisimler", "Geometrik Sekiller", "Geometrik Nicelikler", "Istatistiksel Arastirma Sureci", "Veriden Olasiliga"],
  "4::Fen Bilimleri": ["Bilime Yolculuk", "Saglikli Besleniyorum", "Dunyamizi Kesfedelim", "Maddenin Degisimi", "Miknatisi Kesfediyorum", "Enerji Dedektifleri", "Isigin Pesinde", "Surdurulebilir Sehirler ve Topluluklar"],
  "5::Fen Bilimleri": ["Gokyuzundeki Komsularimiz ve Biz", "Kuvveti Taniyalim", "Canlilarin Yapisina Yolculuk", "Isigin Dunyasi", "Maddenin Dogasi", "Yasamimizdaki Elektrik", "Surdurulebilir Yasam ve Geri Donusum"],
  "6::Fen Bilimleri": ["Gunes Sistemi ve Tutulmalar", "Kuvvetin Etkisinde Hareket", "Canlilarda Sistemler", "Isigin Yansimasi ve Renkler", "Maddenin Ayirt Edici Ozellikleri", "Elektrigin Iletimi ve Direnc", "Surdurulebilir Yasam ve Etkilesim"],
  "7::Fen Bilimleri": ["Uzay Cagi", "Kuvvet ve Enerjiyi Kesfedelim", "Vucudumuzdaki Sistemler", "Isigin Kirilmasi ve Mercekler", "Maddenin Dogasina Yolculuk", "Elektriklenme", "Surdurulebilir Yasam ve Enerji"],
  "4::Turkce": ["Dinleme ve Izleme", "Konusma", "Okuma", "Yazma"],
  "5::Turkce": ["Oyun Dunyasi", "Ataturk'u Tanimak", "Duygularimi Taniyorum", "Geleneklerimiz", "Iletisim ve Sosyal Iliskiler", "Saglikli Yasiyorum"],
  "4::Din Kulturu": ["Gunluk Hayat ve Din", "Allah Sevgisi", "Peygamberlerin Sevgisi", "Ahlaki Degerlerimiz", "Haklar ve Sorumluluklar"],
  "5::Din Kulturu": ["Allah Inanci", "Namaz", "Kur'an-i Kerim", "Peygamber Kissalari", "Mimarimizde Dini Motifler"],
  "4::Ingilizce": ["School Life", "Classroom Life", "Personal Life", "Family Life", "Homes Houses and the Neighbourhood", "Life in the City and the World"],
  "5::Ingilizce": ["School Life", "Classroom Life", "Personal Life", "Family Life", "Life in the Neighbourhood & City", "Life in the World", "Life in Nature", "Life in the Universe & Future"],
  "4::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],
  "5::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],
  "6::Turkce": ["Dilimizin Zenginligi", "Bagimsizlik Yolu", "Farkli Dunyalar", "Iletisim ve Sosyal Iliskiler", "Bilim ve Teknoloji", "Lider Ruhlar"],
  "7::Turkce": ["Hayat Boyu Gelisim", "Bir Hilal Ugruna", "Iletisim ve Sosyal Iliskiler", "Turk Sanati", "Okuma Kulturu", "Hak ve Sorumluluklar"],
  "6::Din Kulturu": ["Peygamber ve Ilahi Kitap Inanci", "Ramazan ve Oruc", "Ahlaki Davranislar", "Peygamberliginden Once Hz. Muhammed", "Kulturumuzdeki Dini Motifler"],
  "7::Din Kulturu": ["Melek ve Ahiret Inanci", "Hac Umre ve Kurban", "Islam Dusuncesinde Yorumlar", "Peygamber Olarak Hz. Muhammed", "Yasayan Dunya Dinleri"],
  "6::Ingilizce": ["School Life", "Classroom Life", "Personal Life", "Family Life", "Life in the Neighbourhood & City", "Life in the World & Culture", "Life in Nature & Global Problems", "Life in the Universe & Future"],
  "7::Ingilizce": ["School Life & Education", "Classroom Life & Learning", "Personal Life & Well-Being", "Family Life & Home", "Life in the Neighbourhood & City", "Life in the World & Culture", "Life in Nature", "Life in the Universe & Future"],
  "6::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],
  "7::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],
};

export function uniteleriGetir(sinif, ders) {
  if (Number(sinif) === 8) return MUFREDAT[ders] || [];
  return MUFREDAT_DIGER_SINIFLAR[`${sinif}::${ders}`] || [];
}
