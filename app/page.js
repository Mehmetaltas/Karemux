"use client";
import { useState, useEffect, useRef } from "react";

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
  { ad: "Din Kulturu", emoji: "🕌" }, { ad: "Ingilizce", emoji: "🇬🇧" },
];

// Gercek MEB 8. sinif (LGS) mufredati - ders bazinda unite listesi.
// Kaynak: MEB güncel müfredat + LGS konu dağılımı analizleri (2026).
const MUFREDAT = {
  "Matematik": ["Carpanlar ve Katlar", "Uslu Ifadeler", "Karekoklu Ifadeler", "Veri Analizi", "Olasilik", "Cebirsel Ifadeler ve Ozdeslikler", "Dogrusal Denklemler", "Esitsizlikler", "Ucgenler", "Eslik ve Benzerlik", "Donusum Geometrisi", "Geometrik Cisimler"],
  "Fen Bilimleri": ["Mevsimler ve Iklim", "DNA ve Genetik Kod", "Basinc", "Madde ve Endustri", "Basit Makineler", "Enerji Donusumleri ve Cevre Bilimi", "Elektrik Yukleri ve Elektrik Enerjisi"],
  "Turkce": ["Fiilimsiler", "Cumlenin Ogeleri", "Cumle Turleri", "Anlatim Bozukluklari", "Yazim Kurallari", "Noktalama Isaretleri", "Paragrafta Anlam", "Soz Sanatlari", "Fiilde Cati"],
  "T.C. Inkilap Tarihi": ["Bir Kahraman Doguyor", "Milli Uyanis: Bagimsizlik Yolunda Atilan Adimlar", "Ya Istiklal Ya Olum", "Ataturkculuk ve Cagdaslasan Turkiye", "Demokratiklesme Cabalari", "Ataturk Donemi Turk Dis Politikasi", "Ataturk'un Olumu ve Sonrasi", "II. Dunya Savasi Surecinde Turkiye"],
  "Din Kulturu": ["Kader Inanci", "Zekat ve Sadaka", "Hz. Muhammed'in Ornekligi", "Kur'an-i Kerim'de Sunulan Ornek Sahsiyetler", "Din ve Hayat"],
  "Ingilizce": ["Friendship", "Teen Life", "In the Kitchen", "On the Phone", "The Internet", "Adventures", "Tourism", "Chores", "Science", "Natural Forces"],
};

