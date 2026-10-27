// Plandaki boşluk konuları için eklenen sorular. Biçim: { "sınıf": { "ek": [ [soru, [seçenekler], doğruİndeks, açıklama, gorsel|null, {u:"ünite", k:"konu"}] ] } }
import { S, svg, tablo } from "./gorselli-yardim.js";
const U4 = { u: "Maddenin Özellikleri", k: "Maddeyi Niteleyen Özellikler" };
const U5a = { u: "Gökyüzündeki Komşularımız ve Biz", k: "Dünya’mız ve Gökyüzündeki Komşularımız" };
const U5b = { u: "Yaşamımızdaki Elektrik", k: "Devre Elemanlarının Sembollerle Gösterimi ve Devre Şemalar" };
const U7 = { u: "Maddenin Doğasına Yolculuk", k: "Maddenin Tanecikli Yapısı" };
export default {
  "4": { "ek": [
    ["Limonun ekşi olduğunu hangi duyu organımızla anlarız?", ["Göz", "Dil", "Kulak", "Burun"], 1, "Tat almayı sağlayan duyu organı dildir.", null, U4],
    ["Bir maddenin kokusunu hangi duyu organımızla ayırt ederiz?", ["Burun", "Göz", "Kulak"], 0, "Koku alma duyusunun organı burundur.", null, U4],
    ["Aşağıdaki maddelerden hangisi sert bir maddedir?", ["Sünger", "Pamuk", "Taş", "Yün kazak"], 2, "Taş sert bir maddedir; sünger, pamuk ve yün yumuşaktır.", null, U4],
    ["Lastik bir bant çekilip bırakıldığında eski hâline dönüyorsa bu bantın hangi özelliği olduğu söylenebilir?", ["Esnek olduğu", "Saydam olduğu", "Parlak olduğu"], 0, "Çekilince uzayıp bırakılınca eski hâline dönen maddeler esnektir.", null, U4],
    ["Tabloda soru işareti yerine aşağıdakilerden hangisi gelmelidir?", ["Saydam", "Parlak", "Pürüzlü", "Esnek"], 2, "Zımpara kâğıdının yüzeyi düz değildir, pürüzlüdür.",
      tablo(["Madde", "Yüzey / görünüm özelliği"], [["Ayna", "Parlak"], ["Cam bardak", "Saydam"], ["Zımpara kâğıdı", "?"]], "Maddeyi niteleyen özellikler"), U4],
    ["Aşağıdaki maddelerden hangisinin içinden bakıldığında karşı taraf net olarak görülebilir (saydamdır)?", ["Tahta kapı", "Cam bardak", "Karton kutu", "Demir levha"], 1, "Işığı geçiren, içinden karşısı görülebilen maddelere saydam denir; cam saydamdır.", null, U4],
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
};
