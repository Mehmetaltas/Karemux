import { sql } from "@/lib/db";
import { veliOnayTokenUret } from "@/lib/auth";
import { resendIstemcisi } from "@/lib/email";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "personel_sifre_sifirlama", 3, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { eposta } = await req.json();
    if (!eposta?.trim()) return Response.json({ error: "E-posta gerekli" }, { status: 400 });

    const personel = await sql`SELECT id, ad FROM personel WHERE eposta = ${eposta.trim().toLowerCase()} AND aktif = true`;
    await denemeKaydet(ip, "personel_sifre_sifirlama", true);

    if (personel.length === 0) return Response.json({ ok: true });

    const token = veliOnayTokenUret();
    await sql`UPDATE personel SET sifre_belirleme_token = ${token}, sifre_belirleme_son_tarih = now() + interval '48 hours' WHERE id = ${personel[0].id}`;

    const link = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.karemux.com"}/personel-sifre-belirle?token=${token}`;
    try {
      await resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: eposta.trim(),
        subject: "Karemux - Şifre Sıfırlama",
        text: `Merhaba ${personel[0].ad},\n\nŞifreni sıfırlamak için aşağıdaki linke tıkla:\n\n${link}\n\nBu link 48 saat geçerlidir. Bu talebi sen yapmadıysan bu e-postayı yok sayabilirsin.\n\nKaremux Ekibi`,
      });
    } catch (e) { console.error("Personel sifre sifirlama e-postasi gonderilemedi:", e); }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Islem basarisiz" }, { status: 500 });
  }
}
