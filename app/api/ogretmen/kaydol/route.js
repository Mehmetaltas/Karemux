import { sql } from "@/lib/db";
import { sifreHashle } from "@/lib/auth";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// Ogretmen kendi kendine kaydolur (31 Agustos/1 Eylul) - ama hesap
// aktif=false ile olusturulur, admin onaylayana kadar GIRIS YAPAMAZ
// (mevcut /api/ogretmen/giris zaten "AND aktif = true" kontrolu yapiyor).
export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_kaydol", 3, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { ad, eposta, brans, sifre } = await req.json();
    if (!ad?.trim() || !eposta?.trim() || !brans?.trim() || !sifre) {
      return Response.json({ error: "Tum alanlar gerekli" }, { status: 400 });
    }
    if (sifre.length < 6) return Response.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });

    const hash = await sifreHashle(sifre);
    await sql`
      INSERT INTO ogretmenler (ad, brans, eposta, sifre_hash, aktif)
      VALUES (${ad.trim()}, ${brans.trim()}, ${eposta.trim().toLowerCase()}, ${hash}, false)
    `;
    await denemeKaydet(ip, "ogretmen_kaydol", true);

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    if (e.message?.includes("duplicate key")) return Response.json({ error: "Bu eposta zaten kayitli" }, { status: 409 });
    return Response.json({ error: "Kayit basarisiz" }, { status: 500 });
  }
}
