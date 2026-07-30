// Vercel Cron her gün bu route'u tetikler (bkz. vercel.json).
// 3 gün içinde yenilenecek abonelikleri bulur ve kullanıcıya e-posta uyarısı gönderir.
// Kunduz şikayetlerinde sık görülen "haber vermeden kart kesildi" sorununa karşı.
import { sql } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  // Vercel Cron dışından çağrılmasını engellemek için basit bir gizli anahtar kontrolü
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
        await resend.emails.send({
          from: "Karemux <bildirim@karemux.com>",
          to: a.eposta,
          subject: "Karemux aboneliğin 3 gün içinde yenilenecek",
          text: `Merhaba ${a.ad},\n\n${a.plan} aboneliğin ${new Date(a.bitis).toLocaleDateString("tr-TR")} tarihinde otomatik olarak yenilenecek.\n\nDevam etmek istemiyorsan karemux.com/hesap üzerinden tek tıkla iptal edebilirsin — hiçbir ücret çekilmez.\n\nKaremux Ekibi`,
        });
        gonderilen++;
      } catch (e) {
        console.error(`${a.eposta} adresine e-posta gönderilemedi:`, e);
      }
    }

    return Response.json({ ok: true, kontrolEdilen: yenilenecekler.length, gonderilen });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cron görevi başarısız" }, { status: 500 });
  }
}
