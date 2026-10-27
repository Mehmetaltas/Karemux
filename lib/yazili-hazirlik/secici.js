// Müfredata göre soru seçici: sorular havuzda "dönem.yazılı" penceresine değil, yıllık plandaki ünite/konuya etiketlidir.
// Yıllık plan (lib/yillik-plan.data.js) her yıl güncellenince kâğıtlar o yılın konularından otomatik kurulur;
// planda artık bulunmayan konunun soruları dışarıda kalır, soru bulunmayan yeni konular BOSLUK raporunda çıkar.
import { soruAnahtar } from "./havuz/anahtar.js";
export const nrm = (s) => String(s || "").toLocaleLowerCase("tr-TR").replace(/\s*\(\d+\)\s*/g, " ").replace(/[^a-z0-9çğıöşü ]/gi, " ").replace(/\s+/g, " ").trim();
const tohum = (str) => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

// Planın bir hafta aralığındaki konu kümesi (ünite adı + konu adları). Konu sütunu boşsa ünite adı konu sayılır.
export function pencereKonulari(plan, h1, h2) {
  const kon = new Set(), uni = new Set();
  for (const [h, u, k] of plan) if (h >= h1 && h <= h2) for (const x of String(u).split(" / ")) {
    uni.add(nrm(x)); const p = String(k).split(";").map((y) => nrm(y)).filter(Boolean); (p.length ? p : [nrm(x)]).forEach((y) => kon.add(y));
  }
  return { kon, uni };
}
export function planKonulari(plan) { return pencereKonulari(plan, 0, 999); }

// ders-sınıf havuzunu etiketle: {q, id, etiket:{u,k}|{dis}|null, kaynak:"d.y"}
export function etiketliSorular(dersHavuzu, etiketler, sinif = "") {
  const out = [];
  for (const [kaynak, qs] of Object.entries(dersHavuzu || {})) for (const q of qs) { const id = soruAnahtar(q); out.push({ q, id, etiket: q[5] || etiketler[id + "@" + sinif] || etiketler[id] || null, kaynak }); }  // q[5] = soruya gömülü {u,k} etiketi (yeni sorular bunu taşır)
  return out;
}

// bir sorunun bir pencereye uyup uymadığı: etiketli → plan konusu eşleşmesi; etiketsiz → yazarın verdiği "d.y" penceresi (geçici yedek)
export function uyar(s, pen, planK, yedekAnahtar) {
  if (s.etiket) {
    if (s.etiket.dis) return false;
    const k = nrm(s.etiket.k), u = nrm(s.etiket.u);
    if (planK.kon.has(k)) return pen.kon.has(k);               // konu planda var → o konunun haftalarına bak
    return planK.uni.has(u) ? pen.uni.has(u) : false;           // konu adı değişmiş → ünite düzeyine in; ünite de yoksa kullanılmaz
  }
  return s.kaynak === yedekAnahtar;
}

// Altı yazılıyı birlikte planla: her soru en fazla bir yazılıda; dar pencereler önce doldurulur.
export function yazililariPlanla(sorular, plan, pencereler, { adet = 12, gorselEn = 2 } = {}) {
  const planK = planKonulari(plan);
  const pens = pencereler.map(([donem, yazili, h1, h2]) => ({ etiket: `${donem}.${yazili}`, ...pencereKonulari(plan, h1, h2) }));
  const adayBas = pens.map((p) => sorular.filter((s) => uyar(s, p, planK, p.etiket)));
  const kacPencere = new Map(); adayBas.forEach((l) => l.forEach((s) => kacPencere.set(s.id, (kacPencere.get(s.id) || 0) + 1)));
  const sira = pens.map((_, i) => i).sort((a, b) => adayBas[a].length - adayBas[b].length);
  const kullanilan = new Set(), sonuc = new Array(pens.length);
  for (const i of sira) {
    const aday = adayBas[i].filter((s) => !kullanilan.has(s.id)).sort((a, b) => (kacPencere.get(a.id) - kacPencere.get(b.id)) || (tohum(a.id + i) - tohum(b.id + i)));
    const gor = aday.filter((s) => s.q[4]), met = aday.filter((s) => !s.q[4]);
    const grup = (l) => { const g = new Map(); for (const s of l) { const k = s.etiket ? nrm(s.etiket.k) : "?"; (g.get(k) || g.set(k, []).get(k)).push(s); } return [...g.values()]; };
    const sec = [];
    const rr = (gruplar, n) => { for (let r = 0; sec.length < n && gruplar.some((g) => g.length > r); r++) for (const g of gruplar) if (g[r] && sec.length < n) sec.push(g[r]); };
    const gSec = []; { const tmp = sec.splice(0); rr(grup(gor), Math.min(gorselEn, gor.length)); gSec.push(...sec.splice(0)); sec.push(...tmp); }
    rr(grup(met), Math.max(0, adet - gSec.length));
    const metSec = sec.splice(0);
    if (metSec.length + gSec.length < adet) { const fazla = gor.filter((s) => !gSec.includes(s)).slice(0, adet - metSec.length - gSec.length); gSec.push(...fazla); }
    const secilen = [...metSec, ...gSec].slice(0, adet); secilen.forEach((s) => kullanilan.add(s.id));
    sonuc[i] = { pencere: pens[i], secilen, aday: aday.length };
  }
  return sonuc;
}

// Boşluk raporu: planda olup hiç (dışı olmayan) sorusu bulunmayan konular, etiketsiz/yetim sorular
export function bosluklar(sorular, plan) {
  const planK = planKonulari(plan);
  const say = new Map(); let etiketsiz = 0, yetim = 0, dis = 0;
  for (const s of sorular) {
    if (!s.etiket) { etiketsiz++; continue; } if (s.etiket.dis) { dis++; continue; }
    const k = nrm(s.etiket.k); if (planK.kon.has(k)) say.set(k, (say.get(k) || 0) + 1); else if (planK.uni.has(nrm(s.etiket.u))) say.set("u:" + nrm(s.etiket.u), (say.get("u:" + nrm(s.etiket.u)) || 0) + 1); else yetim++;
  }
  const eksik = []; for (const [h, u, k] of plan) for (const x of String(u).split(" / ")) { const p = String(k).split(";").map((y) => y.trim()).filter(Boolean); for (const t of p.length ? p : [x]) { const n = nrm(t); if (!say.get(n) && !say.get("u:" + nrm(x)) && !eksik.some((e) => e.n === n)) eksik.push({ n, ad: t, unite: x, hafta: h }); } }
  return { eksik, etiketsiz, yetim, dis };
}
