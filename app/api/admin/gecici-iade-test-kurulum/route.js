import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const kullanici = await sql`
    INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, sinif)
    VALUES ('audit-iade-test@karemux-test.com', 'anon', 'Audit Iade', 'ogrenci', 8)
    RETURNING id
  `;
  const kid = kullanici[0].id;
  const odeme = await sql`
    INSERT INTO odemeler (kullanici_id, tutar, durum, plan, yontem)
    VALUES (${kid}, 500, 'basarili', 'yillik_8_sinif', 'havale')
    RETURNING id
  `;
  const abonelik = await sql`
    INSERT INTO abonelikler (kullanici_id, plan, durum, iyzico_abonelik_id, baslangic, bitis)
    VALUES (${kid}, 'yillik_8_sinif', 'aktif', 'test-iade', now(), now() + interval '365 days')
    RETURNING id
  `;
  const talep = await sql`
    INSERT INTO iade_talepleri (kullanici_id, odeme_id, paket, tutar_tl, sebep)
    VALUES (${kid}, ${odeme[0].id}, 'yillik_8_sinif', 500, 'test')
    RETURNING id
  `;
  return Response.json({ kullaniciId: kid, odemeId: odeme[0].id, abonelikId: abonelik[0].id, talepId: talep[0].id });
}
