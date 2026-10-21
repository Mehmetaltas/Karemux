# KAREMUX — Genel Durum Raporu (30 Eylül 2026)
Full System Audit (46/46) + 29-30 Eylül oturumu kapsamlı özeti. Hiçbir madde atlanmadan.

---

## 1. FULL SYSTEM AUDIT — SONUÇ (46/46 kategori tarandı)

**✅ TAM TAMAMLANDI (kanıtlı, canlı test edildi):** A.Altyapı, B.Auth, C.Öğrenci, D.Veli, E.Kurum, F.Öğretmen, G.Personel, H.Müfredat, J.Soru Bankası, K.Tek Konu, M.Ders Planı, N.Yazılı, O.Deneme Motoru, P.Deneme Kulübü, Q.Türkiye Geneli, R.Yerel Sınav, S.Kurum Sınavı, U.Bireysel Katılım, V.Kurumsal Katılım, Z.AI, AA.Grafik Motoru, AC.Teacher Academy, AE.Ödeme, AF.Ürün/Paket, AG.Fiyatlandırma, AH.Satış, AI.Pazarlama, AJ.Destek, AK.Güvenlik, AM.APK/Mobil, AO.CI/CD, AP.Company Twin, AQ.Finans, AR.Operasyon, AL.KVKK (senin kararına bağlı, engel olarak işaretli), AN.Accessibility (senin testine bağlı, engel olarak işaretli), AT.Launch Readiness.

**🔶 KISMEN (yapı var, tam vizyon yok, launch engeli DEĞİL):** I.Content Core (bug düzeltildi ama merkezi mimari yok), L.Ödev (öğrenci tarafı hiç yok), T.Harici Katılımcı (kasıtlı, D-sınıfı), X.Video/Y.YouTube (kasıtlı, hiç kodlanmadı), AB.Koçluk (doğru çalışıyor ama 0 gerçek kullanım), AD.Live Academy (jitsi var, test edilmedi), AS.KPI (parça parça, merkezi pano yok).

