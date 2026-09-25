import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const sorular = [
    { soru: "3+3 kactir?", secenekler: ["A) 5", "B) 6", "C) 7", "D) 8"], dogruIndex: 1, altKonu: "Toplama", aciklama: "3+3=6" },
  ];
  const sonuc = await sql`
    INSERT INTO ucretli_denemeler (ad, ders, sinif, sorular, fiyat_tl, aktif)
    VALUES ('Audit DK Test Denemesi', 'Matematik', 8, ${JSON.stringify(sorular)}, 0, true)
    RETURNING id
  `;
  return Response.json({ denemeId: sonuc[0].id });
}
