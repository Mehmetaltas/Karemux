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

    const oturumSonuc = await sql`
      SELECT id, ders, konu, sorular, durum FROM tek_konu_oturumu
      WHERE id = ${oturumId} AND kullanici_id = ${kullaniciId}
    `;
    if (oturumSonuc.length === 0) return Response.json({ error: "Oturum bulunamadi" }, { status: 404 });
    const oturum = oturumSonuc[0];
    if (oturum.durum === "tamamlandi") return Response.json({ error: "Bu oturum zaten tamamlanmis" }, { status: 400 });

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

    await sql`
      UPDATE tek_konu_oturumu SET cevaplar = ${JSON.stringify(cevaplar)}, durum = 'tamamlandi', net = ${net}, tamamlanma = now()
      WHERE id = ${oturumId}
    `;

    await sql`
      INSERT INTO konu_hakimiyet (kullanici_id, ders, konu, net, hakimiyet_seviyesi, oturum_id)
      VALUES (${kullaniciId}, ${oturum.ders}, ${oturum.konu}, ${netYuzon}, ${hakimiyetSeviyesi}, ${oturumId})
    `;

    return Response.json({
      ok: true,
      dogru, yanlis, bos, net,
      hakimiyetSeviyesi,
      sorular: sorular.map((s) => ({ dogruIndex: s.dogruIndex })),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Tamamlanamadi" }, { status: 500 });
  }
}
