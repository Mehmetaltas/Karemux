// iyzico ile ödeme başlatma (Checkout Form yöntemi).
// iyzico Merchant Panel'den (sandbox veya production) API_KEY / SECRET_KEY alıp
// Vercel ortam değişkenlerine ekleyin: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL
// Sandbox: https://sandbox-api.iyzipay.com | Production: https://api.iyzipay.com

import Iyzipay from "iyzipay";
import { sql } from "@/lib/db";

function iyzipayIstemcisi() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
  });
}

// ONEMLI: Fiyatlar artik GERCEK `paketler` DB tablosundan okunuyor. Eskiden
// burada ayri, kopuk bir PLANLAR sabiti vardi (premium_aylik/premium_yillik,
// 99.90/899.90 TL) ve gercek yonetim panelindeki fiyatlarla hicbir ilgisi
// yoktu. 19 Agustos'ta Faz 10 taramasinda bulunup duzeltildi.
export async function POST(req) {
  try {
    const { plan, kullanici } = await req.json();
    const paketSonuc = await sql`SELECT ad, fiyat_tl FROM paketler WHERE anahtar = ${plan} AND aktif = true`;
    if (paketSonuc.length === 0) {
      return Response.json({ error: "Geçersiz plan" }, { status: 400 });
    }
    const secilenPlan = { fiyat: Number(paketSonuc[0].fiyat_tl).toFixed(2), ad: `Karemux ${paketSonuc[0].ad}` };
    if (!kullanici?.eposta || !kullanici?.ad || !kullanici?.adres) {
      return Response.json({ error: "Kullanıcı bilgileri eksik" }, { status: 400 });
    }
    if (!kullanici?.id) {
      return Response.json({ error: "Odeme icin giris yapmis olman gerekiyor" }, { status: 401 });
    }
    const tcKimlikNo = (kullanici.tcKimlikNo || "").replace(/\D/g, "");
    if (tcKimlikNo.length !== 11) {
      return Response.json({ error: "Geçerli bir TC kimlik numarası girilmeli (11 hane)" }, { status: 400 });
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
        identityNumber: tcKimlikNo,
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
      iyzipayIstemcisi().checkoutFormInitialize.create(request, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (sonuc.status !== "success") {
      return Response.json({ error: sonuc.errorMessage || "Ödeme başlatılamadı" }, { status: 400 });
    }

    // Bekleyen odeme kaydi - callback'te bu conversationId ile eslestirip
    // hangi kullaniciya hangi paketin verilecegini buluyoruz.
    await sql`
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, conversation_id, plan)
      VALUES (${kullanici.id}, ${secilenPlan.fiyat}, 'TRY', 'beklemede', ${conversationId}, ${plan})
    `;

    return Response.json({ checkoutFormContent: sonuc.checkoutFormContent, token: sonuc.token });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Ödeme sunucu hatası" }, { status: 500 });
  }
}
