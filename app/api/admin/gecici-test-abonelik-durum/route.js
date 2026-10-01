import { sql } from "@/lib/db";

export async function GET() {
  const kid = 8146;
  const once = await sql`SELECT
    (SELECT COUNT(*) FROM abonelikler WHERE kullanici_id = ${kid}) as abonelik,
    (SELECT COUNT(*) FROM kullanicilar WHERE id = ${kid}) as kullanici`;

  await sql`DELETE FROM abonelikler WHERE kullanici_id = ${kid}`;
  await sql`DELETE FROM kullanicilar WHERE id = ${kid}`;

  const sonra = await sql`SELECT
    (SELECT COUNT(*) FROM abonelikler WHERE kullanici_id = ${kid}) as abonelik,
    (SELECT COUNT(*) FROM kullanicilar WHERE id = ${kid}) as kullanici`;

  return Response.json({ once: once[0], sonra: sonra[0] });
}
