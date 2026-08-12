// Vercel Cron her ayin 1'i saat 06:00'da (Turkiye saati) bu route'u tetikler.
// "tekrarlayan=true" isaretlenmis her gideri (muhasebe, bagkur gibi sabit
// aylik kalemler), o ayin taban tarihiyle YENIDEN ekler - boylece yonetici
// her ay elle tekrar girmek zorunda kalmaz, sistem kendi kendine takip eder.
import { sql } from "@/lib/db";

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    // Bu ay icin zaten eklenmis mi diye kontrol edip mukerrer eklemeyi onluyoruz:
    // ayni kategori+tutar+aciklama ile bu ay icinde baska kayit var mi bakariz.
    const tekrarlayanlar = await sql`
      SELECT DISTINCT ON (kategori, tutar_tl, aciklama) kategori, tutar_tl, aciklama
      FROM giderler WHERE tekrarlayan = true
      ORDER BY kategori, tutar_tl, aciklama, tarih DESC
    `;

    let eklenen = 0;
    for (const g of tekrarlayanlar) {
      const buAyVarMi = await sql`
        SELECT id FROM giderler
        WHERE kategori = ${g.kategori} AND tutar_tl = ${g.tutar_tl}
          AND (aciklama = ${g.aciklama} OR (aciklama IS NULL AND ${g.aciklama} IS NULL))
          AND tarih >= date_trunc('month', CURRENT_DATE)
      `;
      if (buAyVarMi.length > 0) continue; // bu ay icin zaten var, tekrar ekleme

      await sql`
        INSERT INTO giderler (kategori, tutar_tl, aciklama, tarih, tekrarlayan)
        VALUES (${g.kategori}, ${g.tutar_tl}, ${g.aciklama}, CURRENT_DATE, true)
      `;
      eklenen++;
    }

    return Response.json({ ok: true, eklenen, toplamTekrarlayanTur: tekrarlayanlar.length });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
