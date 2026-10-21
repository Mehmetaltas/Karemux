import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { ilgiliBilgiParcalariniGetir } from "@/lib/rag";
import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { ogrenmeHafizasiGetir } from "@/lib/ogrenme-hafizasi";
import { usdTryKuruGetir, GEMINI_3_6_FLASH_FIYAT } from "@/lib/ai-fiyatlandirma";
import { AI_ISLEMLERI, GirdiHatasi } from "@/lib/ai-islemleri";

// Faz 2 (21 Ekim): TEK, KAPALI yapay zeka ucu. Istemci prompt GONDEREMEZ; yalniz islem kodu ve yapisal
// girdi gonderir, prompt lib/ai-islemleri.js icinde SUNUCUDA kurulur. Eski genel /api/claude vekilinin yerine gecer.
// (Ucretli ozellikler - tatil programi, bursluluk - ayrica /api/ucretli-uret ucunda paket kontroluyle durur.)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const KARAKTER_BASINA_TOKEN_TAHMINI = 1 / 3.7;

async function aiKullanimLoglaSessizce(ciktiMetin, ragKullanildi) {
  try {
    const karakterSayisi = (ciktiMetin || "").length;
    const tahminiToken = Math.round(karakterSayisi * KARAKTER_BASINA_TOKEN_TAHMINI);
    const kur = await usdTryKuruGetir();
    const tahminiMaliyetTl = Math.round((tahminiToken / 1_000_000) * GEMINI_3_6_FLASH_FIYAT.ciktiUsdMtok * kur * 10000) / 10000;
    await sql`
      INSERT INTO ai_kullanim_log (cikti_karakter_sayisi, tahmini_cikti_token, tahmini_maliyet_tl, rag_kullanildi, olusturulma)
      VALUES (${karakterSayisi}, ${tahminiToken}, ${tahminiMaliyetTl}, ${!!ragKullanildi}, now())
    `;
  } catch (e) {
    console.error("AI kullanim log hatasi:", e);
  }
}

export async function POST(req) {
  try {
    const { islem, girdi, cihazId } = await req.json();
    const tanim = typeof islem === "string" && Object.prototype.hasOwnProperty.call(AI_ISLEMLERI, islem) ? AI_ISLEMLERI[islem] : null;
    if (!tanim) return Response.json({ error: "Gecersiz islem" }, { status: 400 });

    let hazir;
    try {
      hazir = tanim.hazirla(girdi && typeof girdi === "object" ? girdi : {});
    } catch (e) {
      if (e instanceof GirdiHatasi) return Response.json({ error: "Gecersiz istek: " + e.message }, { status: 400 });
      throw e;
    }

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.ipSiniri ? "Bu aginda cok yogun kullanim var, biraz sonra tekrar dene." : limit.premium ? `Bugunluk yogun kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` : `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile daha fazla kullanabilirsin.` },
        { status: 429 }
      );
    }

    let sonPrompt = hazir.prompt;
    let ragKullanildi = false;

    // Ogrenme Hafizasi - SADECE Premium, sessizce dener.
    try {
      const kullaniciId = await kullaniciIdCoz(req, cihazId);
      const ogrenmeOzeti = await ogrenmeHafizasiGetir(kullaniciId);
      if (ogrenmeOzeti) {
        sonPrompt = `Bu ogrencinin gecmis calisma verisinden cikarilan profil: "${ogrenmeOzeti}" Bu bilgiyi, asagidaki icerigi bu ogrenciye daha uygun hale getirmek icin KULLAN (ozellikle zayif oldugu noktalara biraz daha dikkat et), ama bunu ACIKCA SOYLEME, dogal bir sekilde entegre et.\n\n---\n\n${sonPrompt}`;
      }
    } catch (e) { /* hafiza basarisiz olursa sessizce normal akisa devam */ }

    const ragDersi = typeof tanim.ragDersi === "function" ? tanim.ragDersi(hazir) : null;
    if (ragDersi) {
      const parcalar = await ilgiliBilgiParcalariniGetir(hazir.prompt.slice(0, 500), ragDersi, 3);
      if (parcalar.length > 0) {
        const baglam = parcalar.map((p, i) => `[Kaynak ${i + 1}] ${p.icerik}`).join("\n\n");
        sonPrompt = `Asagida, daha once dogrulanmis referans materyaller var. Eger anlatimin bunlarla CELISIRSE, referanslara oncelik ver ve kendini duzelt. Eger konuyla ilgisizlerse yok say:\n\n${baglam}\n\n---\n\n${hazir.prompt}`;
        ragKullanildi = true;
      }
    }

    const maxTokens = Math.min(Math.max(Math.floor(tanim.maxTokens(hazir)), 1), 8192);
    const metin = await aiCagir({ prompt: sonPrompt, maxTokens, jsonModu: !!tanim.jsonModu, tur: tanim.tur });
    aiKullanimLoglaSessizce(metin, ragKullanildi);
    return Response.json({ text: metin, kalanHak: Math.max(0, limit.limit - limit.kullanim), ragKullanildi });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AI servisi yanit vermedi: " + e.message }, { status: 502 });
  }
}
