import { denemeOlustur } from "@/lib/ulusalDenemeOlustur";
import { sql } from "@/lib/db";

// GECICI: Faz D jsonAyikla canli dogrulama.
// Kendi olusturdugu kaydi siler. Test sonrasi route kaldirilacak.
export async function POST(req) {
  try {
    const { anahtar } = await req.json();
    if (anahtar !== "karemux-gecici-12ekim-fazD-json-test") {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const sonuc = await denemeOlustur({
      ad: "GECICI-TEST-FazD-json-" + Date.now(),
      sinif: 8,
      ders: "Matematik",
      soruSayisi: 5,
      acikKalmaSaati: 1,
      kapsam: "ulusal",
    });
    const kayit = await sql`
      SELECT sorular FROM ulusal_denemeler WHERE id = ${sonuc.id}
    `;
    const ornek = kayit[0].sorular.slice(0, 2);
    const alanlar = Object.keys(kayit[0].sorular[0]).sort();
    const silinen = await sql`
      DELETE FROM ulusal_denemeler
      WHERE id = ${sonuc.id} AND ad LIKE 'GECICI-TEST-FazD-json-%'
      RETURNING id
    `;
    return Response.json({
      sonuc, alanlar, ornek, silinenKayit: silinen.length,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
