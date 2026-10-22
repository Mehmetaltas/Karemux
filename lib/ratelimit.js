import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { createHash } from "node:crypto";
import { OTOMASYON_TEST_CIHAZ_ID } from "@/lib/otomasyon-test";

// NOT: Bu, Neon Postgres'e yazarak sayaç tutar — Vercel'in çoklu/stateless
// serverless fonksiyon örnekleri arasında DOĞRU çalışır (bellek içi sayaçlar
// serverless'ta güvenilir değildir, her istek farklı bir örneğe düşebilir).
// Çok yüksek trafikte (saniyede binlerce istek) Upstash Redis gibi özel bir
// rate-limit servisi daha uygun olur; küçük/orta ölçek için bu yeterlidir.

export const UCRETSIZ_GUNLUK_LIMIT = 20;

// "Sinirsiz" pazarlanan Premium'da bile GIZLI, comert bir adil kullanim tavani
// var - normal bir ogrenci asla buna ulasmaz, ama asiri uclarda gercek AI
// maliyetini sinirlar. Kullaniciya "sinirsiz" mesaji BOZULMAZ.
export const PREMIUM_ADIL_KULLANIM_LIMIT = 70;

// Faz E (20 Ekim): cihazId istemcinin yazdigi serbest bir metin; her yeni cihazId yeni bir anonim
// kullanici (ve yeni 20 haklik limit) demek. Bunu dondurerek kullanici basina limit asilabilirdi.
// IP basina GENEL bir gunluk tavan eklendi. Okul/ev agi gibi paylasilan IP'lerde normal kullanim
// asla buna ulasmasin diye cömert tutuldu; amaci limit asma otomasyonunu sinirlamak. IP ham
// saklanmaz (tek yonlu ozet). Tablo yoksa ya da sorgu hata verirse OGRENCIYI ENGELLEMEZ (fail-open).
export const IP_GUNLUK_TAVAN = 2500;

export async function ipGunlukLimitKontrolEt(req) {
  try {
    const ham = req?.headers?.get?.("x-forwarded-for") || req?.headers?.get?.("x-real-ip") || "";
    const ip = ham.split(",")[0].trim();
    if (!ip) return { izinVar: true, kullanim: 0, limit: IP_GUNLUK_TAVAN };
    const ozet = createHash("sha256").update("karemux-ip:" + ip).digest("hex").slice(0, 32);
    const sonuc = await sql`
      INSERT INTO ai_ip_kullanim (ip_ozet, tarih, istek_sayisi)
      VALUES (${ozet}, CURRENT_DATE, 1)
      ON CONFLICT (ip_ozet, tarih)
      DO UPDATE SET istek_sayisi = ai_ip_kullanim.istek_sayisi + 1
      RETURNING istek_sayisi
    `;
    const kullanim = sonuc[0].istek_sayisi;
    return { izinVar: kullanim <= IP_GUNLUK_TAVAN, kullanim, limit: IP_GUNLUK_TAVAN };
  } catch (e) {
    console.error("IP limit kontrol hatasi (fail-open):", e);
    return { izinVar: true, kullanim: 0, limit: IP_GUNLUK_TAVAN };
  }
}

export async function gunlukLimitKontrolEt(req, cihazId) {
  const ipDurumu = await ipGunlukLimitKontrolEt(req);
  if (!ipDurumu.izinVar) return { izinVar: false, kullanim: ipDurumu.kullanim, limit: ipDurumu.limit, premium: false, ipSiniri: true };

  // Otomasyon testi (GitHub Actions): sabit cihaz kimligi depoda herkese acik oldugu icin kimlik TEK BASINA muafiyet vermez;
  // yalniz sunucu ortamindaki gizli anahtari (OGRENCI_TEST_SONUC_ANAHTARI) basliktan da gonderen istek gunluk kullanici
  // limitinden muaf tutulur. Aksi halde gun icindeki yeniden denemeler 20 hakki doldurup testi sahte yere kirmizi yapiyordu.
  // IP tavani yukarida zaten uygulandi.
  const otomasyonAnahtari = process.env.OGRENCI_TEST_SONUC_ANAHTARI;
  if (cihazId === OTOMASYON_TEST_CIHAZ_ID && otomasyonAnahtari && req?.headers?.get?.("x-otomasyon-anahtari") === otomasyonAnahtari) {
    return { izinVar: true, kullanim: 0, limit: UCRETSIZ_GUNLUK_LIMIT, premium: false, otomasyon: true };
  }

  const kullaniciId = await kullaniciIdCoz(req, cihazId);
  if (!kullaniciId) {
    // Kimliği çözemediysek (ör. çerez de cihazId de yok) güvenli tarafta kal, engelle
    return { izinVar: false, kullanim: 0, limit: UCRETSIZ_GUNLUK_LIMIT };
  }

  // Aktif Premium aboneligi varsa gunluk limit uygulanmaz.
  const abonelik = await sql`
    SELECT 1 FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' AND (bitis IS NULL OR bitis > now()) LIMIT 1
  `;
  const premium = !!abonelik[0];
  const limit = premium ? PREMIUM_ADIL_KULLANIM_LIMIT : UCRETSIZ_GUNLUK_LIMIT;

  const sonuc = await sql`
    INSERT INTO gunluk_kullanim (kullanici_id, tarih, ai_istek_sayisi)
    VALUES (${kullaniciId}, CURRENT_DATE, 1)
    ON CONFLICT (kullanici_id, tarih)
    DO UPDATE SET ai_istek_sayisi = gunluk_kullanim.ai_istek_sayisi + 1
    RETURNING ai_istek_sayisi
  `;
  const kullanim = sonuc[0].ai_istek_sayisi;

  return { izinVar: kullanim <= limit, kullanim, limit, premium };
}

// Ogretmen materyal uretimi icin gunluk limit - "sinirsiz" degil, gercek AI
// maliyetini ucretli katmanda kontrolsuz buyumeye karsi korur. Normal bir
// ogretmen kullanim deseninde asla ulasilmaz (gunde ~30 uretim, cok comert).
export const OGRETMEN_GUNLUK_LIMIT = 30;

export async function ogretmenGunlukLimitKontrolEt(ogretmenId) {
  const sonuc = await sql`
    INSERT INTO ogretmen_gunluk_kullanim (ogretmen_id, tarih, uretim_sayisi)
    VALUES (${ogretmenId}, CURRENT_DATE, 1)
    ON CONFLICT (ogretmen_id, tarih)
    DO UPDATE SET uretim_sayisi = ogretmen_gunluk_kullanim.uretim_sayisi + 1
    RETURNING uretim_sayisi
  `;
  const kullanim = sonuc[0].uretim_sayisi;
  return { izinVar: kullanim <= OGRETMEN_GUNLUK_LIMIT, kullanim, limit: OGRETMEN_GUNLUK_LIMIT };
}
