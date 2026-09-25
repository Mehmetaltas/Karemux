import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const sonuc = await sql`SELECT id, ad, veli_onay_token FROM kullanicilar WHERE eposta LIKE 'audit-ogr-veli%' ORDER BY olusturulma DESC LIMIT 1`;
  return Response.json(sonuc[0] || {});
}
