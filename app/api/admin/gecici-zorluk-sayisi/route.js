import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const toplam = await sql`SELECT COUNT(*) as sayi FROM soru_bankasi WHERE zorluk IS NULL OR zorluk = ''`;
  const dersBazinda = await sql`SELECT ders, COUNT(*) as sayi FROM soru_bankasi WHERE zorluk IS NULL OR zorluk = '' GROUP BY ders ORDER BY sayi DESC`;
  return Response.json({ toplam: toplam[0].sayi, dersBazinda });
}
