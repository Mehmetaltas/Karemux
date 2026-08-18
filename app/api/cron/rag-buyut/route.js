import { sql } from "@/lib/db";
import { embeddingUret } from "@/lib/rag";

// Her gece, soru_bankasi'ndan islenmemis 15 kaydi RAG bilgi tabanina
// (bilgi_parcalari) ekler. Kota-dostu, kucuk gruplar halinde - tamami
// (291 kayit) yaklasik 20 gunde tamamlanir, ek islem gerekmez.
const PARTI_BOYUTU = 15;

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const kayitlar = await sql`
      SELECT sb.ders, sb.sinif, sb.unite, sb.alt_konu, sb.soru, sb.secenekler, sb.dogru_index
      FROM soru_bankasi sb
      LEFT JOIN bilgi_parcalari bp
        ON bp.ders = sb.ders AND bp.icerik LIKE sb.soru || '%'
      WHERE sb.soru IS NOT NULL AND length(sb.soru) > 15 AND bp.id IS NULL
      ORDER BY sb.id ASC
      LIMIT ${PARTI_BOYUTU}
    `;

    let eklenen = 0, hata = 0;
    for (const k of kayitlar) {
      const dogruCevap = Array.isArray(k.secenekler) && k.secenekler[k.dogru_index] ? k.secenekler[k.dogru_index] : null;
      const icerik = dogruCevap ? `${k.soru}\n\nDogru cevap: ${dogruCevap}` : k.soru;
      try {
        const vektor = await embeddingUret(icerik);
        const vektorMetni = `[${vektor.join(",")}]`;
        await sql`
          INSERT INTO bilgi_parcalari (ders, sinif, unite, alt_konu, icerik, embedding, kaynak)
          VALUES (${k.ders}, ${k.sinif}, ${k.unite}, ${k.alt_konu}, ${icerik}, ${vektorMetni}::vector, 'soru_bankasi')
        `;
        eklenen++;
      } catch (e) {
        hata++;
        console.error(`RAG buyutme hatasi (${k.ders}/${k.unite}):`, e.message);
      }
    }

    return Response.json({ ok: true, eklenen, hata, dahaVarMi: kayitlar.length === PARTI_BOYUTU });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
