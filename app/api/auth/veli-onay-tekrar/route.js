import { sql } from "@/lib/db";
import { oturumdanKullaniciId, veliOnayTokenUret } from "@/lib/auth";
import { resendIstemcisi } from "@/lib/email";

export async function POST(req) {
  const kullaniciId = oturumdanKullaniciId(req);
  if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

  try {
    const kullanici = await sql`SELECT ad, rol, veli_eposta, veli_onay_verildi FROM kullanicilar WHERE id = ${kullaniciId}`;
    if (kullanici.length === 0) return Response.json({ error: "Kullanici bulunamadi" }, { status: 404 });
    const k = kullanici[0];
    if (k.rol !== "ogrenci") return Response.json({ error: "Bu islem sadece ogrenci hesaplari icin gecerli" }, { status: 400 });
    if (k.veli_onay_verildi) return Response.json({ error: "Veli onayi zaten verilmis" }, { status: 400 });
    if (!k.veli_eposta) return Response.json({ error: "Kayitli bir veli e-postasi yok" }, { status: 400 });

    const yeniToken = veliOnayTokenUret();
    await sql`UPDATE kullanicilar SET veli_onay_token = ${yeniToken} WHERE id = ${kullaniciId}`;

    const onayLinki = `${process.env.NEXT_PUBLIC_SITE_URL || "https://karemux.com"}/api/auth/veli-onay?token=${yeniToken}`;
    await resendIstemcisi().emails.send({
      from: "Karemux <bildirim@karemux.com>",
      to: k.veli_eposta,
      subject: "Karemux - Veli Onayi Gerekiyor",
      text: `Sayin veli/vasi,\n\n${k.ad} adli ogrenci Karemux'a kayit oldu. Ogrencinin verilerinin islenebilmesi icin lutfen asagidaki linke tiklayarak onay verin:\n\n${onayLinki}\n\nBu kaydi siz yapmadiysaniz, bu e-postayi yok sayabilirsiniz.\n\nKaremux Ekibi`,
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Gonderilemedi" }, { status: 500 });
  }
}
