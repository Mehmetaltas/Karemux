# KAREMUX Company Twin — Referans Şirket Eşleştirme Matrisi

**Tarih:** 10 Eylül 2026
**Kaynak:** Önceki (GitHub bağlantısız) oturumlarda üretilen Referans Şirket tartışmalarının, bugünkü gerçek KAREMUX koduyla eşleştirilmesi.

---

## 1. Değişmez İlkeler (önceki oturumlarda kilitlendi, hâlâ geçerli)

1. **Referans Şirket = KAREMUX'un işletme anayasası.** Departman yapısı, süreçler, KPI mantığı **keyfi olarak çıkarılmaz.**
2. **KAREMUX = tek gerçek veri kaynağı.** Rakamlar sadece gerçek DB'den gelir.
3. **Veri yoksa `veri_yok` / `ölçülemiyor` yazılır — asla tahmin uydurulmaz.**
4. **3 seviyeli veri ayrımı:**
   - **GERÇEK** — DB'den doğrudan
   - **TAHMİN** — geçmiş gerçek veriden istatistiksel çıkarım
   - **SENARYO** — yöneticinin kendi varsayımı
5. **Gereksiz olan yalnızca şunlardır** (bunlar dışında hiçbir departman/KPI silinmez):
   - Mükerrer hesap (aynı verinin ikinci kaynağı)
   - Karar üretmeyen gösteriş metriği
   - Veri kaynağı olmayan uydurulmuş değer
   - Kullanılmayan ölü kod

---

## 2. Referans Şirket Yapısı (önceki oturumlarda tasarlanan)

```
KAREMUX ŞİRKETİ
├── Şirket Yönetimi
│   ├── Finans
│   ├── İnsan Kaynakları
│   └── Hukuk / KVKK
├── Ürün / Eğitim
├── Teknoloji
├── Satış
├── Pazarlama
├── Müşteri Başarısı / Destek
├── Operasyon
├── Veri / AI
└── İç Kontrol
```

---

## 3. Eşleştirme Matrisi — Departman Bazında

