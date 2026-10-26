// Din Kültürü ve Ahlak Bilgisi: görselli sorular (tablolar, zaman şeritleri, cami şeması).
import { S, svg, tablo, Q } from "./gorselli-yardim.js";
const cami = svg(S.cami({}), "64%");
export default {
  "4": {
    "1.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Şükrederken", ["Üzülürken", "Kızarken", "Uyurken"], "“Elhamdülillah” Allah'a şükretmek için söylenen bir ifadedir.", tablo(["İfade", "Ne zaman söylenir?"], [["Bismillah", "Bir işe başlarken"], ["Elhamdülillah", "?"]], "Günlük hayattaki dinî ifadeler")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Namazın başında", ["Namazın sonunda", "Secdeden sonra", "Hiçbir namazda"], "Sübhaneke duası namaza başlarken okunur.", tablo(["Dua", "Okunduğu yer"], [["Sübhaneke", "?"]], "Namazda okunan dualar")),
    ],
    "1.2": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Ramazan ayında tutulur", ["Her gün yapılır", "Yalnızca bayramda yapılır", "Yılda bir kez Kâbe'de yapılır"], "Oruç, Ramazan ayında tutulan bir ibadettir.", tablo(["İslam'ın şartı", "Açıklama"], [["Namaz", "Günde beş vakit kılınır"], ["Oruç", "?"]], "İslam'ın şartları")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Kadere iman", ["Bayrama iman", "Okula iman", "Bahçeye iman"], "İmanın altı şartı: Allah, melekler, kitaplar, peygamberler, ahiret ve kadere iman.", tablo(["İmanın şartları"], [["Allah'a iman"], ["Meleklere iman"], ["Kitaplara iman"], ["Peygamberlere iman"], ["Ahirete iman"], ["?"]], "İmanın şartları")),
    ],
    "1.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Saygı", ["Kıskançlık", "Tembellik", "Öfke"], "Büyüklere saygı göstermek saygı değerini yansıtır.", tablo(["Davranış", "Ahlaki değer"], [["Verdiği sözü tutmak", "Dürüstlük"], ["Büyüklere yer vermek", "?"]], "Güzel ahlak")),
      Q("Tabloda soru işareti yerine hangi sayı gelmelidir?", "114", ["30", "60", "100"], "Kur'an-ı Kerim 114 sureden oluşur.", tablo(["Kur'an-ı Kerim", "Sayı"], [["Cüz sayısı", "30"], ["Sure sayısı", "?"]], "Kur'an-ı Kerim")),
    ],
    "2.1": [
      Q("Tabloya göre Fatiha Suresi kaç ayettir?", "7", ["3", "4", "5"], "Fatiha Suresi 7 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Fatiha", "7"], ["İhlas", "4"], ["Kevser", "3"]], "Sureler")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Abdullah", ["Ebu Talib", "Abdülmuttalib", "Ebu Bekir"], "Hz. Muhammed'in babası Abdullah'tır.", tablo(["Bilgi", "Adı"], [["Doğduğu şehir", "Mekke"], ["Annesi", "Amine"], ["Babası", "?"]], "Hz. Muhammed'in ailesi")),
    ],
    "2.2": [
      Q("Şemaya göre Hz. Muhammed'in peygamber olduktan sonra Mekke'den Medine'ye göç etmesine ne ad verilir?", "Hicret", ["Miraç", "Fetih", "Umre"], "Mekke'den Medine'ye göç hicrettir.", svg(S.zincir({ adlar: ["Doğum (Mekke)", "Peygamberlik", "Hicret", "Medine dönemi"], renk: "#fff4c2" }), "92%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Halime", ["Amine", "Hatice", "Fatıma"], "Hz. Muhammed'in sütannesi Halime'dir.", tablo(["Bilgi", "Adı"], [["Lakabı", "El-Emin (güvenilir)"], ["Sütannesi", "?"]], "Hz. Muhammed'in çocukluğu")),
    ],
    "2.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Giysileri düzenli yıkamak", ["Çöpleri yere atmak", "Yıkanmamak", "Kirli giysi giymek"], "Giysi temizliği giysileri düzenli yıkamayı gerektirir.", tablo(["Temizlik türü", "Örnek davranış"], [["Beden temizliği", "Dişleri fırçalamak"], ["Çevre temizliği", "Çöpü çöp kutusuna atmak"], ["Giysi temizliği", "?"]], "Temizlik")),
      Q("Tabloda abdestte yüzden sonra yıkanan uzuv hangisidir?", "Kollar (dirseklerle birlikte)", ["Ayaklar", "Kulaklar", "Omuzlar"], "Abdestte yüz yıkandıktan sonra kollar dirseklerle birlikte yıkanır.", tablo(["Sıra", "Uzuv"], [["1", "Yüz"], ["2", "?"], ["3", "Başı meshetmek"], ["4", "Ayaklar"]], "Abdestin sırası")),
    ],
  },
  "5": {
    "1.1": [
      Q("Tabloya göre akşam namazının farzı kaç rekâttır?", "3", ["2", "4", "5"], "Akşam namazının farzı 3 rekâttır.", tablo(["Vakit", "Farz rekât sayısı"], [["Sabah", "2"], ["Öğle", "4"], ["İkindi", "4"], ["Akşam", "?"], ["Yatsı", "4"]], "Beş vakit namaz")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Her şeyi gören", ["Her şeyi bilen", "Yaratan", "Bağışlayan"], "El-Basîr, her şeyi gören anlamındadır.", tablo(["Allah'ın güzel ismi", "Anlamı"], [["El-Halik", "Yaratan"], ["El-Âlim", "Her şeyi bilen"], ["El-Basîr", "?"]], "Allah'ın güzel isimleri")),
    ],
    "1.2": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Rükû", ["Selam", "Kâde", "Tekbir"], "Namazda kıyamdan sonra rükûya eğilinir.", tablo(["Sıra", "Namazın bölümü"], [["1", "Kıyam"], ["2", "?"], ["3", "Secde"], ["4", "Kâde (oturuş)"]], "Namazın kılınışı")),
      Q("Tabloya göre sabah namazının farzı kaç rekâttır?", "2", ["3", "4", "5"], "Sabah namazının farzı 2 rekâttır.", tablo(["Vakit", "Farz rekât sayısı"], [["Sabah", "2"], ["Öğle", "4"], ["Akşam", "3"]], "Namaz vakitleri")),
    ],
    "1.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Birlik ve beraberlik", ["Kıskançlık", "Yalnızlık", "Tembellik"], "Cemaatle namaz Müslümanlar arasında birlik ve beraberliği güçlendirir.", tablo(["Namazın özelliği", "Kazandırdığı değer"], [["Vaktinde kılmak", "Düzenli olmak"], ["Cemaatle kılmak", "?"]], "Namazın kazandırdıkları")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Sure", ["Cüz", "Ayet", "Harf"], "Kur'an-ı Kerim 114 sureden oluşur.", tablo(["Kur'an'ın bölümü", "Sayısı"], [["Cüz", "30"], ["?", "114"]], "Kur'an'ın iç düzeni")),
    ],
    "2.1": [
      Q("Tabloya göre Kevser Suresi kaç ayettir?", "3", ["4", "5", "7"], "Kevser Suresi 3 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Kevser", "?"], ["İhlas", "4"], ["Kureyş", "4"]], "Sureler")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Balığın karnına girmesi", ["Gemi yapması", "Ateşe atılması", "Kuyuya atılması"], "Hz. Yunus balığın karnına girmesiyle anılır.", tablo(["Peygamber", "Kıssası"], [["Hz. Nuh", "Gemi yapması"], ["Hz. Yunus", "?"]], "Peygamber kıssaları")),
    ],
    "2.2": [
      Q("Şekilde K ile gösterilen bölüm hangisidir?", "Kubbe", ["Minare", "Mihrap", "Şadırvan"], "Caminin üstündeki yarım küre biçimli örtüye kubbe denir.", cami),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Hutbenin okunduğu yer", ["Abdest alınan yer", "Ezanın okunduğu kule", "Kıble yönünü gösteren oyuk"], "Minber, hutbenin okunduğu yüksek yerdir.", tablo(["Cami bölümü", "Görevi"], [["Mihrap", "Kıble yönünü gösterir"], ["Minber", "?"]], "Cami bölümleri")),
    ],
    "2.3": [
      Q("Şekilde L ile gösterilen yapı hangisidir?", "Minare", ["Kubbe", "Mihrap", "Minber"], "Ezanın okunduğu yüksek kuleye minare denir.", cami),
      Q("Tabloya göre Selimiye Camii hangi şehirdedir?", "Edirne", ["İstanbul", "Bursa", "Konya"], "Selimiye Camii Edirne'dedir.", tablo(["Cami", "Şehir", "Mimar"], [["Selimiye", "Edirne", "Mimar Sinan"], ["Süleymaniye", "İstanbul", "Mimar Sinan"]], "Camilerimiz")),
    ],
  },
  "6": {
    "1.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Hz. İsa", ["Hz. Musa", "Hz. Davud", "Hz. Muhammed"], "İncil, Hz. İsa'ya indirilmiştir.", tablo(["İlahi kitap", "İndirildiği peygamber"], [["Tevrat", "Hz. Musa"], ["Zebur", "Hz. Davud"], ["İncil", "?"], ["Kur'an-ı Kerim", "Hz. Muhammed"]], "İlahi kitaplar")),
      Q("Tabloya göre Felak Suresi kaç ayettir?", "5", ["4", "6", "7"], "Felak Suresi 5 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Felak", "?"], ["Nâs", "6"], ["İhlas", "4"]], "Sureler")),
    ],
    "1.2": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Akşam ezanıyla (güneş battıktan sonra)", ["Sabah ezanıyla", "Öğle ezanıyla", "Gece yarısı"], "İftar, güneş battıktan sonra akşam ezanıyla yapılır.", tablo(["Ramazan'da", "Zamanı"], [["Sahur", "İmsaktan önce"], ["İftar", "?"]], "Sahur ve iftar")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Ramazan Bayramı'ndan önce verilen sadaka", ["Hacda kesilen kurban", "Yılda bir kez verilen zekât", "Namaz öncesi alınan abdest"], "Fitre, Ramazan Bayramı'ndan önce verilen sadakadır.", tablo(["Kavram", "Açıklama"], [["Teravih", "Ramazan'da yatsıdan sonra kılınan namaz"], ["Fitre", "?"]], "Ramazan ile ilgili kavramlar")),
    ],
    "1.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Merhamet", ["Kıskançlık", "Cimrilik", "Tembellik"], "Yardıma muhtaç birine yardım etmek merhametin göstergesidir.", tablo(["Davranış", "Değer"], [["Verdiği sözü tutmak", "Doğru sözlülük"], ["Yardıma muhtaç birine yardım etmek", "?"]], "Ahlaki değerler")),
      Q("Tabloya göre Kurban Bayramı hicrî takvimin hangi ayında kutlanır?", "Zilhicce", ["Şevval", "Ramazan", "Muharrem"], "Kurban Bayramı Zilhicce ayının 10. günü başlar.", tablo(["Bayram", "Hicrî tarih"], [["Ramazan Bayramı", "1 Şevval"], ["Kurban Bayramı", "10 Zilhicce"]], "Bayramlar")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Karşımızdakini sabırla dinlemek", ["Sözünü kesmek", "Dinlememek", "Konuyu değiştirmek"], "Söz kesmemek, karşımızdakini sabırla dinlemeyi gerektirir.", tablo(["Nezaket kuralı", "Örnek davranış"], [["Selam vermek", "Karşılaşınca selamlaşmak"], ["Söz kesmemek", "?"]], "Adap ve nezaket")),
      Q("Tabloya göre Hz. Muhammed'in dedesi kimdir?", "Abdülmuttalib", ["Ebu Talib", "Abdullah", "Ebu Cehil"], "Hz. Muhammed'in dedesi Abdülmuttalib'dir.", tablo(["Yakını", "Adı"], [["Babası", "Abdullah"], ["Annesi", "Amine"], ["Dedesi", "?"], ["Amcası", "Ebu Talib"]], "Hz. Muhammed'in ailesi")),
    ],
    "2.2": [
      Q("Tabloya göre Fil Suresi kaç ayettir?", "5", ["3", "4", "6"], "Fil Suresi 5 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Fil", "?"], ["Kureyş", "4"], ["Nasr", "3"]], "Sureler")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Güvenilir", ["Cesur", "Zengin", "Hızlı"], "El-Emin, güvenilir anlamına gelir.", tablo(["Lakap", "Anlamı"], [["El-Emin", "?"]], "Hz. Muhammed'in lakabı")),
    ],
    "2.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Dinî konulu, çoğunlukla ezgiyle söylenen şiir", ["Bir savaş şarkısı", "Bir oyun türü", "Bir yemek"], "İlahi, dinî ve ahlaki konuları işleyen, genellikle ezgiyle söylenen şiirdir.", tablo(["Eser", "Açıklama"], [["Mevlid", "Hz. Muhammed'in doğumunu anlatan eser (Süleyman Çelebi)"], ["İlahi", "?"]], "Dinî edebiyat")),
      Q("Tabloya göre Mevlevî musikisinde hangi çalgı kullanılır?", "Ney", ["Gitar", "Piyano", "Davul"], "Mevlevî musikisinde ney önemli bir çalgıdır.", tablo(["Musiki türü", "Çalgı"], [["Mevlevî ayini", "Ney"], ["Askerî bando", "Davul"]], "Çalgılar")),
    ],
  },
  "7": {
    "1.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Can almak", ["Vahiy getirmek", "Yağmur yağdırmak", "Sur'a üflemek"], "Azrail (Mekik'ul-mevt) canları almakla görevlidir.", tablo(["Melek", "Görevi"], [["Cebrail", "Vahiy getirmek"], ["İsrafil", "Sur'a üflemek"], ["Azrail", "?"]], "Melekler")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Kâbe'nin etrafında yedi kez dönmek", ["Arafat'ta durmak", "Kurban kesmek", "Safa ile Merve arasında gidip gelmek"], "Tavaf, Kâbe'nin etrafında yedi kez dönmektir.", tablo(["Hac ibadeti", "Açıklama"], [["İhram", "Hacda giyilen özel kıyafet"], ["Tavaf", "?"]], "Hac ibadeti")),
    ],
    "1.2": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "10 Zilhicce", ["8 Zilhicce", "9 Zilhicce", "1 Şevval"], "Kurban Bayramı'nın ilk günü 10 Zilhicce'dir.", tablo(["Olay", "Hicrî tarih"], [["Arafat'ta durma (vakfe)", "9 Zilhicce"], ["Kurban Bayramı'nın ilk günü", "?"]], "Hac takvimi")),
      Q("Tabloya göre hangi ibadet yılın her zamanında yapılabilir?", "Umre", ["Hac", "Oruç", "Zekât"], "Umre, yılın her döneminde yapılabilen ibadettir.", tablo(["İbadet", "Zamanı"], [["Hac", "Belirli günlerde (Zilhicce)"], ["Umre", "Yılın her döneminde"]], "Hac ve umre")),
    ],
    "1.3": [
      Q("Tabloya göre Kâfirun Suresi kaç ayettir?", "6", ["4", "5", "7"], "Kâfirun Suresi 6 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Kâfirun", "?"], ["Felak", "5"], ["İhlas", "4"]], "Sureler")),
      Q("Tabloya göre Hanefi mezhebinin imamı kimdir?", "İmam-ı Âzam Ebu Hanife", ["İmam Şafii", "İmam Malik", "Ahmed b. Hanbel"], "Hanefi mezhebinin imamı Ebu Hanife'dir.", tablo(["Mezhep", "İmamı"], [["Hanefi", "?"], ["Şafii", "İmam Şafii"], ["Maliki", "İmam Malik"], ["Hanbeli", "Ahmed b. Hanbel"]], "Fıkıh mezhepleri")),
    ],
    "2.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Hacı Bektaş-ı Veli", ["Mevlânâ", "Yunus Emre", "Ahmet Yesevî"], "Makâlât adlı eser Hacı Bektaş-ı Veli'ye aittir.", tablo(["Eser", "Yazarı"], [["Mesnevi", "Mevlânâ"], ["Makâlât", "?"]], "Eserler ve yazarları")),
      Q("Tabloya göre hicret hangi yıl gerçekleşmiştir?", "622", ["610", "624", "630"], "Hicret 622'de gerçekleşmiştir.", tablo(["Olay", "Yıl (miladî)"], [["Hicret", "?"], ["Bedir Savaşı", "624"], ["Mekke'nin fethi", "630"]], "Siyer olayları")),
    ],
    "2.2": [
      Q("Zaman şeridine göre Mekke'nin fethi hangi yılda gerçekleşmiştir?", "630", ["622", "624", "627"], "Mekke 630'da fethedilmiştir.", svg(S.zamanSeridi({ olaylar: [{ yil: "622", ad: "Hicret" }, { yil: "624", ad: "Bedir" }, { yil: "627", ad: "Hendek" }, { yil: "630", ad: "Mekke'nin fethi" }] }), "92%")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Cami", ["Kilise", "Sinagog", "Pagoda"], "Müslümanların ibadet yeri camidir.", tablo(["Din", "Kutsal kitap", "İbadet yeri"], [["Yahudilik", "Tevrat", "Sinagog"], ["Hristiyanlık", "İncil", "Kilise"], ["İslam", "Kur'an-ı Kerim", "?"]], "Dinler")),
    ],
    "2.3": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Vedalar", ["İncil", "Tevrat", "Kur'an-ı Kerim"], "Hinduizmin kutsal kitapları Vedalar'dır.", tablo(["Din", "Kutsal kitap"], [["Hristiyanlık", "İncil"], ["Yahudilik", "Tevrat"], ["Hinduizm", "?"]], "Dünya dinleri")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Buda", ["Hz. Musa", "Hz. İsa", "Zerdüşt"], "Budizm'in kurucusu Buda'dır (Siddhartha Gautama).", tablo(["Din", "Kurucusu / önemli kişisi"], [["Budizm", "?"], ["Hristiyanlık", "Hz. İsa'ya inananlar"]], "Dünya dinleri")),
    ],
  },
  "8": {
    "1.1": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Gerekli tedbiri aldıktan sonra Allah'a güvenmek", ["Hiçbir şey yapmadan beklemek", "Tedbir almamak", "Her şeyi şansa bırakmak"], "Tevekkül, gereken çabayı gösterdikten sonra Allah'a güvenmektir.", tablo(["Kavram", "Anlamı"], [["Kader", "Allah'ın ezelî bilgisiyle her şeyi takdir etmesi"], ["Tevekkül", "?"]], "Kader ile ilgili kavramlar")),
      Q("Tabloya göre Hz. Musa'nın kardeşi kimdir?", "Hz. Harun", ["Hz. Yusuf", "Hz. İsa", "Hz. Nuh"], "Hz. Musa'nın kardeşi Hz. Harun'dur.", tablo(["Peygamber", "Bilgi"], [["Hz. Musa", "Kardeşi Hz. Harun'dur"], ["Firavun", "Hz. Musa'nın zamanındaki zorba yönetici"]], "Hz. Musa")),
    ],
    "1.2": [
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Karşılıksız verilen yardım; miktar şartı yoktur", ["Yılda bir kez verilen zorunlu mal", "Ramazan'da tutulan oruç", "Hacda kesilen kurban"], "Sadaka, karşılıksız yapılan yardımdır; belirli bir miktar şartı yoktur.", tablo(["İbadet", "Açıklama"], [["Zekât", "Nisap miktarı malı olanın verdiği farz mali ibadet"], ["Sadaka", "?"]], "Zekât ve sadaka")),
      Q("Tabloya göre para zekâtı oranı nedir?", "Kırkta bir (%2,5)", ["Onda bir (%10)", "Yüzde bir (%1)", "Beşte bir (%20)"], "Para ve ticaret malı zekâtı kırkta birdir (%2,5).", tablo(["Mal", "Zekât oranı"], [["Para", "?"]], "Zekât oranı")),
    ],
    "1.3": [
      Q("Tabloya göre Maun Suresi kaç ayettir?", "7", ["4", "5", "6"], "Maun Suresi 7 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Maun", "?"], ["İhlas", "4"], ["Felak", "5"]], "Sureler")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Akıl", ["Zenginlik", "Güç", "Makam"], "Dinin korumayı amaçladığı beş temel değer: din, can, akıl, nesil ve mal.", tablo(["Dinin korumayı hedeflediği temel değerler"], [["Din"], ["Can"], ["?"], ["Nesil"], ["Mal"]], "Temel değerler")),
    ],
    "2.1": [
      Q("Tabloya göre Asr Suresi kaç ayettir?", "3", ["4", "5", "7"], "Asr Suresi 3 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Asr", "?"], ["Kureyş", "4"], ["Maun", "7"]], "Sureler")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Kardeşleri tarafından kuyuya atılması", ["Gemi yapması", "Balığın karnına girmesi", "Ateşe atılması"], "Hz. Yusuf'un kıssasında kardeşleri onu kuyuya atmıştır.", tablo(["Peygamber", "Kıssası"], [["Hz. Nuh", "Gemi yapması"], ["Hz. Yusuf", "?"]], "Peygamber kıssaları")),
    ],
    "2.2": [
      Q("Tabloya göre Kureyş Suresi kaç ayettir?", "4", ["3", "5", "7"], "Kureyş Suresi 4 ayettir.", tablo(["Sure", "Ayet sayısı"], [["Kureyş", "?"], ["Asr", "3"], ["Maun", "7"]], "Sureler")),
      Q("Tabloya göre Hendek Savaşı hangi yıl yapılmıştır?", "627", ["624", "625", "630"], "Hendek Savaşı 627'de yapılmıştır.", tablo(["Savaş", "Yıl"], [["Bedir", "624"], ["Uhud", "625"], ["Hendek", "?"]], "Savaşlar")),
    ],
    "2.3": [
      Q("Tabloda soru işareti yerine hangi sayı gelmelidir?", "114", ["30", "60", "100"], "Kur'an-ı Kerim 114 sureden oluşur.", tablo(["Kur'an-ı Kerim", "Sayı"], [["Cüz sayısı", "30"], ["Sure sayısı", "?"]], "Kur'an-ı Kerim")),
      Q("Tabloda soru işareti yerine hangisi gelmelidir?", "Tevrat", ["İncil", "Zebur", "Kur'an-ı Kerim"], "Hz. Musa'ya Tevrat indirilmiştir.", tablo(["Peygamber", "Kıssa / kitap"], [["Hz. Nuh", "Tufan ve gemi"], ["Hz. Musa", "?"]], "Peygamberler")),
    ],
  },
};
