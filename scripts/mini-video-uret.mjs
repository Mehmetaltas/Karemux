// Mini Ders otomasyonu: onayli/kalite kontrolu gecmis konu paketlerinden slayt + seslendirmeli mp4 uretir.
// Kural: AI uretti = yayinladi DEGIL. Kayit 'kalite_bekliyor' acilir; yalniz admin 'yayinda' yapar.
// Ortam: DATABASE_URL (zorunlu), BLOB_READ_WRITE_TOKEN (yoksa mp4 yalniz CI artifact'i olur, katalog degismez), LIMIT, SINIF.
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { kazanimlariGetir } from "@/lib/kazanimlar";
import { senaryodanSlaytlar } from "./mini-video/slaytlar.mjs";
import { usdTryKuruGetir } from "@/lib/ai-fiyatlandirma";
import { mp4Uret } from "./mini-video/uret.mjs";

const sql = neon(process.env.DATABASE_URL);
const LIMIT = Math.max(1, Math.min(20, Number(process.env.LIMIT) || 3));
const SINIF = process.env.SINIF ? Number(process.env.SINIF) : null;
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";
const CIKTI = "mini-video-cikti";
fs.mkdirSync(CIKTI, { recursive: true });

async function tablo() {
  await sql`CREATE TABLE IF NOT EXISTS video_katalogu (
    id serial PRIMARY KEY, sinif integer NOT NULL, ders text NOT NULL, unite text NOT NULL, alt_konu text, kazanim_kodu text,
    video_turu text NOT NULL DEFAULT 'mini_ders', seviye text, sure_sn integer, kaynak text NOT NULL DEFAULT 'video',
    yayin_yeri text NOT NULL DEFAULT 'karemux', url text, durum text NOT NULL DEFAULT 'planli', kalite_notu text,
    olusturulma timestamptz NOT NULL DEFAULT now(), guncelleme timestamptz NOT NULL DEFAULT now())`;
  await sql`ALTER TABLE video_katalogu ADD COLUMN IF NOT EXISTS yayin_yeri text NOT NULL DEFAULT 'karemux'`;
  await sql`ALTER TABLE video_katalogu ADD COLUMN IF NOT EXISTS mufredat_yili text`;
  await sql`ALTER TABLE video_katalogu ADD COLUMN IF NOT EXISTS uretim_tarihi date`;
  await sql`ALTER TABLE video_katalogu ADD COLUMN IF NOT EXISTS uretim_maliyet_tl numeric(10,2)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS video_katalogu_kimlik ON video_katalogu (sinif, ders, unite, COALESCE(alt_konu, ''), video_turu)`;
}

// Dogal ses + ogretmen senaryosu: Karemux sunucusundaki /api/admin/video-yardim (Gemini TTS; anahtar Vercel'de, burada yok).
const SITE = process.env.SITE_URL || "https://www.karemux.com";
const GIZLI = process.env.HEALTH_CHECK_SECRET || "";
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
async function yardim(govde, deneme = 4) {
  let son = "";
  for (let k = 0; k < deneme; k++) {
    try {
      const res = await fetch(`${SITE}/api/admin/video-yardim`, { method: "POST", headers: { "Content-Type": "application/json", "x-health-check-secret": GIZLI }, body: JSON.stringify(govde), signal: AbortSignal.timeout(65000) });
      const j = await res.json().catch(() => ({}));
      if (res.ok) return j;
      son = `${res.status} ${j.hata || ""}`;
    } catch (e) { son = String(e.message); }
    await bekle(8000 * (k + 1));
  }
  throw new Error("video-yardim: " + son.slice(0, 250));
}
// Her ders icin hep ayni hoca: dersin adindan kadin/erkek secilir (bir kadin, bir erkek ogretmen).
const hocaSec = (ders) => ([...String(ders)].reduce((t, c) => t + c.charCodeAt(0), 0) % 2 === 0 ? "kadin" : "erkek");
let HOCA = "kadin";
let HARCAMA_USD = 0; // her video icin sifirlanir; senaryo + ses ucretlerinin toplami
const MUFREDAT_YILI = process.env.MUFREDAT_YILI || "2026-2027";
async function tts(metin, hedef) {
  const j = await yardim({ islem: "ses", metin, ses: HOCA });
  HARCAMA_USD += Number(j.ucretUsd) || 0;
  fs.writeFileSync(hedef, Buffer.from(j.wav, "base64"));
  if (fs.statSync(hedef).size < 4000) throw new Error("ses dosyasi bos");
}

if (!GIZLI) { console.log("::error title=tts::HEALTH_CHECK_SECRET yok"); process.exit(1); }
try { await tts("Merhaba, bu bir deneme.", `${CIKTI}/on-kontrol.wav`); console.log("::notice title=tts::gemini tts calisiyor"); }
catch (e) { console.log(`::error title=tts::gemini tts calismiyor: ${String(e.message).slice(0, 300)}`); process.exit(1); }

await tablo();
const adaylar = await sql`
  SELECT DISTINCT ON (o.sinif, o.ders, o.unite, o.konu) o.id, o.sinif, o.ders, o.unite, o.konu, o.icerik_json
  FROM icerik_onbellek o
  WHERE o.icerik_turu = 'konu_paketi' AND (o.onay_durumu = 'onaylandi' OR o.onay_durumu IS NULL)
    AND o.konu IS NOT NULL AND o.konu <> ''
    AND (${SINIF}::int IS NULL OR o.sinif = ${SINIF}::int)
    AND NOT EXISTS (SELECT 1 FROM video_katalogu v WHERE v.sinif = o.sinif AND v.ders = o.ders AND v.unite = o.unite
                    AND v.alt_konu = o.konu AND v.video_turu = 'mini_ders' AND v.url IS NOT NULL)
  ORDER BY o.sinif, o.ders, o.unite, o.konu, (o.onay_durumu = 'onaylandi') DESC NULLS LAST, o.olusturulma DESC`;
