import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const ziyaret = await sql`SELECT COUNT(*)::int AS sayi FROM donusum_olayi WHERE olay_turu = 'ziyaret' AND olusturulma >= now() - interval '30 days'`;
    const kayit = await sql`SELECT COUNT(*)::int AS sayi FROM donusum_olayi WHERE olay_turu = 'kayit' AND olusturulma >= now() - interval '30 days'`;
    const premiumInceleme = await sql`SELECT COUNT(*)::int AS sayi FROM donusum_olayi WHERE olay_turu = 'premium_inceleme' AND olusturulma >= now() - interval '30 days'`;
    const satinAlmaBaslatildi = await sql`SELECT COUNT(*)::int AS sayi FROM donusum_olayi WHERE olay_turu = 'satin_alma_baslatildi' AND olusturulma >= now() - interval '30 days'`;
    const odeme = await sql`SELECT COUNT(*)::int AS sayi FROM odemeler WHERE durum = 'basarili' AND olusturulma >= now() - interval '30 days'`;
    const aktivasyon = await sql`SELECT COUNT(*)::int AS sayi FROM abonelikler WHERE baslangic >= now() - interval '30 days'`;
    const iptalIade = await sql`SELECT COUNT(*)::int AS sayi FROM iade_talepleri WHERE olusturulma >= now() - interval '30 days'`;

    const basamaklar = [
      { etiket: "Ziyaret", sayi: ziyaret[0].sayi },
      { etiket: "Kayıt", sayi: kayit[0].sayi },
      { etiket: "Premium İnceleme", sayi: premiumInceleme[0].sayi },
      { etiket: "Satın Alma Başlatıldı", sayi: satinAlmaBaslatildi[0].sayi },
      { etiket: "Ödeme", sayi: odeme[0].sayi },
      { etiket: "Aktivasyon", sayi: aktivasyon[0].sayi },
      { etiket: "İptal/İade", sayi: iptalIade[0].sayi },
    ];

    return Response.json({ basamaklar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
