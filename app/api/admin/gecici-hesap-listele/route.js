import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const kullanicilar = await sql`SELECT id, eposta, ad, rol, olusturulma FROM kullanicilar ORDER BY olusturulma DESC LIMIT 20`;
    const kurumlar = await sql`SELECT id, ad, kurum_kodu FROM kurumlar ORDER BY id DESC LIMIT 10`;
    return Response.json({ kullanicilar, kurumlar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
