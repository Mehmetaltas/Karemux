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
      SELECT id, kullanici_id, plan, kurum_id, ucretli_deneme_id FROM odemeler WHERE conversation_id = ${sonuc.conversationId} AND durum = 'beklemede'
    `;
    if (bekleyenOdeme.length === 0) {
      // Odeme basarili ama eslestirilecek bekleyen kayit yok - beklenmeyen durum, loglayip yonlendir.
      console.error("Callback: eslesen bekleyen odeme kaydi bulunamadi, conversationId:", sonuc.conversationId);
      return Response.redirect(`${siteUrl}/?odeme=hata`, 302);
    }
    const { id: odemeId, kullanici_id: kullaniciId, plan, kurum_id: kurumId, ucretli_deneme_id: denemeId } = bekleyenOdeme[0];

    await sql`UPDATE odemeler SET durum = 'basarili', iyzico_odeme_id = ${sonuc.paymentId || token} WHERE id = ${odemeId}`;

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

    // Bireysel abonelik satin almasi (mevcut davranis)
    const paket = await sql`SELECT sure_gun FROM paketler WHERE anahtar = ${plan}`;
    const sureGun = paket[0]?.sure_gun || 365;

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