// 5/6/7. sinif icin ayri unite listeleri - MUFREDAT (yukarida) 8. sinif icindir (LGS
// sinifi - MEB henuz eski mufredati degistirmedi, o veri saglam/guncel).
//
// ONEMLI - MUFREDAT GECIS BELIRSIZLIGI (arastirilip dogrulandi, Agustos 2026):
// MEB "Turkiye Yuzyili Maarif Modeli" adiyla YENI bir mufredati KADEMELI olarak
// devreye sokuyor: 2024-25'te 5. sinif, 2025-26'da 6. sinif, 2026-27'de (yani TAM
// SU AN) 7. sinifin gecmesi bekleniyor. Yani:
//  - 6. sinif ARTIK YENI mufredatta olmali - ama asagidaki veri ESKI (2018, M.6.x)
//    mufredata dayanmaktadir - konu isimleri/sirasi GUNCEL OLMAYABILIR.
//  - 7. sinifin yeni mufredati bu yazi itibariyle HENUZ RESMEN NETLESMEMISTIR
//    (kaynaklar "kesin ayrintilar icin MEB duyurulari takip edilmeli" diyor) -
//    bu yuzden bilinen en guvenilir veri olarak eski (2018) mufredat kullanildi.
// Eski mufredat verisi, sinif seviyesine 8. sinif icerigi gostermekten kesinlikle
// daha dogrudur (konular hala pedagojik olarak gecerli, sadece YENIDEN
// gruplanmis/yer degistirmis olabilir) - ama YENI mufredat resmen yayinlanip
// netlesince bu veri GOZDEN GECIRILMELI ve guncellenmelidir.
const MUFREDAT_DIGER_SINIFLAR = {
  "6::Matematik": ["Carpanlar ve Katlar", "Tam Sayilar", "Kesirlerle Islemler", "Ondalik Gosterim", "Oran", "Cebirsel Ifadeler", "Veri Toplama ve Degerlendirme", "Merkezi Egilim ve Yayilim Olculeri", "Acilar", "Cember", "Alan Olcme", "Geometrik Cisimler ve Sivi Olcme"],
  "7::Matematik": ["Tam Sayilarla Islemler", "Rasyonel Sayilar", "Cebirsel Ifadeler", "Oran ve Oranti", "Yuzdeler", "Dogrular ve Acilar", "Cokgenler", "Cember ve Daire", "Veri Analizi"],
  "6::Fen Bilimleri": ["Gunes Sistemi ve Tutulmalar", "Vucudumuzdaki Sistemler", "Kuvvet ve Hareket", "Madde ve Isi", "Ses ve Ozellikleri", "Vucudumuzdaki Sistemler ve Sagligi", "Elektrigin Iletimi", "Uygulamali Bilim"],
  "7::Fen Bilimleri": ["Gunes Sistemi ve Otesi", "Hucre ve Bolunmeler", "Kuvvet ve Enerji", "Saf Madde ve Karisimlar", "Isigin Madde ile Etkilesimi", "Canlilarda Ureme Buyume ve Gelisme", "Elektrik Devreleri", "Uygulamali Bilim"],
  // Turkce 6/7 - Matematik/Fen'in aksine Turkce kazanimlari numarali "unite" degil
  // beceri alani (Dinleme/Konusma/Okuma/Yazma) bazinda yapilandirilmis, bu yuzden asagidaki
  // liste 8. sinifta oldugu gibi standart konu basliklarindan derlenmistir - Matematik/Fen
  // kadar net resmi kaynaktan dogrulanmadi, ORTA guven seviyesi.
  "6::Turkce": ["Sozcukte Anlam", "Isim Tamlamasi", "Sifat Tamlamasi", "Zamirler", "Edat Baglac Unlem", "Cumlede Anlam", "Paragrafta Anlam", "Yazim Kurallari", "Noktalama Isaretleri"],
  "7::Turkce": ["Fiilimsiler", "Cumlenin Ogeleri", "Fiilde Cati", "Anlatim Bozukluklari", "Cumle Turleri", "Paragrafta Anlam", "Soz Sanatlari", "Yazim Kurallari", "Noktalama Isaretleri"],
  // Din Kulturu 6. sinif: sadece 3 unite dogrulanabildi, listenin eksik olma ihtimali var.
  "6::Din Kulturu": ["Peygamber ve Ilahi Kitap Inanci", "Ramazan ve Oruc", "Ahlaki Davranislar"],
  "7::Din Kulturu": ["Melek ve Ahiret Inanci", "Hac ve Kurban", "Ahlaki Davranislar", "Allah'in Kulu ve Elcisi: Hz. Muhammed", "Islam Dusuncesinde Yorumlar"],
  "6::Ingilizce": ["Life", "Yummy Breakfast", "Downtown", "Weather and Emotions", "At the Fair", "Occupations", "Holidays", "Bookworms", "Saving the Planet", "Democracy"],
  "7::Ingilizce": ["Appearance and Personality", "Sports", "Biographies", "Wild Animals", "Television", "Celebrations", "Dreams", "Public Buildings", "Environment", "Planets"],
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
  // T.C. Inkilap Tarihi ve Ataturkculuk (8. sinif) - MEB resmi ogretim programindan (ITA.8.x)
  "T.C. Inkilap Tarihi::Bir Kahraman Doguyor": ["Mustafa Kemal'in Cocuklugu ve Egitimi", "Askeri ve Idari Gorevleri", "I. Dunya Savasi'nda Osmanli Devleti"],
  "T.C. Inkilap Tarihi::Milli Uyanis: Bagimsizlik Yolunda Atilan Adimlar": ["Mondros Ateskes Antlasmasi ve Isgaller", "Kongreler Donemi (Amasya, Erzurum, Sivas)", "Misak-i Milli", "TBMM'nin Acilisi"],
  "T.C. Inkilap Tarihi::Ya Istiklal Ya Olum": ["Kurtulus Savasi Cepheleri", "Buyuk Taarruz ve Baskumandanlik Meydan Savasi", "Lozan Antlasmasi"],
  "T.C. Inkilap Tarihi::Ataturkculuk ve Cagdaslasan Turkiye": ["Ataturk Ilkeleri", "Siyasi Alanda Inkilaplar", "Hukuk Alaninda Inkilaplar", "Toplumsal Alanda Inkilaplar", "Ekonomi Alaninda Gelismeler"],
  "T.C. Inkilap Tarihi::Demokratiklesme Cabalari": ["Mustafa Kemal'e Suikast Girisimi", "Cumhuriyete Yonelik Ic Tehditler"],
  "T.C. Inkilap Tarihi::Ataturk Donemi Turk Dis Politikasi": ["Dis Politikanin Temel Ilkeleri", "Bogazlar ve Musul Sorunu", "Hatay'in Anavatana Katilmasi"],
  "T.C. Inkilap Tarihi::Ataturk'un Olumu ve Sonrasi": ["Ataturk'un Olumune Iliskin Degerlendirmeler", "Ataturk'un Fikir ve Eserlerinin Kalicilik Bilinci"],
  // Din Kulturu ve Ahlak Bilgisi (8. sinif) - MEB resmi ogretim programindan (DKAB.8.x)
  "Din Kulturu::Kader Inanci": ["Kader ve Kaza Inanci", "Ilim-Irade-Sorumluluk Iliskisi", "Kader ile Ilgili Yanlis Anlayislar"],
  "Din Kulturu::Zekat ve Sadaka": ["Zekat Ibadeti", "Sadaka Ibadeti", "Maun Suresi"],
  // Ingilizce (8. sinif) - MEB resmi ogretim programi HER UNITEYI ayni beceri
  // cercevesiyle yapilandirir: Listening, Speaking, Reading, Writing (dogrulanmis format).
  "Ingilizce::Friendship": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Teen Life": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::In the Kitchen": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::On the Phone": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::The Internet": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Adventures": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Tourism": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Chores": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Science": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
  "Ingilizce::Natural Forces": ["Dinleme (Listening)", "Konusma (Speaking)", "Okuma (Reading)", "Yazma (Writing)"],
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
Ogrenciye, dogru cevabin NEDEN dogru oldugunu ve ogrencinin verdigi cevabin NEDEN yanlis oldugunu, kisa (60-90 kelime), net ve ogretici bir dille acikla. SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma. Markdown kullanma, sadece duz metin.`;
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
    const net = Math.max(0, dogru - yanlis / 4);
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
        ? `Sen deneyimli, alaninda uzman bir "${dersAdi}" ogretmenisin. Ogrenciye ${oncekiSinif}. sinif "${dersAdi}" temel konularini DAHA ONCE bir kez anlattin ama ogrenci testte basarili olamadi - yani ilk anlatim yeterli gelmedi. Bu sefer FARKLI BIR YAKLASIMLA anlat: farkli, gunluk hayattan daha somut ornekler kullan, kavramlari daha yavas ve adim adim ac, olasi kafa karistirici noktalari ONCEDEN tahmin edip aciklayarak onle. Her alt kavram icin "Ornek:" diye etiketlenmis en az bir somut ornek coz. Bu, DAHA DETAYLI ve DAHA DERINLEMESINE bir anlatim olmali. En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle. Toplamda 550-650 kelime. SADECE duz metin yaz, markdown/LaTeX kullanma. SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma.`
        : `Sen deneyimli, alaninda uzman bir "${dersAdi}" ogretmenisin. Ogrencinin ${oncekiSinif}. sinif temeli zayif cikti, once bunu guclendirmemiz gerekiyor. ${oncekiSinif}. sinif "${dersAdi}" mufredatinin EN TEMEL ve EN ONEMLI kavramlarini, sade ve anlasilir bir dille anlat - once tanim, sonra "Ornek:" diye etiketlenmis somut ornek, gerekirse formul/kural. Konu basliklarina ayirarak yaz. En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle. Toplamda 350-450 kelime. SADECE duz metin yaz, markdown/LaTeX kullanma. SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma.`;
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
      const p = `Sen "${dersAdi}" dersi ogretmenisin. ${oncekiSinif}. sinif "${dersAdi}" mufredatinin temel konularindan ${soruSayisi} coktan secmeli soru hazirla. Mantik yurutme gerektirsin. ONEMLI: Her soruyu yazdiktan sonra HESABI KENDIN ADIM ADIM COZ ve dogruIndex'in GERCEKTEN dogru oldugundan emin ol - matematiksel hata yapma, cevaplar arasinda celiski olmasin. Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle, DOGRU VE TUTARLI bir sekilde anlat (ogrenci yanlis yaparsa bunu okuyup ogrensin). SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma. HER SORUDA MUTLAKA "secenekler" alaninda TAM 4 secenek (A,B,C,D) olsun:
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
      const p = `Sen "${dersAdi}" dersi ogretmenisin. Ogrencinin daha once yanlis yaptigi su konulardan: ${konuListesi} - bu konulari pekistirecek 5 YENI (birebir ayni olmayan, ama ayni beceriyi olcen) coktan secmeli soru hazirla. Her soru icin "aciklama" alaninda dogru cevabin nedenini 1-2 cumleyle acikla. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma:
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
      const p = `Sen "${dersAdi}" dersi olcme-degerlendirme uzmanisin. Ogrenci simdi ${sinif}. sinifa gecti, once ${oncekiSinif}. sinifi gercekten ogrenmis mi olcmemiz gerekiyor. ${oncekiSinif}. sinif "${dersAdi}" mufredatinin GENEL VE TEMEL konularini kapsayan 10 soruluk bir GENEL DEGERLENDIRME sinavi hazirla, farkli konu basliklarina yayilsin. Sorular temel kavram anlayisini olcsun, kolaydan zora dogru sirali olsun. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma. SADECE JSON dondur, baska hicbir aciklama ekleme:
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
    const net = Math.max(0, dogru - yanlis / 4);
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
      const p = `Sen deneyimli, alaninda uzman bir "${kocPaneliDers}" ogretmenisin. Ogrencinin ${oncekiSinif}. sinif temeli zayif cikti, once bunu guclendirmemiz gerekiyor. ${oncekiSinif}. sinif "${kocPaneliDers}" mufredatinin EN TEMEL ve EN ONEMLI kavramlarini, sade ve anlasilir bir dille OZETLE - once tanim, sonra somut ornek. Toplamda 350-450 kelime, konu basliklarina ayirarak yaz. SADECE duz metin yaz, markdown/LaTeX kullanma. SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma.`;
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
    const unite = oneriliUniteHesapla(secilenDers);
    if (!unite) return;
    setDers(secilenDers); setUniteSec(unite); setKonu(unite);
    setYukleniyor("aciklama"); setHata(""); setAciklama(""); setQuiz(null); setGonderildi(false);
    try {
      const zorlukMetni = { basit: "cok basit ve yavas", orta: "orta seviyede", zor: "ileri seviyede" }[zorlukSec] || "orta seviyede";
      const temelUyarisi = gecenYilRaporu && gecenYilRaporu.seviye === "Zayif"
        ? ` ONEMLI: Bu ogrencinin bir onceki sinif temeli zayif olcyuldu, bu yuzden konuya girmeden once cok kisa (1-2 cumle) bir "on bilgi hatirlatmasi" ekle, temel kavramlari atlamadan anlat.`
        : "";
      const p = `Sen deneyimli, alaninda uzman bir "${secilenDers}" ogretmenisin. "${unite}" unitesinin TAMAMINI, ${sinif}. sinifta okuyan bir ogrenciye ${zorlukMetni} ama PROFESYONEL ve KALITELI bir dille, ozel ders yayinlarinin (MEB yayinlarindan daha ust seviye) kalitesinde anlat.${temelUyarisi} ONEMLI: Konuyu OLDUGUNDAN KOLAY GOSTERME - piyasadaki bircok kaynak bu hatayi yapiyor ve gercek sinavda ogrenciler zorlaniyor. Gercek LGS sorularindaki zorluk seviyesini yansitacak derinlikte anlat, yuzeysel gecme. Su yapida yaz: (1) Once kisa bir GIRIS - konunun ne oldugu ve neden onemli oldugu. (2) Her ana kavram icin: TANIM, en az bir SOMUT ORNEK, varsa FORMUL/KURAL. (3) En sonda "DIKKAT EDILECEK NOKTALAR / SIK YAPILAN HATALAR" basligiyla 2-3 maddelik kisa liste. Toplamda 400-500 kelime olsun, yuzeysel gecme, gercekten ogretici ol. SADECE duz metin yaz: markdown (yildiz, dis) LaTeX kullanma. Matematik ifadelerini normal klavye karakterleriyle yaz (orn. "kok 12", "3 uzeri 2"). SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma.`;
      const cevap = await aiIstek(p, 3200, cihazIdRef.current);
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
    const unite = oneriliUniteHesapla(secilenDers);
    if (!unite) return;
    setDers(secilenDers); setUniteSec(unite); setKonu(unite);
    setYukleniyor("quiz"); setHata(""); setCevaplar({}); setGonderildi(false);
    try {
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${secilenDers}" dersinin "${unite}" unitesinin TAMAMINI kapsayan, ${sinif}. sinif seviyesinde 5 coktan secmeli soru hazirla. Mantik yurutme gerektirsin, ezber bilgi sorma. Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle anlat. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma:
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
      const net = Math.max(0, r.dogru - yanlis / 4);
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

  function altKonuAnahtari(dersAdi, uniteAdi) { return `${dersAdi}::${uniteAdi}`; }

  async function altKonulariGetir(dersAdi, uniteAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    if (altKonuCache[anahtar]) return; // zaten var, tekrar uretme
    if (DOGRULANMIS_ALT_KONULAR[anahtar]) {
      // Gercek MEB kazanimi var, AI'a sormaya gerek yok
      setAltKonuCache((eski) => ({ ...eski, [anahtar]: DOGRULANMIS_ALT_KONULAR[anahtar] }));
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

  // Sinav (Yazili/Deneme ortak) - Kapsam: konu | unite | donem
  const [denemeDers, setDenemeDers] = useState(null);
  const [denemeTuru, setDenemeTuru] = useState("deneme"); // "deneme" | "yazili1" | "yazili2" | "yazili3"
  const [kapsamTuru, setKapsamTuru] = useState("donem"); // "konu" | "unite" | "donem"
  const [kapsamUnite, setKapsamUnite] = useState(null);
  const [kapsamKonu, setKapsamKonu] = useState("");
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
  const [profilGunlukGorevler, setProfilGunlukGorevler] = useState(null);
  const [karneAcik, setKarneAcik] = useState(false);
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
      const p = `Sen bir egitim kocususun. ${ogrenciAdi ? `Ogrencinin adi ${ogrenciAdi}.` : ""} Su gercek sinav verilerine dayanarak DERIN, KISISEL bir karne/durum degerlendirmesi yaz: ${veriMetni}. Su noktalara deg: (1) En guclu oldugu 1-2 dersi somut sayilarla ovun, (2) En cok destege ihtiyaci olan 1-2 dersi nazik ama net sekilde belirt, (3) Son sinav ile ortalamasini kiyaslayip bir trend yorumu yap (yukseliyor mu, sabit mi, dususte mi), (4) Somut, uygulanabilir 2-3 tavsiye ver. Sicak, samimi, gercekci bir mentor tonu kullan - ne asiri ovucu ne cesaret kirici ol. 250-320 kelime, SADECE Turkce duz metin, markdown kullanma.`;
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
    setYukleniyor("soru"); setHata(""); setSoruCozumu("");
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
        body: JSON.stringify({ imageBase64: base64, mediaType: dosya.type, ders, cihazId: cihazIdRef.current }),
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
        ? `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni2} "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde TAM 15 coktan secmeli soru hazirla: ILK 5 SORU KOLAY, SONRAKI 5 SORU ORTA, SON 5 SORU ZOR seviyede olsun (sirali ver, kolaydan zora). Bu, meshur ozel yayin kaynaklarinin (MEB yayinlarindan daha ust seviye, sik tercih edilen ek kaynaklar seviyesinde) fasikul formatinda olsun. Sorular mantik yurutme ve yorum gerektiren tarzda olsun, ezber bilgi sorma. SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Portekizce gibi bati dillerinden TEK KELIME bile kullanma:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]`
        : `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni2} "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde 5 coktan secmeli soru hazirla. Sorular gercek sinav formatinda, mantik yurutme ve yorum gerektiren tarzda olsun, ezber bilgi sorma. SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan:
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
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni3} "${konu}" konusuyla ilgili once orta uzunlukta (120-180 kelime) bir metin/paragraf yaz, sonra bu metne dayali 20 coktan secmeli soru hazirla (${sinif}. sinif seviyesinde, kolaydan zora dogru sirali). Son olarak bu konuyla ilgili 3-5 maddelik kisa "puf noktalari / altin kurallar" listesi ekle (formul, dikkat edilecek nokta, sik yapilan hatalar gibi). Sorular okudugunu anlama, yorumlama ve dikkat gerektirsin. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Portekizce gibi bati dillerinden TEK KELIME bile kullanma. SADECE JSON dondur, baska hicbir aciklama ekleme, markdown kullanma:
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
        kapsamAciklama = kapsamKonu.trim()
          ? `SADECE "${kapsamUnite}" unitesindeki "${kapsamKonu.trim()}" konusundan sorular hazirla.`
          : `SADECE "${kapsamUnite || "(ders geneli)"}" unitesinden sorular hazirla.`;
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

      const p = `Sen bir LGS/ortaokul olcme-degerlendirme uzmanisin. "${denemeDers}" dersi icin ${baslikMetni} hazirla, ${sinif}. sinif seviyesinde, toplam ${sinavSoruSayisi} soru olsun. ${kapsamAciklama} Sorulari, 2022-2026 yillari arasindaki gercek sinavlarin soru tarzina, uslubuna ve zorluk seviyesine birebir benzet - ama sorularin kendisi ozgun olsun, gercek gecmis sorulari birebir kopyalama ya da "gecmis yil cikti" diye sunma. 2026 LGS onceki yillara gore belirgin sekilde daha zor ve secici geldi (uzmanlar hemfikir) - sorulari buna gore kalibre et: ezber bilgiden cok dikkat, zaman yonetimi, yorumlama ve strateji gerektiren sorular olsun, Turkce'de uzun paragraflar/celdiriciler, Matematik'te islem degil dikkat ve mantik agirlikli sorular kullan. Zorluk dagilimi GERCEK 2026 LGS oranina yakin olsun: soru sayisinin yaklasik %20'si kolay, %55'i orta, %25'i zor olsun (orn. 20 soruda ~4 kolay, ~11 orta, ~5 zor). Her sorunun hangi ALT KONUYU/KAZANIMI olctugunu 2-4 kelimeyle "altKonu" alaninda belirt (orn. "Asal Carpanlar", "EBOB Hesabi" gibi kisa ve spesifik). Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle, dogru ve tutarli bir sekilde anlat. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan. SADECE JSON dondur, baska hicbir aciklama ekleme:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","altKonu":"...","aciklama":"..."}]`;
      const cevap = await aiIstek(p, Math.min(8000, 500 + sinavSoruSayisi * 480), cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]+/g, "").replace(/\s*\(\d{1,4}\)\s*/g, " ").trim();
      setSinavKapsamMetni(kapsamAciklama);
      setSinavKayitTuru(kayitTuru);
      const uretilenSinavSorulari = soruJsonAyikla(temiz);
      setDenemeSorulari(uretilenSinavSorulari);
      sorulariBankayaKaydet(denemeDers, sinif, kapsamUnite, uretilenSinavSorulari, sinavTuru);
    } catch (e) { setHata(temizHataMesaji(e, "Sinav olusturulamadi, tekrar dene.")); }
    finally { setYukleniyor(null); }
  }

  const [denemeBelgesi, setDenemeBelgesi] = useState(null);

  async function denemeGonder() {
    setDenemeGonderildi(true);
    const dogru = denemeSorulari.filter((s, i) => denemeCevaplar[i] === s.dogruIndex).length;
    const bos = denemeSorulari.filter((s, i) => denemeCevaplar[i] === undefined).length;
    const yanlis = denemeSorulari.length - dogru - bos;
    const net = Math.max(0, dogru - yanlis / 4);

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
      const dersListesi = DERSLER.map((d) => d.ad).join(", ");
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
            <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Hos geldiniz</p>
            <p style={{ color: "#B7C4BC", fontSize: 13.5, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
              Seviye tespiti, konu anlatimi, deneme/yazili sinavlari ve kisisel calisma plani — hepsi tek sistemde.
              Baslamak icin bir ders sec.
            </p>
          </div>
        )}

        {mod === "bos" && !secilenDers && (
          <div className="kx-fadein" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 8 }}>DERSINI SEC</p>
            <div className="kx-pop" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {DERSLER.map((d) => (
                <button key={d.ad} onClick={() => { setSecilenDers(d.ad); setMod("ders"); }} className="kx-card kx-btn" style={{
                  padding: "16px 6px", borderRadius: 14, cursor: "pointer", textAlign: "center",
                  border: `1.5px solid ${COLORS.line}`, background: COLORS.page,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{d.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink, lineHeight: 1.25 }}>{d.ad}</div>
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

              <p style={{ color: COLORS.bgText || COLORS.page, fontWeight: 700, fontSize: 15, marginBottom: 2 }}>📚 Ders Calisma Odasi</p>
              <p style={{ color: COLORS.bgText ? COLORS.bgText + "80" : "#8A968E", fontSize: 10.5, marginBottom: 10 }}>Konu anlat, test coz - asil calisma burada</p>
              {DERSLER.map((d) => (
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
              <p style={{ color: COLORS.bgText ? COLORS.bgText + "80" : "#8A968E", fontSize: 10.5, marginBottom: 4 }}>Ek araclar</p>
              {[
                ["sorucoz", "📷 Soru Coz (Fotograf)"],
                ["kocluk", "📅 Haftalik Calisma Plani"],
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
              {DERSLER.map((d) => (
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
              <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center" }}>Gecmis kontrol ediliyor...</p>
            )}

            {gecenYilTamamlandiMi === false && !gecenYilGecmisYukleniyor && !gecenYilSorulari && !gecenYilRaporu && (
              <div style={{ background: "#FFF8E8", borderRadius: 12, padding: 18, textAlign: "center", border: `1.5px solid ${COLORS.mustard}` }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>📊 Once Genel Degerlendirme</p>
                <p style={{ fontSize: 13, color: "#6B7566", marginBottom: 14 }}>
                  {kocPaneliDers} icin ilk kez buradasin. {Math.max(1, sinif - 1)}. siniftan gercek temelinin ne kadar saglam oldugunu olcelim,
                  sonra {sinif}. sinif takibine geceriz. (Bu, AI tarafindan olusturulan genel bir degerlendirmedir, resmi MEB sinavi degildir.)
                </p>
                <button onClick={() => gecenYilDegerlendirmesiYap(kocPaneliDers)} disabled={gecenYilYukleniyor} style={{ padding: "11px 20px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  {gecenYilYukleniyor ? "Hazirlaniyor..." : "Genel Degerlendirmeyi Baslat"}
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
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Genel Degerlendirme Sonucu</p>
                <p style={{ fontSize: 13 }}>Onceki sinif temelin: <strong>{gecenYilRaporu.seviye}</strong> ({gecenYilRaporu.dogru}/{gecenYilRaporu.toplam})</p>
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
              <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center" }}>Gecmis kontrol ediliyor...</p>
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
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.page, marginBottom: 8 }}>Simdi buna odaklan: {onerilenUnite}</p>
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
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 14, textAlign: "center" }}>{secilenDers}</p>

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
                  <div style={{ background: COLORS.gradient, borderRadius: 12, padding: 16, marginBottom: 14, textAlign: "center" }}>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.mustard, letterSpacing: 0.5, marginBottom: 4 }}>🎯 KOC ONERISI</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.page, marginBottom: 12 }}>Simdi buna odaklan: {onerilenUnite}</p>
                    <div className="kx-pop" style={{ display: "flex", gap: 8 }}>
                      <button className="kx-btn" onClick={oneriliUniteAnlat} disabled={yukleniyor} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                        {yukleniyor === "aciklama" ? "Hazirlaniyor..." : "📘 Konuyu Anlat"}
                      </button>
                      <button className="kx-btn" onClick={oneriliUniteSoruCoz} disabled={yukleniyor} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1.5px solid ${COLORS.page}`, background: "transparent", color: COLORS.page, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                        {yukleniyor === "quiz" ? "Uretiliyor..." : "✍️ 5 Soru Coz"}
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
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>✅ Gecmis Yil Tekrari Tamamlandi</p>
                    <p style={{ fontSize: 12.5, color: "#6B7566" }}>
                      {durum.tur}. tur testlerini gectin. Artik normal takip icin Koc Panel'den {secilenDers}'i sec.
                    </p>
                  </div>
                );
              }

              if (durum.durum === "gorusme_talebi") {
                return (
                  <div style={{ background: "#FFF1EF", borderRadius: 10, padding: 16, textAlign: "center", border: `1.5px solid ${COLORS.coral}` }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: COLORS.coral }}>🙋 Rehber Ogretmen / Koc Gorusmesi Onerilir</p>
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
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }} className="kx-pop">
                {DERSLER.map((d) => (
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
            {kapsamTuru === "konu" && (
              <input value={kapsamKonu} onChange={(e) => setKapsamKonu(e.target.value)} placeholder="Alt konu (isteğe bağlı, spesifik bir başlık yaz)" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.line}`, marginBottom: 4, fontSize: 13, background: "#FAF6EE" }} />
            )}
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
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }} className="kx-pop">
                {DERSLER.map((d) => (
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
                      Net = Doğru − Yanlış/4 (gerçek sınav hesaplama yöntemi)
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
                        <option value="">Sinif sec</option>
                        <option value="5">5. Sinif</option>
                        <option value="6">6. Sinif</option>
                        <option value="7">7. Sinif</option>
                        <option value="8">8. Sinif</option>
                      </select>
                      <input value={profilOkul} onChange={(e) => setProfilOkul(e.target.value)} placeholder="Okulun" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
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
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Bekleyen Odevlerin (Koc onerileri)</p>
                    {DERSLER.map((d) => {
                      const onerilen = oneriliUniteHesapla(d.ad);
                      if (!onerilen) return null;
                      return (
                        <div key={d.ad} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 12.5, borderBottom: `1px solid ${COLORS.line}` }}>
                          <span>{d.emoji} {d.ad}: <strong>{onerilen}</strong></span>
                          <span style={{ color: COLORS.mustard, fontWeight: 600, fontSize: 11 }}>bekliyor</span>
                        </div>
                      );
                    })}
                    {DERSLER.every((d) => !oneriliUniteHesapla(d.ad)) && (
                      <p style={{ fontSize: 12.5, color: COLORS.muted }}>Su an bekleyen bir odevin yok.</p>
                    )}

                    {profilGunlukGorevler && profilGunlukGorevler.length > 0 && (
                      <>
                        <p style={{ fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 6, color: COLORS.muted }}>📅 Haftalik Programindan Gunluk Gorevler</p>
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
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Ders Durumlarin</p>
                    {DERSLER.map((d) => {
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
                          <p style={{ fontSize: 12.5, color: COLORS.muted, textAlign: "center" }}>Sinav gecmisin analiz ediliyor...</p>
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

                <button onClick={cikisYap} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, cursor: "pointer" }}>Cikis Yap</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => setHesapModu("giris")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: hesapModu === "giris" ? COLORS.coral : "#fff", color: hesapModu === "giris" ? "#fff" : COLORS.ink, fontWeight: 600, cursor: "pointer" }}>Giris Yap</button>
                  <button onClick={() => setHesapModu("kayit")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: hesapModu === "kayit" ? COLORS.coral : "#fff", color: hesapModu === "kayit" ? "#fff" : COLORS.ink, fontWeight: 600, cursor: "pointer" }}>Kayit Ol</button>
                </div>
                {hesapModu === "kayit" && (
                  <>
                    <input value={adGir} onChange={(e) => setAdGir(e.target.value)} placeholder="Adin" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <button onClick={() => setRolSec("ogrenci")} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${rolSec === "ogrenci" ? COLORS.coral : COLORS.line}`, background: rolSec === "ogrenci" ? "#FFF1EF" : "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🎓 Ogrenciyim</button>
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
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Sifre Sifirlama</p>
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

            {soruCozumu && (
              <div style={{ background: COLORS.page, borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.mustard, letterSpacing: 0.5, marginBottom: 8 }}>✅ ÇÖZÜM</p>
                <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7 }}>{soruCozumu}</div>
              </div>
            )}
          </div>
        )}

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
                {DERSLER.map((d) => {
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
                      <p style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 10, fontStyle: "italic" }}>Bu gorevler Profilinde "Bekleyen Odevlerin" altinda da gorunecek.</p>
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
              {DERSLER.map((d) => (
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
                          {DOGRULANMIS_ALT_KONULAR[altKonuAnahtari(ders, uniteSec)] ? "(MEB kazanimi - dogrulanmis)" : "(AI onerisi, resmi liste degil)"}
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
