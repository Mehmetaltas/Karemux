with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

unite_marker = '  "5::Matematik":'
unite_yeni = '  "4::Matematik": ["Sayilar ve Nicelikler", "Islemlerden Cebirsel Dusunmeye", "Nesnelerin Geometrisi", "Olaylarin Olasiligi ve Veriye Dayali Arastirma"],\n'

if unite_marker not in content:
    print("HATA: '5::Matematik' bulunamadi, unite eklenemedi.")
else:
    content = content.replace(unite_marker, unite_yeni + unite_marker, 1)
    print("OK: 4::Matematik unite listesi eklendi.")

alt_marker = '  "Matematik::Sayilar ve Nicelikler::5":'
alt_yeni = '''  // 4. sinif - resmi PDF'ten (2024programmat1234Onayli.pdf, Agustos 2026) DOGRULANDI.
  "Matematik::Sayilar ve Nicelikler::4": ["Cok Basamakli Sayilarin Temsili", "Sayilari Siralama", "Ritmik Sayma", "Sayi ve Sekil Oruntuleri", "Basit-Bilesik-Tam Sayili Kesirler", "Denk Kesirler", "Paydalari Esit Kesirlerle Toplama-Cikarma"],
  "Matematik::Islemlerden Cebirsel Dusunmeye::4": ["Zihinden Toplama-Cikarma", "Dort Basamakli Sayilarla Islemler", "Carpma-Bolme Tahmini ve Kisa Yollari", "Dort Islem Gerektiren Problemler", "Esitligin Farkli Anlamlari"],
  "Matematik::Nesnelerin Geometrisi::4": ["Geometrik Cisimlerin Acinimlari", "Kose ve Kenarlarina Gore Sekiller", "Cevre Uzunlugu Olcme", "Alan Tahmini", "Aci Kavrami ve Olcme", "Dar-Genis Aci Siniflandirma", "Simetri"],
  "Matematik::Olaylarin Olasiligi ve Veriye Dayali Arastirma::4": ["Olasilik (Imkansiz-Olabilir-Kesin)", "Kategorik ve Nicel Veri ile Arastirma"],
'''

if alt_marker not in content:
    print("HATA: alt konu marker'i bulunamadi, alt konular eklenemedi.")
else:
    content = content.replace(alt_marker, alt_yeni + alt_marker, 1)
    print("OK: 4 adet 4. sinif alt konu grubu eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDosya kaydedildi.")
