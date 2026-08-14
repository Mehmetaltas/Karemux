import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ sinaviAldiMi: false, uniteler: [] });

    const sonucVarMi = await sql`SELECT id FROM seviye_tespit_sonuc WHERE kullanici_id = ${kullaniciId} LIMIT 1`;
    const uniteler = await sql`
      SELECT id, ders, unite, kaynak_sinif, kademe, tamamlandi
      FROM seviye_tespit_kademe
      WHERE kullanici_id = ${kullaniciId}
      ORDER BY tamamlandi ASC, ders ASC
    `;

    const tamamlanan = uniteler.filter((u) => u.tamamlandi).length;

    return Response.json({
      sinaviAldiMi: sonucVarMi.length > 0,
      uniteler,
      tamamlanan,
      toplamZayif: uniteler.length,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ sinaviAldiMi: false, uniteler: [] });
  }
}
