import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const sayim = await sql`SELECT COUNT(*) as c FROM ucretli_denemeler WHERE aktif = true`;
  return Response.json({ aktifDenemeSayisi: Number(sayim[0].c) });
}
