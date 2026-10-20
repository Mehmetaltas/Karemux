import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { istemciSorusu } from "@/lib/sinav-uretimi";

// Sayfa yenilenince/baglanti koparsa, kullanicinin YARIM KALMIS (durum='devam_ediyor')
// son oturumunu geri getirir - 5 Eylul, Tek Konu Motoru.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ oturum: null });

    const sonuc = await sql`
      SELECT id, sinif, ders, unite, konu, anlatim, sorular, olusturulma
      FROM tek_konu_oturumu
      WHERE kullanici_id = ${kullaniciId} AND durum = 'devam_ediyor'
      ORDER BY olusturulma DESC
      LIMIT 1
    `;

    // Faz E: cevap anahtari tarayiciya gitmez (yalnizca cevapsiz sorular).
    const oturum = sonuc[0] ? { ...sonuc[0], sorular: (Array.isArray(sonuc[0].sorular) ? sonuc[0].sorular : []).map(istemciSorusu) } : null;
    return Response.json({ oturum });
  } catch (e) {
    console.error(e);
    return Response.json({ oturum: null });
  }
}
