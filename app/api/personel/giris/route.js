import { sql } from "@/lib/db";
import { sifreDogrula } from "@/lib/auth";
import { personelTokenUret, personelOturumCookieBaslik } from "@/lib/personel";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "personel_giris", 5, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { eposta, sifre, beniHatirla } = await req.json();
    if (!eposta?.trim() || !sifre) return Response.json({ error: "Eposta ve sifre gerekli" }, { status: 400 });

    const personel = await sql`SELECT id, ad, sifre_hash, rol FROM personel WHERE eposta = ${eposta.trim().toLowerCase()} AND aktif = true`;
    if (personel.length === 0) {
      await denemeKaydet(ip, "personel_giris", false);
      return Response.json({ error: "Hatali eposta veya sifre" }, { status: 401 });
    }

    const dogru = await sifreDogrula(sifre, personel[0].sifre_hash);
    if (!dogru) {
      await denemeKaydet(ip, "personel_giris", false);
      return Response.json({ error: "Hatali eposta veya sifre" }, { status: 401 });
    }

    await denemeKaydet(ip, "personel_giris", true);
    await sql`UPDATE personel SET son_giris = now() WHERE id = ${personel[0].id}`;

    const token = personelTokenUret(personel[0].id);
    // KOPRU (gecici, 24 Agustos): mevcut 13 admin sekmesi hala paylasilan
    // ?sifre= parametresine bakiyor - bunlarin hepsini bugun degistirmek
    // kapsam disi. Gercek kisisel giris basarili olunca, sunucu paylasilan
    // sifreyi (hic baska turlu acikta olmayan) client'a doner, client eskisi
    // gibi kullanmaya devam eder. ILERIDE: tum admin uc noktalari personelCoz
    // oturumuna tasinmali, bu koprunun kaldirilmasi gerekiyor.
    return new Response(JSON.stringify({ ok: true, ad: personel[0].ad, rol: personel[0].rol, sifre: process.env.ULUSAL_DENEME_YONETICI_SIFRESI }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": personelOturumCookieBaslik(token, beniHatirla !== false) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Giris basarisiz" }, { status: 500 });
  }
}
