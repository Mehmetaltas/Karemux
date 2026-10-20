import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, oturumId, cevaplar } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    if (!oturumId || !cevaplar || typeof cevaplar !== "object") {
      return Response.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // Atomik tek kullanim: ikinci gonderim ve baskasinin oturumu reddedilir (cift konu_hakimiyet satiri olusmaz).
    const oturumSonuc = await sql`
      UPDATE tek_konu_oturumu SET durum = 'tamamlandi', tamamlanma = now()
      WHERE id = ${oturumId} AND kullanici_id = ${kullaniciId} AND durum = 'devam_ediyor'
      RETURNING id, ders, konu, sorular
    `;
    if (oturumSonuc.length === 0) return Response.json({ error: "Oturum bulunamadi veya zaten tamamlanmis" }, { status: 400 });
    const oturum = oturumSonuc[0];

    const sorular = oturum.sorular;
    let dogru = 0, yanlis = 0, bos = 0;
    sorular.forEach((s, i) => {
      const cevap = cevaplar[i];
      if (cevap === undefined || cevap === null) bos++;
      else if (Number(cevap) === Number(s.dogruIndex)) dogru++;
      else yanlis++;
    });
    const net = Math.max(0, dogru - yanlis / 4);
    const netYuzon = (net / sorular.length) * 10;

    let hakimiyetSeviyesi;
    if (netYuzon >= 8) hakimiyetSeviyesi = "hakim";
    else if (netYuzon >= 5) hakimiyetSeviyesi = "gelisiyor";
    else hakimiyetSeviyesi = "baslangic";

    try {
      await sql`
        UPDATE tek_konu_oturumu SET cevaplar = ${JSON.stringify(cevaplar)}, net = ${net}
        WHERE id = ${oturumId}
      `;

      await sql`
        INSERT INTO konu_hakimiyet (kullanici_id, ders, konu, net, hakimiyet_seviyesi, oturum_id)
        VALUES (${kullaniciId}, ${oturum.ders}, ${oturum.konu}, ${netYuzon}, ${hakimiyetSeviyesi}, ${oturumId})
      `;
    } catch (yazimHatasi) {
      // Sonuc yazilamadiysa oturumu geri ac ki ogrenci tekrar gonderebilsin.
      try { await sql`UPDATE tek_konu_oturumu SET durum = 'devam_ediyor', tamamlanma = NULL WHERE id = ${oturumId} AND kullanici_id = ${kullaniciId}`; } catch (e2) { console.error("Oturum geri acilamadi:", e2.message); }
      throw yazimHatasi;
    }

    return Response.json({
      ok: true,
      dogru, yanlis, bos, net,
      hakimiyetSeviyesi,
      sorular: sorular.map((s) => ({ soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogruIndex, aciklama: s.aciklama || null })), // 22 Eylul: yanlislari gosterme ozelligi icin genisletildi
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Tamamlanamadi" }, { status: 500 });
  }
}
