import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Faz E tamamlandi: TUM sinav sonuclari artik sunucuda puanlanip yazilir
// (/api/sinav-oturumu/gonder, /api/seviye-tespit/gonder, /api/ucretli-deneme/gonder).
// Istemcinin kendi bildirdigi sonucu kabul eden bu POST kapatildi; eski sekmelerdeki
// (guncellenmemis) istemciler hatayi sessizce yutar, sonuc kaydi olusmaz.
export async function POST() {
  return Response.json({ error: "Sonuclar sunucuda puanlanir; bu uc nokta kapatildi" }, { status: 410 });
}

export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const cihazId = params.get("cihazId");
    const dersFiltre = params.get("ders");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ sonuclar: [] });

    const sonuclar = dersFiltre
      ? await sql`
          SELECT tur, ders, dogru, yanlis, bos, net, olusturulma
          FROM sinav_sonuclari
          WHERE kullanici_id = ${kullaniciId} AND (ders = ${dersFiltre} OR ders LIKE ${dersFiltre + "::%"})
          ORDER BY olusturulma DESC
          LIMIT 100
        `
      : await sql`
          SELECT tur, ders, dogru, yanlis, bos, net, olusturulma
          FROM sinav_sonuclari
          WHERE kullanici_id = ${kullaniciId}
          ORDER BY olusturulma DESC
          LIMIT 200
        `;
    return Response.json({ sonuclar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
