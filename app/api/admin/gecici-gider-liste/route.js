import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const giderler = await sql`SELECT kategori, tutar_tl, aciklama, tarih, tekrarlayan FROM giderler ORDER BY tarih DESC`;
    const toplam = await sql`SELECT COALESCE(SUM(tutar_tl),0)::float AS toplam FROM giderler`;
    return Response.json({ giderler, tumZamanlarToplam: toplam[0].toplam });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
