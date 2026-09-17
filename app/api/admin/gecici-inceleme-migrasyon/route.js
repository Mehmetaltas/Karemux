import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    await sql`ALTER TABLE icerik_onbellek ADD COLUMN IF NOT EXISTS onay_durumu VARCHAR(20)`;
    await sql`ALTER TABLE icerik_onbellek ADD COLUMN IF NOT EXISTS onaylayan_ogretmen_id INTEGER`;
    await sql`ALTER TABLE icerik_onbellek ADD COLUMN IF NOT EXISTS onay_tarihi TIMESTAMP`;
    await sql`ALTER TABLE icerik_onbellek ADD COLUMN IF NOT EXISTS red_notu TEXT`;

    // Mevcut isaretli (kaliteKontrol.gecti=false) kayitlari 'bekliyor' yap
    const guncellenen = await sql`
      UPDATE icerik_onbellek SET onay_durumu = 'bekliyor'
      WHERE icerik_turu = 'konu_paketi' AND (icerik_json->'kaliteKontrol'->>'gecti')::boolean = false
      RETURNING id
    `;

    const dersler = await sql`SELECT DISTINCT brans FROM ogretmenler WHERE aktif = true`;
    return Response.json({ ok: true, guncellenenSayisi: guncellenen.length, mevcutBranslar: dersler.map(d => d.brans) });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
