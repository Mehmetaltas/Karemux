# Sınav üretim mekanizmaları — güncel tarama (v2, 24 Ekim 2026)
Salt okuma taraması (grep ile kanıtlı). v1 (12 Ekim) sonrası değişenler: Faz E oturum uçları, ortak deneme çekirdeği ve tek konu modülü eklendi.

## 1. Bugünkü gerçek harita
| Mekanizma | Üretim kodu | Denetim (`sorulariDenetle`) | Günlük limit | Not |
|---|---|---|---|---|
| Seviye tespit (ilk) | `seviye-tespit/olustur` | var, eleme; hepsi elenirse hata | var | Denetim kendisi hata verirse tüm sorular geçer (fail-open) |
| Seviye tespit (onay) | `seviye-tespit/onay-sinavi-olustur` | var | var | Cache-önce, cevap anahtarı sunucuda |
| Ulusal / paket / ücretli deneme | `lib/ortak-deneme-uretimi.js` `denemeSorulariUret` (ortak) | var | yok (admin/cron tetikler) | `ulusalDenemeOlustur` ve `ucretliDenemeOlustur` bu çekirdeği zaten kullanıyor |
| Tek konu testi | `lib/tek-konu-sorulari.js` | var | oturum ucunda | Havuz önce, sonra üretim |
| Sınav oturumu (Faz E) | `sinav-oturumu/parti` | var, bütçe sınırlı | var | |
| Pratik oturumu (Faz E) | `pratik-oturumu/parti` | var | var | |
| Konu paketi | `konu-paketi` | var (2 yerde), bir kısmı gölge mod | var | Toplu üretimde limit başlığı ile atlanır |

AI sağlayıcısına doğrudan istek yalnızca `lib/ai.js`, `lib/rag.js` ve video yardımcı ucunda var; geri kalan her şey `aiCagir` üzerinden geçiyor.

## 2. Bulgular
1. Deneme tarafında ortaklaştırma zaten yapılmış (iki oluşturucu tek çekirdeği çağırıyor). "Ortak üretim çekirdeği" işi bu nedenle sıfırdan değil, **kalan parçaları** kapsıyor: seviye tespit ikilisi, tek konu ve oturum uçları.
2. Denetim her yerde aynı fonksiyonu kullanıyor ve hata durumunda sorular geçiyor (fail-open). Bu bilinçli bir tasarım; ancak bugün keşfedilen indeks eşleme hatası gibi bir kusur **tüm soruları eleyebiliyordu**. Düzeltildi (24 Ekim).
3. Konu paketinde bazı denetimler gölge mod; v1 raporundaki 8. davranış hâlâ geçerli: eleme ve gölge modu bilinçli ayrı kalmalı.
4. Günlük limit deneme oluşturucularda yok; bu admin/cron tetikli olduğu için şu an risk değil.

## 3. Önerilen uygulama (AI çağrı sayısı ve maliyet değişmeden)
1. Ortak yardımcı: "ham soru → format doğrula → denetle → cevap anahtarını ayır" adımı tek fonksiyonda toplansın (`lib/soru-hatti.js`). Üretim promptları ve cache mantığı çağıranlarda kalır.
2. Geçiş sırası (düşük riskli önce): tek konu → sınav/pratik oturumu → seviye tespit ikilisi. Her adımdan sonra öğrenci testi + cevap anahtarı sızıntı testi.
3. Konu paketi gölge/eleme ayrımı bu işin dışında kalır.
4. Her adım için kabul ölçütü: aynı girdide çıktı alanları birebir aynı, AI çağrı sayısı aynı, `dogruIndex` istemciye gitmiyor.

## 4. Durum (27 Ekim)
- Yapıldı: `lib/soru-hatti.js` `hamdanDenetliye` (süzgeç → denetim → asgari eşik). Tek konu ve ortak deneme çekirdeği buna geçti; hata iletileri ve eşikler birebir aynı, AI çağrı sayısı aynı.
- Seviye tespit ilk uç: 2 deneme ile sertleştirildi, kendi ders/ünite biçimi nedeniyle ayrı kaldı.
- Bilerek ayrı kalanlar: sınav/pratik oturumu (bütçe sınırlı denetim, Vercel süre payı), konu paketi gölge modu.
