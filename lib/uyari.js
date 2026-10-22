// 22 Ekim: yoneticiye Telegram uyarisi + ayni uyariyi tekrar tekrar gondermeyi onleyen kayit (uyari_log).
import { sql } from "@/lib/db";
import { telegramMesajGonder } from "@/lib/telegram";

let tabloHazir = false;
async function tabloKur() {
  if (tabloHazir) return;
  await sql`CREATE TABLE IF NOT EXISTS uyari_log (anahtar TEXT PRIMARY KEY, son_gonderim TIMESTAMP NOT NULL DEFAULT now(), mesaj TEXT)`;
  tabloHazir = true;
}

// Ayni anahtar icin `beklemeSaat` icinde tekrar gondermez. Telegram ayarli degilse false doner (hata firlatmaz).
export async function yoneticiUyar(anahtar, mesaj, beklemeSaat = 6) {
  try {
    await tabloKur();
    const son = await sql`SELECT 1 FROM uyari_log WHERE anahtar = ${anahtar} AND son_gonderim > now() - (${beklemeSaat} || ' hours')::interval`;
    if (son.length > 0) return false;
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.ADMIN_TELEGRAM_CHAT_ID) {
      console.warn("Yonetici uyarisi (Telegram ayarli degil):", anahtar, mesaj);
      return false;
    }
    await telegramMesajGonder(process.env.ADMIN_TELEGRAM_CHAT_ID, mesaj);
    await sql`
      INSERT INTO uyari_log (anahtar, son_gonderim, mesaj) VALUES (${anahtar}, now(), ${mesaj})
      ON CONFLICT (anahtar) DO UPDATE SET son_gonderim = now(), mesaj = EXCLUDED.mesaj
    `;
    return true;
  } catch (e) {
    console.error("Yonetici uyarisi gonderilemedi:", e.message);
    return false;
  }
}
