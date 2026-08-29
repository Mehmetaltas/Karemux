// checkout/route.js'in canli-ders versiyonu - AYNI Iyzico deseni (tek duzen).
// Ekstra: yillik_* abonesi ise fiyattan %25 indirim otomatik uygulanir.
// Koltuk, checkout BASLATILIRKEN (odenmeden once, odendi=false) tutulur -
// Iyzico basarisiz olursa geri alinir (asagida catch bloguna bakin).
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
  let katilimciId = null;
  try {
    const { oturumId, cihazId, iletisim, indirimKodu } = await req.json();
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

    // Yillik_* abonesine %25 indirim
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
      if (kodSonuc.length === 0) {
        return Response.json({ error: "Geçersiz veya süresi dolmuş indirim kodu" }, { status: 400 });
      }
      const kod = kodSonuc[0];
      if (kod.max_kullanim != null && kod.kullanim_sayisi >= kod.max_kullanim) {
        return Response.json({ error: "Bu indirim kodu kullanım limitine ulaştı" }, { status: 400 });
      }
      if (kod.yuzde) {
        kuponIndirimTutari = fiyat * (kod.yuzde / 100);
      } else if (kod.sabit_tutar) {
        kuponIndirimTutari = Number(kod.sabit_tutar);
      }
      kuponIndirimTutari = Math.min(kuponIndirimTutari, fiyat);
      uygulananKupon = { id: kod.id, kod: kodTemiz };
      fiyat = Math.max(fiyat - kuponIndirimTutari, 0);
    }

    if (!iletisim?.eposta || !iletisim?.ad || !iletisim?.adres) {
      return Response.json({ error: "Iletisim bilgileri eksik" }, { status: 400 });
    }
    const tcKimlikNo = (iletisim.tcKimlikNo || "").replace(/\D/g, "");
    if (tcKimlikNo.length !== 11) {
      return Response.json({ error: "Gecerli bir TC kimlik numarasi girilmeli (11 hane)" }, { status: 400 });
    }

    // Koltugu simdi tut (odenmeden once) - basarisiz olursa asagida geri alinacak.
    const katilimci = await sql`
      INSERT INTO canli_ders_katilimcilari (oturum_id, ogrenci_id, odendi) VALUES (${oturumId}, ${kullaniciId}, false) RETURNING id
    `;
    katilimciId = katilimci[0].id;

    const conversationId = `karemux-canlidasres-${Date.now()}`;
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
      basketItems: [{ id: `canlidasres-${oturumId}`, name: `Karemux Canli Ders (oturum #${oturumId})`, category1: "Egitim", itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: fiyat.toFixed(2) }],
    };

    const sonuc = await new Promise((resolve, reject) => {
      iyzipayIstemcisi().checkoutFormInitialize.create(request, (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });

    if (sonuc.status !== "success") {
      await sql`DELETE FROM canli_ders_katilimcilari WHERE id = ${katilimciId}`; // koltugu geri birak
      return Response.json({ error: sonuc.errorMessage || "Odeme baslatilamadi" }, { status: 400 });
    }

    await sql`
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, conversation_id, canli_ders_oturum_id, indirim_kodu, indirim_tutari)
      VALUES (${kullaniciId}, ${fiyat.toFixed(2)}, 'TRY', 'beklemede', ${conversationId}, ${oturumId}, ${uygulananKupon?.kod || null}, ${kuponIndirimTutari.toFixed(2)})
    `;
    if (uygulananKupon) {
      await sql`UPDATE indirim_kodlari SET kullanim_sayisi = kullanim_sayisi + 1 WHERE id = ${uygulananKupon.id}`;
    }

    return Response.json({ checkoutFormContent: sonuc.checkoutFormContent, token: sonuc.token, fiyat, indirimliMi });
  } catch (e) {
    console.error(e);
    if (katilimciId) { await sql`DELETE FROM canli_ders_katilimcilari WHERE id = ${katilimciId}`.catch(() => {}); }
    return Response.json({ error: "Odeme sunucu hatasi" }, { status: 500 });
  }
}
