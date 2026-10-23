// Mini Ders otomasyonu: onayli/kalite kontrolu gecmis konu paketlerinden slayt + seslendirmeli mp4 uretir.
// Kural: AI uretti = yayinladi DEGIL. Kayit 'kalite_bekliyor' acilir; yalniz admin 'yayinda' yapar.
// Ortam: DATABASE_URL (zorunlu), BLOB_READ_WRITE_TOKEN (yoksa mp4 yalniz CI artifact'i olur, katalog degismez), LIMIT, SINIF.
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { kazanimlariGetir } from "@/lib/kazanimlar";
import { slaytlariOlustur } from "./mini-video/slaytlar.mjs";
import { mp4Uret } from "./mini-video/uret.mjs";

const sql = neon(process.env.DATABASE_URL);
const LIMIT = Math.max(1, Math.min(20, Number(process.env.LIMIT) || 3));
const SINIF = process.env.SINIF ? Number(process.env.SINIF) : null;
const SES = process.env.TTS_SES || "tr-TR-EmelNeural";
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
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS video_katalogu_kimlik ON video_katalogu (sinif, ders, unite, COALESCE(alt_konu, ''), video_turu)`;
}

// Edge neural TTS (resmi olmayan istemci). Hata olursa cikis kodu != 0 -> is bu paketi atlar.
function tts(metin, hedef) {
  fs.writeFileSync(hedef + ".txt", metin);
  execFileSync("edge-tts", ["--voice", SES, "--file", hedef + ".txt", "--write-media", hedef], { stdio: ["ignore", "ignore", "pipe"], timeout: 60000 });
  if (!fs.existsSync(hedef) || fs.statSync(hedef).size < 2000) throw new Error("ses dosyasi bos");
}

// Ses saglayicisi calisiyor mu? Takilirsa tum is bosuna beklemesin.
try { tts("Merhaba, bu bir deneme.", `${CIKTI}/on-kontrol.mp3`); console.log("::notice title=tts::edge-tts calisiyor"); }
catch (e) { console.log(`::error title=tts::edge-tts calismiyor: ${String(e.message).slice(0, 250)} ${String(e.stderr || "").slice(0, 250)}`); process.exit(1); }
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
    const { slaytlar, neden } = slaytlariOlustur(paket, baglam);
    if (!slaytlar.length) { atlanan++; console.log(`::warning title=atlandi::${etiket}: ${neden}`); continue; }
    const dizin = `${CIKTI}/p${a.id}`;
    const cikti = `${CIKTI}/mini-${a.id}.mp4`;
    console.log(`::notice title=basladi::${etiket}: ${slaytlar.length} slayt`);
    const r = await mp4Uret({ slaytlar, baglam, tts, dizin, cikti });
    if (TOKEN) {
      const { url } = await put(`mini-ders/${a.sinif}-${a.id}.mp4`, fs.readFileSync(cikti), { access: "public", contentType: "video/mp4", token: TOKEN, addRandomSuffix: true });
      await sql`
        INSERT INTO video_katalogu (sinif, ders, unite, alt_konu, video_turu, yayin_yeri, url, sure_sn, durum, kalite_notu)
        VALUES (${a.sinif}, ${a.ders}, ${a.unite}, ${a.konu}, 'mini_ders', 'karemux', ${url}, ${r.sureSn}, 'kalite_bekliyor', 'otomatik uretim (slayt + edge-tts); insan incelemesi bekliyor')
        ON CONFLICT (sinif, ders, unite, COALESCE(alt_konu, ''), video_turu)
        DO UPDATE SET url = EXCLUDED.url, sure_sn = EXCLUDED.sure_sn, durum = 'kalite_bekliyor', guncelleme = now()
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
