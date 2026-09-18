import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS seviye_onay_sinavlari (
        id SERIAL PRIMARY KEY,
        kademe_id INTEGER NOT NULL REFERENCES seviye_tespit_kademe(id) ON DELETE CASCADE,
        sorular JSONB NOT NULL,
        olusturulma TIMESTAMP DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS seviye_onay_sinavlari_kademe_idx ON seviye_onay_sinavlari (kademe_id)`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
