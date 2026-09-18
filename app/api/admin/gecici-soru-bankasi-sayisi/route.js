import { sql } from "@/lib/db";

export async function GET() {
  const toplam = await sql`SELECT COUNT(*) as sayi FROM soru_bankasi`;
  const dersBazinda = await sql`SELECT ders, COUNT(*) as sayi FROM soru_bankasi GROUP BY ders ORDER BY sayi DESC`;
  const altKonuSayisi = await sql`SELECT COUNT(DISTINCT alt_konu) as sayi FROM soru_bankasi`;
  const uniteSayisi = await sql`SELECT COUNT(DISTINCT unite) as sayi FROM soru_bankasi`;
  return Response.json({ toplamSoru: toplam[0].sayi, altKonuSayisi: altKonuSayisi[0].sayi, uniteSayisi: uniteSayisi[0].sayi, dersBazinda });
}
