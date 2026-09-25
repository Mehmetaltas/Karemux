import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  await sql`DELETE FROM ucretli_deneme_sonuclari WHERE deneme_id IN (SELECT id FROM ucretli_denemeler WHERE ad LIKE 'Audit %')`;
  await sql`DELETE FROM kurum_deneme_satin_alma WHERE kurum_id IN (SELECT id FROM kurumlar WHERE ad LIKE 'Audit %')`;
  await sql`DELETE FROM ucretli_denemeler WHERE ad LIKE 'Audit %'`;
  await sql`DELETE FROM kurumlar WHERE ad LIKE 'Audit %'`;
  await sql`DELETE FROM abonelikler WHERE iyzico_abonelik_id = 'test-onay'`;
  await sql`DELETE FROM odemeler WHERE havale_referans = 'KRX-MUGUHH5G'`;
  const idler = (await sql`SELECT id FROM kullanicilar WHERE eposta LIKE 'audit-dk%' OR eposta LIKE 'audit-reg%'`).map(r => r.id);
  await sql`DELETE FROM kullanicilar WHERE id = ANY(${idler})`;
  return Response.json({ ok: true, silinenKullanici: idler.length });
}