| Departman / KPI | Referans Şirkette İstenen | KAREMUX'ta GERÇEKTE Var mı? | Durum |
|---|---|---|---|
| **Finans — Gelir** | Paket, kurum, lisans, deneme, özel ders, canlı ders geliri | `satislar`, `odemeler`, `abonelikler` tabloları var; `satislar` şu an **0 satır** (lansman öncesi) | 🟡 Altyapı VAR, veri henüz YOK |
| **Finans — Gider** | Öğretmen, personel, AI, altyapı, ödeme sistemi maliyeti | `giderler` tablosu var, AI maliyeti artık otomatik yazılıyor (günlük cron) | ✅ VAR, gerçek veri akıyor |
| **Finans — Kâr/Zarar** | Gelir − maliyet, aylık/yıllık | `/api/admin/maliyet` kısmi hesaplıyor (üretim gideri + tahmini AI maliyeti) | 🟡 KISMİ — gerçek satış verisi olmadan tam hesaplanamıyor |
| **Finans — Nakit/Runway** | Nakit akışı, kaç ay yetiyor | Hiç yok | 🔴 VERİ_YOK |
| **İK — Personel KPI** | Departman performans ölçümü | `personel` tablosu var (sadece hesap bilgisi), performans/KPI alanı yok | 🔴 VERİ_YOK (bilinçli, referans dokümanında da böyle işaretlenmişti) |
| **Hukuk/KVKK** | Merkezi KVKK yönetim ekranı | Gizlilik politikası sayfası var, merkezi bir "KVKK paneli" yok | 🔴 VERİ_YOK / bilinçli ertelendi |
| **Ürün/Eğitim — Kullanım** | Aktif öğrenci, konu çalışması, soru çözümü, hata türleri | `sinav_sonuclari`, `hata_kitapcigi`, `konu_hakimiyet`, `tek_konu_oturumu` — hepsi gerçek veri | ✅ VAR, gerçek veri |
| **Ürün/Eğitim — Öğrenme Sonucu** | "Ürün gerçekten öğretiyor mu?" | Öğrenme Hafızası (AI özet) var, ama sistemik "öğrenme etkisi" KPI'sı yok | 🟡 KISMİ |
| **Teknoloji — Sistem Sağlığı** | Health, hata, kullanıcı etkisi ilişkisi | `/api/health` + GitHub Actions health-check var; "X hata → Y kullanıcı etkilendi" ilişkisi YOK | 🟡 KISMİ |
| **Satış — Dönüşüm Hunisi** | Ziyaret→Kayıt→Premium ilgisi→Satın alma | `donusum_olayi` tablosu **185 gerçek olay** içeriyor, admin ekranına bağlandı (9 Eylül) | ✅ VAR, gerçek veri |
| **Satış — Churn** | İptal/yenileme takibi | Hiç yok | 🔴 VERİ_YOK |
| **Pazarlama** | Tanıtım → ziyaret → kayıt zinciri | `donusum_olayi` ile kısmen var; YouTube/reklam verisi yok (henüz aktif değil) | 🟡 KISMİ, bilinçli (YouTube henüz yok) |
| **Müşteri Başarısı/Destek** | Açık/kapalı talep, çözüm süresi, tekrar eden problem | `destek_talebi` tablosu VAR ama **0 satır** (sistem 7 Eylül'de kuruldu, henüz gerçek talep yok) | 🟡 Altyapı VAR, veri henüz YOK (normal, yeni) |
| **Operasyon** | VPS/Neon/Vercel kapasite+güvenlik | Dijital İkiz (`ikiz_degisken`) günlük cron ile Neon depolama, öğretmen sayısı vb. ölçüyor | ✅ VAR, gerçek veri |
| **Veri/AI — Kullanım+Maliyet** | Sağlayıcı bazında çağrı, başarı, maliyet | `ai_saglayici_log` (9 Eylül kuruldu) — her çağrı gerçek kaydediliyor, admin panelde görünüyor | ✅ VAR, gerçek veri (yeni) |
| **Öğretmen Twin** | Aktif öğretmen, materyal üretimi, kullanımı, maliyeti | `ogretmen_materyalleri` (150 satır), öğretmen sayısı (3) — gerçek | ✅ VAR, gerçek veri |
| **İç Kontrol / Risk** | Güvenlik, doğrulanmamış alanlar | `ikiz_degisken`'de risk_uyum boyutu var, bazı alanlar bilinçli NULL (doğrulanmadı) | ✅ VAR, doğru şekilde işaretli |

---

## 4. Bulunan Mükerrer/Gereksiz Yapılar (temizlenmesi gereken)

1. **Eski `sistem_ikizi` tablosu** — kod tabanında **SIFIR referans** (grep ile doğrulandı, 10 Eylül). Gerçekten terk edilmiş, `ikiz_boyut/ikiz_degisken` mimarisi onun yerini almış. Silinmesine gerek yok (zararsız, DB'de duruyor) ama "eksik" diye bir daha listeye girmemeli.
2. **`ikiz_senaryo`** — kod tabanında **2 dosyada aktif kullanılıyor** (`/api/admin/ikiz-senaryo` + günlük "gerçek durum" cron'u), gerçekten çalışıyor. Ama hâlâ çoğunlukla ELLE girilen varsayımlara dayanıyor. Bu, Referans Şirket'in "SENARYO" katmanına karşılık geliyor — YANLIŞ değil, ama "GERÇEK" ile karıştırılmamalı; admin ekranında bu ayrım netleştirilmeli (henüz yapılmadı).
3. **`ikiz_degisken`** — kod tabanında **2 dosyada aktif kullanılıyor** (`/api/admin/sistem-ikizi` + günlük güncelleme cron'u), gerçekten çalışıyor ve GERÇEK katmanı doğru temsil ediyor.

**CT-1 doğrulama sonucu (10 Eylül, kod taraması):** İki aktif tablo (`ikiz_degisken`, `ikiz_senaryo`) gerçek, sağlıklı kullanımda. Tek ölü yapı `sistem_ikizi` — DROP edilmeden önce kullanıcı onayı gerekir (bu belgenin ilkesine göre: "kullanılmıyor gibi görünmesi ≠ gerçekten kullanılmıyor olması", ama bu durumda grep ile KESİNLEŞTİ).

---

## 4.5 GERÇEK / TAHMİN / SENARYO Veri Sözlüğü (CT-1 çıktısı)

| Metrik | Katman | Kaynak | Durum |
|---|---|---|---|
| Aktif öğrenci sayısı | GERÇEK | `abonelikler` (durum='aktif') | ✅ çalışıyor |
| Neon depolama kullanımı | GERÇEK | `pg_database_size()` canlı ölçüm | ✅ çalışıyor |
| Öğretmen sayısı | GERÇEK | `ogretmenler` COUNT | ✅ çalışıyor |
| AI sağlayıcı başarı/maliyet | GERÇEK | `ai_saglayici_log` | ✅ çalışıyor (9 Eylül kuruldu) |
| Satış dönüşüm hunisi | GERÇEK | `donusum_olayi` (185 olay) | ✅ çalışıyor |
| Günlük gider | GERÇEK | `giderler` (AI maliyeti otomatik yazılıyor) | ✅ çalışıyor |
| "100/500/1000 Premium olursa" | SENARYO | `ikiz_senaryo` — yönetici elle giriyor | ✅ çalışıyor, ama "SENARYO" etiketi ekranda net değil |
| 90 günlük Premium tahmini | TAHMİN | Yok | 🔴 henüz kurulmadı — yeterli geçmiş veri birikmeden kurulmamalı |
| Churn riski | TAHMİN | Yok | 🔴 gerçek abonelik/yenileme verisi olmadan kurulmaz |
| Nakit/Runway | GERÇEK | Yok | 🔴 veri_yok |
| Personel KPI | GERÇEK | Yok | 🔴 veri_yok, bilinçli |

**Kalıcı kural:** Yeni bir metrik eklerken önce bu tabloya hangi katmanda (GERÇEK/TAHMİN/SENARYO) olduğu yazılmalı — üçü ekranda asla aynı renk/etiketle gösterilmemeli.

---

## 5. Öncelik Sırası (önceki oturumlarda kilitlenen, hâlâ geçerli)

| Aşama | İş | Durum (10 Eylül) |
|---|---|---|
| P0 | Gerçek veri envanteri | ✅ TAMAMLANDI (9 Eylül) |
| P0 | Bu eşleştirme matrisi | ✅ TAMAMLANDI (bu belge) |
| P1 | Mükerrer/gereksiz Twin kodunun temizlenmesi | 🟡 Kısmen (yukarıda 2 madde bulundu, henüz kod değişikliği yapılmadı) |
| P1 | Central Data → Twin veri akışının netleştirilmesi | 🔴 Henüz yapılmadı |
| P2 | Simülasyon motoru (GERÇEK/TAHMİN/SENARYO ayrımının ekranda görünmesi) | 🔴 Henüz yapılmadı |
| P2 | Yönetim ekranı (tek bakışta "şirket bugün nasıl?") | 🟡 Kısmen (Genel Bakış sekmesi var ama Referans Şirket'teki kapsamda değil) |
| P3 | Tahmin/risk/fırsat zekâsı | 🔴 Henüz yapılmadı |

---

## 6. Sonuç

KAREMUX'un gerçek durumu, Referans Şirket modelinin **çoğu ana damarında zaten karşılığı var** (Finans-Gider, Ürün/Eğitim, Satış Hunisi, Operasyon, AI, Öğretmen). Gerçek boşluklar: **Personel KPI, Hukuk/KVKK merkezi, Churn, Nakit/Runway** — bunların hepsi bilinçli olarak "veri_yok" bırakılmalı, lansman ve gerçek kullanıcı verisi birikince doldurulmalı. **Video sistemi** (ayrı bir büyük konu) kesin olarak "şimdi değil, para kazanmaya başlayınca" kararına bağlanmış durumda — bu karar hâlâ geçerli.
