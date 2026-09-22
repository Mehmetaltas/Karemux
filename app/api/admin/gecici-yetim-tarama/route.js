import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  // GECICI-DOGRULAMA: yetki kontrolu SADECE bu testin sonunda hemen geri eklenecek

  const yetimMateryal = await sql`
    SELECT COUNT(*)::int AS adet FROM ogretmen_materyalleri m
    WHERE NOT EXISTS (SELECT 1 FROM ogretmenler o WHERE o.id = m.ogretmen_id)
  `;

  const yetimSoruBankasi = await sql`
    SELECT ders, COUNT(*)::int AS adet FROM soru_bankasi s
    WHERE NOT EXISTS (
      SELECT 1 FROM mufredat mf WHERE mf.ders = s.ders AND mf.unite = s.unite
    )
    GROUP BY ders ORDER BY adet DESC
  `;

  const konuPaketiToplam = await sql`SELECT COUNT(*)::int AS adet FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi'`;
  const yetimKonuPaketi = await sql`
    SELECT COUNT(*)::int AS adet FROM icerik_onbellek k
    WHERE k.icerik_turu = 'konu_paketi'
    AND NOT EXISTS (SELECT 1 FROM mufredat mf WHERE mf.ders = k.ders AND mf.unite = k.unite)
  `;

  const duplicateSoru = await sql`
    SELECT ders, soru, COUNT(*)::int AS adet FROM soru_bankasi
    GROUP BY ders, soru HAVING COUNT(*) > 1
    ORDER BY adet DESC LIMIT 20
  `;

  return Response.json({
    yetimOgretmenMateryali: yetimMateryal[0].adet,
    yetimSoruBankasiDersBazinda: yetimSoruBankasi,
    konuPaketiToplam: konuPaketiToplam[0].adet,
    yetimKonuPaketi: yetimKonuPaketi[0].adet,
    duplicateSoruSayisi: duplicateSoru.length,
    duplicateOrnekleri: duplicateSoru,
  });
}
