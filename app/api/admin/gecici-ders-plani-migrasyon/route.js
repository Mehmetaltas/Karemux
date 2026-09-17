import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS ders_plani (
        id SERIAL PRIMARY KEY,
        ogretmen_id INTEGER REFERENCES ogretmenler(id),
        ders VARCHAR(50) NOT NULL,
        sinif INTEGER NOT NULL,
        unite TEXT,
        ogrenme_ciktisi TEXT NOT NULL,
        icerik_json JSONB NOT NULL,
        onay_durumu VARCHAR(20) DEFAULT 'taslak',
        kalite_kontrol JSONB,
        olusturulma TIMESTAMP DEFAULT now()
      )
    `;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
