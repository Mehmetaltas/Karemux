import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, ders, altKonu, soru, secenekler, dogruIndex, verilenIndex, aciklama } = await req.json();
    if (!ders || !soru || !Array.isArray(secenekler) || dogruIndex == null) {
      return Response.json({ error: "Eksik veri" }, { status: 400 });
    }
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    await sql`
      INSERT INTO hata_kitapcigi (kullanici_id, cihaz_id, ders, alt_konu, soru, secenekler, dogru_index, verilen_index, aciklama)
      VALUES (${kullaniciId}, ${cihazId || null}, ${ders}, ${altKonu || null}, ${soru}, ${JSON.stringify(secenekler)}, ${dogruIndex}, ${verilenIndex ?? null}, ${aciklama || null})
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const cihazId = params.get("cihazId");
    const ders = params.get("ders");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    const kayitlar = kullaniciId
      ? await sql`
          SELECT id, ders, alt_konu, soru, secenekler, dogru_index, aciklama, cozuldu, olusturulma
          FROM hata_kitapcigi
          WHERE kullanici_id = ${kullaniciId} AND cozuldu = false ${ders ? sql`AND ders = ${ders}` : sql``}
          ORDER BY olusturulma DESC
          LIMIT 100
        `
      : await sql`
          SELECT id, ders, alt_konu, soru, secenekler, dogru_index, aciklama, cozuldu, olusturulma
          FROM hata_kitapcigi
          WHERE cihaz_id = ${cihazId} AND cozuldu = false ${ders ? sql`AND ders = ${ders}` : sql``}
          ORDER BY olusturulma DESC
          LIMIT 100
        `;
    return Response.json({ kayitlar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id } = await req.json();
    if (!id) return Response.json({ error: "Eksik id" }, { status: 400 });
    await sql`UPDATE hata_kitapcigi SET cozuldu = true WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
