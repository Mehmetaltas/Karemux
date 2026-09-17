import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const kullanicilar = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'kullanicilar' ORDER BY ordinal_position`;
    const abonelikler = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'abonelikler' ORDER BY ordinal_position`;
    const satislar = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'satislar' ORDER BY ordinal_position`;
    return Response.json({ kullanicilar, abonelikler, satislar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
