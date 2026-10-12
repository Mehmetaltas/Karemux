# KAREMUX — Sınav Merkezi + Deneme Kulübü TARA RAPORU v1
12 Ekim 2026. Dalga 9/10'a başlamadan önce, kullanıcının kendi notundaki talimata uygun: "mevcut sistemi görmeden yeni tablo/route/API uydurmamak." Bu rapor, gerçek repoda (app/api, lib) okunan kod parçalarına dayanır — tahmin yok, her bulgu dosya:satır ile kanıtlı.

## ÖZET — EN ÖNEMLİ BULGU
Sınav Merkezi "sıfırdan inşa edilecek" bir şey DEĞİL. Plan belgesinin öngördüğü SINAV→OTURUM→KATILIM→CEVAPLAR→PUANLAMA→SONUÇ→SIRALAMA→ANALİZ→LEARNING MEMORY→TELAFİ zincirinin HER HALKASI, parçalı ve isimsiz biçimde zaten var ve çalışıyor. Dalga 9/10'un gerçek işi: bu dağınık parçaları BİRLEŞTİRMEK (tek motor), eksik halkaları (coğrafi sıralama, online oturum/katılım kavramı) eklemek — baştan yazmak değil.

## Mevcut Altyapı Envanteri (plan'ın veri modeli adımlarına göre)

### SINAV ÜRETİMİ — 4 PARALEL/AYRI MEKANİZMA (DUPLİKE)
1. **seviye-tespit/olustur** — AI'dan tek-seferlik soru üretir (seviye tespit sınavı), `dogruIndex`'i CEVAPLA BİRLİKTE istemciye gönderir.
2. **seviye-tespit/onay-sinavi-olustur** — kademe onay sınavı, önce `icerik_onbellek.konu_paketi.soruHavuzu`'ndan seçer (kalite motorundan geçmiş havuz), yoksa AI'dan üretir. `dogruIndex` SUNUCUDA KALIR (`guvenliSorular` ile temizlenip gönderilir) — bilinçli, 18 Eylül'de kapatılmış bir açığın düzeltmesi.
3. **lib/ulusalDenemeOlustur.js** (`denemeOlustur()`) — AI'dan 20 soruluk ulusal deneme üretir, `ulusal_denemeler` tablosuna yazar. **ZATEN `kapsam` ve `il` kolonları var** (ulusal/yerel ayrımı).
4. **konu-paketi/route.js** — `soruHavuzu` (15 soru) üretir, kalite motorundan geçer, `icerik_onbellek`'e yazılır — bu havuz #2'de yeniden kullanılıyor (Content Core↔Sınav Merkezi köprüsü zaten var).

SINIFLANDIRMA: MEVCUT ama DUPLİKE/İSİMSİZ.

### OTURUM/KATILIM/PUANLAMA
- **ucretli-deneme/gonder/route.js** — EN GELİŞMİŞ örnek: server-side puanlama, net hesabı, alt-konu karnesi, hata_kitapçığı, kurum+genel sıralama/ortalama.
- **seviye-tespit/gonder** — `dogruMu` CLIENT'TAN geliyor, düşük riskli ön-tespit, asıl gate (kademe-3 onay sınavı) sunucuda doğrulanıyor.
- **sinav-sonuc/route.js** — client-reported sonuç. **12 Ekim: coğrafi snapshot (il/ilce/kurum_id) eklendi, canlı kanıtlandı.**
- **optik-okuma/route.js** — kağıt cevap okuma. KARAR GEREKİYOR: yeni plandaki yeri.

### SIRALAMA / COĞRAFİ İSTATİSTİK
- Kurum+genel sıralama ucretli-deneme/gonder'de çalışıyor.
- İl/ilçe snapshot: sinav_sonuclari'nda TAMAMLANDI (12 Ekim), ucretli_deneme_sonuclari'nda HENÜZ YOK, seviye_tespit_sonuc'ta TAMAMLANDI (12 Ekim).

### LEARNING MEMORY
- ogrenme-hafizasi + hata-kitapcigi'ndeki adaptif motor zaten kurulu, kademeli telafi sürecine besliyor.

### ENTITLEMENT
- lib/deneme-kulubu.js hâlâ paket-adı bazlı, hasEntitlement()'a henüz bağlanmadı.

## Karar: Tek Motora Geçiş Stratejisi (12 Ekim, kullanıcı onayı)
En düşük riskliden en yükseğe:
1. **sinav-sonuc** → TAMAMLANDI (0 satır, coğrafi snapshot eklendi, canlı kanıtlandı).
2. **seviye-tespit** → TAMAMLANDI (1+11 satır, coğrafi snapshot eklendi).
3. **ucretli-deneme** → SIRADA (gerçek ödeme+sonuç+sıralama, en yüksek risk).
