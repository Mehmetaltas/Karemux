import { sql } from "@/lib/db";
import { sifreDogrula, altiHaneliKodUret, tokenUret, oturumCookieBaslik } from "@/lib/auth";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { resendIstemcisi } from "@/lib/email";

export async function POST(req) {
  try {
    const { eposta, sifre, beniHatirla } = await req.json();
    if (!eposta || !sifre) {
      return Response.json({ error: "E-posta ve şifre gerekli" }, { status: 400 });
    }

    // Brute-force korumasi: hem e-posta hem IP bazinda son 15 dakikada 5'ten
    // fazla basarisiz deneme varsa girisi gecici olarak durdur.
    const ip = istekIpAdresi(req);
    const epostaKontrol = await denemeSiniriKontrolEt(eposta.toLowerCase(), "login");
    const ipKontrol = await denemeSiniriKontrolEt(ip, "login");
    if (!epostaKontrol.izinVar || !ipKontrol.izinVar) {
      return Response.json({ error: "Çok fazla başarısız deneme yapıldı. 15 dakika sonra tekrar dene." }, { status: 429 });
    }

    const sonuc = await sql`SELECT id, ad, sifre_hash, rol FROM kullanicilar WHERE eposta = ${eposta}`;
    const kullanici = sonuc[0];
    // Kullanıcı yoksa da (zamanlama saldırılarını zorlaştırmak için) aynı hata mesajını dön
    if (!kullanici || kullanici.sifre_hash === "anon") {
      await denemeKaydet(eposta.toLowerCase(), "login", false);
      await denemeKaydet(ip, "login", false);
      return Response.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const dogruMu = await sifreDogrula(sifre, kullanici.sifre_hash);
    if (!dogruMu) {
      await denemeKaydet(eposta.toLowerCase(), "login", false);
      await denemeKaydet(ip, "login", false);
      return Response.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    await denemeKaydet(eposta.toLowerCase(), "login", true);
    await denemeKaydet(ip, "login", true);

    // E-posta 2FA (11 Eylul) - SIMDILIK SADECE ogrenci rolu icin (pilot).
    // Veli/kurum girisleri henuz bu 2 adimli akisi bilmiyor (kendi UI'lari
    // guncellenmedi) - digerlerine yayilana kadar onlari eski (tek adimli)
    // akista birakiyoruz, yoksa giris yapamaz hale gelirler.
    if (kullanici.rol !== "ogrenci") {
      const token = tokenUret(kullanici.id);
      return new Response(JSON.stringify({ ok: true, ad: kullanici.ad }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(token, beniHatirla !== false) },
      });
    }

    // E-posta 2FA (11 Eylul) - sifre dogru olsa da oturum HENUZ acilmiyor,
    // once 6 haneli koda ihtiyac var. beniHatirla degeri dogrulama adimina
    // tasinmasi icin gecici olarak koda gomulur (ayri bir kayit gerektirmez).
    const kod = altiHaneliKodUret();
    const sonTarih = new Date(Date.now() + 10 * 60 * 1000);
    await sql`UPDATE kullanicilar SET giris_dogrulama_kodu = ${kod}, giris_dogrulama_son_tarih = ${sonTarih} WHERE id = ${kullanici.id}`;

    try {
      await resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: eposta,
        subject: `Karemux giris kodun: ${kod}`,
        text: `Merhaba,\n\nKaremux'a giris yapmak icin dogrulama kodun: ${kod}\n\nBu kod 10 dakika gecerlidir. Bu girisi sen yapmadiysan, bu e-postayi yok sayabilirsin.\n\nKaremux Ekibi`,
      });
    } catch (e) {
      console.error("2FA e-posta gonderilemedi:", e.message);
      return Response.json({ error: "Dogrulama kodu gonderilemedi, tekrar dene." }, { status: 502 });
    }

    return Response.json({ ok: true, ikinciAdimGerekli: true, eposta, beniHatirla: beniHatirla !== false });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Giriş yapılamadı" }, { status: 500 });
  }
}
