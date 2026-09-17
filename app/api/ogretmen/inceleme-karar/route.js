import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";

export async function POST(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const { id, karar, not: redNotu } = await req.json();
    if (!id || !["onayla", "reddet"].includes(karar)) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }
    const kayit = await sql`SELECT id, ders, sinif, konu FROM icerik_onbellek WHERE id = ${id} AND onay_durumu = 'bekliyor'`;
    if (kayit.length === 0) return Response.json({ error: "Kayit bulunamadi veya zaten islenmis" }, { status: 404 });
    if (kayit[0].ders !== ogretmen.brans) return Response.json({ error: "Bu kayit senin bransina ait degil" }, { status: 403 });

    if (karar === "onayla") {
      await sql`UPDATE icerik_onbellek SET onay_durumu = 'onaylandi', onaylayan_ogretmen_id = ${ogretmen.id}, onay_tarihi = now() WHERE id = ${id}`;
    } else {
      await sql`
        CREATE TABLE IF NOT EXISTS icerik_red_log (
          id SERIAL PRIMARY KEY, ders VARCHAR, sinif INTEGER, konu TEXT,
          ogretmen_id INTEGER, red_notu TEXT, red_tarihi TIMESTAMP DEFAULT now()
        )
      `;
      await sql`
        INSERT INTO icerik_red_log (ders, sinif, konu, ogretmen_id, red_notu)
        VALUES (${kayit[0].ders}, ${kayit[0].sinif}, ${kayit[0].konu}, ${ogretmen.id}, ${redNotu || ""})
      `;
      await sql`DELETE FROM icerik_onbellek WHERE id = ${id}`;
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
