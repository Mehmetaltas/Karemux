with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

unite_marker = '  "5::Sosyal Bilgiler":'
unite_yeni = '  "4::Sosyal Bilgiler": ["Birlikte Yasamak", "Evimiz Dunya", "Ortak Mirasimiz", "Yasayan Demokrasimiz", "Hayatimizdaki Ekonomi", "Teknoloji ve Sosyal Bilimler"],\n'

if unite_marker not in content:
    print("HATA: '5::Sosyal Bilgiler' bulunamadi, unite eklenemedi.")
else:
    content = content.replace(unite_marker, unite_yeni + unite_marker, 1)
    print("OK: 4::Sosyal Bilgiler unite listesi eklendi.")

alt_marker = '  "Sosyal Bilgiler::Birlikte Yasamak::5":'
alt_yeni = '''  // 4. sinif - resmi PDF'ten (2024programsos4567Onayli.pdf, Agustos 2026) DOGRULANDI.
  "Sosyal Bilgiler::Birlikte Yasamak::4": ["Sosyal Bilgiler Dersinin Katkilari", "Bireysel Ozelliklere Saygi", "Toplumsal Birlik"],
  "Sosyal Bilgiler::Evimiz Dunya::4": ["Harita Kullanarak Konum ve Yon Bulma", "Doga ve Insan Iliskisi", "Afetlerin Etkilerini Azaltma"],
  "Sosyal Bilgiler::Ortak Mirasimiz::4": ["Gecmisten Gunumuze Oyun ve Oyuncaklar", "Aile Tarihi", "Yakin Cevredeki Ortak Miras Ogeleri"],
  "Sosyal Bilgiler::Yasayan Demokrasimiz::4": ["Cumhuriyetin Ilani ve Ataturk", "Cumhuriyetin Getirdigi Degisimler", "Okulda Demokratik Katilim"],
  "Sosyal Bilgiler::Hayatimizdaki Ekonomi::4": ["Dogal Kaynaklarin Tuketimi", "Istek ve Ihtiyac Arasindaki Secimler", "Uretim-Dagitim-Tuketim Sureci"],
  "Sosyal Bilgiler::Teknoloji ve Sosyal Bilimler::4": ["Cevrim Ici Guvenlik Kurallari", "Bilim Insanlarinin Cocukluk Hayati"],
'''

if alt_marker not in content:
    print("HATA: alt konu marker'i bulunamadi, alt konular eklenemedi.")
else:
    content = content.replace(alt_marker, alt_yeni + alt_marker, 1)
    print("OK: 6 adet 4. sinif alt konu grubu eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDosya kaydedildi.")
