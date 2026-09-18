import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, kademeId, onaySinaviId, cevaplar } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });
    if (!kademeId) return Response.json({ error: "kademeId gerekli" }, { status: 400 });

    const satir = await sql`SELECT kademe FROM seviye_tespit_kademe WHERE id = ${kademeId} AND kullanici_id = ${kullaniciId}`;
    if (satir.length === 0) return Response.json({ error: "Bulunamadi" }, { status: 404 });
    const mevcutKademe = satir[0].kademe;

    // Kademe 1->2 ve 2->3 "Okudum/Pratik Yaptim" - bilincli olarak hafif,
    // kendi-kendine-bildirim (dusuk riskli ara adimlar).
    // Kademe 3 (ONAY testi) - artik SUNUCUDA dogrulaniyor (18 Eylul, gercek
    // acik kapatildi): istemciden gelen bir "basariliMi" degeri ARTIK HIC
    // KABUL EDILMIYOR/GUVENILMIYOR - dogru cevaplar sadece seviye_onay_sinavlari
    // tablosunda, sunucu kendisi hesaplar.
    let basariliMi = true;
    if (mevcutKademe === 3) {
      if (!onaySinaviId || !Array.isArray(cevaplar)) {
        return Response.json({ error: "Onay sinavi cevaplari gerekli" }, { status: 400 });
      }
      const sinavSatir = await sql`SELECT sorular FROM seviye_onay_sinavlari WHERE id = ${onaySinaviId} AND kademe_id = ${kademeId}`;
      if (sinavSatir.length === 0) return Response.json({ error: "Onay sinavi bulunamadi" }, { status: 404 });
      const sorular = sinavSatir[0].sorular;
      const dogruSayisi = sorular.filter((s, i) => cevaplar[i] === s.dogruIndex).length;
      basariliMi = dogruSayisi >= 2;
    }

    if (mevcutKademe === 3 && basariliMi === false) {
      return Response.json({ ok: true, yeniKademe: 3, tamamlandi: false, tekrarGerekli: true });
    }
    if (mevcutKademe >= 3) {
      await sql`UPDATE seviye_tespit_kademe SET tamamlandi = true WHERE id = ${kademeId}`;
      return Response.json({ ok: true, tamamlandi: true });
    }
    const yeniKademe = mevcutKademe + 1;
    await sql`UPDATE seviye_tespit_kademe SET kademe = ${yeniKademe} WHERE id = ${kademeId}`;
    return Response.json({ ok: true, yeniKademe, tamamlandi: false });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
