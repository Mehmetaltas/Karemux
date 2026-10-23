// Mufredattaki her (sinif, ders, unite, alt_konu) icin sunulabilir konu paketi var mi? Gercek DB taramasi.
// Cikti: ders bazli ozet (annotation) + tam eksik listesi (eksik-konu-paketleri.json).
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
const sql = neon(process.env.DATABASE_URL);
const SINIFLAR = (process.env.SINIFLAR || "5,6,7,8").split(",").map(Number);

const kons = await sql`SELECT DISTINCT sinif, ders, unite, alt_konu FROM mufredat WHERE alt_konu IS NOT NULL AND alt_konu <> '' AND sinif = ANY(${SINIFLAR}) ORDER BY sinif, ders, unite, alt_konu`;
const paketler = await sql`SELECT DISTINCT sinif, ders, unite, konu FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi' AND (onay_durumu = 'onaylandi' OR onay_durumu IS NULL) AND icerik_json IS NOT NULL`;
const bekleyen = await sql`SELECT DISTINCT sinif, ders, unite, konu FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi' AND onay_durumu = 'bekliyor'`;
const anahtar = (r, k = r.alt_konu ?? r.konu) => [r.sinif, r.ders, r.unite, k].join("|");
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
for (const [k, o] of Object.entries(ozet)) { T += o.toplam; V += o.var; console.log(`::notice title=${k}::toplam ${o.toplam}, paket var ${o.var}, eksik ${o.eksik} (kalite bekleyen ${o.bekleyen})`); }
console.log(`::notice title=GENEL::sinif ${SINIFLAR.join(",")}: ${T} alt konu, ${V} paket var, ${T - V} eksik`);
fs.writeFileSync("eksik-konu-paketleri.json", JSON.stringify({ tarih: new Date().toISOString(), toplam: T, var: V, eksik }, null, 1));
