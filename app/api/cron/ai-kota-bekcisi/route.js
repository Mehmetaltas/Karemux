import { sql } from "@/lib/db";
import { yoneticiUyar } from "@/lib/uyari";

export const dynamic = "force-dynamic";

// 22 Ekim (Madde 42): yapay zeka kota ve maliyet bekcisi. Günde bir kez son 24 saatin ai_saglayici_log kayitlarina bakar;
// Gemini 429 (gunluk kota) yigilmasi, genel basarisizlik orani ve gunluk tahmini maliyet esigi asilinca yoneticiye Telegram uyarisi yollar.
// Ayni uyari 6 saatte bir kez gider (lib/uyari.js). Esik: AI_GUNLUK_MALIYET_ESIGI_TL (varsayilan 50).
export async function GET(req) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const ozet = await sql`
      SELECT saglayici,
             COUNT(*)::int AS toplam,
             COUNT(*) FILTER (WHERE basarili = false)::int AS basarisiz,
             COUNT(*) FILTER (WHERE basarili = false AND hata LIKE '%429%')::int AS kota
      FROM ai_saglayici_log WHERE olusturulma > now() - interval '24 hours' GROUP BY saglayici
    `;
    const uyarilar = [];
    const toplam = ozet.reduce((t, r) => t + r.toplam, 0);
    const basarisiz = ozet.reduce((t, r) => t + r.basarisiz, 0);
    for (const r of ozet) {
      if (r.kota >= 5) uyarilar.push({ anahtar: `kota-${r.saglayici}`, mesaj: `🟠 KAREMUX: ${r.saglayici} son 24 saatte ${r.kota} kez kota/429 verdi (${r.toplam} istek). Yedek sağlayıcılar devrede; kapasiteyi kontrol et.` });
    }
    if (toplam >= 10 && basarisiz / toplam > 0.3) {
      uyarilar.push({ anahtar: "ai-basarisizlik", mesaj: `🔴 KAREMUX: Son 24 saatte yapay zekâ çağrılarının %${Math.round((basarisiz / toplam) * 100)}'i başarısız (${basarisiz}/${toplam}). Öğrenciler "tekrar dene" hatası görüyor olabilir.` });
    }
    let maliyetTl = null;
    try {
      const m = await sql`SELECT COALESCE(SUM(tahmini_maliyet_tl), 0)::float AS toplam FROM ai_kullanim_log WHERE olusturulma >= CURRENT_DATE`;
      maliyetTl = m[0].toplam;
      const esik = Number(process.env.AI_GUNLUK_MALIYET_ESIGI_TL) || 50;
      if (maliyetTl > esik) uyarilar.push({ anahtar: "ai-maliyet", mesaj: `💸 KAREMUX: Bugünkü tahmini yapay zekâ maliyeti ${maliyetTl.toFixed(2)} TL (eşik ${esik} TL).` });
    } catch (e) { console.error("Maliyet kontrolu atlandi:", e.message); }

    // Destek SLA'si: 24 saatten uzun suredir yanitsiz acik talep
    try {
      const gecikmis = await sql`SELECT COUNT(*)::int AS adet FROM destek_talebi WHERE durum = 'acik' AND admin_yaniti IS NULL AND olusturulma < now() - interval '24 hours'`;
      if (gecikmis[0].adet > 0) uyarilar.push({ anahtar: "destek-sla", mesaj: `🎫 KAREMUX: ${gecikmis[0].adet} destek talebi 24 saatten uzun süredir yanıtsız (SLA aşıldı).` });
    } catch (e) { console.error("Destek SLA kontrolu atlandi:", e.message); }

    let gonderilen = 0;
    for (const u of uyarilar) if (await yoneticiUyar(u.anahtar, u.mesaj, 6)) gonderilen++;
    return Response.json({ ok: true, toplam, basarisiz, maliyetTl, uyari: uyarilar.length, gonderilen });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cron gorevi basarisiz" }, { status: 500 });
  }
}
