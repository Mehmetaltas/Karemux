import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  await sql`DELETE FROM giderler WHERE aciklama = 'Iade - yillik_8_sinif - talep #1'`;
  await sql`DELETE FROM iade_talepleri WHERE id = 1`;
  await sql`DELETE FROM abonelikler WHERE iyzico_abonelik_id = 'test-iade'`;
  await sql`DELETE FROM odemeler WHERE kullanici_id = 7995`;
  const r = await sql`DELETE FROM kullanicilar WHERE id = 7995`;
  return Response.json({ silinen: r.count });
}
