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
export default { "5": { ek: [...e5a, ...e5b, ...e5c] }, "7": { ek: [...e7a, ...e7b, ...e7c] } };
