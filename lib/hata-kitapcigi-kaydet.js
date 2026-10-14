// Faz E - hata_kitapcigi'na TEK yazim noktasi (hata-kitapcigi route'u ve sinav-oturumu/gonder kullanir).
// Adaptif Ogrenme Motoru yan etkisi (zayif alt konu -> seviye_tespit_kademe) burada korunur.
import { sql } from "@/lib/db";

export async function hataKitapcigiKaydet({ kullaniciId, cihazId, ders, altKonu, soru, secenekler, dogruIndex, verilenIndex, aciklama }) {
  await sql`
    INSERT INTO hata_kitapcigi (kullanici_id, cihaz_id, ders, alt_konu, soru, secenekler, dogru_index, verilen_index, aciklama)
    VALUES (${kullaniciId}, ${cihazId || null}, ${ders}, ${altKonu || null}, ${soru}, ${JSON.stringify(secenekler)}, ${dogruIndex}, ${verilenIndex ?? null}, ${aciklama || null})
  `;

  // ADAPTIF OGRENME MOTORU: bu zayif konu sadece Hata Kitapcigi'nda kalmasin -
  // ayni rehberli Kademe 1/2/3 (Seviye Tamamlama) sistemine de otomatik girsin.
  // Ogrencinin sinifi bilinmiyorsa atlanir.
  if (kullaniciId && altKonu) {
    try {
      const kullaniciSatiri = await sql`SELECT sinif FROM kullanicilar WHERE id = ${kullaniciId}`;
      const ogrenciSinifi = kullaniciSatiri[0]?.sinif;
      if (ogrenciSinifi) {
        await sql`
          INSERT INTO seviye_tespit_kademe (kullanici_id, ders, unite, kaynak_sinif, kademe, tamamlandi)
          VALUES (${kullaniciId}, ${ders}, ${altKonu}, ${ogrenciSinifi}, 1, false)
          ON CONFLICT (kullanici_id, ders, unite, kaynak_sinif) DO NOTHING
        `;
      }
    } catch (e) {
      console.error("Adaptif motor kademe kaydi basarisiz (yoksayildi):", e.message);
    }
  }
}