console.log(`::notice title=aday::${adaylar.length} konu paketi video bekliyor, bu calismada en fazla ${LIMIT} uretilecek`);

fs.mkdirSync(CIKTI, { recursive: true });
let uretilen = 0, atlanan = 0;
for (const a of adaylar) {
  if (uretilen >= LIMIT) break;
  const etiket = `${a.sinif}. ${a.ders} / ${a.unite} / ${a.konu}`;
  try {
    const paket = typeof a.icerik_json === "string" ? JSON.parse(a.icerik_json) : a.icerik_json;
    const baglam = { sinif: a.sinif, ders: a.ders, unite: a.unite, konu: a.konu, kazanimlar: kazanimlariGetir(a.ders, a.sinif, a.konu, a.unite, 3) };
    HARCAMA_USD = 0;
    const sj = await yardim({ islem: "senaryo", baglam, paket: { anlatim: paket.anlatim } });
    HARCAMA_USD += Number(sj.ucretUsd) || 0;
    const { slaytlar, neden } = senaryodanSlaytlar(sj.slaytlar, paket, baglam);
    HOCA = hocaSec(a.ders);
    if (!slaytlar.length) { atlanan++; console.log(`::warning title=atlandi::${etiket}: ${neden}`); continue; }
    const dizin = `${CIKTI}/p${a.id}`;
    const cikti = `${CIKTI}/mini-${a.id}.mp4`;
    console.log(`::notice title=basladi::${etiket}: ${slaytlar.length} slayt`);
    const r = await mp4Uret({ slaytlar, baglam, tts, dizin, cikti });
    // Muhasebe: harcama gercekten yapildi -> blob olsun olmasin gider olarak, uretim gunu/ayi ile yazilir (yillik ve aylik raporlarda gorunur).
    const kur = await usdTryKuruGetir();
    const maliyetTl = Math.round(HARCAMA_USD * kur * 100) / 100;
    const bugun = new Date().toISOString().slice(0, 10);
    await sql`INSERT INTO giderler (kategori, tutar_tl, aciklama, tekrarlayan, tarih)
      VALUES ('video_uretimi', ${maliyetTl}, ${`Mini video (${a.sinif}. sinif ${a.ders} / ${a.konu}): senaryo + Gemini TTS ${HARCAMA_USD.toFixed(4)} USD x ${kur} kur; ${r.sureSn} sn; muhasebe ayi ${bugun.slice(0, 7)}; mufredat yili ${MUFREDAT_YILI}; liste fiyati`}, false, ${bugun})`;
    console.log(`::notice title=maliyet::${etiket}: ${HARCAMA_USD.toFixed(4)} USD = ${maliyetTl} TL (kur ${kur}) giderlere yazildi`);
    if (TOKEN) {
      const { url } = await put(`mini-ders/${a.sinif}-${a.id}.mp4`, fs.readFileSync(cikti), { access: "public", contentType: "video/mp4", token: TOKEN, addRandomSuffix: true });
      await sql`
        INSERT INTO video_katalogu (sinif, ders, unite, alt_konu, video_turu, yayin_yeri, url, sure_sn, durum, kalite_notu, mufredat_yili, uretim_tarihi, uretim_maliyet_tl)
        VALUES (${a.sinif}, ${a.ders}, ${a.unite}, ${a.konu}, 'mini_ders', 'karemux', ${url}, ${r.sureSn}, 'kalite_bekliyor', 'otomatik uretim (ogretmen senaryosu + gemini tts); insan incelemesi bekliyor', ${MUFREDAT_YILI}, ${new Date().toISOString().slice(0, 10)}, ${maliyetTl})
        ON CONFLICT (sinif, ders, unite, COALESCE(alt_konu, ''), video_turu)
        DO UPDATE SET url = EXCLUDED.url, sure_sn = EXCLUDED.sure_sn, durum = 'kalite_bekliyor', guncelleme = now(), mufredat_yili = EXCLUDED.mufredat_yili, uretim_tarihi = EXCLUDED.uretim_tarihi, uretim_maliyet_tl = COALESCE(video_katalogu.uretim_maliyet_tl, 0) + EXCLUDED.uretim_maliyet_tl
        WHERE video_katalogu.durum <> 'yayinda'`;
      console.log(`::notice title=uretildi::${etiket} -> ${r.sureSn} sn, ${r.slaytSayisi} slayt, katalogda kalite_bekliyor`);
    } else {
      console.log(`::warning title=blob yok::${etiket}: mp4 uretildi (${r.sureSn} sn) ama BLOB_READ_WRITE_TOKEN tanimli degil; katalog degismedi, dosya CI artifact'inda`);
    }
    uretilen++;
  } catch (e) {
    atlanan++;
    console.log(`::error title=uretilemedi::${etiket}: ${String(e.message).slice(0, 250)}`);
  }
}
console.log(`::notice title=ozet::uretilen ${uretilen}, atlanan ${atlanan}`);
if (uretilen === 0 && adaylar.length > 0) process.exit(1);
