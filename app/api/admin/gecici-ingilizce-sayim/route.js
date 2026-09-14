import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const sonuc = await sql`
      SELECT kaynak_turu, COUNT(*)::int AS toplam,
        COUNT(*) FILTER (WHERE zorluk IS NOT NULL)::int AS zorluk_etiketli
      FROM soru_bankasi WHERE ders = 'Ingilizce'
      GROUP BY kaynak_turu ORDER BY toplam DESC
    `;
    const genelToplam = await sql`SELECT COUNT(*)::int AS adet FROM soru_bankasi WHERE ders = 'Ingilizce'`;
    return Response.json({ genelToplam: genelToplam[0].adet, kaynakBazinda: sonuc });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
