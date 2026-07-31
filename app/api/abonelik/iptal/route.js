import { sql } from "@/lib/db";
import { tokenDogrula } from "@/lib/auth";
import Iyzipay from "iyzipay";

function iyzipayIstemcisi() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
  });
}

function cookieOku(req, ad) {
  const cookie = req.headers.get("cookie") || "";
  const eslesme = cookie.match(new RegExp(`${ad}=([^;]+)`));
  return eslesme ? eslesme[1] : null;
}

export async function POST(req) {
  const veri = tokenDogrula(cookieOku(req, "karemux_token"));
  if (!veri?.kullaniciId) {
    return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
  }

  try {
    const abonelik = await sql`
      SELECT id, iyzico_abonelik_id FROM abonelikler
      WHERE kullanici_id = ${veri.kullaniciId} AND durum = 'aktif'
      ORDER BY baslangic DESC LIMIT 1
    `;
    if (!abonelik[0]) {
      return Response.json({ error: "Aktif abonelik bulunamadi" }, { status: 404 });
    }

    if (abonelik[0].iyzico_abonelik_id) {
      try {
        await new Promise((resolve, reject) => {
          iyzipayIstemcisi().subscriptionCancel.cancel(
            { subscriptionReferenceCode: abonelik[0].iyzico_abonelik_id },
            (err, result) => (err ? reject(err) : resolve(result))
          );
        });
      } catch (e) {
        console.error("iyzico abonelik iptali basarisiz:", e);
      }
    }

    await sql`
      UPDATE abonelikler SET durum = 'iptal', bitis = now()
      WHERE id = ${abonelik[0].id}
    `;

    return Response.json({ ok: true, mesaj: "Aboneligin iptal edildi. Bir daha ucret cekilmeyecek." });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Iptal islemi basarisiz, lutfen tekrar dene" }, { status: 500 });
  }
}
