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
const E4a = { u: "İslam'ı Tanıyalım", k: "İslam’ın İnanç Esasları" };
const E4b = { u: "İslam'ı Tanıyalım", k: "İslam’ın Şartları" };
const E4c = { u: "Güzel Ahlak", k: "İnsani İlişkilerin Temeli: Sevgi ve Saygı" };
const E4d = { u: "Güzel Ahlak", k: "Bir Sure Tanıyorum: Fatiha Suresi ve Anlamı" };
const E4e = { u: "Hz. Muhammed'i Tanıyalım", k: "Hz. Muhammed'in (sav) Doğduğu Çevre" };
const E4f = { u: "Hz. Muhammed'i Tanıyalım", k: "Hz. Muhammed’in (sav) Ailesi" };
const E6c = { u: "Ramazan ve Oruç", k: "Orucun İnsana Kazandırdıkları" };
const E6d = { u: "Ramazan ve Oruç", k: "Bir Dua Öğreniyorum: İftar Duası" };
const E6e = { u: "Ahlaki Davranışlar", k: "Doğru Sözlü Olmak" };
const E6f = { u: "Ahlaki Davranışlar", k: "Merhametli Olmak" };
const E6g = { u: "Kültürümüzde Dini Motifler", k: "Edebiyatımızda Dinin İzleri" };
const E6h = { u: "Kültürümüzde Dini Motifler", k: "Musikimizde Dinin İzleri" };
const E7a = { u: "Hac, Umre ve Kurban", k: "Bir Sure Öğreniyorum: Kâfirun Suresi" };
const E7b = { u: "İslam Düşüncesinde Yorumlar", k: "Din Anlayışındaki Yorum Farklılıkları" };
const E7c = { u: "İslam Düşüncesinde Yorumlar", k: "İslam Düşüncesinde Yorum Biçimleri" };
const E7d = { u: "İslam Düşüncesinde Yorumlar", k: "Kültürümüzdeki Tasavvufi Yorumlar" };
const E7e = { u: "İslam Düşüncesinde Yorumlar", k: "Alevilik Bektaşilik ile İlgili Temel Kavramlar ve Cem Erkânları" };
const E7f = { u: "Peygamber Olarak Hz. Muhammed", k: "Hz. Muhammed’in Daveti: Mekke Dönemi" };
const E7g = { u: "Peygamber Olarak Hz. Muhammed", k: "Hicret" };
const E7h = { u: "Peygamber Olarak Hz. Muhammed", k: "Hz. Muhammed’in Daveti: Medine Dönemi" };
const E7i = { u: "Peygamber Olarak Hz. Muhammed", k: "Bir Sure Öğreniyorum: Nasr Suresi" };
const E7j = { u: "Yaşayan Dünya Dinleri", k: "Yahudilik" };
const E8c = { u: "Zekât ve Sadaka", k: "Bir Sure Tanıyorum: Maun Suresi ve Anlamı" };
const E8d = { u: "Din ve Hayat", k: "Din, Birey ve Toplum" };
const E8e = { u: "Din ve Hayat", k: "Dinin Temel Gayesi" };
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
    q("Oruç ibadeti insana aşağıdakilerden hangisini kazandırır?", "Sabır ve irade gücünü", ["Cimriliği", "Tembelliği", "Kibri"], "Oruç; açlığa ve susuzluğa katlanmayı öğreterek sabrı ve irade gücünü artırır, yoksulları anlamayı sağlar.", null, E6c),
    q("İftar duasındaki “leke sumtü” sözü ne anlama gelir?", "Senin için oruç tuttum", ["Senin için namaz kıldım", "Sana şükrettim", "Senden bağışlanma diledim"], "İftar duasında “Allah'ım! Senin rızan için oruç tuttum” denir; “sumtü” oruç tuttum demektir.", null, E6d),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Sana güvendim", ["Sana şükrettim", "Senden yardım istedim", "Senin için namaz kıldım"], "“Tevekkeltü” güvendim, dayandım anlamına gelir.", tablo(["İftar duasından ifade", "Anlamı"], [["Âmentü", "Sana inandım"], ["Tevekkeltü", "?"], ["Eftartü", "Orucumu açtım"]], "İftar duası ifadeleri"), E6d),
    q("Mekkeliler Hz. Muhammed'e (sav) doğruluğu ve güvenilirliği nedeniyle hangi lakabı vermişlerdir?", "el-Emin", ["el-Alim", "el-Cesur", "el-Zengin"], "Hz. Muhammed (sav) doğru sözlülüğü ve güvenilirliği nedeniyle “el-Emin” (güvenilir kişi) diye anılmıştır.", null, E6e),
    q("Sokakta üşüyen yavru bir kedi gören merhametli bir kişi ne yapar?", "Ona yiyecek verir ve korunacak bir yer bulmaya çalışır", ["Görmezden gelip yoluna devam eder", "Ona taş atar", "Onunla alay eder"], "Merhamet; canlılara şefkat göstermek, onların ihtiyacını gidermeye çalışmaktır.", null, E6f),
    q("Yunus Emre'nin şiirlerinde en çok işlenen konu aşağıdakilerden hangisidir?", "Allah sevgisi ve insan sevgisi", ["Savaş taktikleri", "Ticaret kuralları", "Hava durumu"], "Yunus Emre; “Yaratılanı severiz Yaratandan ötürü” sözüyle Allah sevgisini ve insan sevgisini dile getirmiştir.", null, E6g),
    q("Hz. Muhammed'in (sav) doğumunu ve hayatını anlatan, Süleyman Çelebi'nin yazdığı eser hangisidir?", "Mevlid", ["Kutadgu Bilig", "Dede Korkut Hikâyeleri", "Divanü Lügati't-Türk"], "Süleyman Çelebi'nin Mevlid'i (Vesîletü'n-Necât) edebiyatımızın en sevilen dinî eserlerindendir.", null, E6g),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Mevlânâ Celâleddîn-i Rûmî", ["Karacaoğlan", "Dede Korkut", "Nasreddin Hoca"], "Mesnevi, Mevlânâ Celâleddîn-i Rûmî'nin yazdığı ünlü eserdir.", tablo(["Eser", "Yazarı"], [["Mevlid", "Süleyman Çelebi"], ["Mesnevi", "?"]], "Dinî edebiyatımızdan eserler"), E6g),
    q("Allah'ı ve Hz. Muhammed'i (sav) sevgiyle anlatan, müzik eşliğinde veya ezgiyle okunan dinî şiirlere ne ad verilir?", "İlahi", ["Ninni", "Mâni", "Ağıt"], "İlahiler, dinî musikimizin en yaygın türlerindendir.", null, E6h),
    q("Mevlevîlikte ney ve kudüm eşliğinde dönerek yapılan dinî törene ne ad verilir?", "Sema", ["Mehter", "Horon", "Zeybek"], "Sema, Mevlevî ayininde müzik eşliğinde dönülerek yapılan törendir.", null, E6h),
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
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Sabrı tavsiye etmek", ["Zenginlik", "Şöhret", "Yalnızlık"], "Asr Suresi'ne göre bu dört özellik insanı ziyandan kurtarır.", tablo(["Asr Suresi'nde ziyandan kurtulma şartları"], [["İman etmek"], ["Salih amel işlemek"], ["Hakkı tavsiye etmek"], ["?"]], "Asr Suresi"), E8b),
    q("Asr Suresi'ne göre iman edip salih amel işleyenler, hakkı ve sabrı tavsiye edenler dışındaki insanlar hangi durumdadır?", "Ziyan (hüsran) içindedir", ["Kurtulmuştur", "Zengindir", "Yalnızdır"], "Asr Suresi, zamana yemin ederek insanın ziyanda olduğunu, yalnızca iman edip salih amel işleyenlerin, hakkı ve sabrı tavsiye edenlerin ziyandan kurtulduğunu bildirir.", null, E8b),
    q("Maun Suresi'ne göre dini yalanlayan kişinin özelliklerinden biri hangisidir?", "Yetimi itip kakar", ["Yetimi korur", "Yoksulu doyurmaya teşvik eder", "Namazlarını özenle kılar"], "Maun Suresi, dini yalanlayanın yetimi itip kakan ve yoksulu doyurmayı teşvik etmeyen kimse olduğunu bildirir.", null, E8c),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "7", ["3", "4", "5"], "Maun Suresi, Kur'an-ı Kerim'in 107. suresidir ve 7 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Kevser", "3"], ["Maun", "?"], ["Asr", "3"]], "Sureler ve ayet sayıları"), E8c),
    q("Dinin toplum hayatındaki olumlu etkilerinden biri hangisidir?", "Yardımlaşma ve dayanışmayı güçlendirmesi", ["İnsanları birbirinden koparması", "Gösterişi teşvik etmesi", "Bireyleri yalnızlaştırması"], "Din; paylaşma, yardımlaşma ve dayanışma gibi değerlerle toplumsal bağları güçlendirir.", null, E8d),
    q("Dinin bireye kazandırdığı değerlerden biri hangisidir?", "Sorumluluk bilinci ve iç huzur", ["Bencillik", "Kibir", "Sorumsuzluk"], "Din; kişiye hayatın anlamını, ahlaki sorumluluk bilincini ve iç huzuru kazandırır.", null, E8d),
    q("İslam dininin korunmasını amaçladığı temel değerlerden biri hangisidir?", "Can güvenliği", ["Şöhret", "Lüks yaşam", "Rekabet"], "Din, can, akıl, nesil ve mal; İslam'ın korunmasını amaçladığı temel değerlerdir.", null, E8e),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Zararlı alışkanlıklardan uzak durmak", ["Gece geç saatlere kadar uyanık kalmak", "Sürekli alışveriş yapmak", "Çok konuşmak"], "Aklı korumak için akla zarar veren alışkanlıklardan uzak durulur.", tablo(["Korunan değer", "Örnek davranış"], [["Can", "Trafik kurallarına uymak"], ["Mal", "İsraf etmemek"], ["Akıl", "?"]], "Dinin korumayı amaçladığı değerler"), E8e),
  ] },
  "4": { ek: [
    q("Aşağıdakilerden hangisi iman esaslarından biridir?", "Meleklere inanmak", ["Zekât vermek", "Hacca gitmek", "Oruç tutmak"], "Meleklere iman, iman esaslarındandır; zekât, hac ve oruç ise İslam'ın şartlarındandır.", null, E4a),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Kur'an-ı Kerim", ["Zebur", "Suhuf", "Tevrat"], "Hz. Muhammed'e (sav) verilen ilahi kitap Kur'an-ı Kerim'dir.", tablo(["Peygamber", "Kitap"], [["Hz. Musa", "Tevrat"], ["Hz. İsa", "İncil"], ["Hz. Muhammed", "?"]], "Peygamberler ve kitapları"), E4a),
    q("Allah'tan peygamberlere vahiy getiren melek kimdir?", "Cebrail", ["Mikail", "Azrail", "İsrafil"], "Vahiy meleği Hz. Cebrail'dir.", null, E4a),
    q("İslam'ın şartlarından olup Ramazan ayında tutulan ibadet hangisidir?", "Oruç", ["Namaz", "Zekât", "Hac"], "Oruç, Ramazan ayında tutulan ve İslam'ın şartlarından olan ibadettir.", null, E4b),
    q("Tabloda soru işareti yerine hangisi gelmelidir?", "Malın belli bir kısmını ihtiyaç sahiplerine vermek", ["Ramazan'da yemeden içmeden uzak durmak", "Kelime-i şehadet getirmek", "Kâbe'yi tavaf etmek"], "Zekât, zengin Müslümanın malının belli bir kısmını ihtiyaç sahiplerine vermesidir.", tablo(["İslam'ın şartı", "Kısa açıklaması"], [["Namaz", "Günde beş vakit kılınır"], ["Hac", "Kâbe'yi ziyaret etmektir"], ["Zekât", "?"]], "İslam'ın şartları"), E4b),
    q("Kelime-i şehadet getirmek ne anlama gelir?", "Allah'tan başka ilah olmadığına ve Hz. Muhammed'in O'nun kulu ve elçisi olduğuna tanıklık etmek", ["Gücü yetenin Kâbe'yi ziyaret etmesi", "Her gün sabah namazı kılması", "Ramazan'da oruç tutması"], "Kelime-i şehadet, İslam'ın birinci şartıdır ve bu tanıklığı dile getirmektir.", null, E4b),
    q("Fatiha Suresi'ndeki “Elhamdülillâhi Rabbil âlemîn” ayeti hangi anlama gelir?", "Hamd, âlemlerin Rabbi Allah'a mahsustur", ["Allah doğmamış ve doğurulmamıştır", "Namazı dosdoğru kılın", "Yetimi itip kakmayın"], "Fatiha Suresi, hamdin âlemlerin Rabbi olan Allah'a ait olduğunu bildirerek başlar.", null, E4d),
    q("Hz. Muhammed'in (sav) doğduğu yıl hangi adla anılır?", "Fil Yılı", ["Hicret Yılı", "Hüzün Yılı", "Bayram Yılı"], "Hz. Muhammed (sav) Fil Yılı olarak bilinen yılda Mekke'de dünyaya gelmiştir.", null, E4e),
    q("Hz. Muhammed'in (sav) ilk eşi aşağıdakilerden hangisidir?", "Hz. Hatice", ["Hz. Âişe", "Hz. Fatıma", "Hz. Âmine"], "Hz. Muhammed'in (sav) ilk eşi Hz. Hatice'dir.", null, E4f),
    q("Otobüste yaşlı bir teyze ayakta kalmıştır. Sevgi ve saygı gereği ne yapmalıyız?", "Yerimizi ona veririz", ["Görmezden geliriz", "Ona gülüp geçeriz", "Telefonumuzla oynamaya devam ederiz"], "Büyüklerimize saygı göstermek ve onlara yardım etmek güzel ahlaktandır.", null, E4c),
  ] },
  "7": { ek: [
    q("Kâfirun Suresi, Kur'an-ı Kerim'in kaçıncı suresidir?", "109", ["110", "108", "112"], "Kâfirun Suresi 109. suredir ve 6 ayettir.", null, E7a),
    q("Kâfirun Suresi'ndeki “Lekum dînukum veliye dîn” ayetinin anlamı nedir?", "Sizin dininiz size, benim dinim banadır", ["Namazı dosdoğru kılın", "Allah birdir, doğmamış ve doğurulmamıştır", "Yetimi itip kakmayın"], "Bu ayet, herkesin kendi inancından sorumlu olduğunu ve inanç özgürlüğünü ifade eder.", null, E7a),
    q("Yorum farklılıklarına karşı aşağıdaki tutumlardan hangisi doğrudur?", "Farklı görüşlere saygı gösterip ortak değerlerde birlik olmak", ["Farklı düşünenleri dışlamak", "Kendi görüşünü başkalarına zorla kabul ettirmek", "Tartışmalar yüzünden ibadeti bırakmak"], "İslam'ın temel değerlerinde birlik olmak ve farklı yorumlara saygı göstermek hoşgörünün gereğidir.", null, E7b),
    q("İnanç esaslarının anlaşılması ve yorumlanmasıyla ilgili mezhepler hangi alana girer?", "İtikadi alan", ["Coğrafi alan", "Ticari alan", "Askerî alan"], "İtikadi mezhepler, inanç esaslarının anlaşılmasıyla ilgili yorum farklılıklarını ifade eder.", null, E7c),
    q("İbadetlerin nasıl yapılacağı ve günlük hayata ait hükümlerin yorumuyla ilgili mezhepler hangi alana girer?", "Amelî (fıkhî) alan", ["İtikadi alan", "Coğrafi alan", "Askerî alan"], "Amelî (fıkhî) mezhepler, ibadetler ve günlük hayat hükümleri konusundaki yorumları kapsar.", null, E7c),
    q("Mevlânâ ve Yunus Emre gibi isimlerin düşüncelerinde öne çıkan, nefsi terbiye edip Allah sevgisini esas alan anlayışa ne denir?", "Tasavvuf", ["Fıkıh", "Kelam", "Siyer"], "Tasavvuf; kalp temizliğini, nefsi terbiyeyi ve Allah sevgisini ön plana çıkaran yorum biçimidir.", null, E7d),
    q("Hacı Bektaş-ı Veli'nin külliyesi ve türbesi hangi ildeki Hacıbektaş ilçesinde bulunur?", "Nevşehir", ["Konya", "Kayseri", "Sivas"], "Hacı Bektaş-ı Veli Külliyesi, Nevşehir'in Hacıbektaş ilçesindedir.", null, E7e),
    q("Mekke döneminde baskılar artınca Hz. Muhammed (sav) bir grup Müslümanı hangi ülkeye göç ettirmiştir?", "Habeşistan", ["Mısır", "Yemen", "Bizans"], "Müslümanların bir kısmı Habeşistan'a hicret etmiştir.", null, E7f),
    q("Hz. Muhammed (sav) açık daveti ilk olarak hangi tepede duyurmuştur?", "Safa Tepesi", ["Uhud Dağı", "Sevr Mağarası", "Mina"], "Hz. Muhammed (sav) Safa Tepesi'ne çıkarak halkı açıktan İslam'a davet etmiştir.", null, E7f),
    q("Hicret yolculuğunda Hz. Muhammed (sav) ve Hz. Ebû Bekir'in üç gün saklandığı mağara hangisidir?", "Sevr Mağarası", ["Hira Mağarası", "Ashab-ı Kehf Mağarası", "Uhud Mağarası"], "Hicret sırasında Hz. Muhammed ve Hz. Ebû Bekir Sevr Mağarası'nda saklanmışlardır.", null, E7g),
    q("Hicret ettikleri Medine'de Muhacirleri karşılayıp onlara yardım eden Medineli Müslümanlara ne ad verilir?", "Ensar", ["Muhacir", "Tâbiîn", "Hanif"], "Medineli yardımsever Müslümanlara Ensar, Mekke'den göç edenlere Muhacir denir.", null, E7g),
    q("Hz. Muhammed (sav) Medine'de farklı toplulukların hak ve sorumluluklarını belirleyen hangi sözleşmeyi yapmıştır?", "Medine Sözleşmesi", ["Hudeybiye Barışı", "Akabe Biatı", "Veda Hutbesi"], "Medine Sözleşmesi, Medine'de birlikte yaşayan toplulukların hak ve görevlerini düzenlemiştir.", null, E7h),
    q("Müslümanlarla Mekkeliler arasındaki ilk büyük savaş hangisidir?", "Bedir Savaşı", ["Uhud Savaşı", "Hendek Savaşı", "Hayber Savaşı"], "Bedir Savaşı, hicretin ikinci yılında yapılan ilk büyük savaştır.", null, E7h),
    q("Nasr Suresi, Kur'an-ı Kerim'in kaçıncı suresidir?", "110", ["109", "111", "114"], "Nasr Suresi 110. suredir ve 3 ayettir.", null, E7i),
    q("Yahudilerin ibadet yerine ne ad verilir?", "Sinagog", ["Kilise", "Cami", "Pagoda"], "Yahudilerin ibadet ettiği yer sinagogdur.", null, E7j),
  ] },
};
