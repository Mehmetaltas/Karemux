import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "iade_talep_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "iade_talep_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "iade_talep_admin", true);
  return { izinVar: true };
}

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const talepler = await sql`
    SELECT it.id, it.odeme_id, it.paket, it.tutar_tl, it.sebep, it.durum, it.talep_tarihi, k.ad, k.eposta
    FROM iade_talepleri it
    LEFT JOIN kullanicilar k ON k.id = it.kullanici_id
    ORDER BY it.talep_tarihi DESC
  `;
  return Response.json({ talepler });
}

export async function PATCH(req) {
  try {
    const { sifre, id, durum, adminNotu } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!id || !["onaylandi", "reddedildi"].includes(durum)) return Response.json({ error: "Gecersiz istek" }, { status: 400 });

    await sql`UPDATE iade_talepleri SET durum = ${durum}, admin_notu = ${adminNotu || null}, sonuclanma_tarihi = now() WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
