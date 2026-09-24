import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const anonHesaplar = await sql`SELECT id FROM kullanicilar WHERE eposta LIKE '%@anon.karemux.com'`;
  const testHesaplar = await sql`SELECT id FROM kullanicilar WHERE eposta LIKE '%@karemux-test.com' OR eposta LIKE 'audit-%'`;
  const idler = [...anonHesaplar, ...testHesaplar].map(h => h.id);

  async function say(sonucSql) {
    try { const r = await sonucSql; return Number(r[0]?.c || 0); } catch (e) { return `hata: ${e.message}`; }
  }

  const iliski = {
    ulusal_deneme_sonuclari: await say(sql`SELECT COUNT(*) as c FROM ulusal_deneme_sonuclari WHERE kullanici_id = ANY(${idler})`),
    ucretli_deneme_sonuclari: await say(sql`SELECT COUNT(*) as c FROM ucretli_deneme_sonuclari WHERE kullanici_id = ANY(${idler})`),
    sinav_sonuclari: await say(sql`SELECT COUNT(*) as c FROM sinav_sonuclari WHERE kullanici_id = ANY(${idler})`),
    hata_kitapcigi: await say(sql`SELECT COUNT(*) as c FROM hata_kitapcigi WHERE kullanici_id = ANY(${idler})`),
    ilerleme: await say(sql`SELECT COUNT(*) as c FROM ilerleme WHERE kullanici_id = ANY(${idler})`),
    seviye_tespit_kademe: await say(sql`SELECT COUNT(*) as c FROM seviye_tespit_kademe WHERE kullanici_id = ANY(${idler})`),
    gunluk_kullanim: await say(sql`SELECT COUNT(*) as c FROM gunluk_kullanim WHERE kullanici_id = ANY(${idler})`),
    konu_hakimiyet: await say(sql`SELECT COUNT(*) as c FROM konu_hakimiyet WHERE kullanici_id = ANY(${idler})`),
    tek_konu_oturumu: await say(sql`SELECT COUNT(*) as c FROM tek_konu_oturumu WHERE kullanici_id = ANY(${idler})`),
  };

  return Response.json({
    anonHesapSayisi: anonHesaplar.length,
    testHesapSayisi: testHesaplar.length,
    toplamHesap: idler.length,
    iliskiliVeri: iliski,
  });
}
