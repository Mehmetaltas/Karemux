import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

// Kasa/Banka hesaplari: bakiye = baslangic_bakiyesi + SUM(giris) - SUM(cikis).

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "kasa_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "kasa_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "kasa_paneli", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const hesaplar = await sql`
      SELECT h.id, h.hesap_adi, h.tur, h.banka_adi, h.iban, h.baslangic_bakiyesi, h.aktif,
        (h.baslangic_bakiyesi + COALESCE(SUM(CASE WHEN k.tur = 'giris' THEN k.tutar_tl
                                                   WHEN k.tur = 'cikis' THEN -k.tutar_tl
                                                   ELSE 0 END), 0))::numeric AS bakiye
      FROM banka_hesaplari h
      LEFT JOIN kasa_hareketleri k ON k.hesap_id = h.id
      GROUP BY h.id, h.hesap_adi, h.tur, h.banka_adi, h.iban, h.baslangic_bakiyesi, h.aktif
      ORDER BY h.tur ASC, h.hesap_adi ASC
    `;
    const toplamBakiye = hesaplar.reduce((t, h) => t + Number(h.bakiye), 0);
    return Response.json({ hesaplar, toplamBakiye });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { sifre, hesapAdi, tur, bankaAdi, iban, baslangicBakiyesi } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!hesapAdi || !tur) return Response.json({ error: "Hesap adi ve tur gerekli" }, { status: 400 });

    const sonuc = await sql`
      INSERT INTO banka_hesaplari (hesap_adi, tur, banka_adi, iban, baslangic_bakiyesi)
      VALUES (${hesapAdi}, ${tur}, ${bankaAdi || null}, ${iban || null}, ${baslangicBakiyesi || 0})
      RETURNING id
    `;
    return Response.json({ ok: true, id: sonuc[0].id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
