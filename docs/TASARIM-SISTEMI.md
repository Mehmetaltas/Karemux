# Karemux Tasarım Sistemi (23 Ekim 2026)

Tek kaynak: `lib/tasarim-sistemi.js` (tipografi, boşluk, köşe, bileşen üreticileri) + `lib/temalar.js` (5 tema, renkler).

## Kurallar
1. **Renk** yalnız `lib/temalar.js` temasından gelir; anlamsal renkler (başarı/uyarı/hata) sabit. Renk tek başına anlam taşımaz, yanında metin ya da ikon olur.
2. **Tipografi**: `TIPO` ölçeği (22/17/14/13/11.5/10). Gövde metni 13 px altına inmez; 10 px yalnız etiket/rozet.
3. **Boşluk**: `BOSLUK` 4 tabanlı ölçek; arada değer kullanılmaz.
4. **Dokunma hedefi**: en az 44×44 px (`dokunmaHedefiStili`). Liste içi "Çalış/Başla" gibi eylem düğmeleri bu ölçüyü taşır.
5. **Odak**: klavye odağı görünür kalır; `outline: none` yalnız yerine görünür bir odak stili konuyorsa kullanılır.
6. **Kartlar/butonlar/rozetler/liste satırları** `kartStili`, `butonStili`, `rozetStili`, `listeSatiriStili` ile üretilir; yeni ekranlar bu üreticileri kullanır.
7. **Geçiş politikası**: eski ekranlar dokunulmadan kalır; bir ekran değiştirilirken yeni sisteme alınır (toplu yeniden yazım yok).

## Uygulama durumu
Kullanan dosyalar: `app/page.js`, `app/veli/page.js`. Yeni ekranlar (Yıllık Plan, Paket Tasarım, İçerik Merkezi, Deneme Kulübü döngüsü) 44 px hedefi ve tema renklerini kullanır.
