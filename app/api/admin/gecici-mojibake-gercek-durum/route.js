import { sql } from "@/lib/db";
import { MOJIBAKE_KARAKTER } from "@/lib/kalite-motoru";

export const dynamic = "force-dynamic";

export async function GET() {
  const idler = [1494, 1885, 1886, 1887, 1888, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1899];
  const kayitlar = await sql`SELECT id, soru FROM soru_bankasi WHERE id = ANY(${idler})`;
  const durum = kayitlar.map((k) => ({ id: k.id, bozukMu: MOJIBAKE_KARAKTER.test(k.soru || ""), soru: (k.soru || "").slice(0, 60) }));
  return Response.json({ toplam: durum.length, bozukSayisi: durum.filter((d) => d.bozukMu).length, durum });
}
