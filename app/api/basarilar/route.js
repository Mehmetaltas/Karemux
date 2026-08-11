import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Rozet/seviye hesaplamasi icin gereken ham istatistikleri toplar. Kademe/rozet
// KARARI (hangi rozet kazanildi, hangi seviyede) istemci tarafinda (page.js)
// yapilir - cunku unite sayilari (MUFREDAT) orada tanimli. Bu route sadece
// "kac unite tamamlandi (ders bazinda)", "kac sinav cozuldu", "kac soru
// cozuldu", "en yuksek net" gibi ham sayilari dondurur.
export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const cihazId = params.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) {
      return Response.json({ dersBazinda: {}, toplamSoru: 0, tamamlananSinavSayisi: 0, enYuksekYuzde: 0, ilkSoruTarihi: null });
    }

    // Ders basina tamamlanan (basari orani >= %70 kabul edilen) benzersiz konu/unite sayisi.
    const ilerlemeSatirlari = await sql`
      SELECT ders, konu, dogru_sayisi, toplam_soru FROM ilerleme WHERE kullanici_id = ${kullaniciId}
    `;
    const dersBazinda = {};
    const konuBazindaEnIyi = {}; // "ders::konu" -> en iyi basari orani (tekrar denemeler icin)
    let toplamSoruSayisi = 0;
    ilerlemeSatirlari.forEach((r) => {
      const anahtar = `${r.ders}::${r.konu}`;
      const oran = r.toplam_soru > 0 ? r.dogru_sayisi / r.toplam_soru : 0;
      if (!(anahtar in konuBazindaEnIyi) || oran > konuBazindaEnIyi[anahtar]) konuBazindaEnIyi[anahtar] = oran;
      toplamSoruSayisi += r.toplam_soru || 0;
    });
    Object.keys(konuBazindaEnIyi).forEach((anahtar) => {
      const [ders] = anahtar.split("::");
      if (konuBazindaEnIyi[anahtar] >= 0.7) {
        dersBazinda[ders] = (dersBazinda[ders] || 0) + 1;
      }
    });

    // Sinav sonuclari - toplam sinav sayisi, en yuksek yuzde (mukemmel skor rozeti icin), turlere gore sayim.
    const sinavSatirlari = await sql`
      SELECT tur, dogru, yanlis, bos, net FROM sinav_sonuclari WHERE kullanici_id = ${kullaniciId}
    `;
    let enYuksekYuzde = 0;
    const turSayaci = {};
    sinavSatirlari.forEach((r) => {
      const toplamSoru = r.dogru + r.yanlis + r.bos;
      if (toplamSoru > 0) {
        const yuzde = r.dogru / toplamSoru;
        if (yuzde > enYuksekYuzde) enYuksekYuzde = yuzde;
      }
      turSayaci[r.tur] = (turSayaci[r.tur] || 0) + 1;
    });

    const ilkKayit = await sql`
      SELECT MIN(olusturulma) as ilk FROM ilerleme WHERE kullanici_id = ${kullaniciId}
    `;

    return Response.json({
      dersBazinda,
      toplamSoru: toplamSoruSayisi,
      tamamlananSinavSayisi: sinavSatirlari.length,
      turSayaci,
      enYuksekYuzde,
      ilkSoruTarihi: ilkKayit[0]?.ilk || null,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ dersBazinda: {}, toplamSoru: 0, tamamlananSinavSayisi: 0, enYuksekYuzde: 0, ilkSoruTarihi: null });
  }
}
