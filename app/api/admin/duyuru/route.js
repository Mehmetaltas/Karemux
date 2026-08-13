import { sql } from "@/lib/db";
import { telegramMesajGonder } from "@/lib/telegram";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

export async function POST(req) {
  try {
    const { sifre, mesaj, il, sinif } = await req.json();
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "telegram_duyuru", 5, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Çok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
      await denemeKaydet(ip, "telegram_duyuru", false);
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    await denemeKaydet(ip, "telegram_duyuru", true);
    if (!mesaj) return Response.json({ error: "Mesaj gerekli" }, { status: 400 });

    // Filtreye uyan, Telegram'a baglanmis kullanicilari bul.
    let alicilar;
    if (il && sinif) {
      alicilar = await sql`SELECT telegram_chat_id FROM kullanicilar WHERE telegram_chat_id IS NOT NULL AND il = ${il} AND sinif = ${sinif}`;
    } else if (il) {
      alicilar = await sql`SELECT telegram_chat_id FROM kullanicilar WHERE telegram_chat_id IS NOT NULL AND il = ${il}`;
    } else if (sinif) {
      alicilar = await sql`SELECT telegram_chat_id FROM kullanicilar WHERE telegram_chat_id IS NOT NULL AND sinif = ${sinif}`;
    } else {
      alicilar = await sql`SELECT telegram_chat_id FROM kullanicilar WHERE telegram_chat_id IS NOT NULL`;
    }

    // Telegram saniyede ~30 mesaj siniri koyuyor - kucuk bir bekleme ile guvenli ilerleriz.
    let basarili = 0, basarisiz = 0;
    for (const alici of alicilar) {
      try {
        await telegramMesajGonder(alici.telegram_chat_id, mesaj);
        basarili++;
      } catch (e) {
        basarisiz++;
      }
      await new Promise((r) => setTimeout(r, 40));
    }

    return Response.json({ ok: true, hedeflenen: alicilar.length, basarili, basarisiz });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
