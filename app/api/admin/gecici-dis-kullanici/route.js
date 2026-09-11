import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const disKullanicilar = await sql`
      SELECT id, eposta, ad, rol, olusturulma
      FROM kullanicilar
      WHERE eposta NOT ILIKE '%mehmetaltas%' AND eposta NOT ILIKE '%karemuxegitim%'
      ORDER BY olusturulma ASC
    `;
    return Response.json({ toplam: disKullanicilar.length, kullanicilar: disKullanicilar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
