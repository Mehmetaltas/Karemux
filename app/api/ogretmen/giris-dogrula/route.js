import { sql } from "@/lib/db";
import { ogretmenTokenUret, ogretmenOturumCookieBaslik } from "@/lib/ogretmen";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// 29 Eylul: e-posta 2FA'nin ikinci adimi - /api/ogretmen/giris sifreyi
// dogrulayip kod gonderdikten sonra buraya gelinir. Kod dogruysa oturum
// burada acilir (login-dogrula'nin ogretmenler tablosu icin birebir esdegeri).
export async function POST(req) {
  try {
    const { eposta, kod, beniHatirla } = await req.json();
    if (!eposta || !kod) {
      return Response.json({ error: "Kod gerekli" }, { status: 400 });
    }

    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_giris_dogrula");
    if (!kontrol.izinVar) {
      return Response.json({ error: "Cok fazla deneme yapildi. 15 dakika sonra tekrar dene." }, { status: 429 });
    }

    const sonuc = await sql`SELECT id, ad, brans, giris_dogrulama_kodu, giris_dogrulama_son_tarih FROM ogretmenler WHERE eposta = ${eposta.trim().toLowerCase()} AND aktif = true`;
    const ogretmen = sonuc[0];

    if (!ogretmen || !ogretmen.giris_dogrulama_kodu) {
      await denemeKaydet(ip, "ogretmen_giris_dogrula", false);
      return Response.json({ error: "Gecersiz kod, tekrar giris yapmayi dene." }, { status: 401 });
    }
    if (new Date(ogretmen.giris_dogrulama_son_tarih) < new Date()) {
      return Response.json({ error: "Kodun suresi doldu, tekrar giris yapmayi dene." }, { status: 401 });
    }
    if (ogretmen.giris_dogrulama_kodu !== kod.trim()) {
      await denemeKaydet(ip, "ogretmen_giris_dogrula", false);
      return Response.json({ error: "Kod hatali" }, { status: 401 });
    }

    await sql`UPDATE ogretmenler SET giris_dogrulama_kodu = NULL, giris_dogrulama_son_tarih = NULL, son_giris = now() WHERE id = ${ogretmen.id}`;
    await denemeKaydet(ip, "ogretmen_giris_dogrula", true);

    const token = ogretmenTokenUret(ogretmen.id);
    return new Response(JSON.stringify({ ok: true, ad: ogretmen.ad, brans: ogretmen.brans }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": ogretmenOturumCookieBaslik(token, beniHatirla !== false) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Dogrulanamadi" }, { status: 500 });
  }
}
