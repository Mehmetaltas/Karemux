import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const sonuc = await sql`
      SELECT
        tc.table_name AS tablo,
        kcu.column_name AS sutun
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'kullanicilar'
      ORDER BY tc.table_name
    `;
    return Response.json({ toplam: sonuc.length, fkler: sonuc });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
