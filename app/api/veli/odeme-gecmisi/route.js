import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function GET(req) {
  try {
    const veliId = oturumdanKullaniciId(req);
    if (!veliId) return Response.json({ odemeler: [] });

    const odemeler = await sql`
      SELECT o.id, o.tutar, o.para_birimi, o.plan, o.durum, o.yontem, o.olusturulma,
             k.ad AS ogrenci_ad,
             i.id AS iade_id, i.durum AS iade_durumu
      FROM odemeler o
      JOIN kullanicilar k ON k.id = o.kullanici_id
      LEFT JOIN iade_talepleri i ON i.odeme_id = o.id
      WHERE o.odeyen_kullanici_id = ${veliId}
      ORDER BY o.olusturulma DESC
      LIMIT 50
    `;

    const zenginlestirilmis = odemeler.map((o) => {
      const gecenGun = (Date.now() - new Date(o.olusturulma).getTime()) / 86400000;
      return {
        ...o,
        iadeHakkiVar: o.durum === "basarili" && !o.iade_id && gecenGun <= 7,
      };
    });

    return Response.json({ odemeler: zenginlestirilmis });
  } catch (e) {
    console.error(e);
    return Response.json({ odemeler: [] });
  }
}
