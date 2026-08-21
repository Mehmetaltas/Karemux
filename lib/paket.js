import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// KAREMUX'un merkezi Hak/Limit modulu (Faz 11). Amac: dagilmis paket/abonelik
// kontrollerini (bugune kadar her API kendi kopyasini yaziyordu) tek yerde
// toplamak. Mevcut gunlukLimitKontrolEt() (lib/ratelimit.js, AI gunluk limiti
// ekseni) bilerek buraya TASINMADI - farkli bir eksen (sayac bazli, paket adi
// degil), o dosyada kalmasi daha dogru. Burada sadece "paket bazli ozellik
// erisimi" ekseni merkezi hale getiriliyor.

// Kullanicinin su anki aktif abonelik planinin anahtarini dondurur (yoksa null).
export async function getUserPackage(kullaniciId) {
  if (!kullaniciId) return null;
  const sonuc = await sql`SELECT plan FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' LIMIT 1`;
  return sonuc[0]?.plan || null;
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
