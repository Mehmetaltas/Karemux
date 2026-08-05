import { sql } from "@/lib/db";
import { altiHaneliKodUret } from "@/lib/auth";
import { resendIstemcisi } from "@/lib/email";

export async function POST(req) {
  try {
    const { eposta } = await req.json();
    if (!eposta) return Response.json({ error: "E-posta gerekli" }, { status: 400 });

    const kodu = altiHaneliKodUret();
    const sonuc = await sql`
      UPDATE kullanicilar
      SET sifre_sifirlama_kodu = ${kodu}, sifre_sifirlama_son_tarih = now() + interval '30 minutes'
      WHERE eposta = ${eposta}
      RETURNING ad
    `;

    // Guvenlik: kayitli olmayan e-posta icin de ayni basarili mesaji donuyoruz,
    // boylece kotu niyetli biri hangi e-postalarin kayitli oldugunu anlayamaz.
    if (sonuc[0]) {
      await resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: eposta,
        subject: "Karemux şifre sıfırlama kodun",
        text: `Merhaba ${sonuc[0].ad},\n\nŞifre sıfırlama kodun: ${kodu}\n\nBu kod 30 dakika geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.\n\nKaremux Ekibi`,
      });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kod gönderilemedi" }, { status: 500 });
  }
}
