// Plandaki boşluk konuları için eklenen sorular. Biçim: { "sınıf": { "ek": [ [soru, [seçenekler], doğruİndeks, açıklama, gorsel|null, {u:"ünite", k:"konu"}] ] } }
import { tablo } from "./gorselli-yardim.js";
let n = 0;
function q(soru, dogru, yanlislar, aciklama, gorsel, et) {
  const pos = n++ % (yanlislar.length + 1);
  const o = [...yanlislar]; o.splice(pos, 0, dogru);
  return [soru, o, pos, aciklama, gorsel || null, et];
}
const E5a = { u: "Kur'an-ı Kerim", k: "Bir Sure Öğreniyorum" };
const E5b = { u: "Peygamber Kıssaları", k: "Bir SureÖğreniyorum" };
const E5c = { u: "Mimarimizdeki Dinî Motifler", k: "Etkisi" };
const E6a = { u: "Ahlaki Davranışlar", k: "Bir Dua Öğreniyorum: Kunut Duaları" };
const E6b = { u: "Peygamberliğinden Önce Hz. Muhammed", k: "Hz. Muhammed’in (sav) Doğduğu Çevre" };
const E8a = { u: "Kader İnancı", k: "Bir Peygamber Tanıyorum" };
const E8b = { u: "Din ve Hayat", k: "Bir Sure Tanıyorum" };
export default {
  "5": { ek: [
    q("Kevser Suresi kaç ayetten oluşur?", "3", ["5", "10", "20"], "Kevser Suresi, Kur'an-ı Kerim'in en kısa suresidir ve 3 ayetten oluşur.", null, E5a),
    q("Kur'an-ı Kerim'de kaç sure vardır?", "114", ["99", "30", "124"], "Kur'an-ı Kerim 114 sureden oluşur; Kevser Suresi de bunlardan biridir.", null, E5a),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Kevser", ["Fil", "Kureyş", "İhlas"], "Kevser Suresi 108. suredir ve 3 ayettir.", tablo(["Sure", "Ayet sayısı"], [["İhlas", "4"], ["Kureyş", "4"], ["?", "3"]], "Öğrendiğimiz sureler"), E5a),
    q("Kevser kelimesi aşağıdakilerden hangisi anlamına gelir?", "Çok hayır ve bolluk", ["Savaş", "Kuraklık", "Yalnızlık"], "Kevser, çokça hayır ve nimet anlamına gelir.", null, E5a),
    q("Kur'an-ı Kerim'in ilk suresi hangisidir?", "Fatiha Suresi", ["Kevser Suresi", "Nas Suresi", "İhlas Suresi"], "Kur'an'ın ilk suresi Fatiha, son suresi Nas'tır.", null, E5a),
    q("Kureyş Suresi kaç ayettir?", "4", ["3", "7", "15"], "Kureyş Suresi 106. suredir ve 4 ayettir.", null, E5b),
    q("Kureyş Suresi'nde, Kureyşlilerin hangi yolculukları anılır?", "Kış ve yaz ticaret yolculukları", ["Hac yolculukları", "Savaş seferleri", "Okul gezileri"], "Sure, Kureyşlilerin kış ve yaz ticaret kervanlarını hatırlatır.", null, E5b),
    q("Kureyş Suresi'nde Kureyşlilerden kimin Rabbine kulluk etmeleri istenir?", "Bu evin (Kâbe'nin) Rabbine", ["Putlara", "Güneşe", "Atalarına"], "Sure, onlara Kâbe'nin Rabbi olan Allah'a kulluk etmelerini bildirir.", null, E5b),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "4", ["1", "3", "6"], "Kureyş Suresi 4 ayettir.", tablo(["Sure", "Sıra numarası", "Ayet sayısı"], [["Fil", "105", "5"], ["Kureyş", "106", "?"], ["Kevser", "108", "3"]], "Kısa sureler"), E5b),
    q("Kureyş Suresi'ne göre Allah, Kureyşlileri hangi nimetlerle donatmıştır?", "Onları açlıktan doyurmuş, korkudan emin kılmıştır", ["Onlara altın yağdırmıştır", "Onları hiç hasta etmemiştir", "Onlara sonsuz ömür vermiştir"], "Sure, Allah'ın onları doyurup korkudan emin kıldığını bildirir.", null, E5b),
    q("Camilerde kıbleyi, yani Kâbe'nin yönünü gösteren bölüm hangisidir?", "Mihrap", ["Minber", "Minare", "Şadırvan"], "Mihrap, cami duvarında kıble yönünü gösteren oyma bölümdür.", null, E5c),
    q("Ezan okumak için camilerde yapılan yüksek yapıya ne denir?", "Minare", ["Mihrap", "Kubbe", "Minber"], "Minare, ezanın uzaklardan duyulması için yapılan yüksek kuledir.", null, E5c),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Hutbe okunan basamaklı yer", ["Kıbleyi gösteren oyuk", "Abdest alınan yer", "Ezan okunan kule"], "Minber, cuma ve bayram hutbelerinin okunduğu basamaklı yerdir.", tablo(["Cami bölümü", "Görevi"], [["Mihrap", "Kıbleyi gösterir"], ["Minare", "Ezanın duyulmasına hizmet eder"], ["Minber", "?"]], "Cami bölümleri"), E5c),
    q("Selimiye Camii'nin mimarı kimdir?", "Mimar Sinan", ["Mimar Kemaleddin", "Vedat Tek", "Mimar Sedefkâr Mehmed Ağa"], "Selimiye Camii, Mimar Sinan tarafından Edirne'de yapılmıştır.", null, E5c),
    q("Dinî inancımızın mimarimize etkisi en çok hangisinde görülür?", "Cami mimarisinde", ["Yol yapımında", "Köprü maliyetinde", "Okul bahçelerinde"], "Cami yapımında kubbe, minare ve mihrap gibi dinî özellikler ön plandadır.", null, E5c),
  ] },
  "6": { ek: [
    q("Kunut duasındaki “nesteînüke” sözü ne anlama gelir?", "Senden yardım isteriz", ["Sana yalvarırız", "Seni överiz", "Senden korkarız"], "Kunut dualarında Allah'tan yardım ve bağışlanma dilenir; “nesteînüke” senden yardım isteriz demektir.", null, E6a),
    q("Kunut duasındaki “nestağfiruke” sözü ne anlama gelir?", "Senden bağışlanma dileriz", ["Sana şükrederiz", "Sana güveniriz", "Seni zikrederiz"], "İstiğfar, Allah'tan bağışlanma dilemektir.", null, E6a),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Senden yardım isteriz", ["Senden bağışlanma dileriz", "Sana iman ederiz", "Sana şükrederiz"], "Kunut duasındaki “nesteînüke” ifadesi yardım istemeyi anlatır.", tablo(["Kunut duasından ifade", "Anlamı"], [["Nestağfiruke", "Senden bağışlanma dileriz"], ["Nesteînüke", "?"]], "Kunut duası ifadeleri"), E6a),
    q("Bir Müslüman dua ederken aşağıdakilerden hangisini yapmalıdır?", "Samimi ve içten bir şekilde Allah'a yönelmelidir", ["Dua ile başkalarını incitmelidir", "Yalnızca gösteriş için dua etmelidir", "Duanın kabulünü Allah'tan beklememelidir"], "Dua, Allah'a samimiyetle yönelmek ve O'ndan istemektir.", null, E6a),
    q("Hata yaptığını fark eden bir kişinin Allah'tan bağışlanma dilemesine ne denir?", "Tevbe ve istiğfar", ["Gıybet", "Hamd", "Cimrilik"], "Tevbe ve istiğfar, hatadan pişman olup Allah'tan bağışlanma dilemektir.", null, E6a),
    q("Hz. Muhammed (sav) hangi şehirde dünyaya gelmiştir?", "Mekke", ["Medine", "Kudüs", "Taif"], "Hz. Muhammed (sav) Mekke'de doğmuştur.", null, E6b),
    q("Hz. Muhammed (sav) hangi kabileye mensuptur?", "Kureyş", ["Evs", "Hazrec", "Sakif"], "Hz. Muhammed (sav) Kureyş kabilesinin Haşimoğulları koluna mensuptur.", null, E6b),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Abdullah", ["Ebû Talib", "Abdülmuttalib", "Hamza"], "Hz. Muhammed'in babası Abdullah, annesi Âmine'dir.", tablo(["Yakını", "Adı"], [["Annesi", "Âmine"], ["Babası", "?"], ["Dedesi", "Abdülmuttalib"]], "Hz. Muhammed'in ailesi"), E6b),
    q("Hz. Muhammed (sav) dünyaya geldiğinde Mekke'de insanların büyük bölümü neye tapıyordu?", "Putlara", ["Yıldızlara", "Ateşe", "Güneşe"], "O dönemde Mekke'de çoğunlukla put inancı yaygındı; Kâbe'nin etrafı putlarla doluydu.", null, E6b),
    q("Hz. Muhammed'in doğduğu şehirde bulunan, Hz. İbrahim ve oğlu Hz. İsmail'in yaptığı ibadet yeri hangisidir?", "Kâbe", ["Mescid-i Nebevî", "Mescid-i Aksa", "Kuba Mescidi"], "Kâbe, Mekke'de bulunur ve Hz. İbrahim ile Hz. İsmail tarafından inşa edilmiştir.", null, E6b),
  ] },
  "8": { ek: [
    q("Hz. Musa (as) hangi hükümdara tebliğ için gönderilmiştir?", "Firavun", ["Nemrut", "Câlût", "Karun"], "Hz. Musa, Mısır hükümdarı Firavun'a ve halkına gönderilmiştir.", null, E8a),
    q("Hz. Musa'ya (as) hangi ilahi kitap verilmiştir?", "Tevrat", ["İncil", "Zebur", "Suhuf"], "Tevrat, Hz. Musa'ya verilen kitaptır.", null, E8a),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Zebur", ["Tevrat", "İncil", "Kur'an-ı Kerim"], "Zebur, Hz. Davud'a verilmiştir.", tablo(["Peygamber", "Kitap"], [["Hz. Musa", "Tevrat"], ["Hz. Davud", "?"], ["Hz. İsa", "İncil"], ["Hz. Muhammed", "Kur'an-ı Kerim"]], "Peygamberler ve kitapları"), E8a),
    q("Hz. Musa'nın (as) kardeşi ve ona yardımcı olan peygamber kimdir?", "Hz. Harun", ["Hz. Lut", "Hz. Yahya", "Hz. Salih"], "Hz. Harun, Hz. Musa'nın kardeşi ve yardımcısı olan peygamberdir.", null, E8a),
    q("Hz. Musa (as) hangi kavme gönderilen peygamberlerdendir?", "İsrailoğulları", ["Semud", "Âd", "Medyen"], "Hz. Musa, Firavun'a ve İsrailoğullarına gönderilmiştir.", null, E8a),
    q("Asr Suresi kaç ayettir?", "3", ["5", "7", "10"], "Asr Suresi, Kur'an'ın 103. suresidir ve 3 ayettir.", null, E8b),
    q("Asr Suresi'nde yemin edilen “asr” kelimesi neyi ifade eder?", "Zamanı", ["Mekânı", "Toprağı", "Denizi"], "Asr, zaman demektir; sure zamana yemin ederek başlar.", null, E8b),
    q("Asr Suresi'ne göre ziyanda olmayanlar kimlerdir?", "İman edip salih amel işleyenler, birbirlerine hakkı ve sabrı tavsiye edenler", ["Çok mal biriktirenler", "Yalnızca yalnız yaşayanlar", "Hiç hata yapmayanlar"], "Sure, ziyandan kurtulmanın şartlarını sayar: iman, salih amel, hakkı ve sabrı tavsiye.", null, E8b),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Hakkı ve sabrı tavsiye etmek", ["Zenginlik", "Şöhret", "Yalnızlık"], "Asr Suresi'ne göre bu dört özellik insanı ziyandan kurtarır.", tablo(["Asr Suresi'nde ziyandan kurtulma şartları"], [["İman etmek"], ["Salih amel işlemek"], ["Hakkı tavsiye etmek"], ["?"]], "Asr Suresi"), E8b),
    q("Asr Suresi'ne göre insan zaman içinde neden ziyandadır?", "İman ve salih amel olmadan geçen zaman boşa gider", ["Zaman çok hızlı aktığı için", "Hiç çalışmadığı için", "Çok uyuduğu için"], "Sure, iman ve salih amel sahibi olmayan insanın ziyanda olduğunu bildirir.", null, E8b),
  ] },
};
