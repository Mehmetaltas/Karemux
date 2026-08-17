import { aiCagir } from "@/lib/ai";

// Uretilen sorulari BAGIMSIZ bir AI cagrisiyla denetler (redaksiyon).
// Cevap anahtari gercekten dogru mu, celdiriciler acikca yanlis mi,
// soru belirsizlik iceriyor mu kontrol edilir. Gecemeyen sorular elenir.
// NOT: Denetim cagrisinin kendisi basarisiz olursa (AI hatasi, timeout vb.)
// sorulari oldugu gibi geciriyoruz - bu ekstra bir guvenlik katmanidir,
// basarisizligi ana akisi TAMAMEN durdurmamali (fail-open).
export async function sorulariDenetle(sorular, baglam = "") {
  if (!Array.isArray(sorular) || sorular.length === 0) return { gecenler: [], elenenSayisi: 0 };

  const listeMetni = sorular.map((s, i) =>
    `${i + 1}. Soru: ${s.soru}\nSecenekler: ${(s.secenekler || []).join(" | ")}\nIsaretlenen dogru cevap: ${s.secenekler?.[s.dogruIndex]}`
  ).join("\n\n");

  const p = `Sen bagimsiz bir redaksiyon/kalite kontrol uzmanisin. ${baglam} Asagidaki ${sorular.length} coktan secmeli sorunun HER BIRINI incele:
- Isaretlenen "dogru cevap" gercekten matematiksel/bilgisel olarak dogru mu?
- Celdiriciler (yanlis secenekler) acikca ve tartismasiz yanlis mi?
- Soru koku belirsizlik veya birden fazla dogru cevaba yol acacak bir ifade iceriyor mu?
Her soru icin SADECE gecti/kaldi karari ver, aciklama ekleme.

${listeMetni}

SADECE JSON dizisi dondur, tam ${sorular.length} eleman, sirayla: [{"index":1,"gecti":true},{"index":2,"gecti":false}]`;

  try {
    const cevap = await aiCagir({ prompt: p, maxTokens: Math.min(4000, 200 + sorular.length * 60), jsonModu: true });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const baslangic = temiz.indexOf("[");
    const bitis = temiz.lastIndexOf("]");
    const sonuclar = JSON.parse(temiz.slice(baslangic, bitis + 1));

    const gecenIndexler = new Set(
      (Array.isArray(sonuclar) ? sonuclar : [])
        .filter((r) => r && r.gecti === true && Number.isInteger(r.index))
        .map((r) => r.index)
    );

    const gecenler = sorular.filter((_, i) => gecenIndexler.has(i + 1));
    return { gecenler, elenenSayisi: sorular.length - gecenler.length };
  } catch (e) {
    console.error("Soru denetimi basarisiz, tum sorular gecerli sayildi:", e.message);
    return { gecenler: sorular, elenenSayisi: 0 };
  }
}
