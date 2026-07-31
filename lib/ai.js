// Tek bir AI sağlayıcısına kilitlenmemek için ince bir soyutlama katmanı.
// Sağlayıcı değiştirmek istediğinde sadece AI_PROVIDER ortam değişkenini
// değiştirmen yeterli — üst kattaki (route) kodların hiçbiri değişmez.
//
// Şu an: Anthropic (Claude)
// Kolayca eklenebilir: OpenAI, açık kaynak modeller (Together.ai, Groq,
// kendi barındırdığın bir model — hepsi benzer bir "messages" formatı kabul eder)

const SAGLAYICI = process.env.AI_PROVIDER || "anthropic";

async function anthropicCagir({ prompt, imageBase64, mediaType, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY tanımlı değil");

  const content = imageBase64
    ? [{ type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } }, { type: "text", text: prompt }]
    : prompt;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: maxTokens || 1000, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) throw new Error(`Anthropic API hatası: ${res.status}`);
  const data = await res.json();
  return data.content.map((b) => b.text || "").join("\n");
}

// ÖRNEK ŞABLON - ileride OpenAI eklemek istersen (şu an aktif değil):
// async function openaiCagir({ prompt, imageBase64, maxTokens }) {
//   const apiKey = process.env.OPENAI_API_KEY;
//   const res = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
//     body: JSON.stringify({ model: "gpt-4o", max_tokens: maxTokens || 1000,
//       messages: [{ role: "user", content: prompt }] }),
//   });
//   const data = await res.json();
//   return data.choices[0].message.content;
// }

export async function aiCagir(parametreler) {
  switch (SAGLAYICI) {
    case "anthropic":
      return anthropicCagir(parametreler);
    // case "openai": return openaiCagir(parametreler);
    default:
      throw new Error(`Bilinmeyen AI_PROVIDER: ${SAGLAYICI}`);
  }
}
