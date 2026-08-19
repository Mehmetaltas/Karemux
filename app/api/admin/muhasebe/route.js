import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "muhasebe_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Çok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "muhasebe_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "muhasebe_paneli", true);
  return { izinVar: true };
}

// GET: Gelir-Gider-Kar ozeti (bu ay ve genel toplam)
export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const buAyGelir = await sql`
      SELECT COALESCE(SUM(net_gelir_tl),0)::numeric as toplam, COUNT(*)::int as adet
      FROM satislar WHERE olusturulma >= date_trunc('month', CURRENT_DATE)
    `;
    const genelGelir = await sql`SELECT COALESCE(SUM(net_gelir_tl),0)::numeric as toplam, COUNT(*)::int as adet FROM satislar`;

    const buAyGider = await sql`
      SELECT COALESCE(SUM(tutar_tl),0)::numeric as toplam
      FROM giderler WHERE tarih >= date_trunc('month', CURRENT_DATE)
    `;
    const genelGider = await sql`SELECT COALESCE(SUM(tutar_tl),0)::numeric as toplam FROM giderler`;

    // Tahmini AI maliyeti - gercek fatura degil, istek hacminden kaba bir tahmin
    // (ortalama istek basi ~0.01 TL varsayimiyla; gercek $ maliyeti icin AI
    // saglayicilarinin kendi konsoluna bakilmali - bu sadece goz atma amacli).
    const buAyIstekSayisi = await sql`
      SELECT COALESCE(SUM(ai_istek_sayisi),0)::int as toplam FROM gunluk_kullanim
      WHERE tarih >= date_trunc('month', CURRENT_DATE)
    `;
    const tahminiAiMaliyetTl = Number(buAyIstekSayisi[0].toplam) * 0.01;

    const giderKategoriler = await sql`
      SELECT kategori, SUM(tutar_tl)::numeric as toplam FROM giderler
      WHERE tarih >= date_trunc('month', CURRENT_DATE)
      GROUP BY kategori ORDER BY toplam DESC
    `;

    const paketBazindaSatis = await sql`
      SELECT p.ad, COUNT(s.id)::int as adet, COALESCE(SUM(s.net_gelir_tl),0)::numeric as toplam
      FROM paketler p LEFT JOIN satislar s ON s.paket_id = p.id AND s.olusturulma >= date_trunc('month', CURRENT_DATE)
      GROUP BY p.ad ORDER BY toplam DESC
    `;

    const paketler = await sql`SELECT id, anahtar, ad, fiyat_tl, sure_gun, kredi_miktari, aktif FROM paketler ORDER BY fiyat_tl DESC`;
    const sonGiderler = await sql`SELECT id, kategori, tutar_tl, aciklama, tarih FROM giderler ORDER BY tarih DESC LIMIT 15`;

    return Response.json({
      buAy: {
        gelir: Number(buAyGelir[0].toplam), satisAdedi: buAyGelir[0].adet,
        gider: Number(buAyGider[0].toplam),
        kar: Number(buAyGelir[0].toplam) - Number(buAyGider[0].toplam),
        tahminiAiMaliyetTl: Math.round(tahminiAiMaliyetTl * 100) / 100,
      },
      genel: {
        gelir: Number(genelGelir[0].toplam), satisAdedi: genelGelir[0].adet,
        gider: Number(genelGider[0].toplam),
        kar: Number(genelGelir[0].toplam) - Number(genelGider[0].toplam),
      },
      giderKategoriler,
      paketBazindaSatis,
      paketler,
      sonGiderler,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// PATCH: Paket fiyatini guncelleme (yonetici kendi fiyatlarini belirleyebilsin diye)
export async function PATCH(req) {
  try {
    const { sifre, paketId, yeniFiyat } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    if (!paketId || yeniFiyat == null || yeniFiyat < 0) {
      return Response.json({ error: "Gecerli bir paket ID ve fiyat gerekli" }, { status: 400 });
    }
    await sql`UPDATE paketler SET fiyat_tl = ${yeniFiyat} WHERE id = ${paketId}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// POST: Manuel gider ekleme (muhasebe, bagkur, vergi vb.)
export async function POST(req) {
  try {
    const { sifre, kategori, tutarTl, aciklama, tarih, tekrarlayan, hesapId } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    if (!kategori || !tutarTl) return Response.json({ error: "Kategori ve tutar gerekli" }, { status: 400 });

    const gunTarihi = tarih || new Date().toISOString().slice(0, 10);
    await sql`
      INSERT INTO giderler (kategori, tutar_tl, aciklama, tarih, tekrarlayan)
      VALUES (${kategori}, ${tutarTl}, ${aciklama || null}, ${gunTarihi}, ${tekrarlayan || false})
    `;

    // Hangi hesaptan odendigi secildiyse, kasaya otomatik cikis yazilir.
    let kasaHareketiOlusturuldu = false;
    if (hesapId) {
      await sql`
        INSERT INTO kasa_hareketleri (hesap_id, tur, tutar_tl, aciklama, tarih)
        VALUES (${hesapId}, 'cikis', ${tutarTl}, ${`Gider: ${kategori}${aciklama ? ` - ${aciklama}` : ""}`}, ${gunTarihi})
      `;
      kasaHareketiOlusturuldu = true;
    }

    return Response.json({ ok: true, kasaHareketiOlusturuldu });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
