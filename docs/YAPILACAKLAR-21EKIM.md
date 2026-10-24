# KAREMUX — Tam Yapılacaklar Listesi (21 Ekim 2026)
[BEN] = Claude yapar, [SEN] = yalnızca kullanıcı yapabilir. Güncel durum için YOL-HARITASI-GUNCEL.md.

## A. Launch engelleri
1. AI kapasitesi: Gemini ücretsiz 20 istek/gün doldu; Groq/OpenRouter yetersiz. [BEN] Anthropic haiku-4-5 vs sonnet-5 hız testi, hızlı olanı ana yedek yap. [SEN] Gemini faturalaması veya Anthropic kredisi kararı.
2. ✅ TAMAM (21 Ekim, canlı kanıtlı) Ulusal deneme yaması [BEN]: cevapAnahtari kapanışa kadar gizle; UNIQUE(ulusal_deneme_id, kullanici_id); il/ilce/puanlama_surumu yaz; page.js sonuç ekranını kontrol et; VPS server.js'i vps/karemux-deneme/ altına al. [SEN] server.js + package.json'u scp ile Termux'a çek.
3. ✅ TAMAM (21 Ekim) [SEN] VPS: chmod -R go-rwx /opt/karemux-yedekler /root/yedekler
4. [SEN] Vercel Pro (Hobby ticari kullanıma kapalı).
5. [SEN] İyzico kart ödemesi başvuru/sözleşme.
6. [SEN] KVKK/hukuk: Neon ABD, Gemini ücretsiz katman verisi, çocuk kullanıcı, mesafeli satış/iade, öğretmen sözleşmeleri.
7. [SEN] Gerçek cihaz testi: TalkBack, VoiceOver, Android APK, mobil web.

## B. Ödeme öncesi
8. ✅ TAMAM (21 Ekim, canlı kanıtlı) Faz 2: tüm AI istekleri /api/ai-islem ve /api/ucretli-uret uçlarında, prompt sunucuda; /api/claude kapatıldı (410).
9. [BEN] ✅ (git: e9d2d3e, 9776374, 883b208, e293fa0 — tek konu/aralıklı tekrar/yazım uçları sunucuda; Hata Kitapçığı 'benzer sorular' ayrıca doğrulanmadı) Faz E kalanları: tek konu testi (~L3956) ve koç paneli testi (~L4578) sunucu puanlama; /api/soru-bankasi POST sertleştirme; Hata Kitapçığı benzer sorular.
10. [BEN] ✅ (git: c421f54 merkezi bitiş kontrolü, tek sefer yenileme e-postası) Abonelik motoru: abonelik/durum, deneme-kulubu/durum, kurum/koltuk-ata, admin/kullanici-profil-detay, cron/yenileme-uyarisi merkezi hak fonksiyonuna; yenileme e-posta metnini düzelt.

## C. Temizlik/bakım
11. [SEN] Eski Anthropic anahtarlarını Console'dan sil.
12. [BEN] (SQL hazır, kullanıcı çalıştıracak) Neon: "Carpanlar ve Katlar" bekliyor satırı ve test kalıntıları.
13. [BEN] 2 'bekliyor' konu paketini inceleme kuyruğuna al.
14. [SEN] pm2 zentra-* (8 kayıt) sil.
15. [SEN] Repo public; private ve Actions dakika limiti kararı.
16. [BEN] Yedek Actions maillerini 1-2 gün izle, restore testini tekrarla.
17. [BEN] 303 yetim + 410 eski İngilizce soru_bankasi kaydı.

## D. Sınav Merkezi
18. [BEN] Ortak üretim çekirdeği: seviye-tespit/olustur → onay-sinavi → ulusalDenemeOlustur.
19. [BEN] Oturum/katılım modeli, hata/süre analizi, öğretmen analizi, telafi zinciri.
20. [BEN] ✅ Harici katılımcı (23 Ekim): /harici-deneme (hesapsız ulusal deneme), hesap açınca/girişte /api/harici/aktar ile sonuç aktarımı. Canlı doğrulama bekliyor.
21. [BEN] ✅ (git: 281491b, en az 5 katılımcı) Sıralama eşikleri, min grup büyüklüğü, okul/sınıf ortalaması.
22. [BEN] ✅ (git: 281491b) Sınav Analizleri ekranı: durum etiketleri, öneriler, hedef net, kazanım analizi.

