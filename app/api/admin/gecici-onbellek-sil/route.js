import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const hepsi = await sql`SELECT id, ders, konu, icerik_turu FROM icerik_onbellek WHERE icerik_turu = 'tek_konu_anlatimi' ORDER BY id DESC LIMIT 20`;
    return Response.json({ toplam: hepsi.length, kayitlar: hepsi });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
