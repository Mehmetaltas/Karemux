with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

unite_marker = '  "5::Fen Bilimleri":'
unite_yeni = '  "4::Fen Bilimleri": ["Bilime Yolculuk", "Saglikli Besleniyorum", "Dunyamizi Kesfedelim", "Maddenin Degisimi", "Miknatisi Kesfediyorum", "Enerji Dedektifleri", "Isigin Pesinde", "Surdurulebilir Sehirler ve Topluluklar"],\n'

if unite_marker not in content:
    print("HATA: '5::Fen Bilimleri' bulunamadi, unite eklenemedi.")
else:
    content = content.replace(unite_marker, unite_yeni + unite_marker, 1)
    print("OK: 4::Fen Bilimleri unite listesi eklendi.")

alt_marker = '  "Fen Bilimleri::Gunes Sistemi ve Tutulmalar::6":'
alt_yeni = '''  // 4. sinif - resmi PDF'ten (2024programfen345678Onayli.pdf, Agustos 2026) DOGRULANDI.
  // Not: 2 unitenin (Bilime Yolculuk, Isigin Pesinde) aciklamasi PDF'te sayfa
  // kesintisi yuzunden tam cikarilamadi, unite isminden makul cikarim yapildi.
  "Fen Bilimleri::Bilime Yolculuk::4": ["Bilimin Ozellikleri", "Bilimsel Bilgi Kaynaklarinin Guvenilirligi"],
  "Fen Bilimleri::Saglikli Besleniyorum::4": ["Besin Gruplari", "Dengeli Beslenme"],
  "Fen Bilimleri::Dunyamizi Kesfedelim::4": ["Dunyanin Sekli", "Dunyanin Yapisi (Hava-Su-Tas-Canli Kure)", "Dunyanin Hareketleri"],
  "Fen Bilimleri::Maddenin Degisimi::4": ["Maddelerin Hal Degisimi", "Isi Etkisiyle Degisim"],
  "Fen Bilimleri::Miknatisi Kesfediyorum::4": ["Miknatis Kutuplari ve Etkilesimi", "Miknatisin Etki Ettigi Maddeler"],
  "Fen Bilimleri::Enerji Dedektifleri::4": ["Basit Elektrik Devresi", "Yenilenebilir ve Yenilenemeyen Enerji Kaynaklari"],
  "Fen Bilimleri::Isigin Pesinde::4": ["Isik Kaynaklari", "Golge Olusumu"],
  "Fen Bilimleri::Surdurulebilir Sehirler ve Topluluklar::4": ["Surdurulebilir Yasam Alani Kurma"],
'''

if alt_marker not in content:
    print("HATA: alt konu marker'i bulunamadi, alt konular eklenemedi.")
else:
    content = content.replace(alt_marker, alt_yeni + alt_marker, 1)
    print("OK: 8 adet 4. sinif alt konu grubu eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDosya kaydedildi.")
