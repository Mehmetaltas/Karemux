# KAREMUX v3 Mimari — 10 Dalgalık Uygulama Planı
Oluşturulma: 30 Eylül 2026. Kullanıcının belirlediği sıra ve metodoloji.

## Sabit Metodoloji (HER dalgada aynı sıra)
1. **TARA** — mevcut sistemde bununla ilgili ne var, hangi tablo/route kullanıyor, ne eksik, ne yanlış. KANITLA, tahmin etme.
2. **TASARLA** — bulgulara göre somut değişiklik planı, kullanıcıya göster.
3. **KODLA** — onaydan sonra.
4. **TEST ET** — yerel/izole, mümkünse gerçek veriyle.
5. **CANLI DOĞRULA** — deploy sonrası gerçek sonuçla kanıtla, test verisini temizle.

Her dalga bir öncekinin üzerine inşa edilir, sırayla ilerlenir.

## Video İstisnası (ÖNEMLİ, kapsam sınırı)
**Dalga 7'de (Mini Video Motoru) gerçek video ÜRETİLMEYECEK.** Bu aşamada kurulacak olan:
- Video üretim MOTORU (senaryo→slayt→akıllı tahta→seslendirme zinciri, teknik altyapı)
- TAM müfredat bazlı üretim KATALOĞU (hangi alt konunun hangi video formatında olacağı, planlama/envanter)

Gerçek video üretimi (fiili render, yayın) **piyasaya çıktıktan sonra, gerçek kullanım ve ihtiyaç verisine göre** başlayacak. Bu dalga "altyapı kurma", "içerik doldurma" değil.

## 10 Dalga

| # | Dalga | Kapsam (özet) |
|---|---|---|
| 1 | **Abonelik Motoru** | Kullanıcı≠Paket≠Abonelik≠Ödeme ayrımı, zengin abonelik veri modeli (dönem/yenileme/iptal/iade/erişim hakları) |
| 2 | **Entitlement** | Paket satın alınınca öğrencinin NEYE erişebildiğini net tanımlayan hak katmanı |
| 3 | **Paket Tasarım Merkezi** | Admin'de tek ekrandan paket kurma (sınıf/ders/plan/video/soru/fiyat/erişim) |
| 4 | **Akademik Takvim** | MEB dönem/tatil/resmi tatil/ortak sınav tarihlerini tutan motor, Yıllık Plan'ın temeli |
| 5 | **Plan Motoru** | Yıllık→Aylık→Haftalık→Günlük ders hiyerarşisi, 3 çalışma modu (Planlı/Serbest/Eksik Kapat), Resmi Plan vs Öğrenme Planı ayrımı |
| 6 | **Content Core** | soru_bankasi/icerik_onbellek/konu_paketi/ders_plani'nı ortak konu/kazanım kimliğine bağlayan merkezi mimari |
| 7 | **Mini Video Motoru + Katalog** | SADECE motor+katalog (yukarıdaki istisnaya bakınız) |
| 8 | **5.350 Arşiv Üretim Altyapısı** | 535 alt konu × 10 materyal için batch üretim altyapısı (üretimin kendisi değil, altyapı) |
| 9 | **Sınav Merkezi** | Tüm sınav tiplerinin (deneme/yazılı/bursluluk/seviye tespit) tek motora indirgenmesi |
| 10 | **Deneme Kulübü** | Sınav→analiz→öğrenme→tekrar ölçüm döngüsünün tamamlanması (şu an sadece erişim var, analiz/tekrar katmanı yok) |

## Durum
Hiçbir dalga başlamadı. Bugünkü (30 Eylül) işler bu planın DIŞINDA, mevcut sistemin bakımı/düzeltmesiydi (2FA, Content Core bug'ı, muhasebe genişletmesi, soru bankası temizliği).

## Sıradaki Adım
Dalga 1 (Abonelik Motoru) → TARA aşaması: `abonelikler`, `odemeler`, `satislar`, `paketler`, `kullanici_kredileri` tablolarının tam şemasını ve bunları kullanan TÜM route'ları çıkarmak.
