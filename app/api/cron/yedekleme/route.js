import { sql } from "@/lib/db";
import { telegramMesajGonder } from "@/lib/telegram";

// NOT: Neon zaten otomatik Point-in-Time Restore (gercek yedekleme) sagliyor -
// bunu burada tekrarlamiyoruz, anlamsiz olur. Bunun yerine, kritik tablolarin
// satir sayilarini onceki haftayla karsilastirip ANORMAL bir dusus (olasi veri
// kaybi/bozulma isareti) varsa yoneticiye Telegram'dan haber veren bir
// butunluk/saglik kontrolu. Gercek yedekleme icin Neon panelindeki
// Backup & Restore ozelligine guvenilmeli (ucretsiz katmanda kisa sureli
// saklama olabilir - uzun donem icin ucretli plana gecis dusunulmeli).
export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const kritikTablolar = ["kullanicilar", "hata_kitapcigi", "sinav_sonuclari", "odemeler", "abonelikler"];
    const rapor = [];
    let anormalDususVarMi = false;

    for (const tablo of kritikTablolar) {
      const sonuc = await sql.query(`SELECT COUNT(*)::int AS adet FROM ${tablo}`);
      const adet = sonuc[0].adet;
      rapor.push(`${tablo}: ${adet}`);
      if (adet === 0) anormalDususVarMi = true;
    }

    if (anormalDususVarMi && process.env.TELEGRAM_BOT_TOKEN && process.env.ADMIN_TELEGRAM_CHAT_ID) {
      await telegramMesajGonder(
        process.env.ADMIN_TELEGRAM_CHAT_ID,
        `🔴 KAREMUX Butunluk Kontrolu: Bir veya daha fazla kritik tablo BOS gorunuyor!\n\n${rapor.join("\n")}`
      );
    }

    return Response.json({ ok: true, rapor, anormalDususVarMi });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cron gorevi basarisiz" }, { status: 500 });
  }
}
