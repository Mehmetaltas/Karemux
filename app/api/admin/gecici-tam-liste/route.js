import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const kullanicilar = await sql`SELECT id, eposta, ad, rol, olusturulma FROM kullanicilar ORDER BY olusturulma DESC`;
    const ogretmenler = await sql`SELECT id, ad, eposta, olusturulma FROM ogretmenler ORDER BY olusturulma DESC`;
    const kurumlar = await sql`SELECT id, ad, kurum_kodu, olusturulma FROM kurumlar ORDER BY olusturulma DESC`;
    const abonelikler = await sql`SELECT id, kullanici_id, plan, durum, kaynak, baslangic FROM abonelikler ORDER BY baslangic DESC`;

    const url = new URL(req.url);
    if (url.searchParams.get("sil_hayalet") === "1") {
      const silinen = await sql`DELETE FROM abonelikler WHERE id = 2 AND kullanici_id = 5259 RETURNING id`;
      return Response.json({ ok: true, silinenSatir: silinen.length });
    }

    return Response.json({ kullanicilar, ogretmenler, kurumlar, abonelikler });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
