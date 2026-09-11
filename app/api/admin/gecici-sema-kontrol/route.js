import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const kolonlar = await sql`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'abonelikler' ORDER BY ordinal_position
    `;
    return Response.json({ kolonlar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
