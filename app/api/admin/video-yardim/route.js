import { NextResponse } from "next/server";
import { aiCagirDetay } from "@/lib/ai";

export const maxDuration = 60;

// Mini video fabrikasi (GitHub Actions) icin iki yardimci: ogretmen konusma metni ve dogal ses.
// Yalniz x-health-check-secret ile cagrilir (CI'daki mevcut gizli anahtar). Yeni bilgi uretilmez: konusma metni onayli konu paketinden yazilir.
const SESLER = { kadin: "Sulafat", erkek: "Sadaltager" };
const TTS_MODEL = "gemini-3.8-flash-tts";

function yetkili(req) {
  const s = process.env.HEALTH_CHECK_SECRET;
  return !!s && req.headers.get("x-health-check-secret") === s;
}

function senaryoIstemi({ baglam, paket }) {
  const a = paket.anlatim || {};
  const kaynak = JSON.stringify({
    hizliOgren: a.hizliOgren, temelAnlatim: a.temelAnlatim, derinAnlatim: a.derinAnlatim,
    pufNoktalari: a.pufNoktalari, sikHatalar: a.sikHatalar, yeniNesilUygulama: a.yeniNesilUygulama,
  });
  return `Sen deneyimli, sıcak ve sabırlı bir ${baglam.ders} öğretmenisin. Aşağıdaki ONAYLI konu anlatımını, kamera karşısında ders anlatan bir öğretmen gibi seslendirilecek kısa bir ders videosunun senaryosuna dönüştür.

Konu: ${baglam.konu} (${baglam.sinif}. sınıf ${baglam.ders})

KAYNAK (tek bilgi kaynağın; buna YENİ bilgi, kural, sayı, örnek sonucu EKLEME, değiştirme):
${kaynak}

KURALLAR:
- 8 ile 12 slayt yaz. Her slayt: "baslik" (en fazla 5 kelime), "maddeler" (ekranda görünecek 2-4 çok kısa madde, her biri en fazla 8 kelime, cümle değil anahtar ifade) ve "konusma" (öğretmenin o slaytta SÖYLEYECEĞİ metin).
- "konusma" gerçek bir öğretmenin sınıfta doğal konuştuğu gibi olsun: akıcı, kısa cümleler, "Şimdi şuna bakalım", "Dikkat et", "Mesela", "Bak, burada önemli olan şu" gibi doğal geçişler; ekrandaki maddeleri tek tek OKUMA, açıkla. Her konusma 250-450 karakter.
- İlk slaytta kendini tanıtma; konuya doğrudan, merak uyandıran bir girişle başla. Son slayt kısa bir tekrar ve cesaretlendirme olsun.
- YASAK: "X. sınıf Y dersi Z ünitesi" gibi künye cümleleri, "müfredata göre", "kazanım", "ünite", "slayt", "ekranda", "videoda" kelimeleri; öğrenciyle karşılıklı diyalog ya da soru-cevap taklidi (retorik soru serbest ama cevabı hemen sen ver); başka bir kaynaktan, kitaptan, videodan alıntı. Her şeyi kendi cümlelerinle yaz.
- Matematik ifadelerini konuşma dilinde yaz: "2 üssü 3", "karekök 16", "yüzde 20". Ekranda maddelerde sembol kullanabilirsin.
- Kaynakta olmayan şeyi söyleme. Emin olmadığın hiçbir şeyi ekleme.
SADECE şu JSON'u döndür: {"slaytlar":[{"baslik":"...","maddeler":["..."],"konusma":"..."}]}`;
}

async function sesUret(metin, ses, stil) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY yok");
  const govde = {
    model: TTS_MODEL,
    input: [{ type: "user_input", content: [{ type: "text", text: metin, annotations: [{ type: "speech_metadata", style: stil }] }] }],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice: ses }] },
  };
  const ctrl = new AbortController();
  const z = setTimeout(() => ctrl.abort(), 50000);
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(govde), signal: ctrl.signal,
    });
    const txt = await res.text();
    if (!res.ok) throw new Error(`TTS ${res.status}: ${txt.slice(0, 300)}`);
    const j = JSON.parse(txt);
    for (const st of j.steps || []) for (const c of st.content || []) if (c?.data) return { wav: c.data, mime: c.mime_type || "audio/wav" };
    throw new Error("TTS yanitinda ses yok: " + txt.slice(0, 300));
  } finally { clearTimeout(z); }
}

export async function POST(req) {
  if (!yetkili(req)) return NextResponse.json({ hata: "yetkisiz" }, { status: 401 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ hata: "gecersiz govde" }, { status: 400 }); }
  try {
    if (b.islem === "senaryo") {
      if (!b.paket?.anlatim || !b.baglam) return NextResponse.json({ hata: "paket/baglam eksik" }, { status: 400 });
      const { metin, saglayici } = await aiCagirDetay({ prompt: senaryoIstemi(b), maxTokens: 6000, jsonModu: true, tur: "video_senaryo" }, null, 55000);
      const j = JSON.parse(metin.trim().replace(/^```json\s*|^```\s*|```\s*$/g, ""));
      const sl = (j.slaytlar || []).filter((s) => s?.baslik && s?.konusma).map((s) => ({
        baslik: String(s.baslik).slice(0, 60), maddeler: (s.maddeler || []).map((m) => String(m).slice(0, 90)).slice(0, 4), konusma: String(s.konusma).slice(0, 700),
      }));
      return NextResponse.json({ slaytlar: sl, saglayici });
    }
    if (b.islem === "ses") {
      const ses = SESLER[b.ses] || SESLER.kadin;
      const metin = String(b.metin || "").slice(0, 900);
      if (!metin) return NextResponse.json({ hata: "metin yok" }, { status: 400 });
      const r = await sesUret(metin, ses, "Sıcak, sakin ve anlaşılır; deneyimli bir öğretmen gibi doğal ve canlı anlat.");
      return NextResponse.json({ wav: r.wav, mime: r.mime });
    }
    return NextResponse.json({ hata: "bilinmeyen islem" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ hata: String(e.message || e).slice(0, 400) }, { status: 502 });
  }
}
