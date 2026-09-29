import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const r = await sql`DELETE FROM ogretmenler WHERE eposta = 'audit-2fa-ogretmen@karemux-test.com'`;
  return Response.json({ silinen: r.count });
}
