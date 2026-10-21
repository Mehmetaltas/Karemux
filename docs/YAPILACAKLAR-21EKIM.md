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
9. [BEN] Faz E kalanları: tek konu testi (~L3956) ve koç paneli testi (~L4578) sunucu puanlama; /api/soru-bankasi POST sertleştirme; Hata Kitapçığı benzer sorular.
10. [BEN] Abonelik motoru: abonelik/durum, deneme-kulubu/durum, kurum/koltuk-ata, admin/kullanici-profil-detay, cron/yenileme-uyarisi merkezi hak fonksiyonuna; yenileme e-posta metnini düzelt.

## C. Temizlik/bakım
11. [SEN] Eski Anthropic anahtarlarını Console'dan sil.
12. [BEN] Neon: "Carpanlar ve Katlar" bekliyor satırı ve test kalıntıları.
13. [BEN] 2 'bekliyor' konu paketini inceleme kuyruğuna al.
14. [SEN] pm2 zentra-* (8 kayıt) sil.
15. [SEN] Repo public; private ve Actions dakika limiti kararı.
16. [BEN] Yedek Actions maillerini 1-2 gün izle, restore testini tekrarla.
17. [BEN] 303 yetim + 410 eski İngilizce soru_bankasi kaydı.

## D. Sınav Merkezi
18. [BEN] Ortak üretim çekirdeği: seviye-tespit/olustur → onay-sinavi → ulusalDenemeOlustur.
19. [BEN] Oturum/katılım modeli, hata/süre analizi, öğretmen analizi, telafi zinciri.
20. [BEN] Harici katılımcı (hesapsız katıl, sonra hesaba taşı).
21. [BEN] Sıralama eşikleri, min grup büyüklüğü, okul/sınıf ortalaması.
22. [BEN] Sınav Analizleri ekranı: durum etiketleri, öneriler, hedef net, kazanım analizi.

## E. Müfredat/içerik
23. [BEN] Din 5-7, Fen 5, 4. sınıf, Sosyal/Din 5, 8. sınıf ünite adları, İngilizce 4/6/7/8 (resmî MEB kaynağı).
24. [BEN] Kazanım kodu referans JSON.
25. [BEN] OYSS hazırlık modu (MEB sistemi 26 Ekim).
26. [BEN] MEB değişiklik takip cron'u.
27. [BEN] "Fazla üret + kırp" mantığını deneme/yazılı/paragrafa yaygınlaştır.

## F. Ürün/ticari (V3 dalgaları)
28. [BEN] D3 Paket Tasarım Merkezi. 29. [BEN] D4-5 akademik takvim + plan motoru. 30. [BEN] D6 Content Core. 31. [BEN] D7-8 video motoru+katalog, 5.350 arşiv altyapısı (gerçek video launch sonrası). 32. [BEN] D10 Deneme Kulübü analiz/tekrar döngüsü.
33. [SEN] Fiyat kararı: maliyet doğrulanınca kesinleşir.

## G. Öğretmen/öğrenci/kurum
34. [BEN] Öğretmen↔öğrenci↔sınıf, Sınıf Analizi, Zayıf Konu Koçluğu. 35. [BEN] Koç görev doğrulaması. 36. [BEN] Öğrenci ödev takibi. 37. [BEN] Öğrenme Hafızası bağlantısı. 38. [BEN] Veli ayrı giriş/ödeme; kurum kodu+okul no girişi; QR giriş. 39. [BEN] Kurum logosu Blob (SSRF). 40. [BEN] Geri tuşu, Design System.

## H. Operasyon/kalite
41. [BEN] Merkezi KPI (GERÇEK/TAHMİN/SENARYO). 42. [BEN] Kota uyarısı Telegram + AI fiyat bekçisi. 43. [BEN] Destek/SLA, Live Academy testi. 44. [BEN] Next.js 16, npm audit, WebAuthn. 45. [BEN] Soru Çöz'ü otomatik öğrenci testine ekle. 46. [SEN] Hesap e-postalarını kurumsala geçir.

## Sıra
Bugün/yarın: 2 → 3 → 1(test) → 8. Bu hafta: 9, 10, 11-17. Paralel: 4-7 (sen). Launch sonrası: D-H.
