import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const idler = (await sql`SELECT id FROM kullanicilar WHERE eposta LIKE '%@anon.karemux.com'`).map(r => r.id);
  await sql`DELETE FROM gunluk_kullanim WHERE kullanici_id = ANY(${idler})`;
  const sonuc = await sql`DELETE FROM kullanicilar WHERE id = ANY(${idler}) RETURNING id`;
  return Response.json({ silinen: sonuc.length });
}
