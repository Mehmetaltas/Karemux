import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export const dynamic = "force-dynamic";

// 24 Ekim: Telafi zinciri (Sinav Merkezi madde 19) - YENI VERI URETMEZ, AI'ya gitmez.
// Zincir: sinav/pratik yanlislari (hata_kitapcigi) -> zayif konu -> Tek Konu testi (konu_hakimiyet) -> ONCE/SONRA karsilastirma.
// Her zayif konu icin durum: olculmedi | ilk_olcum | iyilesti | degismedi | geriledi.
// Esik: fark >= 1 puan (10 uzerinden) iyilesme, <= -1 gerileme (sezgisel, resmi norm degil).
const ESIK = 1;
const norm = (x) => String(x || "").toLocaleLowerCase("tr-TR").trim();

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ konular: [] });

    const zayif = await sql`
      SELECT ders, alt_konu AS konu, COUNT(*)::int AS cozulmemis
      FROM hata_kitapcigi
      WHERE kullanici_id = ${kullaniciId} AND cozuldu = false AND alt_konu IS NOT NULL AND alt_konu <> ''
      GROUP BY ders, alt_konu ORDER BY cozulmemis DESC LIMIT 10`;
    const hakimiyet = await sql`
      SELECT ders, konu, net::float AS net, hakimiyet_seviyesi AS seviye, olusturulma
      FROM konu_hakimiyet WHERE kullanici_id = ${kullaniciId} ORDER BY id ASC LIMIT 500`;

    const konular = zayif.map((z) => {
      const kayitlar = hakimiyet.filter((h) => norm(h.ders) === norm(z.ders) && norm(h.konu) === norm(z.konu));
      let durum = "olculmedi", ilk = null, son = null, fark = null;
      if (kayitlar.length >= 1) { ilk = kayitlar[0].net; son = kayitlar[kayitlar.length - 1].net; durum = "ilk_olcum"; }
      if (kayitlar.length >= 2) {
        fark = Math.round((son - ilk) * 10) / 10;
        durum = fark >= ESIK ? "iyilesti" : fark <= -ESIK ? "geriledi" : "degismedi";
      }
      return {
        ders: z.ders, konu: z.konu, cozulmemisHata: z.cozulmemis, durum,
        olcumSayisi: kayitlar.length, ilkPuan: ilk, sonPuan: son, fark,
        sonSeviye: kayitlar.length ? kayitlar[kayitlar.length - 1].seviye : null,
        sonrakiAdim: durum === "olculmedi" ? "Bu konuda Tek Konu testi çöz" : durum === "geriledi" || durum === "degismedi" ? "Konu anlatımına dön, Hata Kitapçığındaki soruları tekrar et, sonra testi yinele" : durum === "ilk_olcum" ? "Hata Kitapçığını çalış, sonra testi yinele (karşılaştırma için 2. ölçüm gerekir)" : "Devam: hata kitapçığındaki kalan soruları kapat",
      };
    });
    return Response.json({ konular, esik: ESIK });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Telafi durumu getirilemedi" }, { status: 500 });
  }
}
