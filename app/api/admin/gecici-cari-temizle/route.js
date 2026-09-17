import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const silinen = await sql`DELETE FROM cariler WHERE ad ILIKE 'Health Check%' RETURNING id, ad`;
    return Response.json({ ok: true, silinenSayisi: silinen.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
