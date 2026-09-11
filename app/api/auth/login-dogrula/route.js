import { sql } from "@/lib/db";
import { tokenUret, oturumCookieBaslik } from "@/lib/auth";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// E-posta 2FA'nin ikinci adimi (11 Eylul) - /api/auth/login sifreyi dogrulayip
// kod gonderdikten sonra buraya gelinir. Kod dogruysa oturum burada acilir.
export async function POST(req) {
  try {
    const { eposta, kod, beniHatirla } = await req.json();
    if (!eposta || !kod) {
      return Response.json({ error: "Kod gerekli" }, { status: 400 });
    }

    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "login-dogrula");
    if (!kontrol.izinVar) {
      return Response.json({ error: "Çok fazla deneme yapıldı. 15 dakika sonra tekrar dene." }, { status: 429 });
    }

    const sonuc = await sql`SELECT id, ad, giris_dogrulama_kodu, giris_dogrulama_son_tarih FROM kullanicilar WHERE eposta = ${eposta}`;
    const kullanici = sonuc[0];

    if (!kullanici || !kullanici.giris_dogrulama_kodu) {
      await denemeKaydet(ip, "login-dogrula", false);
      return Response.json({ error: "Geçersiz kod, tekrar giriş yapmayı dene." }, { status: 401 });
    }
    if (new Date(kullanici.giris_dogrulama_son_tarih) < new Date()) {
      return Response.json({ error: "Kodun süresi doldu, tekrar giriş yapmayı dene." }, { status: 401 });
    }
    if (kullanici.giris_dogrulama_kodu !== kod.trim()) {
      await denemeKaydet(ip, "login-dogrula", false);
      return Response.json({ error: "Kod hatalı" }, { status: 401 });
    }

    await sql`UPDATE kullanicilar SET giris_dogrulama_kodu = NULL, giris_dogrulama_son_tarih = NULL WHERE id = ${kullanici.id}`;
    await denemeKaydet(ip, "login-dogrula", true);

    const token = tokenUret(kullanici.id);
    return new Response(JSON.stringify({ ok: true, ad: kullanici.ad }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(token, beniHatirla !== false) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Doğrulanamadı" }, { status: 500 });
  }
}
