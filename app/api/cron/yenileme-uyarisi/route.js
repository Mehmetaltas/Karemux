import { sql } from "@/lib/db";
import { resendIstemcisi } from "@/lib/email";

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const yenilenecekler = await sql`
      SELECT a.id, a.plan, a.bitis, a.iyzico_abonelik_id, k.eposta, k.ad
      FROM abonelikler a
      JOIN kullanicilar k ON k.id = a.kullanici_id
      WHERE a.durum = 'aktif'
        AND a.bitis IS NOT NULL
        AND a.bitis >= now() + interval '2 days' AND a.bitis < now() + interval '3 days'
    `;

    // 22 Ekim: cron GUNDE BIR kez calisir; eski 0-3 gun penceresi ayni kisiye 3 gun ust uste e-posta atiyordu.
    // Pencere artik 2-3 gun arasi: her abonelik icin tam bir e-posta. Kart ile otomatik tahsilat YALNIZ iyzico abonelik kodu
    // olan kayitlarda vardir; havale/kurum aboneligi sure sonunda biter, metin buna gore yazilir.
    let gonderilen = 0;
    for (const a of yenilenecekler) {
      try {
        await resendIstemcisi().emails.send({
          from: "Karemux <bildirim@karemux.com>",
          to: a.eposta,
          subject: a.iyzico_abonelik_id ? "Karemux aboneliğin 3 gün içinde yenilenecek" : "Karemux aboneliğin 3 gün içinde sona erecek",
          text: a.iyzico_abonelik_id
            ? `Merhaba ${a.ad},\n\n${a.plan} aboneliğin ${new Date(a.bitis).toLocaleDateString("tr-TR")} tarihinde otomatik yenilenecek.\n\nDevam etmek istemiyorsan karemux.com/hesap üzerinden tek tıkla iptal edebilirsin.\n\nKaremux Ekibi`
            : `Merhaba ${a.ad},\n\n${a.plan} aboneliğin ${new Date(a.bitis).toLocaleDateString("tr-TR")} tarihinde sona erecek. Kesintisiz devam etmek için karemux.com üzerinden paketini yenileyebilirsin.\n\nKaremux Ekibi`,
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
