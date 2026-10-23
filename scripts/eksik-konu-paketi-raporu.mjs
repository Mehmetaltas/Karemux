// Mufredattaki her (sinif, ders, unite, alt_konu) icin sunulabilir konu paketi var mi? Gercek DB taramasi.
// Cikti: ders bazli ozet (annotation) + tam eksik listesi (eksik-konu-paketleri.json).
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
const sql = neon(process.env.DATABASE_URL);
const SINIFLAR = (process.env.SINIFLAR || "5,6,7,8").split(",").map(Number);

import { YILLIK_PLAN } from "../lib/yillik-plan.data.js";
const HARITA = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u", "’": "'", "‘": "'" };
const katla = (s) => String(s || "").replace(/İ/g, "i").replace(/I/g, "i").toLowerCase().replace(/i̇|[çğıöşüâîû’‘]/g, (c) => HARITA[c] || c).replace(/\s+/g, " ").trim();

// Resmi alt konu listesi: yillik plandaki "konu" sutunlari ("; " ile ayrili) + Ingilizce (plan serbest metin; DB mufredat tablosundaki temalar).
const harita = new Map();
for (const [key, rows] of Object.entries(YILLIK_PLAN)) {
  const [ders, sinifS] = key.split("::"); const sinif = Number(sinifS);
  if (!SINIFLAR.includes(sinif) || ders === "Ingilizce") continue;
  for (const [hafta, unite, konu] of rows) for (const k of String(konu || "").split("; ")) {
    const t = k.trim(); if (!t) continue;
    const id = [sinif, ders, katla(unite), katla(t)].join("|");
    if (!harita.has(id)) harita.set(id, { sinif, ders, unite, alt_konu: t });
  }
}
const ing = await sql`SELECT DISTINCT sinif, ders, unite, alt_konu FROM mufredat WHERE ders = 'Ingilizce' AND alt_konu IS NOT NULL AND alt_konu <> '' AND sinif = ANY(${SINIFLAR})`;
for (const r of ing) harita.set([r.sinif, r.ders, katla(r.unite), katla(r.alt_konu)].join("|"), { sinif: r.sinif, ders: r.ders, unite: r.unite, alt_konu: r.alt_konu });
const kons = [...harita.values()].sort((a, b) => a.sinif - b.sinif || a.ders.localeCompare(b.ders) || a.unite.localeCompare(b.unite));
const paketler = await sql`SELECT DISTINCT sinif, ders, unite, konu FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi' AND (onay_durumu = 'onaylandi' OR onay_durumu IS NULL) AND icerik_json IS NOT NULL`;
const bekleyen = await sql`SELECT DISTINCT sinif, ders, unite, konu FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi' AND onay_durumu = 'bekliyor'`;
// Eslesme: sinif + ders + konu adi (unite yazim farklari yok sayilir)
const anahtar = (r, k = r.alt_konu ?? r.konu) => [r.sinif, r.ders, katla(k)].join("|");
const var1 = new Set(paketler.map((r) => anahtar(r)));
const bek = new Set(bekleyen.map((r) => anahtar(r)));
const ozet = {}; const eksik = [];
for (const r of kons) {
  const o = (ozet[`${r.sinif}. ${r.ders}`] ||= { toplam: 0, var: 0, eksik: 0, bekleyen: 0 });
  o.toplam++;
  if (var1.has(anahtar(r))) o.var++;
  else { o.eksik++; if (bek.has(anahtar(r))) o.bekleyen++; eksik.push({ sinif: r.sinif, ders: r.ders, unite: r.unite, konu: r.alt_konu, kalite_bekliyor: bek.has(anahtar(r)) }); }
}
let T = 0, V = 0;
for (const o of Object.values(ozet)) { T += o.toplam; V += o.var; }
const bolum = {}; for (const [k, o] of Object.entries(ozet)) { const sn = k.split(". ")[0]; (bolum[sn] ||= []).push(`${k.split(". ")[1]}:${o.toplam}/${o.var}`); }
for (const [sn, l] of Object.entries(bolum)) console.log(`::notice title=sinif ${sn}::${l.join(" | ")} (toplam/var)`);
console.log(`::notice title=GENEL::sinif ${SINIFLAR.join(",")}: ${T} alt konu, ${V} paket var, ${T - V} eksik`);
fs.writeFileSync("eksik-konu-paketleri.json", JSON.stringify({ tarih: new Date().toISOString(), toplam: T, var: V, eksik }, null, 1));
