// Coklu AI saglayici katmani. Sira: Gemini (ucretsiz) -> Groq (ucretsiz) -> Anthropic (ucretli).
// Bir saglayici basarisiz olursa otomatik olarak siradakine gecilir.
const SIRA = (process.env.AI_PROVIDER_ORDER || "gemini,groq,anthropic")
  .split(",").map((s) => s.trim()).filter(Boolean);

async function geminiCagir({ prompt, imageBase64, mediaType, maxTokens }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY tanimli degil");

  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.unshift({ inline_data: { mime_type: mediaType || "image/jpeg", data: imageBase64 } });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: maxTokens || 1000 },
      }),
    }
  );
  if (!res.ok) {
    const detay = await res.text();
    throw new Error(`Gemini API hatasi: ${res.status} - ${detay}`);
  }
  const data = await res.json();
  const metin = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n");
  if (!metin) throw new Error("Gemini bos yanit dondurdu");
  return metin;
}

async function groqCagir({ prompt, imageBase64, maxTokens }) {
  if (imageBase64) throw new Error("Groq gorsel destegi yok, atlaniyor");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY tanimli degil");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: maxTokens || 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const detay = await res.text();
    throw new Error(`Groq API hatasi: ${res.status} - ${detay}`);
  }
  const data = await res.json();
  const metin = data.choices?.[0]?.message?.content;
  if (!metin) throw new Error("Groq bos yanit dondurdu");
  return metin;
}

async function anthropicCagir({ prompt, imageBase64, mediaType, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY tanimli degil");

  const content = imageBase64
    ? [{ type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } }, { type: "text", text: prompt }]
    : prompt;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: maxTokens || 1000, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) {
    const detay = await res.text();
    throw new Error(`Anthropic API hatasi: ${res.status} - ${detay}`);
  }
  const data = await res.json();
  return data.content.map((b) => b.text || "").join("\n");
}

const SAGLAYICILAR = { gemini: geminiCagir, groq: groqCagir, anthropic: anthropicCagir };

export async function aiCagir(parametreler) {
  const hatalar = [];
  for (const ad of SIRA) {
    const fonksiyon = SAGLAYICILAR[ad];
    if (!fonksiyon) continue;
    try {
      return await fonksiyon(parametreler);
    } catch (e) {
      console.error(`[${ad}] basarisiz, siradaki saglayiciya geciliyor:`, e.message);
      hatalar.push(`${ad}: ${e.message}`);
    }
  }
  throw new Error("Tum AI saglayicilari basarisiz oldu -> " + hatalar.join(" | "));
}
