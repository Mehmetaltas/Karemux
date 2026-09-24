import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const ogretmen = await sql`SELECT id FROM ogretmenler WHERE eposta = 'test.otomasyon@karemux.com'`;
  if (ogretmen.length === 0) return Response.json({ error: "bulunamadi" }, { status: 404 });
  await sql`DELETE FROM ogretmen_gunluk_kullanim WHERE ogretmen_id = ${ogretmen[0].id} AND tarih = CURRENT_DATE`;
  return Response.json({ sifirlandi: true });
}
