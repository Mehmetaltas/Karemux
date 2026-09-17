import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const cariSema = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cari' ORDER BY ordinal_position`;
    const giderSema = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'giderler' ORDER BY ordinal_position`;
    const cariOrnek = await sql`SELECT * FROM cari LIMIT 3`;
    const giderOrnek = await sql`SELECT * FROM giderler LIMIT 3`;
    return Response.json({ cariSema, giderSema, cariOrnek, giderOrnek });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
