import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const kullaniciKolonlari = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'kullanicilar' ORDER BY ordinal_position`;
  const kurumKolonlari = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'kurumlar' ORDER BY ordinal_position`;
  return Response.json({
    kullanicilar: kullaniciKolonlari.map(k => k.column_name),
    kurumlar: kurumKolonlari.map(k => k.column_name),
  });
}
