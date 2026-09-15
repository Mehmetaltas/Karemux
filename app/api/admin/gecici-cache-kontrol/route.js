import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const sonuc = await sql`
      SELECT id, sinif, ders, unite, konu, olusturulma, LENGTH(icerik) AS uzunluk
      FROM icerik_onbellek WHERE icerik_turu = 'tek_konu_anlatimi'
      ORDER BY olusturulma DESC LIMIT 10
    `;
    return Response.json({ sonuc });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
