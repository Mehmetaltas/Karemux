import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const anonSayisi = await sql`SELECT COUNT(*) as c FROM kullanicilar WHERE eposta LIKE '%@anon.karemux.com'`;
  const ornekler = await sql`SELECT id, eposta, olusturulma FROM kullanicilar WHERE eposta LIKE '%@anon.karemux.com' ORDER BY olusturulma DESC LIMIT 5`;
  const anonSonucSayisi = await sql`
    SELECT COUNT(*) as c FROM ulusal_deneme_sonuclari s
    JOIN kullanicilar k ON k.id = s.kullanici_id
    WHERE k.eposta LIKE '%@anon.karemux.com'
  `;
  return Response.json({ anonKullaniciSayisi: anonSayisi[0].c, ornekler, anonKullaniciSonucSayisi: anonSonucSayisi[0].c });
}
