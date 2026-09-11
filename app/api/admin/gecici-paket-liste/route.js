import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const paketler = await sql`SELECT anahtar, ad, fiyat_tl, aktif FROM paketler ORDER BY fiyat_tl`;
    return Response.json({ paketler });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
