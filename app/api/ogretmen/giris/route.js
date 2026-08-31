import { sql } from "@/lib/db";
import { sifreDogrula } from "@/lib/auth";
import { ogretmenTokenUret, ogretmenOturumCookieBaslik } from "@/lib/ogretmen";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_giris", 5, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { eposta, sifre } = await req.json();
    if (!eposta?.trim() || !sifre) return Response.json({ error: "Eposta ve sifre gerekli" }, { status: 400 });

    const ogretmen = await sql`SELECT id, ad, sifre_hash, brans FROM ogretmenler WHERE eposta = ${eposta.trim().toLowerCase()} AND aktif = true`;
    if (ogretmen.length === 0 || !ogretmen[0].sifre_hash) {
      await denemeKaydet(ip, "ogretmen_giris", false);
      return Response.json({ error: "Hatali eposta veya sifre" }, { status: 401 });
    }

    const dogru = await sifreDogrula(sifre, ogretmen[0].sifre_hash);
    if (!dogru) {
      await denemeKaydet(ip, "ogretmen_giris", false);
      return Response.json({ error: "Hatali eposta veya sifre" }, { status: 401 });
    }

    await denemeKaydet(ip, "ogretmen_giris", true);
    await sql`UPDATE ogretmenler SET son_giris = now() WHERE id = ${ogretmen[0].id}`;

    const token = ogretmenTokenUret(ogretmen[0].id);
    return new Response(JSON.stringify({ ok: true, ad: ogretmen[0].ad, brans: ogretmen[0].brans }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": ogretmenOturumCookieBaslik(token) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Giris basarisiz" }, { status: 500 });
  }
}
