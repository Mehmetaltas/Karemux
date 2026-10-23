import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { denemeKulubuUyeMi } from "@/lib/deneme-kulubu";
import { donguOnerileri } from "@/lib/deneme-kulubu-dongu";

// Deneme Kulubu uyesinin analiz -> tekrar dongusu. Yalniz kendi verisi; uye degilse 403.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giriş gerekli" }, { status: 401 });
    const uyelik = await denemeKulubuUyeMi(kullaniciId);
    if (!uyelik.uye) return Response.json({ error: "Deneme Kulübü üyeliği gerekli" }, { status: 403 });

    const denemeler = await sql`
      SELECT ad, net, tarih FROM (
        SELECT d.ad AS ad, s.net AS net, s.olusturulma AS tarih
        FROM ulusal_deneme_sonuclari s JOIN ulusal_denemeler d ON d.id = s.ulusal_deneme_id
        WHERE s.kullanici_id = ${kullaniciId}
        UNION ALL
        SELECT ders || ' (' || tur || ')', net, olusturulma FROM sinav_sonuclari
        WHERE kullanici_id = ${kullaniciId} AND tur = 'deneme'
      ) x ORDER BY tarih DESC LIMIT 6`;
    const zayif = await sql`
      SELECT ders, alt_konu, COUNT(*)::int AS hata_sayisi
      FROM hata_kitapcigi
      WHERE kullanici_id = ${kullaniciId} AND cozuldu = false AND alt_konu IS NOT NULL
      GROUP BY ders, alt_konu ORDER BY hata_sayisi DESC LIMIT 5`;
    const bekleyen = await sql`
      SELECT COUNT(*)::int AS c FROM hata_kitapcigi
      WHERE kullanici_id = ${kullaniciId} AND cozuldu = false AND sonraki_tekrar <= CURRENT_DATE`;

    const cikti = donguOnerileri({
      denemeler: denemeler.map((d) => ({ ad: d.ad, net: Number(d.net), tarih: d.tarih })),
      zayifKonular: zayif.map((z) => ({ ders: z.ders, altKonu: z.alt_konu, hataSayisi: z.hata_sayisi })),
      bekleyenTekrar: bekleyen[0]?.c || 0,
    });
    return Response.json({ ...cikti, sonDenemeler: denemeler.map((d) => ({ ad: d.ad, net: Number(d.net), tarih: d.tarih })), zayifKonular: zayif.map((z) => ({ ders: z.ders, altKonu: z.alt_konu, hataSayisi: z.hata_sayisi })) });
  } catch (e) {
    console.error("deneme-kulubu/dongu:", e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
