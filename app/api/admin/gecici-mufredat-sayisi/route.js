import { sql } from "@/lib/db";

export async function GET() {
  const toplam = await sql`SELECT COUNT(*) as sayi FROM mufredat`;
  const dersBazinda = await sql`SELECT ders, COUNT(*) as sayi FROM mufredat GROUP BY ders ORDER BY sayi DESC`;
  const sinifBazinda = await sql`SELECT sinif, COUNT(*) as sayi FROM mufredat GROUP BY sinif ORDER BY sinif`;
  return Response.json({ toplamAltKonu: toplam[0].sayi, dersBazinda, sinifBazinda });
}
