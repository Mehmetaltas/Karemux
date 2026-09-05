import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ duyurular: [] });

    const kullanici = await sql`SELECT kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    const kurumId = kullanici[0]?.kurum_id;
    if (!kurumId) return Response.json({ duyurular: [] });

    const duyurular = await sql`
      SELECT id, baslik, icerik, olusturulma FROM kurum_duyuru
      WHERE kurum_id = ${kurumId}
      ORDER BY olusturulma DESC
      LIMIT 10
    `;
    return Response.json({ duyurular });
  } catch (e) {
    console.error(e);
    return Response.json({ duyurular: [] });
  }
}
