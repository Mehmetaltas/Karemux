import { sql } from "@/lib/db";

// Mufredat Turune Gore Soru Tarzi - Paylasilan Fonksiyon (23 Eylul).
// GERCEK MEB takvimine gore (dogrulandi): 5,6,7.sinif Maarif Modeli'nde
// (baglam-temelli), 4,8.sinif hala eski muferedatta (kazanim-temelli).
// Once materyal-uret'te tek basina duran mantik, konu-paketi ve
// ders-plani-uret'in de kullanabilmesi icin buraya tasindi.
export const BAGLAM_TEMELLI_SORU_TALIMATI = `Sorulari "Baglam Temelli Soru" yaklasimiyla yaz: her soru gercekci bir senaryo, veri veya durum icinde kurulsun. Celdiriciler rastgele olmamali, spesifik bir kavram yanilgisini yansitmali. Turkce'ye ozgu karakterleri DOGRU ve EKSIKSIZ kullan.`;
export const KAZANIM_TEMELLI_SORU_TALIMATI = `Sorulari GELENEKSEL "Kazanim Temelli Soru" yaklasimiyla yaz: dogrudan, ders kitabi diline uygun, net bir bilgi/islem/kural olcen sorular olsun - gereksiz uzun senaryo/hikaye kurma. Celdiriciler spesifik bir kavram yanilgisini yansitmali. Turkce'ye ozgu karakterleri DOGRU ve EKSIKSIZ kullan.`;

export async function soruTalimatiSecSunucu(sinif) {
  try {
    const sonuc = await sql`SELECT DISTINCT mufredat_turu FROM mufredat WHERE sinif = ${Number(sinif)} LIMIT 1`;
    if (sonuc[0]?.mufredat_turu === "eski_2018") return KAZANIM_TEMELLI_SORU_TALIMATI;
    return BAGLAM_TEMELLI_SORU_TALIMATI;
  } catch (e) {
    return BAGLAM_TEMELLI_SORU_TALIMATI;
  }
}
