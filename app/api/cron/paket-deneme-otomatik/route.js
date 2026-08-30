import { sql } from "@/lib/db";
import { denemeOlustur } from "@/lib/ulusalDenemeOlustur";

// Kamp/Grup Dersi/Soru Cozum/Rehberlik-Kocluk katilimcilarina, 4 haftada
// (ayda) 2 kez, il bazli TAM deneme (5 ders bir arada, LGS formati) acar.
// Haftalik cron'un (ulusal-deneme-otomatik) UZERINE, sadece cift haftalarda
// calisan AYRI bir mekanizma - o cron'u degistirmiyoruz.
const SINIFLAR = [5, 6, 7, 8];
const DERSLER = ["Matematik", "Turkce", "Fen Bilimleri", "T.C. Inkilap Tarihi ve Ataturkculuk", "Ingilizce"];

// Gercek maliyet formulu (app/api/admin/simulasyon/route.js ile AYNI sabitler,
// 19 Agustos 2026 arastirmasi - Gemini 3.6 Flash, USD/TRY 47.93):
const USD_TRY = 47.93;
const GIRDI_FIYAT_USD_MTOK = 1.50;
const CIKTI_FIYAT_USD_MTOK = 7.50;
const ORTALAMA_GIRDI_TOKEN = 800;
const DENEME_CIKTI_TOKEN = 8000; // 20 soru
function tekDersManiyeti() {
  const girdi = (ORTALAMA_GIRDI_TOKEN / 1_000_000) * GIRDI_FIYAT_USD_MTOK;
  const cikti = (DENEME_CIKTI_TOKEN / 1_000_000) * CIKTI_FIYAT_USD_MTOK;
  return Math.round((girdi + cikti) * USD_TRY * 10000) / 10000;
}

function haftaNumarasi() {
  const simdi = new Date();
  const yilBasi = new Date(simdi.getFullYear(), 0, 1);
  return Math.ceil(((simdi - yilBasi) / 86400000 + yilBasi.getDay() + 1) / 7);
}

// Bir sonraki Cumartesi 09:00'a acilis, Pazar 23:59'a kapanis.
function haftaSonuPenceresi() {
  const simdi = new Date();
  const gun = simdi.getDay(); // 0=Pazar, 6=Cumartesi
  const cumartesiyeKalan = (6 - gun + 7) % 7 || 7;
  const acilis = new Date(simdi);
  acilis.setDate(simdi.getDate() + cumartesiyeKalan);
  acilis.setHours(10, 0, 0, 0);
  const kapanis = new Date(acilis);
  kapanis.setDate(acilis.getDate() + 1);
  kapanis.setHours(23, 59, 0, 0);
  return { acilis, kapanis };
}

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const hafta = haftaNumarasi();
  if (hafta % 2 !== 0) {
    return Response.json({ ok: true, atlandi: true, sebep: "Bu hafta paket denemesi haftasi degil (cift haftalarda calisir)." });
  }

  // Aktif Kamp/Grup Dersi/Soru Cozum/Rehberlik oturumlarina kayitli
  // (odenmis) ogrencilerin sinif+il kombinasyonlarini bul.
  const kombinasyonlar = await sql`
    SELECT DISTINCT k.sinif, k.il
    FROM canli_ders_katilimcilari kat
    JOIN canli_ders_oturumlari o ON o.id = kat.oturum_id
    JOIN kullanicilar k ON k.id = kat.ogrenci_id
    WHERE kat.odendi = true AND o.tur IN ('grup', 'kamp', 'soru_cozum', 'rehberlik')
      AND k.sinif IS NOT NULL AND k.il IS NOT NULL AND k.il != ''
  `;

  // Kocluk (birebir, randevu tablosunda) ogrencilerini de ekle.
  const kocKombinasyonlari = await sql`
    SELECT DISTINCT k.sinif, k.il
    FROM randevular r
    JOIN kullanicilar k ON k.id = r.ogrenci_id
    WHERE r.odendi = true AND k.sinif IS NOT NULL AND k.il IS NOT NULL AND k.il != ''
  `;

  const tumKombinasyonlar = [...kombinasyonlar, ...kocKombinasyonlari]
    .filter((v, i, arr) => arr.findIndex((x) => x.sinif === v.sinif && x.il === v.il) === i);

  const { acilis, kapanis } = haftaSonuPenceresi();
  const tarihEtiketi = acilis.toLocaleDateString("tr-TR");
  const sonuclar = [];
  let toplamMaliyet = 0;

  for (const { sinif, il } of tumKombinasyonlar) {
    if (!SINIFLAR.includes(sinif)) continue;
    for (const ders of DERSLER) {
      try {
        const sonuc = await denemeOlustur({
          ad: `Paket Denemesi - ${ders} - ${sinif}. Sinif - ${il} - ${tarihEtiketi}`,
          sinif, ders, soruSayisi: 20,
          acikKalmaSaati: Math.round((kapanis - acilis) / 3600000),
          kapsam: "yerel", il,
        });
        toplamMaliyet += tekDersManiyeti();
        sonuclar.push({ sinif, il, ders, id: sonuc.id });
      } catch (e) {
        console.error(`Paket denemesi olusturulamadi (${sinif}. sinif, ${il}, ${ders}):`, e.message);
        sonuclar.push({ sinif, il, ders, hata: e.message });
      }
    }
  }

  if (toplamMaliyet > 0) {
    await sql`
      INSERT INTO giderler (kategori, tutar_tl, aciklama, tekrarlayan)
      VALUES ('ai_maliyeti', ${Math.round(toplamMaliyet * 100) / 100}, ${`Paket (Kamp/Grup/Soru Cozum/Rehberlik-Kocluk) il bazli deneme uretimi - ${tarihEtiketi} (${tumKombinasyonlar.length} sinif/il kombinasyonu x ${DERSLER.length} ders)`}, false)
    `;
  }

  return Response.json({ ok: true, hafta, kombinasyonSayisi: tumKombinasyonlar.length, toplamMaliyet, sonuclar });
}
