import { sql } from "@/lib/db";
import { sifreDogrula, tokenUret, oturumCookieBaslik } from "@/lib/auth";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

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

    const sonuc = await sql`SELECT id, ad, sifre_hash FROM kullanicilar WHERE eposta = ${eposta}`;
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
    const token = tokenUret(kullanici.id);
    return new Response(JSON.stringify({ ok: true, ad: kullanici.ad }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(token, beniHatirla !== false) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Giriş yapılamadı" }, { status: 500 });
  }
}
