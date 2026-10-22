import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";
import { sinifTablolariniHazirla, sinifKoduUret } from "@/lib/ogretmen-sinif";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    await sinifTablolariniHazirla();
    const siniflar = await sql`
      SELECT s.id, s.ad, s.kod, s.olusturulma,
             (SELECT COUNT(*)::int FROM ogretmen_sinif_ogrencileri o WHERE o.sinif_id = s.id) AS ogrenci_sayisi
      FROM ogretmen_siniflari s WHERE s.ogretmen_id = ${ogretmen.id} AND s.aktif = true ORDER BY s.olusturulma DESC
    `;
    return Response.json({ siniflar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Siniflar getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const { ad } = await req.json();
    const temiz = typeof ad === "string" ? ad.trim().slice(0, 60) : "";
    if (temiz.length < 2) return Response.json({ error: "Sinif adi en az 2 karakter olmali" }, { status: 400 });
    await sinifTablolariniHazirla();
    const sayi = await sql`SELECT COUNT(*)::int AS adet FROM ogretmen_siniflari WHERE ogretmen_id = ${ogretmen.id} AND aktif = true`;
    if (sayi[0].adet >= 20) return Response.json({ error: "En fazla 20 aktif sinif olusturabilirsin" }, { status: 400 });
    for (let deneme = 0; deneme < 5; deneme++) {
      const kod = sinifKoduUret();
      try {
        const yeni = await sql`INSERT INTO ogretmen_siniflari (ogretmen_id, ad, kod) VALUES (${ogretmen.id}, ${temiz}, ${kod}) RETURNING id, ad, kod`;
        return Response.json({ ok: true, sinif: yeni[0] });
      } catch (e) {
        if (!/unique|duplicate/i.test(e.message)) throw e;
      }
    }
    return Response.json({ error: "Kod uretilemedi, tekrar dene" }, { status: 500 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Sinif olusturulamadi" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const { id } = await req.json();
    await sinifTablolariniHazirla();
    const silinen = await sql`UPDATE ogretmen_siniflari SET aktif = false WHERE id = ${id} AND ogretmen_id = ${ogretmen.id} RETURNING id`;
    if (silinen.length === 0) return Response.json({ error: "Sinif bulunamadi" }, { status: 404 });
    await sql`DELETE FROM ogretmen_sinif_ogrencileri WHERE sinif_id = ${id}`;
    await sql`DELETE FROM ogretmen_odev_teslim WHERE odev_id IN (SELECT id FROM ogretmen_odevleri WHERE sinif_id = ${id})`;
    await sql`DELETE FROM ogretmen_odevleri WHERE sinif_id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Sinif silinemedi" }, { status: 500 });
  }
}
