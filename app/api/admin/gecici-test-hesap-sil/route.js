import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

// Tek seferlik, admin yetkili test hesabi temizleme araci (11 Eylul).
// hesap-sil route'undaki AYNI 20-FK-guvenli silme mantigi, ama sifre
// onayi olmadan (admin zaten yetkili).
export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const epostalar = new URL(req.url).searchParams.get("epostalar");
  if (!epostalar) return Response.json({ error: "epostalar parametresi gerekli (virgulle ayrilmis)" }, { status: 400 });
  const liste = epostalar.split(",").map((e) => e.trim()).filter(Boolean);

  const sonuclar = [];
  for (const eposta of liste) {
    try {
      const k = await sql`SELECT id FROM kullanicilar WHERE eposta = ${eposta}`;
      if (k.length === 0) { sonuclar.push({ eposta, durum: "bulunamadi" }); continue; }
      const kullaniciId = k[0].id;

      await sql`DELETE FROM hata_kitapcigi WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM ilerleme WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM sinav_sonuclari WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM seviye_tespit_kademe WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM seviye_tespit_sonuc WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM ulusal_deneme_sonuclari WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM gunluk_kullanim WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM gunluk_gorevler WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM veli_ogrenci WHERE veli_id = ${kullaniciId} OR ogrenci_id = ${kullaniciId}`;
      await sql`DELETE FROM randevular WHERE ogrenci_id = ${kullaniciId}`;
      await sql`DELETE FROM canli_ders_katilimcilari WHERE ogrenci_id = ${kullaniciId}`;
      await sql`DELETE FROM geri_bildirimler WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM konu_hakimiyet WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM tek_konu_oturumu WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM ucretli_deneme_sonuclari WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM odemeler WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM satislar WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM abonelikler WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM kullanici_kredileri WHERE kullanici_id = ${kullaniciId}`;
      await sql`DELETE FROM guvenlik_denemeleri WHERE anahtar = ${eposta}`;

      // Kurum yoneticisiyse kurumlar tablosunda da referans olabilir - varsa temizle.
      try { await sql`DELETE FROM kurumlar WHERE yonetici_id = ${kullaniciId}`; } catch (e) {}

      await sql`DELETE FROM kullanicilar WHERE id = ${kullaniciId}`;
      sonuclar.push({ eposta, durum: "silindi" });
    } catch (e) {
      sonuclar.push({ eposta, durum: "hata", detay: e.message });
    }
  }
  return Response.json({ sonuclar });
}
