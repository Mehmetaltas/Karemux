// Yazılı soru havuzu doğrulaması (ağ/DB gerekmez). Çıkış kodu 0 = temiz.
// Denetler: biçim, seçenek benzersizliği/sayısı, doğru indeks, açıklama, "hepsi/A ve B" yasağı, görsel şeması, kopya, gömülü etiket ({u,k}) yıllık planda var mı.
import { HAVUZ } from "../lib/yazili-hazirlik/havuz/index.js";
import { YILLIK_PLAN } from "../lib/yillik-plan.data.js";
import { planKonulari, nrm } from "../lib/yazili-hazirlik/secici.js";
let hata = 0, top = 0;
const planK = {};
for (const [k, p] of Object.entries(YILLIK_PLAN)) planK[k] = planKonulari(p);
for (const [d, o] of Object.entries(HAVUZ)) for (const [s, k] of Object.entries(o)) for (const [y, qs] of Object.entries(k)) {
  top += qs.length; const gorulen = new Set();
  qs.forEach((q, i) => {
    const m = [];
    if (!Array.isArray(q) || q.length < 4) m.push("biçim");
    else {
      if (typeof q[0] !== "string" || q[0].length < 8) m.push("soru");
      if (!Array.isArray(q[1]) || q[1].length < 3 || q[1].length > 5 || new Set(q[1]).size !== q[1].length) m.push("seçenek");
      if (!Number.isInteger(q[2]) || q[2] < 0 || q[2] >= (q[1] || []).length) m.push("doğru indeks");
      if (!q[3]) m.push("açıklama");
      // seçenekler karıştırıldığı için DOĞRU seçenek "hepsi / A ve B / hiçbiri" türü olamaz (çeldirici olarak serbest)
      if (/\bhepsi\b|yukarıdakilerin|\b[A-E] ve [A-E]\b|\bhiçbiri\b|\bher ikisi de\b/i.test(String((q[1] || [])[q[2]] || ""))) m.push("doğru şık hepsi/kombinasyon");
      if (q[4] && !((q[4].tip === "svg" && String(q[4].svg || "").startsWith("<svg")) || (q[4].tip === "tablo" && q[4].satirlar?.length))) m.push("görsel şeması");
      const kimlik = q[0] + (q[4] ? JSON.stringify(q[4]) : ""); if (gorulen.has(kimlik)) m.push("tekrar"); gorulen.add(kimlik);
      if (q[5]) {
        const pk = planK[`${d}::${s}`];
        if (!pk) m.push("etiket: plan yok");
        else if (!pk.kon.has(nrm(q[5].k)) && !pk.uni.has(nrm(q[5].u))) m.push(`etiket planda yok (${q[5].u} / ${q[5].k})`);
      }
    }
    if (m.length) { hata++; console.log("HATA", d, s, y, i + 1, m.join(",")); }
  });
}
console.log("toplam soru", top, "hata", hata);
process.exit(hata ? 1 : 0);
