import { sql } from "@/lib/db";

// Kurum kodunu bilen herkes (kurum yoneticisi) bu kurumdaki TUM ogrencilerin
// TOPLU/anonim istatistiklerini gorebilir - tek tek ogrenci adi/kimligi degil,
// sadece agregatif sayilar (kac ogrenci, ders bazinda ortalama net, en zayif
// konular). Bu, veli baglanti kodu ile ayni "kod = erisim anahtari" mantigidir.
export async function GET(req) {
  try {
    const kurumKodu = new URL(req.url).searchParams.get("kod");
    if (!kurumKodu) return Response.json({ error: "Kurum kodu gerekli" }, { status: 400 });

    const kurum = await sql`SELECT id, ad FROM kurumlar WHERE kurum_kodu = ${kurumKodu.trim().toUpperCase()}`;
    if (kurum.length === 0) return Response.json({ error: "Bu kodla eslesen bir kurum bulunamadi" }, { status: 404 });
    const kurumId = kurum[0].id;

    const ogrenciSayisi = await sql`SELECT COUNT(*) as sayi FROM kullanicilar WHERE kurum_id = ${kurumId}`;

    const sinifDagilimi = await sql`
      SELECT sinif, COUNT(*) as sayi FROM kullanicilar
      WHERE kurum_id = ${kurumId} AND sinif IS NOT NULL
      GROUP BY sinif ORDER BY sinif
    `;

    const dersBazindaNet = await sql`
      SELECT s.ders, ROUND(AVG(s.net)::numeric, 2) as ortalama_net, COUNT(*) as test_sayisi
      FROM sinav_sonuclari s
      JOIN kullanicilar k ON k.id = s.kullanici_id
      WHERE k.kurum_id = ${kurumId}
      GROUP BY s.ders ORDER BY ortalama_net ASC
    `;

    const zayifKonular = await sql`
      SELECT h.ders, h.alt_konu, COUNT(*) as hata_sayisi
      FROM hata_kitapcigi h
      JOIN kullanicilar k ON k.id = h.kullanici_id
      WHERE k.kurum_id = ${kurumId} AND h.alt_konu IS NOT NULL
      GROUP BY h.ders, h.alt_konu
      ORDER BY hata_sayisi DESC
      LIMIT 10
    `;

    return Response.json({
      kurumAdi: kurum[0].ad,
      ogrenciSayisi: Number(ogrenciSayisi[0].sayi),
      sinifDagilimi,
      dersBazindaNet,
      zayifKonular,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Rapor alinamadi" }, { status: 500 });
  }
}
