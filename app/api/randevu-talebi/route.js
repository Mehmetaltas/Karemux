import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, ders, tarih, saat } = await req.json();
    if (!ders || !tarih || !saat) return Response.json({ error: "Eksik veri" }, { status: 400 });
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    await sql`
      INSERT INTO randevu_talepleri (kullanici_id, ders, tercih_edilen_tarih, tercih_edilen_saat, durum)
      VALUES (${kullaniciId}, ${ders}, ${tarih}, ${saat}, 'beklemede')
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}
