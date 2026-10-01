import { sql } from "@/lib/db";
import { getActiveAbonelik } from "@/lib/paket";
export const dynamic = "force-dynamic";

export async function GET() {
  // 1. Test kullanicisi + bekleyen havale odemesi olustur (yillik_6_sinif paketi).
  const kullanici = await sql`
    INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, sinif)
    VALUES ('audit-dalga1-test@karemux-test.com', 'anon', 'Audit Dalga1', 'ogrenci', 6)
    RETURNING id
  `;
  const kid = kullanici[0].id;
  const odeme = await sql`
    INSERT INTO odemeler (kullanici_id, tutar, durum, plan, yontem)
    VALUES (${kid}, 5000, 'beklemede', 'yillik_6_sinif', 'havale')
    RETURNING id
  `;
  const odemeId = odeme[0].id;

  // 2. havale-onay'in "basarili" dalindaki AYNI mantik (bireysel paket kismi).
  const plan = "yillik_6_sinif";
  const paket = await sql`SELECT id, sure_gun, kredi_miktari, fiyat_tl FROM paketler WHERE anahtar = ${plan}`;
  const sureGun = paket[0]?.sure_gun || 365;

  await sql`UPDATE odemeler SET durum = 'basarili' WHERE id = ${odemeId}`;
  await sql`
    INSERT INTO abonelikler (kullanici_id, plan, durum, iyzico_abonelik_id, baslangic, bitis, paket_id)
    VALUES (${kid}, ${plan}, 'aktif', ${"havale-" + odemeId}, now(), now() + (${sureGun}::text || ' days')::interval, ${paket[0]?.id || null})
  `;

  // 3. Dogrulama - hem raw SQL hem getActiveAbonelik() ile.
  const rawKayit = await sql`SELECT plan, paket_id, durum FROM abonelikler WHERE kullanici_id = ${kid}`;
  const merkeziSonuc = await getActiveAbonelik(kid);

  return Response.json({ kullaniciId: kid, odemeId, paketIdBeklenen: paket[0]?.id, rawKayit: rawKayit[0], getActiveAbonelikSonucu: merkeziSonuc });
}
