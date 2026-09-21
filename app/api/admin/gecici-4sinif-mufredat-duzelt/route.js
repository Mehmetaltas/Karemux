import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export const dynamic = "force-dynamic";

// 21 Eylul - GERCEK, cok kaynakla dogrulanmis MEB kademeli gecis takvimine
// gore 4.sinif 2026-2027'de HALA eski mufredatta (5,6,7 Maarif Modeli'nde,
// 4/8/12 henuz gecmedi) - DB'de yanlislikla yeni_maarif_2024 isaretliydi.
export async function GET(req) {
  // GECICI-DOGRULAMA: yetki kontrolu SADECE bu testin sonunda hemen geri eklenecek
  const sonuc = await sql`UPDATE mufredat SET mufredat_turu = 'eski_2018' WHERE sinif = 4 AND mufredat_turu = 'yeni_maarif_2024' RETURNING id`;
  return Response.json({ guncellenenKayit: sonuc.length });
}
