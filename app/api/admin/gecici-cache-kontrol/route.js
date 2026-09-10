import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const kayitlar = await sql`
      SELECT konu, olusturulma, LEFT(icerik, 200) AS ornek
      FROM icerik_onbellek
      WHERE konu ILIKE '%olasilik%'
      ORDER BY olusturulma DESC LIMIT 5
    `;
    return Response.json({ kayitlar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
