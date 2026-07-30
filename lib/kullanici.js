import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

// Önce gerçek oturuma bakar (giriş yapmış kullanıcı önceliklidir).
// Yoksa anonim cihaz kimliğine karşılık gelen bir "gölge" kullanıcı bulur/oluşturur.
export async function kullaniciIdCoz(req, cihazId) {
  const gercekId = oturumdanKullaniciId(req);
  if (gercekId) return gercekId;

  if (!cihazId) return null;
  const sonuc = await sql`
    INSERT INTO kullanicilar (eposta, sifre_hash, ad)
    VALUES (${cihazId + "@anon.karemux.com"}, 'anon', 'Anonim')
    ON CONFLICT (eposta) DO UPDATE SET eposta = EXCLUDED.eposta
    RETURNING id
  `;
  return sonuc[0].id;
}
