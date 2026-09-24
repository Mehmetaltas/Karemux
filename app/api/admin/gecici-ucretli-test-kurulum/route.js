import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const kurum = await sql`
    INSERT INTO kurumlar (ad, kurum_kodu, eposta) VALUES ('Audit Test Kurumu', 'AUDITTEST01', 'audit-kurum@karemux-test.com')
    RETURNING id, kurum_kodu
  `;
  const kurumId = kurum[0].id;
  const sorular = [
    { soru: "2+2 kactir?", secenekler: ["A) 3", "B) 4", "C) 5", "D) 6"], dogruIndex: 1, altKonu: "Toplama", aciklama: "2+2=4" },
    { soru: "5-3 kactir?", secenekler: ["A) 1", "B) 2", "C) 3", "D) 4"], dogruIndex: 1, altKonu: "Cikarma", aciklama: "5-3=2" },
  ];
  const deneme = await sql`
    INSERT INTO ucretli_denemeler (ad, ders, sinif, sorular, fiyat_tl, aktif)
    VALUES ('Audit Test Denemesi', 'Matematik', 8, ${JSON.stringify(sorular)}, 0, true)
    RETURNING id
  `;
  const denemeId = deneme[0].id;
  await sql`INSERT INTO kurum_deneme_satin_alma (kurum_id, deneme_id, tutar_tl, odendi) VALUES (${kurumId}, ${denemeId}, 0, true)`;
  return Response.json({ kurumId, kurumKodu: kurum[0].kurum_kodu, denemeId });
}
