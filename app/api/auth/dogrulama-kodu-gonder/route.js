import { sql } from "@/lib/db";
import { oturumdanKullaniciId, altiHaneliKodUret } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const kullaniciId = oturumdanKullaniciId(req);
  if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

  try {
    const kodu = altiHaneliKodUret();
    const sonuc = await sql`
      UPDATE kullanicilar
      SET dogrulama_kodu = ${kodu}, dogrulama_kodu_son_tarih = now() + interval '30 minutes'
      WHERE id = ${kullaniciId}
      RETURNING eposta, ad
    `;
    const kullanici = sonuc[0];
    if (!kullanici) return Response.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

    await resend.emails.send({
      from: "Karemux <bildirim@karemux.com>",
      to: kullanici.eposta,
      subject: "Karemux doğrulama kodun (yeni)",
      text: `Merhaba ${kullanici.ad},\n\nYeni doğrulama kodun: ${kodu}\n\nBu kod 30 dakika geçerlidir.\n\nKaremux Ekibi`,
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kod gönderilemedi" }, { status: 500 });
  }
}
