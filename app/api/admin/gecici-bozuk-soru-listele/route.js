import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const yabanci = await sql`
      SELECT id, ders, sinif, soru, secenekler, dogru_index FROM soru_bankasi
      WHERE soru ~ '[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]'
    `;
    const bozukYapi = await sql`
      SELECT id, ders, sinif, soru, secenekler, dogru_index FROM soru_bankasi
      WHERE jsonb_array_length(secenekler) != 4 OR dogru_index < 0 OR dogru_index > 3
    `;
    return Response.json({ yabanciSayisi: yabanci.length, yabanci, bozukYapiSayisi: bozukYapi.length, bozukYapi });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
