import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const sonuc = await sql`SELECT id, ad, eposta, brans, aktif FROM ogretmenler WHERE eposta ILIKE '%ogretmen%'`;
    return Response.json({ sonuc });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
