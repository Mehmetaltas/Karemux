import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    await sql`ALTER TABLE icerik_onbellek ADD COLUMN IF NOT EXISTS icerik_json JSONB`;
    return Response.json({ ok: true, mesaj: "icerik_json sutunu eklendi (veya zaten vardi)" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
