import { aiCagir } from "@/lib/ai";

// Istemci, 4. ve 5. sinif konularindan sectigi bir listeyi ({ders, unite, sinif})
// gonderir, biz her biri icin 1 soru uretiriz. Boylece unite listesi (page.js'te
// duran mufredat verisi) tek yerde kalir, burada tekrar edilmez.
export async function POST(req) {
  try {
    const { konular } = await req.json(); // [{ders, unite, sinif}, ...]
    if (!Array.isArray(konular) || konular.length === 0) {
      return Response.json({ error: "Konu listesi gerekli" }, { status: 400 });
    }
    if (konular.length > 30) {
      return Response.json({ error: "Cok fazla konu istendi" }, { status: 400 });
    }

    const p = `Sen bir ilkokul/ortaokul ogretmenisin. Asagidaki ${konular.length} konunun HER BIRI icin, o konunun ait oldugu sinif seviyesine uygun TEK bir coktan secmeli soru hazirla. Konular ve sinif seviyeleri:
${konular.map((k, i) => `${i + 1}. Ders: ${k.ders}, Unite: ${k.unite}, Sinif: ${k.sinif}`).join("\n")}
Her soru o unitenin temel/orta zorluktaki bir kazanimini olcmeli - cok kolay ya da cok zor olmasin, bu bir SEVIYE TESPIT sinavi. SADECE JSON dizisi dondur, tam ${konular.length} eleman olsun, sirayla yukaridaki listeye karsilik gelsin:
[{"ders":"...","unite":"...","sinif":5,"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;

    const cevap = await aiCagir({ prompt: p, maxTokens: Math.min(8000, 400 + konular.length * 350), jsonModu: true });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const baslangic = temiz.indexOf("["), bitis = temiz.lastIndexOf("]");
    const sorularHam = JSON.parse(temiz.slice(baslangic, bitis + 1));

    const sorular = (Array.isArray(sorularHam) ? sorularHam : []).filter((s) =>
      s && typeof s.soru === "string" && s.soru.trim() &&
      Array.isArray(s.secenekler) && s.secenekler.length >= 2 &&
      Number.isInteger(s.dogruIndex) && s.dogruIndex >= 0 && s.dogruIndex < s.secenekler.length &&
      typeof s.ders === "string" && typeof s.unite === "string"
    );

    if (sorular.length === 0) throw new Error("Sorular uretilemedi, tekrar dene");
    return Response.json({ sorular });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
