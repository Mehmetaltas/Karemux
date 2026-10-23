import { sql } from "@/lib/db";

// Video Katalogu (V3 Dalga 7-8): videolar Content Core'un uyesi - sinif/ders/unite/alt_konu (+kazanim) kimligine baglidir.
// BU SURUM YALNIZ ALTYAPI + KATALOGDUR: gercek video yok; kayitlar 'planli' acilir, yalniz admin 'yayinda' yapar.
// AI uretti = yayinladi OLMAZ: durum akisi planli -> uretimde -> kalite_bekliyor -> yayinda (| hatali).
export const VIDEO_DURUMLARI = ["planli", "uretimde", "kalite_bekliyor", "yayinda", "hatali"];
export const VIDEO_TURLERI = ["mini_ders", "soru_cozumu", "tekrar", "konu_ozeti"];
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
    url text,
    durum text NOT NULL DEFAULT 'planli',
    kalite_notu text,
    olusturulma timestamptz NOT NULL DEFAULT now(),
    guncelleme timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS video_katalogu_kimlik ON video_katalogu (sinif, ders, unite, COALESCE(alt_konu, ''), video_turu)`;
  hazir = true;
}

// Yalniz https ve YouTube/Vimeo/Blob gibi bilinen yayin kaynaklari (serbest URL = SSRF/phishing riski)
export function videoUrlGecerliMi(u) {
  try {
    const x = new URL(u);
    return x.protocol === "https:" && /(^|\.)(youtube\.com|youtu\.be|vimeo\.com|public\.blob\.vercel-storage\.com)$/i.test(x.hostname);
  } catch { return false; }
}
