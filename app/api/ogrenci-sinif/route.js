import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { sinifTablolariniHazirla } from "@/lib/ogretmen-sinif";

export const dynamic = "force-dynamic";

// Ogrenci tarafi: ogretmen sinif koduyla katil / katildigi siniflari gor / ayril.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ siniflar: [] });
    await sinifTablolariniHazirla();
    const siniflar = await sql`
      SELECT s.id, s.ad, o.ad AS ogretmen_ad, o.brans, g.katilma
      FROM ogretmen_sinif_ogrencileri g
      JOIN ogretmen_siniflari s ON s.id = g.sinif_id AND s.aktif = true
      JOIN ogretmenler o ON o.id = s.ogretmen_id
      WHERE g.kullanici_id = ${kullaniciId} ORDER BY g.katilma DESC
    `;
    return Response.json({ siniflar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { cihazId, islem, kod, sinifId } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    await sinifTablolariniHazirla();

    if (islem === "ayril") {
      await sql`DELETE FROM ogretmen_sinif_ogrencileri WHERE sinif_id = ${sinifId} AND kullanici_id = ${kullaniciId}`;
      return Response.json({ ok: true });
    }

    const temizKod = typeof kod === "string" ? kod.trim().toUpperCase() : "";
    if (!/^[A-Z0-9]{6}$/.test(temizKod)) return Response.json({ error: "Sinif kodu 6 karakter olmali" }, { status: 400 });
    const sinif = await sql`
      SELECT s.id, s.ad, o.ad AS ogretmen_ad FROM ogretmen_siniflari s JOIN ogretmenler o ON o.id = s.ogretmen_id
      WHERE s.kod = ${temizKod} AND s.aktif = true
    `;
    if (sinif.length === 0) return Response.json({ error: "Bu koda ait sinif bulunamadi" }, { status: 404 });
    const sayi = await sql`SELECT COUNT(*)::int AS adet FROM ogretmen_sinif_ogrencileri WHERE sinif_id = ${sinif[0].id}`;
    if (sayi[0].adet >= 60) return Response.json({ error: "Bu sinif dolu" }, { status: 400 });
    await sql`INSERT INTO ogretmen_sinif_ogrencileri (sinif_id, kullanici_id) VALUES (${sinif[0].id}, ${kullaniciId}) ON CONFLICT DO NOTHING`;
    return Response.json({ ok: true, sinif: { id: sinif[0].id, ad: sinif[0].ad, ogretmenAd: sinif[0].ogretmen_ad } });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Islem yapilamadi" }, { status: 500 });
  }
}
