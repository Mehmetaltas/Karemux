import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const paketler = [
    ["deneme_kulubu_baslangic", "Deneme Kulübü Başlangıç", 2490, 365],
    ["deneme_kulubu_standart", "Deneme Kulübü Standart", 5490, 365],
    ["deneme_kulubu_lgs", "Deneme Kulübü LGS", 9900, 365],
  ];
  const eklenen = [];
  for (const [anahtar, ad, fiyat, sureGun] of paketler) {
    const sonuc = await sql`
      INSERT INTO paketler (anahtar, ad, fiyat_tl, sure_gun, aktif)
      VALUES (${anahtar}, ${ad}, ${fiyat}, ${sureGun}, true)
      ON CONFLICT (anahtar) DO UPDATE SET ad = EXCLUDED.ad, fiyat_tl = EXCLUDED.fiyat_tl, sure_gun = EXCLUDED.sure_gun, aktif = true
      RETURNING id, anahtar
    `;
    eklenen.push(sonuc[0]);
  }
  return Response.json({ eklenen });
}
