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
    sinav_sonuclari: await tabloBilgisi("sinav_sonuclari", () => sql`SELECT COUNT(*) as c FROM sinav_sonuclari`),
    deneme_sonuclari: await tabloBilgisi("deneme_sonuclari", () => sql`SELECT COUNT(*) as c FROM deneme_sonuclari`),
    deneme_satin_alma: await tabloBilgisi("deneme_satin_alma", () => sql`SELECT COUNT(*) as c FROM deneme_satin_alma`),
    deneme_yazili: await tabloBilgisi("deneme_yazili", () => sql`SELECT COUNT(*) as c FROM deneme_yazili`),
    sinav_hazirlik_deneyimi: await tabloBilgisi("sinav_hazirlik_deneyimi", () => sql`SELECT COUNT(*) as c FROM sinav_hazirlik_deneyimi`),
  };
  return Response.json(sonuc);
}
