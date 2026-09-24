import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const anonHesaplar = await sql`SELECT id FROM kullanicilar WHERE eposta LIKE '%@anon.karemux.com'`;
  const testHesaplar = await sql`SELECT id FROM kullanicilar WHERE eposta LIKE '%@karemux-test.com' OR eposta LIKE 'audit-%'`;
  const idler = [...anonHesaplar, ...testHesaplar].map(h => h.id);

  const silinen = {};
  async function sil(ad, sonucSql) {
    try { const r = await sonucSql; silinen[ad] = r.length; } catch (e) { silinen[ad] = `hata: ${e.message}`; }
  }

  await sil("ulusal_deneme_sonuclari", sql`DELETE FROM ulusal_deneme_sonuclari WHERE kullanici_id = ANY(${idler}) RETURNING id`);
  await sil("ucretli_deneme_sonuclari", sql`DELETE FROM ucretli_deneme_sonuclari WHERE kullanici_id = ANY(${idler}) RETURNING id`);
  await sil("sinav_sonuclari", sql`DELETE FROM sinav_sonuclari WHERE kullanici_id = ANY(${idler}) RETURNING id`);
  await sil("hata_kitapcigi", sql`DELETE FROM hata_kitapcigi WHERE kullanici_id = ANY(${idler}) RETURNING id`);
  await sil("ilerleme", sql`DELETE FROM ilerleme WHERE kullanici_id = ANY(${idler}) RETURNING id`);
  await sil("gunluk_kullanim", sql`DELETE FROM gunluk_kullanim WHERE kullanici_id = ANY(${idler}) RETURNING id`);
  await sil("kullanicilar", sql`DELETE FROM kullanicilar WHERE id = ANY(${idler}) RETURNING id`);

  return Response.json({ toplamHesapSilindi: idler.length, detay: silinen });
}
