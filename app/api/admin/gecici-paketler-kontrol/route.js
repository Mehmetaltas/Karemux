import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const kolonlar = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'paketler' ORDER BY ordinal_position`;
  const kayitlar = await sql`SELECT anahtar, ad, fiyat_tl, sure_gun, kredi_miktari, aktif FROM paketler ORDER BY id`;
  return Response.json({ kolonlar, kayitlar });
}
