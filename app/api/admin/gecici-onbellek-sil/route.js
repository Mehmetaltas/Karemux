import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const silinen = await sql`
      DELETE FROM icerik_onbellek
      WHERE icerik_turu = 'tek_konu_anlatimi' AND ders = 'Turkce' AND konu LIKE '%Fiil%'
      RETURNING id, konu
    `;
    return Response.json({ ok: true, silinenSayisi: silinen.length, silinenler: silinen });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
