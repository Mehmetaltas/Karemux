import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

// Kullanici 360 Profili - arama ucu (17 Eylul). Maliyet ekranindan BAGIMSIZ,
// bireysel kullaniciyi isim/eposta ile bulup detay ekranina yonlendiren
// ilk basamak.
export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const q = new URL(req.url).searchParams.get("q") || "";
    if (q.trim().length < 2) return Response.json({ sonuclar: [] });
    const sonuclar = await sql`
      SELECT id, ad, eposta, rol, sinif, olusturulma
      FROM kullanicilar
      WHERE ad ILIKE ${"%" + q.trim() + "%"} OR eposta ILIKE ${"%" + q.trim() + "%"}
      ORDER BY olusturulma DESC
      LIMIT 20
    `;
    return Response.json({ sonuclar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
