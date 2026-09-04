import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "havale_onay", 20, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "havale_onay", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "havale_onay", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const bekleyenler = await sql`
      SELECT o.id, o.kullanici_id, o.tutar, o.plan, o.havale_referans, o.olusturulma,
             k.ad AS ogrenci_ad, k.eposta AS ogrenci_eposta
      FROM odemeler o
      LEFT JOIN kullanicilar k ON k.id = o.kullanici_id
      WHERE o.yontem = 'havale' AND o.durum = 'beklemede'
      ORDER BY o.olusturulma ASC
    `;

    return Response.json({ bekleyenler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { sifre, odemeId, aksiyon } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    if (!odemeId || !["onayla", "reddet"].includes(aksiyon)) {
      return Response.json({ error: "Eksik veya gecersiz parametre" }, { status: 400 });
    }

    const odemeSonuc = await sql`
      SELECT id, kullanici_id, plan, tutar FROM odemeler
      WHERE id = ${odemeId} AND yontem = 'havale' AND durum = 'beklemede'
    `;
    if (odemeSonuc.length === 0) {
      return Response.json({ error: "Bekleyen havale odemesi bulunamadi" }, { status: 404 });
    }
    const { kullanici_id: kullaniciId, plan, tutar } = odemeSonuc[0];

    if (aksiyon === "reddet") {
      await sql`UPDATE odemeler SET durum = 'basarisiz' WHERE id = ${odemeId}`;
      return Response.json({ ok: true, durum: "reddedildi" });
    }

    await sql`UPDATE odemeler SET durum = 'basarili' WHERE id = ${odemeId}`;

    const paket = await sql`SELECT id, sure_gun, kredi_miktari, fiyat_tl FROM paketler WHERE anahtar = ${plan}`;
    const sureGun = paket[0]?.sure_gun || 365;
    const paketFiyati = paket[0]?.fiyat_tl || tutar;

    await sql`
      INSERT INTO satislar (kullanici_id, paket_id, tutar_tl, net_gelir_tl)
      VALUES (${kullaniciId}, ${paket[0]?.id || null}, ${paketFiyati}, ${paketFiyati})
    `;

    if (paket[0]?.kredi_miktari) {
      await sql`
        INSERT INTO kullanici_kredileri (kullanici_id, kalan_kredi)
        VALUES (${kullaniciId}, ${paket[0].kredi_miktari})
        ON CONFLICT (kullanici_id) DO UPDATE SET kalan_kredi = kullanici_kredileri.kalan_kredi + ${paket[0].kredi_miktari}, guncellenme = now()
      `;
    } else {
      await sql`
        INSERT INTO abonelikler (kullanici_id, plan, durum, iyzico_abonelik_id, baslangic, bitis)
        VALUES (${kullaniciId}, ${plan}, 'aktif', ${"havale-" + odemeId}, now(), now() + (${sureGun}::text || ' days')::interval)
      `;
    }

    return Response.json({ ok: true, durum: "onaylandi" });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Islem basarisiz" }, { status: 500 });
  }
}
