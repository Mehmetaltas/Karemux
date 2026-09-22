import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const kaynaklar = await sql`SELECT kaynak_turu, COUNT(*)::int AS adet FROM soru_bankasi WHERE ders = 'Ingilizce' GROUP BY kaynak_turu ORDER BY adet DESC`;
  return Response.json({ kaynaklar });
}
