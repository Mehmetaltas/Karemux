import { sql } from "@/lib/db";

// Uretilen her soru burada birikir. Zamanla bu tablo, disaridan AI'a hic
// ihtiyac duymadan kullanilabilecek gercek bir soru bankasina donusur.
// NOT: Bu route herkese acik ve kimlik dogrulama gerektirmiyor cunku
// sadece "uretilen icerigi arsivliyoruz", kisisel veri icermiyor.

export async function POST(req) {
  try {
    const { ders, sinif, unite, sorular, kaynakTuru } = await req.json();
    if (!ders || !Array.isArray(sorular) || sorular.length === 0) {
      return Response.json({ error: "Eksik veri" }, { status: 400 });
    }

    let kaydedilen = 0;
    for (const s of sorular) {
      if (!s.soru || !Array.isArray(s.secenekler) || s.dogruIndex == null) continue;
      try {
        await sql`
          INSERT INTO soru_bankasi (ders, sinif, unite, alt_konu, zorluk, soru, secenekler, dogru_index, kaynak_turu, aciklama)
          VALUES (${ders}, ${sinif || null}, ${unite || null}, ${s.altKonu || null}, ${s.zorluk || null}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, ${kaynakTuru || null}, ${s.aciklama || null})
        `;
        kaydedilen++;
      } catch (e) {
        console.error("Soru bankasina kayit hatasi:", e);
      }
    }

    return Response.json({ ok: true, kaydedilen });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const sonuc = await sql`
      SELECT ders, COUNT(*)::int AS adet
      FROM soru_bankasi
      GROUP BY ders
      ORDER BY adet DESC
    `;
    const toplam = sonuc.reduce((t, r) => t + r.adet, 0);
    return Response.json({ dersBazinda: sonuc, toplam });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
