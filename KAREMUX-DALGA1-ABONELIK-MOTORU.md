# Dalga 1 — Abonelik Motoru: TARA Raporu
30 Eylül 2026. Kanıta dayalı, kod/DB okumasıyla çıkarıldı.

---

## MEVCUT (ne var, kanıtlı)

**Tablolar:**
- `abonelikler`: id, kullanici_id, plan (text, paketler.anahtar'a karşılık), durum (text: 'aktif'/'iptal'), iyzico_abonelik_id, baslangic, bitis, kaynak, kurum_lisans_id. **Şu an 0 kayıt.**
- `odemeler`: 19 sütun — kullanici_id, odeyen_kullanici_id (AYRI — veli öder, öğrenci kullanır), tutar, durum, plan, kurum_id/ucretli_deneme_id/kurum_lisans_id/canli_ders_oturum_id/randevu_id (hangi ürün türü için ödendiğini ayıran 5 nullable FK), yontem (havale/iyzico), indirim_kodu/indirim_tutari.
- `satislar`: kullanici_id, paket_id, tutar_tl, net_gelir_tl, **odeme_id (bugün eklendi)**, **iade_edildi (bugün eklendi)**. Muhasebenin "gelir" kaynağı.
- `paketler`: anahtar, ad, fiyat_tl, sure_gun, kredi_miktari, aktif, **gunluk_ai_limiti**. 13 aktif paket (4 yıllık sınıf paketi, 3 Deneme Kulübü seviyesi, bursluluk, yaz/ara tatil, soru_coz_kredi).
- `kullanici_kredileri`: kullanici_id, kalan_kredi — abonelik DIŞI, tüketilebilir kredi sistemi (örn. soru_coz_kredi).

**Erişim kontrolü — MERKEZİ modül var ama DAR kullanılıyor:**
`lib/paket.js` ("Faz 11" olarak etiketli, kendi yorumunda "dağılmış paket/abonelik kontrollerini tek yerde toplamak" amacıyla yazılmış) üç fonksiyon sunuyor: `getUserPackage`, `hasPackageFeature`, `gorselSoruErisimVarMi`. **Sadece 4 route bunu çağırıyor:** claude, soru-coz, soru-coz-devam, teshis.

**Paket aktivasyonu:** `checkout/route.js` (İyzico başlatma) → `checkout/callback/route.js` (İyzico dönüşü) veya `admin/havale-onay/route.js` (manuel havale onayı) — ikisi de aynı dallanmayı tekrarlıyor (randevu/canlı ders/kurum lisans/kurum deneme/bireysel paket), her biri kendi `INSERT INTO abonelikler` veya `kullanici_kredileri` satırını yazıyor.

**İptal:** `abonelik/iptal/route.js` — gerçek İyzico cancel çağrısı + `durum='iptal', bitis=now()` (erişim ANINDA kesiliyor, kalan gün iadesi yok).

**İade sonrası erişim (bugün düzeltildi):** `admin/iade-talepleri` PATCH onayında artık aynı planın aktif aboneliğini de `iptal` yapıyor — ama bu DOĞRUDAN `abonelikler` UPDATE'i, `lib/paket.js`'i kullanmıyor.

**Deneme Kulübü:** Ayrı ödeme altyapısı YOK — `abonelikler.plan` değeri `deneme_kulubu_*` olan NORMAL bir abonelik. `lib/deneme-kulubu.js`'in `denemeKulubuUyeMi()` kendi raw sorgusuyla kontrol ediyor (merkezi modülü kullanmıyor).

**Yenileme:** `cron/yenileme-uyarisi` sadece **e-posta uyarısı** gönderiyor ("3 gün içinde yenilenecek"). **Gerçek otomatik yeniden tahsilat/uzatma mekanizması YOK** — İyzico'nun kendi abonelik ürünü bağlanmadığı için (API anahtarı yok) bu iddia şu an karşılıksız.

**Öğrenci-veli-kurum ilişkisi:** `veli_ogrenci` (veli_id, ogrenci_id) ayrı tablo; `kullanicilar.kurum_id` direkt FK; `odemeler.odeyen_kullanici_id` ödeyen ile kullanan ayrımını taşıyor (veli öder, öğrenci kullanır senaryosu için).

---

## SORUN (kanıtlı, somut)

1. **Merkezi Hak modülü var ama yaygınlaştırılmamış.** 4 route kullanıyor, en az **7 route kendi kopya sorgusunu** yazmış: `abonelik/durum`, `deneme-kulubu/durum`, `kurum/koltuk-ata` (2 yerde), `canli-ders/checkout`, `canli-ders/havale-baslat`, `admin/kullanici-profil-detay`, `cron/yenileme-uyarisi`. Aynı "aktif abonelik var mı" mantığı en az 3 farklı yerde birebir kopyalanmış (`canli-ders/checkout`, `canli-ders/havale-baslat`, `lib/paket.js`'in içindeki `gorselSoruErisimVarMi`).
2. **"Otomatik yenileme" gerçek değil.** Kullanıcıya e-postada "otomatik yenilenecek" vaadi veriliyor, ama hiçbir kod gerçekten yeniden tahsilat yapmıyor. İyzico bağlanmadan bu zaten çalışamaz, ama çalışsa bile bunu tetikleyen bir cron/webhook yok.
3. **Kullanıcı≠Paket≠Abonelik≠Ödeme ayrımı net değil.** `abonelikler.plan` serbest metin (paketler.anahtar'a FK değil!) — paket adı değişirse/silinirse abonelik kaydı kopuk kalır. `abonelikler` tablosunda `paket_id` FK yok, sadece `plan` (text).
4. **Her ürün türü (randevu/canlı ders/kurum lisans/kurum deneme/bireysel) kendi dallanmasını checkout/callback VE havale-onay'da İKİ KERE tekrarlıyor** (iki dosyada da aynı 5 if-bloğu, DRY ihlali — bugün satislar.odeme_id eklerken bunu zaten gördük).
5. **İptal, kalan gün iadesi yapmıyor** (bitis=now(), peşin alınan sürenin kalanı silinir) — bu bir iş kararı mı yoksa gözden kaçmış bir detay mı belirsiz, netleştirilmeli.
6. **`kurum_lisans_id` hem `abonelikler`'de hem `odemeler`'de var ama `abonelikler.paket_id` yok** — şema tutarsız, bazı ilişkiler FK'li bazıları text.

---

## HEDEF MİMARİ (öneri, onay bekliyor)

- `abonelikler.plan` (text) → `abonelikler.paket_id` (FK, paketler.id) — gerçek ilişkisel bağ.
- TÜM erişim kontrolü `lib/paket.js` üzerinden geçsin; 7 route'un kendi kopya sorgusu kaldırılıp merkezi fonksiyonlara yönlendirilsin.
- Checkout/callback + havale-onay'daki tekrarlanan 5-dallı mantık ortak bir `lib/odeme-isleme.js` fonksiyonuna çıkarılsın (iki dosya da onu çağırsın).
- Yenileme: ya gerçek bir mekanizma kurulsun (İyzico bağlanınca webhook ile), ya da e-posta metni "otomatik yenilenecek" yerine "yenilemen gerekecek" olarak düzeltilsin (yanlış vaat vermemek için, İyzico bağlanana kadar).
- İptal'in kalan gün davranışı (hemen kes vs. dönem sonuna kadar bırak) kullanıcıya sorulup netleştirilsin.

---

## MIGRATION (adım adım, geri dönülebilir)

1. `abonelikler.paket_id INTEGER` ekle (nullable, mevcut `plan` text sütunu SİLİNMEZ, paralel tutulur).
2. Mevcut 0 kayıt olduğu için retroaktif veri taşıma riski YOK — şema değişikliği sıfır veri kaybı riskiyle yapılabilir.
3. Checkout/callback + havale-onay'ın yeni INSERT'leri `paket_id`'yi de doldursun.
4. `lib/paket.js`'e `paket_id` bazlı yeni bir kontrol fonksiyonu eklenir, `plan` bazlı eskisi bir süre PARALEL bırakılır (geriye uyumluluk).
5. 7 route tek tek merkezi fonksiyona geçirilir, her birinde ayrı canlı test.

## KOD DEĞİŞİKLİKLERİ (dosya bazlı, bu dalganın kapsamı)

- `abonelikler` şema değişikliği (1 ALTER)
- `lib/paket.js` genişletmesi
- `app/api/checkout/callback/route.js`, `app/api/admin/havale-onay/route.js` — ortak fonksiyona çıkarma
- 7 route'un erişim kontrolünü merkezi hale getirmesi
- `cron/yenileme-uyarisi` metninin düzeltilmesi (gerçek mekanizma yoksa)

## TEST PLANI

Her değişiklik için: mevcut akış (checkout→callback→abonelik oluşur→erişim kontrolü doğru çalışır) uçtan uca canlı test, temiz test verisiyle, mevcut davranış BOZULMADAN. 0 gerçek kayıt olduğu için şema değişikliği risksiz; kod değişiklikleri her route için ayrı ayrı doğrulanacak.

---

## Karar Bekliyor
Yukarıdaki HEDEF MİMARİ onaylanırsa KODLA aşamasına geçilir. Onay öncesi kodlama YAPILMAYACAK (belirlenen metodoloji).
