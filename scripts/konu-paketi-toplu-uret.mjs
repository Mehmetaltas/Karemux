// Eksik konu paketlerini (mufredat alt konulari) canli /api/konu-paketi ile sirayla uretir. Mevcut paket varsa API cache doner (maliyet 0).
// Ortam: SITE_URL, HEALTH_CHECK_SECRET, LIMIT (en fazla kac yeni uretim), SINIF (opsiyonel), DERS (opsiyonel), BEKLE_MS.
import fs from "node:fs";
const SITE = process.env.SITE_URL || "https://www.karemux.com";
const GIZLI = process.env.HEALTH_CHECK_SECRET || "";
const LIMIT = Math.max(1, Number(process.env.LIMIT) || 20);
const SINIF = process.env.SINIF ? Number(process.env.SINIF) : null;
const DERS = process.env.DERS || "";
const BEKLE = Number(process.env.BEKLE_MS) || 4000;
if (!GIZLI) { console.log("::error title=toplu::HEALTH_CHECK_SECRET yok"); process.exit(1); }
const rapor = JSON.parse(fs.readFileSync("eksik-konu-paketleri.json", "utf8"));
let liste = rapor.eksik.filter((x) => !x.kalite_bekliyor && (!SINIF || x.sinif === SINIF) && (!DERS || x.ders === DERS));
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
let uretilen = 0, hata = 0, bekliyor = 0, ard = 0;
for (const x of liste) {
  if (uretilen >= LIMIT) break;
  const url = `${SITE}/api/konu-paketi?sinif=${x.sinif}&ders=${encodeURIComponent(x.ders)}&unite=${encodeURIComponent(x.unite)}&konu=${encodeURIComponent(x.konu)}`;
  try {
    const res = await fetch(url, { headers: { "x-health-check-secret": GIZLI }, signal: AbortSignal.timeout(70000) });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.paket) {
      if (j.kaynak === "yeni_uretim") { uretilen++; ard = 0; console.log(`::notice title=uretildi::${x.sinif}. ${x.ders} / ${x.konu}`); }
    } else {
      hata++; ard++;
      console.log(`::warning title=hata::${x.sinif}. ${x.ders} / ${x.konu}: ${res.status} ${String(j.error || "").slice(0, 160)}`);
      if (res.status === 429 || ard >= 8) { console.log("::error title=toplu::kota/ard arda hata: durduruldu"); break; }
    }
  } catch (e) { hata++; ard++; console.log(`::warning title=hata::${x.konu}: ${String(e.message).slice(0, 160)}`); if (ard >= 8) break; }
  await bekle(BEKLE);
}
console.log(`::notice title=ozet::yeni uretilen ${uretilen}, hata ${hata}, aday ${liste.length}`);
