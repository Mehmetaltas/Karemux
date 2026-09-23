import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
export const dynamic = "force-dynamic";
export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const sonuc = await sql`DELETE FROM soru_bankasi WHERE ders = 'Ingilizce' AND kaynak_turu = 'ogretmen_brans_denemesi' RETURNING id`;
  return Response.json({ silinen: sonuc.length });
}
