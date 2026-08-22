import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { oturumId, cihazId } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    if (!oturumId) return Response.json({ error: "oturumId gerekli" }, { status: 400 });

    const oturum = await sql`
      SELECT o.id, o.max_kapasite, o.fiyat_tl,
             (SELECT COUNT(*) FROM canli_ders_katilimcilari k WHERE k.oturum_id = o.id)::int AS kayitli_ogrenci
      FROM canli_ders_oturumlari o WHERE o.id = ${oturumId} AND o.durum = 'planlandi'
    `;
    if (oturum.length === 0) return Response.json({ error: "Oturum bulunamadi" }, { status: 404 });
    if (oturum[0].kayitli_ogrenci >= oturum[0].max_kapasite) {
      return Response.json({ error: "Bu oturumda yer kalmadi" }, { status: 409 });
    }

    const zatenKayitli = await sql`SELECT 1 FROM canli_ders_katilimcilari WHERE oturum_id = ${oturumId} AND ogrenci_id = ${kullaniciId}`;
    if (zatenKayitli.length > 0) return Response.json({ error: "Bu oturuma zaten kayitlisin" }, { status: 400 });

    await sql`INSERT INTO canli_ders_katilimcilari (oturum_id, ogrenci_id, odendi) VALUES (${oturumId}, ${kullaniciId}, false)`;
    return Response.json({ ok: true, fiyatTl: oturum[0].fiyat_tl });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
