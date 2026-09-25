import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const kurum = await sql`
    INSERT INTO kurumlar (ad, kurum_kodu, eposta) VALUES ('Audit Regresyon Kurumu', 'AUDITREG01', 'audit-reg-kurum@karemux-test.com')
    RETURNING id, kurum_kodu
  `;
  const kurumId = kurum[0].id;
  const sorular = [
    { soru: "4+4 kactir?", secenekler: ["A) 6", "B) 7", "C) 8", "D) 9"], dogruIndex: 2, altKonu: "Toplama", aciklama: "4+4=8" },
  ];
  const deneme = await sql`
    INSERT INTO ucretli_denemeler (ad, ders, sinif, sorular, fiyat_tl, aktif)
    VALUES ('Audit Regresyon Denemesi', 'Matematik', 8, ${JSON.stringify(sorular)}, 0, true)
    RETURNING id
  `;
  const denemeId = deneme[0].id;
  await sql`INSERT INTO kurum_deneme_satin_alma (kurum_id, deneme_id, tutar_tl, odendi) VALUES (${kurumId}, ${denemeId}, 0, true)`;
  return Response.json({ kurumId, kurumKodu: kurum[0].kurum_kodu, denemeId });
}
