import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  let katilimciId = null;
  try {
    const { oturumId, cihazId, indirimKodu } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    if (!oturumId) return Response.json({ error: "oturumId gerekli" }, { status: 400 });

    const oturum = await sql`
      SELECT o.id, o.max_kapasite, o.fiyat_tl,
             (SELECT COUNT(*) FROM canli_ders_katilimcilari k WHERE k.oturum_id = o.id)::int AS kayitli_ogrenci
      FROM canli_ders_oturumlari o WHERE o.id = ${oturumId} AND o.durum = 'planlandi'
    `;
    if (oturum.length === 0) return Response.json({ error: "Oturum bulunamadi" }, { status: 404 });
    if (oturum[0].kayitli_ogrenci >= oturum[0].max_kapasite) {
      return Response.json({ error: "Bu oturumda yer kalmadi" }, { status: 409 });
    }
    const zatenKayitli = await sql`SELECT 1 FROM canli_ders_katilimcilari WHERE oturum_id = ${oturumId} AND ogrenci_id = ${kullaniciId}`;
    if (zatenKayitli.length > 0) return Response.json({ error: "Bu oturuma zaten kayitlisin" }, { status: 400 });

    const abonelik = await sql`SELECT 1 FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' AND plan LIKE 'yillik_%' LIMIT 1`;
    const indirimliMi = abonelik.length > 0;
    let fiyat = indirimliMi ? Math.round((Number(oturum[0].fiyat_tl) * 0.75) / 5) * 5 : Number(oturum[0].fiyat_tl);

    let kuponIndirimTutari = 0;
    let uygulananKupon = null;
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
          if (kod.yuzde) kuponIndirimTutari = fiyat * (kod.yuzde / 100);
          else if (kod.sabit_tutar) kuponIndirimTutari = Number(kod.sabit_tutar);
          kuponIndirimTutari = Math.min(kuponIndirimTutari, fiyat);
          uygulananKupon = { id: kod.id, kod: kodTemiz };
          fiyat = Math.max(fiyat - kuponIndirimTutari, 0);
        }
      }
    }

    const katilimci = await sql`
      INSERT INTO canli_ders_katilimcilari (oturum_id, ogrenci_id, odendi) VALUES (${oturumId}, ${kullaniciId}, false) RETURNING id
    `;
    katilimciId = katilimci[0].id;

    const referans = `KRX-${Date.now().toString(36).toUpperCase()}`;

    await sql`
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, canli_ders_oturum_id, yontem, havale_referans, indirim_kodu, indirim_tutari)
      VALUES (${kullaniciId}, ${fiyat.toFixed(2)}, 'TRY', 'beklemede', ${oturumId}, 'havale', ${referans}, ${uygulananKupon?.kod || null}, ${kuponIndirimTutari.toFixed(2)})
    `;
    if (uygulananKupon) {
      await sql`UPDATE indirim_kodlari SET kullanim_sayisi = kullanim_sayisi + 1 WHERE id = ${uygulananKupon.id}`;
    }

    return Response.json({
      referans,
      tutar: fiyat.toFixed(2),
      iban: process.env.HAVALE_IBAN,
      hesapSahibi: process.env.HAVALE_HESAP_SAHIBI,
      bankaAdi: process.env.HAVALE_BANKA_ADI,
    });
  } catch (e) {
    console.error(e);
    if (katilimciId) { await sql`DELETE FROM canli_ders_katilimcilari WHERE id = ${katilimciId}`.catch(() => {}); }
    return Response.json({ error: "Havale baslatilamadi" }, { status: 500 });
  }
}
