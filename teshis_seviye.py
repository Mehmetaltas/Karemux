with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

eski = '''      setSeviyeTestSorulari(data.sorular);
    } catch (e) {
      setHata(temizHataMesaji(e, "Sinav olusturulamadi, tekrar dene."));'''

yeni = '''      setSeviyeTestSorulari(data.sorular);
    } catch (e) {
      setHata("TESHIS: " + (e && e.message ? e.message : String(e)));'''

if eski not in content:
    print("HATA: eski blok bulunamadi.")
else:
    content = content.replace(eski, yeni, 1)
    print("OK: Teshis modu acildi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)
