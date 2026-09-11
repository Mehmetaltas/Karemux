import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    await sql`ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS sozlesme_onay_tarihi TIMESTAMPTZ`;
    await sql`ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS pazarlama_izni BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS pazarlama_izni_tarihi TIMESTAMPTZ`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
