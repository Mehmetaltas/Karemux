import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const yediSinifTurler = await sql`SELECT ders, mufredat_turu, COUNT(*) as adet FROM mufredat WHERE sinif = 7 GROUP BY ders, mufredat_turu ORDER BY ders`;
  const sekizSinifTurler = await sql`SELECT ders, mufredat_turu, COUNT(*) as adet FROM mufredat WHERE sinif = 8 GROUP BY ders, mufredat_turu ORDER BY ders`;
  const tumTurler = await sql`SELECT sinif, mufredat_turu, COUNT(*) as adet FROM mufredat GROUP BY sinif, mufredat_turu ORDER BY sinif`;
  return Response.json({ yediSinifTurler, sekizSinifTurler, tumTurler });
}
