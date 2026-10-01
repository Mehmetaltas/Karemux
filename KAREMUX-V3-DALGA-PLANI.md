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

## Nihai Hedef (tüm dalgalar bittiğinde, çapraz ilke)

**Entegre zincir:** SATIŞ → ABONELİK → KULLANIM → ÖĞRENME → SINAV → İÇERİK → ÖĞRETMEN → DESTEK → MALİYET → GELİR → KPI — tek bir yönetim görünümüne (Company Twin) bağlanacak.

**GERÇEK/TAHMİN/SENARYO ayrımı (ÇAPRAZ KURAL, her dalgada geçerli):** Company Twin'de gösterilen her sayı üç kategoriden birine açıkça etiketlenecek:
- **GERÇEK** — DB'den doğrudan ölçülmüş (örn. gerçek satış tutarı, gerçek AI token sayısı)
- **TAHMİN** — bir formülle hesaplanmış, gerçek ölçüm değil (örn. "0,01 TL/istek" tahmini, token sayımı olmadan)
- **SENARYO** — varsayımsal/ileriye dönük projeksiyon (örn. "1000 öğrenciye ulaşırsak gelir X olur")

Bu ayrım, bugünkü oturumda zaten uygulanan disiplinin (AI maliyetinin "tahmini" etiketlenmesi, "kanıtla tahmin etme" ilkesi) Company Twin'in TÜM ekranlarına yaygınlaştırılmış hali. Her dalga kendi ürettiği sayıları bu üç etiketten biriyle işaretleyecek şekilde tasarlanacak — sonradan "hangisi gerçek" diye tekrar araştırmaya gerek kalmasın.

## Dalgalar Sonrası — Kapanış Sırası (10 dalga bittikten sonra)

Bu küçük/orta ölçekli açıklar, 10 büyük dalga tamamlandıktan sonra şu sırayla ele alınacak:

1. **Destek/SLA** — destek route'u var ama hiç test edilmedi, cevap süresi standardı yok
2. **Kota eşik uyarısı** (Telegram) — Gemini/AI sağlayıcı limitlerine yaklaşınca otomatik uyarı
3. **Fiyat sayfası değişim bekçisi** — resmi AI fiyat sayfalarının haftalık otomatik kontrolü
4. **KPI** — merkezi pano (bkz. Nihai Hedef bölümü, GERÇEK/TAHMİN/SENARYO ile)
5. **Live Academy** — canlı ders altyapısı (jitsi) var, hiç canlı test edilmedi
6. **Ödev** — öğrenci tarafında ayrı özellik yok, tasarım kararı gerekiyor
7. **Koçluk** — yapı doğru çalışıyor ama 0 gerçek kullanım, gerçek kullanıcıyla görülecek
8. **YouTube** — 20 videoluk takvim var, hiç video üretilmedi (pazarlama işi, Dalga 7'nin video motorundan farklı)
9. **Diğer açıklar** — o ana kadar biriken küçük bulgular

## Güvenlik Önlemi — Gerçek DB Yedeklemesi Kuruldu (1 Ekim)

Büyük Dalga işlerine girmeden önce kullanıcı talebiyle ("önlem al, iz bırak, yedekli gir, güvenliği artır") gerçek bir güvenlik ağı kuruldu.

**Keşif:** `cron/yedekleme` adı yanıltıcıydı — gerçek yedek ALMIYOR, sadece 5 kritik tablonun satır sayısını kontrol edip anormal düşüşte Telegram'a haber veriyor. Gerçek yedekleme tamamen Neon'un otomatik PITR'ına bırakılmıştı, ki bu ücretsiz planda sadece **6 saat** geriye gidebiliyor — büyük mimari değişiklikler için yetersiz bir güvenlik ağı.

**Ayrıca VPS'te önceden var olan `/root/karemux-yedek.sh`** (günlük 04:00, 14 gün saklama) **sadece kod/config dosyalarını** yedekliyor (server.js, nginx, systemd) — **asıl veritabanını hiç kapsamıyor**. Bu iki yedekleme birbirini TAMAMLIYOR, çakışma yok.

**Kurulan:** `/opt/karemux-deneme/yedek-al.mjs` — `public` şemadaki TÜM tabloları (bugün 76 tablo, 31.268 satır) JSON olarak `/opt/karemux-yedekler/<tarih>/` altına yedekliyor. VPS crontab'ına günlük 03:00'te otomatik çalışacak şekilde eklendi (`/root/karemux-db-yedek.sh`), 14 günden eski yedekler otomatik siliniyor.

**Yan bulgu (önemli, gelecek oturumlar için not):** Yedekleme script'i geliştirilirken, Neon'a `pg` (node-postgres/TCP) ile bağlanıldığında **bazen (nadir, muhtemelen cold-start/autosuspend sonrası) `search_path` boş geliyor**, bu da şema belirtmeden yapılan sorgularda "relation does not exist" hatasına yol açıyor. **Gerçek üretim uygulaması ETKİLENMİYOR** (Vercel'de `@neondatabase/serverless`'in HTTP tabanlı `neon()` sürücüsünü kullanıyor, farklı bağlantı yolu) — sadece VPS'ten `pg.Pool` ile yapılan doğrudan sorgular risk altında. **Önlem:** yedek script'i artık her çalıştırmada açıkça `SET search_path TO public` yapıyor VE şüpheli/hatalı sonuçları (0 satır veya herhangi bir tablo hatası) SESSİZCE başarılı raporlamak yerine sert hata (exit 1) olarak işaretliyor — önceki versiyon bu hatayı yutup yanlışlıkla "başarılı" demişti.

**Standart hale gelen alışkanlık:** Bundan sonraki her büyük Dalga adımından önce `ssh ... "/root/karemux-db-yedek.sh"` ile elle bir yedek daha tetiklenecek (günlük otomatik olana ek olarak, riskli işlemden hemen önce taze bir nokta için).
