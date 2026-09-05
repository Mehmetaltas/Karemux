import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ogrencinin TUM odeme gecmisi - Ilk Hafta Garantisi'ne uygun olanlar
// icin iade talebi acma imkani ile birlikte (4 Eylul, once bu ekran
// hic yoktu - iade-talebi API'si var ama tetiklenemiyordu).
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ odemeler: [] });

    const odemeler = await sql`
      SELECT o.id, o.tutar, o.para_birimi, o.plan, o.durum, o.yontem, o.olusturulma,
             i.id AS iade_id, i.durum AS iade_durumu
      FROM odemeler o
      LEFT JOIN iade_talepleri i ON i.odeme_id = o.id
      WHERE o.kullanici_id = ${kullaniciId} AND o.odeyen_kullanici_id IS NULL
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
