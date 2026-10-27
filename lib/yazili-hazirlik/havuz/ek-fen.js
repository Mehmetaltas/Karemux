// Plandaki boşluk konuları için eklenen sorular. Biçim: { "sınıf": { "ek": [ [soru, [seçenekler], doğruİndeks, açıklama, gorsel|null, {u:"ünite", k:"konu"}] ] } }
import { S, svg, tablo } from "./gorselli-yardim.js";
const U4 = { u: "Maddenin Özellikleri", k: "Maddeyi Niteleyen Özellikler" };
const U5a = { u: "Gökyüzündeki Komşularımız ve Biz", k: "Dünya’mız ve Gökyüzündeki Komşularımız" };
const U5b = { u: "Yaşamımızdaki Elektrik", k: "Devre Elemanlarının Sembollerle Gösterimi ve Devre Şemalar" };
const U4e = { u: "Basit Elektrik Devreleri", k: "Basit Elektrik Devreleri" };
const U5c = { u: "Kuvveti Tanıyalım", k: "Kuvvet ve Kuvvetin Ölçülmesi" };
const U5d = { u: "Kuvveti Tanıyalım", k: "Kütle ve Ağırlık İlişkisi" };
const U5e = { u: "Kuvveti Tanıyalım", k: "Sürtünme Kuvveti" };
const U5e2 = { u: "Canlıların Yapısına Yolculuk", k: "Hücre ve Organelleri" };
const U8a = { u: "Enerji Dönüşümleri ve Çevre Bilimi", k: "Madde Döngüleri ve Çevre Sorunları" };
const U8b = { u: "Enerji Dönüşümleri ve Çevre Bilimi", k: "Sürdürülebilir Kalkınma" };
const U8c = { u: "Elektrik Yükleri ve Elektrik Enerjisi", k: "Elektrik Yükleri ve Elektriklenme" };
const U8d = { u: "Elektrik Yükleri ve Elektrik Enerjisi", k: "Elektrik Yüklü Cisimler" };
const U8e = { u: "Elektrik Yükleri ve Elektrik Enerjisi", k: "Elektrik Enerjisinin Dönüşümü" };
const U6a = { u: "Güneş Sistemi ve Tutulmalar", k: "Güneş Sistemi" };
const U6b = { u: "Güneş Sistemi ve Tutulmalar", k: "Güneş ve Ay Tutulmaları" };
const U6c = { u: "Kuvvetin Etkisinde Hareket", k: "Bileşke Kuvvet" };
const U8f = { u: "Madde ve Endüstri", k: "Fiziksel ve Kimyasal Değişimler" };
const U8g = { u: "Madde ve Endüstri", k: "Asitler ve Bazlar" };
const U8h = { u: "Madde ve Endüstri", k: "Maddenin Isı ile Etkileşimi" };
const U7 = { u: "Maddenin Doğasına Yolculuk", k: "Maddenin Tanecikli Yapısı" };
export default {
  "4": { "ek": [
    ["Limonun ekşi olduğunu hangi duyu organımızla anlarız?", ["Göz", "Dil", "Kulak", "Burun"], 1, "Tat almayı sağlayan duyu organı dildir.", null, U4],
    ["Bir maddenin kokusunu hangi duyu organımızla ayırt ederiz?", ["Burun", "Göz", "Kulak"], 0, "Koku alma duyusunun organı burundur.", null, U4],
    ["Aşağıdaki maddelerden hangisi sert bir maddedir?", ["Sünger", "Pamuk", "Taş", "Yün kazak"], 2, "Taş sert bir maddedir; sünger, pamuk ve yün yumuşaktır.", null, U4],
    ["Lastik bir bant çekilip bırakıldığında eski hâline dönüyorsa bu bandın hangi özelliğe sahip olduğu söylenebilir?", ["Esnek olduğu", "Saydam olduğu", "Parlak olduğu"], 0, "Çekilince uzayıp bırakılınca eski hâline dönen maddeler esnektir.", null, U4],
    ["Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", ["Saydam", "Parlak", "Pürüzlü", "Esnek"], 2, "Zımpara kâğıdının yüzeyi düz değildir, pürüzlüdür.",
      tablo(["Madde", "Yüzey / görünüm özelliği"], [["Ayna", "Parlak"], ["Cam bardak", "Saydam"], ["Zımpara kâğıdı", "?"]], "Maddeyi niteleyen özellikler"), U4],
    ["Aşağıdaki maddelerden hangisinin içinden bakıldığında karşı taraf net olarak görülebilir (saydamdır)?", ["Tahta kapı", "Cam bardak", "Karton kutu", "Demir levha"], 1, "Işığı geçiren, içinden karşısı görülebilen maddelere saydam denir; cam saydamdır.", null, U4],
    ["Şekildeki devrede kaç tane ampul bulunmaktadır?", ["3", "1", "2", "4"], 0, "Şekilde K, L ve M ile gösterilen 3 ampul vardır.", svg(S.devre({ tip: "seri", ampuller: ["K", "L", "M"] }), "80%"), U4e],
    ["Basit bir elektrik devresinde ampulün yanabilmesi için devrenin nasıl olması gerekir?", ["Pilin bir ucundan diğer ucuna kesintisiz kapalı bir yol oluşturmalıdır", "Anahtar açık konumda olmalıdır", "Bağlantı kablolarından biri kopuk olmalıdır", "Pil devreden çıkarılmış olmalıdır"], 0, "Ampulün yanması için akım pilden çıkıp ampulden geçerek piline dönmelidir; yani devre kesintisiz ve kapalı olmalıdır.", null, U4e],
    ["Tablodaki anahtar satırında soru işareti yerine ne yazılmalıdır?", ["Devreyi açıp kapatır", "Işık verir", "Devreye enerji sağlar", "Ampulün parlaklığını artırır"], 0, "Anahtarın görevi devreyi açıp kapatarak akımı kontrol etmektir.",
      tablo(["Devre elemanı", "Görevi"], [["Pil", "Devreye enerji sağlar"], ["Anahtar", "?"], ["Ampul", "Işık verir"]], "Devre elemanları ve görevleri"), U4e],
    ["Şekildeki devrede K ampulünün yanması için ne yapılmalıdır?", ["Anahtar kapatılmalıdır", "Pil devreden çıkarılmalıdır", "Anahtar açık bırakılmalıdır", "Ampul devreden çıkarılmalıdır"], 0, "Anahtar açıkken devre tamamlanmamıştır. Anahtar kapatılırsa devre tamamlanır ve ampul yanar.", svg(S.devre({ tip: "seri", ampuller: ["K"], acikAnahtar: true }), "78%"), U4e],
  ] },
  "5": { "ek": [
    ["Aşağıdakilerden hangisi Dünya’nın doğal uydusudur?", ["Güneş", "Mars", "Ay", "Venüs"], 2, "Dünya’nın tek doğal uydusu Ay’dır.", null, U5a],
    ["Aşağıdakilerden hangisi Dünya’da canlıların yaşamasını mümkün kılan özelliklerden biridir?", ["Atmosferinin ve sıvı suyunun bulunması", "Kendi ışığını yayması", "Yüzeyinin tamamen buzla kaplı olması", "Hiç atmosferinin olmaması"], 0, "Dünya’da yaşamı sürdürmeye uygun bir atmosfer ve sıvı su bulunur.", null, U5a],
    ["Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", ["Yıldız", "Gezegen", "Kuyruklu yıldız", "Uydu"], 3, "Ay, Dünya’nın çevresinde dolanan doğal uydudur.",
      tablo(["Gök cismi", "Türü"], [["Güneş", "Yıldız"], ["Dünya", "Gezegen"], ["Ay", "?"]], "Gök cisimleri"), U5a],
    ["Aşağıdaki bilgilerden hangisi doğrudur?", ["Güneş, Dünya’nın çevresinde dolanır.", "Dünya, Ay’ın çevresinde dolanır.", "Ay, Dünya’nın çevresinde dolanır.", "Güneş, Ay’ın uydusudur."], 2, "Ay, Dünya’nın uydusu olduğu için onun çevresinde dolanır.", null, U5a],
    ["Güneş, Dünya ve Ay büyükten küçüğe doğru nasıl sıralanır?", ["Dünya, Güneş, Ay", "Güneş, Ay, Dünya", "Ay, Dünya, Güneş", "Güneş, Dünya, Ay"], 3, "Boyut olarak en büyük Güneş, ardından Dünya, en küçük Ay’dır.", null, U5a],
    ["Dünya’ya ışık ve ısı sağlayan başlıca gök cismi hangisidir?", ["Güneş", "Ay", "Mars"], 0, "Güneş kendi ışığını yayan bir yıldızdır; Dünya’nın ışık ve ısı kaynağıdır.", null, U5a],
    ["Devre elemanlarının sembollerle gösterildiği çizime ne ad verilir?", ["Devre şeması", "Harita", "Çubuk grafik"], 0, "Devre elemanlarının sembollerle gösterildiği çizime devre şeması denir.", null, U5b],
    ["Devre şemalarında devre elemanlarının sembollerle gösterilmesinin temel amacı nedir?", ["Devrenin daha parlak yanmasını sağlamak", "Devreyi herkesin anlayabileceği ortak ve kolay bir biçimde çizmek", "Pilin ömrünü uzatmak", "Devreden geçen akımı artırmak"], 1, "Semboller, devreleri kısa ve herkesçe anlaşılır biçimde göstermeyi sağlar.", null, U5b],
    ["Şekildeki devrede aşağıdaki devre elemanlarından hangisi yoktur?", ["Pil", "Ampul", "Anahtar", "İletken kablo"], 2, "Şekilde pil, iki ampul ve bağlantı kabloları vardır; anahtar bulunmaz.", svg(S.devre({ tip: "seri", ampuller: ["K", "L"], anahtarYok: true }), "78%"), U5b],
    ["Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", ["Işık verir", "Devreyi açıp kapatır", "Enerji sağlar", "Elektrik akımının iletilmesini sağlar"], 3, "Bağlantı kabloları devre elemanlarını birbirine bağlayarak akımın iletilmesini sağlar.",
      tablo(["Devre elemanı", "Görevi"], [["Pil", "Enerji sağlar"], ["Ampul", "Işık verir"], ["Bağlantı kablosu", "?"]], "Devre elemanları ve görevleri"), U5b],
    ["Şekildeki devrede anahtar açıkken ampul için ne söylenebilir?", ["Yanmaz, çünkü devre tamamlanmamıştır.", "Yanar, çünkü pil devrededir.", "Önce parlak yanar sonra söner."], 0, "Anahtar açıkken devre tamamlanmaz, akım geçmez ve ampul yanmaz.", svg(S.devre({ tip: "seri", ampuller: ["K"], acikAnahtar: true }), "78%"), U5b],
    ["Şekildeki dinamometreye asılan cismin ağırlığı kaç N'dur?", ["8", "6", "9", "7"], 0, "İbre 8 çizgisini gösterir; cismin ağırlığı 8 N'dur.", svg(S.dinamometre({ deger: 8 }), "28%"), U5c],
    ["Kütlesi 5 kg olan bir cisim Ay'a götürülürse cismin kütlesi ve ağırlığı için ne söylenebilir?", ["Kütlesi değişmez, ağırlığı azalır", "Kütlesi azalır, ağırlığı değişmez", "Kütlesi ve ağırlığı artar", "Kütlesi ve ağırlığı değişmez"], 0, "Kütle cismin madde miktarıdır ve yer değiştirince değişmez. Ay'ın çekim kuvveti Dünya'dan az olduğu için ağırlık azalır.", null, U5d],
    ["Aşağıdakilerden hangisi sürtünme kuvvetini azaltmak amacıyla yapılmıştır?", ["Bisiklet zincirinin yağlanması", "Ayakkabı tabanlarına çıkıntılar yapılması", "Kış lastiklerinin yüzeyinin kabartmalı yapılması", "Merdiven basamaklarına kaymaz bant yapıştırılması"], 0, "Yağlama yüzeyler arasındaki sürtünmeyi azaltır; diğer seçeneklerde sürtünmeyi artırarak kaymayı önlemek amaçlanır.", null, U5e],
    ["Şekilde M ile gösterilen yapının temel görevi nedir?", ["Hücreye giren ve çıkan maddeleri kontrol etmek", "Hücreyi yönetmek", "Fotosentezle besin üretmek", "Hücreye şekil ve sertlik kazandırmak"], 0, "M hücre zarıdır; hücreye giren ve çıkan maddeleri denetler. Yönetim işi çekirdeğin, fotosentez kloroplastın görevidir; hayvan hücresinde şekil veren hücre duvarı yoktur.", svg(S.hucre({ tip: "hayvan", etiketler: { cekirdek: "K", organel: "L", zar: "M" } }), "52%"), U5e2],
  ] },
  "6": { "ek": [
    ["Aşağıdaki gezegenlerden hangisi Güneş Sistemi’nde iç gezegenler arasında yer alır?", ["Mars", "Jüpiter", "Satürn", "Neptün"], 0, "İç gezegenler Merkür, Venüs, Dünya ve Mars’tır; Jüpiter, Satürn, Uranüs ve Neptün dış gezegenlerdir.", null, U6a],
    ["Güneş tutulması Ay’ın hangi evresinde gerçekleşebilir?", ["Yeni Ay", "Dolunay", "İlk dördün", "Son dördün"], 0, "Güneş tutulmasında Ay, Güneş ile Dünya’nın arasındadır; bu durum yalnızca Yeni Ay evresinde olur.", null, U6b],
    ["Aynı doğrultuda ve aynı yönde etki eden 12 N ve 5 N’luk iki kuvvetin bileşkesi kaç N’dur?", ["17", "7", "60", "12"], 0, "Aynı yönlü kuvvetlerin bileşkesi toplamlarına eşittir: 12 + 5 = 17 N.", null, U6c],
  ] },
  "7": { "ek": [
    ["Atomun çekirdeğinde bulunan ve pozitif (+) yüklü olan tanecik hangisidir?", ["Elektron", "Proton", "Nötron"], 1, "Protonlar çekirdekte bulunur ve pozitif yüklüdür; elektronlar negatif yüklüdür, nötronlar yüksüzdür.", null, U7],
    ["Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", ["Yüksüz (nötr)", "Pozitif (+)", "Negatif (−)", "Hem pozitif hem negatif"], 0, "Nötronlar elektrik yükü taşımaz, yüksüzdür.",
      tablo(["Atom altı tanecik", "Yükü"], [["Proton", "Pozitif (+)"], ["Elektron", "Negatif (−)"], ["Nötron", "?"]], "Atom altı tanecikler"), U7],
    ["Nötr bir atomun 11 protonu varsa elektron sayısı kaçtır?", ["10", "12", "22", "11"], 3, "Nötr atomda proton sayısı elektron sayısına eşittir; elektron sayısı 11’dir.", null, U7],
    ["Atomu, içi dolu ve bölünemeyen bir küre olarak tanımlayan bilim insanı kimdir?", ["Thomson", "Dalton", "Rutherford", "Bohr"], 1, "Dalton atom modelinde atom, içi dolu ve bölünemez küredir.", null, U7],
    ["Atomun merkezinde küçük, yoğun ve pozitif yüklü bir çekirdek bulunduğunu ortaya koyan bilim insanı kimdir?", ["Dalton", "Thomson", "Bohr", "Rutherford"], 3, "Rutherford altın levha deneyiyle atomun merkezinde pozitif yüklü çekirdek olduğunu buldu.", null, U7],
    ["Atomu, pozitif yüklü bir kürenin içine gömülü elektronlardan oluşan bir yapı (üzümlü kek modeli) olarak tanımlayan bilim insanı kimdir?", ["Thomson", "Dalton", "Rutherford"], 0, "Thomson modelinde elektronlar pozitif yüklü kürenin içine dağılmış hâldedir.", null, U7],
  ] },
  "8": { "ek": [
    ["Karbon döngüsünde atmosferdeki karbondioksitin canlıların yapısına geçmesini sağlayan olay hangisidir?", ["Fotosentez", "Solunum", "Çürüme", "Yanma"], 0, "Bitkiler fotosentezle atmosferdeki karbondioksiti alarak organik madde üretir. Solunum, çürüme ve yanma ise atmosfere karbondioksit verir.", null, U8a],
    ["Fosil yakıtların yakılması sonucu atmosfere salınan karbondioksit miktarı artarsa aşağıdakilerden hangisinin şiddeti artar?", ["Küresel ısınma", "Deprem sayısı", "Gelgit olaylarının sıklığı", "Yer kabuğunun hareketliliği"], 0, "Karbondioksit bir sera gazıdır; miktarı artınca atmosferde tutulan ısı artar ve küresel ısınma şiddetlenir.", null, U8a],
    ["Aşağıdaki davranışlardan hangisi sürdürülebilir kalkınma anlayışına en uygundur?", ["Doğal kaynakları gelecek nesillerin de ihtiyaçlarını karşılayacak şekilde kullanmak", "Kaynakları ekonomiyi büyütmek için olabildiğince hızlı tüketmek", "Atıkları arıtmadan doğaya bırakmak", "Yenilenemeyen kaynakları gelecek düşünmeden kullanmak"], 0, "Sürdürülebilir kalkınma; bugünün ihtiyaçlarını, gelecek nesillerin ihtiyaçlarını tehlikeye atmadan karşılamayı hedefler.", null, U8b],
    ["Proton sayısı 18 olan nötr bir cisim sürtünme sonucu 4 elektron kaybederse cisimde kaç elektron kalır?", [String(18 - 4), "22", "18", "4"], 0, "Nötr cisimde elektron sayısı proton sayısına eşittir: 18. 4 elektron kaybedince 18 − 4 = 14 elektron kalır ve cisim pozitif yüklenir.", null, U8c],
    ["Şekildeki aynı cins yüklü cisimler birbirine yaklaştırılırsa ne olur?", ["Birbirini iter", "Birbirini çeker", "Hiçbir etkileşim olmaz", "Yükleri birbirini nötrler"], 0, "Aynı cins yükler birbirini iter.", svg(S.yukler({ sol: "−", sag: "−" }), "62%"), U8d],
    ["Tabloya göre elektrik motoru elektrik enerjisini hangi enerjiye dönüştürür?", ["Hareket", "Işık", "Kimyasal enerji", "Nükleer enerji"], 0, "Elektrik motoru elektrik enerjisini hareket (kinetik) enerjisine dönüştürür.",
      tablo(["Cihaz", "Elektrik enerjisinin dönüştüğü enerji"], [["Ütü", "Isı"], ["Hoparlör", "Ses"], ["Elektrik motoru", "?"]], "Elektrik enerjisinin dönüşümü"), U8e],
    ["Aşağıdakilerden hangisi kimyasal değişimdir?", ["Demirin paslanması", "Buzun erimesi", "Suyun buharlaşması", "Şekerin suda çözünmesi"], 0, "Demir paslanırken yeni bir madde (demir oksit) oluşur; diğerleri maddenin kimliği değişmeden gerçekleşen fiziksel değişimlerdir.", null, U8f],
    ["pH değeri 3 olan bir çözelti için aşağıdakilerden hangisi doğrudur?", ["Asidik özellik gösterir", "Bazik özellik gösterir", "Nötr özellik gösterir", "Kırmızı turnusol kâğıdını maviye çevirir"], 0, "pH değeri 7’den küçük olan çözeltiler asidiktir; asitler mavi turnusolu kırmızıya çevirir.", null, U8g],
    ["Sıcaklıkları farklı iki madde birbirine temas ettirildiğinde ısı nasıl akar?", ["Sıcaklığı yüksek olandan sıcaklığı düşük olana", "Sıcaklığı düşük olandan sıcaklığı yüksek olana", "Kütlesi büyük olandan kütlesi küçük olana", "Hacmi büyük olandan hacmi küçük olana"], 0, "Isı, her zaman sıcaklığı yüksek maddeden sıcaklığı düşük maddeye doğru akar.", null, U8h],
  ] },
};
