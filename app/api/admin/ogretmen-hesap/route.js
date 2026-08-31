import { sql } from "@/lib/db";
import { sifreHashle } from "@/lib/auth";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_hesap_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "ogretmen_hesap_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "ogretmen_hesap_admin", true);
  return { izinVar: true };
}

// Admin, onaylanmis bir ogretmene giris hesabi (eposta+sifre) olusturur/gunceller.
export async function POST(req) {
  try {
    const { sifre, ogretmenId, eposta, yeniSifre } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!ogretmenId || !eposta?.trim() || !yeniSifre) return Response.json({ error: "Eksik bilgi" }, { status: 400 });
    if (yeniSifre.length < 6) return Response.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });

    const hash = await sifreHashle(yeniSifre);
    await sql`UPDATE ogretmenler SET eposta = ${eposta.trim().toLowerCase()}, sifre_hash = ${hash} WHERE id = ${ogretmenId}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    if (e.message?.includes("duplicate key")) return Response.json({ error: "Bu eposta zaten kullaniliyor" }, { status: 409 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
