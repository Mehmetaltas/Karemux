// checkout/route.js'in kurum-deneme versiyonu - AYNI Iyzico deseni tekrarlanir
// (tek duzen), tek fark: basket/kayit bir 'plan' degil, spesifik bir
// ucretli_deneme'ye ait. Callback'te (checkout/callback/route.js) kurum_id +
// ucretli_deneme_id doluysa bu dal isler.
import Iyzipay from "iyzipay";
import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

function iyzipayIstemcisi() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
  });
}

export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { denemeId, iletisim } = await req.json();
    const denemeSonuc = await sql`SELECT id, ad, fiyat_tl FROM ucretli_denemeler WHERE id = ${denemeId} AND aktif = true`;
    if (denemeSonuc.length === 0) return Response.json({ error: "Gecersiz deneme" }, { status: 400 });
    const deneme = denemeSonuc[0];

    const zatenVar = await sql`SELECT 1 FROM kurum_deneme_satin_alma WHERE kurum_id = ${yonetici.kurumId} AND deneme_id = ${denemeId} AND odendi = true`;
    if (zatenVar.length > 0) return Response.json({ error: "Bu denemeyi zaten satin aldin" }, { status: 400 });

    // Vergi bilgileri kurum PROFILINDEN okunur (her satin almada tekrar sorulmaz) -
    // yoksa once /api/kurum/profil ile tamamlanmasi gerekir.
    const kurumSonuc = await sql`SELECT ad, vergi_no, vergi_dairesi, yetkili_unvan FROM kurumlar WHERE id = ${yonetici.kurumId}`;
    const kurum = kurumSonuc[0];
    if (!kurum.vergi_no || !kurum.vergi_dairesi) {
      return Response.json({ error: "Fatura kesebilmemiz icin once kurum profilinden vergi bilgilerini tamamlamalisin (/api/kurum/profil)" }, { status: 400 });
    }
    if (!iletisim?.eposta || !iletisim?.adres) {
      return Response.json({ error: "Iletisim (eposta, adres) bilgileri eksik" }, { status: 400 });
    }

    const fiyat = Number(deneme.fiyat_tl).toFixed(2);
    const conversationId = `karemux-kurum-${Date.now()}`;

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: fiyat,
      paidPrice: fiyat,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: conversationId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/callback`,
      buyer: {
        id: String(yonetici.kullaniciId),
        name: kurum.yetkili_unvan || kurum.ad,
        surname: "-",
        email: iletisim.eposta,
        identityNumber: kurum.vergi_no,
        registrationAddress: iletisim.adres,
        city: iletisim.sehir || "Istanbul",
        country: "Turkey",
        ip: req.headers.get("x-forwarded-for") || "85.34.78.112",
      },
      shippingAddress: { contactName: kurum.ad, city: iletisim.sehir || "Istanbul", country: "Turkey", address: iletisim.adres },
      billingAddress: { contactName: kurum.ad, city: iletisim.sehir || "Istanbul", country: "Turkey", address: iletisim.adres },
      basketItems: [{ id: String(denemeId), name: `Karemux Ucretli Deneme - ${deneme.ad}`, category1: "Egitim", itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: fiyat }],
    };

    const sonuc = await new Promise((resolve, reject) => {
      iyzipayIstemcisi().checkoutFormInitialize.create(request, (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });

    if (sonuc.status !== "success") {
      return Response.json({ error: sonuc.errorMessage || "Odeme baslatilamadi" }, { status: 400 });
    }

    await sql`
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, conversation_id, kurum_id, ucretli_deneme_id)
      VALUES (${yonetici.kullaniciId}, ${fiyat}, 'TRY', 'beklemede', ${conversationId}, ${yonetici.kurumId}, ${denemeId})
    `;

    return Response.json({ checkoutFormContent: sonuc.checkoutFormContent, token: sonuc.token });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Odeme sunucu hatasi" }, { status: 500 });
  }
}
