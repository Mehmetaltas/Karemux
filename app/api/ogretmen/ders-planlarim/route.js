import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";

export async function GET(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const planlar = await sql`
      SELECT id, ders, sinif, unite, ogrenme_ciktisi, icerik_json, onay_durumu, kalite_kontrol, olusturulma
      FROM ders_plani WHERE ogretmen_id = ${ogretmen.id} ORDER BY olusturulma DESC
    `;
    return Response.json({ planlar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
