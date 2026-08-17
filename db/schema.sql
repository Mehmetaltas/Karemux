-- Neon Postgres üzerinde çalıştırın (Neon konsolu > SQL Editor'e yapıştırıp Run'a basın,
-- ya da: psql "$DATABASE_URL" -f db/schema.sql)

CREATE TABLE IF NOT EXISTS kullanicilar (
  id SERIAL PRIMARY KEY,
  eposta TEXT UNIQUE NOT NULL,
  sifre_hash TEXT NOT NULL,
  ad TEXT,
  rol TEXT NOT NULL DEFAULT 'ogrenci',   -- 'ogrenci' | 'veli'
  eposta_dogrulandi BOOLEAN NOT NULL DEFAULT false,
  dogrulama_kodu TEXT,
  dogrulama_kodu_son_tarih TIMESTAMPTZ,
  veli_baglanti_kodu TEXT UNIQUE,        -- öğrencinin veliye vereceği kod
  olusturulma TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS veli_ogrenci (
  id SERIAL PRIMARY KEY,
  veli_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  ogrenci_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  olusturulma TIMESTAMPTZ DEFAULT now(),
  UNIQUE(veli_id, ogrenci_id)
);

CREATE TABLE IF NOT EXISTS gunluk_kullanim (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_istek_sayisi INTEGER NOT NULL DEFAULT 0,
  UNIQUE(kullanici_id, tarih)
);

CREATE TABLE IF NOT EXISTS abonelikler (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,               -- 'ucretsiz' | 'premium_aylik' | 'premium_yillik'
  durum TEXT NOT NULL DEFAULT 'aktif', -- 'aktif' | 'iptal' | 'suresi_doldu'
  iyzico_abonelik_id TEXT,
  baslangic TIMESTAMPTZ DEFAULT now(),
  bitis TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS odemeler (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  iyzico_odeme_id TEXT,
  tutar NUMERIC(10,2) NOT NULL,
  para_birimi TEXT DEFAULT 'TRY',
  durum TEXT NOT NULL,               -- 'basarili' | 'basarisiz' | 'beklemede'
  olusturulma TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ilerleme (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  ders TEXT NOT NULL,
  konu TEXT NOT NULL,
  dogru_sayisi INTEGER,
  toplam_soru INTEGER,
  olusturulma TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sinav_sonuclari (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  tur TEXT NOT NULL,              -- 'deneme' | 'yazili1' | 'yazili2' | 'yazili3' | 'seviye'
  ders TEXT NOT NULL,
  dogru INTEGER NOT NULL,
  yanlis INTEGER NOT NULL,
  bos INTEGER NOT NULL,
  net NUMERIC(5,2) NOT NULL,
  olusturulma TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS soru_bankasi (
  id SERIAL PRIMARY KEY,
  ders TEXT NOT NULL,
  sinif INTEGER,
  unite TEXT,
  alt_konu TEXT,
  zorluk TEXT,
  soru TEXT NOT NULL,
  secenekler JSONB NOT NULL,
  dogru_index INTEGER NOT NULL,
  kaynak_turu TEXT,          -- 'quiz' | 'fasikul' | 'paragraf' | 'yazili' | 'deneme' | 'seviye'
  gosterim_sayisi INTEGER NOT NULL DEFAULT 0,
  dogru_cevaplanma_sayisi INTEGER NOT NULL DEFAULT 0,
  olusturulma TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soru_bankasi_ders ON soru_bankasi(ders, sinif, unite);

CREATE INDEX IF NOT EXISTS idx_ilerleme_kullanici ON ilerleme(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_abonelik_kullanici ON abonelikler(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_veli_ogrenci_veli ON veli_ogrenci(veli_id);
CREATE INDEX IF NOT EXISTS idx_veli_ogrenci_ogrenci ON veli_ogrenci(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_gunluk_kullanim ON gunluk_kullanim(kullanici_id, tarih);
CREATE INDEX IF NOT EXISTS idx_sinav_sonuclari_kullanici ON sinav_sonuclari(kullanici_id, ders, tur);

CREATE TABLE IF NOT EXISTS randevu_talepleri (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE SET NULL,
  ders TEXT NOT NULL,
  tercih_edilen_tarih TEXT NOT NULL,
  tercih_edilen_saat TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'beklemede', -- beklemede | onaylandi | tamamlandi | iptal
  olusturulma TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_randevu_kullanici ON randevu_talepleri(kullanici_id, durum);

CREATE TABLE IF NOT EXISTS hata_kitapcigi (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE SET NULL,
  cihaz_id TEXT,
  ders TEXT NOT NULL,
  alt_konu TEXT,
  soru TEXT NOT NULL,
  secenekler JSONB NOT NULL,
  dogru_index INTEGER NOT NULL,
  verilen_index INTEGER,
  aciklama TEXT,
  cozuldu BOOLEAN NOT NULL DEFAULT false,
  olusturulma TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hata_kitapcigi_kullanici ON hata_kitapcigi(kullanici_id, ders, cozuldu);
CREATE INDEX IF NOT EXISTS idx_hata_kitapcigi_cihaz ON hata_kitapcigi(cihaz_id, ders, cozuldu);

-- Koc (AI) ya da ileride gercek bir ogretmen/veli tarafindan atanan gunluk gorevler.
-- "kaynak" alani hangisinden geldigini ayirt eder, boylece ayni yapi ikisi icin de kullanilabilir.
CREATE TABLE IF NOT EXISTS gunluk_gorevler (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
  cihaz_id TEXT,
  hafta_baslangic DATE NOT NULL,
  gun TEXT NOT NULL, -- 'Pazartesi', 'Sali', ...
  ders TEXT NOT NULL,
  gorev TEXT NOT NULL,
  kaynak TEXT NOT NULL DEFAULT 'koc', -- 'koc' | 'ogretmen' | 'veli'
  tamamlandi BOOLEAN NOT NULL DEFAULT false,
  olusturulma TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gunluk_gorevler_kullanici ON gunluk_gorevler(kullanici_id, hafta_baslangic);
CREATE INDEX IF NOT EXISTS idx_gunluk_gorevler_cihaz ON gunluk_gorevler(cihaz_id, hafta_baslangic);

-- NOT: Bu tablolar sonradan eklendiği için mevcut bir veritabanında
-- eksik sütunlar olabilir. Zaten schema.sql'i çalıştırmış olan projelerde
-- şu ek komutları da çalıştırın:
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'ogrenci';
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS eposta_dogrulandi BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS dogrulama_kodu TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS dogrulama_kodu_son_tarih TIMESTAMPTZ;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS veli_baglanti_kodu TEXT UNIQUE;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS sifre_sifirlama_kodu TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS sifre_sifirlama_son_tarih TIMESTAMPTZ;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS hedef_il TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS hedef_ilce TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS hedef_okul TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS hedef_puan INTEGER;
-- ALTER TABLE bilgi_parcalari ADD COLUMN IF NOT EXISTS embedding vector;
-- ALTER TABLE bilgi_parcalari ADD COLUMN IF NOT EXISTS icerik TEXT;
-- ALTER TABLE giderler ADD COLUMN IF NOT EXISTS kategori TEXT;
-- ALTER TABLE giderler ADD COLUMN IF NOT EXISTS tekrarlayan BOOLEAN;
-- ALTER TABLE giderler ADD COLUMN IF NOT EXISTS tutar_tl NUMERIC;
-- ALTER TABLE guvenlik_denemeleri ADD COLUMN IF NOT EXISTS anahtar TEXT;
-- ALTER TABLE hata_kitapcigi ADD COLUMN IF NOT EXISTS sonraki_tekrar DATE;
-- ALTER TABLE hata_kitapcigi ADD COLUMN IF NOT EXISTS tekrar_asamasi INTEGER;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS kurum_id INTEGER;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS telegram_baglanti_kodu TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS veli_eposta TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS veli_onay_token TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS veli_onay_verildi BOOLEAN;
-- ALTER TABLE kurumlar ADD COLUMN IF NOT EXISTS kurum_kodu TEXT;
-- ALTER TABLE mevcut_okullar ADD COLUMN IF NOT EXISTS okul_adi TEXT;
-- ALTER TABLE ogretmen_musaitlik ADD COLUMN IF NOT EXISTS baslangic_saat TIME WITHOUT TIME ZONE;
-- ALTER TABLE ogretmen_musaitlik ADD COLUMN IF NOT EXISTS bitis_saat TIME WITHOUT TIME ZONE;
-- ALTER TABLE ogretmen_musaitlik ADD COLUMN IF NOT EXISTS haftanin_gunu INTEGER;
-- ALTER TABLE ogretmen_musaitlik ADD COLUMN IF NOT EXISTS ogretmen_id INTEGER;
-- ALTER TABLE ogretmenler ADD COLUMN IF NOT EXISTS brans TEXT;
-- ALTER TABLE paketler ADD COLUMN IF NOT EXISTS anahtar TEXT;
-- ALTER TABLE paketler ADD COLUMN IF NOT EXISTS fiyat_tl NUMERIC;
-- ALTER TABLE paketler ADD COLUMN IF NOT EXISTS kredi_miktari INTEGER;
-- ALTER TABLE paketler ADD COLUMN IF NOT EXISTS sure_gun INTEGER;
-- ALTER TABLE randevular ADD COLUMN IF NOT EXISTS baslangic_zamani TIMESTAMPTZ;
-- ALTER TABLE randevular ADD COLUMN IF NOT EXISTS bitis_zamani TIMESTAMPTZ;
-- ALTER TABLE randevular ADD COLUMN IF NOT EXISTS ogretmen_id INTEGER;
-- ALTER TABLE randevular ADD COLUMN IF NOT EXISTS zoom_link TEXT;
-- ALTER TABLE randevular ADD COLUMN IF NOT EXISTS zoom_meeting_id TEXT;
-- ALTER TABLE satislar ADD COLUMN IF NOT EXISTS iyzico_komisyon_tl NUMERIC;
-- ALTER TABLE satislar ADD COLUMN IF NOT EXISTS net_gelir_tl NUMERIC;
-- ALTER TABLE satislar ADD COLUMN IF NOT EXISTS paket_id INTEGER;
-- ALTER TABLE satislar ADD COLUMN IF NOT EXISTS taksit_sayisi INTEGER;
-- ALTER TABLE satislar ADD COLUMN IF NOT EXISTS tutar_tl NUMERIC;
-- ALTER TABLE seviye_tespit_kademe ADD COLUMN IF NOT EXISTS kademe INTEGER;
-- ALTER TABLE seviye_tespit_kademe ADD COLUMN IF NOT EXISTS kaynak_sinif INTEGER;
-- ALTER TABLE seviye_tespit_sonuc ADD COLUMN IF NOT EXISTS zayif_unite_sayisi INTEGER;
-- ALTER TABLE ulusal_deneme_sonuclari ADD COLUMN IF NOT EXISTS kurum_id INTEGER;
-- ALTER TABLE ulusal_deneme_sonuclari ADD COLUMN IF NOT EXISTS ulusal_deneme_id INTEGER;
-- ALTER TABLE ulusal_denemeler ADD COLUMN IF NOT EXISTS acilis TIMESTAMPTZ;
-- ALTER TABLE ulusal_denemeler ADD COLUMN IF NOT EXISTS kapanis TIMESTAMPTZ;
-- ALTER TABLE ulusal_denemeler ADD COLUMN IF NOT EXISTS sorular JSONB;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS okul TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS telefon TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS sinif INTEGER;
