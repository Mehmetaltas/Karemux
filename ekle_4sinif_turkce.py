with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

unite_marker = '  "5::Turkce":'
unite_yeni = '  "4::Turkce": ["Dinleme ve Izleme", "Konusma", "Okuma", "Yazma"],\n'

if unite_marker not in content:
    print("HATA: '5::Turkce' bulunamadi, unite eklenemedi.")
else:
    content = content.replace(unite_marker, unite_yeni + unite_marker, 1)
    print("OK: 4::Turkce unite listesi eklendi.")

alt_marker = '  "Turkce::Oyun Dunyasi::5":'
alt_yeni = '''  // 4. sinif - resmi PDF'ten (2024programtur1234Onayli.pdf, Agustos 2026) DOGRULANDI.
  // Not: 1-4. sinif Turkce, 5-8'den FARKLI olarak tema degil DIL BECERISI
  // bazinda yapilandirilmis (Dinleme/Konusma/Okuma/Yazma).
  "Turkce::Dinleme ve Izleme::4": ["Dinleme/Izlemeyi Yonetme", "Dinlediklerinden Anlam Olusturma", "Dinlediklerini Cozumleme", "Dinleme Surecini Degerlendirme"],
  "Turkce::Konusma::4": ["Konusmayi Yonetme", "Konusmada Icerik Olusturma", "Konusma Kurallarini Uygulama", "Konusma Surecini Degerlendirme"],
  "Turkce::Okuma::4": ["Okuma Surecini Yonetme", "Okuduklarindan Anlam Olusturma", "Okuduklarini Cozumleme", "Okuma Surecini Degerlendirme"],
  "Turkce::Yazma::4": ["Yazili Anlatimi Yonetme", "Yazida Icerik Olusturma", "Yazim Kurallarini Uygulama", "Yazma Surecini Degerlendirme"],
'''

if alt_marker not in content:
    print("HATA: alt konu marker'i bulunamadi, alt konular eklenemedi.")
else:
    content = content.replace(alt_marker, alt_yeni + alt_marker, 1)
    print("OK: 4 adet 4. sinif alt konu grubu eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDosya kaydedildi.")
