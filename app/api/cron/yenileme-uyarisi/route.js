import { sql } from "@/lib/db";
import { resendIstemcisi } from "@/lib/email";

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const yenilenecekler = await sql`
      SELECT a.id, a.plan, a.bitis, k.eposta, k.ad
      FROM abonelikler a
      JOIN kullanicilar k ON k.id = a.kullanici_id
      WHERE a.durum = 'aktif'
        AND a.bitis IS NOT NULL
        AND a.bitis BETWEEN now() AND now() + interval '3 days'
    `;

    let gonderilen = 0;
    for (const a of yenilenecekler) {
      try {
        await resendIstemcisi().emails.send({
          from: "Karemux <bildirim@karemux.com>",
          to: a.eposta,
          subject: "Karemux aboneligin 3 gun icinde yenilenecek",
          text: `Merhaba ${a.ad},\n\n${a.plan} aboneligin ${new Date(a.bitis).toLocaleDateString("tr-TR")} tarihinde otomatik yenilenecek.\n\nDevam etmek istemiyorsan karemux.com/hesap uzerinden tek tikla iptal edebilirsin.\n\nKaremux Ekibi`,
        });
        gonderilen++;
      } catch (e) {
        console.error(`${a.eposta} adresine e-posta gonderilemedi:`, e);
      }
    }

    return Response.json({ ok: true, kontrolEdilen: yenilenecekler.length, gonderilen });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cron gorevi basarisiz" }, { status: 500 });
  }
}
