// Matematik: görselli sorular. HAVUZ[ders][sınıf]["dönem.yazılı"] sonuna eklenir.
import { S, svg, tablo, fmt, Q, sayiSik } from "./gorselli-yardim.js";
import * as MS from "./mat-sekil.js";
const T = (a) => a.map((x) => `${x}`);
export default {
  "4": {
    "1.1": [
      Q("Tabloya göre 4/A ve 4/B sınıflarındaki toplam kitap sayısı kaçtır?", String(235 + 248), sayiSik(483, [10, -10, 100, -100]), "235 + 248 = 483.", tablo(["Sınıf", "Kitap sayısı"], [["4/A", "235"], ["4/B", "248"], ["4/C", "219"]], "Sınıf kitaplığındaki kitap sayıları")),
      Q("Sayı doğrusunda P noktası hangi doğal sayıyı gösterir?", "35", ["30", "40", "25"], "Her aralık 5'tir; P, 30'dan sonraki ilk çizgidir: 35.", svg(S.sayiDogrusu({ min: 0, max: 50, adim: 5, etiketAdim: 2, noktalar: [{ v: 35, e: "P" }] }), "80%")),
    ],
    "1.2": [
      Q("Tabloya göre toplam kaç kalem vardır?", String(6 * 12), sayiSik(72, [6, -6, 12, -12]), "6 × 12 = 72.", tablo(["Kutu sayısı", "Her kutudaki kalem"], [["6", "12"]], "Kalem kutuları")),
      Q("Grafiğe göre en çok satılan bilet ile en az satılan bilet arasındaki fark kaçtır?", String(45 - 20), sayiSik(25, [5, -5, 10, -10]), "45 − 20 = 25.", svg(S.sutunGrafik({ etiketler: ["Pzt", "Sal", "Çar", "Per"], degerler: [30, 45, 20, 35], max: 50, adim: 10, yBaslik: "Bilet sayısı" }), "78%")),
    ],
    "1.3": [
      Q("Şekilde boyalı kısım kesir olarak nasıl gösterilir?", "5/8", ["3/8", "5/3", "8/5"], "8 eş parçadan 5'i boyalıdır: 5/8.", svg(S.kesirModel({ parca: 8, boyali: 5 }), "70%")),
      Q("Şekilde boyanmamış kısım kesir olarak nasıl gösterilir?", "2/6", ["4/6", "2/4", "6/2"], "6 eş parçadan 4'ü boyalı, 2'si boyasızdır: 2/6.", svg(S.kesirModel({ parca: 6, boyali: 4, sekil: "daire" }), "34%")),
    ],
    "2.1": [
      Q("Şekildeki saat kaçı göstermektedir?", "7.40", ["8.40", "7.08", "6.40"], "Saat ibresi 7 ile 8 arasında, dakika ibresi 8'dedir: 7.40.", svg(S.saat({ s: 7, d: 40 }), "38%")),
      Q("Grafiğe göre en çok sevilen meyve hangisidir?", "Elma", ["Armut", "Muz", "Çilek"], "En yüksek sütun elmaya aittir.", svg(S.sutunGrafik({ etiketler: ["Elma", "Armut", "Muz", "Çilek"], degerler: [12, 8, 10, 6], max: 14, adim: 2, yBaslik: "Öğrenci sayısı" }), "78%")),
    ],
    "2.2": [
      Q("Karelerden oluşan şeklin çevresi kaç birimdir? (Bir karenin kenarı 1 birimdir.)", String(2 * (5 + 3)), ["15", "18", "14"], "Dikdörtgenin kenarları 5 ve 3 birimdir: 2 × (5 + 3) = 16.", svg(S.izgara({ cols: 5, rows: 3, dolu: [0, 1, 2].flatMap((r) => [0, 1, 2, 3, 4].map((c) => [r, c])), hucre: 28 }), "58%")),
      Q("Şekildeki dikdörtgenin çevresi kaç santimetredir?", String(2 * (7 + 4)), ["11", "28", "18"], "2 × (7 + 4) = 22.", svg(S.dikdortgen({ w: 7, h: 4, wEt: "7 cm", hEt: "4 cm" }), "55%")),
    ],
    "2.3": [
      Q("Şekilde boyalı bölgenin alanı kaç birimkaredir? (Bir karenin alanı 1 birimkaredir.)", "6", ["5", "7", "8"], "Boyalı kare sayısı 3 + 2 + 1 = 6'dır.", svg(S.izgara({ cols: 6, rows: 4, dolu: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0]] }), "55%")),
      Q("Ölçü kabındaki sıvı kaç mililitredir?", "70", ["60", "80", "75"], "Sıvı yüzeyi 70 çizgisindedir.", svg(S.olcuSilindiri({ max: 100, adim: 10, deger: 70 }), "26%")),
    ],
  },
  "5": {
    "1.1": [
      Q("Şekilde gösterilen açı hangi açı türüdür?", "Dar açı", ["Dik açı", "Geniş açı", "Doğru açı"], "40°, 90°'den küçük olduğu için dar açıdır.", svg(MS.aciSekli({ derece: 40, et: "40°" }), "50%")),
      Q("Şekilde çemberin yarıçapı 6 cm ise çapı kaç santimetredir?", "12", ["3", "6", "18"], "Çap = 2 × yarıçap = 12 cm.", svg(S.daire({ et: "r = 6 cm" }), "50%")),
    ],
    "1.2": [
      Q("Tabloya göre en çok kitabı olan okulun kitap sayısı kaçtır?", "14 320", ["12 450", "9 875", "14 230"], "14 320 en büyük sayıdır.", tablo(["Okul", "Kitap sayısı"], [["A Okulu", "12 450"], ["B Okulu", "9 875"], ["C Okulu", "14 320"]], "Okul kütüphaneleri")),
      Q("Tabloya göre A ve B okullarının toplam kitap sayısı kaçtır?", "22 325", ["21 325", "22 335", "23 325"], "12 450 + 9 875 = 22 325.", tablo(["Okul", "Kitap sayısı"], [["A Okulu", "12 450"], ["B Okulu", "9 875"], ["C Okulu", "14 320"]], "Okul kütüphaneleri")),
    ],
    "1.3": [
      Q("Şekildeki dikdörtgenin alanı kaç santimetrekaredir?", String(9 * 4), ["13", "26", "40"], "9 × 4 = 36.", svg(S.dikdortgen({ w: 9, h: 4, wEt: "9 cm", hEt: "4 cm" }), "55%")),
      Q("Şekildeki dikdörtgenin çevresi kaç santimetredir?", String(2 * (9 + 4)), ["13", "36", "52"], "2 × (9 + 4) = 26.", svg(S.dikdortgen({ w: 9, h: 4, wEt: "9 cm", hEt: "4 cm" }), "55%")),
    ],
    "2.1": [
      Q("Şekilde boyalı kısım kesir olarak nasıl gösterilir?", "3/5", ["2/5", "3/2", "5/3"], "5 eş parçadan 3'ü boyalıdır.", svg(S.kesirModel({ parca: 5, boyali: 3 }), "70%")),
      Q("Sayı doğrusunda P noktası hangi kesri gösterir?", "3/4", ["1/4", "2/4", "3/5"], "0 ile 1 arası 4 eş parçaya ayrılmıştır; P, 3. çizgidedir: 3/4.", svg(S.sayiDogrusu({ min: 0, max: 1, adim: 0.25, etiketAdim: 4, noktalar: [{ v: 0.75, e: "P" }] }), "78%")),
    ],
    "2.2": [
      Q("Grafiğe göre voleybolu seçen öğrenci sayısı futbolu seçenlerden kaç eksiktir?", String(14 - 9), ["4", "6", "23"], "14 − 9 = 5.", svg(S.sutunGrafik({ etiketler: ["Futbol", "Basketbol", "Voleybol"], degerler: [14, 11, 9], max: 16, adim: 2, yBaslik: "Öğrenci sayısı" }), "76%")),
      Q("Terazi dengede olduğuna göre x kaçtır?", "5", ["4", "9", "13"], "x + 4 = 9 ise x = 9 − 4 = 5.", svg(S.denge({ sol: "x + 4", sag: "9" }), "56%")),
    ],
    "2.3": [
      Q("Örüntüde 4. şekilde kaç kare bulunur?", "9", ["8", "10", "11"], "1. şekil 2 + 1 = 3, 2. şekil 3 + 2 = 5, 3. şekil 4 + 3 = 7 kareden oluşur. 4. şekilde 5 + 4 = 9 kare olur.", svg(MS.ornuntuSatir({ adimlar: [[2, 1], [3, 2], [4, 3]] }), "70%")),
      Q("Torbadan rastgele bir bilye çekildiğinde hangi renkte olma olasılığı en yüksektir?", "Kırmızı", ["Mavi", "Yeşil", "Hepsinin olasılığı eşittir"], "Torbada 3 kırmızı, 2 mavi, 1 yeşil bilye vardır. En çok kırmızı bilye olduğundan kırmızı bilye çekilme olasılığı en yüksektir.", svg(S.torba({ topKirmizi: 3, topMavi: 2, topYesil: 1 }), "50%")),
    ],
  },
  "6": {
    "1.1": [
      Q("Bir torbadan her seferinde geri koyarak 9 kez bilye çekilmiş ve bu çekilişlerin 4'ünde kırmızı bilye gelmiştir. Kırmızı bilye gelmesinin deneysel olasılığı kaçtır?", "4/9", ["4/5", "5/9", "1/9"], "Deneysel olasılık = istenen sonucun sayısı / toplam deneme sayısı = 4/9."),
      Q("Tabloya göre para atışında yazı gelmesinin deneysel olasılığı kaçtır?", "3/5", ["2/5", "3/8", "12/8"], "12/20 = 3/5.", tablo(["Sonuç", "Sayı"], [["Yazı", "12"], ["Tura", "8"], ["Toplam atış", "20"]], "Para atma deneyi")),
    ],
    "1.2": [
      Q("Tabloya göre masa ile kitaplığın uzunlukları arasındaki fark kaç santimetredir?", String(120 - 95), ["215", "35", "15"], "1,2 m = 120 cm; 120 − 95 = 25 cm.", tablo(["Eşya", "Uzunluk"], [["Masa", "1,2 m"], ["Kitaplık", "95 cm"]], "Odadaki eşyalar")),
      Q("Grafiğe göre ayakkabı numarası verilerinin tepe değeri (modu) kaçtır?", "38", ["37", "39", "40"], "En çok öğrenci (9) 38 numara giymektedir.", svg(S.sutunGrafik({ etiketler: ["36", "37", "38", "39"], degerler: [4, 6, 9, 5], max: 10, adim: 2, yBaslik: "Öğrenci sayısı" }), "76%")),
    ],
    "1.3": [
      Q("Grafiğe göre en yüksek sıcaklık ile en düşük sıcaklık arasındaki fark kaç °C'dir?", String(14 - 6), ["6", "20", "10"], "14 − 6 = 8.", svg(S.cizgiGrafik({ etiketler: ["Pzt", "Sal", "Çar", "Per", "Cum"], degerler: [10, 14, 8, 6, 12], min: 0, max: 16, adim: 4, yBaslik: "Sıcaklık (°C)" }), "80%")),
      Q("Çubuk grafiğe göre mavi renk seçen öğrenci sayısı, yeşili seçenlerden kaç fazladır?", String(12 - 7), ["4", "6", "19"], "12 − 7 = 5.", svg(S.sutunGrafik({ etiketler: ["Mavi", "Kırmızı", "Yeşil", "Sarı"], degerler: [12, 9, 7, 5], max: 14, adim: 2, yBaslik: "Öğrenci sayısı" }), "76%")),
    ],
    "2.1": [
      Q("Şekildeki üçgende x kaç derecedir?", String(180 - 50 - 60), ["60", "80", "110"], "Üçgenin iç açıları toplamı 180°'dir: 180 − 50 − 60 = 70.", svg(MS.ucgenAciOlcekli({ A: 50, B: 60, C: 70, etiket: { A: "50°", B: "60°", C: "x" } }), "56%")),
      Q("Şekildeki ikizkenar üçgende x kaç derecedir?", "50", ["40", "80", "100"], "A açısı 80°; B ve C açıları eşit: (180 − 80) ÷ 2 = 50.", svg(MS.ucgenAciOlcekli({ A: 80, B: 50, C: 50, etiket: { A: "80°", B: "x", C: "x" }, esit: [[0, 1, 1], [0, 2, 1]] }), "56%")),
    ],
    "2.2": [
      Q("Şekildeki paralelkenarın alanı kaç santimetrekaredir?", String(10 * 6), ["16", "30", "70"], "Alan = taban × yükseklik = 10 × 6 = 60.", svg(MS.paralelkenar({ taban: 10, yuk: 6, yan: 7, tEt: "10 cm", yEt: "6 cm", yanEt: "7 cm" }), "62%")),
      Q("Şekildeki üçgenin alanı kaç santimetrekaredir?", String((12 * 5) / 2), ["17", "60", "25"], "Alan = (12 × 5) ÷ 2 = 30.", svg(MS.ucgenAlan({ taban: 12, yuk: 5, tEt: "12 cm", yEt: "5 cm" }), "56%")),
    ],
    "2.3": [
      Q("π = 3 alınırsa yarıçapı 5 cm olan şekildeki çemberin çevresi kaç santimetredir?", String(2 * 3 * 5), ["15", "75", "25"], "Çevre = 2 × π × r = 2 × 3 × 5 = 30.", svg(S.daire({ et: "r = 5 cm" }), "50%")),
      Q("π = 3 alınırsa şekildeki 90°'lik daire diliminin yay uzunluğu kaç santimetredir? (Yarıçap 6 cm)", "9", ["18", "36", "12"], "Çevre = 2 × 3 × 6 = 36; 90° yay çevrenin 1/4'üdür: 9.", svg(S.daireDilimi({ derece: 90, yEt: "r = 6 cm", aEt: "90°" }), "50%")),
    ],
  },
  "7": {
    "1.1": [
      Q("Sayı doğrusunda A ve B noktaları arasındaki uzaklık kaç birimdir?", "5", ["1", "3", "6"], "A = −3, B = 2; uzaklık 2 − (−3) = 5.", svg(S.sayiDogrusu({ min: -5, max: 5, noktalar: [{ v: -3, e: "A" }, { v: 2, e: "B" }] }), "78%")),
      Q("Sayı doğrusunda P noktası hangi rasyonel sayıyı gösterir?", "−3/2", ["−1/2", "−2/3", "3/2"], "−2 ile −1 arasında tam ortadadır: −1,5 = −3/2.", svg(S.sayiDogrusu({ min: -2, max: 2, adim: 0.5, etiketAdim: 2, noktalar: [{ v: -1.5, e: "P" }] }), "78%")),
    ],
    "1.2": [
      Q("Şekildeki dikdörtgenler prizmasının hacmi kaç santimetreküptür?", String(6 * 4 * 5), ["15", "74", "148"], "Hacim = 6 × 4 × 5 = 120.", svg(MS.kutu({ a: 6, b: 4, c: 5, aEt: "6 cm", bEt: "4 cm", cEt: "5 cm", k: 24 }), "60%")),
      Q("Şekildeki dikdörtgenler prizmasının yüzey alanı kaç santimetrekaredir?", String(2 * (6 * 4 + 6 * 5 + 4 * 5)), ["120", "74", "296"], "2 × (24 + 30 + 20) = 148.", svg(MS.kutu({ a: 6, b: 4, c: 5, aEt: "6 cm", bEt: "4 cm", cEt: "5 cm", k: 24 }), "60%")),
    ],
    "1.3": [
      Q("A(2, 3) noktasının y eksenine göre yansımasının koordinatları nedir?", "(−2, 3)", ["(2, −3)", "(−2, −3)", "(3, 2)"], "y eksenine göre yansımada x'in işareti değişir.", svg(S.koordinat({ noktalar: [{ x: 2, y: 3, e: "A" }] }), "52%")),
      Q("B(−3, 1) noktasının x eksenine göre yansımasının koordinatları nedir?", "(−3, −1)", ["(3, 1)", "(3, −1)", "(1, −3)"], "x eksenine göre yansımada y'nin işareti değişir.", svg(S.koordinat({ noktalar: [{ x: -3, y: 1, e: "B" }] }), "52%")),
    ],
    "2.1": [
      Q("Torbadan rastgele çekilen bir topun mavi olma olasılığı kaçtır?", "3/10", ["3/7", "1/2", "2/10"], "10 topun 3'ü mavidir.", svg(S.torba({ topKirmizi: 2, topMavi: 3, topYesil: 5 }), "52%")),
      Q("Tabloya göre aynı fiyattan 5 kg elma kaç liradır?", "75", ["60", "90", "45"], "3 kg 45 TL ise 1 kg 15 TL; 5 kg = 75 TL.", tablo(["Elma (kg)", "Ücret (TL)"], [["3", "45"], ["5", "?"]], "Elma fiyatı")),
    ],
    "2.2": [
      Q("Terazi dengede olduğuna göre x kaçtır?", "4", ["2", "5", "8"], "2x + 1 = 9 ise 2x = 8, x = 4.", svg(S.denge({ sol: "2x + 1", sag: "9" }), "56%")),
      Q("Terazi dengede olduğuna göre x kaçtır?", "4", ["2", "8", "12"], "3x = x + 8 ise 2x = 8, x = 4.", svg(S.denge({ sol: "3x", sag: "x + 8" }), "56%")),
    ],
    "2.3": [
      Q("π = 3 alınırsa şekildeki dairenin alanı kaç santimetrekaredir?", String(3 * 36), ["36", "72", "54"], "Alan = π × r² = 3 × 36 = 108.", svg(S.daire({ et: "r = 6 cm" }), "50%")),
      Q("Köşegen uzunlukları 10 cm ve 8 cm olan şekildeki eşkenar dörtgenin alanı kaç santimetrekaredir?", String((10 * 8) / 2), ["80", "18", "36"], "Alan = (10 × 8) ÷ 2 = 40.", svg(MS.eskenarDortgen({ d1: 10, d2: 8, d1Et: "10 cm", d2Et: "8 cm" }), "52%")),
    ],
  },
  "8": {
    "1.1": [
      Q("Alanı 49 cm² olan karenin bir kenarı kaç santimetredir?", "7", ["6", "8", "24,5"], "Kenar = √49 = 7.", svg(MS.kare({ ic: "Alan = 49 cm²", ust: "?" }), "46%")),
      Q("Tabloda soru işareti yerine hangi sayı gelmelidir?", "32", ["10", "24", "64"], "2⁵ = 32.", tablo(["İfade", "Değeri"], [["2³", "8"], ["2⁴", "16"], ["2⁵", "?"]], "2'nin kuvvetleri")),
    ],
    "1.2": [
      Q("Grafiğe göre öğrencilerin aldığı notların aritmetik ortalaması kaçtır?", String((60 + 80 + 70 + 90) / 4), ["70", "80", "72"], "(60 + 80 + 70 + 90) ÷ 4 = 75.", svg(S.sutunGrafik({ etiketler: ["Ali", "Ece", "Can", "Zeynep"], degerler: [60, 80, 70, 90], max: 100, adim: 20, yBaslik: "Not" }), "76%")),
      Q("Torbadan rastgele çekilen bir bilyenin sarı olmama olasılığı kaçtır?", "5/6", ["1/6", "4/6", "3/6"], "6 bilyenin 1'i sarıdır; sarı olmama olasılığı 5/6.", svg(S.torba({ topKirmizi: 3, topMavi: 2, topSari: 1 }), "52%")),
    ],
    "1.3": [
      Q("Şekildeki terazi dengede olduğuna göre x kaçtır?", "6", ["3", "9", "12"], "2x + 5 = x + 11 ise x = 6.", svg(S.denge({ sol: "2x + 5", sag: "x + 11" }), "56%")),
      Q("Şekildeki terazi dengede olduğuna göre x kaçtır?", "3", ["2", "5", "15"], "5x − 3 = 2x + 6 ise 3x = 9, x = 3.", svg(S.denge({ sol: "5x − 3", sag: "2x + 6" }), "56%")),
    ],
    "2.1": [
      Q("Koordinat düzleminde A noktasının koordinatları nedir?", "(−2, −3)", ["(−3, −2)", "(2, 3)", "(2, −3)"], "A noktası x = −2, y = −3 konumundadır.", svg(S.koordinat({ noktalar: [{ x: -2, y: -3, e: "A" }, { x: 3, y: 2, e: "B" }] }), "54%")),
      Q("Koordinat düzleminde B noktasının koordinatları nedir?", "(3, 2)", ["(2, 3)", "(−3, 2)", "(3, −2)"], "B noktası x = 3, y = 2 konumundadır.", svg(S.koordinat({ noktalar: [{ x: -2, y: -3, e: "A" }, { x: 3, y: 2, e: "B" }] }), "54%")),
    ],
    "2.2": [
      Q("Tabloda verilen kenar uzunluklarından hangisiyle bir üçgen çizilebilir?", "I", ["II", "III", "IV"], "Bir üçgende herhangi iki kenarın uzunlukları toplamı üçüncü kenarın uzunluğundan büyük olmalıdır. I: 3 + 4 > 5 sağlanır; II: 2 + 3 < 6, III: 1 + 2 < 4, IV: 4 + 4 < 9 sağlanmaz.", tablo(["Seçenek", "Kenarlar"], [["I", "3 cm, 4 cm, 5 cm"], ["II", "2 cm, 3 cm, 6 cm"], ["III", "1 cm, 2 cm, 4 cm"], ["IV", "4 cm, 4 cm, 9 cm"]], "Kenar uzunlukları")),
      Q("Şekildeki dik üçgenin iç açılarından x kaç derecedir?", "30", ["20", "40", "60"], "Üçgenin iç açıları toplamı 180°'dir: 90° + 60° + x = 180° ise x = 30°.", svg(MS.ucgenNokta({ pts: [[0, 173], [100, 173], [0, 0]], etiket: { B: "60°", C: "x" }, dik: 0 }), "56%")),
    ],
    "2.3": [
      Q("Şekildeki dik silindirin hacmi kaç π santimetreküptür? (r = 3 cm, h = 5 cm)", "45π", ["15π", "30π", "90π"], "V = π × r² × h = π × 9 × 5 = 45π.", svg(MS.silindir({ rEt: "r = 3 cm", hEt: "h = 5 cm" }), "46%")),
      Q("Şekildeki dik koninin hacmi kaç π santimetreküptür? (r = 3 cm, h = 4 cm)", "12π", ["36π", "24π", "9π"], "V = (1/3) × π × r² × h = (1/3) × π × 9 × 4 = 12π.", svg(MS.koni({ rEt: "r = 3 cm", hEt: "h = 4 cm" }), "42%")),
    ],
  },
};
