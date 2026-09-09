import { sql } from "@/lib/db";

// Company Twin gercek veri envanteri (8 Eylul) - genel AI sohbet/istek
// kullaniminin (gunluk_kullanim tablosu, TUM AI cagrilarini kapsar - konu
// anlatimi, soru coz, vb.) maliyetini her gun otomatik giderler'e yazar.
// Ayni birim maliyet tahmini (0.01 TL/istek) app/api/admin/maliyet/route.js'te
// ekranda zaten gosteriliyordu, sadece kaydedilmiyordu - artik kaydediliyor,
// boylece Company Twin GERCEK, surekli guncellenen bir giderler verisine
// sahip oluyor (once 0 satirdi). Paket-deneme-otomatik cron'unun kendi ayri
// (deneme uretimine ozel, token-bazli) ai_maliyeti kaydiyla CAKISMAZ - bu,
// GENEL gunluk AI kullanimini kapsar, farkli bir aciklama etiketiyle.
const BIRIM_MALIYET_TL_ISTEK = 0.01;

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const dun = new Date();
    dun.setUTCDate(dun.getUTCDate() - 1);
    const dunTarih = dun.toISOString().slice(0, 10);

    // Idempotent: dun icin zaten kayit yazilmissa tekrar yazma.
    const mevcut = await sql`
      SELECT id FROM giderler WHERE kategori = 'ai_maliyeti' AND tarih = ${dunTarih} AND aciklama LIKE 'Gunluk genel AI kullanimi%'
      LIMIT 1
    `;
    if (mevcut.length > 0) {
      return Response.json({ ok: true, atlandi: true, not: "Dun icin zaten kayitli" });
    }

    const ozet = await sql`
      SELECT COALESCE(SUM(ai_istek_sayisi), 0)::int AS toplamIstek
      FROM gunluk_kullanim WHERE tarih = ${dunTarih}
    `;
    const toplamIstek = ozet[0].toplamistek;
    if (toplamIstek === 0) {
      return Response.json({ ok: true, atlandi: true, not: "Dun hic AI istegi yok" });
    }

    const maliyetTl = Math.round(toplamIstek * BIRIM_MALIYET_TL_ISTEK * 100) / 100;

    await sql`
      INSERT INTO giderler (kategori, tutar_tl, aciklama, tekrarlayan, tarih)
      VALUES ('ai_maliyeti', ${maliyetTl}, ${`Gunluk genel AI kullanimi tahmini - ${dunTarih} (${toplamIstek} istek, ${BIRIM_MALIYET_TL_ISTEK} TL/istek basitlestirilmis tahmin - gercek $ fatura icin saglayici konsoluna bakilmali)`}, false, ${dunTarih})
    `;

    return Response.json({ ok: true, tarih: dunTarih, toplamIstek, maliyetTl });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi: " + e.message }, { status: 500 });
  }
}
