import { sql } from "@/lib/db";

// Icerik Onbellegi (4 Eylul) - AI'ya ayni sinif/ders/unite/konu/zorluk/tur
// kombinasyonu icin tekrar tekrar sordurmak yerine, bir kere uretilen kaliteli
// sonucu saklayip tekrar kullanmak icin. Maliyet dusurme amacli, ogrenciye
// ozel veri icermiyor (herkes icin ayni icerik, konu bazli).
//
// GET: cache'te var mi kontrol eder, varsa kullanim_sayisi/son_kullanim gunceller.
// POST: yeni uretilen icerigi cache'e kaydeder (varsa uzerine yazmaz, atlar).
//
// icerik_json (14 Eylul): duz metnin (icerik) YANINDA, ilgili konunun ek
// yapisal verisini (ornegin tek-konu-motoru'nda uretilen soru seti) tek
// pakette saklamak icin. Opsiyonel - eski satirlarda NULL olabilir.

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

    const sonuc = await sql`
      SELECT id, icerik, icerik_json FROM icerik_onbellek
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

    return Response.json({ bulundu: true, icerik: sonuc[0].icerik, icerikJson: sonuc[0].icerik_json || null });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { sinif, ders, unite, konu, zorlukSeviyesi, icerikTuru, icerik, icerikJson } = body;

    if (!sinif || !ders || !konu || !icerikTuru || !icerik) {
      return Response.json({ error: "sinif, ders, konu, icerikTuru, icerik zorunlu" }, { status: 400 });
    }

    const mevcut = await sql`
      SELECT id FROM icerik_onbellek
      WHERE sinif = ${Number(sinif)} AND ders = ${ders} AND unite = ${unite || ""}
        AND konu = ${konu} AND zorluk_seviyesi = ${zorlukSeviyesi || ""} AND icerik_turu = ${icerikTuru}
      LIMIT 1
    `;
    if (mevcut.length > 0) {
      return Response.json({ kaydedildi: false, not: "zaten mevcut" });
    }

    await sql`
      INSERT INTO icerik_onbellek (sinif, ders, unite, konu, zorluk_seviyesi, icerik_turu, icerik, icerik_json, kullanim_sayisi, olusturulma, son_kullanim)
      VALUES (${Number(sinif)}, ${ders}, ${unite || ""}, ${konu}, ${zorlukSeviyesi || ""}, ${icerikTuru}, ${icerik}, ${icerikJson ? JSON.stringify(icerikJson) : null}, 1, now(), now())
    `;

    return Response.json({ kaydedildi: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}
