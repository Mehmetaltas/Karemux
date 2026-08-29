import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

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

export async function gunlukLimitKontrolEt(req, cihazId) {
  const kullaniciId = await kullaniciIdCoz(req, cihazId);
  if (!kullaniciId) {
    // Kimliği çözemediysek (ör. çerez de cihazId de yok) güvenli tarafta kal, engelle
    return { izinVar: false, kullanim: 0, limit: UCRETSIZ_GUNLUK_LIMIT };
  }

  // Aktif Premium aboneligi varsa gunluk limit uygulanmaz.
  const abonelik = await sql`
    SELECT 1 FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' LIMIT 1
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
