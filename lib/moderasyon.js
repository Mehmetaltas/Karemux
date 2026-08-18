import { aiCagir } from "@/lib/ai";

// Cocuk guvenligi icin hafif icerik moderasyonu (Faz 8). Kullanicinin
// serbest metnini AI'a gondermeden ONCE kontrol eder - kufur/cinsel
// icerik/siddet/kendine zarar verme gibi uygunsuz konular icerirse engeller.
// NOT: Denetim AI cagrisi basarisiz olursa fail-open (izin verir) - ekstra
// bir guvenlik katmani, ana akisi TAMAMEN durdurmamali.
export async function moderasyonKontrolEt(metin) {
  if (!metin || metin.trim().length < 2) return { uygunMu: true };
  try {
    const p = `Sen bir icerik moderasyon sistemisin. Bu, ortaokul ogrencilerinin kullandigi bir egitim uygulamasi. Asagidaki mesaji incele: kufur, cinsel icerik, siddet, kendine zarar verme veya egitimle tamamen alakasiz/uygunsuz bir konu iceriyorsa "uygunsuz" isaretle. Normal bir soru/mesajsa "uygun" isaretle. SADECE JSON dondur: {"uygunMu":true} veya {"uygunMu":false,"sebep":"kisa aciklama, en fazla 10 kelime"}

MESAJ: "${metin.slice(0, 500)}"`;
    const cevap = await aiCagir({ prompt: p, maxTokens: 150, jsonModu: true });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const veri = JSON.parse(temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1));
    return { uygunMu: veri.uygunMu !== false, sebep: veri.sebep };
  } catch (e) {
    console.error("Moderasyon kontrolu basarisiz, varsayilan olarak izin veriliyor:", e.message);
    return { uygunMu: true };
  }
}
