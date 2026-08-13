import { sql } from "@/lib/db";
import { telegramMesajGonder } from "@/lib/telegram";

// Telegram'in her yeni mesajda cagirdigi webhook. Kullanici "/start KOD"
// gonderdiginde, KOD'u kullaniciyla eslestirip telegram_chat_id'sini kaydeder.
export async function POST(req) {
  try {
    const guvenlikTokeni = req.headers.get("x-telegram-bot-api-secret-token");
    if (guvenlikTokeni !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return Response.json({ ok: false }, { status: 401 });
    }

    const update = await req.json();
    const mesaj = update.message;
    if (!mesaj?.text) return Response.json({ ok: true });

    const chatId = mesaj.chat.id;
    const metin = mesaj.text.trim();

    if (metin.startsWith("/start")) {
      const kod = metin.replace("/start", "").trim();
      if (!kod) {
        await telegramMesajGonder(chatId, "👋 Merhaba! Karemux bildirimlerine bağlanmak için, uygulamadaki Profil sayfandan aldığın kodu buraya yapıştır (sadece kod, başka bir şey yazma).");
        return Response.json({ ok: true });
      }
      const kullanici = await sql`SELECT id, ad FROM kullanicilar WHERE telegram_baglanti_kodu = ${kod}`;
      if (kullanici.length === 0) {
        await telegramMesajGonder(chatId, "❌ Kod geçersiz veya süresi dolmuş. Uygulamadan yeni bir kod al.");
        return Response.json({ ok: true });
      }
      await sql`UPDATE kullanicilar SET telegram_chat_id = ${String(chatId)}, telegram_baglanti_kodu = NULL WHERE id = ${kullanici[0].id}`;
      await telegramMesajGonder(chatId, `✅ Bağlandın ${kullanici[0].ad}! Artık Karemux'taki önemli duyuruları buradan alacaksın.`);
      return Response.json({ ok: true });
    }

    // Kullanici dogrudan kodu (bassize /start olmadan) yapistirdiysa da yakalayalim
    const kullanici = await sql`SELECT id, ad FROM kullanicilar WHERE telegram_baglanti_kodu = ${metin}`;
    if (kullanici.length > 0) {
      await sql`UPDATE kullanicilar SET telegram_chat_id = ${String(chatId)}, telegram_baglanti_kodu = NULL WHERE id = ${kullanici[0].id}`;
      await telegramMesajGonder(chatId, `✅ Bağlandın ${kullanici[0].ad}! Artık Karemux'taki önemli duyuruları buradan alacaksın.`);
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
