// Tek bir AI saglayicisina kilitlenmemek icin ince bir soyutlama katmani.
const SAGLAYICI = process.env.AI_PROVIDER || "anthropic";

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

export async function aiCagir(parametreler) {
  switch (SAGLAYICI) {
    case "anthropic":
      return anthropicCagir(parametreler);
    default:
      throw new Error(`Bilinmeyen AI_PROVIDER: ${SAGLAYICI}`);
  }
}
