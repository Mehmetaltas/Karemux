import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const silinen = await sql`DELETE FROM icerik_onbellek WHERE id IN (5, 8, 15) AND icerik_turu = 'konu_paketi' RETURNING id`;
    return Response.json({ ok: true, silinenSayisi: silinen.length, silinenIdler: silinen.map(s => s.id) });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
