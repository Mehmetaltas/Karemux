import { sql } from "@/lib/db";

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const basvurular = await sql`
    SELECT id, ad, eposta, telefon, basvuru_turu, departman, deneyim_yili, egitim_seviyesi, egitim_alani, portfolyo_url, ozgecmis_metni, basvuru_tarihi
    FROM kariyer_basvurulari ORDER BY basvuru_tarihi DESC
  `;
  return Response.json({ basvurular });
}
