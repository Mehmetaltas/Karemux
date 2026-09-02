import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";

export async function GET(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Oturum yok" }, { status: 401 });

  const sonuc = await sql`
    SELECT id, tur, sinif, ders, konu, materyal, olusturulma
    FROM ogretmen_materyalleri
    WHERE ogretmen_id = ${ogretmen.id}
    ORDER BY olusturulma DESC
    LIMIT 50
  `;
  return Response.json({ materyaller: sonuc });
}

export async function DELETE(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Oturum yok" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return Response.json({ error: "id gerekli" }, { status: 400 });

  await sql`DELETE FROM ogretmen_materyalleri WHERE id = ${id} AND ogretmen_id = ${ogretmen.id}`;
  return Response.json({ ok: true });
}
