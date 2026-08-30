import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "ikiz_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "ikiz_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "ikiz_admin", true);
  return { izinVar: true };
}

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const boyutlar = await sql`SELECT id, kod, ad, aciklama FROM ikiz_boyut ORDER BY id`;
  const degiskenler = await sql`SELECT boyut_id, kod, ad, birim, guncel_deger, kaynak, guncelleme FROM ikiz_degisken ORDER BY boyut_id, id`;
  const iliskiler = await sql`SELECT ad, formul_aciklama FROM ikiz_iliski ORDER BY id`;
  const oneriler = await sql`SELECT id, baslik, aciklama, dayanak, oncelik, durum, olusturulma, karar_notu FROM strateji_onerisi ORDER BY (durum = 'oneriliyor') DESC, olusturulma DESC`;

  return Response.json({ boyutlar, degiskenler, iliskiler, oneriler });
}

export async function PATCH(req) {
  try {
    const { sifre, id, durum, kararNotu } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!id || !["onaylandi", "reddedildi"].includes(durum)) return Response.json({ error: "Gecersiz istek" }, { status: 400 });

    await sql`UPDATE strateji_onerisi SET durum = ${durum}, karar_tarihi = now(), karar_notu = ${kararNotu || null} WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
