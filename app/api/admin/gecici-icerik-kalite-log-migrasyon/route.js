import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS icerik_kalite_log (
        id SERIAL PRIMARY KEY,
        kaynak_tablo VARCHAR(50) NOT NULL,
        kaynak_id INTEGER NOT NULL,
        katman VARCHAR(30) NOT NULL,
        sonuc VARCHAR(10) NOT NULL,
        detay JSONB,
        olusturulma TIMESTAMP DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS icerik_kalite_log_kaynak_idx ON icerik_kalite_log (kaynak_tablo, kaynak_id)`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
