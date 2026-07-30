# Karemux — Kurulum ve Yayına Alma Rehberi

Bu proje sende zaten olan GitHub, Vercel, Neon hesaplarını ve
karemux.com alan adını kullanacak şekilde hazırlandı. Aşağıdaki
adımları sırayla uygula.

## 1) GitHub'a yükle
```bash
cd karemux
git init
git add .
git commit -m "İlk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/karemux.git
git push -u origin main
```
(Boş GitHub reposu oluşturup KULLANICI_ADIN kısmını kendi adınla değiştir.)

## 2) Neon veritabanını kur
1. neon.tech panelinde yeni bir proje oluştur (yoksa).
2. "Connection string"i kopyala.
3. Neon konsolundaki **SQL Editor**'e `db/schema.sql` içeriğini yapıştırıp çalıştır
   (bu, kullanıcılar/abonelikler/ödemeler/ilerleme tablolarını oluşturur).

## 3) Anthropic API anahtarı al
console.anthropic.com → API Keys → yeni anahtar oluştur. Bu, uygulamanın
gerçek yapay zekâ çağrılarını yapabilmesi için gerekli (ücretlidir,
kullanım bazlı faturalandırılır — console.anthropic.com/settings/billing
üzerinden fiyatlandırmayı görebilirsin).

## 4) iyzico hesabı
1. iyzico.com üzerinden işyeri (merchant) başvurusu yap — kimlik/şirket
   bilgisi istenecek, bu adımı sen tamamlamalısın.
2. Onay sonrası Merchant Panel > Ayarlar > API Anahtarları'ndan
   API_KEY ve SECRET_KEY'i al.
3. Test için önce `sandbox-api.iyzipay.com` ile dene, canlıya geçince
   `api.iyzipay.com` yap.

## 5) Vercel'e deploy et
1. vercel.com → "Add New Project" → GitHub reposunu (karemux) seç.
2. **Environment Variables** kısmına `.env.example`'daki tüm
   değişkenleri gerçek değerleriyle ekle.
3. Deploy'a bas.

## 6) karemux.com alan adını bağla
1. Vercel proje ayarları → Domains → `karemux.com` ekle.
2. Vercel'in verdiği DNS kayıtlarını (A/CNAME) alan adını aldığın
   yerin (Natro, Turhost, GoDaddy vb.) DNS panelinden ekle.
3. Yayılması birkaç dakika–birkaç saat sürebilir.

