import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_yonetim", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Çok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "ogretmen_yonetim", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "ogretmen_yonetim", true);
  return { izinVar: true };
}

// GET: aktif ogretmen listesini dondurur (canli ders vb. formlarda secim icin).
export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const ogretmenler = await sql`SELECT id, ad, brans, kademe, saatlik_ucret_tl FROM ogretmenler WHERE aktif = true ORDER BY ad`;
  return Response.json({ ogretmenler });
}

// POST: yeni ogretmen ekler, ardindan musaitlik saatlerini (opsiyonel) kaydeder.
export async function POST(req) {
  try {
    const { sifre, ad, brans, aciklama, musaitlik } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!ad || !brans) return Response.json({ error: "Ad ve brans gerekli" }, { status: 400 });

    const sonuc = await sql`
      INSERT INTO ogretmenler (ad, brans, aciklama) VALUES (${ad}, ${brans}, ${aciklama || null}) RETURNING id
    `;
    const ogretmenId = sonuc[0].id;

    if (Array.isArray(musaitlik)) {
      for (const m of musaitlik) {
        await sql`
          INSERT INTO ogretmen_musaitlik (ogretmen_id, haftanin_gunu, baslangic_saat, bitis_saat)
          VALUES (${ogretmenId}, ${m.gun}, ${m.baslangic}, ${m.bitis})
        `;
      }
    }
    return Response.json({ ok: true, ogretmenId });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
