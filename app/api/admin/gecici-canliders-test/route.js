import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const oturum = await sql`
    INSERT INTO canli_ders_oturumlari
      (tur, ders, baslangic_zamani, sure_dk, oturum_sayisi, oturum_araligi_gun, max_kapasite, fiyat_tl, ogretmen_payi_tl, jitsi_link, jitsi_oda_id, durum)
    VALUES
      ('grup', 'Matematik', now() + interval '3 days', 60, 1, 7, 10, 1000, 400, 'https://meet.jit.si/audit-test', 'audit-test', 'planlandi')
    RETURNING id
  `;
  const oturumId = oturum[0].id;

  const normalKid = (await sql`INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, sinif) VALUES ('audit-cd-normal@karemux-test.com','anon','Audit Normal','ogrenci',8) RETURNING id`)[0].id;
  const aboneKid = (await sql`INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, sinif) VALUES ('audit-cd-abone@karemux-test.com','anon','Audit Abone','ogrenci',8) RETURNING id`)[0].id;
  await sql`INSERT INTO abonelikler (kullanici_id, plan, durum, baslangic, bitis) VALUES (${aboneKid}, 'yillik_8_sinif_lgs', 'aktif', now(), now() + interval '300 days')`;

  return Response.json({ oturumId, normalKid, aboneKid });
}
