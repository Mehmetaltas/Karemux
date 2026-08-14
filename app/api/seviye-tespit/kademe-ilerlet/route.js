import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, kademeId, basariliMi } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });
    if (!kademeId) return Response.json({ error: "kademeId gerekli" }, { status: 400 });

    const satir = await sql`SELECT kademe FROM seviye_tespit_kademe WHERE id = ${kademeId} AND kullanici_id = ${kullaniciId}`;
    if (satir.length === 0) return Response.json({ error: "Bulunamadi" }, { status: 404 });

    const mevcutKademe = satir[0].kademe;

    // Kademe 3'te basarisiz olunursa (onay testi gecilemezse) ayni kademede kalinir,
    // tekrar denenir. Digerlerinde otomatik ilerler.
    if (mevcutKademe === 3 && basariliMi === false) {
      return Response.json({ ok: true, yeniKademe: 3, tamamlandi: false, tekrarGerekli: true });
    }

    if (mevcutKademe >= 3) {
      await sql`UPDATE seviye_tespit_kademe SET tamamlandi = true WHERE id = ${kademeId}`;
      return Response.json({ ok: true, tamamlandi: true });
    }

    const yeniKademe = mevcutKademe + 1;
    await sql`UPDATE seviye_tespit_kademe SET kademe = ${yeniKademe} WHERE id = ${kademeId}`;
    return Response.json({ ok: true, yeniKademe, tamamlandi: false });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
