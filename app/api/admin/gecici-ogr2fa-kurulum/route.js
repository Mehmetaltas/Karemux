import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const sonuc = await sql`SELECT giris_dogrulama_kodu FROM ogretmenler WHERE eposta = 'audit-2fa-ogretmen@karemux-test.com'`;
  return Response.json(sonuc[0] || {});
}
