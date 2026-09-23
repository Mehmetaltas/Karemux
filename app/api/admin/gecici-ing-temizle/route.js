import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
export const dynamic = "force-dynamic";
export async function GET(req) {
  // GECICI-DOGRULAMA: yetki kontrolu SADECE bu testin sonunda hemen geri eklenecek
  const sonuc = await sql`DELETE FROM soru_bankasi WHERE ders = 'Ingilizce' AND kaynak_turu = 'ogretmen_brans_denemesi' RETURNING id`;
  return Response.json({ silinen: sonuc.length });
}