## 7) Mobilde "uygulama" gibi açılması (PWA)
`public/manifest.json` zaten hazır. Yapman gereken tek şey
`public/icons/` klasörüne 3 ikon eklemek:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-512-maskable.png` (512×512, kenarlarda boşluk bırakan "maskable" versiyon)

Bunları Canva veya favicon.io gibi bir araçla saniyeler içinde
oluşturabilirsin. Eklendikten sonra kullanıcılar:
- **iOS Safari:** Paylaş → "Ana Ekrana Ekle"
- **Android Chrome:** Menü → "Ana ekrana ekle / Uygulamayı yükle"

ile karemux.com'u gerçek bir uygulama gibi telefonlarına kurabilir.

## 8) Gerçek App Store / Play Store uygulaması (ileri aşama)
Bu adım şimdilik hazır değil çünkü Apple Developer ($99/yıl, macOS
gerektirir) ve Google Play Developer ($25) hesaplarını senin açman
gerekiyor. O noktaya geldiğinde bu aynı Next.js kodu **Capacitor**
ile sarılıp native iOS/Android paketine dönüştürülebilir — o zaman
tekrar konuşuruz.

## v0.4'te eklenenler
- **Veli görünümü** — öğrenci bir bağlantı kodu üretir (Hesap sekmesinde görünür),
  veli o kodu girip (`/api/veli/baglan`) öğrencinin ilerlemesini salt-okunur
  görebilir (`/api/veli/ilerleme`)
- **E-posta doğrulama** — kayıt olunca 6 haneli kod e-postayla gönderilir,
  doğrulanana kadar Hesap sekmesinde uyarı banner'ı görünür
- **Günlük kullanım limiti** — ücretsiz kullanıcılar günde 15 AI isteğiyle
  sınırlı (`lib/ratelimit.js`, Neon tabanlı — serverless'ta güvenilir çalışır).
  Premium abonelik kontrolü henüz bu limite bağlanmadı, sıradaki adım bu.
- **Gizlilik Politikası + Kullanım Şartları sayfaları** (`/gizlilik`, `/kullanim-sartlari`)
  — ŞABLONDUR, yayına almadan önce avukata inceletin

### Ek kurulum
- `db/schema.sql`'i yeniden çalıştırın (yeni tablolar: `veli_ogrenci`, `gunluk_kullanim`,
  yeni sütunlar: `kullanicilar.rol`, `eposta_dogrulandi`, `dogrulama_kodu`,
  `veli_baglanti_kodu` — mevcut bir veritabanınız varsa dosyanın sonundaki
  `ALTER TABLE` komutlarını da çalıştırın)
- Gizlilik/Kullanım Şartları sayfalarındaki `[E-POSTA ADRESİNİZİ BURAYA EKLEYİN]`
  ve `[TARİH EKLEYİN]` yer tutucularını doldurun


- **Kayıt/giriş sistemi** (`/api/auth/*`) — bcrypt şifre hash, httpOnly JWT cookie
- **Tek tık abonelik iptali** (`/api/abonelik/iptal`) — Kunduz şikayetlerindeki
  "iptal etmek zor" sorununa karşı bilinçli tasarım
- **Yenileme öncesi e-posta uyarısı** — Vercel Cron her gün çalışıp yenilenmesine
  3 gün kalan abonelikleri Resend ile e-postayla uyarır (`vercel.json` + `/api/cron/yenileme-uyarisi`)
- **AI sağlayıcı soyutlaması** (`lib/ai.js`) — tek bir firmaya (Anthropic) kilitlenmemek
  için; `AI_PROVIDER` ortam değişkeniyle ileride başka bir sağlayıcıya geçiş tek satırlık iş

### Cron görevi için ek kurulum
1. `.env`'e `CRON_SECRET` ekle (rastgele, `openssl rand -hex 16`).
2. Vercel proje ayarlarında Cron Jobs otomatik olarak `vercel.json`'dan okunur,
   ekstra bir şey yapmana gerek yok — sadece env değişkenlerini eksiksiz gir.
3. Resend.com'da ücretsiz hesap aç, `RESEND_API_KEY` al, gönderen alan adını
   (`bildirim@karemux.com`) Resend panelinde doğrula (DNS kaydı gerekir).

### Dürüst sınırlama
`/api/abonelik/iptal` içindeki iyzico abonelik iptali, iyzico Merchant
Panel'de gerçek "Abonelik" (Subscription) ürünü aktifleştirilmişse çalışır.
Şu anki `checkoutFormInitialize` entegrasyonu tek seferlik ödeme akışıdır —
gerçek otomatik yenileme için iyzico'nun ayrı Abonelik API'sine geçmen
gerekecek. Şimdilik veritabanımızdaki iptal kaydı her durumda çalışıyor.


Pazar lideri Kunduz'un "Full Paket"i referans alındı. Karşılaştırma:

| Özellik | Kunduz | Karemux |
|---|---|---|
| Soru çözümü | İnsan eğitmen, ~15 dk | **AI ile anında** (`/api/soru-coz`) — fark yaratan nokta |
| Konu anlatımı | 2385 video | AI ile anında, istenen her konu için üretilir |
| Koçluk / haftalık plan | İnsan koç, seans bazlı | AI ile anında, geçmiş performansa göre otomatik |
| Zayıf konu tespiti | Manuel (koçla görüşme) | **Otomatik** — quiz sonuçları Neon'a kaydedilir, %60 altı başarı "zayıf" sayılır (`/api/ilerleme`) |
| Deneme sınavı + sıralama | Var, gerçek kullanıcı tabanıyla | **Henüz yok** — anlamlı bir sıralama için gerçek kullanıcı kitlesi gerekir, bu ölçek gerektirir |
| Veli takibi | Var | **Henüz yok** — auth sistemi kurulunca eklenecek |

## Güvenlik ve "Kopya Koruma" — gerçekçi olarak neler yapıldı/yapılabilir
Önemli: **hiçbir web/mobil uygulama %100 "kopyalanamaz" değildir** — istemci
tarafındaki her kod incelenebilir. Yapılabilecek olan, gerçek değeri
(iş mantığı, veri, AI çağrıları) sunucuda tutup istemciye hiç sızdırmamaktır.
Bu projede uygulanan/uygulanabilecekler:
- ✅ API anahtarları (Anthropic, iyzico) sadece sunucuda, asla tarayıcıya gönderilmiyor
- ✅ SQL sorguları parametreli (`@neondatabase/serverless` template literal) — SQL injection'a kapalı
- ✅ Görsel boyutu ve prompt uzunluğu sınırlanıyor (kaba rate/DoS koruması)
- ⏳ Henüz yok: gerçek kullanıcı girişi + şifre hash'leme (bcryptjs zaten `package.json`'da,
  route'ları yazılmadı), IP bazlı rate limiting (Vercel'de Upstash Redis ile eklenebilir),
  HTTPS zaten Vercel'de otomatik.
- ⏳ İçerik/tasarım "çalınmasını" tamamen engelleyemeyiz ama marka (karemux.com,
  logo, metinler) için Türk Patent Enstitüsü'nden marka tescili gerçek ve
  yapılabilir bir koruma — bu hukuki bir adım, kod değil.

## Sonraki en değerli adımlar (öncelik sırasıyla)
1. Kullanıcı kayıt/giriş (auth) — anonim cihaz kimliğini gerçek hesaba bağlar
2. Veli görünümü (öğrencinin ilerlemesini salt-okunur gösteren ayrı bir ekran)
3. Rate limiting (kötüye kullanımı ve AI maliyetini kontrol altında tutmak için)

