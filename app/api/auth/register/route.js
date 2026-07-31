import { sql } from "@/lib/db";
import { sifreHashle, tokenUret, oturumCookieBaslik, altiHaneliKodUret, veliBaglantiKoduUret } from "@/lib/auth";
import { resendIstemcisi } from "@/lib/email";

export async function POST(req) {
  try {
    const { eposta, sifre, ad, rol } = await req.json();
    if (!eposta || !sifre || sifre.length < 6) {
      return Response.json({ error: "Gecerli bir e-posta ve en az 6 karakterli sifre gerekli" }, { status: 400 });
    }
    const rolTemiz = rol === "veli" ? "veli" : "ogrenci";

    const mevcut = await sql`SELECT id FROM kullanicilar WHERE eposta = ${eposta}`;
    if (mevcut.length > 0) {
      return Response.json({ error: "Bu e-posta zaten kayitli" }, { status: 409 });
    }

    const hash = await sifreHashle(sifre);
    const dogrulamaKodu = altiHaneliKodUret();
    const veliKodu = rolTemiz === "ogrenci" ? veliBaglantiKoduUret() : null;

    const sonuc = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, dogrulama_kodu, dogrulama_kodu_son_tarih, veli_baglanti_kodu)
      VALUES (${eposta}, ${hash}, ${ad || eposta.split("@")[0]}, ${rolTemiz}, ${dogrulamaKodu}, now() + interval '30 minutes', ${veliKodu})
      RETURNING id, ad
    `;
    const kullanici = sonuc[0];
    const token = tokenUret(kullanici.id);

    try {
      await resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: eposta,
        subject: "Karemux dogrulama kodun",
        text: `Merhaba ${kullanici.ad},\n\nDogrulama kodun: ${dogrulamaKodu}\n\nBu kod 30 dakika gecerlidir.\n\nKaremux Ekibi`,
      });
    } catch (e) {
      console.error("Dogrulama e-postasi gonderilemedi:", e);
    }

    return new Response(JSON.stringify({ ok: true, ad: kullanici.ad, rol: rolTemiz }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(token) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kayit olusturulamadi" }, { status: 500 });
  }
}
