import { sql } from "@/lib/db";
import { sifreHashle, tokenUret, oturumCookieBaslik, altiHaneliKodUret, veliBaglantiKoduUret } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { eposta, sifre, ad, rol } = await req.json();
    if (!eposta || !sifre || sifre.length < 6) {
      return Response.json({ error: "Geçerli bir e-posta ve en az 6 karakterli şifre gerekli" }, { status: 400 });
    }
    const rolTemiz = rol === "veli" ? "veli" : "ogrenci";

    const mevcut = await sql`SELECT id FROM kullanicilar WHERE eposta = ${eposta}`;
    if (mevcut.length > 0) {
      return Response.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }

    const hash = await sifreHashle(sifre);
    const dogrulamaKodu = altiHaneliKodUret();
    // Öğrenciyse veliye verebileceği bir bağlantı kodu üretiyoruz; velide gerek yok
    const veliKodu = rolTemiz === "ogrenci" ? veliBaglantiKoduUret() : null;

    const sonuc = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, dogrulama_kodu, dogrulama_kodu_son_tarih, veli_baglanti_kodu)
      VALUES (${eposta}, ${hash}, ${ad || eposta.split("@")[0]}, ${rolTemiz}, ${dogrulamaKodu}, now() + interval '30 minutes', ${veliKodu})
      RETURNING id, ad
    `;
    const kullanici = sonuc[0];
    const token = tokenUret(kullanici.id);

    // E-posta doğrulama kodu gönder — best-effort, başarısız olsa da kaydı bozmuyoruz
    try {
      await resend.emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: eposta,
        subject: "Karemux doğrulama kodun",
        text: `Merhaba ${kullanici.ad},\n\nDoğrulama kodun: ${dogrulamaKodu}\n\nBu kod 30 dakika geçerlidir. Hesap ayarları > E-posta Doğrula bölümünden girebilirsin.\n\nKaremux Ekibi`,
      });
    } catch (e) {
      console.error("Doğrulama e-postası gönderilemedi:", e);
    }

    return new Response(JSON.stringify({ ok: true, ad: kullanici.ad, rol: rolTemiz }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(token) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kayıt oluşturulamadı" }, { status: 500 });
  }
}
