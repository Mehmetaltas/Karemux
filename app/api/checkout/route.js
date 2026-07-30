// iyzico ile ödeme başlatma (Checkout Form yöntemi).
// iyzico Merchant Panel'den (sandbox veya production) API_KEY / SECRET_KEY alıp
// Vercel ortam değişkenlerine ekleyin: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL
// Sandbox: https://sandbox-api.iyzipay.com | Production: https://api.iyzipay.com

import Iyzipay from "iyzipay";

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
});

const PLANLAR = {
  premium_aylik: { fiyat: "99.90", ad: "Karemux Premium (Aylık)" },
  premium_yillik: { fiyat: "899.90", ad: "Karemux Premium (Yıllık)" },
};

export async function POST(req) {
  try {
    const { plan, kullanici } = await req.json();
    const secilenPlan = PLANLAR[plan];
    if (!secilenPlan) {
      return Response.json({ error: "Geçersiz plan" }, { status: 400 });
    }
    if (!kullanici?.eposta || !kullanici?.ad || !kullanici?.adres) {
      return Response.json({ error: "Kullanıcı bilgileri eksik" }, { status: 400 });
    }

    const conversationId = `karemux-${Date.now()}`;

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: secilenPlan.fiyat,
      paidPrice: secilenPlan.fiyat,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: conversationId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/callback`,
      buyer: {
        id: String(kullanici.id || "misafir"),
        name: kullanici.ad,
        surname: kullanici.soyad || "-",
        email: kullanici.eposta,
        identityNumber: "11111111111", // gerçek üründe TC kimlik no zorunlu, formdan alınmalı
        registrationAddress: kullanici.adres,
        city: kullanici.sehir || "Istanbul",
        country: "Turkey",
        ip: req.headers.get("x-forwarded-for") || "85.34.78.112",
      },
      shippingAddress: {
        contactName: kullanici.ad,
        city: kullanici.sehir || "Istanbul",
        country: "Turkey",
        address: kullanici.adres,
      },
      billingAddress: {
        contactName: kullanici.ad,
        city: kullanici.sehir || "Istanbul",
        country: "Turkey",
        address: kullanici.adres,
      },
      basketItems: [
        {
          id: plan,
          name: secilenPlan.ad,
          category1: "Eğitim",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: secilenPlan.fiyat,
        },
      ],
    };

    const sonuc = await new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (sonuc.status !== "success") {
      return Response.json({ error: sonuc.errorMessage || "Ödeme başlatılamadı" }, { status: 400 });
    }

    return Response.json({ checkoutFormContent: sonuc.checkoutFormContent, token: sonuc.token });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Ödeme sunucu hatası" }, { status: 500 });
  }
}
