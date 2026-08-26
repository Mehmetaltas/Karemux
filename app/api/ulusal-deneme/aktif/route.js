import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Su an ACIK olan (acilis <= simdi <= kapanis) en guncel ulusal denemeyi dondurur.
// Kullanici zaten cozmusse sorulari GONDERMEZ (tekrar cozmesini engellemek icin),
// sadece "zaten cozdun" bilgisini dondurur.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    // Yerel (il bazli) denemeler SADECE kullanicinin kendi ilindekilere
    // gosterilir - kapsam='ulusal' her zaman herkese acik. Misafir/il
    // bilinmiyorsa (kullaniciIli NULL) sadece ulusal denemeler gorunur
    // (guvenli varsayilan, 26 Agustos'ta eklendi).
    let kullaniciIli = null;
    if (kullaniciId) {
      const kullanici = await sql`SELECT il FROM kullanicilar WHERE id = ${kullaniciId}`;
      kullaniciIli = kullanici[0]?.il || null;
    }

    const aktif = await sql`
      SELECT id, ad, sinif, ders, sorular, acilis, kapanis FROM ulusal_denemeler
      WHERE acilis <= now() AND kapanis >= now()
        AND (kapsam = 'ulusal' OR il = ${kullaniciIli})
      ORDER BY acilis DESC LIMIT 1
    `;
    if (aktif.length === 0) {
      const gelecek = await sql`
        SELECT ad, sinif, ders, acilis FROM ulusal_denemeler WHERE acilis > now() ORDER BY acilis ASC LIMIT 1
      `;
      return Response.json({ aktifDeneme: null, gelecekDeneme: gelecek[0] || null });
    }

    const deneme = aktif[0];
    let zatenCozmus = false;
    if (kullaniciId) {
      const cozum = await sql`SELECT id FROM ulusal_deneme_sonuclari WHERE ulusal_deneme_id = ${deneme.id} AND kullanici_id = ${kullaniciId}`;
      zatenCozmus = cozum.length > 0;
    }

    // Cevaplari (dogruIndex, aciklama) gondermeden once soyulmus soru listesi hazirlanir -
    // boylece dogru cevap tarayici konsolundan bile okunamaz.
    const soyulmusSorular = deneme.sorular.map((s) => ({ soru: s.soru, secenekler: s.secenekler }));

    return Response.json({
      aktifDeneme: { id: deneme.id, ad: deneme.ad, sinif: deneme.sinif, ders: deneme.ders, acilis: deneme.acilis, kapanis: deneme.kapanis, soruSayisi: deneme.sorular.length },
      sorular: zatenCozmus ? null : soyulmusSorular,
      zatenCozmus,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ aktifDeneme: null, gelecekDeneme: null });
  }
}
