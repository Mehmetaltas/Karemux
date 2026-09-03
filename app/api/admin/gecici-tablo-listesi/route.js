import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export const maxDuration = 60;

// GECICI - hijyen taramasi icin tum tablo adlarini ve satir sayilarini listeler.
export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const tablolar = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  const sonuc = await Promise.all(tablolar.map(async (t) => {
    try {
      const sayim = await sql.query(`SELECT COUNT(*)::int AS c FROM "${t.table_name}"`);
      const satir = sayim.rows ? sayim.rows[0].c : sayim[0].c;
      return { tablo: t.table_name, satirSayisi: satir };
    } catch (e) {
      return { tablo: t.table_name, satirSayisi: null, hata: e.message };
    }
  }));
  return Response.json({ tablolar: sonuc, toplam: tablolar.length });
}
