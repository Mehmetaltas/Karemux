import { sql } from "@/lib/db";

export async function GET() {
  const sonPlan = await sql`SELECT id, ders FROM ders_plani ORDER BY id DESC LIMIT 1`;
  const loglar = await sql`SELECT katman, sonuc, detay FROM icerik_kalite_log WHERE kaynak_tablo = 'ders_plani' AND kaynak_id = ${sonPlan[0]?.id} ORDER BY id`;
  return Response.json({ sonPlanId: sonPlan[0]?.id, ders: sonPlan[0]?.ders, loglar });
}
