import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

export async function POST(req) {
  try {
    const { prompt, maxTokens, cihazId, jsonModu } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 4000) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile sinirsiz kullanabilirsin.` },
        { status: 429 }
      );
    }

    const metin = await aiCagir({ prompt, maxTokens, jsonModu });
    return Response.json({ text: metin, kalanHak: Math.max(0, limit.limit - limit.kullanim) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AI servisi yanit vermedi: " + e.message }, { status: 502 });
  }
}
