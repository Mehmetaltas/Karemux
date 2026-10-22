// Canli konu_paketi uretimini gercek akisla cagirip ICERIK KALITESINI ekrana basar.
// Kullanim: node scripts/paket-incele.mjs [sinif] [ders] [konu]
// Not: taze bir cihaz kimligi kullanir (gunluk hak 1 harcanir) ve paket onbellege yazilir;
// kotu cikarsa icerik_onbellek'ten silinir.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karemux.com";
const sinif = process.argv[2] || "8";
const ders = process.argv[3] || "Matematik";
const konu = process.argv[4] || "Uslu Ifadeler";
const cihazId = `kanit-paket-${Date.now()}`;

const t0 = Date.now();
const res = await fetch(`${SITE}/api/konu-paketi?sinif=${sinif}&ders=${encodeURIComponent(ders)}&konu=${encodeURIComponent(konu)}&unite=&cihazId=${cihazId}`);
const sn = ((Date.now() - t0) / 1000).toFixed(1);
const j = await res.json().catch(() => ({}));
console.log(`HTTP ${res.status}, ${sn} sn, kaynak=${j.kaynak}`);
if (!res.ok || !j.paket) { console.log("Paket yok:", JSON.stringify(j).slice(0, 300)); process.exit(1); }

const p = j.paket;
const havuz = p.soruHavuzu || [];
const hepsi = JSON.stringify(p);
console.log("Anlatim uzunlugu:", (p.anlatim?.temelAnlatim || "").length, "karakter");
console.log("Soru sayisi:", havuz.length, "| elenen:", (p.soruHavuzuElenen || []).length, "| odev:", (p.odev || p.odevler || []).length || "?");
console.log("Kalite kontrol:", JSON.stringify(p.kaliteKontrol || {}).slice(0, 200));
console.log("Bozuk karakter (Ã, Ä, �):", /[ÃÄ�]/.test(hepsi) ? "VAR" : "yok");
console.log("Turkce karakter (ğüşıöç):", (hepsi.match(/[ğüşıöçĞÜŞİÖÇ]/g) || []).length, "adet");
const gecersiz = havuz.filter((s) => !s.soru || !Array.isArray(s.secenekler) || s.secenekler.length < 4 || !Number.isInteger(s.dogruIndex) || s.dogruIndex < 0 || s.dogruIndex >= s.secenekler.length).length;
console.log("Yapisal gecersiz soru:", gecersiz);
console.log("Tekrar eden soru:", havuz.length - new Set(havuz.map((s) => (s.soru || "").trim())).size);
console.log("\n--- Anlatim (ilk 500) ---\n" + (p.anlatim?.temelAnlatim || "").slice(0, 500));
for (const s of havuz.slice(0, 3)) {
  console.log(`\n--- Soru ---\n${s.soru}\n` + (s.secenekler || []).map((o, i) => `${i === s.dogruIndex ? "*" : " "} ${"ABCD"[i]}) ${o}`).join("\n"));
  if (s.aciklama) console.log("Aciklama:", String(s.aciklama).slice(0, 200));
}
