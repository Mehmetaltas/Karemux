import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const sonuc = await sql`SELECT id, icerik_json, kalite_kontrol FROM ders_plani ORDER BY id DESC LIMIT 1`;
  return Response.json(sonuc[0] || {});
}
