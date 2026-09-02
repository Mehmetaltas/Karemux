import { sql } from "@/lib/db";
import { sifreHashle, sifreDogrula } from "@/lib/auth";
import { ogretmenCoz } from "@/lib/ogretmen";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

export async function POST(req) {
  try {
    const ogretmen = await ogretmenCoz(req);
    if (!ogretmen) return Response.json({ error: "Oturum yok" }, { status: 401 });

    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_sifre_degistir", 5, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { mevcutSifre, yeniSifre } = await req.json();
    if (!mevcutSifre || !yeniSifre) return Response.json({ error: "Eksik bilgi" }, { status: 400 });
    if (yeniSifre.length < 6) return Response.json({ error: "Yeni sifre en az 6 karakter olmali" }, { status: 400 });

    const sonuc = await sql`SELECT sifre_hash FROM ogretmenler WHERE id = ${ogretmen.id}`;
    const dogru = await sifreDogrula(mevcutSifre, sonuc[0].sifre_hash);
    if (!dogru) {
      await denemeKaydet(ip, "ogretmen_sifre_degistir", false);
      return Response.json({ error: "Mevcut sifre hatali" }, { status: 401 });
    }
    await denemeKaydet(ip, "ogretmen_sifre_degistir", true);

    const hash = await sifreHashle(yeniSifre);
    await sql`UPDATE ogretmenler SET sifre_hash = ${hash} WHERE id = ${ogretmen.id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Sifre degistirilemedi" }, { status: 500 });
  }
}
