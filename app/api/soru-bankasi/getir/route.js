import { sql } from "@/lib/db";

// Bankada yeterince soru birikmisse (ayni ders+sinif+unite icin), AI'a hic
// gitmeden oradan rastgele soru dondurur. Boylece zaman gectikce, AI cagrisi
// sayisi organik olarak azalir - "kendi kendine buyuyen" bir soru havuzu.
export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const ders = params.get("ders");
    const sinif = params.get("sinif");
    const unite = params.get("unite");
    const adet = Math.min(20, Number(params.get("adet")) || 5);
    if (!ders) return Response.json({ sorular: [], yeterliMi: false });

    const sonuc = unite
      ? await sql`
          SELECT id, soru, secenekler, dogru_index, alt_konu, aciklama FROM soru_bankasi
          WHERE ders = ${ders} AND unite = ${unite} AND (sinif = ${sinif ? Number(sinif) : null} OR sinif IS NULL)
          ORDER BY RANDOM() LIMIT ${adet}
        `
      : await sql`
          SELECT id, soru, secenekler, dogru_index, alt_konu, aciklama FROM soru_bankasi
          WHERE ders = ${ders} AND (sinif = ${sinif ? Number(sinif) : null} OR sinif IS NULL)
          ORDER BY RANDOM() LIMIT ${adet}
        `;

    // Havuzda istenen miktarin en az %70'i kadar soru yoksa "yetersiz" say -
    // boylece cok kucuk/tekrar eden bir havuzdan zayif soru seti sunulmaz,
    // sistem otomatik olarak AI uretimine geri doner.
    const yeterliMi = sonuc.length >= Math.ceil(adet * 0.7);

    return Response.json({
      sorular: yeterliMi ? sonuc.map((s) => ({ soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogru_index, altKonu: s.alt_konu, aciklama: s.aciklama })) : [],
      yeterliMi,
      havuzdakiSayi: sonuc.length,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ sorular: [], yeterliMi: false });
  }
}
