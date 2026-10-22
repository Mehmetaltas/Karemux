import { createHash } from "crypto";
import { sql } from "@/lib/db";
import { yoneticiUyar } from "@/lib/uyari";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 22 Ekim (Madde 26): MEB resmi kaynaklarinda degisiklik takibi. Her pazartesi asagidaki sayfalarin METIN ozetini (hash)
// onceki haftayla karsilastirir; degisen sayfa varsa yoneticiye Telegram uyarisi gider ve meb_sayfa_takip tablosuna islenir.
// Ilk calistirma yalniz taban cizgisini kaydeder. MEB sayfalari zaman zaman sunucu hatasi verir: tek hata uyari sayilmaz,
// ayni sayfa ust uste 3 kez okunamazsa uyarilir.
const SAYFALAR = [
  ...["5", "6", "7", "8"].flatMap((s) => [
    ["Fen Bilimleri " + s, `https://tymm.meb.gov.tr/ogretim-programlari/fen-bilimleri-dersi/${s}`],
    ["Din Kültürü " + s, `https://tymm.meb.gov.tr/ogretim-programlari/din-kulturu-ve-ahlak-bilgisi-dersi/${s}`],
  ]),
  ["DKAB çerçeve yıllık planlar", "https://dogm.meb.gov.tr/www/cerceve-yillik-planlar/icerik/2257"],
];

function metinOzeti(html) {
  const metin = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|\s+/g, " ")
    .trim();
  return { hash: createHash("sha256").update(metin).digest("hex"), uzunluk: metin.length };
}

export async function GET(req) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS meb_sayfa_takip (
        url TEXT PRIMARY KEY, ad TEXT, hash TEXT, uzunluk INTEGER,
        son_kontrol TIMESTAMP, son_degisim TIMESTAMP, ust_uste_hata INTEGER NOT NULL DEFAULT 0
      )
    `;
    const sonuc = { degisen: [], okunamayan: [], yeni: [], ayni: 0 };
    for (const [ad, url] of SAYFALAR) {
      let ozet = null;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "KaremuxMufredatTakip/1.0" } });
        if (res.ok) ozet = metinOzeti(await res.text());
      } catch (e) { /* asagida hata sayilir */ }

      const onceki = await sql`SELECT hash, ust_uste_hata FROM meb_sayfa_takip WHERE url = ${url}`;
      if (!ozet || ozet.uzunluk < 200) {
        const hata = (onceki[0]?.ust_uste_hata || 0) + 1;
        await sql`
          INSERT INTO meb_sayfa_takip (url, ad, son_kontrol, ust_uste_hata) VALUES (${url}, ${ad}, now(), ${hata})
          ON CONFLICT (url) DO UPDATE SET son_kontrol = now(), ust_uste_hata = ${hata}
        `;
        if (hata >= 3) sonuc.okunamayan.push(ad);
        continue;
      }
      if (!onceki[0] || !onceki[0].hash) {
        await sql`
          INSERT INTO meb_sayfa_takip (url, ad, hash, uzunluk, son_kontrol, ust_uste_hata) VALUES (${url}, ${ad}, ${ozet.hash}, ${ozet.uzunluk}, now(), 0)
          ON CONFLICT (url) DO UPDATE SET hash = ${ozet.hash}, uzunluk = ${ozet.uzunluk}, son_kontrol = now(), ust_uste_hata = 0
        `;
        sonuc.yeni.push(ad);
      } else if (onceki[0].hash !== ozet.hash) {
        await sql`UPDATE meb_sayfa_takip SET hash = ${ozet.hash}, uzunluk = ${ozet.uzunluk}, son_kontrol = now(), son_degisim = now(), ust_uste_hata = 0 WHERE url = ${url}`;
        sonuc.degisen.push(ad);
      } else {
        await sql`UPDATE meb_sayfa_takip SET son_kontrol = now(), ust_uste_hata = 0 WHERE url = ${url}`;
        sonuc.ayni++;
      }
    }
    if (sonuc.degisen.length > 0) {
      await yoneticiUyar(`meb-degisim-${new Date().toISOString().slice(0, 10)}`, `📘 KAREMUX: MEB kaynaklarında değişiklik algılandı: ${sonuc.degisen.join(", ")}. Müfredat verisini kontrol et.`, 24);
    }
    if (sonuc.okunamayan.length > 0) {
      await yoneticiUyar("meb-okunamayan", `⚠️ KAREMUX: MEB sayfaları üst üste 3 haftadır okunamıyor: ${sonuc.okunamayan.join(", ")}.`, 24 * 7);
    }
    return Response.json({ ok: true, ...sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cron gorevi basarisiz" }, { status: 500 });
  }
}
