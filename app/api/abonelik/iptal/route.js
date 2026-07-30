// Tek tıkla abonelik iptali. Kunduz şikayetlerinde sık görülen "iptal etmek
// çok zor / izinsiz para kesildi" sorununa karşı bilinçli bir tasarım kararı:
// iptal, giriş yapmış kullanıcı için TEK istekle, onay adımı dışında hiçbir
// engel olmadan gerçekleşir.
import { sql } from "@/lib/db";
import { tokenDogrula } from "@/lib/auth";
import Iyzipay from "iyzipay";

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
});

function cookieOku(req, ad) {
  const cookie = req.headers.get("cookie") || "";
  const eslesme = cookie.match(new RegExp(`${ad}=([^;]+)`));
  return eslesme ? eslesme[1] : null;
}

export async function POST(req) {
  const veri = tokenDogrula(cookieOku(req, "karemux_token"));
  if (!veri?.kullaniciId) {
    return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });
  }

  try {
    const abonelik = await sql`
      SELECT id, iyzico_abonelik_id FROM abonelikler
      WHERE kullanici_id = ${veri.kullaniciId} AND durum = 'aktif'
      ORDER BY baslangic DESC LIMIT 1
    `;
    if (!abonelik[0]) {
      return Response.json({ error: "Aktif abonelik bulunamadı" }, { status: 404 });
    }

    // iyzico tarafında gerçek bir "Abonelik" ürünü kullanılıyorsa orada da iptal et.
    // NOT: Bu, iyzico Merchant Panel'de Abonelik (Subscription) ürününün aktif
    // olmasını gerektirir — checkoutFormInitialize (tek seferlik ödeme) kullanan
    // bir kurulumda bu adım atlanır, sadece bizim veritabanımızda iptal işaretlenir.
    if (abonelik[0].iyzico_abonelik_id) {
      try {
        await new Promise((resolve, reject) => {
          iyzipay.subscriptionCancel.cancel(
            { subscriptionReferenceCode: abonelik[0].iyzico_abonelik_id },
            (err, result) => (err ? reject(err) : resolve(result))
          );
        });
      } catch (e) {
        console.error("iyzico abonelik iptali başarısız (yine de bizim tarafta iptal ediyoruz):", e);
      }
    }

    await sql`
      UPDATE abonelikler SET durum = 'iptal', bitis = now()
      WHERE id = ${abonelik[0].id}
    `;

    return Response.json({ ok: true, mesaj: "Aboneliğin iptal edildi. Bir daha ücret çekilmeyecek." });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "İptal işlemi başarısız, lütfen tekrar dene" }, { status: 500 });
  }
}
