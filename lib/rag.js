// KAREMUX RAG (Retrieval-Augmented Generation) altyapisi.
// Gemini'nin embedding modelini kullanarak metinleri vektore cevirir,
// Neon'daki pgvector ile en yakin/ilgili bilgi parcalarini bulur.
import { sql } from "@/lib/db";

export async function embeddingUret(metin) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY tanimli degil");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: metin }] } }),
    }
  );
  if (!res.ok) {
    const hata = await res.text();
    throw new Error(`Embedding uretilemedi: ${res.status} ${hata}`);
  }
  const data = await res.json();
  return data.embedding.values;
}

// Bir sorgu/konu icin en ilgili bilgi parcalarini bulur. Basarisiz olursa
// (kota, ag hatasi vb.) bos dizi doner - RAG bir "ekstra guvenlik/destek
// katmani", basarisizligi ana konu anlatimi akisini ASLA bloklamamali.
export async function ilgiliBilgiParcalariniGetir(sorgu, ders, limit = 3) {
  try {
    const vektor = await embeddingUret(sorgu);
    const vektorMetni = `[${vektor.join(",")}]`;
    const sonuc = await sql`
      SELECT icerik, ders, unite, alt_konu, 1 - (embedding <=> ${vektorMetni}::vector) AS benzerlik
      FROM bilgi_parcalari
      WHERE ders = ${ders}
      ORDER BY embedding <=> ${vektorMetni}::vector
      LIMIT ${limit}
    `;
    return sonuc.filter((r) => Number(r.benzerlik) > 0.55);
  } catch (e) {
    console.error("RAG getirme hatasi:", e.message);
    return [];
  }
}
