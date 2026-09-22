import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const yetimKonuPaketiOrnek = await sql`
    SELECT k.ders, k.unite AS kullanilan_unite FROM icerik_onbellek k
    WHERE k.icerik_turu = 'konu_paketi'
    AND NOT EXISTS (SELECT 1 FROM mufredat mf WHERE mf.ders = k.ders AND mf.unite = k.unite)
  `;
  const mufredatIngilizceUniteler = await sql`SELECT DISTINCT unite FROM mufredat WHERE ders = 'Ingilizce' LIMIT 10`;
  const soruBankasiIngilizceUniteler = await sql`SELECT DISTINCT unite FROM soru_bankasi WHERE ders = 'Ingilizce' LIMIT 10`;

  return Response.json({
    yetimKonuPaketiOrnek,
    mufredatIngilizceUniteler,
    soruBankasiIngilizceUniteler,
  });
}
