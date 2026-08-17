import { sql } from "@/lib/db";
import { sifreHashle, tokenUret, oturumCookieBaslik, altiHaneliKodUret, veliBaglantiKoduUret, veliOnayTokenUret } from "@/lib/auth";
import { resendIstemcisi } from "@/lib/email";

export async function POST(req) {
  try {
    const { eposta, sifre, ad, rol, veliEposta } = await req.json();
    const testModu = !!(process.env.HEALTH_CHECK_SECRET && req.headers.get("x-health-check-secret") === process.env.HEALTH_CHECK_SECRET);
    if (!eposta || !sifre || sifre.length < 6) {
      return Response.json({ error: "Gecerli bir e-posta ve en az 6 karakterli sifre gerekli" }, { status: 400 });
    }
    const rolTemiz = rol === "veli" ? "veli" : "ogrenci";
    if (rolTemiz === "ogrenci" && (!veliEposta || !veliEposta.includes("@"))) {
      return Response.json({ error: "Veli/ebeveyn e-posta adresi gerekli" }, { status: 400 });
    }

    const mevcut = await sql`SELECT id FROM kullanicilar WHERE eposta = ${eposta}`;
    if (mevcut.length > 0) {
      return Response.json({ error: "Bu e-posta zaten kayitli" }, { status: 409 });
    }

    const hash = await sifreHashle(sifre);
    const dogrulamaKodu = altiHaneliKodUret();
    const veliKodu = rolTemiz === "ogrenci" ? veliBaglantiKoduUret() : null;
    const veliOnayToken = rolTemiz === "ogrenci" ? veliOnayTokenUret() : null;
    const veliOnayVerildi = rolTemiz === "veli"; // veli hesaplari icin ayrica onay gerekmez

    const sonuc = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, dogrulama_kodu, dogrulama_kodu_son_tarih, veli_baglanti_kodu, veli_eposta, veli_onay_token, veli_onay_verildi)
      VALUES (${eposta}, ${hash}, ${ad || eposta.split("@")[0]}, ${rolTemiz}, ${dogrulamaKodu}, now() + interval '30 minutes', ${veliKodu}, ${rolTemiz === "ogrenci" ? veliEposta : null}, ${veliOnayToken}, ${veliOnayVerildi})
      RETURNING id, ad
    `;
    const kullanici = sonuc[0];
    const token = tokenUret(kullanici.id);

    if (!testModu) {
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
    }

    if (rolTemiz === "ogrenci" && veliOnayToken && !testModu) {
      try {
        const onayLinki = `${process.env.NEXT_PUBLIC_SITE_URL || "https://karemux.com"}/api/auth/veli-onay?token=${veliOnayToken}`;
        await resendIstemcisi().emails.send({
          from: "Karemux <bildirim@karemux.com>",
          to: veliEposta,
          subject: "Karemux - Veli Onayi Gerekiyor",
          text: `Sayin veli/vasi,\n\n${kullanici.ad} adli ogrenci Karemux'a kayit oldu. Ogrencinin verilerinin islenebilmesi icin lutfen asagidaki linke tiklayarak onay verin:\n\n${onayLinki}\n\nBu kaydi siz yapmadiysaniz, bu e-postayi yok sayabilirsiniz.\n\nKaremux Ekibi`,
        });
      } catch (e) {
        console.error("Veli onay e-postasi gonderilemedi:", e);
      }
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
