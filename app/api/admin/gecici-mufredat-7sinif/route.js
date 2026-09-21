import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dersler = await sql`SELECT DISTINCT ders FROM mufredat WHERE sinif = 7 ORDER BY ders`;
  const ornekMatematik = await sql`SELECT ders, unite, konu, alt_konu, dogrulanma_durumu FROM mufredat WHERE sinif = 7 AND ders = 'Matematik' ORDER BY id LIMIT 15`;
  const toplamSayilar = await sql`SELECT ders, COUNT(*) as adet, COUNT(*) FILTER (WHERE dogrulanma_durumu = true) as dogrulanan FROM mufredat WHERE sinif = 7 GROUP BY ders ORDER BY ders`;
  return Response.json({ dersler, ornekMatematik, toplamSayilar });
}
