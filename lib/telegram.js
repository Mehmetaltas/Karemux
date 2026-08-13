// Telegram Bot API - ucretsiz, API anahtari sadece BotFather'dan alinan token.
// Vercel'e TELEGRAM_BOT_TOKEN ortam degiskenini eklemen gerekiyor.

export async function telegramMesajGonder(chatId, metin) {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: metin, parse_mode: "HTML" }),
  });
  return res.json();
}
