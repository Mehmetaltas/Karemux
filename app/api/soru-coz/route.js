// Fotoğrafla soru çözümü — lib/ai.js soyutlaması + günlük kullanım limiti ile.
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

export async function POST(req) {
  try {
    const { imageBase64, mediaType, ders, cihazId } = await req.json();
    if (!imageBase64) return Response.json({ error: "Görsel bulunamadı" }, { status: 400 });
    if (imageBase64.length > 7_000_000) {
      return Response.json({ error: "Görsel çok büyük, lütfen daha küçük bir fotoğraf yükle" }, { status: 400 });
    }

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: `Günlük ücretsiz kullanım hakkın doldu (${limit.limit}/gün). Premium ile sınırsız kullanabilirsin.` },
        { status: 429 }
      );
    }

    const talimat = `Bu görseldeki soruyu çöz. ${ders ? `Ders: ${ders}. ` : ""}
Bir LGS öğretmeni gibi davran: kısa, net, ADIM ADIM çöz. Her adımı 1 satırda özetle,
gereksiz uzun akademik açıklama yapma. En sonda "CEVAP: X" şeklinde net sonucu yaz.
E�er görsel bir soru değilse ya da okunamıyorsa bunu açıkça belirt. Sadece Türkçe yaz.`;

    const cozum = await aiCagir({ prompt: talimat, imageBase64, mediaType, maxTokens: 900 });
    return Response.json({ cozum, kalanHak: Math.max(0, limit.limit - limit.kullanim) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Çözüm alınamadı" }, { status: 502 });
  }
}
