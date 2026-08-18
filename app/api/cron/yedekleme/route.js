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
    // Sabit, bilinen 5 tablo - dinamik SQL yerine ayri sorgular (daha guvenli,
    // ve bu projedeki eski @neondatabase/serverless surumu sql.unsafe()/sql.query()
    // desteklemiyor).
    const sayilar = {
      kullanicilar: (await sql`SELECT COUNT(*)::int AS adet FROM kullanicilar`)[0].adet,
      hata_kitapcigi: (await sql`SELECT COUNT(*)::int AS adet FROM hata_kitapcigi`)[0].adet,
      sinav_sonuclari: (await sql`SELECT COUNT(*)::int AS adet FROM sinav_sonuclari`)[0].adet,
      odemeler: (await sql`SELECT COUNT(*)::int AS adet FROM odemeler`)[0].adet,
      abonelikler: (await sql`SELECT COUNT(*)::int AS adet FROM abonelikler`)[0].adet,
    };
    const rapor = Object.entries(sayilar).map(([tablo, adet]) => `${tablo}: ${adet}`);
    const anormalDususVarMi = sayilar.kullanicilar === 0;

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
