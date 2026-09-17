import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const liste = await sql`SELECT id, ad, eposta, brans, aktif, son_giris FROM ogretmenler ORDER BY id DESC`;
    return Response.json({ liste });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
