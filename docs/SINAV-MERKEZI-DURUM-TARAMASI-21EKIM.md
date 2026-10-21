# Sınav Merkezi + Deneme Kulübü — Gerçek Kod Durum Taraması
21 Ekim 2026. Yalnızca OKUMA: repo (`e6d534d` sonrası) taranmıştır; canlı veritabanı ve VPS (api.karemux.com) bu taramanın dışındadır.
Sınıflar: MEVCUT (kodda kanıtlı) · KISMİ · EKSİK (kodda görülmedi) · DOĞRULANAMADI (repo dışında).

## 1. MEVCUT (dosya kanıtıyla)
| Parça | Kanıt |
|---|---|
| Ücretli deneme havuzu ve kurum satın alma | `app/api/admin/ucretli-deneme`, `app/api/kurum/denemeler`, tablolar `ucretli_denemeler`, `kurum_deneme_satin_alma` |
| Ücretli deneme oturumu: sorular, mevcut durum, gönderim | `app/api/ucretli-deneme/{sorular,mevcut,gonder}` |
| Sunucu tarafı puanlama + sürümleme | `lib/puanlama.js` (`puanla`, `kitapcikOlustur`, `PUANLAMA_SURUMU`); `ucretli-deneme/gonder` kitapçığı sunucuda yeniden kurup puanlar, cevap anahtarı istemciden gelmez |
| Coğrafi snapshot (il/ilçe) | `ucretli-deneme/gonder` ve `seviye-tespit/gonder`: `kullanicilar.hedef_il/hedef_ilce` sonuç satırına kopyalanır |
| Kurum ve genel sıralama | `ucretli-deneme/gonder` (net'e göre sıra), `kurum/liderlik` |
| Hata kitapçığı beslemesi | `ucretli-deneme/gonder` yanlışları `hata_kitapcigi`'ne yazar |
| Seviye tespit (üretim + sunucu puanlama + kademe) | `app/api/seviye-tespit/*`, cevap anahtarı sunucuda (`seviye_onay_sinavlari`) |
| Deneme / yazılı / pratik oturumları (sunucu üretim + puanlama) | `app/api/sinav-oturumu/{parti,gonder}`, `lib/sinav-uretimi.js`, `lib/sinav-sonuc-kaydet.js`; istemci sonuç yazan eski uç kapalı (`sinav-sonuc` POST 410) |
| Deneme Kulübü üyeliği ve haklar | `lib/deneme-kulubu.js`, `app/api/deneme-kulubu/durum`, `hasEntitlement` (`lib/paket.js`), UI `mod === "denemekulubu"`, havale/ödeme akışına bağlı |
| Otomatik deneme üretimi | `app/api/cron/ulusal-deneme-otomatik`, `app/api/cron/paket-deneme-otomatik`, `lib/ulusalDenemeOlustur.js` |
| Veli / kurum görünürlüğü | `app/api/veli/ilerleme`, `app/api/cron/veli-ozet`, `app/api/kurum/rapor`, `app/api/kurum/liderlik` |
| Öğrenme Hafızası bağlantısı | 15 dosya referans verir (örn. `ogrenme-hafizasi`, `aralikli-tekrar`, `hata-kitapcigi`, `pratik-oturumu`, `sinav-oturumu`) |

## 2. DOĞRULANAMADI — en önemli bulgu
**Türkiye geneli (ulusal) deneme dağıtımı ve puanlaması repoda DEĞİL.** `app/page.js` `https://api.karemux.com/aktif` ve `https://api.karemux.com/gonder` adreslerini çağırır (VPS). Repoda `app/api/ulusal-deneme/` altında yalnız `olustur` var (dağıtım/gönderim yok; önceki sürümler "ölü kod" diye silindi, commit `98a5aab`). `ulusal_deneme_sonuclari` tablosuna repoda **yazan** kod yoktur; yalnız okuyan (`admin/ulusal-deneme/rapor-gonder`, `kurum/rapor`) ve silen (`hesap-sil`) kod vardır.
Sonuç: ulusal denemede cevap anahtarı güvenliği, sunucu puanlaması, çift gönderim koruması ve sıralama mantığı bu taramada incelenemedi. VPS kodu görülmeden "çalışıyor" ya da "güvenli" denemez.

## 3. EKSİK / KISMİ (kodda görülmedi)
- Sınav / Oturum / Katılım ayrımı (rapor §6): ayrı oturum ve katılım şeması yok. `sinav_oturumlari` öğrencinin pratik/deneme üretim oturumudur, "sınavın çevrim içi uygulanma oturumu" değildir.
- Harici (hesapsız) katılımcı ve sonuç eşleştirme: yok.
- Sınav yaşam döngüsü (taslak → akademik/teknik kontrol → yayın → arşiv): sınavlar için resmi durum makinesi yok. `onay_durumu` yalnız konu paketleri için.
- Sıralama kuralları: yalnız `ORDER BY net`; eşit puan, minimum katılımcı eşiği ve gizlilik eşiği kuralı yok.
- Hata türü / süre analizi, soru başına süre: kodda görülmedi.
- Öğretmen sınıf performansı ve en çok hata yapılan alan ekranı: öğretmen API'lerinde sınav analizi yok.
- Telafi → yeniden ölçüm otomasyonu: `aralikli-tekrar` ve `hata-kitapcigi` var, "eksiğe göre mini ölçüm → yeni sonuçla karşılaştırma" zinciri uçtan uca bulunamadı.
- Merkezi KPI sistemine sınav metrikleri: bu taramada bağlantı görülmedi.
- Veritabanı doğrulamaları (paketler.haklar, snapshot kolonları, ilişkiler): repo dışı; Neon'da ayrıca kanıtlanmalı.

## 4. Kalan işlerin kanıta göre sırası
1. VPS'teki ulusal deneme kodunu (`/aktif`, `/gonder`) oku ve güvenlik/puanlama açısından denetle; mümkünse repoya taşı veya repoda belgele.
2. Neon doğrulaması: `paketler.haklar`, `ucretli_deneme_sonuclari` ve `seviye_tespit_sonuc` snapshot kolonları, indeksler.
3. Sıralama kuralları (eşit puan, minimum katılım, gizlilik eşiği) ve sonuç sürümü.
4. Sınav/Oturum/Katılım şeması ve yaşam döngüsü (yeni tablo ancak şema doğrulandıktan sonra).
5. Telafi → yeniden ölçüm zinciri, öğretmen / kurum analizleri, harici katılımcı, KPI bağlantısı.
