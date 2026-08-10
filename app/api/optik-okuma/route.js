// Optik Okuma - kagida isaretlenmis (A/B/C/D) cevaplarin fotografini okuyup
// dijital cevap dizisine cevirir. Mevcut soru-coz gorsel-okuma altyapisini
// (lib/ai.js aiCagir + gunluk limit) aynen kullanir, sadece talimati farklidir.
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

export async function POST(req) {
  try {
    const { imageBase64, mediaType, soruSayisi, cihazId } = await req.json();
    if (!imageBase64) return Response.json({ error: "Gorsel bulunamadi" }, { status: 400 });
    if (!soruSayisi || soruSayisi < 1) return Response.json({ error: "Soru sayisi belirtilmedi" }, { status: 400 });
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

    const talimat = `Bu goreseldeki cevap kagidinda (optik form ya da elle yazilmis "1-A 2-C..." tarzi bir liste
olabilir) toplam ${soruSayisi} soru icin isaretlenen/yazilan sikki (A, B, C veya D) oku.
Her soru numarasi icin hangi sik isaretlenmisse onu belirle. Eger bir soru bos birakilmissa
ya da birden fazla sik isaretlenmisse o soru icin null yaz. SADECE su JSON formatinda don,
baska hicbir aciklama ekleme, markdown kullanma:
{"cevaplar":["A","C",null,"B", ...]}
Dizi TAM OLARAK ${soruSayisi} eleman icermeli, sirali olmali (1. sorudan baslayarak).`;

    const cevap = await aiCagir({ prompt: talimat, imageBase64, mediaType, maxTokens: 1000, jsonModu: true });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const baslangic = temiz.indexOf("{");
    const bitis = temiz.lastIndexOf("}");
    if (baslangic === -1 || bitis === -1) throw new Error("Cevap kagidi okunamadi, daha net bir fotograf dene");
    const veri = JSON.parse(temiz.slice(baslangic, bitis + 1));
    if (!Array.isArray(veri.cevaplar)) throw new Error("Cevap kagidi okunamadi, daha net bir fotograf dene");

    return Response.json({ cevaplar: veri.cevaplar, kalanHak: Math.max(0, limit.limit - limit.kullanim) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Optik okuma basarisiz: " + e.message }, { status: 502 });
  }
}
