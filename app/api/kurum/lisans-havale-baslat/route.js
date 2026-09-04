import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { plan, koltukSayisi } = await req.json();
    if (!Number.isInteger(koltukSayisi) || koltukSayisi < 1) {
      return Response.json({ error: "Gecerli bir koltuk sayisi girilmeli (en az 1)" }, { status: 400 });
    }

    const paketSonuc = await sql`SELECT anahtar, ad, fiyat_tl FROM paketler WHERE anahtar = ${plan} AND aktif = true AND anahtar LIKE 'yillik_%'`;
    if (paketSonuc.length === 0) return Response.json({ error: "Gecersiz veya lisanslanamayan paket" }, { status: 400 });
    const paket = paketSonuc[0];

    const kurumSonuc = await sql`SELECT vergi_no, vergi_dairesi FROM kurumlar WHERE id = ${yonetici.kurumId}`;
    const kurum = kurumSonuc[0];
    if (!kurum.vergi_no || !kurum.vergi_dairesi) {
      return Response.json({ error: "Fatura kesebilmemiz icin once kurum profilinden vergi bilgilerini tamamlamalisin" }, { status: 400 });
    }

    const toplamFiyat = (Number(paket.fiyat_tl) * koltukSayisi).toFixed(2);

    const lisansSonuc = await sql`
      INSERT INTO kurum_lisans_satin_alma (kurum_id, plan, koltuk_sayisi, tutar_tl, odendi)
      VALUES (${yonetici.kurumId}, ${plan}, ${koltukSayisi}, ${toplamFiyat}, false)
      RETURNING id
    `;
    const lisansId = lisansSonuc[0].id;

    const referans = `KRX-${Date.now().toString(36).toUpperCase()}`;

    await sql`
      INSERT INTO odemeler (kullanici_id, tutar, para_birimi, durum, kurum_id, kurum_lisans_id, yontem, havale_referans)
      VALUES (${yonetici.kullaniciId}, ${toplamFiyat}, 'TRY', 'beklemede', ${yonetici.kurumId}, ${lisansId}, 'havale', ${referans})
    `;

    return Response.json({
      referans,
      tutar: toplamFiyat,
      iban: process.env.HAVALE_IBAN,
      hesapSahibi: process.env.HAVALE_HESAP_SAHIBI,
      bankaAdi: process.env.HAVALE_BANKA_ADI,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Havale baslatilamadi" }, { status: 500 });
  }
}
