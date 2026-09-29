import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const sonuc = await sql`SELECT giris_dogrulama_kodu FROM kullanicilar WHERE eposta = 'audit-2fa-veli-23771@karemux-test.com'`;
  return Response.json(sonuc[0] || {});
}
