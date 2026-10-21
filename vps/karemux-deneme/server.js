import express from "express";
import pg from "pg";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const izinliOrigin = ["https://karemux.com", "https://www.karemux.com", "https://karemux-nu.vercel.app"];
  const origin = req.headers.origin;
  if (izinliOrigin.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 80,
});

const JWT_SECRET = process.env.JWT_SECRET;
function kullaniciIdCoz(req) {
  try {
    const token = req.cookies?.karemux_token;
    if (!token) return null;
    const veri = jwt.verify(token, JWT_SECRET);
    return veri?.kullaniciId || null;
  } catch {
    return null;
  }
}

async function kullaniciIdVeyaGolge(req) {
  const gercekId = kullaniciIdCoz(req);
  if (gercekId) return gercekId;
  const cihazId = req.body?.cihazId || req.query?.cihazId;
  if (!cihazId) return null;
  const sonuc = await pool.query(
    `INSERT INTO kullanicilar (eposta, sifre_hash, ad)
     VALUES ($1, 'anon', 'Anonim')
     ON CONFLICT (eposta) DO UPDATE SET eposta = EXCLUDED.eposta
     RETURNING id`,
    [cihazId + "@anon.karemux.com"]
  );
  return sonuc.rows[0].id;
}

// --- A/B Kitapcigi (4 Eylul) - kopya onleme icin deterministik karistirma.
// Ayni ogrenci + ayni deneme = HER ZAMAN AYNI karisik sirayi gorur (sayfa
// yenilense de tutarli), ama farkli ogrenciler farkli siralarda gorur.
function seedliRastgele(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seedUret(metin) {
  let h = 0;
  for (let i = 0; i < metin.length; i++) {
    h = (Math.imul(31, h) + metin.charCodeAt(i)) | 0;
  }
  return h;
}

function seedliKaristir(dizi, rastgele) {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

function abKitapciğiOlustur(sorular, seedMetin) {
  const rastgele = seedliRastgele(seedUret(seedMetin));
  const soruSirasiKarisik = seedliKaristir(sorular, rastgele);
  return soruSirasiKarisik.map((s) => {
    if (!s.secenekler || s.dogruIndex == null) return s;
    const dogruMetin = s.secenekler[s.dogruIndex];
    const harfsizSecenekler = s.secenekler.map((sec) => sec.replace(/^[A-D]\)\s*/, ""));
    const dogruMetinHarfsiz = dogruMetin.replace(/^[A-D]\)\s*/, "");
    const indeksler = seedliKaristir([0, 1, 2, 3].slice(0, harfsizSecenekler.length), rastgele);
    const yeniSecenekler = indeksler.map((eskiIdx, yeniIdx) => `${String.fromCharCode(65 + yeniIdx)}) ${harfsizSecenekler[eskiIdx]}`);
    const yeniDogruIndex = indeksler.findIndex((eskiIdx) => harfsizSecenekler[eskiIdx] === dogruMetinHarfsiz);
    return { ...s, secenekler: yeniSecenekler, dogruIndex: yeniDogruIndex };
  });
}

app.get("/health", (req, res) => res.json({ ok: true, servis: "karemux-deneme" }));

// GET /aktif - il bazli filtreleme dahil, Vercel'deki /api/ulusal-deneme/aktif ile AYNI mantik
app.get("/aktif", async (req, res) => {
  try {
    const kullaniciId = await kullaniciIdVeyaGolge(req);
    let kullaniciIli = null;
    if (kullaniciId) {
      const kullanici = await pool.query(`SELECT il FROM kullanicilar WHERE id = $1`, [kullaniciId]);
      kullaniciIli = kullanici.rows[0]?.il || null;
    }
    const aktif = await pool.query(
      `SELECT id, ad, sinif, ders, sorular, acilis, kapanis FROM ulusal_denemeler
       WHERE acilis <= now() AND kapanis >= now() AND (kapsam = 'ulusal' OR il = $1)
       ORDER BY acilis DESC LIMIT 1`,
      [kullaniciIli]
    );
    if (aktif.rows.length === 0) {
      const gelecek = await pool.query(
        `SELECT ad, sinif, ders, acilis FROM ulusal_denemeler WHERE acilis > now() ORDER BY acilis ASC LIMIT 1`
      );
      return res.json({ aktifDeneme: null, gelecekDeneme: gelecek.rows[0] || null });
    }
    const deneme = aktif.rows[0];
    let zatenCozmus = false;
    if (kullaniciId) {
      const cozum = await pool.query(
        `SELECT id FROM ulusal_deneme_sonuclari WHERE ulusal_deneme_id = $1 AND kullanici_id = $2`,
        [deneme.id, kullaniciId]
      );
      zatenCozmus = cozum.rows.length > 0;
    }
    // A/B Kitapcigi - kullanici + deneme'ye ozel deterministik karisik sira
    const kitapcikSorulari = kullaniciId
      ? abKitapciğiOlustur(deneme.sorular, `${kullaniciId}-${deneme.id}`)
      : deneme.sorular;
    const soyulmusSorular = kitapcikSorulari.map((s) => ({ soru: s.soru, secenekler: s.secenekler }));
    res.json({
      aktifDeneme: { id: deneme.id, ad: deneme.ad, sinif: deneme.sinif, ders: deneme.ders, acilis: deneme.acilis, kapanis: deneme.kapanis, soruSayisi: deneme.sorular.length },
      sorular: zatenCozmus ? null : soyulmusSorular,
      zatenCozmus,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ aktifDeneme: null, gelecekDeneme: null });
  }
});

