import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "kurum_admin_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "kurum_admin_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "kurum_admin_paneli", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const kurumlar = await sql`
      SELECT k.id, k.ad, k.kurum_kodu, k.kisi_basi_fiyat_tl, k.min_kisi_sayisi, k.olusturulma,
        COUNT(kul.id)::int AS ogrenci_sayisi
      FROM kurumlar k
      LEFT JOIN kullanicilar kul ON kul.kurum_id = k.id
      GROUP BY k.id, k.ad, k.kurum_kodu, k.kisi_basi_fiyat_tl, k.min_kisi_sayisi, k.olusturulma
      ORDER BY k.olusturulma DESC
    `;
    return Response.json({ kurumlar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { sifre, kurumId, kisiBasiFiyatTl, minKisiSayisi } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!kurumId) return Response.json({ error: "kurumId gerekli" }, { status: 400 });

    await sql`
      UPDATE kurumlar SET kisi_basi_fiyat_tl = ${kisiBasiFiyatTl}, min_kisi_sayisi = ${minKisiSayisi}
      WHERE id = ${kurumId}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
