// 2026-2027 egitim-ogretim yili akademik takvimi + resmi yillik plan verisi (Akademik Takvim ve Plan Motoru, V3 Dalga 4-5).
// KAYNAK: MEB 2026-2027 taslak cerceve yillik planlari (Matematik, Fen, Sosyal, Turkce, Inkilap, Din, Ingilizce). Hafta tarihleri
// 34 sayfadaki HAFTA hucreleriyle karsilastirildi; hepsi bu tabloyla ayni (32. hafta: Kurban Bayrami sonrasi 20-21 Mayis).
// Veri uretilmistir; elle degistirme, planlar yenilenince yeniden uretilir (scripts/ icindeki yillik plan cikarici).

// [hafta no, ilk ders gunu, son ders gunu] (ISO tarih)
export const HAFTALAR = [[1, "2026-09-14", "2026-09-18"], [2, "2026-09-21", "2026-09-25"], [3, "2026-09-28", "2026-10-02"], [4, "2026-10-05", "2026-10-09"], [5, "2026-10-12", "2026-10-16"], [6, "2026-10-19", "2026-10-23"], [7, "2026-10-26", "2026-10-30"], [8, "2026-11-02", "2026-11-06"], [9, "2026-11-09", "2026-11-13"], [10, "2026-11-23", "2026-11-27"], [11, "2026-11-30", "2026-12-04"], [12, "2026-12-07", "2026-12-11"], [13, "2026-12-14", "2026-12-18"], [14, "2026-12-21", "2026-12-25"], [15, "2026-12-28", "2027-01-01"], [16, "2027-01-04", "2027-01-08"], [17, "2027-01-11", "2027-01-15"], [18, "2027-01-18", "2027-01-22"], [19, "2027-02-08", "2027-02-12"], [20, "2027-02-15", "2027-02-19"], [21, "2027-02-22", "2027-02-26"], [22, "2027-03-01", "2027-03-05"], [23, "2027-03-15", "2027-03-19"], [24, "2027-03-22", "2027-03-26"], [25, "2027-03-29", "2027-04-02"], [26, "2027-04-05", "2027-04-09"], [27, "2027-04-12", "2027-04-16"], [28, "2027-04-19", "2027-04-23"], [29, "2027-04-26", "2027-04-30"], [30, "2027-05-03", "2027-05-07"], [31, "2027-05-10", "2027-05-14"], [32, "2027-05-20", "2027-05-21"], [33, "2027-05-24", "2027-05-28"], [34, "2027-05-31", "2027-06-04"], [35, "2027-06-07", "2027-06-11"], [36, "2027-06-14", "2027-06-18"], [37, "2027-06-21", "2027-06-25"]];

export const DONEM_BASI = "2026-09-14";
export const DONEM_SONU = "2027-06-25";

// Tatiller: [ad, ilk gun, son gun]
export const TATILLER = [
  ["1. dönem ara tatili", "2026-11-16", "2026-11-20"],
  ["Yarıyıl tatili", "2027-01-25", "2027-02-05"],
  ["2. dönem ara tatili (Ramazan Bayramı)", "2027-03-08", "2027-03-12"],
  ["Kurban Bayramı tatili", "2027-05-15", "2027-05-19"],
];

// Resmi tatil ve belirli gunler (hafta ici dersi etkileyenler)
export const RESMI_TATILLER = [
  ["Cumhuriyet Bayramı", "2026-10-29"],
  ["Yılbaşı", "2027-01-01"],
  ["Ulusal Egemenlik ve Çocuk Bayramı", "2027-04-23"],
  ["Emek ve Dayanışma Günü", "2027-05-01"],
  ["Atatürk’ü Anma, Gençlik ve Spor Bayramı", "2027-05-19"],
];
