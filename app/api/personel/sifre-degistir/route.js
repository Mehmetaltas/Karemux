import { sql } from "@/lib/db";
import { sifreDogrula, sifreHashle } from "@/lib/auth";
import { personelCoz } from "@/lib/personel";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// Personel/Admin oturum-ici sifre degistirme (8-9 Eylul).
export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "personel_sifre_degistir", 5, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const personel = await personelCoz(req);
    if (!personel) return Response.json({ error: "Oturum bulunamadi" }, { status: 401 });

    const { eskiSifre, yeniSifre } = await req.json();
    if (!eskiSifre || !yeniSifre) return Response.json({ error: "Eski ve yeni sifre gerekli" }, { status: 400 });
    if (yeniSifre.length < 6) return Response.json({ error: "Yeni sifre en az 6 karakter olmali" }, { status: 400 });

    const satir = await sql`SELECT sifre_hash FROM personel WHERE id = ${personel.id}`;
    if (satir.length === 0) return Response.json({ error: "Hesap bulunamadi" }, { status: 404 });

    const dogru = await sifreDogrula(eskiSifre, satir[0].sifre_hash);
    if (!dogru) {
      await denemeKaydet(ip, "personel_sifre_degistir", false);
      return Response.json({ error: "Eski sifre hatali" }, { status: 401 });
    }
    await denemeKaydet(ip, "personel_sifre_degistir", true);

    const yeniHash = await sifreHashle(yeniSifre);
    await sql`UPDATE personel SET sifre_hash = ${yeniHash} WHERE id = ${personel.id}`;

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Sifre degistirilemedi" }, { status: 500 });
  }
}
