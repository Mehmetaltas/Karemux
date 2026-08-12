import { sql } from "@/lib/db";

// Genel amacli "cok fazla basarisiz deneme" korumasi (login, yonetici sifresi vb.
// hassas islemler icin). Vercel serverless fonksiyonlarinin bellekte durum tutamamasi
// nedeniyle (her istek potansiyel olarak farkli bir instance'ta calisir), sayaci
// veritabaninda tutuyoruz.
export async function denemeSiniriKontrolEt(anahtar, tur, limit = 5, dakikaPenceresi = 15) {
  const sonuc = await sql`
    SELECT COUNT(*)::int as sayi FROM guvenlik_denemeleri
    WHERE anahtar = ${anahtar} AND tur = ${tur} AND basarili = false
      AND olusturulma >= now() - (${dakikaPenceresi} || ' minutes')::interval
  `;
  return { izinVar: sonuc[0].sayi < limit, kalanDeneme: Math.max(0, limit - sonuc[0].sayi) };
}

export async function denemeKaydet(anahtar, tur, basariliMi) {
  try {
    await sql`INSERT INTO guvenlik_denemeleri (anahtar, tur, basarili) VALUES (${anahtar}, ${tur}, ${basariliMi})`;
    // Basarili giristen sonra o anahtarin eski basarisiz denemelerini temizleyelim
    // (kullanici sifresini dogru hatirladi, tekrar cezalandirilmasin).
    if (basariliMi) {
      await sql`DELETE FROM guvenlik_denemeleri WHERE anahtar = ${anahtar} AND tur = ${tur} AND basarili = false`;
    }
  } catch (e) {
    console.error("denemeKaydet hatasi:", e);
  }
}

export function istekIpAdresi(req) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "bilinmeyen";
}
