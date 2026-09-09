import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    await sql`CREATE TABLE IF NOT EXISTS ai_saglayici_log (
      id SERIAL PRIMARY KEY,
      saglayici TEXT NOT NULL,
      basarili BOOLEAN NOT NULL,
      sure_ms INTEGER,
      json_modu BOOLEAN,
      olusturulma TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_saglayici_log_olusturulma ON ai_saglayici_log(olusturulma)`;
    return Response.json({ ok: true, tablo: "ai_saglayici_log olusturuldu (dogru isimle)" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
