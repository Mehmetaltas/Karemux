import { sql } from "@/lib/db";
import { sifreDogrula, sifreHashle } from "@/lib/auth";
import { ogretmenCoz } from "@/lib/ogretmen";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// Ogretmenin kendi sifresini degistirmesi (8-9 Eylul) - hiz sinirlama + mevcutSifre
// alan adi (on yuzdeki form ile eslesecek sekilde) birlestirildi.
export async function POST(req) {
  try {
    const ogretmen = await ogretmenCoz(req);
    if (!ogretmen) return Response.json({ error: "Oturum bulunamadi" }, { status: 401 });

    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_sifre_degistir", 5, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { mevcutSifre, yeniSifre } = await req.json();
    if (!mevcutSifre || !yeniSifre) return Response.json({ error: "Eski ve yeni sifre gerekli" }, { status: 400 });
    if (yeniSifre.length < 6) return Response.json({ error: "Yeni sifre en az 6 karakter olmali" }, { status: 400 });

    const satir = await sql`SELECT sifre_hash FROM ogretmenler WHERE id = ${ogretmen.id}`;
    if (satir.length === 0 || !satir[0].sifre_hash) return Response.json({ error: "Hesap bulunamadi" }, { status: 404 });

    const dogru = await sifreDogrula(mevcutSifre, satir[0].sifre_hash);
    if (!dogru) {
      await denemeKaydet(ip, "ogretmen_sifre_degistir", false);
      return Response.json({ error: "Eski sifre hatali" }, { status: 401 });
    }
    await denemeKaydet(ip, "ogretmen_sifre_degistir", true);

    const yeniHash = await sifreHashle(yeniSifre);
    await sql`UPDATE ogretmenler SET sifre_hash = ${yeniHash} WHERE id = ${ogretmen.id}`;

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Sifre degistirilemedi" }, { status: 500 });
  }
}
