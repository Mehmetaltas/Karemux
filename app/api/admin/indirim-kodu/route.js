import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "indirim_kodu_admin_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "indirim_kodu_admin_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "indirim_kodu_admin_paneli", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const kodlar = await sql`
      SELECT id, kod, aciklama, yuzde, sabit_tutar, gecerlilik_baslangic, gecerlilik_bitis,
             max_kullanim, kullanim_sayisi, aktif, olusturulma
      FROM indirim_kodlari ORDER BY olusturulma DESC
    `;
    return Response.json({ kodlar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { sifre, kod, aciklama, yuzde, sabitTutar, gecerlilikBitis, maxKullanim } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!kod) return Response.json({ error: "kod gerekli" }, { status: 400 });
    if (!yuzde && !sabitTutar) return Response.json({ error: "yuzde veya sabitTutar girilmeli" }, { status: 400 });

    const kodTemiz = String(kod).trim().toUpperCase();
    const mevcut = await sql`SELECT 1 FROM indirim_kodlari WHERE kod = ${kodTemiz}`;
    if (mevcut.length > 0) return Response.json({ error: "Bu kod zaten mevcut" }, { status: 409 });

    await sql`
      INSERT INTO indirim_kodlari (kod, aciklama, yuzde, sabit_tutar, gecerlilik_bitis, max_kullanim)
      VALUES (${kodTemiz}, ${aciklama || null}, ${yuzde || null}, ${sabitTutar || null}, ${gecerlilikBitis || null}, ${maxKullanim || null})
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { sifre, id, aktif } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!id) return Response.json({ error: "id gerekli" }, { status: 400 });

    await sql`UPDATE indirim_kodlari SET aktif = ${aktif} WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
