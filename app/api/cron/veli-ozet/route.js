import { sql } from "@/lib/db";
import { resendIstemcisi } from "@/lib/email";

// Her hafta, veliye bagli her ogrencinin haftalik ozetini gonderir.
// AI Privacy Shield ilkesine uygun: mail Karemux tarafindan olusturulan
// gercek sayilarla yazilir, herhangi bir dis AI cagrisi yapilmaz.
export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const veliler = await sql`
      SELECT DISTINCT v.id, v.eposta, v.ad
      FROM kullanicilar v
      JOIN veli_ogrenci vo ON vo.veli_id = v.id
      WHERE v.rol = 'veli'
    `;

    let gonderilen = 0;
    for (const veli of veliler) {
      const ogrenciler = await sql`
        SELECT k.id, k.ad FROM veli_ogrenci vo
        JOIN kullanicilar k ON k.id = vo.ogrenci_id
        WHERE vo.veli_id = ${veli.id}
      `;

      const bolumler = [];
      for (const ogrenci of ogrenciler) {
        const aktifGunler = await sql`
          SELECT COUNT(*)::int AS gun FROM gunluk_kullanim
          WHERE kullanici_id = ${ogrenci.id} AND tarih >= (CURRENT_DATE - interval '7 days') AND ai_istek_sayisi > 0
        `;
        const enZayif = await sql`
          SELECT ders, alt_konu, COUNT(*)::int AS hata_sayisi
          FROM hata_kitapcigi
          WHERE kullanici_id = ${ogrenci.id} AND cozuldu = false AND alt_konu IS NOT NULL
          GROUP BY ders, alt_konu ORDER BY hata_sayisi DESC LIMIT 1
        `;
        const gunSayisi = aktifGunler[0]?.gun || 0;
        const zayifMetni = enZayif.length > 0 ? `en cok "${enZayif[0].alt_konu}" (${enZayif[0].ders}) konusunda zorlaniyor` : "belirgin bir zayif nokta yok";
        bolumler.push(`${ogrenci.ad}: bu hafta ${gunSayisi}/7 gun aktif calisti, ${zayifMetni}.`);
      }

      if (bolumler.length === 0) continue;

      try {
        await resendIstemcisi().emails.send({
          from: "Karemux <bildirim@karemux.com>",
          to: veli.eposta,
          subject: "Karemux Haftalik Veli Ozeti",
          text: `Merhaba ${veli.ad},\n\nBu haftaki ozet:\n\n${bolumler.join("\n\n")}\n\nDetaylar icin uygulamadaki Veli Panelini ziyaret edebilirsin.\n\nKaremux Ekibi`,
        });
        gonderilen++;
      } catch (e) {
        console.error(`${veli.eposta} adresine veli ozeti gonderilemedi:`, e);
      }
    }

    return Response.json({ ok: true, kontrolEdilen: veliler.length, gonderilen });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cron gorevi basarisiz" }, { status: 500 });
  }
}
