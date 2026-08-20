import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "maliyet_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "maliyet_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "maliyet_paneli", true);
  return { izinVar: true };
}

// Uretim/altyapi maliyeti kategorileri - genel giderlerden (vergi, bagkur, muhasebe vb.)
// AYRI olarak izlenir. Kisi basi maliyet, bu ayin toplam istek hacmine gore
// TAHMINI olarak hesaplanir - gercek $ fatura icin AI saglayicilarinin konsoluna bakilmali.
const URETIM_KATEGORILERI = ["ai_maliyeti", "sunucu", "hosting", "domain"];

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const uretimGiderleri = await sql`
      SELECT kategori, SUM(tutar_tl)::numeric AS toplam
      FROM giderler
      WHERE tarih >= date_trunc('month', CURRENT_DATE) AND kategori = ANY(${URETIM_KATEGORILERI})
      GROUP BY kategori ORDER BY toplam DESC
    `;
    const uretimToplam = uretimGiderleri.reduce((t, g) => t + Number(g.toplam), 0);

    const aiIstekOzet = await sql`
      SELECT COALESCE(SUM(ai_istek_sayisi), 0)::int AS toplamIstek, COUNT(DISTINCT kullanici_id)::int AS aktifKullanici
      FROM gunluk_kullanim WHERE tarih >= date_trunc('month', CURRENT_DATE)
    `;
    const toplamIstek = aiIstekOzet[0].toplamistek;
    const aktifKullanici = aiIstekOzet[0].aktifkullanici;
    const tahminiAiMaliyetTl = Math.round(toplamIstek * 0.01 * 100) / 100;

    const kisiBasiOrtalamaMaliyet = aktifKullanici > 0
      ? Math.round(((uretimToplam + tahminiAiMaliyetTl) / aktifKullanici) * 100) / 100
      : 0;

    // Kullaniciya gore grupla (k.id), isme gore DEGIL - birden fazla
    // kullanici ayni ada ("Anonim" vb.) sahip olabilir, isme gore gruplamak
    // onlari yanlislikla tek satirda birlestirir.
    const enCokKullananlar = await sql`
      SELECT g.kullanici_id, k.ad, SUM(g.ai_istek_sayisi)::int AS istekSayisi
      FROM gunluk_kullanim g
      JOIN kullanicilar k ON k.id = g.kullanici_id
      WHERE g.tarih >= date_trunc('month', CURRENT_DATE)
      GROUP BY g.kullanici_id, k.ad ORDER BY istekSayisi DESC LIMIT 10
    `;

    // Paket bazinda gercek maliyet: her aktif abonelikteki kullanicinin, bu
    // ayki AI istek hacminden gelen tahmini maliyeti, paketine gore toplanir.
    // Bu, "hangi paket bize ne kadara mal oluyor" sorusuna GERCEK veriyle cevap verir.
    const paketBazindaMaliyet = await sql`
      SELECT p.anahtar, p.ad, p.fiyat_tl, COUNT(DISTINCT a.kullanici_id)::int AS aktifAbone,
        COALESCE(SUM(g.ai_istek_sayisi), 0)::int AS toplamIstek
      FROM paketler p
      LEFT JOIN abonelikler a ON a.plan = p.anahtar AND a.durum = 'aktif'
      LEFT JOIN gunluk_kullanim g ON g.kullanici_id = a.kullanici_id AND g.tarih >= date_trunc('month', CURRENT_DATE)
      WHERE p.aktif = true
      GROUP BY p.anahtar, p.ad, p.fiyat_tl
      ORDER BY toplamIstek DESC
    `;

    return Response.json({
      uretimGiderleri,
      uretimToplam,
      tahminiAiMaliyetTl,
      toplamIstek,
      aktifKullanici,
      kisiBasiOrtalamaMaliyet,
      enCokKullananlar: enCokKullananlar.map((k) => ({ id: k.kullanici_id, ad: k.ad, istekSayisi: k.isteksayisi, tahminiMaliyetTl: Math.round(k.isteksayisi * 0.01 * 100) / 100 })),
      paketBazindaMaliyet: paketBazindaMaliyet.map((p) => ({
        anahtar: p.anahtar, ad: p.ad, fiyatTl: Number(p.fiyat_tl), aktifAbone: p.aktifabone, toplamIstek: p.toplamistek,
        tahminiAiMaliyetTl: Math.round(p.toplamistek * 0.01 * 100) / 100,
      })),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
