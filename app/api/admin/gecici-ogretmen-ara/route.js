import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const sonuc = await sql`SELECT id, konu, onay_durumu, onaylayan_ogretmen_id, onay_tarihi FROM icerik_onbellek WHERE id = 6`;
    return Response.json({ sonuc });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
