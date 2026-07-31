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

-- NOT: Bu tablolar sonradan eklendiği için mevcut bir veritabanında
-- eksik sütunlar olabilir. Zaten schema.sql'i çalıştırmış olan projelerde
-- şu ek komutları da çalıştırın:
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'ogrenci';
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS eposta_dogrulandi BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS dogrulama_kodu TEXT;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS dogrulama_kodu_son_tarih TIMESTAMPTZ;
-- ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS veli_baglanti_kodu TEXT UNIQUE;
