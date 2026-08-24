// randevu/checkout - Canli Ders checkout ile AYNI desen. GERCEK ACIK BULUNDU:
// randevu/al hic otomatik odeme tahsilati yapmiyordu, "Katil" butonu odeme
// durumuna bakmadan calisiyordu. Bu, o eksigi kapatir.
import Iyzipay from "iyzipay";
import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

function iyzipayIstemcisi() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
  });
}

export async function POST(req) {
  try {
    const { randevuId, cihazId, iletisim } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    if (!randevuId) return Response.json({ error: "randevuId gerekli" }, { status: 400 });

    const randevu = await sql`SELECT id, ucret_tl, odendi FROM randevular WHERE id = ${randevuId} AND ogrenci_id = ${kullaniciId} AND durum != 'iptal'`;
    if (randevu.length === 0) return Response.json({ error: "Randevu bulunamadi" }, { status: 404 });
    if (randevu[0].odendi) return Response.json({ error: "Bu randevu zaten odenmis" }, { status: 400 });

    if (!iletisim?.eposta || !iletisim?.ad || !iletisim?.adres) {
      return Response.json({ error: "Iletisim bilgileri eksik" }, { status: 400 });
    }
    const tcKimlikNo = (iletisim.tcKimlikNo || "").replace(/\D/g, "");
    if (tcKimlikNo.length !== 11) {
      return Response.json({ error: "Gecerli bir TC kimlik numarasi girilmeli (11 hane)" }, { status: 400 });
    }

    const fiyat = Number(randevu[0].ucret_tl);
    const conversationId = `karemux-randevu-${Date.now()}`;
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: fiyat.toFixed(2),
      paidPrice: fiyat.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: conversationId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/callback`,
      buyer: {
        id: String(kullaniciId), name: iletisim.ad, surname: iletisim.soyad || "-", email: iletisim.eposta,
        identityNumber: tcKimlikNo, registrationAddress: iletisim.adres, city: iletisim.sehir || "Istanbul",
        country: "Turkey", ip: req.headers.get("x-forwarded-for") || "85.34.78.112",
      },
      shippingAddress: { contactName: iletisim.ad, city: iletisim.sehir || "Istanbul", country: "Turkey", address: iletisim.adres },
      billingAddress: { contactName: iletisim.ad, city: iletisim.sehir || "Istanbul", country: "Turkey", address: iletisim.adres },
      basketItems: [{ id: `randevu-${randevuId}`, name: `Karemux Ozel Ders (randevu #${randevuId})`, category1: "Egitim", itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: fiyat.toFixed(2) }],
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
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, conversation_id, randevu_id)
      VALUES (${kullaniciId}, ${fiyat.toFixed(2)}, 'TRY', 'beklemede', ${conversationId}, ${randevuId})
    `;

    return Response.json({ checkoutFormContent: sonuc.checkoutFormContent, token: sonuc.token });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Odeme sunucu hatasi" }, { status: 500 });
  }
}
