# KAREMUX — İşletme Kurma, İşletme ve Para Kazanma Yol Haritası
Oluşturulma: 29 Eylül 2026. Bakış açısı: "bu işi kuran, işleten ve kâr eden sahibi" — mevcut koda göre değil, olması gereken tam işletmeye göre.

## Nasıl Okunmalı
Bu belge 3 katmanı ayırır: (A) TEKNİK — kod/altyapı, (B) TİCARİ+HUKUKİ — para/sözleşme/şirket, (C) OPERASYON+YÖNETİM — günlük işletme. Full System Audit (FULL-AUDIT-TAKIP.md) sadece (A)'yı kapsıyordu. Bu belge üçünü birleştirir.

---

## 1. ŞU AN NEREDEYİZ — Gerçek Envanter (29 Eylül)

**Teknik:** Ürün olgun. 46/46 kategori audit edildi. 2 kritik launch engeli bugün kapandı (Content Core onay bug'ı, Veli+Kurum 2FA). 3 açık kalan: Öğretmen 2FA (yarım, devam ediyor), Accessibility gerçek cihaz testi, KVKK danışmanı, Vercel Pro geçişi.

**Ticari:** 0 gerçek müşteri, 0 gerçek gelir. Havale altyapısı çalışıyor (kişisel banka hesabına), kart ödemesi (İyzico) yok — sözleşme başvurusu yapılmadı. Fiyatlandırma var ama gerçek maliyetle hiç doğrulanmadı (bugün AI maliyeti düzeltildi, sabit gider hâlâ elle takip).

**Hukuki:** Gizlilik Politikası ✅, Kullanım Şartları ✅, Mesafeli Satış Sözleşmesi ✅, İletişim ✅ — dördü de VAR. Ama hiçbiri bir hukuk danışmanı tarafından incelenmedi. Şirket yapısı (şahıs mükellefi mi, Ltd mi, hiçbiri mi) belirsiz — ödeme kişisel hesaba gidiyor.

**Muhasebe:** Hiç yok. E-fatura/e-arşiv entegrasyonu yok. Gelir-gider `giderler` tablosunda kısmen tutuluyor (AI maliyeti gibi), ama gerçek bir defter/mali kayıt sistemi yok.

**Operasyon:** Tek kişi (sen) + Claude. Destek route'u var ama hiç kullanılmadı/test edilmedi. SLA/cevap süresi kavramı yok.

**Altyapı maliyeti:** Aylık ~2.030 TL (Claude Pro+telefon+internet+Contabo+Anthropic), launch'ta ~3.040 TL'ye çıkacak (Vercel Pro dahil). Detay: hafızada `karemux-maliyet.md`.

---

## 2. (A) TEKNİK — Kapanması Kesin Gereken (Launch Engeli)

1. **Öğretmen 2FA** — ayrı `ogretmenler` tablosu, yeni sütun+endpoint+ekran gerekiyor. Yarım kaldı, devam edilecek.
2. **Accessibility gerçek cihaz testi** (TalkBack/VoiceOver) — SENİN elinde.
3. **KVKK danışmanı** — Neon ABD'de (Ohio), Gemini ücretsiz katman veri kullanımı, 4 hukuki sayfanın incelenmesi — SENİN elinde.
4. **Vercel Pro geçişi** — ilk ödemeyle (karar verildi, bekliyor).
5. **İyzico sözleşmesi** — kart ödemesi olmadan gerçek ölçekte satış zor. SENİN elinde.

## 3. (A) TEKNİK — Launch Engeli Değil Ama Yakında Gerekecek

- Content Core'un gerçek merkezi mimarisi (bugün sadece bir sızıntı kapatıldı, sistemin kendisi hâlâ dağınık — soru_bankası/icerik_onbellek/konu_paketi/ders_plani ayrı)
- Abonelik motoru ayrımı (kullanıcı≠paket≠abonelik≠ödeme) — bugün pasted gelen v3 mimarisinin kalbi
- Akademik Takvim + Yıllık/Aylık/Haftalık Plan hiyerarşisi
- Mini Video Fabrikası (6-7dk format)
- 5.350 içerik arşivi (batch üretim, maliyet ölçülmeden BAŞLANMAYACAK)
- Sınav Merkezi'nin tek motora indirgenmesi (şu an O.Deneme Motoru zaten bunun temeli)
- Entitlement (ürün→hak) sistemi
- Paket Tasarım Merkezi (admin arayüzü)

## 4. (B) TİCARİ + HUKUKİ — Hiç Ele Alınmamış, Gerçek İşletme İçin Zorunlu

### 4.1 Şirket Yapısı (öncelik: YÜKSEK, kod işi DEĞİL)
Şu an ödeme kişisel banka hesabına gidiyor. Karar verilmesi gerekenler:
- Şahıs şirketi mi açılacak, yoksa mevcut bir yapı (Natro faturasındaki Mehmet Altaş bireysel mükellef görünüyor) üzerinden mi ilerlenecek?
- Basit usul mü gerçek usul mü, KDV mükellefiyeti gerekiyor mu?
- E-fatura/e-arşiv zorunluluğu hangi ciro eşiğinde başlıyor — muhasebeciye sorulmalı.
**Bu belgenin en kritik SENİN aksiyonun.** Diğer her şey (fatura kesme, gelir raporu, vergi) buna bağlı.

### 4.2 Ödeme Altyapısı Genişletmesi
- İyzico (kart) — sözleşme bekliyor
- Havale — çalışıyor ama kişisel hesap, şirket kurulunca kurumsal hesaba taşınmalı
- Muhasebe entegrasyonu (Paraşüt/Logo/manuel) — hiç yok, şirket kararından SONRA seçilecek

### 4.3 İade/İptal Sistemi (bugünkü v3 raporundan)
Kodda "İlk Hafta Memnuniyet Garantisi" (7 gün) metin olarak var ama sistem kuralı değil — otomatik iade akışı, iptal≠iade ayrımı, muhasebe kaydı entegrasyonu hiç kodlanmadı.

### 4.4 Hukuki İnceleme
4 sayfa (gizlilik/kullanım şartları/mesafeli satış/iletişim) var ama hiçbiri avukat/danışman onayından geçmedi. Ayrıca: öğretmen sözleşmesi (bağımsız yüklenici mi, nasıl?), KVKK aydınlatma metni öğrenci verisi (reşit olmayanlar) için yeterli mi — özellikle çocuk verisi hassasiyeti nedeniyle önemli.

## 5. (C) OPERASYON + YÖNETİM — Hiç Kurulmamış Sistemler

### 5.1 Destek Sistemi
`app/api/destek` + `app/api/admin/destek` route'ları var ama gerçek kullanımda hiç test edilmedi, SLA yok, kimin baktığı/ne sıklıkla cevaplandığı belirsiz.

### 5.2 Raporlama Ritmi (öneri, henüz kurulmadı)
- **Günlük (otomatik, zaten var):** health check, öğretmen/öğrenci test sonucu, içerik tutarlılık denetimi
- **Günlük (senin bakman gerekir):** Gemini/Groq/Anthropic kota durumu, yeni kayıt sayısı, hata bildirimleri
- **Haftalık:** gelir-gider (varsa), içerik onay kuyruğu durumu (icerik_onbellek'teki onaysız kayıtlar birikmesin), destek talepleri
- **Aylık:** Neon/Vercel kullanım-maliyet karşılaştırması, resmi fiyat sayfası değişiklik kontrolü (Gemini 2027 fiyat artışı gibi), KPI özeti

### 5.3 Merkezi KPI Panosu (yok)
Şu an admin'de parça parça veri var (kullanıcı/abone sayıları, maliyet ekranı) ama tek bir "CEO görünümü" yok. Bugünkü v3 raporunun önerdiği KPI'lar: Ticari (ARPU/LTV/CAC/churn) · Akademik (plan uyumu/öğrenme başarısı) · Operasyon (destek süresi) · Teknoloji (AI maliyet/uptime).

### 5.4 Otomasyon (kısmen başladı)
Bugün AI maliyet formülü gerçek fiyat+canlı kura bağlandı. Eksik: kota eşik uyarısı (Telegram altyapısı hazır, `yedekleme` cron'undaki desen kopyalanabilir), fiyat sayfası değişim bekçisi (haftalık, resmi sayfaları karşılaştırıp Telegram'a haber verir).

---

## 6. PARA KAZANMANIN YOLLARI — Netleştirilmiş Gelir Modelleri

| Ürün | Durum | Not |
|---|---|---|
| Bireysel Eğitim (yıllık 5.000₺) | Kodda hazır | Gerçek maliyetle doğrulanmadı |
| Deneme Kulübü (3 seviye) | Canlı test edildi | Fiyat maliyet-doğrulama BEKLİYOR |
| Kurum lisansı | Kod var, kısmen test | Koltuk bazlı fiyatlandırma var |
| Canlı Ders/Kamp/Koçluk | Altyapı var (jitsi) | Fiyat listesi var, gerçek kullanım yok |
| Öğretmen materyal satışı | Yok | v3 raporunda önerilmedi, düşünülebilir |

**Kart ödemesi olmadan (İyzico bekliyor) ölçek büyümez** — havale, güven eşiği düşük kullanıcı için sürtünme yaratır.

---

## 7. ÖNCELİK SIRASI — Şimdi Ne Yapmalı (senin + benim aksiyonlarım ayrı)

### Benim yapabileceğim (kod):
1. Öğretmen 2FA'yı bitir (yarım kaldı)
2. Kota eşik uyarısı (Telegram) — hazır altyapıyı kullanarak hızlı
3. Fiyat sayfası değişim bekçisi
4. Abonelik motorunun ilk taslağı (kullanıcı≠paket≠abonelik ayrımı) — büyük iş, ayrı oturum

### Senin yapman gereken (kod değil):
1. **Şirket yapısı kararı** — her şeyin önkoşulu
2. İyzico başvurusu
3. KVKK danışmanı + 4 hukuki sayfanın incelemesi
4. Accessibility gerçek cihaz testi
5. Muhasebe sistemi seçimi (şirket kararından sonra)

**Gerçek sıra:** Şirket yapısı → İyzico + Muhasebe → KVKK incelemesi → Accessibility → (paralel) Öğretmen 2FA + otomasyonlar → Pilot (10-20 gerçek kullanıcı) → Soft Launch → Public Launch.
