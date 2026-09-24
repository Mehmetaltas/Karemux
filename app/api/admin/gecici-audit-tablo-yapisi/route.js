import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";

async function tabloBilgisi(tabloAdi, sayimSorgusu) {
  try {
    const kolonlar = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ${tabloAdi} ORDER BY ordinal_position`;
    const sayim = await sayimSorgusu();
    return { kolonlar: kolonlar.map(k => `${k.column_name}:${k.data_type}`), kayit_sayisi: sayim[0]?.c };
  } catch (e) {
    return { hata: e.message };
  }
}

export async function GET() {
  const sonuc = {
    ulusal_denemeler: await tabloBilgisi("ulusal_denemeler", () => sql`SELECT COUNT(*) as c FROM ulusal_denemeler`),
    ulusal_deneme_sonuclari: await tabloBilgisi("ulusal_deneme_sonuclari", () => sql`SELECT COUNT(*) as c FROM ulusal_deneme_sonuclari`),
    ucretli_denemeler: await tabloBilgisi("ucretli_denemeler", () => sql`SELECT COUNT(*) as c FROM ucretli_denemeler`),
    ucretli_deneme_sonuclari: await tabloBilgisi("ucretli_deneme_sonuclari", () => sql`SELECT COUNT(*) as c FROM ucretli_deneme_sonuclari`),
    kurum_deneme_satin_alma: await tabloBilgisi("kurum_deneme_satin_alma", () => sql`SELECT COUNT(*) as c FROM kurum_deneme_satin_alma`),
    hata_kitapcigi: await tabloBilgisi("hata_kitapcigi", () => sql`SELECT COUNT(*) as c FROM hata_kitapcigi`),
  };
  return Response.json(sonuc);
}
