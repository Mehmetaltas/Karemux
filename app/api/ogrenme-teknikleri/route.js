import { sql } from "@/lib/db";

// Ogrenme Teknikleri Kutuphanesi (31 Agustos) - dersin "nasil calisilmasi
// gerektigini" ogreten kurate edilmis pedagojik teknikler. Herkese acik,
// kisisel veri icermiyor.
export async function GET(req) {
  try {
    const ders = new URL(req.url).searchParams.get("ders");
    if (!ders) return Response.json({ error: "ders parametresi gerekli" }, { status: 400 });

    const teknikler = await sql`
      SELECT teknik_adi, aciklama, nasil_uygulanir
      FROM ogrenme_teknikleri
      WHERE ders = ${ders}
      ORDER BY sira ASC
    `;
    return Response.json({ teknikler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
