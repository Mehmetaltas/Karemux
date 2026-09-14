import sys

path = "app/page.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = r"""      let anlatimMetni = "";
      try {
        const onbellekRes = await fetch(`/api/icerik-onbellek?${onbellekParam.toString()}`);
        const onbellekData = await onbellekRes.json();
        if (onbellekData.bulundu) anlatimMetni = onbellekData.icerik;
      } catch (onbellekHata) {}

      if (!anlatimMetni) {
        const yasMetni = { 5: "10-11", 6: "11-12", 7: "12-13", 8: "13-14" }[sinif] || "13-14";
        const pAnlatim = `Sen deneyimli, alaninda uzman bir "${dersSec}" ogretmenisin. "${konuSec.trim()}" konusunu${uniteSec ? ` (${uniteSec} unitesinden)` : ""}, ${sinif}. sinifta okuyan ${yasMetni} yasindaki bir ogrenciye orta seviyede, ders kitabi diline uygun ama PROFESYONEL ve KALITELI bir dille, ozel ders yayinlarinin (MEB yayinlarindan daha ust seviye) kalitesinde anlat. SESIN COK ONEMLI - SU KURALA KESINLIKLE UY: Yazdigin HER CUMLE, gercek bir ogretmenin sinifta veya ozel derste, karsisindaki tek bir ogrenciye soyleyecegi CUMLE gibi olmali. Ornek FARK: "Once toplam ogrenci sayisi 24'tur. En az bir ders alanlar = 10+12-6=16." gibi SOGUK/DERS KITABI cumleleri KESINLIKLE YAZMA. Onun yerine: "Bak, once elimizdeki toplam sayiya bakalim: 24 ogrenci var. Simdi 'en az bir ders alan' kac kisi, onu bulalim..." gibi, KONUSUR gibi yaz. Her 2-3 cumlede bir "bak", "simdi", "dikkat et", "iste burada" gibi bir hitap MUTLAKA olsun. Cumleler kisa olsun (ortalama 8-12 kelime), art arda uzun/resmi cumleler yazma. ONEMLI: Konuyu OLDUGUNDAN KOLAY GOSTERME, gercek sinav zorlugunu yansit. AYNEN SU FORMATTA yaz (basliklari birebir kullan): once konunun tanimini ve neden onemli oldugunu 2-3 cumleyle ver. Sonra her alt kavram icin "Ornek:" diye etiketlenmis en az bir somut, sayisal ornek coz (adim adim). En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle (sik yapilan hatalar, ipuclari). Toplamda 350-450 kelime. SADECE duz metin yaz: markdown (yildiz **, baslik #), LaTeX (dolar isareti $, \\sqrt, \\frac gibi komutlar) KULLANMA. Matematik ifadelerini normal klavye karakterleriyle yaz (ornek: "karekok 12", "3 uzeri 2", "1/2" gibi). SADECE Turkce yaz, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan.`;
        anlatimMetni = await aiIstek(pAnlatim, 3200, cihazIdRef.current);
        anlatimMetni = metinTemizle(anlatimMetni);
        fetch("/api/icerik-onbellek", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sinif, ders: dersSec, unite: uniteSec || "", konu: konuSec.trim(), zorlukSeviyesi: "", icerikTuru: "tek_konu_anlatimi", icerik: anlatimMetni }),
        }).catch(() => {});
      }
      setTekKonuAnlatim(anlatimMetni);
      gorselKararIste(dersSec, konuSec.trim(), sinif, cihazIdRef.current).then(setTekKonuGorselSvg);

      const pSorular = `Sen bir LGS/ortaokul ogretmenisin. "${dersSec}" dersinden${uniteSec ? ` (${uniteSec} unitesinden)` : ""} "${konuSec.trim()}" konusuyla ilgili ${sinif}. sinif seviyesinde TAM 10 coktan secmeli soru hazirla: ILK 4 SORU KOLAY, SONRAKI 4 SORU ORTA, SON 2 SORU ZOR olsun (sirali ver). Sorular mantik yurutme ve yorum gerektiren tarzda olsun, ezber bilgi sorma. SADECE JSON dondur, markdown kullanma. SADECE Turkce yaz, Latin alfabesi disinda TEK BIR karakter bile kullanma: [{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]`;
      const cevapSorular = await aiIstek(pSorular, 5000, cihazIdRef.current, true);
      const temiz = jsonMetniTemizle(cevapSorular);
      const parcaTemiz = temiz.slice(temiz.indexOf("["), temiz.lastIndexOf("]") + 1)
        .replace(/"dogruIndex"\s*:\s*"?([A-D])"?/gi, (_, harf) => `"dogruIndex":${harf.toUpperCase().charCodeAt(0) - 65}`);
      const sorularVeri = JSON.parse(parcaTemiz);
      if (!Array.isArray(sorularVeri) || sorularVeri.length === 0) throw new Error("Sorular uretilemedi");
      setTekKonuSorular(sorularVeri);"""

new = r"""      let anlatimMetni = "";
      let sorularVeri = null;
      try {
        const onbellekRes = await fetch(`/api/icerik-onbellek?${onbellekParam.toString()}`);
        const onbellekData = await onbellekRes.json();
        if (onbellekData.bulundu) {
          anlatimMetni = onbellekData.icerik;
          if (onbellekData.icerikJson && Array.isArray(onbellekData.icerikJson.sorular) && onbellekData.icerikJson.sorular.length > 0) {
            sorularVeri = onbellekData.icerikJson.sorular;
          }
        }
      } catch (onbellekHata) {}

      if (!anlatimMetni) {
        const yasMetni = { 5: "10-11", 6: "11-12", 7: "12-13", 8: "13-14" }[sinif] || "13-14";
        const pAnlatim = `Sen deneyimli, alaninda uzman bir "${dersSec}" ogretmenisin. "${konuSec.trim()}" konusunu${uniteSec ? ` (${uniteSec} unitesinden)` : ""}, ${sinif}. sinifta okuyan ${yasMetni} yasindaki bir ogrenciye orta seviyede, ders kitabi diline uygun ama PROFESYONEL ve KALITELI bir dille, ozel ders yayinlarinin (MEB yayinlarindan daha ust seviye) kalitesinde anlat. SESIN COK ONEMLI - SU KURALA KESINLIKLE UY: Yazdigin HER CUMLE, gercek bir ogretmenin sinifta veya ozel derste, karsisindaki tek bir ogrenciye soyleyecegi CUMLE gibi olmali. Ornek FARK: "Once toplam ogrenci sayisi 24'tur. En az bir ders alanlar = 10+12-6=16." gibi SOGUK/DERS KITABI cumleleri KESINLIKLE YAZMA. Onun yerine: "Bak, once elimizdeki toplam sayiya bakalim: 24 ogrenci var. Simdi 'en az bir ders alan' kac kisi, onu bulalim..." gibi, KONUSUR gibi yaz. Her 2-3 cumlede bir "bak", "simdi", "dikkat et", "iste burada" gibi bir hitap MUTLAKA olsun. Cumleler kisa olsun (ortalama 8-12 kelime), art arda uzun/resmi cumleler yazma. ONEMLI: Konuyu OLDUGUNDAN KOLAY GOSTERME, gercek sinav zorlugunu yansit. AYNEN SU FORMATTA yaz (basliklari birebir kullan): once konunun tanimini ve neden onemli oldugunu 2-3 cumleyle ver. Sonra her alt kavram icin "Ornek:" diye etiketlenmis en az bir somut, sayisal ornek coz (adim adim). En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle (sik yapilan hatalar, ipuclari). Toplamda 350-450 kelime. SADECE duz metin yaz: markdown (yildiz **, baslik #), LaTeX (dolar isareti $, \\sqrt, \\frac gibi komutlar) KULLANMA. Matematik ifadelerini normal klavye karakterleriyle yaz (ornek: "karekok 12", "3 uzeri 2", "1/2" gibi). SADECE Turkce yaz, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan.`;
        anlatimMetni = await aiIstek(pAnlatim, 3200, cihazIdRef.current);
        anlatimMetni = metinTemizle(anlatimMetni);
      }
      setTekKonuAnlatim(anlatimMetni);
      gorselKararIste(dersSec, konuSec.trim(), sinif, cihazIdRef.current).then(setTekKonuGorselSvg);

      let yeniUretim = false;
      if (!sorularVeri) {
        yeniUretim = true;
        const pSorular = `Sen bir LGS/ortaokul ogretmenisin. "${dersSec}" dersinden${uniteSec ? ` (${uniteSec} unitesinden)` : ""} "${konuSec.trim()}" konusuyla ilgili ${sinif}. sinif seviyesinde TAM 10 coktan secmeli soru hazirla: ILK 4 SORU KOLAY, SONRAKI 4 SORU ORTA, SON 2 SORU ZOR olsun (sirali ver). Sorular mantik yurutme ve yorum gerektiren tarzda olsun, ezber bilgi sorma. SADECE JSON dondur, markdown kullanma. SADECE Turkce yaz, Latin alfabesi disinda TEK BIR karakter bile kullanma: [{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]`;
        const cevapSorular = await aiIstek(pSorular, 5000, cihazIdRef.current, true);
        const temiz = jsonMetniTemizle(cevapSorular);
        const parcaTemiz = temiz.slice(temiz.indexOf("["), temiz.lastIndexOf("]") + 1)
          .replace(/"dogruIndex"\s*:\s*"?([A-D])"?/gi, (_, harf) => `"dogruIndex":${harf.toUpperCase().charCodeAt(0) - 65}`);
        sorularVeri = JSON.parse(parcaTemiz);
        if (!Array.isArray(sorularVeri) || sorularVeri.length === 0) throw new Error("Sorular uretilemedi");
      }
      if (yeniUretim) {
        fetch("/api/icerik-onbellek", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sinif, ders: dersSec, unite: uniteSec || "", konu: konuSec.trim(), zorlukSeviyesi: "", icerikTuru: "tek_konu_anlatimi", icerik: anlatimMetni, icerikJson: { sorular: sorularVeri } }),
        }).catch(() => {});
      }
      setTekKonuSorular(sorularVeri);"""

count = content.count(old)
if count != 1:
    print(f"HATA: eslesme sayisi {count} (1 olmali) - degisiklik YAPILMADI")
    sys.exit(1)

content = content.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("BASARILI: yama uygulandi")
