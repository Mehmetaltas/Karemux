import { sql } from "@/lib/db";

// Cari Merkezi Mimari (17 Eylul) - hem musteri (ogrenci/veli/kurum -
// bize borclu) hem tedarikci/personel (biz borcluyuz) tarafini AYNI
// cariler+cari_hareketleri tablosunda, kaynak_tablo/kaynak_id ile
// GERCEK sistem hesabina baglayarak tutar. kaynak_tablo=null ise
// dis/manuel cari (elektrik sirketi gibi, sistemde hesabi olmayan).

// Bir kullaniciya/ogretmene/kuruma/personele bagli cari kaydi yoksa
// olusturur, varsa onu doner. Idempotent - aynı kaynak icin tekrar
// cagrilirsa YENI kayit ACMAZ.
export async function cariBulYaDaAc({ ad, tur, kaynakTablo, kaynakId, telefon, eposta }) {
  const mevcut = await sql`
    SELECT id FROM cariler WHERE kaynak_tablo = ${kaynakTablo} AND kaynak_id = ${kaynakId}
  `;
  if (mevcut.length > 0) return mevcut[0].id;

  const yeni = await sql`
    INSERT INTO cariler (ad, tur, telefon, eposta, kaynak_tablo, kaynak_id)
    VALUES (${ad}, ${tur}, ${telefon || null}, ${eposta || null}, ${kaynakTablo}, ${kaynakId})
    RETURNING id
  `;
  return yeni[0].id;
}

// Bir cariye hareket ekler (satis_veresiye/tahsilat/tedarik_borcu/odeme).
export async function cariHareketEkle({ cariId, tur, tutarTl, aciklama, tarih }) {
  await sql`
    INSERT INTO cari_hareketleri (cari_id, tur, tutar_tl, aciklama, tarih)
    VALUES (${cariId}, ${tur}, ${tutarTl}, ${aciklama || null}, ${tarih || new Date().toISOString().slice(0, 10)})
  `;
}
