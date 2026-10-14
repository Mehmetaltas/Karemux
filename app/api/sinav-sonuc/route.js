import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { ozetSonucuDogrula } from "@/lib/puanlama";
import { sinavSonucuKaydet } from "@/lib/sinav-sonuc-kaydet";

export async function POST(req) {
  try {
    const { cihazId, tur, ders, dogru, yanlis, bos } = await req.json();
    if (typeof tur !== "string" || typeof ders !== "string" || !tur || !ders || tur.length > 80 || ders.length > 200 || dogru == null || yanlis == null || bos == null) {
      return Response.json({ error: "Eksik veri" }, { status: 400 });
    }
    // Faz E: bu uc nokta cevap anahtarina sahip DEGIL (sinavlar istemcide
    // olusturuluyor), bu yuzden sayilar dogrulanir ve NET istemciden ALINMAZ,
    // sunucuda yeniden hesaplanir. Tam sunucu puanlamasi sinav turu basina ayrica yapilir.
    const ozet = ozetSonucuDogrula({ dogru, yanlis, bos });
    if (!ozet) return Response.json({ error: "Gecersiz sonuc degerleri" }, { status: 400 });
    const net = ozet.net;
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Kullanici belirlenemedi" }, { status: 400 });

    const { oncekiNet, testNo } = await sinavSonucuKaydet(kullaniciId, { tur, ders, dogru: ozet.dogru, yanlis: ozet.yanlis, bos: ozet.bos, net });

    return Response.json({ ok: true, oncekiNet, testNo });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
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
