import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { denemeId } = await req.json();
    const denemeSonuc = await sql`SELECT id, ad, fiyat_tl FROM ucretli_denemeler WHERE id = ${denemeId} AND aktif = true`;
    if (denemeSonuc.length === 0) return Response.json({ error: "Gecersiz deneme" }, { status: 400 });
    const deneme = denemeSonuc[0];

    const zatenVar = await sql`SELECT 1 FROM kurum_deneme_satin_alma WHERE kurum_id = ${yonetici.kurumId} AND deneme_id = ${denemeId} AND odendi = true`;
    if (zatenVar.length > 0) return Response.json({ error: "Bu denemeyi zaten satin aldin" }, { status: 400 });

    const kurumSonuc = await sql`SELECT vergi_no, vergi_dairesi FROM kurumlar WHERE id = ${yonetici.kurumId}`;
    const kurum = kurumSonuc[0];
    if (!kurum.vergi_no || !kurum.vergi_dairesi) {
      return Response.json({ error: "Fatura kesebilmemiz icin once kurum profilinden vergi bilgilerini tamamlamalisin (/api/kurum/profil)" }, { status: 400 });
    }

    const fiyat = Number(deneme.fiyat_tl).toFixed(2);
    const referans = `KRX-${Date.now().toString(36).toUpperCase()}`;

    await sql`
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, kurum_id, ucretli_deneme_id, yontem, havale_referans)
      VALUES (${yonetici.kullaniciId}, ${fiyat}, 'TRY', 'beklemede', ${yonetici.kurumId}, ${denemeId}, 'havale', ${referans})
    `;

    return Response.json({
      referans,
      tutar: fiyat,
      iban: process.env.HAVALE_IBAN,
      hesapSahibi: process.env.HAVALE_HESAP_SAHIBI,
      bankaAdi: process.env.HAVALE_BANKA_ADI,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Havale baslatilamadi" }, { status: 500 });
  }
}
