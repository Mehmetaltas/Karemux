import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "randevu_odeme_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "randevu_odeme_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "randevu_odeme_admin", true);
  return { izinVar: true };
}

// GET: odenmemis (odendi=false) randevulari listeler - takip icin.
export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const randevular = await sql`
    SELECT r.id, r.baslangic_zamani, r.ucret_tl, r.odendi, o.ad AS ogretmen_adi, k.ad AS ogrenci_adi
    FROM randevular r
    JOIN ogretmenler o ON o.id = r.ogretmen_id
    JOIN kullanicilar k ON k.id = r.ogrenci_id
    WHERE r.ucret_tl > 0
    ORDER BY r.baslangic_zamani DESC
    LIMIT 100
  `;
  return Response.json({ randevular });
}

// POST: bir randevunun odendi durumunu isaretler - gercek tahsilat (banka/nakit/
// gelecekte Iyzico tekli odeme) sistem disinda yapiliyor, bu sadece kaydi acar.
export async function POST(req) {
  try {
    const { sifre, randevuId, odendi } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!randevuId) return Response.json({ error: "randevuId gerekli" }, { status: 400 });

    await sql`UPDATE randevular SET odendi = ${!!odendi} WHERE id = ${randevuId}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
