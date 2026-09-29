import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const idler = (await sql`SELECT id FROM kullanicilar WHERE eposta LIKE 'audit-2fa-%'`).map(r => r.id);
  await sql`DELETE FROM veli_ogrenci WHERE veli_id = ANY(${idler}) OR ogrenci_id = ANY(${idler})`;
  await sql`DELETE FROM kullanicilar WHERE id = ANY(${idler})`;
  return Response.json({ silinen: idler.length });
}
