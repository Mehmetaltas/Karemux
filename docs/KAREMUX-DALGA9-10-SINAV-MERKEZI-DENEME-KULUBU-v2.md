# KAREMUX — Sınav Merkezi + Deneme Kulübü Nihai Mimari Plan v2
1 Ekim 2026. Kullanıcının paylaştığı tam vizyon (43 madde), Dalga 9 ve 10 için.

## Kritik Karar: Fiziksel Sınav Tamamen Çıkarıldı
Önceki plandaki fiziksel sınav merkezi kavramı (salon, optik form, koordinat vb.) TAMAMEN kaldırıldı. "Merkez" artık **coğrafi istatistik/sıralama boyutu** (Türkiye→İl→İlçe→Mahalle), fiziksel bir yer değil. Tüm sınav oturumları ONLINE-FIRST.

## Ana Omurga
SINAV → OTURUM → ONLINE KATILIM → CEVAPLAR → SERVER-SIDE PUANLAMA → SONUÇ → SIRALAMA/İSTATİSTİK → ANALİZ → ÖĞRENME HAFIZASI → EKSİK/HATA → İÇERİK/TEK KONU/SORU/VİDEO → TELAFİ → TEKRAR ÖLÇÜM

## 10 Kritik Mimari Karar (sabitlendi)
1. Tüm sınav oturumları online, fiziksel sınav merkezi yok
2. MERKEZ = coğrafi/istatistiksel boyut
3. Öğrencinin sınav anındaki il/ilçe/kurum/sınıf bilgisi SONUÇLA BİRLİKTE SNAPSHOT olarak korunur (sonradan değişse bile eski kayıt bozulmaz)
4. Ücretsiz/ücretli erişim ile ulusal/il/ilçe/kurum kapsamı BİRBİRİNDEN BAĞIMSIZ
5. Tek sınav motoru, çok sayıda sınav türü (LGS Genel/Branş/Mini/Kazanım/Konu Tarama/Yeni Nesil/Süre/Simülasyon/Seviye Tespit/Özel/Kurum — hepsi aynı motor)
6. Puanlama SERVER-SIDE (öğrenci "18 net yaptım" diyemez, güvenlik prensibi seviye-tespitteki gibi)
7. Sonuç sadece net değil — sıralama+konu+öğrenme çıktısı+hata+süre analizi
8. Sınav Merkezi → Learning Memory → Content Core → Tek Konu → Telafi → Yeniden Ölçüm zinciri
9. Deneme Kulübü SINAV MOTORU DEĞİL — Sınav Merkezi+Abonelik+Entitlement+Akademik Takvim+Müdahale katmanı
10. **Entitlement kritik ayrım: abonelik bitince ACCESS sona erer ama LEARNING MEMORY KALIR**

## Veri Modeli (mantıksal, kod taramasından ÖNCE varsayılmayacak)
SINAV(tanım/tür/soru/erişim/kapsam/puanlama) → OTURUM(tarih/saat/süre/kurallar) → KATILIM(öğrenci/kurum/sınıf/coğrafi_snapshot/durum) → CEVAPLAR → PUANLAMA → SONUÇ(net/puan/sıralama/istatistik) → ANALİZ(konu/alt_konu/öğrenme_çıktısı/beceri/hata) → LEARNING MEMORY → CONTENT CORE → TELAFİ → TEKRAR ÖLÇÜM

## Erişim/Kapsam/Katılım AYRI eksenler (tek alan değil)
- **Erişim:** Ücretsiz/Ücretli/Abonelik/Kurumsal/Davet
- **Kapsam:** Ulusal/İl/İlçe/Kurum/Şube/Sınıf/Branş/Bireysel
- **Katılım:** Karemux Öğrencisi/Kurum Öğrencisi/Harici Katılımcı
- **Katılım yöntemi:** Online (şimdilik tek değer)

