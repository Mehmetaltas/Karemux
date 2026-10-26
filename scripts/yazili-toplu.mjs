// Toplu yazılı üretimi: tüm ders/sınıf için 1./2./3. yazılı x 2 dönem. Soru bankasından (çoktan seçmeli), yıllık plan penceresine göre.
// Kullanım: node scripts/yazili-toplu.mjs <cikti-dizini> [sinif] [ders]   (DATABASE_URL gerekir)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { neon } from "@neondatabase/serverless";
import { YILLIK_PLAN } from "../lib/yillik-plan.data.js";
import { kagitHtml } from "../lib/yazili-hazirlik/render.js";
import { gorselUret } from "../lib/gorsel-motoru.js";
import { soruFormatGecerliMi } from "../lib/soruFormatDogrula.js";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const [dizin = "yazili-toplu", sinifF, dersF] = process.argv.slice(2);
console.log("::notice::yazili-toplu basladi");
const sql = neon(process.env.DATABASE_URL);
const nrm = (s) => String(s || "").toLocaleLowerCase("tr-TR").replace(/\s*\(\d+\)\s*/g, " ").replace(/[^a-z0-9çğıöşü ]/gi, " ").replace(/\s+/g, " ").trim();
// [dönem, yazılı, ilk hafta, son hafta]  (1. dönem hafta 1-18, 2. dönem 19-37; 16 Kasım ara tatili 9. haftadan sonra)
const PENCERE = [[1, 1, 1, 8], [1, 2, 9, 13], [1, 3, 14, 18], [2, 1, 19, 25], [2, 2, 26, 31], [2, 3, 32, 37]];
const SORU_SAYISI = 12, EN_AZ = 6;
const GORSELE_BAGLI = /\b(şekil|şekle|şekilde|grafik|tablo|tabloda|görsel|resim|harita|haritada|çizim|yukarıdaki|aşağıdaki (?:şekil|tablo|grafik|harita))/i;
const HARF = "ABCDE";
const rapor = [];

for (const ev of ["unhandledRejection", "uncaughtException"]) process.on(ev, (e) => { console.log("::error::" + String(e && e.stack || e).replace(/\n/g, " | ").slice(0, 700)); process.exit(1); });
let tumSorular; try { tumSorular = await sql`SELECT id, ders, sinif::text AS sinif, unite, alt_konu, zorluk, soru, secenekler, dogru_index AS "dogruIndex", aciklama FROM soru_bankasi WHERE soru IS NOT NULL`; } catch (e) { console.log("::error::DB sorgu hatasi: " + String(e.message).slice(0, 300)); process.exit(1); }
console.log(`::notice::soru_bankasi: ${tumSorular.length} satır`);
const dersAnahtar = (d) => nrm(d).replace(/\s/g, "");
const tarayici = await chromium.launch();
fs.mkdirSync(dizin, { recursive: true });

