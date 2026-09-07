import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";
import { personelAdminMi } from "@/lib/personel";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { sifre } = await req.json();
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const gruplar = await sql`
      SELECT ders, sinif, unite, COUNT(*)::int AS soru_sayisi
      FROM soru_bankasi
      WHERE ders IN ('Ingilizce', 'Sosyal Bilgiler')
      GROUP BY ders, sinif, unite
    `;

    const sonuclar = await Promise.all(gruplar.map(async (g) => {
      try {
        const uretilecek = Math.min(g.soru_sayisi, 15);
        const kaliteMetni = KALITE_REFERANSLARI[g.ders] ? ` Kalite referansi: ${KALITE_REFERANSLARI[g.ders]}` : "";
        const p = `Sen bir LGS/ortaokul ogretmenisin. "${g.ders}" dersinin "${g.unite}" unitesinin TAMAMINI kapsayan, ${g.sinif}. sinif seviyesinde ${uretilecek} coktan secmeli soru hazirla. Gercekci, LGS tarzi, baglam temelli sorular olsun.${kaliteMetni} Her soru icin "aciklama" alaninda dogru cevabin nedenini 1-2 cumleyle acikla. SADECE JSON dondur:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"..."}]`;

        const cevap = await aiCagir({ prompt: p, maxTokens: 3500, jsonModu: true });
        const temiz = cevap.replace(/```json|```/g, "").trim();
        const baslangic = temiz.indexOf("["), bitis = temiz.lastIndexOf("]");
        const sorularHam = JSON.parse(temiz.slice(baslangic, bitis + 1));
        const sorular = (Array.isArray(sorularHam) ? sorularHam : []).filter((s) =>
          s && typeof s.soru === "string" && Array.isArray(s.secenekler) && s.secenekler.length >= 2 &&
          Number.isInteger(s.dogruIndex) && s.dogruIndex >= 0 && s.dogruIndex < s.secenekler.length
        );

        if (sorular.length === 0) return { ders: g.ders, unite: g.unite, hata: "AI gecerli soru uretemedi" };

        await sql`DELETE FROM soru_bankasi WHERE ders = ${g.ders} AND sinif = ${g.sinif} AND unite = ${g.unite}`;
        for (const s of sorular) {
          await sql`
            INSERT INTO soru_bankasi (ders, sinif, unite, soru, secenekler, dogru_index, kaynak_turu, aciklama)
            VALUES (${g.ders}, ${g.sinif}, ${g.unite}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, 'yeniden_uretim_7eylul', ${s.aciklama || null})
          `;
        }
        return { ders: g.ders, unite: g.unite, silinen: g.soru_sayisi, eklenen: sorular.length };
      } catch (e) {
        return { ders: g.ders, unite: g.unite, hata: e.message };
      }
    }));

    return Response.json({ ok: true, sonuclar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