## Deneme Kulübü Entitlement (örnek)
exam_access, online_exam_access, analysis_access, result_access, ranking_access, remediation_access, learning_memory_access — abonelik bitince ACCESS'ler kapanır, learning_memory_access KALIR.

## Harici Katılımcı (referanstan alınan değerli fikir)
Hesapsız → Ücretsiz Sınav → Katıl → Sonuç. Sonra "Sonucumu Karemux'a Aktar" → hesap oluştur → sonuç eşleştir → Learning Memory. Kontrollü kullanıcı edinim kanalı.

## Dalga 9 Alt-Adımları (9.1-9.18)
9.1 Gerçek sistem taraması (mevcut route/tablo/scoring/katılım/sonuç/rapor/panel/Learning Memory/Content Core/Payment/Subscription/Entitlement/Deneme Kulübü parçaları) → 9.2 MEVCUT/EKSİK/DUPLİKE/ESKİ/HATALI/YENİ GEREKLİ sınıflandırması → 9.3 Tek sınav veri modeli → 9.4 Online oturum motoru → 9.5 Online katılım motoru → 9.6 Server-side scoring → 9.7 Sonuç motoru → 9.8 Coğrafi istatistik/sıralama → 9.9 Soru→kazanım→hata analizi → 9.10 Learning Memory entegrasyonu → 9.11 Content Core/Tek Konu entegrasyonu → 9.12-9.14 Öğrenci/Veli/Kurum paneli → 9.15 Harici katılımcı → 9.16 Ücretsiz/ücretli erişim → 9.17 Uçtan uca test → 9.18 Canlı doğrulama

## Dalga 10 Alt-Adımları (10.1-10.13)
10.1 Ürün tanımı → 10.2 Subscription bağlantısı → 10.3 Entitlement → 10.4 Deneme takvimi → 10.5 Akademik plan bağlantısı → 10.6 Haftalık rota → 10.7 Otomatik analiz → 10.8 Eksik→müdahale → 10.9 Tekrar ölçüm → 10.10 Veli görünürlüğü → 10.11 Kurum görünürlüğü → 10.12 KPI bağlantısı → 10.13 Ticari uçtan uca

## Güncellenmiş 10 Dalga Sırası (DEĞİŞTİ)
1/10 Abonelik Motoru → 2/10 Entitlement → 3/10 Paket Tasarımı → 4/10 Akademik Takvim → 5/10 Plan Motoru → 6/10 Content Core → 7/10 Mini Video Motoru → 8/10 5.350 Arşiv → **9/10 Sınav Merkezi (bu belge)** → **10/10 Deneme Kulübü (bu belge)** → Destek+SLA → Kota Uyarıları → Fiyat Bekçisi → Merkezi KPI → Live Academy → Ödev → Koçluk → YouTube → Diğer

## Mevcut Dalga 1 (Abonelik Motoru) ile Uyum — Çakışma YOK
Bugün (1 Ekim) kurulan `abonelikler.paket_id`, `getActiveAbonelik()`, `isYillikAboneMi()` bu plana zaten uyumlu bir TEMEL. Entitlement (Dalga 2) bunun ÜZERİNE "bu abonelik exam_access/analysis_access/... veriyor mu" gibi granüler hakları ekleyecek — mevcut yapıyı YIKMAYACAK, genişletecek. "ACCESS biter, LEARNING MEMORY kalır" ilkesi zaten `abonelik/iptal`'de doğru uygulanıyor (sadece `durum` güncelleniyor, öğrenci verisi hiç silinmiyor).

## Sıradaki Teknik Adım (kullanıcının kendi notu)
"Bu artık kodlama planıdır, fakat henüz kodlama başlaMAmıştır. Sonraki teknik adım: gerçek KAREMUX reposunu tarayıp 'Sınav Merkezi + Deneme Kulübü TARA RAPORU v1' çıkarmak; mevcut sistemi görmeden yeni tablo/route/API uydurmamak." — Dalga 9 sırası gelince uygulanacak.
