import { sql } from "@/lib/db";
import { tokenDogrula } from "@/lib/auth";

function cookieOku(req, ad) {
  const cookie = req.headers.get("cookie") || "";
  const eslesme = cookie.match(new RegExp(`${ad}=([^;]+)`));
  return eslesme ? eslesme[1] : null;
}

export async function GET(req) {
  try {
    const veri = tokenDogrula(cookieOku(req, "karemux_token"));
    if (!veri?.kullaniciId) return Response.json({ aktifAbonelik: null });

    const sonuc = await sql`
      SELECT plan, baslangic, bitis FROM abonelikler
      WHERE kullanici_id = ${veri.kullaniciId} AND durum = 'aktif'
      ORDER BY baslangic DESC LIMIT 1
    `;
    return Response.json({ aktifAbonelik: sonuc[0] || null });
  } catch (e) {
    console.error(e);
    return Response.json({ aktifAbonelik: null });
  }
}
