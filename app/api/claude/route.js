// Bu route AI sağlayıcısını lib/ai.js üzerinden çağırır — tek bir firmaya
// kilitlenmemek için. API anahtarı hiçbir zaman tarayıcıya gönderilmez.
// Günlük kullanım limiti ile korunur (bkz. lib/ratelimit.js).
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

export async function POST(req) {
  try {
    const { prompt, maxTokens, cihazId } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 4000) {
      return Response.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: `Günlük ücretsiz kullanım hakkın doldu (${limit.limit}/gün). Premium ile sınırsız kullanabilirsin.` },
        { status: 429 }
      );
    }

    const metin = await aiCagir({ prompt, maxTokens });
    return Response.json({ text: metin, kalanHak: Math.max(0, limit.limit - limit.kullanim) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AI servisi yanıt vermedi" }, { status: 502 });
  }
}
