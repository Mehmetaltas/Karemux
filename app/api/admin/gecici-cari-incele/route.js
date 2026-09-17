import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const carilerSema = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cariler' ORDER BY ordinal_position`;
    const hareketSema = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cari_hareketleri' ORDER BY ordinal_position`;
    const turDegerleri = await sql`SELECT DISTINCT tur, COUNT(*)::int AS adet FROM cariler GROUP BY tur`;
    const hareketOrnek = await sql`SELECT * FROM cari_hareketleri LIMIT 3`;
    const giderSema = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'giderler' ORDER BY ordinal_position`;
    const giderOrnek = await sql`SELECT * FROM giderler ORDER BY id DESC LIMIT 3`;
    return Response.json({ carilerSema, hareketSema, turDegerleri, hareketOrnek, giderSema, giderOrnek });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
