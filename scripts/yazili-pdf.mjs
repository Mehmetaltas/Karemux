// Kullanım: node scripts/yazili-pdf.mjs <anahtar> <cikti-dizini>   (anahtar: mat7 | fen7 ...)
// Çıktı: <dizin>/<anahtar>.html, <anahtar>.pdf, <anahtar>-sN.png (sayfa önizlemeleri)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { kagitHtml } from "../lib/yazili-hazirlik/render.js";
import { gorselUret } from "../lib/gorsel-motoru.js";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const [anahtar, dizin = "yazili-cikti"] = process.argv.slice(2);
const kagitlar = {
  mat7: () => import("../lib/yazili-hazirlik/kagit-mat7.js").then((m) => m.KAGIT_MAT7),
  fen7: () => import("../lib/yazili-hazirlik/kagit-fen7.js").then((m) => m.KAGIT_FEN7),
};
if (!kagitlar[anahtar]) { console.error("bilinmeyen kagit:", anahtar, Object.keys(kagitlar)); process.exit(1); }
const kagit = await kagitlar[anahtar]();
const logoUri = "data:image/png;base64," + fs.readFileSync(path.resolve("public/icons/icon-192.png")).toString("base64");
fs.mkdirSync(dizin, { recursive: true });
const html = kagitHtml(kagit, { logoUri, gorselUret });
const htmlYol = path.resolve(dizin, `${anahtar}.html`);
fs.writeFileSync(htmlYol, html);
const tarayici = await chromium.launch();
const sayfa = await tarayici.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1.4 });
await sayfa.goto("file://" + htmlYol);
await sayfa.pdf({ path: path.resolve(dizin, `${anahtar}.pdf`), format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
const n = await sayfa.locator(".sayfa").count();
for (let i = 0; i < n; i++) await sayfa.locator(".sayfa").nth(i).screenshot({ path: path.resolve(dizin, `${anahtar}-s${i + 1}.png`) });
// Taşma denetimi: içerik alanından taşan sayfa var mı?
const tasan = await sayfa.evaluate(() => [...document.querySelectorAll(".sayfa")].map((s, i) => { const a = s.querySelector(".icerik-alani"); return a.scrollHeight > a.clientHeight + 2 ? `sayfa ${i + 1}: ${a.scrollHeight - a.clientHeight}px taşma` : null; }).filter(Boolean));
console.log(`sayfa: ${n}`, tasan.length ? "TAŞMA -> " + tasan.join("; ") : "taşma yok");
await tarayici.close();
