import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { aiCagir } from "@/lib/ai";
import { jsonAyikla } from "@/lib/json-ayikla";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { soruFormatGecerliMi } from "@/lib/soruFormatDogrula";
import { sorulariDenetle } from "@/lib/soruKalite";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

// Belirli bir kademe (zayif unite) icin 3 soruluk bir ONAY sinavi uretir.
// Dogru cevaplar (dogruIndex) SUNUCUDA (yeni seviye_onay_sinavlari tablosunda)
// kalir, istemciye HIC gonderilmez - "Okudum, Devam Et" gibi kendi-kendine-
// bildirim acigini kapatmak icin (18 Eylul, kullanici talebiyle kuruldu).
//
// KOPRU (18 Eylul, kullanici talebiyle): Once ONCEDEN URETILMIS, kalite
// motorundan gecmis icerigi (icerik_onbellek/konu_paketi) dener - o unitenin
// konularina ait soruHavuzu'ndan sorular seçilir. Cache bossa (henuz kimse o
// uniteyi istemedi) SADECE O ZAMAN yeni, sifirdan soru uretilir (fallback).
// Bu, gelecekteki toplu arsiv dolunca OTOMATIK olarak onay testlerinin
// tamamen kalite-motorundan gecmis sorulardan olusmasini saglayacak altyapi.
export async function POST(req) {
  try {
    const { cihazId, kademeId } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });
    if (!kademeId) return Response.json({ error: "kademeId gerekli" }, { status: 400 });

    const satir = await sql`SELECT ders, unite, kaynak_sinif FROM seviye_tespit_kademe WHERE id = ${kademeId} AND kullanici_id = ${kullaniciId}`;
    if (satir.length === 0) return Response.json({ error: "Bulunamadı" }, { status: 404 });
    const { ders, unite, kaynak_sinif } = satir[0];

    // 1. Onceden uretilmis, kalite-motorundan gecmis icerigi dene
    let sorular = [];
    try {
      const cacheKayitlari = await sql`
        SELECT icerik_json FROM icerik_onbellek
        WHERE sinif = ${kaynak_sinif} AND ders = ${ders} AND unite = ${unite} AND icerik_turu = 'konu_paketi' AND onay_durumu = 'onaylandi'
      `;
      const havuz = [];
      for (const k of cacheKayitlari) {
        const soruHavuzu = k.icerik_json?.soruHavuzu || [];
        for (const s of soruHavuzu) {
          if (soruFormatGecerliMi(s, { soruTrimGerekli: true, dersUniteGerekli: false })) {
            havuz.push({ soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogruIndex });
          }
        }
      }
      if (havuz.length >= 3) {
        sorular = [...havuz].sort(() => Math.random() - 0.5).slice(0, 3);
      }
    } catch (e) {
      console.error("onay-sinavi cache okuma hatasi (fallback'e geciliyor):", e.message);
    }

    // 2. Cache'te yeterli soru yoksa, YENI uret (fallback)
    if (sorular.length === 0) {
      // Gunluk AI limiti SADECE gercekten AI cagrisi yapilacaksa tuketilir
      // (cache yolu AI maliyeti dogurmaz, ogrencinin hakkini yemez).
      const limit = await gunlukLimitKontrolEt(req, cihazId);
      if (!limit.izinVar) {
        return Response.json(
          { error: limit.premium ? "Bugunluk yogun kullanim sinirina ulastin (" + limit.limit + "/gun), yarin devam edebilirsin." : "Gunluk ucretsiz kullanim hakkin doldu (" + limit.limit + "/gun). Premium ile daha fazla kullanabilirsin." },
          { status: 429 }
        );
      }

      const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";
      const p = `Sen bir ilkokul/ortaokul ogretmenisin. "${ders}" dersinin "${unite}" unitesi (${kaynak_sinif}. sinif) icin, ogrencinin bu uniteyi GERCEKTEN ogrenip ogrenmedigini olcen 5 SORULUK bir ONAY sinavi havuzu hazirla. ${kaliteReferansi ? `Kalite referansi: ${kaliteReferansi}` : ""} Sorular orta zorlukta olsun, temel kavramlari olcsun. SADECE JSON dondur (obje icinde dizi), tam 5 eleman:
{"sorular":[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]}`;

      const cevap = await aiCagir({ prompt: p, maxTokens: 1500, jsonModu: true });
      let sorularHam;
      try {
        sorularHam = jsonAyikla(cevap).sorular;
      } catch (e) {
        console.error("onay-sinavi jsonAyikla basarisiz:", e.message);
        sorularHam = null;
      }

      const formatGecen = (Array.isArray(sorularHam) ? sorularHam : []).filter((s) =>
        soruFormatGecerliMi(s, { soruTrimGerekli: true, dersUniteGerekli: false })
      );
      const denetimBaglami = "Bu sorular \"" + ders + "\" dersi \"" + unite
        + "\" unitesi icin ogrenciye dogrudan gosterilecek bir onay sinavinda"
        + " kullanilacak, cok yuksek dogruluk gerekiyor.";
      const denetim = await sorulariDenetle(formatGecen, denetimBaglami);
      sorular = denetim.gecenler.slice(0, 3);
    }

    if (sorular.length === 0) throw new Error("Sorular uretilemedi, tekrar dene");

    const kayit = await sql`INSERT INTO seviye_onay_sinavlari (kademe_id, sorular) VALUES (${kademeId}, ${JSON.stringify(sorular)}) RETURNING id`;

    const guvenliSorular = sorular.map((s) => ({ soru: s.soru, secenekler: s.secenekler }));
    return Response.json({ onaySinaviId: kayit[0].id, sorular: guvenliSorular });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
