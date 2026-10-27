// Plandaki boşluk konuları için eklenen sorular. Biçim: { "sınıf": { "ek": [ [soru, [seçenekler], doğruİndeks, açıklama, gorsel|null, {u:"ünite", k:"konu"}] ] } }
import { S, svg, tablo, Q } from "./gorselli-yardim.js";
const E = (q, u, k) => [...q.slice(0, 4), q[4] ?? null, { u, k }];
const U51 = "Geometrik Şekiller", K51 = "Temel Geometrik Çizimler ve İnşalar";
const U52 = "Sayılar ve Nicelikler (1)", K52 = "Doğal Sayılarla Dört İşlem İçeren Problem Çözme Dikdörtgenin Çevre Uzunluğu ve Alanı";
const U53 = "İşlemlerle Cebirsel Düşünme", K53 = "Temel Aritmetik İşlemler ve Algoritma";
const U71 = "Sayılar ve Nicelikler (1)", K71 = "Cisimlerin Farklı Yönlerden Görünümleri";
const U72 = "Sayılar ve Nicelikler (2)", K72 = "Orantılı Durumlar";
const U73 = "İşlemlerle Cebirsel Düşünme", K73 = "Cebirsel İfadelerle İşlemler ve Algoritma";
const e5a = [
  Q("Merkezi O noktası olan ve her noktası O'ya 4 cm uzaklıkta bulunan çember çizmek için pergelin açıklığı kaç cm olmalıdır?", "4", ["8", "2", "16"], "Çemberin yarıçapı pergel açıklığına eşittir: 4 cm."),
  Q("Merkezi ve yarıçapı verilen bir çemberi çizmek için aşağıdaki araçlardan hangisi kullanılır?", "Pergel", ["Gönye", "Cetvel", "İletki"], "Çember çizmek için pergel kullanılır; açıklığı yarıçapa ayarlanır."),
  Q("Uzunluğu 10 cm olan bir doğru parçasının orta noktası, doğru parçasının uçlarına kaçar cm uzaklıktadır?", "5", ["10", "20", "2"], "Orta nokta doğru parçasını eş iki parçaya böler: 10 ÷ 2 = 5 cm."),
  Q("Bir başlangıç noktası olan, bu noktadan başlayıp tek yönde sınırsız uzanan doğru kısmına ne denir?", "Işın", ["Doğru parçası", "Çember", "Köşe"], "Başlangıç noktası olup bir yönde sınırsız devam eden doğru parçasına ışın denir."),
  Q("Şekilde gösterilen açı iletki ile ölçülürse ölçüsü 120° çıkar. Bu açı hangi türdendir?", "Geniş açı", ["Dar açı", "Dik açı", "Doğru açı"], "90° ile 180° arasındaki açılar geniş açıdır; 120° geniş açıdır.", svg(S.aciSekli({ derece: 120, et: "120°" }), "46%")),
  Q("Çapı 12 cm olan bir çember çizmek için pergelin açıklığı kaç cm olmalıdır?", "6", ["12", "24", "3"], "Pergel açıklığı yarıçapa eşittir. Yarıçap = 12 ÷ 2 = 6 cm."),
].map((q) => E(q, U51, K51));
const dd = (a, b) => [2 * (a + b), a * b];
const e5b = [
  Q("Kısa kenarı 8 cm, uzun kenarı 12 cm olan dikdörtgenin çevresi kaç cm'dir?", String(dd(12, 8)[0]), ["96", "20", "32"], "Çevre = 2 × (12 + 8) = 40 cm."),
  Q("Kenar uzunlukları 12 m ve 8 m olan dikdörtgen biçimindeki bir bahçenin alanı kaç m²'dir?", String(dd(12, 8)[1]), ["40", "20", "192"], "Alan = 12 × 8 = 96 m²."),
  Q("Kenarları 25 m ve 14 m olan dikdörtgen biçimli bir bahçenin çevresine bir sıra tel çekilecektir. Telin metresi 18 TL ise toplam maliyet kaç TL'dir?", String(dd(25, 14)[0] * 18), [String(25 * 14 * 18), String(dd(25, 14)[0] + 18), String((25 + 14) * 18 + 18)], "Çevre = 2 × (25 + 14) = 78 m. Maliyet = 78 × 18 = 1 404 TL."),
  Q("Alanı 72 m² olan dikdörtgen biçimli bir tarlanın kısa kenarı 6 m'dir. Bu tarlanın çevresi kaç m'dir?", String(2 * (72 / 6 + 6)), ["84", "18", "78"], "Uzun kenar = 72 ÷ 6 = 12 m. Çevre = 2 × (12 + 6) = 36 m."),
  Q("Çevresi 46 cm olan dikdörtgenin bir kenarı 15 cm ise diğer kenarı kaç cm'dir?", String(46 / 2 - 15), ["31", "16", "23"], "Yarım çevre = 46 ÷ 2 = 23 cm. Diğer kenar = 23 − 15 = 8 cm."),
  Q("Bir kitaplıkta 8 raf vardır ve her rafta 36 kitap bulunmaktadır. Kitaplıktan 45 kitap alınırsa kitaplıkta kaç kitap kalır?", String(8 * 36 - 45), ["288", "279", "198"], "Önce toplam: 8 × 36 = 288. Sonra 288 − 45 = 243."),
  Q("Şekildeki dikdörtgenin alanı, çevresinden kaç fazladır?", String(9 * 4 * 1 - 2 * (9 + 4)), ["36", "26", "13"], "Alan = 9 × 4 = 36 cm². Çevre = 2 × (9 + 4) = 26 cm. Fark = 36 − 26 = 10.", svg(S.dikdortgen({ w: 9, h: 4, wEt: "9 cm", hEt: "4 cm" }), "62%")),
].map((q) => E(q, U52, K52));
const e5c = [
  Q("8 + 6 × 5 − 12 ÷ 4 işleminin sonucu kaçtır?", String(8 + 6 * 5 - 12 / 4), ["27", "13", "42"], "Önce çarpma ve bölme: 6 × 5 = 30, 12 ÷ 4 = 3. Sonra 8 + 30 − 3 = 35."),
  Q("(24 − 9) × 4 işleminin sonucu kaçtır?", String((24 - 9) * 4), ["15", "87", "96"], "Önce parantez: 24 − 9 = 15. Sonra 15 × 4 = 60."),
  Q("Bir sayıya 15 eklenip sonuç 4 ile çarpıldığında 100 elde ediliyor. Bu sayı kaçtır?", String(100 / 4 - 15), ["85", "40", "25"], "Ters işlemle: 100 ÷ 4 = 25, 25 − 15 = 10."),
  Q("Bir makine girdiği sayıyı önce 3 ile çarpıp sonra 7 ekleyerek çıkış verir. Makineye 9 girilirse çıkış kaç olur?", String(9 * 3 + 7), ["25", "43", "19"], "9 × 3 = 27, 27 + 7 = 34."),
  Q("3 456 + 2 789 işleminin sonucu kaçtır?", String(3456 + 2789), ["6145", "6235", "5245"], "3 456 + 2 789 = 6 245."),
  Q("756 ÷ 6 bölme işleminin bölümü kaçtır?", String(756 / 6), ["116", "136", "124"], "6 × 126 = 756 olduğundan bölüm 126'dır."),
  Q("100 − 4 × (7 + 3) + 6 işleminin sonucu kaçtır?", String(100 - 4 * (7 + 3) + 6), ["36", "76", "54"], "Parantez: 7 + 3 = 10. Çarpma: 4 × 10 = 40. Sonra 100 − 40 + 6 = 66."),
].map((q) => E(q, U53, K53));
const e7a = [
  Q("Tabloda bir küp yapısının her bölmesindeki küp sayıları verilmiştir. Yapıda toplam kaç küp vardır?", String(2 + 1 + 3 + 1 + 3 + 2), ["6", "8", "10"], "2 + 1 + 3 + 1 + 3 + 2 = 12 küp.", tablo(["", "1. sütun", "2. sütun", "3. sütun"], [["Ön sıra", "2", "1", "3"], ["Arka sıra", "1", "3", "2"]], "Her bölmedeki küp sayısı")),
  Q("Tabloda verilen küp yapısı ön taraftan bakıldığında kaç birimkarelik bir görünüm oluşturur? (Her sütunda en yüksek yığın görünür.)", String(2 + 3 + 3), ["12", "6", "9"], "Sütun en büyükleri: max(2,1) = 2, max(1,3) = 3, max(3,2) = 3. Toplam 2 + 3 + 3 = 8 kare.", tablo(["", "1. sütun", "2. sütun", "3. sütun"], [["Ön sıra", "2", "1", "3"], ["Arka sıra", "1", "3", "2"]], "Her bölmedeki küp sayısı")),
  Q("Tabloda verilen küp yapısı sağ taraftan bakıldığında kaç birimkarelik bir görünüm oluşturur? (Her sırada en yüksek yığın görünür.)", String(3 + 3), ["12", "5", "8"], "Ön sırada en yüksek yığın 3, arka sırada 3'tür. Görünüm 3 + 3 = 6 karedir.", tablo(["", "1. sütun", "2. sütun", "3. sütun"], [["Ön sıra", "2", "1", "3"], ["Arka sıra", "1", "3", "2"]], "Her bölmedeki küp sayısı")),
  Q("Şekil, tek katlı birim küplerden oluşan bir yapının yukarıdan görünümüdür. Bu yapı kaç birim küpten oluşur?", "6", ["9", "12", "5"], "Boyalı karelerin sayısı 6'dır; yapı tek katlı olduğundan 6 küp kullanılmıştır.", svg(S.izgara({ cols: 3, rows: 3, dolu: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [2, 1]] }), "34%")),
  Q("Şekildeki dikdörtgenler prizmasına tam karşıdan (ön yüzünden) bakıldığında görülen dikdörtgenin alanı kaç cm²'dir?", String(5 * 4), ["15", "12", "60"], "Ön yüz genişliği 5 cm, yüksekliği 4 cm olan dikdörtgendir: 5 × 4 = 20 cm².", svg(S.kutu({ aEt: "5 cm", bEt: "3 cm", cEt: "4 cm" }), "52%")),
  Q("Şekildeki silindire tam yukarıdan bakıldığında nasıl bir şekil görülür?", "Daire", ["Kare", "Üçgen", "Dikdörtgen"], "Silindirin tabanı daire olduğundan üstten görünümü dairedir.", svg(S.silindirCisim({ rEt: "r", hEt: "h" }), "40%")),
  Q("Şekildeki koniye tam karşıdan bakıldığında nasıl bir şekil görülür?", "Üçgen", ["Daire", "Dikdörtgen", "Kare"], "Koninin ön görünümü, tabanı koninin taban çapı olan bir ikizkenar üçgendir.", svg(S.koniCisim({ rEt: "r", hEt: "h" }), "40%")),
].map((q) => E(q, U71, K71));
const e7b = [
  Q("Aynı fiyattan satılan kalemlerden 6 tanesi 30 TL'dir. Aynı kalemlerden 9 tanesi kaç TL'dir?", String(30 / 6 * 9), ["35", "40", "54"], "Bir kalem 30 ÷ 6 = 5 TL. 9 kalem 9 × 5 = 45 TL."),
  Q("Tabloda x ile y doğru orantılıdır. Tablodaki boş yere hangi sayı gelmelidir?", String(12 / 3 * 9), ["32", "30", "27"], "y/x = 12/3 = 4 sabittir. x = 9 için y = 4 × 9 = 36.", tablo(["x", "y"], [["3", "12"], ["6", "24"], ["9", "?"], ["12", "48"]], "Doğru orantılı iki çokluk")),
  Q("Doğru orantılı iki çokluğun değerleri tabloda verilmiştir. Orantı sabiti kaçtır?", "2,5", ["2", "3", "9"], "Orantı sabiti y ÷ x = 10 ÷ 4 = 2,5 (15 ÷ 6 ve 20 ÷ 8 de aynı sonucu verir).", tablo(["x", "y"], [["4", "10"], ["6", "15"], ["8", "20"]], "Doğru orantılı iki çokluk")),
  Q("Bir otomobil sabit hızla 3 saatte 240 km yol alıyor. Aynı hızla 5 saatte kaç km yol alır?", String(240 / 3 * 5), ["300", "320", "480"], "Saatte 240 ÷ 3 = 80 km gider. 5 saatte 80 × 5 = 400 km."),
  Q("Bir haritada ölçek 1 cm = 25 km olarak verilmiştir. Haritada 6 cm uzaklıkta görünen iki şehrin gerçek uzaklığı kaç km'dir?", String(6 * 25), ["30", "125", "175"], "Haritadaki uzunluk ile gerçek uzunluk doğru orantılıdır: 6 × 25 = 150 km."),
  Q("Bir pasta tarifinde 4 kişilik için 300 g un kullanılıyor. Aynı tarifle 10 kişilik pasta için kaç g un gerekir?", String(300 / 4 * 10), ["600", "720", "1200"], "Bir kişi için 300 ÷ 4 = 75 g un gerekir. 10 kişi için 75 × 10 = 750 g."),
].map((q) => E(q, U72, K72));
const e7c = [
  Q("3x + 5x − 2x ifadesinin en sade biçimi aşağıdakilerden hangisidir?", "6x", ["10x", "6", "8x"], "Benzer terimler toplanır: 3 + 5 − 2 = 6, ifade 6x olur."),
  Q("3(2x − 5) ifadesinin eşiti aşağıdakilerden hangisidir?", "6x − 15", ["6x − 5", "5x − 8", "6x + 15"], "3 sayısı her terimle çarpılır: 3 · 2x = 6x ve 3 · 5 = 15, sonuç 6x − 15."),
  Q("(5x + 7) − (2x + 3) ifadesinin en sade biçimi aşağıdakilerden hangisidir?", "3x + 4", ["3x + 10", "7x + 4", "3x − 4"], "Parantez açılırken ikinci parantezin işareti değişir: 5x + 7 − 2x − 3 = 3x + 4."),
  Q("a = 4 ve b = 3 olduğuna göre 2a + 3b ifadesinin değeri kaçtır?", String(2 * 4 + 3 * 3), ["14", "24", "12"], "2 · 4 + 3 · 3 = 8 + 9 = 17."),
  Q("Kenar uzunlukları (2x + 1) birim ve (x + 3) birim olan dikdörtgenin çevresini veren cebirsel ifade aşağıdakilerden hangisidir?", "6x + 8", ["3x + 4", "3x + 8", "2x² + 7x + 3"], "Çevre = 2 · [(2x + 1) + (x + 3)] = 2 · (3x + 4) = 6x + 8."),
  Q("4x + 3y − x + 2y ifadesinin en sade biçimi aşağıdakilerden hangisidir?", "3x + 5y", ["3x + y", "5x + 5y", "8xy"], "x'li terimler: 4x − x = 3x. y'li terimler: 3y + 2y = 5y. Sonuç 3x + 5y."),
  Q("x = 5 için 4x − 7 ifadesinin değeri kaçtır?", String(4 * 5 - 7), ["27", "9", "20"], "4 · 5 − 7 = 20 − 7 = 13."),
].map((q) => E(q, U73, K73));
const e4 = [
  Q("Bir kütüphanede 5 208 kitap vardır. Bunlardan 2 367 tanesi ödünç verilirse kütüphanede kaç kitap kalır?", String(5208 - 2367), [String(5208 + 2367), String(5208 - 2367 + 1000), String(3841 + 100)], "5 208 − 2 367 = 2 841 kitap kalır."),
  Q("Tabloya göre Ocak ayında Şubat ayından kaç kg fazla kâğıt toplanmıştır?", String(3450 - 1875), [String(3450 + 1875), String(3450 - 1875 + 100), String(3450 - 1875 - 150)], "3 450 − 1 875 = 1 575 kg.", tablo(["Ay", "Toplanan kâğıt (kg)"], [["Ocak", "3450"], ["Şubat", "1875"]], "Kâğıt toplama kampanyası")),
  Q("Bir manavda her birinde 38 kg elma bulunan 24 kasa vardır. Manavda toplam kaç kg elma vardır?", String(38 * 24), [String(38 + 24), String(38 * 24 - 100), String(38 * 24 + 10)], "38 × 24 = 912 kg."),
  Q("1 275 TL, 5 arkadaş arasında eşit olarak paylaştırılırsa kişi başına kaç TL düşer?", String(1275 / 5), [String(1275 / 5 - 10), String(1275 / 5 + 10), String(1275 - 5)], "1 275 ÷ 5 = 255 TL."),
  Q("487 ÷ 6 bölme işlemi için aşağıdakilerden hangisi doğrudur?", "Bölüm 81, kalan 1", ["Bölüm 81, kalan 6", "Bölüm 82, kalan 1", "Bölüm 80, kalan 7"], "6 × 81 = 486 ve 487 − 486 = 1 olduğundan bölüm 81, kalan 1'dir."),
].map((q, i) => E(q, "Sayılar ve İşlemler", ["Doğal Sayılarla Çıkarma İşlemi", "Doğal Sayılarla Çıkarma İşlemi", "Doğal Sayılarla Çarpma İşlemi", "Doğal Sayılarla Bölme İşlemi", "Doğal Sayılarla Bölme İşlemi"][i]));
const U6a = "Sayılar ve Nicelikler (2)";
const e6a = [
  E(Q("Ece bir kitabın 2/5'ini Pazartesi, 1/4'ünü Salı günü okumuştur. Kitabın okunmamış kısmı kaçta kaçtır?", "7/20", ["13/20", "11/20", "3/9"], "2/5 = 8/20 ve 1/4 = 5/20; okunan 13/20'dir. Kalan 20/20 − 13/20 = 7/20."), U6a, "Kesirlerle Dört İşlem İçeren Problem Çözme"),
  E(Q("Ali evinden okula 1 km 250 m yürümektedir. Ali bir günde gidiş-dönüş toplam kaç metre yürür?", String(2 * 1250), ["1250", "2250", "25000"], "1 km 250 m = 1 250 m; gidiş-dönüş 2 × 1 250 = 2 500 m."), U6a, "Uzunluk Ölçme"),
  E(Q("Grafikte her öğrencinin yalnızca bir evcil hayvanı olduğu bilinmektedir. Kedi ve köpek sahibi öğrenci sayısı, kuş ve balık sahibi öğrenci sayısından kaç fazladır?", String(9 + 11 - (4 + 6)), ["5", "20", "6"], "Kedi + köpek = 9 + 11 = 20; kuş + balık = 4 + 6 = 10. Fark 20 − 10 = 10.", svg(S.sutunGrafik({ etiketler: ["Kedi", "Kuş", "Balık", "Köpek"], degerler: [9, 4, 6, 11], max: 12, adim: 2, yBaslik: "Öğrenci sayısı" }), "78%")), "Sayılar ve Nicelikler (2) / İstatistiksel Araştırma Süreci", "Kategorik ve Nicel (Kesikli) Veri Dağılımları"),
  E(Q("Tabloya göre sınıfta en az 2 kardeşi olan kaç öğrenci vardır?", String(8 + 4), ["8", "24", "30"], "En az 2 kardeşi olanlar: 2 kardeşli 8 ve 3 kardeşli 4 öğrenci; 8 + 4 = 12.", tablo(["Kardeş sayısı", "Öğrenci sayısı"], [["0", "6"], ["1", "12"], ["2", "8"], ["3", "4"]], "Sınıftaki öğrencilerin kardeş sayıları")), "Sayılar ve Nicelikler (2) / İstatistiksel Araştırma Süreci", "Kategorik ve Nicel (Kesikli) Veri Dağılımları"),
];
const UG = "Geometrik Nicelikler";
const e6b = [
  E(Q("Alanı 3 m² olan bir yüzeyin alanı kaç cm²'dir?", String(3 * 10000), ["300", "3000", "300000"], "1 m² = 10 000 cm² olduğundan 3 m² = 30 000 cm²."), UG, "Uzunluk ve Alan Ölçme Birimleri Arasındaki İlişki"),
  E(Q("Taban uzunluğu 14 cm olan şekildeki paralelkenarın alanı kaç santimetrekaredir?", String(14 * 9), ["140", "252", "63"], "Alan = taban × yükseklik = 14 × 9 = 126 cm². Yan kenar (10 cm) alan hesabında kullanılmaz.", svg(S.paralelkenar({ tEt: "14 cm", yEt: "9 cm", yanEt: "10 cm" }), "62%")), UG, "Paralelkenar ve Üçgenin Alanı"),
  E(Q("Alanı 48 cm² ve taban uzunluğu 12 cm olan bir üçgenin bu tabana ait yüksekliği kaç cm'dir?", String((48 * 2) / 12), ["4", "6", "16"], "Alan = (taban × yükseklik) ÷ 2 olduğundan yükseklik = 48 × 2 ÷ 12 = 8 cm."), UG, "Paralelkenar ve Üçgenin Alanı"),
  E(Q("π = 22/7 alınırsa şekildeki çemberin çevresi kaç santimetredir?", String((2 * 22 * 7) / 7), ["22", "154", "49"], "Çevre = 2 × π × r = 2 × (22/7) × 7 = 44 cm.", svg(S.daire({ et: "r = 7 cm" }), "50%")), UG, "Çemberin ve Çapın Uzunlukları Arasındaki İlişki"),
  E(Q("Çevresi 62,8 cm olan bir çemberin çapı kaç cm'dir? (π = 3,14)", "20", ["10", "40", "200"], "Çevre = π × çap olduğundan çap = 62,8 ÷ 3,14 = 20 cm."), UG, "Çemberin ve Çapın Uzunlukları Arasındaki İlişki"),
  E(Q("π = 3 alınırsa şekildeki 60°'lik merkez açının gördüğü yayın uzunluğu kaç santimetredir?", String((2 * 3 * 9 * 60) / 360), ["18", "27", "54"], "Çember çevresi 2 × 3 × 9 = 54 cm. 60° merkez açı 360°'nin 1/6'sıdır; yay uzunluğu 54 ÷ 6 = 9 cm.", svg(S.daireDilimi({ derece: 60, yEt: "r = 9 cm", aEt: "60°" }), "50%")), UG, "Çemberde Merkez Açı ve Gördüğü Yay Uzunluğu"),
];
const e7d = [
  E(Q("Şekilde gösterilen P noktasının x eksenine göre yansımasının koordinatları nedir?", "(−4, −3)", ["(4, 3)", "(4, −3)", "(3, −4)"], "x eksenine göre yansımada apsis aynı kalır, ordinatın işareti değişir: P(−4, 3) → (−4, −3).", svg(S.koordinat({ noktalar: [{ x: -4, y: 3, e: "P" }] }), "52%")), "İstatistiksel Araştırma Süreci / Dönüşüm", "Yansıma Dönüşümü"),
  E(Q("[AB] doğru parçasının orta dikmesi üzerindeki bir P noktası için |PA| = 7 cm ise |PB| kaç cm'dir?", "7", ["3,5", "14", "0"], "Orta dikme üzerindeki her nokta doğru parçasının uç noktalarına eşit uzaklıktadır; |PB| = |PA| = 7 cm."), "Dönüşüm", "Orta Dikme ve Açıortay İnşası"),
  E(Q("Ölçüsü 64° olan bir açının açıortayı çizildiğinde oluşan eş açılardan her birinin ölçüsü kaç derecedir?", String(64 / 2), ["64", "128", "16"], "Açıortay açıyı iki eş açıya böler: 64° ÷ 2 = 32°."), "Dönüşüm", "Orta Dikme ve Açıortay İnşası"),
  E(Q("Tabloya göre en çok öğrencinin bulunduğu boy aralığı hangisidir?", "150–160 cm", ["140–150 cm", "160–170 cm", "170–180 cm"], "Frekansı en büyük olan aralık 11 öğrenci ile 150–160 cm aralığıdır.", tablo(["Boy aralığı (cm)", "Öğrenci sayısı"], [["140–150", "5"], ["150–160", "11"], ["160–170", "8"], ["170–180", "2"]], "Bir sınıfın boy dağılımı")), "İstatistiksel Araştırma Süreci", "Kategorik ve Nicel (Sürekli) Veri Dağılımları"),
];
export default { "4": { ek: e4 }, "5": { ek: [...e5a, ...e5b, ...e5c] }, "6": { ek: [...e6a, ...e6b] }, "7": { ek: [...e7a, ...e7b, ...e7c, ...e7d] } };
