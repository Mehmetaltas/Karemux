// KAREMUX RAG Seed - soru_bankasi'ndaki gercek soru+aciklama ciftlerini
// embedding'e cevirip bilgi_parcalari tablosuna ekler.
// Calistirma: node --env-file=.env.production.local scripts/rag-seed.js
//
// Gemini embedding API'sinin ucretsiz kotasi sinirli oldugu icin, her
// calistirmada KUCUK bir grup islenir (varsayilan 15). Zaten islenmis
// (ders+unite+alt_konu+soru esleseni) kayitlar atlanir - script guvenle
// TEKRAR TEKRAR calistirilabilir, zamanla bilgi tabani buyur.
const { neon } = require("@neondatabase/serverless");

const PARTI_BOYUTU = Number(process.env.RAG_SEED_BATCH || 15);

async function embeddingUret(metin, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text: metin }] },
        embedContentConfig: { outputDimensionality: 768 },
      }),
    }
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.embedding.values;
}

(async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error("GEMINI_API_KEY tanimli degil."); process.exit(1); }
  if (!process.env.DATABASE_URL) { console.error("DATABASE_URL tanimli degil."); process.exit(1); }

  const sql = neon(process.env.DATABASE_URL);

  const mevcut = await sql`SELECT COUNT(*)::int AS adet FROM bilgi_parcalari`;
  console.log(`Mevcut bilgi parcasi sayisi: ${mevcut[0].adet}`);

  // aciklama sutunu su an dolu degil (bilinen bir veri eksigi) - onun yerine
  // soru + dogru cevabi birlestirip icerik olarak kullaniyoruz, bu da gercek
  // ve anlamli mufredat verisi. Zaten islenmis kayitlari LEFT JOIN ile disla.
  const kayitlar = await sql`
    SELECT sb.ders, sb.sinif, sb.unite, sb.alt_konu, sb.soru, sb.secenekler, sb.dogru_index
    FROM soru_bankasi sb
    LEFT JOIN bilgi_parcalari bp
      ON bp.ders = sb.ders AND bp.icerik LIKE sb.soru || '%'
    WHERE sb.soru IS NOT NULL AND length(sb.soru) > 15 AND bp.id IS NULL
    ORDER BY sb.id ASC
    LIMIT ${PARTI_BOYUTU}
  `;
  console.log(`Bu calistirmada islenecek: ${kayitlar.length} kayit`);

  if (kayitlar.length === 0) {
    console.log("Islenecek yeni kayit yok - soru_bankasi'ndaki her sey zaten indekslenmis olabilir.");
    return;
  }

  let eklenen = 0, hata = 0;
  for (const k of kayitlar) {
    const dogruCevap = Array.isArray(k.secenekler) && k.secenekler[k.dogru_index] ? k.secenekler[k.dogru_index] : null;
    const icerik = dogruCevap ? `${k.soru}\n\nDogru cevap: ${dogruCevap}` : k.soru;
    try {
      const vektor = await embeddingUret(icerik, apiKey);
      const vektorMetni = `[${vektor.join(",")}]`;
      await sql`
        INSERT INTO bilgi_parcalari (ders, sinif, unite, alt_konu, icerik, embedding, kaynak)
        VALUES (${k.ders}, ${k.sinif}, ${k.unite}, ${k.alt_konu}, ${icerik}, ${vektorMetni}::vector, 'soru_bankasi')
      `;
      eklenen++;
      console.log(`  [${eklenen}/${kayitlar.length}] ${k.ders} / ${k.unite || "-"} eklendi`);
    } catch (e) {
      hata++;
      console.error(`  HATA (${k.ders}/${k.unite}): ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 200)); // kota icin kucuk bekleme
  }

  const yeniToplam = await sql`SELECT COUNT(*)::int AS adet FROM bilgi_parcalari`;
  console.log(`\nTAMAMLANDI: ${eklenen} eklendi, ${hata} hata. Toplam bilgi parcasi: ${yeniToplam[0].adet}`);
})();
