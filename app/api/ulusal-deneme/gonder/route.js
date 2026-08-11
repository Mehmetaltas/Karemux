import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { ulusalDenemeId, cevaplar, cihazId } = await req.json(); // cevaplar: {soruIndex: secenekIndex}
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const deneme = await sql`SELECT sorular, kapanis FROM ulusal_denemeler WHERE id = ${ulusalDenemeId}`;
    if (deneme.length === 0) return Response.json({ error: "Deneme bulunamadi" }, { status: 404 });
    if (new Date(deneme[0].kapanis) < new Date()) return Response.json({ error: "Bu denemenin suresi doldu" }, { status: 400 });

    const zaten = await sql`SELECT id FROM ulusal_deneme_sonuclari WHERE ulusal_deneme_id = ${ulusalDenemeId} AND kullanici_id = ${kullaniciId}`;
    if (zaten.length > 0) return Response.json({ error: "Bu denemeyi zaten cozdun" }, { status: 400 });

    const sorular = deneme[0].sorular;
    let dogru = 0, yanlis = 0, bos = 0;
    sorular.forEach((s, i) => {
      const verilen = cevaplar[i];
      if (verilen === undefined || verilen === null) bos++;
      else if (verilen === s.dogruIndex) dogru++;
      else yanlis++;
    });
    const net = Math.max(0, dogru - yanlis / 3); // LGS/bursluluk resmi net formulu

    const kullanici = await sql`SELECT kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    await sql`
      INSERT INTO ulusal_deneme_sonuclari (ulusal_deneme_id, kullanici_id, kurum_id, dogru, yanlis, bos, net)
      VALUES (${ulusalDenemeId}, ${kullaniciId}, ${kullanici[0]?.kurum_id || null}, ${dogru}, ${yanlis}, ${bos}, ${net})
    `;

    // Cevap anahtarini (aciklamalarla) simdi geri gonderiyoruz - sinav bitti, gorulebilir.
    const cevapAnahtari = sorular.map((s) => ({ dogruIndex: s.dogruIndex, aciklama: s.aciklama }));

    const siralamaVeri = await sql`
      SELECT net FROM ulusal_deneme_sonuclari WHERE ulusal_deneme_id = ${ulusalDenemeId} ORDER BY net DESC
    `;
    const toplamKatilimci = siralamaVeri.length;
    const siram = siralamaVeri.findIndex((r) => Number(r.net) <= net) + 1;
    const yuzdelikDilim = toplamKatilimci > 0 ? Math.round((1 - siram / toplamKatilimci) * 100) : null;

    return Response.json({ dogru, yanlis, bos, net, cevapAnahtari, siram, toplamKatilimci, yuzdelikDilim });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Gonderilemedi: " + e.message }, { status: 500 });
  }
}
