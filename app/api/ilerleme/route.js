import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, ders, konu, dogruSayisi, toplamSoru } = await req.json();
    if (!ders || !konu || dogruSayisi == null || !toplamSoru) {
      return Response.json({ error: "Eksik veri" }, { status: 400 });
    }

    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Kullanıcı belirlenemedi" }, { status: 400 });

    await sql`
      INSERT INTO ilerleme (kullanici_id, ders, konu, dogru_sayisi, toplam_soru)
      VALUES (${kullaniciId}, ${ders}, ${konu}, ${dogruSayisi}, ${toplamSoru})
    `;

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ gecmis: [], zayifDersler: [] });

    const satirlar = await sql`
      SELECT ders, konu, SUM(dogru_sayisi) AS dogru, SUM(toplam_soru) AS toplam
      FROM ilerleme
      WHERE kullanici_id = ${kullaniciId}
      GROUP BY ders, konu
      ORDER BY (SUM(dogru_sayisi)::float / NULLIF(SUM(toplam_soru), 0)) ASC
    `;

    const zayifDersler = [...new Set(
      satirlar.filter((s) => s.dogru / s.toplam < 0.6).map((s) => s.ders)
    )];

    return Response.json({ gecmis: satirlar, zayifDersler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
