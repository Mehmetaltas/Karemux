import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const silinen = await sql`DELETE FROM ogretmenler WHERE id = 5 RETURNING id, ad, eposta`;
    return Response.json({ ok: true, silinen });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
