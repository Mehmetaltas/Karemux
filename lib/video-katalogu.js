import { sql } from "@/lib/db";

// Video Katalogu (V3 Dalga 7-8): videolar Content Core'un uyesi - sinif/ders/unite/alt_konu (+kazanim) kimligine baglidir.
// BU SURUM YALNIZ ALTYAPI + KATALOGDUR: gercek video yok; kayitlar 'planli' acilir, yalniz admin 'yayinda' yapar.
// AI uretti = yayinladi OLMAZ: durum akisi planli -> uretimde -> kalite_bekliyor -> yayinda (| hatali).
export const VIDEO_DURUMLARI = ["planli", "uretimde", "kalite_bekliyor", "yayinda", "hatali"];
// IKI AYRI VIDEO URETIMI (kullanici karari):
//  - mini_ders: 6-7 dk SLAYT + seslendirme; Karemux uretir ve KENDI barindirir (Vercel Blob), sistemde oynar.
//  - uzun_anlatim: ogretmen anlatimi (kamera + akilli tahta), tam ders; YouTube'da yayinlanir, katalog yalniz baglantisini tutar.
// Katalog "adres" tutar cunku oynatici dosyanin nerede durdugunu bilmeli; adresin yeri turune gore sabittir.
export const VIDEO_TURLERI = ["mini_ders", "uzun_anlatim", "soru_cozumu", "tekrar"];
export const YAYIN_YERI = { mini_ders: "karemux", uzun_anlatim: "youtube", soru_cozumu: "karemux", tekrar: "karemux" };
const GECIS = {
  planli: ["uretimde", "hatali"],
  uretimde: ["kalite_bekliyor", "hatali"],
  kalite_bekliyor: ["yayinda", "uretimde", "hatali"],
  hatali: ["uretimde", "planli"],
  yayinda: ["kalite_bekliyor", "hatali"],
};
export function gecisGecerliMi(eski, yeni) { return !!GECIS[eski]?.includes(yeni); }

let hazir = false;
export async function videoTablosuHazirla() {
  if (hazir) return;
  await sql`CREATE TABLE IF NOT EXISTS video_katalogu (
    id serial PRIMARY KEY,
    sinif integer NOT NULL,
    ders text NOT NULL,
    unite text NOT NULL,
    alt_konu text,
    kazanim_kodu text,
    video_turu text NOT NULL DEFAULT 'mini_ders',
    seviye text,
    sure_sn integer,
    kaynak text NOT NULL DEFAULT 'video',
    yayin_yeri text NOT NULL DEFAULT 'karemux',
    url text,
    durum text NOT NULL DEFAULT 'planli',
    kalite_notu text,
    olusturulma timestamptz NOT NULL DEFAULT now(),
    guncelleme timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`ALTER TABLE video_katalogu ADD COLUMN IF NOT EXISTS yayin_yeri text NOT NULL DEFAULT 'karemux'`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS video_katalogu_kimlik ON video_katalogu (sinif, ders, unite, COALESCE(alt_konu, ''), video_turu)`;
  hazir = true;
}

// Adresin yeri turune gore sabit: Karemux'un kendi videolari (mini ders vb.) yalniz Vercel Blob'dan; ogretmen uzun anlatimi yalniz YouTube'dan.
// Serbest URL kabul edilmez (SSRF / kimlik avi riski).
export function videoUrlGecerliMi(u, tur = "mini_ders") {
  try {
    const x = new URL(u);
    if (x.protocol !== "https:") return false;
    if (YAYIN_YERI[tur] === "youtube") return /^(www\.|m\.)?(youtube\.com|youtu\.be)$/i.test(x.hostname);
    return /(^|\.)public\.blob\.vercel-storage\.com$/i.test(x.hostname);
  } catch { return false; }
}
