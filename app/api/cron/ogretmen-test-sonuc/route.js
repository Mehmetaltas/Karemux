import { sql } from "@/lib/db";

// GitHub Actions'taki test script'i her calisma sonunda sonuclarini buraya
// gonderir. CRON_SECRET ile korunuyor (diger cron'larla ayni desen).
export async function POST(req) {
  try {
    const yetki = req.headers.get("authorization");
    if (yetki !== `Bearer ${process.env.OGRETMEN_TEST_SONUC_ANAHTARI}`) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { sonuclar } = await req.json();
    if (!Array.isArray(sonuclar)) return Response.json({ error: "Gecersiz veri" }, { status: 400 });

    // Onceki calismanin sonuclarini temizle, sadece en son calismayi tut.
    await sql`DELETE FROM ogretmen_test_sonuclari`;
    for (const s of sonuclar) {
      await sql`
        INSERT INTO ogretmen_test_sonuclari (tur, basarili, hata_mesaji)
        VALUES (${s.tur}, ${s.basarili}, ${s.hata || null})
      `;
    }
    return Response.json({ ok: true, kaydedilen: sonuclar.length });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// Admin panelin okumasi icin - sifre yok, salt okuma, hassas veri icermiyor.
export async function GET() {
  const sonuc = await sql`SELECT tur, basarili, hata_mesaji, calisma_zamani FROM ogretmen_test_sonuclari ORDER BY tur`;
  return Response.json({ sonuclar: sonuc });
}
