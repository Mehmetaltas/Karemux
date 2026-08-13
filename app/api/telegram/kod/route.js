import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { veliBaglantiKoduUret } from "@/lib/auth";

// Ogrenciye benzersiz bir kod verir - bu kodu Telegram botuna "/start KOD"
// seklinde gonderdiginde, webhook bu kodu kullaniciyla eslestirir.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

    const mevcut = await sql`SELECT telegram_chat_id, telegram_baglanti_kodu FROM kullanicilar WHERE id = ${kullaniciId}`;
    if (mevcut[0]?.telegram_chat_id) return Response.json({ baglandi: true });

    let kod = mevcut[0]?.telegram_baglanti_kodu;
    if (!kod) {
      kod = veliBaglantiKoduUret();
      await sql`UPDATE kullanicilar SET telegram_baglanti_kodu = ${kod} WHERE id = ${kullaniciId}`;
    }
    return Response.json({ baglandi: false, kod, botKullaniciAdi: process.env.TELEGRAM_BOT_USERNAME || null });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kod alınamadı" }, { status: 500 });
  }
}
