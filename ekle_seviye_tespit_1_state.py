with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

marker = '  const [liderlikVeri, setLiderlikVeri] = useState(null);'
yeni = '''  const [liderlikVeri, setLiderlikVeri] = useState(null);

  // ==== SEVIYE TESPIT SINAVI ====
  const [seviyeTestSorulari, setSeviyeTestSorulari] = useState(null);
  const [seviyeTestCevaplar, setSeviyeTestCevaplar] = useState({});
  const [seviyeTestYukleniyor, setSeviyeTestYukleniyor] = useState(false);
  const [seviyeTestGonderiliyor, setSeviyeTestGonderiliyor] = useState(false);
  const [seviyeTestSonuc, setSeviyeTestSonuc] = useState(null);
  const [seviyeDurum, setSeviyeDurum] = useState(null);
  const [seviyeKademeIslemde, setSeviyeKademeIslemde] = useState(null);
  const [seviyeOnayTest, setSeviyeOnayTest] = useState(null);
  const [seviyeOnayCevaplar, setSeviyeOnayCevaplar] = useState({});
  const [seviyeOnayAktifKademe, setSeviyeOnayAktifKademe] = useState(null);

  useEffect(() => {
    if ((mod === "seviyetamamlama" || mod === "bos") && hesap) {
      fetch(`/api/seviye-tespit/durum?cihazId=${cihazIdRef.current}`).then((r) => r.json()).then(setSeviyeDurum).catch(() => {});
    }
  }, [mod, hesap?.eposta]);

  function seviyeTestKonulariniSec() {
    const dersler = ["Matematik", "Turkce", "Fen Bilimleri", "Sosyal Bilgiler"];
    const konular = [];
    for (const ders of dersler) {
      for (const kaynakSinif of [4, 5]) {
        const uniteler = MUFREDAT_DIGER_SINIFLAR[`${kaynakSinif}::${ders}`] || [];
        const secilenler = [...uniteler].sort(() => Math.random() - 0.5).slice(0, 2);
        for (const u of secilenler) konular.push({ ders, unite: u, sinif: kaynakSinif });
      }
    }
    return konular;
  }

  async function seviyeTestiBaslat() {
    setSeviyeTestYukleniyor(true); setHata(""); setSeviyeTestSonuc(null); setSeviyeTestCevaplar({});
    try {
      const konular = seviyeTestKonulariniSec();
      const res = await fetch("/api/seviye-tespit/olustur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konular }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeviyeTestSorulari(data.sorular);
    } catch (e) {
      setHata(temizHataMesaji(e, "Sinav olusturulamadi, tekrar dene."));
    } finally {
      setSeviyeTestYukleniyor(false);
    }
  }

  async function seviyeTestiGonder() {
    if (!seviyeTestSorulari) return;
    setSeviyeTestGonderiliyor(true); setHata("");
    try {
      const sonuclar = seviyeTestSorulari.map((s, i) => ({
        ders: s.ders, unite: s.unite, sinif: s.sinif,
        dogruMu: seviyeTestCevaplar[i] === s.dogruIndex,
      }));
      const res = await fetch("/api/seviye-tespit/gonder", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, sonuclar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeviyeTestSonuc(data);
    } catch (e) {
      setHata(temizHataMesaji(e, "Sinav gonderilemedi."));
    } finally {
      setSeviyeTestGonderiliyor(false);
    }
  }

  async function seviyeKademeIlerlet(kademeId, basariliMi) {
    setSeviyeKademeIslemde(kademeId); setHata("");
    try {
      const res = await fetch("/api/seviye-tespit/kademe-ilerlet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, kademeId, basariliMi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const yeni = await fetch(`/api/seviye-tespit/durum?cihazId=${cihazIdRef.current}`).then((r) => r.json());
      setSeviyeDurum(yeni);
      setSeviyeOnayTest(null); setSeviyeOnayAktifKademe(null); setSeviyeOnayCevaplar({});
    } catch (e) {
      setHata(temizHataMesaji(e, "Islenemedi."));
    } finally {
      setSeviyeKademeIslemde(null);
    }
  }

  async function seviyeOnayTestiBaslat(u) {
    setSeviyeOnayAktifKademe(u.id); setSeviyeOnayCevaplar({}); setHata("");
    try {
      const res = await fetch("/api/seviye-tespit/olustur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konular: [{ ders: u.ders, unite: u.unite, sinif: u.kaynak_sinif }, { ders: u.ders, unite: u.unite, sinif: u.kaynak_sinif }, { ders: u.ders, unite: u.unite, sinif: u.kaynak_sinif }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeviyeOnayTest({ kademeId: u.id, sorular: data.sorular });
    } catch (e) {
      setHata(temizHataMesaji(e, "Onay testi olusturulamadi."));
      setSeviyeOnayAktifKademe(null);
    }
  }

  function seviyeOnayTestiDegerlendir() {
    if (!seviyeOnayTest) return;
    const dogruSayisi = seviyeOnayTest.sorular.filter((s, i) => seviyeOnayCevaplar[i] === s.dogruIndex).length;
    const basariliMi = dogruSayisi >= 2;
    seviyeKademeIlerlet(seviyeOnayTest.kademeId, basariliMi);
  }
'''

if marker not in content:
    print("HATA: marker bulunamadi.")
else:
    content = content.replace(marker, yeni, 1)
    print("OK: Seviye tespit state ve fonksiyonlari eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)
