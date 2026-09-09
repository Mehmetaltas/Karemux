import { sql } from "@/lib/db";

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    await sql`CREATE TABLE IF NOT EXISTS ai_kullanim_log (
      id SERIAL PRIMARY KEY,
      saglayici TEXT NOT NULL,
      basarili BOOLEAN NOT NULL,
      sure_ms INTEGER,
      json_modu BOOLEAN,
      olusturulma TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_kullanim_log_olusturulma ON ai_kullanim_log(olusturulma)`;
    return Response.json({ ok: true, tablo: "ai_kullanim_log olusturuldu" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
