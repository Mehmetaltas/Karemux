import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  await sql`DELETE FROM abonelikler WHERE kullanici_id = 8075`;
  await sql`DELETE FROM odemeler WHERE kullanici_id = 8075`;
  const r = await sql`DELETE FROM kullanicilar WHERE id = 8075`;
  return Response.json({ silinen: r.count });
}
