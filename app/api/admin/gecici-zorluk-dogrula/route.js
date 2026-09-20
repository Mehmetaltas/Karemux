import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const toplam = await sql`SELECT COUNT(*) as sayi FROM soru_bankasi`;
  const zorlukDagilimi = await sql`SELECT zorluk, COUNT(*) as sayi FROM soru_bankasi GROUP BY zorluk ORDER BY sayi DESC`;
  return Response.json({ toplamSoru: toplam[0].sayi, zorlukDagilimi });
}
