// Vercel Cron her gece 03:00'te (Turkiye saati) calisir. Soru bankasinda az
// biriken (ders+sinif+unite) kombinasyonlarini bulup, AI ile arka planda
// EK sorular uretip bankaya ekler - boylece ogrenciler gun icinde soru
// istediginde banka zaten dolu olur, AI cagrisi gerekmez. Gunde SINIRLI
// sayida kombinasyon isler (maliyet kontrolu icin).
import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";

const GUNLUK_ISLENECEK_KOMBINASYON = 8; // gecede kac konu icin ek soru uretilsin
const HEDEF_SORU_SAYISI = 15; // her kombinasyon icin bankada en az kac soru olsun

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    // En cok talep goren ama bankada az soru biriken kombinasyonlari bul -
    // gunluk_gorevler/ilerleme'den populerligi, soru_bankasi'ndan mevcut
    // stogu karsilastirarak "acil doldurulmasi gereken" konulari secer.
    const eksikKombinasyonlar = await sql`
      SELECT i.ders, i.sinif, i.unite, COUNT(DISTINCT i.kullanici_id)::int as ilgi,
             COALESCE(sb.mevcut, 0)::int as mevcut_soru
      FROM ilerleme i
      LEFT JOIN (
        SELECT ders, sinif, unite, COUNT(*) as mevcut FROM soru_bankasi GROUP BY ders, sinif, unite
      ) sb ON sb.ders = i.ders AND sb.sinif = i.sinif AND sb.unite = i.unite
      WHERE i.ders IS NOT NULL AND i.unite IS NOT NULL
      GROUP BY i.ders, i.sinif, i.unite, sb.mevcut
      HAVING COALESCE(sb.mevcut, 0) < ${HEDEF_SORU_SAYISI}
      ORDER BY ilgi DESC, mevcut_soru ASC
      LIMIT ${GUNLUK_ISLENECEK_KOMBINASYON}
    `;

    let toplamEklenen = 0;
    const islenenler = [];

    for (const k of eksikKombinasyonlar) {
      const eksikAdet = HEDEF_SORU_SAYISI - k.mevcut_soru;
      const uretilecek = Math.min(10, eksikAdet); // tek seferde en fazla 10 soru
      try {
        const p = `Sen bir LGS/ortaokul ogretmenisin. "${k.ders}" dersinin "${k.unite}" unitesinin TAMAMINI kapsayan, ${k.sinif}. sinif seviyesinde ${uretilecek} coktan secmeli soru hazirla. Gercekci, LGS tarzi, bag lam temelli sorular olsun. Her soru icin "aciklama" alaninda dogru cevabin nedenini 1-2 cumleyle acikla. SADECE JSON dondur:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"..."}]`;
        const cevap = await aiCagir({ prompt: p, maxTokens: 3500, jsonModu: true });
        const temiz = cevap.replace(/```json|```/g, "").trim();
        const baslangic = temiz.indexOf("["), bitis = temiz.lastIndexOf("]");
        const sorularHam = JSON.parse(temiz.slice(baslangic, bitis + 1));
        const sorular = (Array.isArray(sorularHam) ? sorularHam : []).filter((s) =>
          s && typeof s.soru === "string" && Array.isArray(s.secenekler) && s.secenekler.length >= 2 &&
          Number.isInteger(s.dogruIndex) && s.dogruIndex >= 0 && s.dogruIndex < s.secenekler.length
        );
        for (const s of sorular) {
          await sql`
            INSERT INTO soru_bankasi (ders, sinif, unite, soru, secenekler, dogru_index, kaynak_turu, aciklama)
            VALUES (${k.ders}, ${k.sinif}, ${k.unite}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, 'otomatik_arkaplan', ${s.aciklama || null})
          `;
        }
        toplamEklenen += sorular.length;
        islenenler.push({ ders: k.ders, sinif: k.sinif, unite: k.unite, eklenen: sorular.length });
      } catch (e) {
        console.error(`Kombinasyon islenemedi (${k.ders}/${k.sinif}/${k.unite}):`, e.message);
      }
    }

    return Response.json({ ok: true, toplamEklenen, islenenler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
