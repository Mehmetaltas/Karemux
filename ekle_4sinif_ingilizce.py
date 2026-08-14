with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

unite_marker = '  "5::Ingilizce":'
unite_yeni = '  "4::Ingilizce": ["School Life", "Classroom Life", "Personal Life", "Family Life", "Homes Houses and the Neighbourhood", "Life in the City and the World"],\n'

if unite_marker not in content:
    print("HATA: '5::Ingilizce' bulunamadi, unite eklenemedi.")
else:
    content = content.replace(unite_marker, unite_yeni + unite_marker, 1)
    print("OK: 4::Ingilizce unite listesi eklendi.")

alt_marker = '  "Ingilizce::School Life::5":'
alt_yeni = '''  // 4. sinif - resmi PDF'ten (english-regular, Agustos 2026) DOGRULANDI.
  "Ingilizce::School Life::4": ["Okulda Kisiler", "Gunluk Rutinler", "Sevilen Aktiviteler", "Sevilen Aylar", "Milli Gunler"],
  "Ingilizce::Classroom Life::4": ["Ders Konulari", "Sinif Etkinlikleri", "Mevsimler"],
  "Ingilizce::Personal Life::4": ["Fiziksel Gorunum ve Kisilik", "Kiyafetler", "Hobiler ve Yetenekler", "Hava Durumu", "Karsilastirmalar"],
  "Ingilizce::Family Life::4": ["Aile Uyelerinin Meslekleri", "Aile Aliskanliklari", "Aile Islerinin Yurutulmesi"],
  "Ingilizce::Homes Houses and the Neighbourhood::4": ["Mahalledeki Hizmet Yerleri", "Deniz Canlilari ve Yasam Alanlari", "Ev Turleri"],
  "Ingilizce::Life in the City and the World::4": ["Saglikli-Saglisiz Yiyecekler", "Ulusal ve Uluslararasi Yemekler", "Ulkeler", "Tatiller"],
'''

if alt_marker not in content:
    print("HATA: alt konu marker'i bulunamadi, alt konular eklenemedi.")
else:
    content = content.replace(alt_marker, alt_yeni + alt_marker, 1)
    print("OK: 6 adet 4. sinif alt konu grubu eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDosya kaydedildi.")
