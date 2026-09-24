import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  await sql`DELETE FROM ucretli_deneme_sonuclari WHERE deneme_id = 6`;
  await sql`DELETE FROM kurum_deneme_satin_alma WHERE kurum_id = 12`;
  await sql`DELETE FROM ucretli_denemeler WHERE id = 6`;
  const idler = (await sql`SELECT id FROM kullanicilar WHERE eposta LIKE 'audit-ucretli%'`).map(r => r.id);
  await sql`DELETE FROM kullanicilar WHERE id = ANY(${idler})`;
  await sql`DELETE FROM kurumlar WHERE id = 12`;
  return Response.json({ ok: true, silinenKullanici: idler.length });
}
