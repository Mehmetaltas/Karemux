import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// KAREMUX'un merkezi Hak/Limit modulu (Faz 11). Amac: dagilmis paket/abonelik
// kontrollerini (bugune kadar her API kendi kopyasini yaziyordu) tek yerde
// toplamak. Mevcut gunlukLimitKontrolEt() (lib/ratelimit.js, AI gunluk limiti
// ekseni) bilerek buraya TASINMADI - farkli bir eksen (sayac bazli, paket adi
// degil), o dosyada kalmasi daha dogru. Burada sadece "paket bazli ozellik
// erisimi" ekseni merkezi hale getiriliyor.

// 30 Eylul: Dalga 1 (Abonelik Motoru) - TAM aktif abonelik kaydini (plan +
// paket_id + bitis dahil) doner. Amac: 7 route'un kendi kopya "SELECT ...
// FROM abonelikler WHERE durum='aktif'" sorgusunu kademeli olarak BUNUNLA
// degistirmek (bkz. KAREMUX-DALGA1-ABONELIK-MOTORU.md). Eski plan-bazli
// fonksiyonlar DEGISMEDI, bu PARALEL/ek bir fonksiyon.
export async function getActiveAbonelik(kullaniciId) {
  if (!kullaniciId) return null;
  const sonuc = await sql`
    SELECT id, plan, paket_id, baslangic, bitis, kaynak
    FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif'
    ORDER BY baslangic DESC LIMIT 1
  `;
  return sonuc[0] || null;
}

// Kullanicinin su anki aktif abonelik planinin anahtarini dondurur (yoksa null).
export async function getUserPackage(kullaniciId) {
  if (!kullaniciId) return null;
  const sonuc = await sql`SELECT plan FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' LIMIT 1`;
  return sonuc[0]?.plan || null;
}

// 1 Ekim: Dalga 1 - canli-ders/checkout ve canli-ders/havale-baslat'taki
// (ve asagidaki gorselSoruErisimVarMi'nin icindeki) BIREBIR AYNI "yillik_*
// abonesi mi" sorgusu burada tek kaynaga tasindi.
export async function isYillikAboneMi(kullaniciId) {
  if (!kullaniciId) return false;
  const sonuc = await sql`SELECT 1 FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' AND plan LIKE 'yillik_%' LIMIT 1`;
  return sonuc.length > 0;
}

// Kullanicinin belirli bir pakete/ozellige erisimi var mi - ya TAM O PAKETI
// ya da herhangi bir yillik_* (Sinirsiz her sey) paketini aktif tasiyor olmali.
// req+cihazId alir (kullaniciIdCoz ile kimligi kendi cozer) - API route'larda
// dogrudan kullanilabilsin diye.
export async function hasPackageFeature(req, cihazId, gerekliPaket) {
  const kullaniciId = await kullaniciIdCoz(req, cihazId);
  if (!kullaniciId) return false;
  const sonuc = await sql`
    SELECT 1 FROM abonelikler
    WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif'
      AND (plan = ${gerekliPaket} OR plan LIKE 'yillik_%')
    LIMIT 1
  `;
  return sonuc.length > 0;
}

// Gorsel soru cozme (/api/soru-coz) icin ozel erisim sirasi:
// 1) yillik_* abonesi -> sinirsiz (mevcut "Sinirsiz her sey" vaadine dahil)
// 2) gunde 3 ucretsiz hak -> gunluk_kullanim.gorsel_soru_sayisi ile takip edilir
// 3) satin alinmis kredi (kullanici_kredileri.kalan_kredi) -> 1 dusulur
// Ucu de tukenirse erisim yok. Donen: { izinVar, sebep: "abonelik"|"ucretsiz"|"kredi"|null }
export async function gorselSoruErisimVarMi(req, cihazId) {
  const kullaniciId = await kullaniciIdCoz(req, cihazId);
  if (!kullaniciId) return { izinVar: false, sebep: null };

  if (await isYillikAboneMi(kullaniciId)) return { izinVar: true, sebep: "abonelik" };

  await sql`
    INSERT INTO gunluk_kullanim (kullanici_id, tarih, gorsel_soru_sayisi)
    VALUES (${kullaniciId}, CURRENT_DATE, 0)
    ON CONFLICT (kullanici_id, tarih) DO NOTHING
    RETURNING gorsel_soru_sayisi
  `;
  const gunluk = await sql`SELECT gorsel_soru_sayisi FROM gunluk_kullanim WHERE kullanici_id = ${kullaniciId} AND tarih = CURRENT_DATE`;
  const bugunkuSayi = gunluk[0]?.gorsel_soru_sayisi || 0;
  if (bugunkuSayi < 3) {
    await sql`UPDATE gunluk_kullanim SET gorsel_soru_sayisi = gorsel_soru_sayisi + 1 WHERE kullanici_id = ${kullaniciId} AND tarih = CURRENT_DATE`;
    return { izinVar: true, sebep: "ucretsiz" };
  }

  const kredi = await sql`SELECT kalan_kredi FROM kullanici_kredileri WHERE kullanici_id = ${kullaniciId}`;
  const kalanKredi = kredi[0]?.kalan_kredi || 0;
  if (kalanKredi > 0) {
    await sql`UPDATE kullanici_kredileri SET kalan_kredi = kalan_kredi - 1, guncellenme = now() WHERE kullanici_id = ${kullaniciId}`;
    return { izinVar: true, sebep: "kredi" };
  }

  return { izinVar: false, sebep: null };
}
