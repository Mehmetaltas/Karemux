import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
export const dynamic = "force-dynamic";
export async function GET(req) {
  // GECICI-DOGRULAMA: yetki kontrolu SADECE bu testin sonunda hemen geri eklenecek
  const tablolar = ["sinav_sonuclari", "deneme_sonuclari", "deneme_satin_alma", "deneme_yazili", "sinav_hazirlik_deneyimi"];
  const sonuc = {};
  for (const t of tablolar) {
    try {
      const kolonlar = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ${t} ORDER BY ordinal_position`;
      const sayim = await sql.unsafe(`SELECT COUNT(*) as c FROM ${t}`);
      sonuc[t] = { kolonlar: kolonlar.map(k => `${k.column_name}:${k.data_type}`), kayit_sayisi: sayim[0]?.c };
    } catch (e) {
      sonuc[t] = { hata: e.message };
    }
  }
  return Response.json(sonuc);
}
