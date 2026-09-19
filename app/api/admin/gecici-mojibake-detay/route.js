import { sql } from "@/lib/db";
import { MOJIBAKE_KARAKTER } from "@/lib/kalite-motoru";

export async function GET() {
  const kayitlar = await sql`SELECT id, ders, sinif, unite, alt_konu, zorluk, soru FROM soru_bankasi WHERE ders = 'Turkce'`;
  const bozuklar = kayitlar.filter((k) => MOJIBAKE_KARAKTER.test(k.soru || ""));
  return Response.json({ bozuklar });
}