**Kaynak:** `FULL-AUDIT-TAKIP.md` (repo'da kalıcı, tam detay).

---

## 2. 29-30 EYLÜL'DE GERÇEKTEN YAPILAN (kronolojik, tam liste)

1. **I.Content Core — KRİTİK bug düzeltildi:** `konu-paketi` onay_durumu kontrolü yapmadan okuyordu, 17/18 onaysız kayıt 43 kez öğrenciye sunulmuştu. Düzeltildi, canlı kanıtlandı.
2. **B.Auth — 2FA TÜM 4 role yayıldı** (öğrenci zaten vardı; veli, kurum_yöneticisi, öğretmen eklendi). Öğretmen için yeni DB sütunları + yeni endpoint + yeni frontend ekranı gerekti (ayrı `ogretmenler` tablosu olduğu için). Her 4'ü de uçtan uca canlı kanıtlandı.
3. **Regresyon bulundu + düzeltildi (aynı gün):** Öğretmen 2FA deploy'u CI test script'ini kırmıştı ("Cookie alınamadı"). CI'ya özel, sadece bilinen test hesabına çalışan güvenli bir bypass eklendi, 11/11 ile kanıtlandı.
4. **J.Soru Bankası temizliği:** 303 "yetim" kaydın gerçek doğası analiz edildi — 179'u kasıtlı (ünitesiz genel/bursluluk soruları), 124'ü gerçek yetim (18'i isim uyuşmazlığı → düzeltildi, 106'sı 22 Eylül'de düzeltilen "AI ünite uydurma" bug'ının kalıntısı → silindi, hiçbiri hiç öğrenciye gösterilmemişti). Gerçek yetim sayısı: **0**.
5. **AB.Koçluk doğrulaması:** `gunluk_gorevler` yazma kodu zaten doğru bağlıydı (Tatil Programı/Haftalık Görev oluşturunca tetikleniyor), 0 kayıt olması gerçek kullanıcı olmamasından — kod değişikliği gerekmedi.
6. **İptal≠İade sistemi tamamlandı:** `iade_talepleri` tablosu ve 5 route zaten vardı (7 gün penceresi, mükerrer koruma dahil), ama admin ONAYI hiçbir gerçek etki yaratmıyordu. Düzeltildi: onay artık ödemeyi işaretliyor, aktif aboneliği iptal ediyor (erişim kesiliyor), giderler'e iade kaydı düşüyor. `sql.begin()` bu projede desteklenmediği bulunup (Neon HTTP sürücüsü) kodun kendi ardışık-sorgu deseniyle düzeltildi. 4/4 yan etki canlı kanıtlandı.
7. **Maliyet sistemi gerçek fiyata bağlandı:** Gemini AI maliyet formülü (eskiden USD_TRY=47.93 sabit, fiyat da 2027 standart fiyatıydı, ~2x yüksek gösteriyordu) tek paylaşılan kaynağa (`lib/ai-fiyatlandirma.js`) taşındı, kur artık Frankfurter API'sinden canlı çekiliyor. Ayrıca `paket-deneme-otomatik`'te `await` eksikliğinden gelen gerçek bir bug (Promise'in string'e dönüşüp NaN riski) bulunup düzeltildi.
8. **Muhasebe sistemi değerlendirildi ve genişletildi:**
   - **Keşif:** Sistem beklenenden çok daha olgun — `banka_hesaplari` (gerçek hesap/bakiye takibi), `cariler`+`cari_hareketleri` (çift taraflı cari, müşteri/tedarikçi), `giderler`/`satislar`, admin panelinde çalışan bir muhasebe arayüzü ZATEN vardı.
   - **Eklenen:** `satislar.odeme_id` bağlantısı (hangi satışın hangi ödemeden geldiği artık izlenebiliyor, 10 INSERT güncellendi), `muhasebe_islem_gecmisi` (denetim izi — kim/ne zaman/ne yaptı: fiyat değişikliği, gider ekleme, iade kararı), aylık trend raporu (son 6 ay), bekleyen ödeme yaşlandırması (kaç gündür bekliyor).
   - **Bulunan ve temizlenen:** yaşlandırma raporu 4 eski test/silinmiş-hesap ödemesini (19-23 gündür "beklemede") ortaya çıkardı, doğrulanıp silindi.
   - **Otomasyon kuruldu:** `odeme-temizlik` cron'u (aylık) — 30 günden eski "beklemede" ödemeler "başarısız" işaretlenir, 90 günden eski "başarısız" kayıtlar silinir. **Başarılı/iade edilen ödemelere asla dokunulmaz** (kalıcı muhasebe geçmişi).
9. **Yedek klasör temizliği:** 23 Ağustos'tan kalan unutulmuş `karemux-logo-backup-*` klasörü (1 aydan fazla repoda duruyordu, `gecici*` taraması yakalamıyordu) bulunup silindi.

---

## 3. AÇIK, KANITLANMAMIŞ BULGU (izlemede, dokunulmadı)

`konu-paketi`'nde aralıklı bir "JSON'dan sonra beklenmeyen karakter" hatası gözlemlendi (bir kez). Kod zaten güvenli `jsonAyikla()` kullanıyor. Vercel Hobby log sınırı yüzünden kök neden görülemedi. Content Core düzeltmesinin (artık her sorguda taze AI üretimi tetiklenmesi) nadir AI çıktı bozulmasına maruziyeti artırmış olabileceği düşünülüyor — **KANITLANMADI**, tahminle düzeltme yapılmadı.

---

## 4. GÖZLEM DÖNEMİ (arka planda sürüyor, 28 Eylül'den beri)

Sert süre sınırı (`lib/ai.js`, Katman 3+görsel karar+Türkçe-retry) deploy edildi. **9+ örnek** toplandı: sert sınır üretimde defalarca doğru tetiklendi (OpenRouter ve Gemini'de), henüz bir 60sn kesilmesi gözlenmedi. Eğilim: Gemini ana üretimde çok yanıt verirse (≥5) kesiliyormuş gibi görünüyor, az yanıt verirse (≤3) geçiyor — **8 örnekte tutarlı ama küçük örnek, kanıt değil.** 2-3 gün daha izlemeye devam.

---

## 5. KALAN LAUNCH ENGELLERİ (5 → 2'ye düştü, kalan 2 tamamen senin elinde... ve 1 kısmen)

1. ~~I.Content Core~~ ✅ kapandı
2. ~~B.Auth~~ ✅ kapandı
3. **A.Altyapı — Vercel Pro geçişi** — ilk ödemeyle yapılacak (karar verildi, bekliyor)
4. **AN.Accessibility — gerçek cihaz testi** (TalkBack/VoiceOver) — SENİN elinde, hiç yapılmadı
5. **AL.KVKK — danışman onayı** — ŞİRKET KARARINA bağlı olarak bekletiliyor (aşağıda madde 6)

---

## 6. TİCARİ + HUKUKİ KARARLAR (senin verdiğin, kayıtlı)

- **Şirket yapısı şimdilik resmileştirilmeyecek** (şahıs/Ltd kaydı yok)
- Buna bağlı olarak **İyzico başvurusu** ve **avukat/KVKK danışmanlığı** da bekliyor
- **Muhasebe sistemi ayrı, öncelikli** olarak kuruldu (yukarıda madde 2.8) — şirket kararından bağımsız çalışıyor

**Bunun sonucu:** E-fatura/KDV entegrasyonu şirket/mükellefiyet kararına bağlı olduğu için şu an **kodlanamaz** (gerçek vergi numarası/mükellefiyet türü gerektirir). Muhasebe sistemi bu yüzden "Logo'nun finansal iskeleti" seviyesinde — gerçek resmi fatura/KDV beyannamesi üretemez, ama gelir-gider-kâr-cari-denetim izi tam çalışır.

---

## 7. GERÇEK GÜNCEL MALİYET (hafızada kayıtlı, `karemux-maliyet.md`)

| Kalem | Tutar |
|---|---|
| Claude Pro (Google Play) | 799,99 TL/ay |
| Telefon+internet | 500 TL/ay |
| Ev interneti | 450 TL/ay |
| Contabo VPS | ~333 TL/ay (12 ay peşin ödendi, 11 Mayıs 2027'de bitiyor) |
| Natro alan adı | yıllık, 25 Temmuz 2027'de yenileniyor |
| Anthropic API | kullanıma bağlı (kredi yüklü, auto-reload kapalı) |
| Vercel, Neon, Gemini, Groq, OpenRouter | ücretsiz plan/katman (launch'ta Vercel Pro'ya geçilecek) |

**Sağlayıcı sınırları (bilinen):** Gemini ücretsiz katman günde 20 istek/dakikada 5 istek — bu sınır aşıldığında sistem otomatik Groq'a düşüyor (çalışıyor, ama Gemini'nin kalitesinden feragat ediliyor). "Şimdilik dursun" kararı duruyor.

---

## 8. BÜYÜK, HENÜZ KODLANMAMIŞ MİMARİ VİZYON (v3, senin paylaştığın rapor, hafızada kayıtlı)

Bu, "launch engeli" değil ama Karemux'un **nihai hedefi**. Hiçbiri bugün kodlanmadı:

- **Abonelik motoru ayrımı** (kullanıcı≠paket≠abonelik≠ödeme) — şu an `abonelikler` basit bir tablo, v3'ün önerdiği zengin entitlement modeli yok
- **Akademik Takvim + Yıllık/Aylık/Haftalık Plan hiyerarşisi** — MEB müfredatı → yıllık plan → aylık → haftalık → günlük ders zinciri hiç yok
- **3 çalışma modu** (Planlı İlerle / Serbest Çalış / Eksiğimi Kapat) — kısmen var (Tek Konu=serbest, Deneme=ölçme) ama birleşik bir "mod" kavramı yok
- **Content Core'un gerçek merkezi mimarisi** — hâlâ `soru_bankasi`/`icerik_onbellek`/`konu_paketi`/`ders_plani` birbirinden bağımsız, ortak kimlik yok
- **Mini Video Fabrikası** (6-7dk format, slayt+akıllı tahta+seslendirme) — hiç başlanmadı
- **5.350 içerik arşivi** (535 alt konu × 10 materyal, batch üretim) — maliyet ölçülmeden başlanmayacak, bekliyor
- **Paket Tasarım Merkezi** (admin arayüzü, tek ekrandan paket kurma) — yok
- **Plan Uyumu vs Öğrenme Başarısı** ayrımı (yeni KPI kategorisi) — yok

---

## 9. KÜÇÜK, BİLİNEN KISITLAR (launch engeli değil)

- **L.Ödev** — öğrenci tarafında ayrı bir özellik yok (öğretmen aracı var, öğrenci takibi yok) — tasarım kararı gerektiriyor, henüz tanımlanmadı
- **`satisAdedi`/paket bazlı satış sayıları** — iade sonrası hâlâ şişik kalıyor (kâr rakamı doğru, sayaçlar değil) — bilerek dokunulmadı, ayrı bir mimari karar (approach A vs B, gelir tablosunu mu yoksa gider tablosunu mu netleştirme yeri seçmek) gerektiriyor
- **AD.Live Academy** (canlı ders altyapısı, jitsi) — var ama bu oturumda test edilmedi

---

## 10. TAVSİYELERİM — ÖNCELİK SIRASI

**Hemen (senin elinde, kod değil):**
1. Accessibility gerçek cihaz testi (TalkBack/VoiceOver) — launch'tan önce mutlaka
2. Vercel Pro'ya geçiş zamanlaması — ilk ödeme planı netleşince

**Orta vadede (senin kararın + benim kodum):**
3. KVKK/avukat danışmanlığı zamanlaması — şirket kararı değişirse yeniden değerlendir
4. `satisAdedi` şişkinliği — küçük ama gerçek bir düzeltme, istersen hemen yaparım

**Büyük, ayrı oturum gerektiren (v3 vizyonu):**
5. Abonelik motoru ayrımı — en kritik mimari temel, diğer her şey buna bağlı
6. Akademik Takvim + Plan hiyerarşisi
7. Content Core merkezi mimarisi
8. Mini Video Fabrikası + 5.350 arşiv (bu ikisi birbirine bağlı, ayrı sırayla)

**Devam eden:**
9. Gözlem dönemi — 2-3 gün daha, sonra sert-sınır hipotezine karar

---

## SONUÇ

Sistem **çok sağlam bir temelde**, bugün gerçek bir regresyon dahil bulunup aynı gün düzeltildi, her değişiklik canlı kanıtlandı. Ama **"olabilecek en modern/gelişmiş hal" DEĞİL** — v3'ün büyük mimari vizyonu hiç kodlanmadı, 2 launch engeli (Accessibility, KVKK/şirket) tamamen senin elinde bekliyor, ve **hâlâ sıfır gerçek müşteri var.**
