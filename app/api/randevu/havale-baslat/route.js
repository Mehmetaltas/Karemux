import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { randevuId, cihazId } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    if (!randevuId) return Response.json({ error: "randevuId gerekli" }, { status: 400 });

    const randevu = await sql`SELECT id, ucret_tl, odendi FROM randevular WHERE id = ${randevuId} AND ogrenci_id = ${kullaniciId} AND durum != 'iptal'`;
    if (randevu.length === 0) return Response.json({ error: "Randevu bulunamadi" }, { status: 404 });
    if (randevu[0].odendi) return Response.json({ error: "Bu randevu zaten odenmis" }, { status: 400 });

    const fiyat = Number(randevu[0].ucret_tl);
    const referans = `KRX-${Date.now().toString(36).toUpperCase()}`;

    await sql`
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, randevu_id, yontem, havale_referans)
      VALUES (${kullaniciId}, ${fiyat.toFixed(2)}, 'TRY', 'beklemede', ${randevuId}, 'havale', ${referans})
    `;

    return Response.json({
      referans,
      tutar: fiyat.toFixed(2),
      iban: process.env.HAVALE_IBAN,
      hesapSahibi: process.env.HAVALE_HESAP_SAHIBI,
      bankaAdi: process.env.HAVALE_BANKA_ADI,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Havale baslatilamadi" }, { status: 500 });
  }
}
