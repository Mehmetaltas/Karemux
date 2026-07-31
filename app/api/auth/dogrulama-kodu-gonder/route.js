import { sql } from "@/lib/db";
import { oturumdanKullaniciId, altiHaneliKodUret } from "@/lib/auth";
import { resendIstemcisi } from "@/lib/email";

export async function POST(req) {
  const kullaniciId = oturumdanKullaniciId(req);
  if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

  try {
    const kodu = altiHaneliKodUret();
    const sonuc = await sql`
      UPDATE kullanicilar
      SET dogrulama_kodu = ${kodu}, dogrulama_kodu_son_tarih = now() + interval '30 minutes'
      WHERE id = ${kullaniciId}
      RETURNING eposta, ad
    `;
    const kullanici = sonuc[0];
    if (!kullanici) return Response.json({ error: "Kullanici bulunamadi" }, { status: 404 });

    await resendIstemcisi().emails.send({
      from: "Karemux <bildirim@karemux.com>",
      to: kullanici.eposta,
      subject: "Karemux dogrulama kodun (yeni)",
      text: `Merhaba ${kullanici.ad},\n\nYeni dogrulama kodun: ${kodu}\n\nBu kod 30 dakika gecerlidir.\n\nKaremux Ekibi`,
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kod gonderilemedi" }, { status: 500 });
  }
}
