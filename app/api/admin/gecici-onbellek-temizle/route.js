import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const sonuc = await sql`DELETE FROM icerik_onbellek`;
    return Response.json({ ok: true, silinen: sonuc.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