// POST /gonder - Vercel'deki /api/ulusal-deneme/gonder ile AYNI mantik
app.post("/gonder", async (req, res) => {
  try {
    const { ulusalDenemeId, cevaplar } = req.body;
    const kullaniciId = await kullaniciIdVeyaGolge(req);
    if (!kullaniciId) return res.status(401).json({ error: "Giris yapmalisin" });

    const deneme = await pool.query(`SELECT sorular, kapanis, ders FROM ulusal_denemeler WHERE id = $1`, [ulusalDenemeId]);
    if (deneme.rows.length === 0) return res.status(404).json({ error: "Deneme bulunamadi" });
    if (new Date(deneme.rows[0].kapanis) < new Date()) return res.status(400).json({ error: "Bu denemenin suresi doldu" });

    const zaten = await pool.query(`SELECT id FROM ulusal_deneme_sonuclari WHERE ulusal_deneme_id = $1 AND kullanici_id = $2`, [ulusalDenemeId, kullaniciId]);
    if (zaten.rows.length > 0) return res.status(400).json({ error: "Bu denemeyi zaten cozdun" });

    const ders = deneme.rows[0].ders;
    // A/B Kitapcigi - /aktif'te SERVE ETTIGIMIZ AYNI karisik sirayi burada
    // da uretiyoruz (ayni seed formulu), boylece cevaplar[i] dogru soruyla eslesiyor.
    const sorular = abKitapciğiOlustur(deneme.rows[0].sorular, `${kullaniciId}-${ulusalDenemeId}`);
    let dogru = 0, yanlis = 0, bos = 0;
    const altKonuOzet = {};
    const hataSatirlari = [];
    for (let i = 0; i < sorular.length; i++) {
      const s = sorular[i];
      const verilen = cevaplar[i];
      const altKonu = s.altKonu || "Genel";
      if (!altKonuOzet[altKonu]) altKonuOzet[altKonu] = { dogru: 0, yanlis: 0, bos: 0 };
      if (verilen === undefined || verilen === null) {
        bos++; altKonuOzet[altKonu].bos++;
      } else if (verilen === s.dogruIndex) {
        dogru++; altKonuOzet[altKonu].dogru++;
      } else {
        yanlis++; altKonuOzet[altKonu].yanlis++;
        hataSatirlari.push([kullaniciId, ders, altKonu, s.soru, JSON.stringify(s.secenekler), s.dogruIndex, verilen, s.aciklama || null]);
      }
    }
    const net = Math.max(0, dogru - yanlis / 3);

    if (hataSatirlari.length > 0) {
      try {
        const degerSatirlari = hataSatirlari.map((_, idx) => {
          const taban = idx * 8;
          return `($${taban+1}, $${taban+2}, $${taban+3}, $${taban+4}, $${taban+5}, $${taban+6}, $${taban+7}, $${taban+8})`;
        }).join(", ");
        await pool.query(
          `INSERT INTO hata_kitapcigi (kullanici_id, ders, alt_konu, soru, secenekler, dogru_index, verilen_index, aciklama) VALUES ${degerSatirlari}`,
          hataSatirlari.flat()
        );
      } catch (e) { /* engelleme */ }
    }

    const kullanici = await pool.query(`SELECT kurum_id FROM kullanicilar WHERE id = $1`, [kullaniciId]);
    await pool.query(
      `INSERT INTO ulusal_deneme_sonuclari (ulusal_deneme_id, kullanici_id, kurum_id, dogru, yanlis, bos, net)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [ulusalDenemeId, kullaniciId, kullanici.rows[0]?.kurum_id || null, dogru, yanlis, bos, net]
    );

    const karne = Object.keys(altKonuOzet).map((k) => ({ altKonu: k, ...altKonuOzet[k] }));
    const cevapAnahtari = sorular.map((s) => ({ dogruIndex: s.dogruIndex, aciklama: s.aciklama }));

    const siralamaSorgu = await pool.query(
      `WITH siralamalar AS (
         SELECT kullanici_id, RANK() OVER (ORDER BY net DESC) as sira, COUNT(*) OVER () as toplam
         FROM ulusal_deneme_sonuclari WHERE ulusal_deneme_id = $1
       )
       SELECT sira, toplam FROM siralamalar WHERE kullanici_id = $2`,
      [ulusalDenemeId, kullaniciId]
    );
    const siram = siralamaSorgu.rows[0]?.sira || 1;
    const toplamKatilimci = siralamaSorgu.rows[0]?.toplam || 1;
    const yuzdelikDilim = toplamKatilimci > 0 ? Math.round((1 - siram / toplamKatilimci) * 100) : null;

    res.json({ dogru, yanlis, bos, net, karne, cevapAnahtari, siram, toplamKatilimci, yuzdelikDilim });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gonderilemedi: " + e.message });
  }
});

const PORT = process.env.PORT || 8781;
app.listen(PORT, "127.0.0.1", () => console.log(`Karemux Deneme servisi ${PORT} portunda calisiyor`));
