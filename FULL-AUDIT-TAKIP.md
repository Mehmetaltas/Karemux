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
- [x] A. Altyapı — ✅ TAMAMLANDI (29 Eylül: 15 sorunun 12si canli kanitla cevaplandi. Launch engeli 3 madde: Vercel Hobby ticari kullanima kapali, Neon hesaplama %27 dolu, log saklama 1 saat)
- [x] B. Auth — ✅ TAMAMLANDI (29 Eylul: gercek kod okumasiyla. Launch engeli: 2FA SADECE ogrencide, veli/kurum/ogretmen tek-adimli kaliyor - guvenlik tutarsizligi)
- [ ] C. Öğrenci — ⬜
- [x] D. Veli — ✅ TAMAMLANDI (25-28 Eylul: veli-hesap-olustur+havale-baslat uctan uca canli test edildi, gercek kanit)
- [x] E. Kurum — ✅ TAMAMLANDI (24-29 Eylul: satin alma+ogrenci akisi+siralama bug'i canli test edildi. DB: 3 kurum/3 ogretmen, hepsi test hesabi, gercek musteri YOK)
- [x] F. Öğretmen — ✅ TAMAMLANDI (25-29 Eylul: materyal-uret 11 arac Kalite Motoru'na bagli, gunluk otomatik test aktif, Akademi kapsam karari verildi/kapali)
- [x] G. Personel — ✅ TAMAMLANDI (29 Eylul: 8 route+lib/personel.js+DB, admin panelinden gercekten cagriliyor. 2 kayit var, ikisi de Mehmet ama FARKLI epostalarla (karemuxegitim@/42mehmetaltas@) - bilincli mi net degil, kullaniciya soruldu. Gercek calisan/personel henuz yok, launch engeli DEGIL)
- [x] H. Müfredat — ✅ TAMAMLANDI (29 Eylul: DB'den dogrulandi - 4.ve 8.sinif eski_2018 (107+108 kayit), 5/6/7 yeni_maarif_2024 (107+111+102) - TAM DOGRU)
- [ ] I. Content Core — ⬜ (sadece tasarım var, gerçek denetim yok)
- [x] J. Soru Bankası — ✅ TAMAMLANDI (29 Eylul: 4649 kayit, 303 yetim KALDI (713'ten dustu, retroaktif duzeltilmedi - bilinen sinir). Launch engeli DEGIL, ileride retroaktif temizlik onerilir)
- [x] K. Tek Konu — ✅ TAMAMLANDI (29 Eylul: tekKonuBaslat DOGRULANDI - TEK konu secildiginde konu-paketi'ye gidiyor, Kalite+Gorsel Motoru'ndan faydalaniyor. Coklu konu eski akista, bilincli/guvenli)
- [ ] L. Ödev — ⬜
- [x] M. Ders Planı — ✅ TAMAMLANDI (29 Eylul: bugunku sert-sinir duzeltmesinden (lib/ai.js) otomatik faydalaniyor - ikinciGorusAl+20000ms retry cagrisi artik korumali)
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
- [x] Z. AI — ✅ TAMAMLANDI (28-29 Eylul: sert sure siniri deploy+gozlem altinda, Gemini/Groq/OpenRouter/Anthropic sinirlari/bakiyeleri dogrulandi, maliyet hesabi tek kaynaga tasindi)
- [x] AA. Grafik Motoru — ✅ TAMAMLANDI (23 Eylul: konu-paketi+ders-plani-uret+materyal-uret 3 route AYNI paylasilan fonksiyonu kullaniyor, dogrulandi)
- [ ] AB. Koçluk — ⬜ (kendi-kendine-bildirim sorunu biliniyor, çözülmedi)
- [ ] AC. Teacher Academy — 🔶 (25 Eylül: kapsam kararı verildi — dar, zaten mevcut — ama 15 soru resmi değil)
- [ ] AD. Live Academy — ⬜

## AE-AT: Ticari + Operasyonel (18)
- [x] AE. Ödeme — ✅ TAMAMLANDI (25 Eylul: havale+kurum+veli akislari uctan uca canli test edildi. Ucretli plana gecis kullaniciya birakildi (ilk parali kullaniciyla)). Iyzico hala bloklu (sozlesme yok)
- [x] AF. Ürün/Paket — ✅ TAMAMLANDI (25 Eylul: Deneme Kulubu 3 seviye eklendi, canli test edildi, paketler tablosu dogrulandi)
- [x] AG. Fiyatlandırma — ✅ TAMAMLANDI (25 Eylul: eski A/B/C kademe tutarsizligi duzeltildi, AI maliyet formulu gercek fiyat+canli kura baglandi (29 Eylul))
- [ ] AH. Satış — ⬜
- [x] AI. Pazarlama — ✅ TAMAMLANDI (25 Eylul: tanitim sayfasinda 2 gercek hata bulundu/duzeltildi - anlamsiz ternary + gercek olmayan arac reklami)
- [ ] AJ. Destek — ⬜
- [x] AK. Güvenlik — ✅ TAMAMLANDI (29 Eylul: gecici route taramasi temiz, ESLint 0 hata/5 uyari. GERCEK BULGU: 23 Agustos'tan kalan unutulmus yedek klasor (karemux-logo-backup-*) 1 aydan fazla repoda kalmis, gecici* taramasi yakalamiyordu - silindi)
- [ ] AL. KVKK/Hukuk — ⬜ (kullanıcının kendi aksiyonu bekleniyor)
- [ ] AM. APK/Mobil — ⬜
- [ ] AN. Accessibility — ⬜
- [x] AO. CI/CD — ✅ TAMAMLANDI (29 Eylul: 9 workflow'un hepsi aktif - 5 APK build, health check, ogretmen/ogrenci test, icerik tutarlilik denetimi)
- [ ] AP. Company Twin — ⬜
- [ ] AQ. Finans — ⬜
- [ ] AR. Operasyon — ⬜
- [ ] AS. KPI — ⬜
- [ ] AT. Launch Readiness — ⬜

---

## Sıradaki Adım
Hiçbir kategori "resmi 15 soru" formatıyla TAM bitmedi — hepsi organik/kısmi. Sistematik tarama, EN AZ dokunulmuş kategorilerden (A.Altyapı, B.Auth, G.Personel, I.Content Core) başlamalı.

---

## 🔬 GÖZLEM DÖNEMİ — 28 Eylül'den başlayarak 2-3 gün (sert süre sınırı + seviye-tespit tanıları)

**Deploy edilen değişiklikler (28-29 Eylül gecesi, commit aa09fda):**
- lib/ai.js: Katman 3 (12sn) + görsel karar (12sn) + Türkçe-retry (20sn) çağrılarına SERT süre sınırı. Üretimde 5 kez tetiklendi (hepsi OpenRouter Katman 3), kesilme olmadı.
- seviye-tespit/olustur: hata yolunda yanıtın şekli loglanıyor.
- soruKalite.js: denetim yanıtı ayrıştırılamazsa anlaşılır hata+şekil loglanıyor, tavan yükseltildi.
- materyal-uret: soru bankasına yazmadan önce seçenek sayısı(4)+dogruIndex(0-3) doğrulaması.
- lib/ai-fiyatlandirma.js: Gemini maliyet hesabı tek kaynağa taşındı, kur Frankfurter'dan canlı.

**Açık soru:** Gemini ana üretimde kesilmeyi mi tetikliyor? 7 örnek (3 kesildi, 4 geçti). Kesilen koşularda Gemini 5-8 kez, geçen koşularda 0-3 kez başarılı yanıt vermişti. Eğilim var, kanıt yok.

**Günlük kontrol:**
Kesilme görülürse o dakikanın ai_saglayici_log satırlarına bakılır.

**Durdurma kriteri:** 2-3 günde hiç 60sn kesilmesi olmazsa "yamayla gözlenmedi" denir, "çözüldü" denmez.

**29 Eylül 04:04 (push, aa09fda) — 11/11 geçti.** Gemini ana üretimde 11/11 başarısız (kota), Groq tek başına taşıdı. Sert sınır 4 kez tetiklendi (ilk kez Gemini'de de, hem Katman 3 hem görsel karar, tam 12000ms'de). 8. örnek, desen tutarlı: Gemini ana üretimde ≥5 başarılıysa kesiliyor (3/3), ≤3 ise geçiyor (5/5).
