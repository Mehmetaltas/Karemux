import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sutunlar = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'mufredat' ORDER BY ordinal_position
  `;
  const ornek = await sql`SELECT * FROM mufredat WHERE sinif = 7 LIMIT 5`;
  return Response.json({ sutunlar, ornek });
}
