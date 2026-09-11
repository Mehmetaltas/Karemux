import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { ilgiliBilgiParcalariniGetir } from "@/lib/rag";
import { hasPackageFeature } from "@/lib/paket";
import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { ogrenmeHafizasiGetir } from "@/lib/ogrenme-hafizasi";

export const maxDuration = 60; // Vercel fonksiyon zaman asimini mumkun oldugunca uzat

// Maliyet sabitleri - simulasyon panelindeki (app/api/admin/simulasyon/route.js)
// AYNI degerler, tutarlilik icin. Gercek cikti karakterinden token TAHMIN edilir
// (Turkce icin ~1 token = ~3.5-4 karakter, kaba bir yaklasimdir).
const USD_TRY = 47.93;
const CIKTI_FIYAT_USD_MTOK = 7.50;
const KARAKTER_BASINA_TOKEN_TAHMINI = 1 / 3.7;

function aiKullanimLoglaSessizce(ciktiMetin, ragKullanildi) {
  try {
    const karakterSayisi = (ciktiMetin || "").length;
    const tahminiToken = Math.round(karakterSayisi * KARAKTER_BASINA_TOKEN_TAHMINI);
    const tahminiMaliyetTl = Math.round((tahminiToken / 1_000_000) * CIKTI_FIYAT_USD_MTOK * USD_TRY * 10000) / 10000;
    sql`
      INSERT INTO ai_kullanim_log (cikti_karakter_sayisi, tahmini_cikti_token, tahmini_maliyet_tl, rag_kullanildi, olusturulma)
      VALUES (${karakterSayisi}, ${tahminiToken}, ${tahminiMaliyetTl}, ${!!ragKullanildi}, now())
    `.catch((e) => console.error("AI kullanim log hatasi:", e));
  } catch (e) {
    console.error("AI kullanim log hatasi:", e);
  }
}

export async function POST(req) {
  try {
    const { prompt, maxTokens, cihazId, jsonModu, ragDersi, gerekliPaket, tur } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 4000) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }

    if (gerekliPaket) {
      const erisimVar = await hasPackageFeature(req, cihazId, gerekliPaket);
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

    // Ogrenme Hafizasi (8 Eylul) - SADECE Premium, sessizce dener, basarisiz
    // olursa (kimlik cozulemez, veri yok vb.) normal akisa devam eder.
    try {
      const kullaniciId = await kullaniciIdCoz(req, cihazId);
      const ogrenmeOzeti = await ogrenmeHafizasiGetir(kullaniciId);
      if (ogrenmeOzeti) {
        sonPrompt = `Bu ogrencinin gecmis calisma verisinden cikarilan profil: "${ogrenmeOzeti}" Bu bilgiyi, asagidaki icerigi bu ogrenciye daha uygun hale getirmek icin KULLAN (ozellikle zayif oldugu noktalara biraz daha dikkat et), ama bunu ACIKCA SOYLEME, dogal bir sekilde entegre et.\n\n---\n\n${sonPrompt}`;
      }
    } catch (e) { /* hafiza basarisiz olursa sessizce normal akisa devam */ }

    if (ragDersi) {
      const parcalar = await ilgiliBilgiParcalariniGetir(prompt.slice(0, 500), ragDersi, 3);
      if (parcalar.length > 0) {
        const baglam = parcalar.map((p, i) => `[Kaynak ${i + 1}] ${p.icerik}`).join("\n\n");
        sonPrompt = `Asagida, daha once dogrulanmis referans materyaller var. Eger anlatimin bunlarla CELISIRSE, referanslara oncelik ver ve kendini duzelt. Eger konuyla ilgisizlerse yok say:\n\n${baglam}\n\n---\n\n${prompt}`;
        ragKullanildi = true;
      }
    }

    const metin = await aiCagir({ prompt: sonPrompt, maxTokens, jsonModu, tur });
    aiKullanimLoglaSessizce(metin, ragKullanildi);
    return Response.json({ text: metin, kalanHak: Math.max(0, limit.limit - limit.kullanim), ragKullanildi });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AI servisi yanit vermedi: " + e.message }, { status: 502 });
  }
}
