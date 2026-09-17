import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const hepsi = await sql`SELECT id, ders, sinif, konu, icerik_json->'kaliteKontrol' AS kk FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi'`;
    return Response.json({ toplam: hepsi.length, kayitlar: hepsi });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
