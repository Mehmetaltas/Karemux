import { sql } from "@/lib/db";
import { sifreDogrula, tokenUret, oturumCookieBaslik } from "@/lib/auth";

export async function POST(req) {
  try {
    const { eposta, sifre } = await req.json();
    if (!eposta || !sifre) {
      return Response.json({ error: "E-posta ve şifre gerekli" }, { status: 400 });
    }

    const sonuc = await sql`SELECT id, ad, sifre_hash FROM kullanicilar WHERE eposta = ${eposta}`;
    const kullanici = sonuc[0];
    // Kullanıcı yoksa da (zamanlama saldırılarını zorlaştırmak için) aynı hata mesajını dön
    if (!kullanici || kullanici.sifre_hash === "anon") {
      return Response.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const dogruMu = await sifreDogrula(sifre, kullanici.sifre_hash);
    if (!dogruMu) {
      return Response.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const token = tokenUret(kullanici.id);
    return new Response(JSON.stringify({ ok: true, ad: kullanici.ad }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(token) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Giriş yapılamadı" }, { status: 500 });
  }
}
