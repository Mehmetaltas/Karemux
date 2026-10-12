import { denemeOlustur } from "@/lib/ulusalDenemeOlustur";
import { sql } from "@/lib/db";

// GECICI TEST ROUTE - Faz D adim 1 canli kanit (#3 denemeOlustur).
// Kendi tek-seferlik anahtariyla calisir, gercek admin sifresini gerektirmez.
// Test bitince bu dosya SILINECEK.
export async function POST(req) {
  try {
    const { anahtar } = await req.json();
    if (anahtar !== "karemux-gecici-12ekim-fazD-ulusaldeneme-test") {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const sonuc = await denemeOlustur({
      ad: "GECICI-TEST-FazD-" + Date.now(),
      sinif: 8,
      ders: "Matematik",
      soruSayisi: 5,
      acikKalmaSaati: 1,
      kapsam: "ulusal",
    });

    const kayit = await sql`SELECT sorular FROM ulusal_denemeler WHERE id = ${sonuc.id}`;
    return Response.json({ sonuc, sorularOrnek: kayit[0].sorular.slice(0, 2) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