for (const anahtar of Object.keys(YILLIK_PLAN)) {
  const [ders, sinif] = anahtar.split("::");
  if (sinifF && sinif !== sinifF) continue; if (dersF && ders !== dersF) continue;
  const plan = YILLIK_PLAN[anahtar];
  const havuz = tumSorular.filter((q) => String(q.sinif) === sinif && dersAnahtar(q.ders) === dersAnahtar(ders)).map((q) => ({ ...q, secenekler: typeof q.secenekler === "string" ? JSON.parse(q.secenekler) : q.secenekler }))
    .filter((q) => soruFormatGecerliMi(q) && !GORSELE_BAGLI.test(q.soru) && q.secenekler.length >= 3 && q.secenekler.length <= 5);
  const kullanilan = new Set();
  for (const [donem, yazili, h1, h2] of PENCERE) {
    const etiket = `${ders}-${sinif}-D${donem}-Y${yazili}`;
    const satirlar = plan.filter(([h]) => h >= h1 && h <= h2);
    if (!satirlar.length) { rapor.push(`${etiket}: planda hafta yok`); continue; }
    const uniteler = [...new Set(satirlar.flatMap(([, u]) => String(u).split(" / ")))];
    const anahtarlar = [...new Set([...uniteler, ...satirlar.flatMap(([, , k]) => String(k).split(";"))].map(nrm).filter((x) => x.length > 3))];
    const eslesen = havuz.filter((q) => !kullanilan.has(q.id) && anahtarlar.some((a) => { const u = nrm(q.unite), k = nrm(q.alt_konu); return (u && (u.includes(a) || a.includes(u))) || (k && (k.includes(a) || a.includes(k))); }));
    // konulara göre dengeli seçim (round-robin), deterministik sıra
    const gruplar = {}; for (const q of eslesen.sort((a, b) => a.id - b.id)) (gruplar[nrm(q.alt_konu || q.unite)] = gruplar[nrm(q.alt_konu || q.unite)] || []).push(q);
    const secilen = []; const g = Object.values(gruplar);
    for (let i = 0; secilen.length < SORU_SAYISI && g.some((x) => x.length > i); i++) for (const x of g) if (x[i] && secilen.length < SORU_SAYISI) secilen.push(x[i]);
    if (secilen.length < EN_AZ) { rapor.push(`${etiket}: YETERSİZ (${secilen.length}/${EN_AZ}; eşleşen ${eslesen.length}, havuz ${havuz.length})`); continue; }
    secilen.forEach((q) => kullanilan.add(q.id));
    const sorular = secilen.map((q, i) => ({ no: i + 1, yonerge: "", paragraflar: [q.soru.trim(), ...q.secenekler.map((s, j) => `**${HARF[j]})** ${String(s).trim()}`)], _id: q.id }));
    const cozumler = secilen.map((q, i) => ({ no: i + 1, paragraflar: [`**Doğru cevap: ${HARF[q.dogruIndex]}) ${String(q.secenekler[q.dogruIndex]).trim()}**`, ...(q.aciklama ? [String(q.aciklama).trim()] : [])] }));
    const kapsam = uniteler.join("; ") + " — " + [...new Set(satirlar.flatMap(([, , k]) => String(k).split(";").map((x) => x.trim())))].join(", ");
    // sayfalama: taşma olursa sayfa başına soru sayısını azalt
    let basarili = false;
    for (let sp = 5; sp >= 1 && !basarili; sp--) {
      const sayfalar = []; for (let i = 0; i < sorular.length; i += sp) sayfalar.push({ sorular: sorular.slice(i, i + sp) });
      const cs = []; for (let i = 0; i < cozumler.length; i += 8) cs.push({ cozumler: cozumler.slice(i, i + 8) });
      const kagit = { sinif: Number(sinif), ders, donem, yazili, kapsam, notMetni: "Bu içerik, öğrencilerin yazılı öncesi çalışmaları amacıyla Karemux tarafından hazırlanmıştır. Resmî sınav değildir. Doğru seçeneği işaretleyiniz; cevap anahtarı son sayfadadır.", sayfalar, kazanimTablosu: [], cozumSayfalari: cs };
      const html = kagitHtml(kagit, { logoUri: "", gorselUret });
      const sayfa = await tarayici.newPage({ viewport: { width: 900, height: 1200 } });
      await sayfa.setContent(html);
      const tasan = await sayfa.evaluate(() => [...document.querySelectorAll(".sayfa")].some((s) => { const a = s.querySelector(".icerik-alani"); return a.scrollHeight > a.clientHeight + 2; }));
      if (!tasan) { const ad = `${dizin}/${etiket}`.replace(/[^\w/.-]/g, "_"); await sayfa.pdf({ path: ad + ".pdf", format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } }); basarili = true; rapor.push(`${etiket}: OK ${secilen.length} soru, sayfa başı ${sp}`); }
      await sayfa.close();
    }
    if (!basarili) rapor.push(`${etiket}: TAŞMA (hiçbir sayfalama sığmadı)`);
  }
}
await tarayici.close();
fs.writeFileSync(path.join(dizin, "RAPOR.txt"), rapor.join("\n"));
const ok = rapor.filter((r) => r.includes(": OK")).length;
console.log(`::notice::yazılı üretimi: ${ok}/${rapor.length} başarılı`);
for (const r of rapor.filter((x) => !x.includes(": OK"))) console.log(`::warning::${r}`);
