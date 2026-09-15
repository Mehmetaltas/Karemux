import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const ornek = await sql`
      SELECT id, ders, sinif, kaynak_turu, soru, secenekler, dogru_index
      FROM soru_bankasi
      WHERE kaynak_turu IN ('ders_seviye', 'gecen_yil_genel', 'otomatik_arkaplan', 'yeniden_uretim_7eylul')
      AND zorluk IS NULL
      ORDER BY kaynak_turu
      LIMIT 6
    `;
    return Response.json({ ornek });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
