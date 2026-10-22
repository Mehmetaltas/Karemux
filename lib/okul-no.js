import { sql } from "@/lib/db";

// Kurum icinde ogrenciye atanan okul numarasi. Ayni kurumda bir numara tek ogrencide olur.
// Tablo ilk kullanimda kendiliginden olusur (elle SQL gerekmez).
let hazir = false;
export async function okulNoTablosuHazirla() {
  if (hazir) return;
  await sql`CREATE TABLE IF NOT EXISTS kurum_okul_no (
    kullanici_id integer PRIMARY KEY,
    kurum_id integer NOT NULL,
    okul_no text NOT NULL,
    olusturulma timestamptz NOT NULL DEFAULT now(),
    UNIQUE (kurum_id, okul_no)
  )`;
  hazir = true;
}

export const okulNoTemizle = (v) => String(v ?? "").trim().replace(/\s+/g, "").slice(0, 20);
export const okulNoGecerliMi = (v) => /^[A-Za-z0-9-]{1,20}$/.test(v);
