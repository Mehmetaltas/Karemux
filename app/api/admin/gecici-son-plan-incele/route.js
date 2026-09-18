import { sql } from "@/lib/db";

export async function GET(req) {
  const sonuc = await sql`SELECT id, icerik_json, kalite_kontrol FROM ders_plani ORDER BY id DESC LIMIT 1`;
  return Response.json(sonuc[0] || {});
}
