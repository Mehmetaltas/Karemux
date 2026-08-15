import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { ulusalDenemeId, cevaplar, cihazId } = await req.json(); // cevaplar: {soruIndex: secenekIndex}
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const deneme = await sql`SELECT sorular, kapanis, ders FROM ulusal_denemeler WHERE id = ${ulusalDenemeId}`;
    if (deneme.length === 0) return Response.json({ error: "Deneme bulunamadi" }, { status: 404 });
    if (new Date(deneme[0].kapanis) < new Date()) return Response.json({ error: "Bu denemenin suresi doldu" }, { status: 400 });

    const zaten = await sql`SELECT id FROM ulusal_deneme_sonuclari WHERE ulusal_deneme_id = ${ulusalDenemeId} AND kullanici_id = ${kullaniciId}`;
    if (zaten.length > 0) return Response.json({ error: "Bu denemeyi zaten cozdun" }, { status: 400 });

    const ders = deneme[0].ders;
    const sorular = deneme[0].sorular;
    let dogru = 0, yanlis = 0, bos = 0;
    const altKonuOzet = {};
    for (let i = 0; i < sorular.length; i++) {
      const s = sorular[i];
      const verilen = cevaplar[i];
      const altKonu = s.altKonu || "Genel";
      if (!altKonuOzet[altKonu]) altKonuOzet[altKonu] = { dogru: 0, yanlis: 0, bos: 0 };
      if (verilen === undefined || verilen === null) {
        bos++; altKonuOzet[altKonu].bos++;
      } else if (verilen === s.dogruIndex) {
        dogru++; altKonuOzet[altKonu].dogru++;
      } else {
        yanlis++; altKonuOzet[altKonu].yanlis++;
        try {
          await sql`
            INSERT INTO hata_kitapcigi (kullanici_id, ders, alt_konu, soru, secenekler, dogru_index, verilen_index, aciklama)
            VALUES (${kullaniciId}, ${ders}, ${altKonu}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, ${verilen}, ${s.aciklama || null})
          `;
        } catch (e) { /* hata kitapcigina yazilamazsa sonucu engelleme */ }
      }
    }
    const net = Math.max(0, dogru - yanlis / 3); // LGS/bursluluk resmi net formulu

    const kullanici = await sql`SELECT kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    await sql`
      INSERT INTO ulusal_deneme_sonuclari (ulusal_deneme_id, kullanici_id, kurum_id, dogru, yanlis, bos, net)
      VALUES (${ulusalDenemeId}, ${kullaniciId}, ${kullanici[0]?.kurum_id || null}, ${dogru}, ${yanlis}, ${bos}, ${net})
    `;

    const karne = Object.keys(altKonuOzet).map((k) => ({ altKonu: k, ...altKonuOzet[k] }));

    // Cevap anahtarini (aciklamalarla) simdi geri gonderiyoruz - sinav bitti, gorulebilir.
    const cevapAnahtari = sorular.map((s) => ({ dogruIndex: s.dogruIndex, aciklama: s.aciklama }));

    const siralamaVeri = await sql`
      SELECT net FROM ulusal_deneme_sonuclari WHERE ulusal_deneme_id = ${ulusalDenemeId} ORDER BY net DESC
    `;
    const toplamKatilimci = siralamaVeri.length;
    const siram = siralamaVeri.findIndex((r) => Number(r.net) <= net) + 1;
    const yuzdelikDilim = toplamKatilimci > 0 ? Math.round((1 - siram / toplamKatilimci) * 100) : null;

    return Response.json({ dogru, yanlis, bos, net, karne, cevapAnahtari, siram, toplamKatilimci, yuzdelikDilim });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Gonderilemedi: " + e.message }, { status: 500 });
  }
}
