import { sql } from "@/lib/db";

// Icerik Onbellegi (4 Eylul) - AI'ya ayni sinif/ders/unite/konu/zorluk/tur
// kombinasyonu icin tekrar tekrar sordurmak yerine, bir kere uretilen kaliteli
// sonucu saklayip tekrar kullanmak icin. Maliyet dusurme amacli, ogrenciye
// ozel veri icermiyor (herkes icin ayni icerik, konu bazli).
//
// GET: cache'te var mi kontrol eder, varsa kullanim_sayisi/son_kullanim gunceller.
// POST: 20 Ekim'de KAPATILDI (asagidaki Faz E notuna bak).
//
// icerik_json (14 Eylul): duz metnin (icerik) YANINDA, ilgili konunun ek
// yapisal verisini (ornegin tek-konu-motoru'nda uretilen soru seti) tek
// pakette saklamak icin. Opsiyonel - eski satirlarda NULL olabilir.

// Faz E kilitleme (20 Ekim): onbellek artik YALNIZCA duz metin anlatimlari okur.
// - GET sadece asagidaki turleri doner ve icerik_json'u (cevap anahtarli soru setleri) ASLA dondurmez.
// - POST kapatildi: herkese acik yazim, herhangi bir konu icin ogrencilere gosterilecek icerigi (ya da
//   cevap anahtarli soru setini) ilk yazan kisinin belirlemesine izin veriyordu. Onbellegi yalnizca sunucu doldurur.
const OKUNABILIR_TURLER = ["konu_anlatimi", "tek_konu_anlatimi"];

export async function GET(req) {
  try {
    const u = new URL(req.url);
    const sinif = u.searchParams.get("sinif");
    const ders = u.searchParams.get("ders");
    const unite = u.searchParams.get("unite") || "";
    const konu = u.searchParams.get("konu");
    const zorlukSeviyesi = u.searchParams.get("zorlukSeviyesi") || "";
    const icerikTuru = u.searchParams.get("icerikTuru");

    if (!sinif || !ders || !konu || !icerikTuru) {
      return Response.json({ error: "sinif, ders, konu, icerikTuru zorunlu" }, { status: 400 });
    }
    if (!OKUNABILIR_TURLER.includes(icerikTuru)) return Response.json({ bulundu: false });

    const sonuc = await sql`
      SELECT id, icerik FROM icerik_onbellek
      WHERE sinif = ${Number(sinif)} AND ders = ${ders} AND unite = ${unite}
        AND konu = ${konu} AND zorluk_seviyesi = ${zorlukSeviyesi} AND icerik_turu = ${icerikTuru}
      LIMIT 1
    `;

    if (sonuc.length === 0) {
      return Response.json({ bulundu: false });
    }

    await sql`
      UPDATE icerik_onbellek
      SET kullanim_sayisi = kullanim_sayisi + 1, son_kullanim = now()
      WHERE id = ${sonuc[0].id}
    `;

    return Response.json({ bulundu: true, icerik: sonuc[0].icerik });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST() {
  return Response.json({ error: "Onbellege yazim sunucuda yapilir; bu uc nokta kapatildi" }, { status: 410 });
}
