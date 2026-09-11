import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const ham = await sql`
      SELECT
        CASE
          WHEN k.eposta LIKE '%mehmetaltas%' OR k.eposta LIKE '%karemuxegitim%' THEN 'kendim'
          WHEN k.eposta LIKE '%@anon.karemux.com%' THEN 'anonim'
          WHEN EXISTS (SELECT 1 FROM abonelikler a WHERE a.kullanici_id = k.id AND a.durum = 'aktif') THEN 'ucretli'
          ELSE 'ucretsiz'
        END AS kategori,
        COUNT(DISTINCT g.kullanici_id)::int AS kullaniciSayisi,
        SUM(g.ai_istek_sayisi)::int AS toplamIstek
      FROM gunluk_kullanim g
      JOIN kullanicilar k ON k.id = g.kullanici_id
      WHERE g.tarih >= date_trunc('month', CURRENT_DATE)
      GROUP BY kategori
    `;
    return Response.json({ ham, satirSayisi: ham.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
