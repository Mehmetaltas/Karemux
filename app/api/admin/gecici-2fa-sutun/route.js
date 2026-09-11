import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    await sql`ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS giris_dogrulama_kodu TEXT`;
    await sql`ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS giris_dogrulama_son_tarih TIMESTAMPTZ`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
