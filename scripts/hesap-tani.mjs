// Gecici tani: karemuxegitim hesaplarinin DURUMU (sifre/kod yazilmaz).
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const not = (m) => console.log(`::notice::${m}`);
const r = await sql`SELECT id, eposta, rol, eposta_dogrulandi, (sifre_hash = 'anon') AS anon, length(sifre_hash) AS hl, left(sifre_hash,4) AS hon, giris_dogrulama_son_tarih AS kod_son FROM kullanicilar WHERE eposta ILIKE '%karemuxegitim%' ORDER BY id`;
not(`kullanicilar: ${r.length} kayit`);
for (const x of r) not(JSON.stringify({ ...x, eposta: x.eposta.replace(/./g, (c, i) => (c === "+" || c === "@" || c === "." ? c : x.eposta[i])) }));
const d = await sql`SELECT tur, basarili, count(*)::int c, max(olusturulma) son FROM guvenlik_denemeleri WHERE anahtar ILIKE '%karemuxegitim%' AND olusturulma > now() - interval '2 days' GROUP BY tur, basarili`.catch((e) => [{ hata: e.message }]);
not("denemeler: " + JSON.stringify(d));
