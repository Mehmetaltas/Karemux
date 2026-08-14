import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Cevaplanan sorulari degerlendirir. Yanlis cevaplanan HER unite icin,
// seviye_tespit_kademe tablosunda kademe=1 (tamamlanmamis) bir satir acar -
// boylece "3 kademeli tamamlama" sureci baslamis olur.
export async function POST(req) {
  try {
    const { cihazId, sonuclar } = await req.json();
    // sonuclar: [{ders, unite, sinif, dogruMu}, ...]
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });
    if (!Array.isArray(sonuclar) || sonuclar.length === 0) {
      return Response.json({ error: "Sonuç listesi gerekli" }, { status: 400 });
    }

    const dogruSayisi = sonuclar.filter((s) => s.dogruMu).length;
    const zayifOlanlar = sonuclar.filter((s) => !s.dogruMu);

    for (const z of zayifOlanlar) {
      await sql`
        INSERT INTO seviye_tespit_kademe (kullanici_id, ders, unite, kaynak_sinif, kademe, tamamlandi)
        VALUES (${kullaniciId}, ${z.ders}, ${z.unite}, ${z.sinif}, 1, false)
        ON CONFLICT (kullanici_id, ders, unite, kaynak_sinif) DO NOTHING
      `;
    }

    await sql`
      INSERT INTO seviye_tespit_sonuc (kullanici_id, toplam_soru, dogru_sayisi, zayif_unite_sayisi)
      VALUES (${kullaniciId}, ${sonuclar.length}, ${dogruSayisi}, ${zayifOlanlar.length})
    `;

    return Response.json({ ok: true, dogruSayisi, toplam: sonuclar.length, zayifUniteSayisi: zayifOlanlar.length });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
