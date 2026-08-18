import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// Cari sistemi: pozitif bakiye = bize borclu (alacagimiz var),
// negatif bakiye = biz borcluyuz (odeyecegimiz var).
// tur: 'satis_veresiye' (+), 'tahsilat' (-), 'tedarik_borcu' (-), 'odeme' (+)

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "cari_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "cari_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "cari_paneli", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const cariler = await sql`
      SELECT c.id, c.ad, c.tur, c.telefon, c.eposta, c.notlar,
        COALESCE(SUM(CASE WHEN h.tur IN ('satis_veresiye', 'odeme') THEN h.tutar_tl
                          WHEN h.tur IN ('tahsilat', 'tedarik_borcu') THEN -h.tutar_tl
                          ELSE 0 END), 0)::numeric AS bakiye
      FROM cariler c
      LEFT JOIN cari_hareketleri h ON h.cari_id = c.id
      GROUP BY c.id, c.ad, c.tur, c.telefon, c.eposta, c.notlar
      ORDER BY c.ad ASC
    `;
    return Response.json({ cariler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { sifre, ad, tur, telefon, eposta, notlar } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!ad || !tur) return Response.json({ error: "Ad ve tur gerekli" }, { status: 400 });

    const sonuc = await sql`
      INSERT INTO cariler (ad, tur, telefon, eposta, notlar)
      VALUES (${ad}, ${tur}, ${telefon || null}, ${eposta || null}, ${notlar || null})
      RETURNING id
    `;
    return Response.json({ ok: true, id: sonuc[0].id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
