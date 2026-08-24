import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_basvuru_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "ogretmen_basvuru_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "ogretmen_basvuru_admin", true);
  return { izinVar: true };
}

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const basvurular = await sql`
    SELECT id, ad, eposta, telefon, brans, kategori, istenen_kademe, deneyim_yili, ozgecmis_metni, durum, admin_notu, basvuru_tarihi, degerlendirme_tarihi
    FROM ogretmen_basvurulari ORDER BY basvuru_tarihi DESC
  `;
  return Response.json({ basvurular });
}

export async function POST(req) {
  try {
    const { sifre, basvuruId, karar, saatlikUcret, adminNotu } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    if (!basvuruId || !["onayla", "reddet"].includes(karar)) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }

    const basvuru = await sql`SELECT * FROM ogretmen_basvurulari WHERE id = ${basvuruId} AND durum = 'beklemede'`;
    if (basvuru.length === 0) return Response.json({ error: "Basvuru bulunamadi veya zaten degerlendirilmis" }, { status: 404 });

    if (karar === "reddet") {
      await sql`UPDATE ogretmen_basvurulari SET durum = 'reddedildi', admin_notu = ${adminNotu || null}, degerlendirme_tarihi = now() WHERE id = ${basvuruId}`;
      return Response.json({ ok: true });
    }

    // Onayla - gercek ogretmenler satiri olusturulur.
    if (!saatlikUcret || Number(saatlikUcret) <= 0) {
      return Response.json({ error: "Onay icin gecerli bir saatlik ucret girilmeli" }, { status: 400 });
    }
    const b = basvuru[0];
    const yeniOgretmen = await sql`
      INSERT INTO ogretmenler (ad, brans, aciklama, aktif, saatlik_ucret_tl, kademe)
      VALUES (${b.ad}, ${b.brans}, ${b.ozgecmis_metni || null}, true, ${Number(saatlikUcret)}, ${b.istenen_kademe})
      RETURNING id
    `;
    await sql`UPDATE ogretmen_basvurulari SET durum = 'onaylandi', admin_notu = ${adminNotu || null}, degerlendirme_tarihi = now() WHERE id = ${basvuruId}`;

    return Response.json({ ok: true, ogretmenId: yeniOgretmen[0].id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Islem basarisiz: " + e.message }, { status: 500 });
  }
}
