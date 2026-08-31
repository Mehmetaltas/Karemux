import { sql } from "@/lib/db";
import { veliOnayTokenUret } from "@/lib/auth";
import { resendIstemcisi } from "@/lib/email";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_hesap_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "ogretmen_hesap_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "ogretmen_hesap_admin", true);
  return { izinVar: true };
}

// Admin, onaylanmis bir ogretmene giris hesabi acar - artik gecici sifreyi
// ELLE ILETMIYOR (31 Agustos duzeltmesi): guvenli bir token uretilip
// ogretmenin e-postasina "sifreni belirle" linki gonderiliyor, tipki
// veli-onay akisindaki kanitlanmis desenle.
export async function POST(req) {
  try {
    const { sifre, ogretmenId, eposta } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!ogretmenId || !eposta?.trim()) return Response.json({ error: "Eksik bilgi" }, { status: 400 });

    const ogretmen = await sql`SELECT ad FROM ogretmenler WHERE id = ${ogretmenId}`;
    if (ogretmen.length === 0) return Response.json({ error: "Ogretmen bulunamadi" }, { status: 404 });

    const token = veliOnayTokenUret();
    await sql`
      UPDATE ogretmenler
      SET eposta = ${eposta.trim().toLowerCase()}, sifre_belirleme_token = ${token}, sifre_belirleme_son_tarih = now() + interval '48 hours'
      WHERE id = ${ogretmenId}
    `;

    const link = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.karemux.com"}/ogretmen-sifre-belirle?token=${token}`;
    try {
      await resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: eposta.trim(),
        subject: "Karemux Öğretmen Hesabın Hazır",
        text: `Merhaba ${ogretmen[0].ad},\n\nKaremux öğretmen paneline erişimin onaylandı. Şifreni belirlemek için aşağıdaki linke tıkla:\n\n${link}\n\nBu link 48 saat geçerlidir.\n\nKaremux Ekibi`,
      });
    } catch (e) {
      console.error("Ogretmen hesap e-postasi gonderilemedi:", e);
      return Response.json({ error: "Hesap oluşturuldu ama e-posta gönderilemedi. Öğretmene manuel bildir." }, { status: 200, });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    if (e.message?.includes("duplicate key")) return Response.json({ error: "Bu eposta zaten kullaniliyor" }, { status: 409 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
