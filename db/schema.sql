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

-- ============================================================
-- ASAGIDAKI BOLUM 19-21 AGUSTOS 2026'DA CANLI VERITABANINDAN
-- OTOMATIK OLARAK CIKARILDI - yukaridaki eski ALTER TABLE yorum
-- listesinin YERINE GECER (o liste eksik/guncel degildi, bircok
-- tablonun temel CREATE TABLE'i hic yoktu). Bu, GERCEK, doğrulanmis
-- sutun yapisidir (information_schema.columns'dan). Tip/varsayilan
-- bilgisi dogru ama FK/UNIQUE/INDEX kisitlari burada YOK - onlar
-- icin canli DB'ye (\d tablo_adi) bakilmali.
-- ============================================================

-- banka_hesaplari
--   id: integer NOT NULL DEFAULT nextval('banka_hesaplari_id_seq'::regclass)
--   hesap_adi: text NOT NULL
--   tur: text NOT NULL
--   banka_adi: text
--   iban: text
--   baslangic_bakiyesi: numeric NOT NULL DEFAULT 0
--   aktif: boolean NOT NULL DEFAULT true
--   olusturulma: timestamp with time zone DEFAULT now()

-- bilgi_parcalari
--   id: integer NOT NULL DEFAULT nextval('bilgi_parcalari_id_seq'::regclass)
--   ders: text NOT NULL
--   sinif: integer
--   unite: text
--   alt_konu: text
--   icerik: text NOT NULL
--   embedding: USER-DEFINED
--   kaynak: text
--   olusturulma: timestamp with time zone DEFAULT now()

-- cari_hareketleri
--   id: integer NOT NULL DEFAULT nextval('cari_hareketleri_id_seq'::regclass)
--   cari_id: integer NOT NULL
--   tur: text NOT NULL
--   tutar_tl: numeric NOT NULL
--   aciklama: text
--   tarih: date DEFAULT CURRENT_DATE
--   olusturulma: timestamp with time zone DEFAULT now()

-- cariler
--   id: integer NOT NULL DEFAULT nextval('cariler_id_seq'::regclass)
--   ad: text NOT NULL
--   tur: text NOT NULL
--   telefon: text
--   eposta: text
--   notlar: text
--   olusturulma: timestamp with time zone DEFAULT now()

-- finansal_hedefler
--   id: integer NOT NULL DEFAULT nextval('finansal_hedefler_id_seq'::regclass)
--   yil: integer NOT NULL
--   ay: integer NOT NULL
--   gelir_hedefi_tl: numeric NOT NULL DEFAULT 0
--   gider_hedefi_tl: numeric NOT NULL DEFAULT 0
--   notlar: text
--   olusturulma: timestamp with time zone DEFAULT now()

-- geri_bildirimler
--   id: integer NOT NULL DEFAULT nextval('geri_bildirimler_id_seq'::regclass)
--   kullanici_id: integer
--   ozellik: text NOT NULL
--   tur: text NOT NULL
--   mesaj: text
--   olusturulma: timestamp with time zone DEFAULT now()

-- giderler
--   id: integer NOT NULL DEFAULT nextval('giderler_id_seq'::regclass)
--   kategori: text NOT NULL
--   tutar_tl: numeric NOT NULL
--   aciklama: text
--   tarih: date NOT NULL DEFAULT CURRENT_DATE
--   tekrarlayan: boolean NOT NULL DEFAULT false
--   olusturulma: timestamp with time zone DEFAULT now()

-- guvenlik_denemeleri
--   id: integer NOT NULL DEFAULT nextval('guvenlik_denemeleri_id_seq'::regclass)
--   anahtar: text NOT NULL
--   tur: text NOT NULL
--   basarili: boolean NOT NULL DEFAULT false
--   olusturulma: timestamp with time zone DEFAULT now()

-- imha_kayitlari
--   id: integer NOT NULL DEFAULT nextval('imha_kayitlari_id_seq'::regclass)
--   anonim_referans: text NOT NULL
--   islem_turu: text NOT NULL
--   islem_tarihi: timestamp with time zone NOT NULL DEFAULT now()
--   islem_sonucu: text NOT NULL
--   silinen_veri_kategorileri: text
--   anonimlestirme_yapildi_mi: boolean NOT NULL
--   tetikleyen_olay: text

-- kasa_hareketleri
--   id: integer NOT NULL DEFAULT nextval('kasa_hareketleri_id_seq'::regclass)
--   hesap_id: integer NOT NULL
--   tur: text NOT NULL
--   tutar_tl: numeric NOT NULL
--   aciklama: text
--   tarih: date DEFAULT CURRENT_DATE
--   olusturulma: timestamp with time zone DEFAULT now()

-- kurum_deneme_satin_alma
--   id: integer NOT NULL DEFAULT nextval('kurum_deneme_satin_alma_id_seq'::regclass)
--   kurum_id: integer
--   deneme_id: integer
--   tutar_tl: numeric NOT NULL
--   odendi: boolean NOT NULL DEFAULT false
--   satin_alma_tarihi: timestamp with time zone DEFAULT now()

-- kurumlar
--   id: integer NOT NULL DEFAULT nextval('kurumlar_id_seq'::regclass)
--   ad: text NOT NULL
--   kurum_kodu: text NOT NULL
--   olusturulma: timestamp with time zone DEFAULT now()
--   kisi_basi_fiyat_tl: numeric DEFAULT 300
--   min_kisi_sayisi: integer DEFAULT 20

-- mevcut_okullar
--   id: integer NOT NULL DEFAULT nextval('mevcut_okullar_id_seq'::regclass)
--   il: text NOT NULL
--   ilce: text NOT NULL
--   okul_adi: text NOT NULL
--   onaylandi: boolean NOT NULL DEFAULT false

-- ogretmen_musaitlik
--   id: integer NOT NULL DEFAULT nextval('ogretmen_musaitlik_id_seq'::regclass)
--   ogretmen_id: integer
--   haftanin_gunu: integer NOT NULL
--   baslangic_saat: time without time zone NOT NULL
--   bitis_saat: time without time zone NOT NULL

-- ogretmenler
--   id: integer NOT NULL DEFAULT nextval('ogretmenler_id_seq'::regclass)
--   ad: text NOT NULL
--   brans: text NOT NULL
--   aciklama: text
--   aktif: boolean NOT NULL DEFAULT true
--   olusturulma: timestamp with time zone DEFAULT now()
--   saatlik_ucret_tl: numeric DEFAULT 600

-- paketler
--   id: integer NOT NULL DEFAULT nextval('paketler_id_seq'::regclass)
--   anahtar: text NOT NULL
--   ad: text NOT NULL
--   fiyat_tl: numeric NOT NULL
--   sure_gun: integer
--   kredi_miktari: integer
--   aciklama: text
--   aktif: boolean NOT NULL DEFAULT true
--   olusturulma: timestamp with time zone DEFAULT now()
--   gunluk_ai_limiti: integer

-- randevular
--   id: integer NOT NULL DEFAULT nextval('randevular_id_seq'::regclass)
--   ogretmen_id: integer
--   ogrenci_id: integer
--   baslangic_zamani: timestamp with time zone NOT NULL
--   bitis_zamani: timestamp with time zone NOT NULL
--   zoom_link: text
--   zoom_meeting_id: text
--   durum: text NOT NULL DEFAULT 'onaylandi'::text
--   olusturulma: timestamp with time zone DEFAULT now()
--   ucret_tl: numeric
--   odendi: boolean NOT NULL DEFAULT false

-- satislar
--   id: integer NOT NULL DEFAULT nextval('satislar_id_seq'::regclass)
--   kullanici_id: integer
--   paket_id: integer
--   tutar_tl: numeric NOT NULL
--   taksit_sayisi: integer NOT NULL DEFAULT 1
--   iyzico_komisyon_tl: numeric
--   net_gelir_tl: numeric
--   olusturulma: timestamp with time zone DEFAULT now()

-- seviye_tespit_kademe
--   id: integer NOT NULL DEFAULT nextval('seviye_tespit_kademe_id_seq'::regclass)
--   kullanici_id: integer
--   ders: text NOT NULL
--   unite: text NOT NULL
--   kaynak_sinif: integer NOT NULL
--   kademe: integer NOT NULL DEFAULT 1
--   tamamlandi: boolean NOT NULL DEFAULT false
--   olusturulma: timestamp with time zone DEFAULT now()

-- seviye_tespit_sonuc
--   id: integer NOT NULL DEFAULT nextval('seviye_tespit_sonuc_id_seq'::regclass)
--   kullanici_id: integer
--   toplam_soru: integer NOT NULL
--   dogru_sayisi: integer NOT NULL
--   zayif_unite_sayisi: integer NOT NULL
--   olusturulma: timestamp with time zone DEFAULT now()

-- talepler
--   id: integer NOT NULL DEFAULT nextval('talepler_id_seq'::regclass)
--   tur: text NOT NULL
--   baslik: text NOT NULL
--   baslik_normalize: text NOT NULL
--   aciklama: text
--   talep_sayisi: integer NOT NULL DEFAULT 1
--   ilk_talep: timestamp with time zone DEFAULT now()
--   son_talep: timestamp with time zone DEFAULT now()

-- ucretli_deneme_sonuclari
--   id: integer NOT NULL DEFAULT nextval('ucretli_deneme_sonuclari_id_seq'::regclass)
--   deneme_id: integer
--   kullanici_id: integer
--   kurum_id: integer
--   dogru: integer NOT NULL
--   yanlis: integer NOT NULL
--   bos: integer NOT NULL
--   net: numeric NOT NULL
--   olusturulma: timestamp with time zone DEFAULT now()

-- ucretli_denemeler
--   id: integer NOT NULL DEFAULT nextval('ucretli_denemeler_id_seq'::regclass)
--   ad: text NOT NULL
--   ders: text NOT NULL
--   sinif: integer NOT NULL
--   sorular: jsonb NOT NULL
--   fiyat_tl: numeric NOT NULL
--   aktif: boolean NOT NULL DEFAULT true
--   olusturulma: timestamp with time zone DEFAULT now()
--   kapsam: text NOT NULL DEFAULT 'ulusal'::text
--   il: text

-- ulusal_deneme_sonuclari
--   id: integer NOT NULL DEFAULT nextval('ulusal_deneme_sonuclari_id_seq'::regclass)
--   ulusal_deneme_id: integer
--   kullanici_id: integer
--   kurum_id: integer
--   dogru: integer NOT NULL
--   yanlis: integer NOT NULL
--   bos: integer NOT NULL
--   net: numeric NOT NULL
--   olusturulma: timestamp with time zone DEFAULT now()

-- ulusal_denemeler
--   id: integer NOT NULL DEFAULT nextval('ulusal_denemeler_id_seq'::regclass)
--   ad: text NOT NULL
--   sinif: integer NOT NULL
--   ders: text NOT NULL
--   sorular: jsonb NOT NULL
--   acilis: timestamp with time zone NOT NULL
--   kapanis: timestamp with time zone NOT NULL
--   olusturulma: timestamp with time zone DEFAULT now()
