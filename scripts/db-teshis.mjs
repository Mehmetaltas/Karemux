// SALT OKUNUR teshis: yapilacaklar 12/13/17 icin gercek durum. Hicbir sey yazmaz/silmez.
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const not = (m) => console.log(`::notice::${m}`);
const dene = async (ad, f) => { try { await f(); } catch (e) { console.log(`::warning::${ad} hata: ${String(e.message).slice(0, 160)}`); } };

await dene("bekleyen paketler", async () => {
  const r = await sql`SELECT id, sinif, ders, konu, onay_durumu FROM icerik_onbellek WHERE icerik_turu='konu_paketi' AND onay_durumu='bekliyor' ORDER BY id`;
  not(`bekliyor konu paketi: ${r.length} -> ` + r.map((x) => `#${x.id} ${x.sinif}.sinif ${x.ders}/${x.konu}`).join(" ; ").slice(0, 600));
});
await dene("carpanlar", async () => {
  const r = await sql`SELECT id, sinif, ders, konu, onay_durumu FROM icerik_onbellek WHERE konu ILIKE '%carpanlar ve katlar%' OR konu ILIKE '%çarpanlar ve katlar%'`;
  not(`'Carpanlar ve Katlar' satirlari: ${r.length} -> ` + r.map((x) => `#${x.id} s${x.sinif} ${x.ders} ${x.onay_durumu}`).join(" ; "));
});
await dene("soru_bankasi yetim", async () => {
  const t = await sql`SELECT COUNT(*)::int n FROM soru_bankasi`;
  const bos = await sql`SELECT COUNT(*)::int n FROM soru_bankasi WHERE unite IS NULL OR unite=''`;
  const ing = await sql`SELECT COUNT(*)::int n FROM soru_bankasi WHERE ders ILIKE 'ingilizce' AND (unite IS NOT NULL AND unite<>'') AND NOT EXISTS (SELECT 1 FROM mufredat m WHERE m.ders ILIKE soru_bankasi.ders AND m.sinif::text=soru_bankasi.sinif::text AND m.unite ILIKE soru_bankasi.unite)`;
  const yet = await sql`SELECT ders, COUNT(*)::int n FROM soru_bankasi s WHERE unite IS NOT NULL AND unite<>'' AND NOT EXISTS (SELECT 1 FROM mufredat m WHERE m.ders ILIKE s.ders AND m.sinif::text=s.sinif::text AND m.unite ILIKE s.unite) GROUP BY ders ORDER BY n DESC`;
  not(`soru_bankasi: toplam ${t[0].n}, unitesiz ${bos[0].n}, ingilizce mufredatta olmayan unite ${ing[0].n}; mufredatta eslesmeyen unite (ders bazli): ` + (yet.map((x) => `${x.ders}=${x.n}`).join(", ") || "yok"));
});
