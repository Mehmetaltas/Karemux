import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, sinif, ders, unite, konu, anlatim, sorular } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    if (!sinif || !ders || !konu?.trim() || !anlatim?.trim() || !Array.isArray(sorular) || sorular.length === 0) {
      return Response.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const sonuc = await sql`
      INSERT INTO tek_konu_oturumu (kullanici_id, sinif, ders, unite, konu, anlatim, sorular)
      VALUES (${kullaniciId}, ${sinif}, ${ders}, ${unite || null}, ${konu.trim()}, ${anlatim}, ${JSON.stringify(sorular)})
      RETURNING id
    `;

    return Response.json({ ok: true, oturumId: sonuc[0].id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Oturum olusturulamadi" }, { status: 500 });
  }
}
