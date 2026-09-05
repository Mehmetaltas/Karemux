import { sql } from "@/lib/db";
import { tokenUret, oturumCookieBaslik } from "@/lib/auth";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "impersonate", 10, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { sifre, hedefEposta } = await req.json();
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      await denemeKaydet(ip, "impersonate", false);
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    await denemeKaydet(ip, "impersonate", true);

    if (!hedefEposta?.trim()) return Response.json({ error: "Hedef eposta gerekli" }, { status: 400 });

    const hedef = await sql`SELECT id, ad, rol FROM kullanicilar WHERE eposta = ${hedefEposta.trim().toLowerCase()}`;
    if (hedef.length === 0) return Response.json({ error: "Bu epostayla eslesen bir kullanici bulunamadi" }, { status: 404 });

    try {
      await sql`
        INSERT INTO impersonasyon_log (hedef_kullanici_id, hedef_eposta, hedef_rol, ip)
        VALUES (${hedef[0].id}, ${hedefEposta.trim().toLowerCase()}, ${hedef[0].rol}, ${ip})
      `;
    } catch (e) { console.error("Impersonasyon log kaydedilemedi:", e); }

    const token = tokenUret(hedef[0].id);

    return new Response(JSON.stringify({ ok: true, ad: hedef[0].ad, rol: hedef[0].rol }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(token, false) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Islem basarisiz" }, { status: 500 });
  }
}
