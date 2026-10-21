# KAREMUX — Güncel Yol Haritası (21 Ekim 2026)

Bu belge, `docs/` altındaki eski raporların (FULL-AUDIT-TAKIP, V3-DALGA-PLANI, ISLETME-YOL-HARITASI, DURUM-1EKIM, GENEL-DURUM-30EYLUL, DALGA1/9-10, SINAV-URETIM-MOTORU, SINAV-MERKEZI-DURUM-TARAMASI) ve hafızadaki yol haritası notlarının ÖZETİ ve GÜNCEL durumudur. Eski belgeler silinmedi; ayrıntı orada. Durum etiketi: ✅ kodda+canlıda kanıtlı · 🔶 kısmen · ⬜ yok · ❓ doğrulanamadı.

## 1. Piyasaya çıkış engelleri (A sınıfı)
| # | Madde | Durum |
|---|---|---|
| 1 | AI kapasitesi: Gemini ücretsiz 20 istek/gün/model doldu; Groq TPM 8000, OpenRouter kredi yok, Anthropic 10k token çıktıda 30 sn zaman aşımı | ⬜ AÇIK — kullanıcı kararı bekliyor (faturalama) + Anthropic haiku/sonnet hız testi |
| 2 | Ulusal deneme (VPS server.js) cevap anahtarı sızıntısı, çift gönderim, snapshot | ✅ KAPANDI 21 Ekim, canlıda kanıtlı (anahtar boş, çift gönderim 400/400, anahtar ucu 403); kod `vps/karemux-deneme/` altında |
| 3 | Ücretli özellik yetkisi sunucuda | ✅ canlı kanıtlı (ayrı uç + vekil reddi). Kalan: ücretsiz akışların uçlara taşınması (launch sonrası) |
| 4 | Yedekleme | ✅ gece şifreli pg_dump (GitHub, 14 gün) + restore iş akışı + VPS JSON dışa aktarım + Contabo yedek. Kalan: VPS yedek dizini izinleri (`chmod -R go-rwx`), Actions maillerini 1-2 gün izleme |
| 5 | Vercel Pro (Hobby ticari kullanıma kapalı) | ⬜ ilk ödemeyle — kullanıcı |
| 6 | İyzico kart ödemesi (sözleşme yok; havale/kurum/veli akışları çalışıyor) | ⬜ kullanıcı |
| 7 | KVKK / hukuk (Neon ABD-Ohio, Gemini ücretsiz katman veri kullanımı, çocuk kullanıcı, mesafeli satış) | ⬜ kullanıcı + avukat |
| 8 | Gerçek cihaz (TalkBack/VoiceOver, Android, mobil web) | ⬜ kullanıcı |
| 9 | Öğretmen 2FA | ✅ 29 Eylül'de yapıldı (veli+kurum da) |
| 10 | Content Core onaysız içerik açığı | ✅ kapandı (29 Eylül) |

