import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// NOT: Bu, Neon Postgres'e yazarak sayaç tutar — Vercel'in çoklu/stateless
// serverless fonksiyon örnekleri arasında DOĞRU çalışır (bellek içi sayaçlar
// serverless'ta güvenilir değildir, her istek farklı bir örneğe düşebilir).
// Çok yüksek trafikte (saniyede binlerce istek) Upstash Redis gibi özel bir
// rate-limit servisi daha uygun olur; küçük/orta ölçek için bu yeterlidir.

const UCRETSIZ_GUNLUK_LIMIT = 500; // GELISTIRME ASAMASI - canliya cikmadan once dusurulmeli (orn. 15-20)

export async function gunlukLimitKontrolEt(req, cihazId) {
  const kullaniciId = await kullaniciIdCoz(req, cihazId);
  if (!kullaniciId) {
    // Kimliği çözemediysek (ör. çerez de cihazId de yok) güvenli tarafta kal, engelle
    return { izinVar: false, kullanim: 0, limit: UCRETSIZ_GUNLUK_LIMIT };
  }

  const sonuc = await sql`
    INSERT INTO gunluk_kullanim (kullanici_id, tarih, ai_istek_sayisi)
    VALUES (${kullaniciId}, CURRENT_DATE, 1)
    ON CONFLICT (kullanici_id, tarih)
    DO UPDATE SET ai_istek_sayisi = gunluk_kullanim.ai_istek_sayisi + 1
    RETURNING ai_istek_sayisi
  `;
  const kullanim = sonuc[0].ai_istek_sayisi;

  // TODO: Premium abonelik kontrolü eklenince buraya "aktif abonelik varsa limit yok" mantığı eklenmeli.
  return { izinVar: kullanim <= UCRETSIZ_GUNLUK_LIMIT, kullanim, limit: UCRETSIZ_GUNLUK_LIMIT };
}
