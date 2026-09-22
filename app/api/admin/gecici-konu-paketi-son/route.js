import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const kayitlar = await sql`SELECT id, ders, unite, konu, icerik_json, olusturulma FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi' ORDER BY olusturulma DESC LIMIT 3`;
  return Response.json({ kayitlar });
}
