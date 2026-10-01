import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  await sql`DELETE FROM odemeler WHERE kullanici_id IN (8108, 8109)`;
  await sql`DELETE FROM abonelikler WHERE kullanici_id = 8109`;
  await sql`DELETE FROM canli_ders_katilimcilari WHERE ogrenci_id IN (8108, 8109)`;
  await sql`DELETE FROM canli_ders_oturumlari WHERE id = 4`;
  const r = await sql`DELETE FROM kullanicilar WHERE id IN (8108, 8109)`;
  return Response.json({ silinen: r.count });
}
