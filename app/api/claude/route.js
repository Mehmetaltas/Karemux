import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { ilgiliBilgiParcalariniGetir } from "@/lib/rag";
import { kullaniciIdCoz } from "@/lib/kullanici";

export const maxDuration = 60; // Vercel fonksiyon zaman asimini mumkun oldugunca uzat

// Kamp gibi kendi basina satilan (ayri paketler tablosu satiri olan) ozellikler
// icin: gerekliPaket verilmisse, kullanicinin ya TAM O PAKETI ya da herhangi bir
// yillik_* (Sinirsiz her sey) paketini aktif abonelikte tasidigini dogrula.
async function paketErisimiVarMi(req, cihazId, gerekliPaket) {
  const kullaniciId = await kullaniciIdCoz(req, cihazId);
  if (!kullaniciId) return false;
  const sonuc = await sql`
    SELECT 1 FROM abonelikler
    WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif'
      AND (plan = ${gerekliPaket} OR plan LIKE 'yillik_%')
    LIMIT 1
  `;
  return sonuc.length > 0;
}

export async function POST(req) {
  try {
    const { prompt, maxTokens, cihazId, jsonModu, ragDersi, gerekliPaket } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 4000) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }

    if (gerekliPaket) {
      const erisimVar = await paketErisimiVarMi(req, cihazId, gerekliPaket);
      if (!erisimVar) {
        return Response.json({ error: "Bu ozellik icin ilgili paketi satin almalisin." }, { status: 403 });
      }
    }

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.premium ? `Bugunluk yogun kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` : `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile daha fazla kullanabilirsin.` },
        { status: 429 }
      );
    }

    let sonPrompt = prompt;
    let ragKullanildi = false;
    if (ragDersi) {
      const parcalar = await ilgiliBilgiParcalariniGetir(prompt.slice(0, 500), ragDersi, 3);
      if (parcalar.length > 0) {
        const baglam = parcalar.map((p, i) => `[Kaynak ${i + 1}] ${p.icerik}`).join("\n\n");
        sonPrompt = `Asagida, daha once dogrulanmis referans materyaller var. Eger anlatimin bunlarla CELISIRSE, referanslara oncelik ver ve kendini duzelt. Eger konuyla ilgisizlerse yok say:\n\n${baglam}\n\n---\n\n${prompt}`;
        ragKullanildi = true;
      }
    }

    const metin = await aiCagir({ prompt: sonPrompt, maxTokens, jsonModu });
    return Response.json({ text: metin, kalanHak: Math.max(0, limit.limit - limit.kullanim), ragKullanildi });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AI servisi yanit vermedi: " + e.message }, { status: 502 });
  }
}
