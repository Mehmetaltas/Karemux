# Yazılı kâğıtları: her yıl yeni müfredata göre üretim

Kâğıtlar sabit bir sınav değil; **o yılın yıllık planından** (`lib/yillik-plan.data.js`) kurulur.

## Nasıl çalışır
- Soru havuzu (`lib/yazili-hazirlik/havuz/*.js`) sorularını **"dönem.yazılı" penceresine değil, ünite/konuya** bağlar.
  Her soru bir `{u: ünite, k: konu}` etiketi taşır (eski sorular `havuz/etiketler.json` içinde, yenilerin 6. elemanında gömülü).
- Üretici (`scripts/yazili-toplu.mjs` → `lib/yazili-hazirlik/secici.js`) her yazılı penceresi için (D1: 1–8, 9–13, 14–18. hafta; D2: 19–25, 26–31, 32–37) planın o haftalardaki konularını bulur ve **yalnız o konuların sorularını** seçer. Her soru en fazla bir yazılıya girer; görselli sorular (en az 2) ve konu dengesi korunur.
- Planda artık olmayan konunun soruları **otomatik dışarıda kalır** (`DIŞI` / `yetim`). Planda yeni olup sorusu olmayan konular `BOSLUK.txt` raporunda çıkar.

## Her yıl yapılacaklar (yaklaşık 15 dk + soru yazımı)
1. Yeni yılın yıllık planını `lib/yillik-plan.data.js` içine koy (aynı biçim: `"Ders::Sınıf": [[hafta, ünite, konu], …]`).
2. GitHub → Actions → **Yazili Toplu Uretim** → Run workflow (`ogretim_yili` boşsa tarihten otomatik: Eylül'den itibaren yeni yıl). Her 1 Eylül'de kendiliğinden de çalışır ve boşluk raporunu **issue** olarak açar.
3. `cikti/BOSLUK.txt` (issue) içindeki **soru bulunmayan konulara** soru ekle: `havuz/ek-<ders>.js` içine
   `[soru, [seçenekler], doğruİndeks, açıklama, gorselSpec|null, {u:"<plandaki ünite>", k:"<plandaki konu>"}]`
   (etiket plandaki yazımla birebir aynı olmalı; `scripts/yazili-havuz-dogrula.mjs` bunu denetler).
4. Yeni eklenen soruları bağımsız gözle denetlet (çift doğru, yanlış bilgi, sınıf düzeyi), sonra workflow'u yeniden çalıştır; PDF'ler `yazili-cikti` dalına yazılır.

## Güvenceler
- `node scripts/yazili-havuz-dogrula.mjs` (CI'da üretimden önce çalışır): biçim, tek doğru cevap, "hepsi/A ve B" doğru şık yasağı, görsel şeması, kopya, etiketin planda bulunması.
- Seçenek sırası üretimde deterministik karıştırılır (cevap dağılımı dengeli).
- Üretici DB olmadan da çalışır (yalnız el yazımı havuz); `DATABASE_URL` varsa soru bankası yedek olarak kullanılır.

## Bilinen sınırlar
- Planın serbest metin satırları ("Sosyal etkinlik", "Okul temelli planlama", "Orientation/Revision", serbest okuma metni) sınav konusu sayılmaz.
- Yeni konu için soru yazımı insan/Claude işidir (otomatik üretim yok; AI üretimi ücretli API gerektirir). Boşluk raporu bunu görünür kılar.
- Kâğıtlar resmî sınav değildir; sayfada belirtilir.
