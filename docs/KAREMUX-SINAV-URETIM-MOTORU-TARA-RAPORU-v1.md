# KAREMUX — Sınav Üretim Motoru TARA Raporu v1
12 Ekim 2026. Bu rapor SADECE OKUMA ile hazırlandı — hiçbir dosya değiştirilmedi, commit/deploy yapılmadı. Her bulgu gerçek kod dosya:satır referansıyla kanıtlıdır, tahmin yoktur.

## 1. DÖRT MEKANİZMANIN DOSYA VE FONKSİYON HARİTASI

| # | Mekanizma | Dosya | Tetikleyici | Çağrı Şekli |
|---|---|---|---|---|
| 1 | Seviye Tespit (ilk) | `app/api/seviye-tespit/olustur/route.js` | Öğrenci, seviye tespit sınavına başlarken | `POST`, istemciden çoklu konu listesi alır |
| 2 | Seviye Tespit (onay/kademe) | `app/api/seviye-tespit/onay-sinavi-olustur/route.js` | Öğrenci bir kademeyi (zayıf ünite) tamamlamaya çalışırken | `POST`, `kademeId` alır |
| 3 | Ulusal/Yerel Deneme | `lib/ulusalDenemeOlustur.js` → `denemeOlustur()` | Admin manuel VEYA 2 ayrı cron | Paylaşılan fonksiyon, 3 farklı çağıran |
| 4 | Konu Paketi (anlatım+soru havuzu+ödev) | `app/api/konu-paketi/route.js` | Öğrenci bir konuyu açtığında | `GET`, cache-first |

**Ek (üretim DEĞİL, tüketim):**
- `app/api/optik-okuma/route.js` — kağıda yazılmış cevapları okuyup dijitalleştirir. Soru ÜRETMEZ, sadece var olan bir sınavın cevap anahtarını (A/B/C/D listesi) fotoğraftan çıkarır.

## 2. ÇAĞIRAN API'LER / ARAYÜZLER (frontend)

