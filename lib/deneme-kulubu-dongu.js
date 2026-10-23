// Deneme Kulubu analiz -> tekrar dongusu (V3 Dalga 10): Deneme -> Sonuc -> Zayif alt konu -> Tek Konu -> Tekrar -> Yeni deneme.
// Saf fonksiyon: DB'den gelen kayitlardan "sirada ne yapmali" cikarir. Tahmin yok; yalniz gercek kayitlar.
export function netTrendi(denemeler) {
  // denemeler: [{ ad, net, tarih }] en yeni ilk
  const l = (denemeler || []).filter((d) => Number.isFinite(Number(d.net)));
  if (l.length < 2) return { yeterliVeri: false, fark: null, yon: "belirsiz" };
  const fark = Math.round((Number(l[0].net) - Number(l[1].net)) * 100) / 100;
  return { yeterliVeri: true, fark, yon: fark > 0 ? "yukseliyor" : fark < 0 ? "dusuyor" : "sabit" };
}

export function donguOnerileri({ denemeler = [], zayifKonular = [], bekleyenTekrar = 0 }) {
  const adimlar = [];
  if (bekleyenTekrar > 0) {
    adimlar.push({ sira: 1, tur: "tekrar", baslik: `Bugün ${bekleyenTekrar} tekrar sorun var`, aciklama: "Aralıklı tekrar: yanlış yaptığın sorular unutmadan önce yeniden karşına çıkar.", mod: "tekrarzamani" });
  }
  zayifKonular.slice(0, 3).forEach((z, i) => {
    adimlar.push({ sira: adimlar.length + 1, tur: "tek_konu", baslik: `${z.ders}: ${z.altKonu}`, aciklama: `${z.hataSayisi} çözülmemiş hatan var. Tek Konu Motoru ile bu konuyu kapat.`, mod: "tekkonu", ders: z.ders, altKonu: z.altKonu });
  });
  const trend = netTrendi(denemeler);
  if (denemeler.length === 0) {
    adimlar.push({ sira: adimlar.length + 1, tur: "ilk_deneme", baslik: "İlk denemeni çöz", aciklama: "Analiz ve öneriler deneme sonucuna göre oluşur.", mod: "ucretlideneme" });
  } else {
    adimlar.push({ sira: adimlar.length + 1, tur: "yeni_deneme", baslik: "Yeni denemeyle ölç", aciklama: zayifKonular.length ? "Zayıf konuları çalıştıktan sonra yeni denemeyle gelişimi gör." : "Düzenli deneme çözmeye devam et.", mod: "ucretlideneme" });
  }
  return { trend, adimlar };
}
