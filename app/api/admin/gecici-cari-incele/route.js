import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    await sql`ALTER TABLE cariler ADD COLUMN IF NOT EXISTS kaynak_tablo VARCHAR(30)`;
    await sql`ALTER TABLE cariler ADD COLUMN IF NOT EXISTS kaynak_id INTEGER`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS cariler_kaynak_idx ON cariler (kaynak_tablo, kaynak_id) WHERE kaynak_tablo IS NOT NULL`;
    await sql`ALTER TABLE giderler ADD COLUMN IF NOT EXISTS cari_id INTEGER REFERENCES cariler(id)`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