Tek dosyada, `app/page.js`'de toplanmış:
- Satır 1662, 1699 → `/api/optik-okuma`
- Satır 2163 → `/api/seviye-tespit/olustur`
- Satır 2226 → `/api/seviye-tespit/onay-sinavi-olustur`
- Satır 3310, 3389, 3519 → `/api/konu-paketi` (3 farklı ekrandan aynı endpoint'e)

`denemeOlustur()` (mekanizma #3) hiçbir yerden doğrudan frontend'den çağrılmıyor — 3 ayrı backend çağıranı var:
- `app/api/ulusal-deneme/olustur/route.js` — admin panelinden manuel tetikleme
- `app/api/cron/ulusal-deneme-otomatik/route.js` — haftalık otomatik (tüm kullanıcılara)
- `app/api/cron/paket-deneme-otomatik/route.js` — 2 haftada bir, SADECE Kamp/Grup Dersi/Soru Çözüm/Rehberlik-Koçluk katılımcılarına, il bazlı tam deneme (5 ders birden, LGS formatı), hafta sonu penceresi açılış/kapanış mantığıyla.

## 3. ORTAK BAĞIMLILIKLAR (paylaşılan lib dosyaları)

| Bağımlılık | Kullanan mekanizmalar | İşlevi |
|---|---|---|
| `lib/ai.js` (`aiCagir`, `aiCagirDetay`, `ikinciGorusAl`) | Hepsi | AI sağlayıcı çağrısı (Gemini öncelikli, fallback zinciri) |
| `lib/json-ayikla.js` (`jsonAyikla`) | #1, #4 | Güvenli JSON ayrıştırma (kontrol karakteri + mojibake korumalı). #2 ve #3 bunu KULLANMIYOR, kendi elle `JSON.parse(temiz.slice(...))` yapıyor — kırılgan. |
| `lib/soruKalite.js` (`sorulariDenetle`) | #1, #3 | Bağımsız AI çağrısıyla "redaksiyon" — cevap gerçekten doğru mu, çeldirici belirsiz mi. Fail-open (hata olursa sorular olduğu gibi geçer). |
| `lib/kalite-motoru.js` (4 katman: yapısal/deterministik/çapraz-model/müfredat-sınır) | SADECE #4 | Çok daha kapsamlı, 4 katmanlı, ayrı bir kalite sistemi. #1/#2/#3 bunu HİÇ kullanmıyor. |
| `lib/kalite-referanslari.js` (`KALITE_REFERANSLARI`) | #1, #2, #4 (#3 kullanmıyor) | Derse özel kalite rehberi metni |
| `lib/ratelimit.js` (`gunlukLimitKontrolEt`) | #1, #4, optik-okuma (#2 ve #3 YOK) | Günlük kullanım limiti. #2 kimliği zaten `kullaniciIdCoz` ile çözüyor ama limit kontrolü yapmıyor; #3 zaten admin/cron tetikli, kullanıcı bazlı limit kavramı yok. |
| `lib/gorsel-karar-sunucu.js` | SADECE #4 | Konuya görsel/SVG eklenip eklenmeyeceğine karar verir |
| `lib/soru-talimati-sunucu.js` | SADECE #4 | "Bağlam Temelli" vs "Kazanım Temelli" soru tarzı seçimi (sınıfa göre) |
| `lib/email.js` (`resendIstemcisi`) | SADECE #4 | Kalite kontrolünden geçemeyen içerik için öğretmene bildirim |
| `lib/db.js` (`sql`) | #2, #3, #4 (#1 YOK — DB'ye hiç yazmıyor, sadece soru üretip döndürüyor) | — |

**En kritik tespit:** 4 mekanizma, soru kalitesini doğrulamak için İKİ FARKLI, BİRBİRİNDEN BAĞIMSIZ sistem kullanıyor (`sorulariDenetle` vs 4-katmanlı `kalite-motoru`), ve #2'nin fallback yolu (cache boşsa) HİÇBİR kalite kontrolünden geçmiyor.

## 4. ÜRETİLEN SORU BİÇİMLERİ VE KALİTE KONTROLÜ

| # | Çıktı alanları | Soru sayısı | Kalite kontrolü |
|---|---|---|---|
| 1 | `{ders, unite, sinif, soru, secenekler, dogruIndex}` | İstenen konu sayısı kadar (max 30) | `sorulariDenetle` (bağımsız AI redaksiyonu) |
| 2 (cache) | `{soru, secenekler, dogruIndex}` | 3 (rastgele havuzdan) | DOLAYLI — havuzdaki sorular zaten #4'ün 4-katman kontrolünden geçmiş olabilir (ama bu garanti değil, sadece cache'e öyle girmişse) |
| 2 (fallback) | `{soru, secenekler, dogruIndex}` | 3 (yeni üretim) | **YOK** — format filtresi dışında hiçbir kalite kontrolü yapılmıyor |
| 3 | `{soru, secenekler, dogruIndex, altKonu, aciklama}` | Varsayılan 20 | `sorulariDenetle` |
| 4 | `anlatim{...}` + `soruHavuzu[15]` + `odevSorulari[6]` | 15 soru (5 kolay/6 orta/4 zor) + 6 ödev | 4 katman: yapısal (`kaliteKontrolYap`) + deterministik (`deterministikKontrolYap`, sadece Matematik'te `kontrolIfadesi`) + çapraz-model (`ikinciGorusAl`) + müfredat-sınır (sadece referans var/yok, GÖLGE MOD) |

Not: #4'teki tüm kontroller "GÖLGE MOD" — hiçbiri üretimi durdurmuyor, sadece işaretliyor (ASCII-transliterasyon şüphesi hariç, o tek yeniden-üretimi tetikliyor). #1 ve #3'teki `sorulariDenetle` ise ELEME yapıyor (kalite denetiminden geçemeyen soru listeden çıkarılıyor).

## 5. VERİTABANI YAZIMLARI VE ERİŞİM KURALLARI

| # | Tablo | Ne zaman yazılır | Erişim kontrolü |
|---|---|---|---|
| 1 | — (yazmaz) | — | `gunlukLimitKontrolEt` (kimliksiz de çalışır, cihaz bazlı) |
| 2 | `seviye_onay_sinavlari` (cevap anahtarı SUNUCUDA kalır) | Her üretimde | `kullaniciIdCoz` (login şart) + `kademeId` sahiplik kontrolü (`WHERE id=... AND kullanici_id=...`) |
| 3 | `ulusal_denemeler` | Her üretimde | Admin/cron tetikli, kullanıcı erişim kontrolü yok (zaten kullanıcıdan gelmiyor) |
| 4 | `icerik_onbellek` (cache, `onay_durumu` ile öğretmen inceleme kuyruğu) | Her yeni üretimde (cache boşsa) | `gunlukLimitKontrolEt` |
| optik-okuma | — (yazmaz) | — | `gunlukLimitKontrolEt` |

## 6. BİRLEŞTİRME SIRASINDA KORUNMASI GEREKEN DAVRANIŞLAR

Bunlar, tek motora geçişte YANLIŞLIKLA kaybedilirse gerçek hata/güvenlik açığına yol açacak noktalar:

1. **#2'nin "cevap anahtarı sunucuda kalır" deseni MUTLAKA korunmalı** — bu, 18 Eylül'de kapatılmış gerçek bir güvenlik açığının düzeltmesi. `guvenliSorular` ile temizleme adımı asla atlanmamalı.
2. **#2'nin cache-önce/üret-sonra (köprü) deseni** — `icerik_onbellek`'teki `konu_paketi.soruHavuzu`'ndan rastgele 3 soru seçme mantığı, maliyet optimizasyonu için kritik; birleştirmede bu öncelik sırası bozulmamalı.
3. **#3'teki "sarmal yaklaşım"** — `hata_kitapcigi`'ndeki en çok hata yapılan 5 alt konuyu bulup sorunun 1/3'ünü oraya ayırma mantığı — pedagojik olarak önemli, basit bir "rastgele soru üret"e indirgenmemeli.
4. **#4'teki "SESIN ÇOK ÖNEMLİ" diyalog tarzı talimatı ve "ONEMLI UYARI" (kalıp övgü yasağı)** — bu, ürünün kendine özgü anlatım kalitesinin temeli, konu anlatımı üreten HER YOL için korunmalı.
5. **#4'teki Matematik'e özel `kontrolIfadesi`** — SADECE Matematik'te istenen, bilinçli bir kısıtlama (diğer derslerde yapay sayısal soru eğilimini önlemek için). Birleştirmede "tüm derslere uygula" gibi bir genelleme YAPILMAMALI.
6. **#4'teki ASCII-transliterasyon tespiti + tek seferlik yeniden üretim** — diğer kalite uyarılarından farklı olarak bu TEK istisna, otomatik yeniden deneme hak ediyor; birleştirmede bu ayrım (diğerleri sadece işaretler, bu yeniden üretir) kaybolmamalı.
7. **#4'teki öğretmen bildirim akışı** (`onay_durumu='bekliyor'` → ilgili branştaki öğretmenlere e-posta) — içerik kalite kontrol zincirinin (AI→QC→Öğretmen→Onay→Yayın) tek çalışan halkası, mutlaka korunmalı.
8. **#1 ve #3'ün `sorulariDenetle` ELEME mantığı** (kalite kontrolünden geçemeyen soru listeden ÇIKARILIYOR) vs **#4'ün GÖLGE MOD mantığı** (hiçbir şey elenmiyor, sadece işaretleniyor) — bunlar KASITLI farklı tasarım kararları (18 Eylül'de müfredat-sınır kontrolü için "yüksek yanlış-pozitif" bulgusuyla gölge moda düşürülmüştü). Birleştirmede hangi modun hangi bağlamda kullanılacağı AÇIKÇA karara bağlanmalı, körlemesine birleştirilmemeli.
9. **#3'ün 3 farklı çağıranı (manuel/haftalık cron/2 haftalık paket cron) ayrı pencere/parametre mantıklarıyla çalışıyor** — `haftaSonuPenceresi()` gibi zamanlama fonksiyonları `denemeOlustur()`'un DIŞINDA, çağıran route'larda — motor birleşse de bu zamanlama mantığı ayrı kalmalı.
10. **Rate limit tutarsızlığı KASITLI DEĞİL, muhtemelen eksiklik** — #2 ve #3'te günlük limit kontrolü yok. Birleştirme bu eksikliği kapatma fırsatı olabilir ama bu bir KARAR gerektirir (örn. #2 zaten login+kademe sahipliği kontrolü yapıyor, günlük limit eklemek öğrenci deneyimini bozabilir).

## 7. OPTİK OKUMA DOSYASININ YENİ MİMARİDEKİ YERİ

`optik-okuma/route.js` bir ÜRETİM mekanizması DEĞİL — soru üretmiyor, var olan bir sınavın (kaynağı ne olursa olsun) kağıt cevaplarını okuyor. `soruSayisi` parametresi dışında üretim motoruyla hiçbir bağımlılığı yok.

**Sonuç: Bu dosyaya motor birleştirmesinde DOKUNULMASI GEREKMİYOR.** Tek motor hangi formatta soru üretirse üretsin, optik-okuma onun "kaç soru olduğunu" bilmesi yeterli — çıktısı (`cevaplar` dizisi) herhangi bir sınav sonuç işleme route'una (sinav-sonuc, seviye-tespit/gonder, ucretli-deneme/gonder) aynen beslenebilir. TARA'nın önceki raporundaki "KARAR GEREKİYOR" notu bu nedenle KAPATILABİLİR: optik-okuma, sınav merkezinin "cevap toplama" katmanında kalıcı, bağımsız bir yardımcı araç olarak kalmalı; üretim motoruna entegre edilmesine gerek yok.

## 8. ORTAK MOTORUN TASLAĞI VE TEST PLANI (öneri, henüz kodlanmadı)

### Taslak mimari
### Her mevcut mekanizmanın yeni motora nasıl eşleneceği
- #1 (seviye-tespit/olustur) → `uretSoru({..., sayi:1 (konu başına), tarz:"kazanim_temelli", kaliteModu:"eleme"})`, döngüyle her konu için.
- #2 (onay-sinavi-olustur) → `uretSoru({..., sayi:3, kaliteModu:"eleme"})` — fallback'e kalite kontrolü EKLENMELİ (şu an eksik).
- #3 (denemeOlustur) → `uretSoru({..., sayi:20, zorlukDagilimi:{kolay:.2,orta:.55,zor:.25}, sarmalKonular, kaliteModu:"eleme"})`.
- #4 (konu-paketi) → anlatım+ödev kısmı AYRI kalmalı (bunlar soru değil), ama `soruHavuzu` üretimi `uretSoru({..., sayi:15, kaliteModu:"golge", katman4:true})` ile ortak motora taşınabilir.

### Test planı (birleştirme sırasında)
1. **Regresyon testi — her mekanizma için ÖNCE/SONRA karşılaştırması:** Aynı girdiyle (aynı ders/ünite/sınıf) eski kod ve yeni motor paralel çalıştırılıp çıktı formatı/alan isimleri bire bir karşılaştırılmalı.
2. **Güvenlik regresyonu (#2 için kritik):** Yeni motordan gelen cevapların istemciye `dogruIndex` SIZMADIĞI otomatik testle doğrulanmalı (önceki açığın tekrarlanmaması için).
3. **Kalite modu testi:** Aynı kötü soru (bilinçli hatalı cevap anahtarı) hem "eleme" hem "gölge" modunda denenip doğru davranış (biri eler, biri işaretler) kanıtlanmalı.
4. **Cache davranışı testi:** #2'nin cache-önce mantığı yeni motorda bozulmadığı — cache'de 3+ soru varken AI'ya HİÇ gidilmediği loglanarak kanıtlanmalı.
5. **Rate limit testi:** Hangi mekanizmaların limite tabi olacağına karar verildikten sonra, her biri için ayrı ayrı 429 senaryosu test edilmeli.
6. **Canlı kademeli geçiş:** Önceki Dalga 9 adımlarındaki gibi — önce EN DÜŞÜK riskli mekanizma (muhtemelen #1, DB'ye yazmıyor) yeni motora taşınır, canlı kanıtlanır, sonra sırayla diğerleri.

## KAPANIŞ
Bu rapor tamamen OKUMA ile hazırlandı, hiçbir kod/commit/deploy yapılmadı. Birleştirmeye başlamadan önce karar beklenen tek açık nokta: **madde 6'daki 10 davranışın hangilerinin "tek motor"da nasıl temsil edileceği** ve **kalite modu (eleme/gölge) seçiminin her mekanizma için bilinçli onaylanması**.
