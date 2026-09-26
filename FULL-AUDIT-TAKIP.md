# KAREMUX MASTER SYSTEM AUDIT — Takip Belgesi
Oluşturulma: 25 Eylül 2026. Bu dosya repo'da kalıcı, her oturumda güncellenir.

## Yöntem
TARA → ÖLÇ → DOĞRULA → RAPORLA → SONRA GELİŞTİR.

## Her Madde İçin 15 Soru
1.Var mı? 2.Çalışıyor mu? 3.Gerçek veriyle çalışıyor mu? 4.Başka sisteme bağlı mı? 5.Paralel/duplicate sistem var mı? 6.Yetim kayıt var mı? 7.Yetki kontrolü var mı? 8.Öğrenci verisi doğru yere akıyor mu? 9.Content Core'a bağlı mı? 10.Learning Memory'ye bağlı mı? 11.Raporlanabiliyor mu? 12.Ticari olarak ölçülebiliyor mu? 13.Mobilde çalışıyor mu? 14.Production'da çalışıyor mu? 15.Launch'a engel mi?

## Rapor Formatı (her madde bitince)
Alan · Tespit · Dosya/API/tablo · Gerçek kaynak · Mevcut davranış · Bağımlılık · Eksik bağlantı · Risk · Önerilen düzeltme · Test.

## Durum Anahtarı
✅ TAMAMLANDI (organik veya sistematik, kanıtlı) · 🔶 KISMEN (bazı sorular cevaplı) · ⬜ HİÇ BAŞLANMADI

---

## A-N: Temel Sistem (14)
- [ ] A. Altyapı — ⬜
- [ ] B. Auth — ⬜
- [ ] C. Öğrenci — ⬜
- [ ] D. Veli — 🔶 (25 Eylül: Deneme Kulübü ödeme akışı canlı test edildi)
- [ ] E. Kurum — 🔶 (24-25 Eylül: Kurum Denemesi tam test edildi, sıralama bug'ı düzeltildi; ama Kurum'un GENEL 15 soru taraması yapılmadı)
- [ ] F. Öğretmen — 🔶 (25 Eylül: Akademi kapsam kararı verildi/kapalı; materyal-uret Kalite Motoru'na bağlandı; ama Öğretmen'in GENEL 15 soru taraması yapılmadı)
- [ ] G. Personel — ⬜
- [ ] H. Müfredat — 🔶 (Maarif Modeli doğruluğu doğrulandı, 107 kayıt düzeltildi; ama tam 15 soru taranmadı)
- [ ] I. Content Core — ⬜ (sadece tasarım var, gerçek denetim yok)
- [ ] J. Soru Bankası — 🔶 (yetim/duplicate tarandı, 713 yetim bulundu+kısmen düzeltildi; tam 15 soru değil)
- [ ] K. Tek Konu — 🔶 (3 paralel akış bulundu, ana halka birleştirildi; tam 15 soru değil)
- [ ] L. Ödev — ⬜
- [ ] M. Ders Planı — 🔶 (60sn zaman aşımı bulundu/düzeltildi; tam 15 soru değil)
- [ ] N. Yazılı — ⬜

## O-V: Sınav Merkezi (8) — EN ÇOK ÇALIŞILAN ALAN
- [x] O. Deneme Motoru — ✅ TAMAMLANDI (24-25 Eylül: VPS mimarisi keşfedildi, 2 kritik bug — çerez Domain + JWT_SECRET — düzeltildi, uçtan uca kanıtlandı)
- [x] P. Deneme Kulübü — ✅ TAMAMLANDI (25 Eylül: 3 seviye kuruldu, öğrenci+veli+admin akışları uçtan uca canlı test edildi)
- [ ] Q. Türkiye Geneli Sınav — 🔶 (VPS keşfiyle örtüşüyor, O ile birleşik ama ayrı 15 soru geçilmedi)
- [ ] R. Yerel Sınav — ⬜ (kod var — `kapsam='yerel'` — ama HİÇ test edilmedi)
- [x] S. Kurum Sınavı — ✅ TAMAMLANDI (24-25 Eylül: kurum satın alma+öğrenci akışı+sıralama bug'ı, uçtan uca)
- [ ] T. Harici Katılımcı — ⬜ (MASTER v2'nin "hesabı olmadan katıl, sonra taşı" konsepti — hiç kodlanmadı)
- [x] U. Bireysel Katılım — ✅ (Deneme Kulübü = bireysel katılım, P ile aynı)
- [ ] V. Kurumsal Katılım — 🔶 (Kurum lisans satın alma var — kodda görüldü — ama test edilmedi)

## W-AD: Öğrenme + Gelişmiş Özellikler (8)
- [ ] W. Öğrenme Hafızası — ⬜
- [ ] X. Video — ⬜
- [ ] Y. YouTube — ⬜ (20 videoluk takvim var, hiç video üretilmedi)
- [ ] Z. AI — 🔶 (aiCagirDetay/zaman bütçesi/sağlayıcı sırası çok test edildi ama resmi 15 soru değil)
- [ ] AA. Grafik Motoru — 🔶 (Görsel Motoru 3 route'a bağlandı, ama resmi 15 soru değil)
- [ ] AB. Koçluk — ⬜ (kendi-kendine-bildirim sorunu biliniyor, çözülmedi)
- [ ] AC. Teacher Academy — 🔶 (25 Eylül: kapsam kararı verildi — dar, zaten mevcut — ama 15 soru resmi değil)
- [ ] AD. Live Academy — ⬜

## AE-AT: Ticari + Operasyonel (18)
- [ ] AE. Ödeme — 🔶 (25 Eylül: havale+paketler+abonelikler akışı çok test edildi, İyzico kod-doğrulandı ama canlı değil)
- [ ] AF. Ürün/Paket — 🔶 (Deneme Kulübü paketleri eklendi)
- [ ] AG. Fiyatlandırma — 🔶 (25 Eylül: eski A/B/C tutarsızlığı bulundu/düzeltildi)
- [ ] AH. Satış — ⬜
- [ ] AI. Pazarlama — 🔶 (25 Eylül: tanıtım sayfasında 2 hata bulundu/düzeltildi)
- [ ] AJ. Destek — ⬜
- [ ] AK. Güvenlik — 🔶 (SSRF/kurum logosu düzeltildi, çerez/JWT bugları düzeltildi — dağınık, resmi tarama değil)
- [ ] AL. KVKK/Hukuk — ⬜ (kullanıcının kendi aksiyonu bekleniyor)
- [ ] AM. APK/Mobil — ⬜
- [ ] AN. Accessibility — ⬜
- [ ] AO. CI/CD — 🔶 (GitHub Actions öğretmen+öğrenci testleri var, resmi 15 soru değil)
- [ ] AP. Company Twin — ⬜
- [ ] AQ. Finans — ⬜
- [ ] AR. Operasyon — ⬜
- [ ] AS. KPI — ⬜
- [ ] AT. Launch Readiness — ⬜

---

## Sıradaki Adım
Hiçbir kategori "resmi 15 soru" formatıyla TAM bitmedi — hepsi organik/kısmi. Sistematik tarama, EN AZ dokunulmuş kategorilerden (A.Altyapı, B.Auth, G.Personel, I.Content Core) başlamalı.
