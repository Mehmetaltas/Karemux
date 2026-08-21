// kurum/checkout'un ayni deseni - farkli olan tek sey: tekli bir deneme degil,
// N koltukluk bir yillik_* lisans satin aliniyor. Once kurum_lisans_satin_alma'ya
// bekleyen (odendi=false) satir acilir, sonra Iyzico baslatilir, callback'te
// odendi=true yapilir (checkout/callback/route.js).
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

    const { plan, koltukSayisi, iletisim } = await req.json();
    if (!Number.isInteger(koltukSayisi) || koltukSayisi < 1) {
      return Response.json({ error: "Gecerli bir koltuk sayisi girilmeli (en az 1)" }, { status: 400 });
    }
    const paketSonuc = await sql`SELECT anahtar, ad, fiyat_tl FROM paketler WHERE anahtar = ${plan} AND aktif = true AND anahtar LIKE 'yillik_%'`;
    if (paketSonuc.length === 0) return Response.json({ error: "Gecersiz veya lisanslanamayan paket" }, { status: 400 });
    const paket = paketSonuc[0];

    const kurumSonuc = await sql`SELECT ad, vergi_no, vergi_dairesi, yetkili_unvan FROM kurumlar WHERE id = ${yonetici.kurumId}`;
    const kurum = kurumSonuc[0];
    if (!kurum.vergi_no || !kurum.vergi_dairesi) {
      return Response.json({ error: "Fatura kesebilmemiz icin once kurum profilinden vergi bilgilerini tamamlamalisin (/api/kurum/profil)" }, { status: 400 });
    }
    if (!iletisim?.eposta || !iletisim?.adres) {
      return Response.json({ error: "Iletisim (eposta, adres) bilgileri eksik" }, { status: 400 });
    }

    const toplamFiyat = (Number(paket.fiyat_tl) * koltukSayisi).toFixed(2);

    // Bekleyen lisans satin alma kaydi - odendi=false, callback'te true yapilacak.
    const lisansSonuc = await sql`
      INSERT INTO kurum_lisans_satin_alma (kurum_id, plan, koltuk_sayisi, tutar_tl, odendi)
      VALUES (${yonetici.kurumId}, ${plan}, ${koltukSayisi}, ${toplamFiyat}, false)
      RETURNING id
    `;
    const lisansId = lisansSonuc[0].id;

    const conversationId = `karemux-kurumlisans-${Date.now()}`;

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: toplamFiyat,
      paidPrice: toplamFiyat,
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
      basketItems: [{ id: `lisans-${lisansId}`, name: `Karemux Kurum Lisansi - ${paket.ad} x${koltukSayisi}`, category1: "Egitim", itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: toplamFiyat }],
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
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, conversation_id, kurum_id, kurum_lisans_id)
      VALUES (${yonetici.kullaniciId}, ${toplamFiyat}, 'TRY', 'beklemede', ${conversationId}, ${yonetici.kurumId}, ${lisansId})
    `;

    return Response.json({ checkoutFormContent: sonuc.checkoutFormContent, token: sonuc.token });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Odeme sunucu hatasi" }, { status: 500 });
  }
}
