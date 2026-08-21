import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

// Giris yapmis kullanicinin GERCEKTEN bir kurum yoneticisi olup olmadigini
// dogrular (cihaz-id yedegi YOK - kurum yonetimi icin gercek hesap sarttir).
// Donen: { kurumId, kullaniciId } ya da null.
export async function kurumYoneticisiCoz(req) {
  const kullaniciId = oturumdanKullaniciId(req);
  if (!kullaniciId) return null;
  const sonuc = await sql`SELECT rol, kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
  const k = sonuc[0];
  if (!k || k.rol !== "kurum_yoneticisi" || !k.kurum_id) return null;
  return { kurumId: k.kurum_id, kullaniciId };
}
