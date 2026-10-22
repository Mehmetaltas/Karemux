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
  hazir = true;
}

// Karisabilecek karakterler (0/O, 1/I) disarida birakilir.
const KOD_KARAKTERLERI = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function sinifKoduUret() {
  let kod = "";
  for (let i = 0; i < 6; i++) kod += KOD_KARAKTERLERI[Math.floor(Math.random() * KOD_KARAKTERLERI.length)];
  return kod;
}
