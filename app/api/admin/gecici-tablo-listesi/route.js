import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export const maxDuration = 60;

// GECICI - hijyen taramasi. pg_stat_user_tables kullanarak TEK sorguda
// tum tablolarin yaklasik satir sayisini cekiyor - dinamik sorguya gerek yok.
export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const sonuc = await sql`
    SELECT relname AS tablo, n_live_tup AS satir_sayisi
    FROM pg_stat_user_tables
    ORDER BY relname
  `;
  return Response.json({ tablolar: sonuc, toplam: sonuc.length });
}
