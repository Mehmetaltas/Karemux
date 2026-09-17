import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { cariBulYaDaAc } from "@/lib/cari";

// Bugune kadar kayit olmus (bu kod eklenmeden once) TUM kullanicilar icin
// geriye donuk cari acar. anon.karemux.com ve test hesaplari HARIC.
export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const kullanicilar = await sql`
      SELECT id, ad, eposta, rol FROM kullanicilar
      WHERE eposta NOT ILIKE '%anon.karemux.com%'
    `;
    let acilan = 0;
    for (const k of kullanicilar) {
      const tur = k.rol === "kurum_yoneticisi" ? "kurum" : k.rol;
      await cariBulYaDaAc({ ad: k.ad, tur, kaynakTablo: "kullanicilar", kaynakId: k.id, eposta: k.eposta });
      acilan++;
    }
    return Response.json({ ok: true, toplamKullanici: kullanicilar.length, acilanCari: acilan });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
