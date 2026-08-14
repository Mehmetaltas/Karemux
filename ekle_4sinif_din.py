with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

unite_marker = '  "5::Din Kulturu":'
unite_yeni = '  "4::Din Kulturu": ["Gunluk Hayat ve Din", "Allah Sevgisi", "Peygamberlerin Sevgisi", "Ahlaki Degerlerimiz", "Haklar ve Sorumluluklar"],\n'

if unite_marker not in content:
    print("HATA: '5::Din Kulturu' bulunamadi, unite eklenemedi.")
else:
    content = content.replace(unite_marker, unite_yeni + unite_marker, 1)
    print("OK: 4::Din Kulturu unite listesi eklendi.")

alt_marker = '  "Din Kulturu::Allah Inanci::5":'
alt_yeni = '''  // 4. sinif - resmi PDF'ten (din_kultur_4_8, Agustos 2026) DOGRULANDI.
  "Din Kulturu::Gunluk Hayat ve Din::4": ["Gunluk Hayatta Dini Ifadeler", "Temizlik ve Saglikli Beslenme", "Sukur"],
  "Din Kulturu::Allah Sevgisi::4": ["Allahin Birligi ve Yuceligi", "Allahin Kullarina Sevgisi", "Dua, Kelime-i Tevhit ve Sehadet"],
  "Din Kulturu::Peygamberlerin Sevgisi::4": ["Peygamberlerin Cocuklarla Iliskisi", "Cevre ve Calismayi Sevme"],
  "Din Kulturu::Ahlaki Degerlerimiz::4": ["Adalet", "Sabir", "Yardimseverlik"],
  "Din Kulturu::Haklar ve Sorumluluklar::4": ["Temel Hak ve Ozgurlukler", "Mahremiyet", "Allaha ve Insanlara Karsi Sorumluluklar"],
'''

if alt_marker not in content:
    print("HATA: alt konu marker'i bulunamadi, alt konular eklenemedi.")
else:
    content = content.replace(alt_marker, alt_yeni + alt_marker, 1)
    print("OK: 5 adet 4. sinif alt konu grubu eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDosya kaydedildi.")
