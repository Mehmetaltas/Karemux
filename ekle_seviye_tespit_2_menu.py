with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

marker = '                ["burslulukdeneme", "🎓 Bursluluk Sinavi (IOKBS)"],'
yeni = '''                ["burslulukdeneme", "🎓 Bursluluk Sinavi (IOKBS)"],
                ["seviyetespit", "🎯 Seviye Tespit Sinavi"],'''

if marker not in content:
    print("HATA: marker bulunamadi.")
else:
    content = content.replace(marker, yeni, 1)
    print("OK: Menuye Seviye Tespit Sinavi eklendi.")

marker2 = '                ["kurumpaneli", "🏢 Kurum Paneli"],'
yeni2 = '''                ["seviyetamamlama", "📶 Seviye Tamamlama"],
                ["kurumpaneli", "🏢 Kurum Paneli"],'''

if marker2 not in content:
    print("HATA: marker2 bulunamadi.")
else:
    content = content.replace(marker2, yeni2, 1)
    print("OK: Menuye Seviye Tamamlama eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)
