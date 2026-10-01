import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const oturum = await sql`
    INSERT INTO canli_ders_oturumlari (baslik, fiyat_tl, max_kapasite, durum, tarih)
    VALUES ('Audit Test Oturumu', 1000, 10, 'planlandi', now() + interval '3 days')
    RETURNING id
  `;
  const oturumId = oturum[0].id;

  const normalKid = (await sql`INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, sinif) VALUES ('audit-cd-normal@karemux-test.com','anon','Audit Normal','ogrenci',8) RETURNING id`)[0].id;
  const aboneKid = (await sql`INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, sinif) VALUES ('audit-cd-abone@karemux-test.com','anon','Audit Abone','ogrenci',8) RETURNING id`)[0].id;
  await sql`INSERT INTO abonelikler (kullanici_id, plan, durum, baslangic, bitis) VALUES (${aboneKid}, 'yillik_8_sinif_lgs', 'aktif', now(), now() + interval '300 days')`;

  return Response.json({ oturumId, normalKid, aboneKid });
}
