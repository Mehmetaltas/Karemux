import { sql } from "@/lib/db";

export async function GET() {
  const sonuc = await sql`SELECT saglayici, basarili, tur, olusturulma FROM ai_saglayici_log ORDER BY id DESC LIMIT 15`;
  return Response.json(sonuc);
}