## 2. Fazlar (V3 dalga planının güncel karşılığı)
- **Faz 1 – Güvenlik/Yetki/Yedek:** Faz E (sunucu tarafı puanlama) büyük ölçüde ✅ (puanlama merkezi, sinav_oturumlari, ders tekrarı, genel değerlendirme, ders seviye tespiti, `/api/sinav-sonuc` POST 410, pratik oturumları, aralıklı tekrar, IP günlük tavan, sürüm uyarısı). Kalan: tek konu / koç paneli testlerinin istemci puanlaması (~L3956, ~L4578) kontrolü, `/api/soru-bankasi` POST sertleştirme.
- **Faz 2 – Sunucu tarafı prompt:** ÜCRETLİ iki akış (tatil programı, bursluluk) ✅ `/api/ucretli-uret` ucuna taşındı, prompt sunucuda kuruluyor; `/api/claude` bu desenleri paket olsa bile reddediyor. Canlıda kanıtlı (21 Ekim): paketsiz 403/403, yeniden yazılmış prompt vekilde 403, paketli ara_tatil 200 + geçerli program (11.9 sn), paketli bursluluk 200 + 5 soru (5.9 sn). KALAN: ücretsiz akışlar (15 `aiIstek` çağrısı) hâlâ `/api/claude` üzerinden; günlük limit + IP tavanı + 4000 karakter + 8192 token sınırıyla maliyeti sınırlı, ödeme riski YOK. Sunucu uçlarına taşınması launch sonrası. 🔶
- **Faz 3 – Sınav mimarisi:** Sınav Merkezi dalgası (V3 #9) 3 adım ✅ (il/ilçe/kurum snapshot: sinav_sonuclari, seviye_tespit_sonuc, ucretli_deneme_sonuclari; Deneme Kulübü yıllık abone entegrasyonu). Üretim motoru birleşmesi: Faz D adım 1 (ortak format doğrulama) ✅, adım 4 (konu-paketi) ✅; kalan sıra: seviye-tespit/olustur → onay-sinavi → ulusalDenemeOlustur → ortak çekirdek. Ulusal deneme güvenlik yaması burada (engel #2). Harici katılımcı, oturum/katılım modeli, hata/süre analizi, telafi zinciri ⬜ (ayrıntı: SINAV-MERKEZI-DURUM-TARAMASI-21EKIM.md).
- **Faz 4 – Öğretmen paneli:** materyal-uret 11 araç ✅ Kalite Motoru'na bağlı; öğretmen↔öğrenci↔sınıf bağlantısı, sınıf analizi, zayıf konu koçluğu ⬜.
- **Faz 5 – Müfredat/OYSS/içerik:** Müfredat resmi MEB: Mat 5-7, Fen 6-7, Sosyal 6-7, Türkçe 5-7 ✅. Kalan: Din 5-7, Fen 5, 4. sınıf, Sosyal/Din 5, 8. sınıf ünite adları, İngilizce 4/6/7/8, kazanım kodu JSON, OYSS hazırlık modu (26 Ekim sistem açılışı), MEB değişiklik takip cron'u.
- **Faz 6 – Ticari çekirdek (V3 Dalga 1-3):** Abonelik Motoru (paket_id FK, `getActiveAbonelik`, `isYillikAboneMi` ✅; kalan 4-5 route'un merkezi fonksiyona taşınması, gerçek yenileme tahsilatı yok), Entitlement `hasEntitlement` ✅ (adım 1), Paket Tasarım Merkezi ⬜, İptal≠İade ✅.
- **Faz 7 – Akademik takvim + plan motoru (V3 #4-5):** ⬜ başlanmadı.
- **Faz 8 – Content Core / video motoru / 5.350 arşiv (V3 #6-8):** Content Core kısmen (Tek Konu, konu_paketi bağlı); merkezi mimari yok. Video ve toplu arşiv ⬜ (video üretimi launch sonrası).
- **Faz 9 – Deneme Kulübü otomasyonu (V3 #10), KPI/Company Twin, Live Academy, YouTube:** Twin tabloları dolu (27/19), merkezi KPI panosu yok.

## 3. Bilinen kısıtlar / teknik borç
Öğrenci tarafı ödev takibi yok · Koçluk görev doğrulaması öz-bildirim (`gunluk_gorevler` 0 kayıt) · Öğrenme Hafızası kısmi · 303 yetim soru_bankasi kaydı · Next.js 14→16 · WebAuthn · kurum logosu SSRF (Blob geçişi) · pm2 `zentra-*` hayalet kayıtları · 2 'bekliyor' konu_paketi + "Carpanlar ve Katlar" test satırı · repo public · eski Anthropic anahtarları Console'dan silinmeli.

## 4. Başarı ölçütü (her madde için)
Gerçek kodda var + test edildi + canlıda doğrulandı + sonucu belgelendi. Tahmin yazılmaz; "doğrulanamadı" açıkça yazılır.

## 5. Sıradaki somut adımlar
1. AI kapasite kararı + Anthropic hız testi (engel #1).
2. Ulusal deneme yaması + VPS kodunu repoya alma (engel #2).
3. VPS yedek izinleri.
4. Faz 2: `/api/claude` kapatma.
5. Faz 3: seviye-tespit/olustur'dan ortak üretim çekirdeğine geçiş.
