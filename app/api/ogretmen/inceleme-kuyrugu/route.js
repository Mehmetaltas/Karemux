import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";

export async function GET(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const kayitlar = await sql`
      SELECT id, sinif, ders, unite, konu, icerik_json, olusturulma
      FROM icerik_onbellek
      WHERE icerik_turu = 'konu_paketi' AND ders = ${ogretmen.brans} AND onay_durumu = 'bekliyor'
      ORDER BY olusturulma DESC
    `;
    return Response.json({ kayitlar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
