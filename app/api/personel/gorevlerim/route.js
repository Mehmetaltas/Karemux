import { sql } from "@/lib/db";
import { personelCoz } from "@/lib/personel";

export async function GET(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const gorevler = await sql`
    SELECT id, baslik, aciklama, durum, oncelik, son_tarih, olusturulma
    FROM personel_gorev WHERE atanan_personel_id = ${personel.id} ORDER BY
      CASE durum WHEN 'acik' THEN 0 WHEN 'devam_ediyor' THEN 1 ELSE 2 END, son_tarih ASC NULLS LAST
  `;
  return Response.json({ gorevler });
}

export async function PATCH(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const { gorevId, durum } = await req.json();
    if (!["acik", "devam_ediyor", "tamamlandi"].includes(durum)) {
      return Response.json({ error: "Gecersiz durum" }, { status: 400 });
    }
    const sonuc = await sql`
      UPDATE personel_gorev SET durum = ${durum}, tamamlanma_tarihi = ${durum === "tamamlandi" ? sql`now()` : null}
      WHERE id = ${gorevId} AND atanan_personel_id = ${personel.id}
      RETURNING id
    `;
    if (sonuc.length === 0) return Response.json({ error: "Gorev bulunamadi" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
