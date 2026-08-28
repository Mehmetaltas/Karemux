import { sql } from "@/lib/db";
import { resendIstemcisi } from "@/lib/email";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "rapor_gonder_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "rapor_gonder_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "rapor_gonder_admin", true);
  return { izinVar: true };
}

export async function POST(req) {
  try {
    const { sifre, denemeId } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!denemeId) return Response.json({ error: "denemeId gerekli" }, { status: 400 });

    const deneme = await sql`SELECT id, ad, ders, sinif FROM ulusal_denemeler WHERE id = ${denemeId}`;
    if (deneme.length === 0) return Response.json({ error: "Deneme bulunamadi" }, { status: 404 });

    const kurumOzetleri = await sql`
      SELECT k.id, k.ad, k.eposta,
        COUNT(s.id)::int AS ogrenci_sayisi,
        ROUND(AVG(s.net)::numeric, 2) AS ortalama_net,
        MAX(s.net) AS en_yuksek_net
      FROM ulusal_deneme_sonuclari s
      JOIN kurumlar k ON k.id = s.kurum_id
      WHERE s.ulusal_deneme_id = ${denemeId} AND k.eposta IS NOT NULL AND k.eposta != ''
      GROUP BY k.id, k.ad, k.eposta
    `;

    if (kurumOzetleri.length === 0) {
      return Response.json({ ok: true, gonderilenKurumSayisi: 0, not: "E-postasi olan kurum bulunamadi veya bu denemede kurum ogrencisi yok" });
    }

    let gonderilen = 0;
    for (const k of kurumOzetleri) {
      try {
        await resendIstemcisi().emails.send({
          from: "Karemux <bildirim@karemux.com>",
          to: k.eposta,
          subject: `${deneme[0].ad} - Kurum Sonuc Raporu`,
          html: `
            <h2>${deneme[0].ad}</h2>
            <p>${deneme[0].ders} - ${deneme[0].sinif}. sinif</p>
            <p><strong>${k.ad}</strong> kurumu icin ozet sonuclar:</p>
            <ul>
              <li>Katilan ogrenci sayisi: ${k.ogrenci_sayisi}</li>
              <li>Ortalama net: ${k.ortalama_net}</li>
              <li>En yuksek net: ${k.en_yuksek_net}</li>
            </ul>
            <p>Detayli sonuclar icin kurum panelinize giris yapabilirsiniz.</p>
          `,
        });
        gonderilen++;
      } catch (e) { console.error(`Rapor gonderilemedi (kurum ${k.id}):`, e); }
    }

    return Response.json({ ok: true, gonderilenKurumSayisi: gonderilen, toplamKurum: kurumOzetleri.length });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
