// Fotografla soru cozumu - lib/ai.js soyutlamasi + gunluk kullanim limiti ile.
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

export async function POST(req) {
  try {
    const { imageBase64, mediaType, ders, cihazId } = await req.json();
    if (!imageBase64) return Response.json({ error: "Gorsel bulunamadi" }, { status: 400 });
    if (imageBase64.length > 7_000_000) {
      return Response.json({ error: "Gorsel cok buyuk, lutfen daha kucuk bir fotograf yukle" }, { status: 400 });
    }

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile sinirsiz kullanabilirsin.` },
        { status: 429 }
      );
    }

    const talimat = `Bu goreseldeki soruyu coz. ${ders ? `Ders: ${ders}. ` : ""}
Bir LGS ogretmeni gibi davran: kisa, net, ADIM ADIM coz. Her adimi 1 satirda ozetle,
gereksiz uzun aciklama yapma. En sonda "CEVAP: X" seklinde net sonucu yaz.
Eger gorsel bir soru degilse ya da okunamiyorsa bunu acikca belirt. Sadece Turkce yaz.`;

    const cozum = await aiCagir({ prompt: talimat, imageBase64, mediaType, maxTokens: 900 });
    return Response.json({ cozum, kalanHak: Math.max(0, limit.limit - limit.kullanim) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cozum alinamadi" }, { status: 502 });
  }
}
