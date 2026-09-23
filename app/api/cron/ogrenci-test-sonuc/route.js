import { sql } from "@/lib/db";

// Ogretmen testinin (ogretmen-test-sonuc) AYNI deseni, ogrenci taraf akislari
// icin (23 Eylul). CRON_SECRET'a benzer ayri bir anahtarla korunuyor.
export async function POST(req) {
  try {
    const yetki = req.headers.get("authorization");
    if (yetki !== `Bearer ${process.env.OGRENCI_TEST_SONUC_ANAHTARI}`) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { sonuclar } = await req.json();
    if (!Array.isArray(sonuclar)) return Response.json({ error: "Gecersiz veri" }, { status: 400 });

    await sql`DELETE FROM ogrenci_test_sonuclari`;
    for (const s of sonuclar) {
      await sql`
        INSERT INTO ogrenci_test_sonuclari (tur, basarili, hata_mesaji)
        VALUES (${s.tur}, ${s.basarili}, ${s.hata || null})
      `;
    }
    return Response.json({ ok: true, kaydedilen: sonuclar.length });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const sonuc = await sql`SELECT tur, basarili, hata_mesaji, calisma_zamani FROM ogrenci_test_sonuclari ORDER BY tur`;
  return Response.json({ sonuclar: sonuc });
}