## E. Müfredat/içerik
23. [BEN] ✅ Plan doğrulamalı 4-8 (Mat/Fen/Sosyal/Türkçe/İnkılap/Din/İng, 23 Ekim). Eski not: Din 5-7, Fen 5, 4. sınıf, Sosyal/Din 5, 8. sınıf ünite adları, İngilizce 4/6/7/8 (resmî MEB kaynağı).
24. [BEN] ✅ (git: 7658e74, 405 kazanım) Kazanım kodu referans JSON.
25. [BEN] ✅ (git: 99fc619) OYSS hazırlık modu (MEB sistemi 26 Ekim).
26. [BEN] ✅ (git: 204af3a) MEB değişiklik takip cron'u.
27. [BEN] ✅ (git: 8f60d1a, b078970) "Fazla üret + kırp" mantığını deneme/yazılı/paragrafa yaygınlaştır.

## F. Ürün/ticari (V3 dalgaları)
28. [BEN] ✅ D3 Paket Tasarım Merkezi (23 Ekim, canlı doğrulama bekliyor). 29. [BEN] ✅ D4-5 akademik takvim + plan motoru (23 Ekim, canlı doğrulama bekliyor). 30. [BEN] ✅ D6 Content Core (23 Ekim): lib/icerik-cekirdegi.js + /api/admin/icerik-cekirdegi kapsam raporu; 207 üniteden 206'sı plana bağlı, kalan: 8. sınıf Matematik (planda öğrenme alanı, kodda konu adı). 31. [BEN] D7-8 video motoru+katalog, 5.350 arşiv altyapısı (gerçek video launch sonrası). 32. [BEN] D10 Deneme Kulübü analiz/tekrar döngüsü.
33. [SEN] Fiyat kararı: maliyet doğrulanınca kesinleşir.

## G. Öğretmen/öğrenci/kurum
34. [BEN] ✅ (git: e3b3f9b) Öğretmen↔öğrenci↔sınıf, Sınıf Analizi, Zayıf Konu Koçluğu. 35. [BEN] ✅ (git: defac4f) Koç görev doğrulaması. 36. [BEN] ✅ (git: 4007f60) Öğrenci ödev takibi. 37. [BEN] ✅ (git: c398fa1) Öğrenme Hafızası bağlantısı. 38. [BEN] ✅ kurum kodu+okul no girişi ve QR giriş (git: 6208810); veli ayrı giriş/ödeme canlıda doğrulanacak. 39. [BEN] Kurum logosu Blob (SSRF). 40. [BEN] ✅ Geri tuşu + Design System (docs/TASARIM-SISTEMI.md, erişilebilirlik sabitleri, 23 Ekim).

## H. Operasyon/kalite
41. [BEN] ✅ (git: 1f6605f) Merkezi KPI (GERÇEK/TAHMİN/SENARYO). 42. [BEN] ✅ (git: 204af3a, 9b797f1) Kota uyarısı Telegram + AI fiyat bekçisi. 43. [BEN] ✅ Destek/SLA (git: 5c3b924); Live Academy testi canlı kontrole kaldı. 44. [BEN] ✅ (23 Ekim) Next 16 + React 19 (CI build geçti, Vercel yayında; kritik/yüksek açık 0, 4 orta kaldı), npm audit CI workflow'u (bagimlilik-denetimi), WebAuthn passkey ikinci adım (personel, opsiyonel; CI testi geçti). Canlı cihaz testi bekliyor. 45. [BEN] ✅ (git: e3b3f9b) Soru Çöz'ü otomatik öğrenci testine ekle. 46. [SEN] Hesap e-postalarını kurumsala geçir.

## Sıra
Bugün/yarın: 2 → 3 → 1(test) → 8. Bu hafta: 9, 10, 11-17. Paralel: 4-7 (sen). Launch sonrası: D-H.

## 24 Ekim: Video üretim hattı (özet)
- Kaynak liste: resmî yıllık plan alt konuları (5-8) + İngilizce temaları = 649 alt konu; 646'sının konu paketi YOK (gerçek DB taraması, `rapor` dalı). Önceki "730" rakamı yeniden üretilemedi, geçersiz.
- Aşamalar: konu paketi → senaryo (bağımsız denetim + düzeltme turu) → ses (Gemini TTS / klon / dış seslendirme) → video → insan onayı → yayın. Takip tablosu `video_uretim_plani` (admin: İçerik Merkezi > Üretim planı).
- Kalite kapıları: paket kalite kontrolü; senaryo kaynakla karşılaştırma; ses teknik kontrol (seviye, uzun sessizlik); video insan onayı.
- Maliyet: üretim anında `giderler` (kategori `video_uretimi`, tarih/ay ile). Gemini ücretsiz kota ses için günde 10 istek → faturalandırma şart.
- Kaynak boşlukları (uydurulmaz): Türkçe 5-7 ~13-14 konusuz hafta; 8. İnkılap ve 8. Din kazanımı yok; İngilizce plan tema bazlı.
- Yıl değişimi: `mufredat_yili` ile yeni satır seti; kaynağı değişmeyen konular tekrar üretilmez.
