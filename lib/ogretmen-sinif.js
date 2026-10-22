// 22 Ekim (Madde 34): Ogretmen <-> ogrenci <-> sinif baglantisi.
// Ogrenci bir ogretmenin sinifina YALNIZ kendi istegiyle, ogretmenin verdigi sinif koduyla katilir ve istedigi an ayrilir.
// Ogretmen yalniz sinav netlerinin ozetini ve cozulmemis hata konularini gorur; soru icerigi, sifre, iletisim bilgisi gormez.
import { sql } from "@/lib/db";

let hazir = false;
export async function sinifTablolariniHazirla() {
  if (hazir) return;
  await sql`
    CREATE TABLE IF NOT EXISTS ogretmen_siniflari (
      id SERIAL PRIMARY KEY, ogretmen_id INTEGER NOT NULL, ad TEXT NOT NULL, kod TEXT NOT NULL UNIQUE,
      aktif BOOLEAN NOT NULL DEFAULT true, olusturulma TIMESTAMP NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ogretmen_sinif_ogrencileri (
      sinif_id INTEGER NOT NULL, kullanici_id INTEGER NOT NULL, katilma TIMESTAMP NOT NULL DEFAULT now(),
      PRIMARY KEY (sinif_id, kullanici_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ogretmen_odevleri (
      id SERIAL PRIMARY KEY, sinif_id INTEGER NOT NULL, baslik TEXT NOT NULL, ders TEXT NOT NULL, konu TEXT,
      aciklama TEXT, son_tarih DATE, olusturulma TIMESTAMP NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ogretmen_odev_teslim (
      odev_id INTEGER NOT NULL, kullanici_id INTEGER NOT NULL, isaretlenme TIMESTAMP NOT NULL DEFAULT now(),
      PRIMARY KEY (odev_id, kullanici_id)
    )
  `;
  hazir = true;
}

// Calisma kaydi kaniti: ogrencinin `ders` icin `tarihten` sonra sunucuda kaydedilmis bir sinav sonucu / tamamlanmis pratik /
// tek konu testi / hata kitapcigi kaydi var mi? (ogrenci oz-bildiriminden bagimsiz, gercek kanit)
const sade = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/İ/g, "i").toLowerCase().trim();
const DERS_ANAHTARLARI = ["matematik", "fen", "turkce", "inkilap", "sosyal", "din", "ingilizce"];
export const dersAnahtari = (d) => DERS_ANAHTARLARI.find((k) => sade(d).includes(k)) || sade(d);

export async function calismaKayitlari(kullaniciIdler, tarihten) {
  if (!kullaniciIdler.length) return [];
  return sql`
    SELECT kullanici_id, ders FROM (
      SELECT kullanici_id, split_part(ders, '::', 1) AS ders FROM sinav_sonuclari WHERE kullanici_id = ANY(${kullaniciIdler}) AND olusturulma >= ${tarihten}
      UNION ALL SELECT kullanici_id, ders FROM tek_konu_oturumu WHERE kullanici_id = ANY(${kullaniciIdler}) AND olusturulma >= ${tarihten}
      UNION ALL SELECT kullanici_id, ders FROM hata_kitapcigi WHERE kullanici_id = ANY(${kullaniciIdler}) AND olusturulma >= ${tarihten}
      UNION ALL SELECT kullanici_id, meta->>'ders' FROM sinav_oturumlari WHERE kullanici_id = ANY(${kullaniciIdler}) AND kullanildi = true AND olusturulma >= ${tarihten}
    ) x
  `;
}

// Karisabilecek karakterler (0/O, 1/I) disarida birakilir.
const KOD_KARAKTERLERI = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function sinifKoduUret() {
  let kod = "";
  for (let i = 0; i < 6; i++) kod += KOD_KARAKTERLERI[Math.floor(Math.random() * KOD_KARAKTERLERI.length)];
  return kod;
}
