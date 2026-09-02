import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

// GECICI - ogretmen_materyalleri tablosu icin. Is bitince KALDIRILACAK.
export async function POST(req) {
  try {
    const { sifre } = await req.json();
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    await sql`
      CREATE TABLE IF NOT EXISTS ogretmen_materyalleri (
        id SERIAL PRIMARY KEY,
        ogretmen_id INTEGER NOT NULL REFERENCES ogretmenler(id),
        tur TEXT NOT NULL,
        sinif INTEGER,
        ders TEXT,
        konu TEXT,
        materyal JSONB NOT NULL,
        olusturulma TIMESTAMPTZ DEFAULT now()
      )
    `;
    const kontrol = await sql`SELECT table_name FROM information_schema.tables WHERE table_name = 'ogretmen_materyalleri'`;
    return Response.json({ ok: true, tabloVarMi: kontrol.length > 0 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
