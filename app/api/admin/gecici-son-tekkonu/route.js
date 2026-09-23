import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const sonOturum = await sql`SELECT id, ders, konu, sorular, olusturulma FROM tek_konu_oturumu ORDER BY olusturulma DESC LIMIT 1`;
  return Response.json({ sonOturum });
}
