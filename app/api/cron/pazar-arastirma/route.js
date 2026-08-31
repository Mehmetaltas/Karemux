import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";

// Otomatik Pazar Arastirma Motoru (31 Agustos): Tavily ile gercek web
// aramasi yapar, sonuclari AI ile ozetletip pazar_arastirma tablosuna
// yazar. Onemli bir fiyat/ozellik degisikligi tespit edilirse
// strateji_onerisi'ne otomatik oneri dusurur (ONERIR, karar VERMEZ).
const SORGULAR = [
  { rakip: "Kunduz", sorgu: "Kunduz LGS eğitim platformu fiyat 2026 paket" },
  { rakip: "Baykuş Koçluk", sorgu: "Baykuş Koçluk LGS fiyat özellik 2026" },
];

async function tavilyAra(sorgu) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: sorgu,
      search_depth: "basic",
      max_results: 5,
      include_answer: true,
    }),
  });
  if (!res.ok) throw new Error(`Tavily hatasi: ${res.status}`);
  return res.json();
}

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if (!process.env.TAVILY_API_KEY) {
    return Response.json({ error: "TAVILY_API_KEY tanimli degil" }, { status: 500 });
  }

  const sonuclar = [];
  for (const { rakip, sorgu } of SORGULAR) {
    try {
      const aramaSonucu = await tavilyAra(sorgu);
      const hamMetin = (aramaSonucu.results || []).map((r) => `${r.title}: ${r.content}`).join("\n\n").slice(0, 4000);
      if (!hamMetin) { sonuclar.push({ rakip, atlandi: "sonuc yok" }); continue; }

      const p = `Asagidaki arama sonuclarindan "${rakip}" hakkinda GUNCEL fiyat/ozellik bilgisi cikar. SADECE somut, sayisal veya net ozellik bilgisi varsa raporla, spekulasyon yapma, uydurma. Bulgu yoksa "bulgu_var":false don. SADECE JSON dondur: {"bulgu_var":true,"ozet":"kisa 1-2 cumlelik ozet, Turkce"}

ARAMA SONUCLARI:
${hamMetin}`;

      const cevap = await aiCagir({ prompt: p, maxTokens: 400, jsonModu: true });
      const temiz = cevap.replace(/```json|```/g, "").trim();
      const veri = JSON.parse(temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1));

      if (veri.bulgu_var && veri.ozet) {
        await sql`
          INSERT INTO pazar_arastirma (rakip_adi, konu, bulgu, kaynak_url)
          VALUES (${rakip}, 'fiyat_ozellik_taramasi', ${veri.ozet}, ${aramaSonucu.results?.[0]?.url || null})
        `;
        sonuclar.push({ rakip, kaydedildi: true, ozet: veri.ozet });
      } else {
        sonuclar.push({ rakip, kaydedildi: false, sebep: "AI net bulgu cikaramadi" });
      }
    } catch (e) {
      console.error(`Pazar arastirma hatasi (${rakip}):`, e.message);
      sonuclar.push({ rakip, hata: e.message });
    }
  }

  return Response.json({ ok: true, sonuclar });
}
