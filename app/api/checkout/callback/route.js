import Iyzipay from "iyzipay";
import { sql } from "@/lib/db";

// Iyzico, odeme formu tamamlaninca kullanicinin tarayicisini BURAYA (POST,
// form-encoded, token alaniyla) yonlendirir. Bu, checkout/route.js'in
// cagirdigi ama daha once HIC var olmayan uc nokta - 19 Agustos Faz 10
// taramasinda bulundu, o gun ilk kez yazildi.
function iyzipayIstemcisi() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
  });
}

export async function POST(req) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://karemux-nu.vercel.app";
  try {
    const form = await req.formData();
    const token = form.get("token");
    if (!token) {
      return Response.redirect(`${siteUrl}/?odeme=hata`, 302);
    }

    const sonuc = await new Promise((resolve, reject) => {
      iyzipayIstemcisi().checkoutForm.retrieve({ locale: Iyzipay.LOCALE.TR, token }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (sonuc.paymentStatus !== "SUCCESS") {
      // Basarisiz odeme - bekleyen kaydi guncelle, kullaniciyi bilgilendir.
      if (sonuc.conversationId) {
        await sql`UPDATE odemeler SET durum = 'basarisiz' WHERE conversation_id = ${sonuc.conversationId} AND durum = 'beklemede'`;
      }
      return Response.redirect(`${siteUrl}/?odeme=basarisiz`, 302);
    }

    const bekleyenOdeme = await sql`
      SELECT id, kullanici_id, plan, kurum_id, ucretli_deneme_id, kurum_lisans_id, canli_ders_oturum_id, randevu_id FROM odemeler WHERE conversation_id = ${sonuc.conversationId} AND durum = 'beklemede'
    `;
    if (bekleyenOdeme.length === 0) {
      // Odeme basarili ama eslestirilecek bekleyen kayit yok - beklenmeyen durum, loglayip yonlendir.
      console.error("Callback: eslesen bekleyen odeme kaydi bulunamadi, conversationId:", sonuc.conversationId);
      return Response.redirect(`${siteUrl}/?odeme=hata`, 302);
    }
    const { id: odemeId, kullanici_id: kullaniciId, plan, kurum_id: kurumId, ucretli_deneme_id: denemeId, kurum_lisans_id: lisansId, canli_ders_oturum_id: oturumId, randevu_id: randevuId } = bekleyenOdeme[0];

    await sql`UPDATE odemeler SET durum = 'basarili', iyzico_odeme_id = ${sonuc.paymentId || token} WHERE id = ${odemeId}`;

    if (randevuId) {
      // Ozel Ders (1-1 randevu) - GERCEK ACIK KAPATILDI: eskiden bu odeme
      // adimi hic yoktu, "Katil" butonu odeme durumuna bakmadan calisiyordu.
      await sql`UPDATE randevular SET odendi = true WHERE id = ${randevuId} AND ogrenci_id = ${kullaniciId}`;
      return Response.redirect(`${siteUrl}/?odeme=basarili`, 302);
    }

    if (oturumId) {
      // Canli Ders - koltuk checkout baslarken zaten tutulmustu (odendi=false), simdi true yapiliyor.
      await sql`UPDATE canli_ders_katilimcilari SET odendi = true WHERE oturum_id = ${oturumId} AND ogrenci_id = ${kullaniciId}`;
      return Response.redirect(`${siteUrl}/?odeme=basarili`, 302);
    }

    if (kurumId && lisansId) {
      // Kurum toplu lisans satin almasi - koltuklar SATIN ALINDI ama henuz
      // hicbir ogrenciye ATANMADI (atama ayri bir adim, /api/kurum/koltuk-ata).
      await sql`UPDATE kurum_lisans_satin_alma SET odendi = true WHERE id = ${lisansId}`;
      return Response.redirect(`${siteUrl}/?odeme=basarili`, 302);
    }

    if (kurumId && denemeId) {
      // Kurum-deneme satin almasi (bireysel abonelik degil) - kurum_deneme_satin_alma'ya isaretlenir.
      const denemeSonuc = await sql`SELECT fiyat_tl FROM ucretli_denemeler WHERE id = ${denemeId}`;
      const tutar = denemeSonuc[0]?.fiyat_tl || 0;
      await sql`
        INSERT INTO kurum_deneme_satin_alma (kurum_id, deneme_id, tutar_tl, odendi)
        VALUES (${kurumId}, ${denemeId}, ${tutar}, true)
        ON CONFLICT (kurum_id, deneme_id) DO UPDATE SET tutar_tl = ${tutar}, odendi = true
      `;
      return Response.redirect(`${siteUrl}/?odeme=basarili`, 302);
    }

    // Bireysel satin alma - paket TURUNE gore dallanir.
    const paket = await sql`SELECT id, sure_gun, kredi_miktari, fiyat_tl FROM paketler WHERE anahtar = ${plan}`;
    const sureGun = paket[0]?.sure_gun || 365;
    const paketFiyati = paket[0]?.fiyat_tl || 0;

    // GERCEK ACIK KAPATILDI (25 Agustos): bu satislar INSERT'i eskiden HIC
    // yoktu - muhasebe panelinin "Bu Ay Gelir" KPI'si SADECE satislar
    // tablosundan hesaplaniyor, yani gercek satislar olsa bile panel HER
    // ZAMAN 0 gelir gosteriyordu. Iyzico komisyonu henuz gercek anahtarlar
    // baglanmadigi icin bilinmiyor, simdilik net_gelir_tl = tutar_tl.
    await sql`
      INSERT INTO satislar (kullanici_id, paket_id, tutar_tl, net_gelir_tl)
      VALUES (${kullaniciId}, ${paket[0]?.id || null}, ${paketFiyati}, ${paketFiyati})
    `;

    if (paket[0]?.kredi_miktari) {
      // Kredi paketi (orn. soru_coz_kredi) - abonelik DEGIL, mevcut kredi bakiyesine EKLENIR.
      await sql`
        INSERT INTO kullanici_kredileri (kullanici_id, kalan_kredi)
        VALUES (${kullaniciId}, ${paket[0].kredi_miktari})
        ON CONFLICT (kullanici_id) DO UPDATE SET kalan_kredi = kullanici_kredileri.kalan_kredi + ${paket[0].kredi_miktari}, guncellenme = now()
      `;
      return Response.redirect(`${siteUrl}/?odeme=basarili`, 302);
    }

    await sql`
      INSERT INTO abonelikler (kullanici_id, plan, durum, iyzico_abonelik_id, baslangic, bitis)
      VALUES (${kullaniciId}, ${plan}, 'aktif', ${sonuc.paymentId || token}, now(), now() + (${sureGun} || ' days')::interval)
    `;

    return Response.redirect(`${siteUrl}/?odeme=basarili`, 302);
  } catch (e) {
    console.error("Checkout callback hatasi:", e);
    return Response.redirect(`${siteUrl}/?odeme=hata`, 302);
  }
}
