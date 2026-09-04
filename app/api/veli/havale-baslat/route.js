import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function POST(req) {
  try {
    const veliId = oturumdanKullaniciId(req);
    if (!veliId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const { ogrenciId, plan, indirimKodu } = await req.json();
    if (!ogrenciId || !plan) return Response.json({ error: "ogrenciId ve plan gerekli" }, { status: 400 });

    const baglanti = await sql`SELECT 1 FROM veli_ogrenci WHERE veli_id = ${veliId} AND ogrenci_id = ${ogrenciId}`;
    if (baglanti.length === 0) {
      return Response.json({ error: "Bu ogrenciye bagli degilsin" }, { status: 403 });
    }

    const paketSonuc = await sql`SELECT ad, fiyat_tl FROM paketler WHERE anahtar = ${plan} AND aktif = true`;
    if (paketSonuc.length === 0) return Response.json({ error: "Gecersiz plan" }, { status: 400 });

    const orijinalFiyat = Number(paketSonuc[0].fiyat_tl);
    let indirimTutari = 0;
    let uygulananKod = null;
    if (indirimKodu) {
      const kodTemiz = String(indirimKodu).trim().toUpperCase();
      const kodSonuc = await sql`
        SELECT id, yuzde, sabit_tutar, max_kullanim, kullanim_sayisi
        FROM indirim_kodlari
        WHERE kod = ${kodTemiz} AND aktif = true
          AND (gecerlilik_baslangic IS NULL OR gecerlilik_baslangic <= now())
          AND (gecerlilik_bitis IS NULL OR gecerlilik_bitis >= now())
      `;
      if (kodSonuc.length > 0) {
        const kod = kodSonuc[0];
        if (!(kod.max_kullanim != null && kod.kullanim_sayisi >= kod.max_kullanim)) {
          if (kod.yuzde) indirimTutari = orijinalFiyat * (kod.yuzde / 100);
          else if (kod.sabit_tutar) indirimTutari = Number(kod.sabit_tutar);
          indirimTutari = Math.min(indirimTutari, orijinalFiyat);
          uygulananKod = { id: kod.id, kod: kodTemiz };
        }
      }
    }
    const finalFiyat = Math.max(orijinalFiyat - indirimTutari, 0);

    const referans = `KRX-${Date.now().toString(36).toUpperCase()}`;

    await sql`
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, plan, yontem, havale_referans, indirim_kodu, indirim_tutari)
      VALUES (${ogrenciId}, ${finalFiyat.toFixed(2)}, 'TRY', 'beklemede', ${plan}, 'havale', ${referans}, ${uygulananKod?.kod || null}, ${indirimTutari.toFixed(2)})
    `;
    if (uygulananKod) {
      await sql`UPDATE indirim_kodlari SET kullanim_sayisi = kullanim_sayisi + 1 WHERE id = ${uygulananKod.id}`;
    }

    return Response.json({
      referans,
      tutar: finalFiyat.toFixed(2),
      iban: process.env.HAVALE_IBAN,
      hesapSahibi: process.env.HAVALE_HESAP_SAHIBI,
      bankaAdi: process.env.HAVALE_BANKA_ADI,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Havale baslatilamadi" }, { status: 500 });
  }
}
