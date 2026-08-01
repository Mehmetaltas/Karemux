"use client";
import { useState, useEffect, useRef } from "react";

const TEMALAR = {
  orman: {
    isim: "Orman", ikon: "🌲",
    bg: "#1F3D2E", page: "#FAF6EE", ink: "#1B2430", muted: "#6B7566",
    coral: "#FF6B5E", mustard: "#E8B339", line: "#DCD5C4",
    gradient: "linear-gradient(160deg, #24402F 0%, #1A2E22 100%)",
  },
  galaktik: {
    isim: "Galaktik", ikon: "🌌",
    bg: "#0D0B1F", page: "#F4F2FF", ink: "#1A1730", muted: "#8A7FC7",
    coral: "#FF5CA8", mustard: "#7C4DFF", line: "#3A3268",
    gradient: "linear-gradient(160deg, #241B4A 0%, #0D0B1F 100%)",
  },
  hologram: {
    isim: "Hologram", ikon: "💠",
    bg: "#071A22", page: "#EAFBFF", ink: "#062830", muted: "#4FB8C9",
    coral: "#00E5C7", mustard: "#00B8FF", line: "#0F3A44",
    gradient: "linear-gradient(160deg, #0D3A44 0%, #071A22 100%)",
  },
  uzay: {
    isim: "Uzay", ikon: "🪐",
    bg: "#14121F", page: "#FDF6EC", ink: "#221D33", muted: "#9C8FB5",
    coral: "#FF9A3C", mustard: "#FFD166", line: "#3A3352",
    gradient: "linear-gradient(160deg, #241F3D 0%, #14121F 100%)",
  },
};

const DERSLER = [
  { ad: "Matematik", emoji: "➗" }, { ad: "Fen Bilimleri", emoji: "🔬" },
  { ad: "Turkce", emoji: "📖" }, { ad: "T.C. Inkilap Tarihi", emoji: "🏛️" },
  { ad: "Din Kulturu", emoji: "🕌" }, { ad: "Ingilizce", emoji: "🇬🇧" },
];

// Gercek MEB 8. sinif (LGS) mufredati - ders bazinda unite listesi.
// Kaynak: MEB güncel müfredat + LGS konu dağılımı analizleri (2026).
const MUFREDAT = {
  "Matematik": ["Carpanlar ve Katlar", "Uslu Ifadeler", "Karekoklu Ifadeler", "Veri Analizi", "Olasilik", "Cebirsel Ifadeler ve Ozdeslikler", "Dogrusal Denklemler", "Esitsizlikler", "Ucgenler", "Eslik ve Benzerlik", "Donusum Geometrisi", "Geometrik Cisimler"],
  "Fen Bilimleri": ["Mevsimler ve Iklim", "DNA ve Genetik Kod", "Basinc", "Madde ve Endustri", "Basit Makineler", "Enerji Donusumleri ve Cevre Bilimi", "Elektrik Yukleri ve Elektrik Enerjisi"],
  "Turkce": ["Fiilimsiler", "Cumlenin Ogeleri", "Cumle Turleri", "Anlatim Bozukluklari", "Yazim Kurallari", "Noktalama Isaretleri", "Paragrafta Anlam", "Soz Sanatlari", "Fiilde Cati"],
  "T.C. Inkilap Tarihi": ["Bir Kahraman Doguyor", "Milli Uyanis: Bagimsizlik Yolunda Atilan Adimlar", "Ya Istiklal Ya Olum", "Ataturkculuk ve Cagdaslasan Turkiye", "Demokratiklesme Cabalari", "Ataturk Donemi Turk Dis Politikasi", "Ataturk'un Olumu ve Sonrasi", "II. Dunya Savasi Surecinde Turkiye"],
  "Din Kulturu": ["Kader Inanci", "Zekat ve Sadaka", "Hz. Muhammed'in Ornekligi", "Kur'an-i Kerim'de Sunulan Ornek Sahsiyetler", "Din ve Hayat"],
  "Ingilizce": ["Friendship", "Teen Life", "In the Kitchen", "On the Phone", "The Internet", "Adventures", "Tourism", "Chores", "Science", "Natural Forces"],
};

// DOGRULANMIS MEB kazanim verisi (8. sinif Matematik) - resmi ogretim programindan
// arastirilip alinmistir, AI tarafindan uydurulmamistir. Sadece dogrulanan uniteler
// burada var; digerleri icin sistem AI'a alt konu onerdirir (ayri, acik etiketle).
const DOGRULANMIS_ALT_KONULAR = {
  "Matematik::Carpanlar ve Katlar": ["Asal Carpanlara Ayirma", "EBOB Hesaplama", "EKOK Hesaplama", "Aralarinda Asal Sayilar"],
  "Matematik::Uslu Ifadeler": ["Tam Sayi Kuvvetleri", "Uslu Ifadelerde Temel Kurallar", "Bilimsel Gosterim"],
  "Matematik::Karekoklu Ifadeler": ["Tam Kare Olmayan Sayinin Karekoku", "Kareklu Ifadeleri Sadelestirme", "Kareklu Ifadelerde Carpma-Bolme", "Kareklu Ifadelerde Toplama-Cikarma", "Rasyonel ve Irrasyonel Sayilar"],
  "Matematik::Veri Analizi": ["Cizgi ve Sutun Grafigi Yorumlama", "Grafik Turleri Arasi Donusum"],
  "Matematik::Cebirsel Ifadeler ve Ozdeslikler": ["Ozdeslikler", "Cebirsel Ifadeleri Carpanlara Ayirma"],
  "Matematik::Dogrusal Denklemler": ["Birinci Dereceden Bir Bilinmeyenli Denklemler"],
};

function denemeKapsamiHesapla(dersAdi, tur) {
  const tumUniteler = MUFREDAT[dersAdi] || [];
  const yari = Math.ceil(tumUniteler.length / 2);
  const donem1 = tumUniteler.slice(0, yari);
  const donem2 = tumUniteler.slice(yari);
  if (tur === "deneme" || tumUniteler.length === 0) return tumUniteler;
  const donem1Yari = Math.ceil(donem1.length / 2);
  if (tur === "yazili1") return donem1.slice(0, donem1Yari);
  if (tur === "yazili2") return donem1;
  return donem2; // yazili3
}

// Onerilen soru sayisi kapsam turune gore - kullanici yine de degistirebilir.
function onerilenSoruSayisi(kapsamTuru) {
  if (kapsamTuru === "konu") return 5;
  if (kapsamTuru === "unite") return 8;
  return 10; // donem
}

// Auth henuz yok — tarayicida kalici anonim bir kimlik uretip ilerlemeyi buna bagliyoruz.
function cihazIdAl() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("karemux_cihaz_id");
  if (!id) {
    id = "cihaz-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("karemux_cihaz_id", id);
  }
  return id;
}

// Tarayicidan DOGRUDAN Anthropic'e degil, kendi /api/claude route'umuza istek atiyoruz.
// API anahtari sadece sunucuda (Vercel env) tutulur.
async function aiIstek(prompt, maxTokens, cihazId, jsonModu) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens, cihazId, jsonModu }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "AI istegi basarisiz");
  return data.text;
}

// Uretilen sorulari kalici soru bankasina arsivler - sessizce, hata olsa da akisi bozmaz.
function sorulariBankayaKaydet(ders, sinif, unite, sorular, kaynakTuru) {
  if (!sorular || sorular.length === 0) return;
  fetch("/api/soru-bankasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ders, sinif, unite, sorular, kaynakTuru }),
  }).catch(() => {});
}

export default function Ana() {
  const [mod, setMod] = useState("bos");
  const [secilenDers, setSecilenDers] = useState(null);
  const [tema, setTema] = useState("orman");
  const COLORS = TEMALAR[tema];

  useEffect(() => {
    try {
      const kayitliTema = localStorage.getItem("karemux_tema");
      if (kayitliTema && TEMALAR[kayitliTema]) setTema(kayitliTema);
    } catch (e) {}
  }, []);

  function temaDegistir(yeniTema) {
    setTema(yeniTema);
    try { localStorage.setItem("karemux_tema", yeniTema); } catch (e) {}
  }
  const [menuAcik, setMenuAcik] = useState(false);

  function modGecis(yeniMod) {
    setMod(yeniMod);
    setMenuAcik(false);
    setDenemeSorulari(null); setDenemeCevaplar({}); setDenemeGonderildi(false); setDenemeBelgesi(null);
    setQuiz(null); setCevaplar({}); setGonderildi(false); setAciklama(""); setParagrafMetni("");
  }
  const [sinif, setSinif] = useState(8);
  const [ders, setDers] = useState(null);
  const [konu, setKonu] = useState("");
  const [uniteSec, setUniteSec] = useState(null);
  const [tamamlananUniteler, setTamamlananUniteler] = useState({}); // { [ders]: [unite1, unite2, ...] }
  const [tamamlananAltKonular, setTamamlananAltKonular] = useState({}); // { [ders+"::"+unite]: [altKonu1, ...] }
  const [altKonuCache, setAltKonuCache] = useState({}); // { [ders+"::"+unite]: [altKonu1, altKonu2, ...] }
  const [altKonuYukleniyor, setAltKonuYukleniyor] = useState(false);
  const [aktifAltKonu, setAktifAltKonu] = useState(null);

  useEffect(() => {
    try {
      const kayitli = localStorage.getItem("karemux_tamamlanan_uniteler");
      if (kayitli) setTamamlananUniteler(JSON.parse(kayitli));
      const kayitliAlt = localStorage.getItem("karemux_tamamlanan_alt_konular");
      if (kayitliAlt) setTamamlananAltKonular(JSON.parse(kayitliAlt));
    } catch (e) {}
  }, []);

  function uniteTamamlandiIsaretle(dersAdi, uniteAdi) {
    setTamamlananUniteler((eski) => {
      const guncel = { ...eski, [dersAdi]: [...new Set([...(eski[dersAdi] || []), uniteAdi])] };
      try { localStorage.setItem("karemux_tamamlanan_uniteler", JSON.stringify(guncel)); } catch (e) {}
      return guncel;
    });
  }

  function uniteAcikMi(dersAdi, uniteAdi) {
    const tumUniteler = MUFREDAT[dersAdi] || [];
    const indeks = tumUniteler.indexOf(uniteAdi);
    if (indeks <= 0) return true; // ilk unite her zaman acik
    const tamamlanan = tamamlananUniteler[dersAdi] || [];
    return tamamlanan.includes(tumUniteler[indeks - 1]); // bir onceki unite tamamlanmis mi
  }

  function altKonuAnahtari(dersAdi, uniteAdi) { return `${dersAdi}::${uniteAdi}`; }

  async function altKonulariGetir(dersAdi, uniteAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    if (altKonuCache[anahtar]) return; // zaten var, tekrar uretme
    if (DOGRULANMIS_ALT_KONULAR[anahtar]) {
      // Gercek MEB kazanimi var, AI'a sormaya gerek yok
      setAltKonuCache((eski) => ({ ...eski, [anahtar]: DOGRULANMIS_ALT_KONULAR[anahtar] }));
      return;
    }
    setAltKonuYukleniyor(true);
    try {
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${dersAdi}" dersinin "${uniteAdi}" unitesini, ogrencinin sirayla calisabilecegi 4-6 kisa ALT KONU basligina bol (orn. "Asal Carpanlar", "EBOB Hesabi" gibi kisa, 2-4 kelimelik basliklar). Bu senin onerdigin bir calisma sirasi olsun, MEB'in resmi bir listesi oldugunu iddia etme. SADECE JSON dizisi dondur, baska hicbir aciklama ekleme, markdown kullanma:
["Alt Konu 1","Alt Konu 2","Alt Konu 3"]`;
      const cevap = await aiIstek(p, 500, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff]+/g, "").trim();
      const baslangic = temiz.indexOf("[");
      const bitis = temiz.lastIndexOf("]");
      if (baslangic === -1 || bitis === -1) throw new Error("liste alinamadi");
      const liste = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setAltKonuCache((eski) => ({ ...eski, [anahtar]: liste }));
    } catch (e) {
      setAltKonuCache((eski) => ({ ...eski, [anahtar]: [] })); // basarisizsa bos liste, serbest metne dusulur
    } finally {
      setAltKonuYukleniyor(false);
    }
  }

  function altKonuAcikMi(dersAdi, uniteAdi, altKonuAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    const liste = altKonuCache[anahtar] || [];
    const indeks = liste.indexOf(altKonuAdi);
    if (indeks <= 0) return true;
    const tamamlanan = tamamlananAltKonular[anahtar] || [];
    return tamamlanan.includes(liste[indeks - 1]);
  }

  function altKonuTamamlandiMi(dersAdi, uniteAdi, altKonuAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    return (tamamlananAltKonular[anahtar] || []).includes(altKonuAdi);
  }

  function altKonuTamamlandiIsaretle(dersAdi, uniteAdi, altKonuAdi) {
    const anahtar = altKonuAnahtari(dersAdi, uniteAdi);
    setTamamlananAltKonular((eski) => {
      const guncel = { ...eski, [anahtar]: [...new Set([...(eski[anahtar] || []), altKonuAdi])] };
      try { localStorage.setItem("karemux_tamamlanan_alt_konular", JSON.stringify(guncel)); } catch (e) {}
      // Tum alt konular tamamlandiysa uniteyi de tamamlandi say
      const liste = altKonuCache[anahtar] || [];
      if (liste.length > 0 && liste.every((ak) => guncel[anahtar].includes(ak))) {
        uniteTamamlandiIsaretle(dersAdi, uniteAdi);
      }
      return guncel;
    });
  }
  const [zorlukSec, setZorlukSec] = useState("orta"); // "basit" | "orta" | "zor"

  // Sinav (Yazili/Deneme ortak) - Kapsam: konu | unite | donem
  const [denemeDers, setDenemeDers] = useState(null);
  const [denemeTuru, setDenemeTuru] = useState("deneme"); // "deneme" | "yazili1" | "yazili2" | "yazili3"
  const [kapsamTuru, setKapsamTuru] = useState("donem"); // "konu" | "unite" | "donem"
  const [kapsamUnite, setKapsamUnite] = useState(null);
  const [kapsamKonu, setKapsamKonu] = useState("");
  const [sinavSoruSayisi, setSinavSoruSayisi] = useState(10);
  const [yaziliDonemNo, setYaziliDonemNo] = useState("yazili1"); // "yazili1" | "yazili2" | "yazili3"
  const [denemeDonemNo, setDenemeDonemNo] = useState("tam"); // "1" | "2" | "tam"

  // Seviye Tespit Sinavi
  const [seviyeSorulari, setSeviyeSorulari] = useState(null);
  const [seviyeCevaplar, setSeviyeCevaplar] = useState({});
  const [seviyeGonderildi, setSeviyeGonderildi] = useState(false);
  const [seviyeRaporu, setSeviyeRaporu] = useState(null); // { [ders]: { dogru, toplam, seviye } }
  const [denemeSorulari, setDenemeSorulari] = useState(null);
  const [denemeCevaplar, setDenemeCevaplar] = useState({});
  const [denemeGonderildi, setDenemeGonderildi] = useState(false);
  const [aciklama, setAciklama] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [cevaplar, setCevaplar] = useState({});
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(null);
  const [hata, setHata] = useState("");
  const cihazIdRef = useRef(null);

  const [zayifDersler, setZayifDersler] = useState([]);
  const [otomatikTespit, setOtomatikTespit] = useState(false);
  const [haftalikSaat, setHaftalikSaat] = useState(10);
  const [kalanHafta, setKalanHafta] = useState(8);
  const [plan, setPlan] = useState("");

  const [checkoutHtml, setCheckoutHtml] = useState("");
  const [odemeHata, setOdemeHata] = useState("");
  const [aktifAbonelik, setAktifAbonelik] = useState(null);
  const [iptalMesaji, setIptalMesaji] = useState("");

  // Hesap
  const [hesap, setHesap] = useState(null); // {ad, eposta, rol, eposta_dogrulandi, veli_baglanti_kodu} | null
  const [hesapModu, setHesapModu] = useState("giris"); // "giris" | "kayit"
  const [epostaGir, setEpostaGir] = useState("");
  const [sifreGir, setSifreGir] = useState("");
  const [adGir, setAdGir] = useState("");
  const [rolSec, setRolSec] = useState("ogrenci"); // "ogrenci" | "veli"
  const [hesapHata, setHesapHata] = useState("");

  // E-posta dogrulama
  const [dogrulamaKoduGir, setDogrulamaKoduGir] = useState("");
  const [dogrulamaMesaj, setDogrulamaMesaj] = useState("");

  // Veli baglantisi
  const [baglantiKoduGir, setBaglantiKoduGir] = useState("");
  const [veliMesaj, setVeliMesaj] = useState("");
  const [veliOgrenciler, setVeliOgrenciler] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.girisYapmis) setHesap(d.kullanici);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (hesap?.rol === "veli") {
      fetch("/api/veli/ilerleme").then((r) => r.json()).then((d) => {
        if (d.ogrenciler) setVeliOgrenciler(d.ogrenciler);
      }).catch(() => {});
    }
  }, [hesap]);

  useEffect(() => {
    if (hesap) {
      fetch("/api/abonelik/durum").then((r) => r.json()).then((d) => setAktifAbonelik(d.aktifAbonelik)).catch(() => {});
    }
  }, [hesap]);

  async function abonelikIptalEt() {
    setIptalMesaji("");
    try {
      const res = await fetch("/api/abonelik/iptal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIptalMesaji(data.mesaj);
      setAktifAbonelik(null);
    } catch (e) {
      setIptalMesaji("Iptal edilemedi: " + e.message);
    }
  }

  // Soru Coz (fotografla)
  const [soruGorseli, setSoruGorseli] = useState(null);
  const [soruCozumu, setSoruCozumu] = useState("");

  useEffect(() => {
    cihazIdRef.current = cihazIdAl();
    if (!cihazIdRef.current) return;
    fetch(`/api/ilerleme?cihazId=${cihazIdRef.current}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.zayifDersler?.length) {
          setZayifDersler(d.zayifDersler);
          setOtomatikTespit(true);
        }
      })
      .catch(() => {}); // ilk kullanimda gecmis yoktur, sessizce gec
  }, []);

  function dersToggle(ad) {
    setOtomatikTespit(false);
    setZayifDersler((l) => (l.includes(ad) ? l.filter((x) => x !== ad) : [...l, ad]));
  }

  async function ilerlemeyiKaydet(dersAdi, konuAdi, dogru, toplam) {
    if (!cihazIdRef.current) return;
    try {
      await fetch("/api/ilerleme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, ders: dersAdi, konu: konuAdi, dogruSayisi: dogru, toplamSoru: toplam }),
      });
    } catch (e) { /* sessizce gec - ilerleme kaydi kritik degil */ }
  }

  async function hesapGonder() {
    setHesapHata("");
    const url = hesapModu === "giris" ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: epostaGir, sifre: sifreGir, ad: adGir, rol: rolSec }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Tam kullanici bilgisini (rol, dogrulama durumu, veli kodu dahil) tazele
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (me.girisYapmis) setHesap(me.kullanici);
      const p = await fetch(`/api/ilerleme?cihazId=${cihazIdRef.current}`).then((r) => r.json());
      if (p.zayifDersler?.length) { setZayifDersler(p.zayifDersler); setOtomatikTespit(true); }
    } catch (e) {
      setHesapHata(e.message || "Islem basarisiz");
    }
  }

  async function cikisYap() {
    await fetch("/api/auth/logout", { method: "POST" });
    setHesap(null);
    setVeliOgrenciler([]);
  }

  async function dogrulaGonder() {
    setDogrulamaMesaj("");
    try {
      const res = await fetch("/api/auth/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: dogrulamaKoduGir }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHesap((h) => ({ ...h, eposta_dogrulandi: true }));
      setDogrulamaMesaj("E-postan dogrulandi!");
    } catch (e) {
      setDogrulamaMesaj(e.message || "Dogrulama basarisiz");
    }
  }

  async function kodTekrarGonder() {
    setDogrulamaMesaj("");
    try {
      const res = await fetch("/api/auth/dogrulama-kodu-gonder", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDogrulamaMesaj("Yeni kod gonderildi, gelen kutunu kontrol et.");
    } catch (e) {
      setDogrulamaMesaj(e.message || "Kod gonderilemedi");
    }
  }

  async function veliBaglan() {
    setVeliMesaj("");
    try {
      const res = await fetch("/api/veli/baglan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: baglantiKoduGir }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVeliMesaj(`${data.ogrenciAdi} adli ogrenciye baglandin.`);
      setBaglantiKoduGir("");
      const d = await fetch("/api/veli/ilerleme").then((r) => r.json());
      if (d.ogrenciler) setVeliOgrenciler(d.ogrenciler);
    } catch (e) {
      setVeliMesaj(e.message || "Baglanti kurulamadi");
    }
  }

  async function soruGorseliCoz(dosya) {
    setYukleniyor("soru"); setHata(""); setSoruCozumu("");
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result.split(",")[1]);
        r.onerror = reject;
        r.readAsDataURL(dosya);
      });
      const res = await fetch("/api/soru-coz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: dosya.type, ders, cihazId: cihazIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSoruCozumu(data.cozum);
    } catch (e) {
      setHata(e.message || "Soru cozulemedi, tekrar dene.");
    } finally {
      setYukleniyor(null);
    }
  }

  async function konuAnlat() {
    if (!ders || !konu.trim()) return;
    setYukleniyor("aciklama"); setHata(""); setAciklama(""); setQuiz(null); setGonderildi(false);
    try {
      const uniteMetni = uniteSec ? ` (${uniteSec} unitesinden)` : "";
      const yasMetni = { 5: "10-11", 6: "11-12", 7: "12-13", 8: "13-14" }[sinif] || "13-14";
      const zorlukMetni = { basit: "cok basit ve yavas, temel seviyeden baslayarak", orta: "orta seviyede, ders kitabi diline uygun", zor: "ileri seviyede, LGS'de sik cikan zorlayici detaylara da deginerek" }[zorlukSec];
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni} "${konu}" konusunu, ${sinif}. sinifta okuyan ${yasMetni} yasindaki bir ogrenciye ${zorlukMetni} bir dille anlat. Madde isaretleri ve kisa paragraflar kullan. En fazla 250 kelime. SADECE duz metin yaz: markdown (yildiz **, baslik #), LaTeX (dolar isareti $, \\sqrt, \\frac gibi komutlar) KULLANMA. Matematik ifadelerini normal klavye karakterleriyle yaz (ornek: "karekok 12", "3 uzeri 2", "1/2" gibi). SADECE Turkce yaz, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan.`;
      const cevap = await aiIstek(p, 2000, cihazIdRef.current);
      const temizMetin = cevap
        .replace(/\*\*/g, "")
        .replace(/#+\s?/g, "")
        .replace(/\$\$?/g, "")
        .replace(/\\sqrt\{([^}]*)\}/g, "karekok $1")
        .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
        .replace(/\\[a-zA-Z]+/g, "")
        .replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff]+/g, "");
      setAciklama(temizMetin);
    } catch (e) { setHata(e.message || "Anlatim alinamadi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  async function soruUret(fasikulModu) {
    if (!ders || !konu.trim()) return;
    setYukleniyor("quiz"); setHata(""); setCevaplar({}); setGonderildi(false); setParagrafMetni(""); setParagrafPufNoktalari("");
    try {
      const uniteMetni2 = uniteSec ? ` (${uniteSec} unitesinden, gercek LGS tarzinda)` : "";
      const p = fasikulModu
        ? `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni2} "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde TAM 15 coktan secmeli soru hazirla: ILK 5 SORU KOLAY, SONRAKI 5 SORU ORTA, SON 5 SORU ZOR seviyede olsun (sirali ver, kolaydan zora). Bu, meshur ozel yayin kaynaklarinin (MEB yayinlarindan daha ust seviye, sik tercih edilen ek kaynaklar seviyesinde) fasikul formatinda olsun. Sorular mantik yurutme ve yorum gerektiren tarzda olsun, ezber bilgi sorma. SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Portekizce gibi bati dillerinden TEK KELIME bile kullanma:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]`
        : `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni2} "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde 5 coktan secmeli soru hazirla. Sorular gercek sinav formatinda, mantik yurutme ve yorum gerektiren tarzda olsun, ezber bilgi sorma. SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;
      const cevap = await aiIstek(p, fasikulModu ? 7000 : 3000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff]+/g, "").trim();
      const ankor = temiz.indexOf('"soru"');
      let baslangic = ankor !== -1 ? temiz.lastIndexOf("[", ankor) : temiz.indexOf("[");
      if (baslangic === -1) baslangic = temiz.indexOf("[{");
      const sonAnkor = temiz.lastIndexOf('"dogruIndex"');
      let bitis = sonAnkor !== -1 ? temiz.indexOf("]", sonAnkor) : temiz.lastIndexOf("]");
      if (bitis === -1) bitis = temiz.lastIndexOf("]");
      if (baslangic === -1 || bitis === -1) throw new Error("AI gecerli bir soru listesi dondurmedi, tekrar dene");
      const uretilenSorular = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setQuiz(uretilenSorular);
      sorulariBankayaKaydet(ders, sinif, uniteSec, uretilenSorular, fasikulModu ? "fasikul" : "quiz");
    } catch (e) { setHata(e.message || "Sorular uretilemedi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  const [paragrafMetni, setParagrafMetni] = useState("");
  const [paragrafPufNoktalari, setParagrafPufNoktalari] = useState("");

  async function paragrafPratigiUret() {
    if (!ders || !konu.trim()) return;
    setYukleniyor("paragraf"); setHata(""); setCevaplar({}); setGonderildi(false); setParagrafMetni(""); setParagrafPufNoktalari("");
    try {
      const uniteMetni3 = uniteSec ? ` (${uniteSec} unitesinden)` : "";
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni3} "${konu}" konusuyla ilgili once orta uzunlukta (120-180 kelime) bir metin/paragraf yaz, sonra bu metne dayali 20 coktan secmeli soru hazirla (${sinif}. sinif seviyesinde, kolaydan zora dogru sirali). Son olarak bu konuyla ilgili 3-5 maddelik kisa "puf noktalari / altin kurallar" listesi ekle (formul, dikkat edilecek nokta, sik yapilan hatalar gibi). Sorular okudugunu anlama, yorumlama ve dikkat gerektirsin. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Portekizce gibi bati dillerinden TEK KELIME bile kullanma. SADECE JSON dondur, baska hicbir aciklama ekleme, markdown kullanma:
{"metin":"...","pufNoktalari":["...","..."],"sorular":[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]}`;
      const cevap = await aiIstek(p, 8000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff]+/g, "").trim();
      const baslangic = temiz.indexOf("{");
      const bitis = temiz.lastIndexOf("}");
      if (baslangic === -1 || bitis === -1) throw new Error("Paragraf pratigi olusturulamadi, tekrar dene");
      const veri = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setParagrafMetni(veri.metin || "");
      setParagrafPufNoktalari((veri.pufNoktalari || []).join("\n"));
      setQuiz(veri.sorular || []);
      sorulariBankayaKaydet(ders, sinif, uniteSec, veri.sorular, "paragraf");
    } catch (e) { setHata(e.message || "Paragraf pratigi olusturulamadi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  async function planOlustur() {
    if (zayifDersler.length === 0) return;
    setYukleniyor("plan"); setHata(""); setPlan("");
    try {
      const p = `Sen bir LGS calisma kocususun - ama bir ogretmen ya da veli gibi degil, samimi bir MENTOR gibi konus. Zayif dersler: ${zayifDersler.join(", ")}. Haftalik ${haftalikSaat} saat, sinava ${kalanHafta} hafta kaldi. Haftalik program hazirla, dersleri saatlere bol, kisa odak notu ekle. Programin sonunda kisa bir mentorluk notu ekle: netlerin bazen bir sure ayni kalmasinin (plato) tamamen normal ve gelisimin dogal bir parcasi oldugunu, bunun basarisizlik anlamina gelmedigini hatirlat. Baski yapan degil, guven veren, yanindaki gibi hisseden bir dil kullan. Abartili motivasyon sozleri kullanma, gercekci ve sicak ol. Sadece Turkce duz metin, en fazla 320 kelime, markdown isareti kullanma.`;
      setPlan(await aiIstek(p, 1500, cihazIdRef.current));
    } catch (e) { setHata(e.message || "Plan olusturulamadi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  const [sinavKapsamMetni, setSinavKapsamMetni] = useState("");
  const [sinavKayitTuru, setSinavKayitTuru] = useState("");

  async function sinavOlustur(sinavTuru) { // "yazili" | "deneme"
    if (!denemeDers) return;
    setYukleniyor(sinavTuru); setHata(""); setDenemeCevaplar({}); setDenemeGonderildi(false); setDenemeSorulari(null); setDenemeBelgesi(null);
    try {
      const tumUniteler = MUFREDAT[denemeDers] || [];
      let kapsamUniteler = tumUniteler;
      let kapsamAciklama = "";
      let kayitTuru = sinavTuru;

      if (kapsamTuru === "konu") {
        kapsamUniteler = kapsamUnite ? [kapsamUnite] : [];
        kapsamAciklama = kapsamKonu.trim()
          ? `SADECE "${kapsamUnite}" unitesindeki "${kapsamKonu.trim()}" konusundan sorular hazirla.`
          : `SADECE "${kapsamUnite || "(ders geneli)"}" unitesinden sorular hazirla.`;
        kayitTuru = `${sinavTuru}_konu`;
      } else if (kapsamTuru === "unite") {
        kapsamUniteler = kapsamUnite ? [kapsamUnite] : [];
        kapsamAciklama = `SADECE "${kapsamUnite || "(ders geneli)"}" unitesinden, unitenin TAMAMINI kapsayacak sekilde sorular hazirla.`;
        kayitTuru = `${sinavTuru}_unite`;
      } else { // donem
        if (sinavTuru === "yazili") {
          kapsamUniteler = denemeKapsamiHesapla(denemeDers, yaziliDonemNo);
          kayitTuru = yaziliDonemNo;
        } else {
          if (denemeDonemNo === "tam") { kapsamUniteler = tumUniteler; kayitTuru = "deneme_tam"; }
          else {
            const yari = Math.ceil(tumUniteler.length / 2);
            kapsamUniteler = denemeDonemNo === "1" ? tumUniteler.slice(0, yari) : tumUniteler.slice(yari);
            kayitTuru = `deneme_donem${denemeDonemNo}`;
          }
        }
        kapsamAciklama = kapsamUniteler.length
          ? `Bu sinavin kapsayacagi uniteler: ${kapsamUniteler.join(", ")}. Sorulari SADECE bu unitelerden hazirla, kapsam disina cikma.`
          : "";
      }

      const baslikMetni = sinavTuru === "yazili"
        ? `okul donem ici YAZILI SINAVI formatinda (sinirli kapsamli, ${{ yazili1: "1. Yazili", yazili2: "2. Yazili", yazili3: "3. Yazili" }[yaziliDonemNo] || ""})`
        : "gercek LGS DENEME SINAVI formatinda";

      const p = `Sen bir LGS/ortaokul olcme-degerlendirme uzmanisin. "${denemeDers}" dersi icin ${baslikMetni} hazirla, ${sinif}. sinif seviyesinde, toplam ${sinavSoruSayisi} soru olsun. ${kapsamAciklama} Sorulari, 2022-2026 yillari arasindaki gercek sinavlarin soru tarzina, uslubuna ve zorluk seviyesine birebir benzet - ama sorularin kendisi ozgun olsun, gercek gecmis sorulari birebir kopyalama ya da "gecmis yil cikti" diye sunma. 2026 LGS onceki yillara gore belirgin sekilde daha zor ve secici geldi (uzmanlar hemfikir) - sorulari buna gore kalibre et: ezber bilgiden cok dikkat, zaman yonetimi, yorumlama ve strateji gerektiren sorular olsun, Turkce'de uzun paragraflar/celdiriciler, Matematik'te islem degil dikkat ve mantik agirlikli sorular kullan. Zorluk dagilimi GERCEK 2026 LGS oranina yakin olsun: soru sayisinin yaklasik %20'si kolay, %55'i orta, %25'i zor olsun (orn. 20 soruda ~4 kolay, ~11 orta, ~5 zor). Her sorunun hangi ALT KONUYU/KAZANIMI olctugunu 2-4 kelimeyle "altKonu" alaninda belirt (orn. "Asal Carpanlar", "EBOB Hesabi" gibi kisa ve spesifik). Tum metinler SADECE Turkce olmali, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan. SADECE JSON dondur, baska hicbir aciklama ekleme:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","altKonu":"..."}]`;
      const cevap = await aiIstek(p, Math.min(6000, 400 + sinavSoruSayisi * 400), cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff]+/g, "").trim();
      const ankor = temiz.indexOf('"soru"');
      let baslangic = ankor !== -1 ? temiz.lastIndexOf("[", ankor) : temiz.indexOf("[");
      if (baslangic === -1) baslangic = temiz.indexOf("[{");
      const sonAnkor = temiz.lastIndexOf('"dogruIndex"');
      let bitis = sonAnkor !== -1 ? temiz.indexOf("]", sonAnkor) : temiz.lastIndexOf("]");
      if (bitis === -1) bitis = temiz.lastIndexOf("]");
      if (baslangic === -1 || bitis === -1) throw new Error("Sinav olusturulamadi, tekrar dene");
      setSinavKapsamMetni(kapsamAciklama);
      setSinavKayitTuru(kayitTuru);
      const uretilenSinavSorulari = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setDenemeSorulari(uretilenSinavSorulari);
      sorulariBankayaKaydet(denemeDers, sinif, kapsamUnite, uretilenSinavSorulari, sinavTuru);
    } catch (e) { setHata(e.message || "Sinav olusturulamadi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  const [denemeBelgesi, setDenemeBelgesi] = useState(null);

  async function denemeGonder() {
    setDenemeGonderildi(true);
    const dogru = denemeSorulari.filter((s, i) => denemeCevaplar[i] === s.dogruIndex).length;
    const bos = denemeSorulari.filter((s, i) => denemeCevaplar[i] === undefined).length;
    const yanlis = denemeSorulari.length - dogru - bos;
    const net = Math.max(0, dogru - yanlis / 4);

    const zorlukKirilim = { kolay: { dogru: 0, toplam: 0 }, orta: { dogru: 0, toplam: 0 }, zor: { dogru: 0, toplam: 0 } };
    const altKonuKirilim = {};
    denemeSorulari.forEach((s, i) => {
      const z = s.zorluk || "orta";
      if (!zorlukKirilim[z]) zorlukKirilim[z] = { dogru: 0, toplam: 0 };
      zorlukKirilim[z].toplam += 1;
      if (denemeCevaplar[i] === s.dogruIndex) zorlukKirilim[z].dogru += 1;

      if (s.altKonu) {
        if (!altKonuKirilim[s.altKonu]) altKonuKirilim[s.altKonu] = { dogru: 0, toplam: 0 };
        altKonuKirilim[s.altKonu].toplam += 1;
        if (denemeCevaplar[i] === s.dogruIndex) altKonuKirilim[s.altKonu].dogru += 1;
      }
    });

    // Unite/konu kapsamli sinavlarda ders adini o unite ile zenginlestiriyoruz,
    // boylece "bu unitede kacinci test" sayaci dogru tutulur.
    const kayitDersAdi = (kapsamTuru === "unite" || kapsamTuru === "konu") && kapsamUnite
      ? `${denemeDers} · ${kapsamUnite}`
      : denemeDers;

    let oncekiNet = null;
    let testNo = 1;
    try {
      const res = await fetch("/api/sinav-sonuc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, tur: sinavKayitTuru || denemeTuru, ders: kayitDersAdi, dogru, yanlis, bos, net }),
      });
      const data = await res.json();
      if (res.ok) { oncekiNet = data.oncekiNet; testNo = data.testNo || 1; }
    } catch (e) { /* kayit basarisiz olsa da sonuc belgesini yine de goster */ }

    setDenemeBelgesi({ dogru, yanlis, bos, net, toplam: denemeSorulari.length, zorlukKirilim, altKonuKirilim, oncekiNet, testNo, kayitDersAdi });
  }

  async function seviyeTespitiYap() {
    setYukleniyor("seviye"); setHata(""); setSeviyeCevaplar({}); setSeviyeGonderildi(false); setSeviyeSorulari(null); setSeviyeRaporu(null);
    try {
      const dersListesi = DERSLER.map((d) => d.ad).join(", ");
      const p = `Sen bir egitim kurumunda seviye tespit sinavi hazirlayan bir olcme-degerlendirme uzmanisin. Su derslerin HER BIRINDEN 2'ser soru olmak uzere toplam 12 soruluk bir SEVIYE TESPIT SINAVI hazirla: ${dersListesi}. ${sinif}. sinif seviyesinde, her dersten 1 kolay 1 orta zorlukta soru olsun. Her sorunun hangi derse ait oldugunu "ders" alaninda MUTLAKA belirt (yukaridaki isimlerle BIREBIR ayni yaz). Sorular mantik yurutme gerektirsin, ezber bilgi sorma. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, ayrica Ingilizce/Almanca/Fransizca/Portekizce gibi baska dilden TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan. SADECE JSON dondur, baska hicbir aciklama ekleme:
[{"ders":"Matematik","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;
      const cevap = await aiIstek(p, 5000, cihazIdRef.current, true);
      const temiz = cevap.replace(/```json|```/g, "").replace(/[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff]+/g, "").trim();
      const ankor = temiz.indexOf('"soru"');
      let baslangic = ankor !== -1 ? temiz.lastIndexOf("[", ankor) : temiz.indexOf("[");
      if (baslangic === -1) baslangic = temiz.indexOf("[{");
      const sonAnkor = temiz.lastIndexOf('"dogruIndex"');
      let bitis = sonAnkor !== -1 ? temiz.indexOf("]", sonAnkor) : temiz.lastIndexOf("]");
      if (bitis === -1) bitis = temiz.lastIndexOf("]");
      if (baslangic === -1 || bitis === -1) throw new Error("Seviye tespit sinavi olusturulamadi, tekrar dene");
      const seviyeSorulariUretilen = JSON.parse(temiz.slice(baslangic, bitis + 1));
      setSeviyeSorulari(seviyeSorulariUretilen);
      const dersGruplari = {};
      seviyeSorulariUretilen.forEach((s) => {
        if (!dersGruplari[s.ders]) dersGruplari[s.ders] = [];
        dersGruplari[s.ders].push(s);
      });
      Object.keys(dersGruplari).forEach((d) => sorulariBankayaKaydet(d, sinif, null, dersGruplari[d], "seviye"));
    } catch (e) { setHata(e.message || "Seviye tespit sinavi olusturulamadi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  function seviyeGonder() {
    setSeviyeGonderildi(true);
    const rapor = {};
    seviyeSorulari.forEach((s, i) => {
      if (!rapor[s.ders]) rapor[s.ders] = { dogru: 0, toplam: 0 };
      rapor[s.ders].toplam += 1;
      if (seviyeCevaplar[i] === s.dogruIndex) rapor[s.ders].dogru += 1;
    });
    Object.keys(rapor).forEach((d) => {
      const oran = rapor[d].dogru / rapor[d].toplam;
      rapor[d].seviye = oran >= 0.8 ? "Ileri" : oran >= 0.5 ? "Orta" : "Baslangic";
    });
    setSeviyeRaporu(rapor);
  }

  function zayifDersleriKoclugaAktar() {
    if (!seviyeRaporu) return;
    const zayiflar = Object.keys(seviyeRaporu).filter((d) => seviyeRaporu[d].seviye !== "Ileri");
    setZayifDersler(zayiflar);
    setOtomatikTespit(true);
    setMod("kocluk");
  }

  async function premiumSatinAl(plan) {
    setOdemeHata(""); setCheckoutHtml("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          kullanici: { ad: "Test", soyad: "Kullanici", eposta: "test@karemux.com", adres: "Istanbul, Turkiye", sehir: "Istanbul" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCheckoutHtml(data.checkoutFormContent);
    } catch (e) {
      setOdemeHata("Odeme baslatilamadi: " + e.message);
    }
  }

  const dogruSayisi = quiz && gonderildi ? quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length : null;

  function cevaplariGonder() {
    setGonderildi(true);
    const dogru = quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length;
    ilerlemeyiKaydet(ders, konu, dogru, quiz.length);
    if (dogru / quiz.length >= 0.7) {
      if (uniteSec && aktifAltKonu) {
        altKonuTamamlandiIsaretle(ders, uniteSec, aktifAltKonu);
      } else if (uniteSec) {
        // Alt konu listesi henuz yoksa (AI onerisi basarisiz oldu) direkt uniteyi tamamlandi say
        uniteTamamlandiIsaretle(ders, uniteSec);
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "system-ui, sans-serif", padding: "24px 14px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, position: "relative" }}>
          <button onClick={() => setMenuAcik((a) => !a)} style={{
            width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${COLORS.line}`, background: COLORS.page,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 18,
          }}>☰</button>
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, color: COLORS.mustard, margin: "0 0 2px", textTransform: "uppercase" }}>Karemux Egitim Sistemleri</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.page, margin: 0 }}>5.Siniftan LGS'ye Hazirlik</h1>
          </div>
        </div>
        <p style={{ color: "#C9D4C7", fontSize: 13, margin: "6px 0 16px" }}>5. siniftan LGS'ye kadar tek sistem</p>

        {mod === "bos" && !secilenDers && (
          <div style={{
            background: COLORS.gradient, borderRadius: 16, padding: "28px 20px",
            border: `1px solid ${COLORS.panelBorder || COLORS.line}`, textAlign: "center", marginBottom: 16,
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎓</div>
            <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Hos geldiniz</p>
            <p style={{ color: "#B7C4BC", fontSize: 13.5, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
              Seviye tespiti, konu anlatimi, deneme/yazili sinavlari ve kisisel calisma plani — hepsi tek sistemde.
              Baslamak icin sol ustteki <strong style={{ color: COLORS.mustard }}>☰</strong> menuden bir ders sec.
            </p>
          </div>
        )}

        {menuAcik && (
          <>
            <div onClick={() => setMenuAcik(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
            <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 260, background: COLORS.bg, borderRight: `1px solid ${COLORS.panelBorder || COLORS.line}`, zIndex: 50, padding: "20px 14px", overflowY: "auto", boxShadow: "4px 0 20px rgba(0,0,0,0.3)" }}>
              <button onClick={() => { setSecilenDers(null); setMod("bos"); setMenuAcik(false); }} style={{
                display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 14, borderRadius: 8,
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
                background: !secilenDers && mod === "bos" ? COLORS.page : "transparent", color: !secilenDers && mod === "bos" ? COLORS.ink : "#C9D4C7",
              }}>🏠 Ana Sayfa</button>

              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Dersler</p>
              {DERSLER.map((d) => (
                <button key={d.ad} onClick={() => { setSecilenDers(d.ad); setMod("ders"); setMenuAcik(false); }} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 4, borderRadius: 8,
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: secilenDers === d.ad ? 700 : 500,
                  background: secilenDers === d.ad ? COLORS.page : "transparent", color: secilenDers === d.ad ? COLORS.ink : "#C9D4C7",
                }}>{d.emoji} {d.ad}</button>
              ))}

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              <button onClick={() => { setSecilenDers(null); setMod("hesap"); setMenuAcik(false); }} style={{
                display: "block", width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: 8,
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: mod === "hesap" ? 700 : 500,
                background: mod === "hesap" ? COLORS.page : "transparent", color: mod === "hesap" ? COLORS.ink : "#C9D4C7",
              }}>{hesap ? `👤 ${hesap.ad} (${hesap.rol === "veli" ? "Veli" : "Ogrenci"})` : "👤 Giris / Kayit"}</button>

              <div style={{ borderTop: `1px solid ${COLORS.panelBorder || COLORS.line}`, margin: "16px 0" }} />
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Tema</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {Object.keys(TEMALAR).map((t) => (
                  <button key={t} onClick={() => temaDegistir(t)} style={{
                    padding: "10px 6px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                    border: `2px solid ${tema === t ? TEMALAR[t].mustard : "transparent"}`,
                    background: TEMALAR[t].gradient, color: TEMALAR[t].page, fontSize: 11, fontWeight: 700,
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 3 }}>{TEMALAR[t].ikon}</div>
                    {TEMALAR[t].isim}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {hata && <p style={{ color: "#FFD5D0", fontSize: 13, marginBottom: 12 }}>{hata}</p>}

        {secilenDers && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{secilenDers}</p>
            <p style={{ fontSize: 13, color: COLORS.muted }}>Bu dersin icini birlikte dolduracagiz.</p>
          </div>
        )}

        {mod === "seviye" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
              6 dersin hepsinden 2'ser soru (toplam 12) — nerede guclu, nerede zayif oldugunu gorup calisma planini ona gore kur. Tipki bir dershanenin yaptigi ilk seviye tespitine benzer.
            </p>
            {!seviyeSorulari && (
              <button onClick={seviyeTespitiYap} disabled={yukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>
                {yukleniyor === "seviye" ? "Hazirlaniyor..." : "Seviye Tespit Sinavini Baslat"}
              </button>
            )}

            {seviyeSorulari && !seviyeRaporu && (
              <div>
                {seviyeSorulari.map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: COLORS.coral, fontSize: 11 }}>{s.ders}</span> — {i + 1}. {s.soru}
                    </div>
                    {s.secenekler.map((sec, j) => {
                      const secili = seviyeCevaplar[i] === j;
                      return (
                        <button key={j} onClick={() => setSeviyeCevaplar((c) => ({ ...c, [i]: j }))} style={{
                          display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13, cursor: "pointer",
                          border: `1.5px solid ${secili ? COLORS.mustard : COLORS.line}`, background: secili ? "#FEF8E8" : "#fff",
                        }}>{sec}</button>
                      );
                    })}
                  </div>
                ))}
                <button onClick={seviyeGonder} disabled={Object.keys(seviyeCevaplar).length < seviyeSorulari.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600 }}>
                  Sonuclari Gor
                </button>
              </div>
            )}

            {seviyeRaporu && (
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Seviye Raporun</p>
                {Object.keys(seviyeRaporu).map((d) => {
                  const r = seviyeRaporu[d];
                  const renk = r.seviye === "Ileri" ? "#3DA35D" : r.seviye === "Orta" ? "#B8860B" : COLORS.coral;
                  return (
                    <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.line}` }}>
                      <span style={{ fontSize: 13 }}>{d}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: renk }}>{r.seviye} ({r.dogru}/{r.toplam})</span>
                    </div>
                  );
                })}
                <button onClick={zayifDersleriKoclugaAktar} style={{ width: "100%", marginTop: 14, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>
                  Zayif Derslerimi Kocluk Planina Aktar
                </button>
              </div>
            )}
          </div>
        )}

        {mod === "yazili" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
              Okul yazili sinavina hazirlik — kapsam sec (konu/unite/donem), soru sayisini ayarla.
              <br /><em style={{ fontSize: 11.5 }}>(Sorular gercek sinav tarzinda ozgun uretilir, birebir gecmis soru degildir.)</em>
            </p>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 5 }}>DERS SEC</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {DERSLER.map((d) => (
                <button key={d.ad} onClick={() => { setDenemeDers(d.ad); setKapsamUnite(null); setDenemeSorulari(null); }} style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${denemeDers === d.ad ? COLORS.coral : COLORS.line}`, background: denemeDers === d.ad ? "#FFF1EF" : "#fff", color: COLORS.ink }}>
                  {d.emoji} {d.ad}
                </button>
              ))}
            </div>

            {denemeDers && (
              <>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 5 }}>KAPSAM</label>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[["konu", "Konu"], ["unite", "Unite"], ["donem", "Donem"]].map(([k, etiket]) => (
                <button key={k} onClick={() => { setKapsamTuru(k); setSinavSoruSayisi(onerilenSoruSayisi(k)); setDenemeSorulari(null); }} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${kapsamTuru === k ? COLORS.coral : COLORS.line}`, background: kapsamTuru === k ? "#FFF1EF" : "#fff", color: COLORS.ink }}>{etiket}</button>
              ))}
            </div>

            {(kapsamTuru === "konu" || kapsamTuru === "unite") && denemeDers && MUFREDAT[denemeDers] && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 5 }}>UNITE SEC</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {MUFREDAT[denemeDers].map((u) => (
                    <button key={u} onClick={() => setKapsamUnite(kapsamUnite === u ? null : u)} style={{ padding: "5px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${kapsamUnite === u ? COLORS.coral : COLORS.line}`, background: kapsamUnite === u ? "#FFF1EF" : "#fff", color: COLORS.ink }}>{u}</button>
                  ))}
                </div>
              </div>
            )}
            {kapsamTuru === "konu" && (
              <input value={kapsamKonu} onChange={(e) => setKapsamKonu(e.target.value)} placeholder="Alt konu (istege bagli, orn. Asal Carpanlar)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 10, fontSize: 13 }} />
            )}
            {kapsamTuru === "donem" && (
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[["yazili1", "1. Yazili"], ["yazili2", "2. Yazili"], ["yazili3", "3. Yazili"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => setYaziliDonemNo(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${yaziliDonemNo === k ? COLORS.coral : COLORS.line}`, background: yaziliDonemNo === k ? "#FFF1EF" : "#fff", color: COLORS.ink }}>{etiket}</button>
                ))}
              </div>
            )}

            {denemeDers && kapsamTuru === "donem" && MUFREDAT[denemeDers] && (
              <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10, fontStyle: "italic" }}>
                Kapsam: {denemeKapsamiHesapla(denemeDers, yaziliDonemNo).join(", ")}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted }}>SORU SAYISI</label>
              <input type="number" min={3} max={20} value={sinavSoruSayisi} onChange={(e) => setSinavSoruSayisi(Math.max(3, Math.min(20, Number(e.target.value))))} style={{ width: 60, padding: "6px 8px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13 }} />
            </div>

            <button onClick={() => sinavOlustur("yazili")} disabled={!denemeDers || yukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, opacity: !denemeDers ? 0.5 : 1 }}>
              {yukleniyor === "yazili" ? "Hazirlaniyor..." : `${sinavSoruSayisi} Soruluk Yazili Hazirla`}
            </button>
              </>
            )}
          </div>
        )}

        {mod === "deneme" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
              LGS deneme sinavina hazirlik — kapsam sec (konu/unite/donem/tam yil), soru sayisini ayarla.
              <br /><em style={{ fontSize: 11.5 }}>(Sorular 2022-2026 gercek LGS tarzinda ozgun uretilir, birebir gecmis yil sorusu degildir.)</em>
            </p>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 5 }}>DERS SEC</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {DERSLER.map((d) => (
                <button key={d.ad} onClick={() => { setDenemeDers(d.ad); setKapsamUnite(null); setDenemeSorulari(null); }} style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${denemeDers === d.ad ? COLORS.coral : COLORS.line}`, background: denemeDers === d.ad ? "#FFF1EF" : "#fff", color: COLORS.ink }}>
                  {d.emoji} {d.ad}
                </button>
              ))}
            </div>

            {denemeDers && (
              <>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 5 }}>KAPSAM</label>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[["konu", "Konu"], ["unite", "Unite"], ["donem", "Donem/Tam"]].map(([k, etiket]) => (
                <button key={k} onClick={() => { setKapsamTuru(k); setSinavSoruSayisi(onerilenSoruSayisi(k)); setDenemeSorulari(null); }} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${kapsamTuru === k ? COLORS.coral : COLORS.line}`, background: kapsamTuru === k ? "#FFF1EF" : "#fff", color: COLORS.ink }}>{etiket}</button>
              ))}
            </div>

            {(kapsamTuru === "konu" || kapsamTuru === "unite") && denemeDers && MUFREDAT[denemeDers] && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, display: "block", marginBottom: 5 }}>UNITE SEC</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {MUFREDAT[denemeDers].map((u) => (
                    <button key={u} onClick={() => setKapsamUnite(kapsamUnite === u ? null : u)} style={{ padding: "5px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${kapsamUnite === u ? COLORS.coral : COLORS.line}`, background: kapsamUnite === u ? "#FFF1EF" : "#fff", color: COLORS.ink }}>{u}</button>
                  ))}
                </div>
              </div>
            )}
            {kapsamTuru === "konu" && (
              <input value={kapsamKonu} onChange={(e) => setKapsamKonu(e.target.value)} placeholder="Alt konu (istege bagli)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 10, fontSize: 13 }} />
            )}
            {kapsamTuru === "donem" && (
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[["1", "1. Donem"], ["2", "2. Donem"], ["tam", "Tam Yil"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => setDenemeDonemNo(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${denemeDonemNo === k ? COLORS.coral : COLORS.line}`, background: denemeDonemNo === k ? "#FFF1EF" : "#fff", color: COLORS.ink }}>{etiket}</button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted }}>SORU SAYISI</label>
              <input type="number" min={3} max={20} value={sinavSoruSayisi} onChange={(e) => setSinavSoruSayisi(Math.max(3, Math.min(20, Number(e.target.value))))} style={{ width: 60, padding: "6px 8px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13 }} />
            </div>

            <button onClick={() => sinavOlustur("deneme")} disabled={!denemeDers || yukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, opacity: !denemeDers ? 0.5 : 1 }}>
              {yukleniyor === "deneme" ? "Hazirlaniyor..." : `${sinavSoruSayisi} Soruluk Deneme Olustur`}
            </button>
              </>
            )}
          </div>
        )}

        {(mod === "yazili" || mod === "deneme") && denemeSorulari && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginTop: 12 }}>
            {sinavKapsamMetni && <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10, fontStyle: "italic" }}>{sinavKapsamMetni}</p>}
            {denemeSorulari.map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                  {i + 1}. {s.soru}
                  {s.zorluk && (
                    <span style={{
                      marginLeft: 6, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                      background: s.zorluk === "kolay" ? "#EAF7EE" : s.zorluk === "orta" ? "#FFF8E8" : "#FFF1EF",
                      color: s.zorluk === "kolay" ? "#3DA35D" : s.zorluk === "orta" ? "#B8860B" : COLORS.coral,
                    }}>{s.zorluk}</span>
                  )}
                </div>
                {s.secenekler.map((sec, j) => {
                  const secili = denemeCevaplar[i] === j;
                  const dogru = denemeGonderildi && j === s.dogruIndex;
                  const yanlis = denemeGonderildi && secili && j !== s.dogruIndex;
                  return (
                    <button key={j} onClick={() => !denemeGonderildi && setDenemeCevaplar((c) => ({ ...c, [i]: j }))} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13,
                      cursor: denemeGonderildi ? "default" : "pointer",
                      border: `1.5px solid ${dogru ? "#3DA35D" : yanlis ? COLORS.coral : secili ? COLORS.mustard : COLORS.line}`,
                      background: dogru ? "#EAF7EE" : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff",
                    }}>{sec}</button>
                  );
                })}
              </div>
            ))}
            {!denemeGonderildi ? (
              <button onClick={denemeGonder} disabled={Object.keys(denemeCevaplar).length < denemeSorulari.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600 }}>
                Cevaplari Gonder
              </button>
            ) : denemeBelgesi ? (
              <div style={{ borderTop: `2px solid ${COLORS.ink}`, marginTop: 6, paddingTop: 14 }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, textAlign: "center" }}>📄 SONUC BELGESI</p>
                {denemeBelgesi.testNo > 1 && (
                  <p style={{ fontSize: 11.5, color: COLORS.muted, textAlign: "center", marginBottom: 10 }}>
                    {denemeBelgesi.kayitDersAdi} — {denemeBelgesi.testNo}. Test
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 12, textAlign: "center" }}>
                  <div><div style={{ fontSize: 20, fontWeight: 700, color: "#3DA35D" }}>{denemeBelgesi.dogru}</div><div style={{ fontSize: 10, color: COLORS.muted }}>DOGRU</div></div>
                  <div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.coral }}>{denemeBelgesi.yanlis}</div><div style={{ fontSize: 10, color: COLORS.muted }}>YANLIS</div></div>
                  <div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.muted }}>{denemeBelgesi.bos}</div><div style={{ fontSize: 10, color: COLORS.muted }}>BOS</div></div>
                  <div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink }}>{denemeBelgesi.net.toFixed(2)}</div><div style={{ fontSize: 10, color: COLORS.muted }}>NET</div></div>
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10, textAlign: "center" }}>
                  (Net = Dogru - Yanlis/4, gercek sinav hesaplama yontemi)
                </div>
                {denemeBelgesi.oncekiNet != null && (
                  <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, marginBottom: 10, color: denemeBelgesi.net > denemeBelgesi.oncekiNet ? "#3DA35D" : denemeBelgesi.net < denemeBelgesi.oncekiNet ? COLORS.coral : COLORS.muted }}>
                    {denemeBelgesi.net > denemeBelgesi.oncekiNet ? `⬆ Bir onceki sonucuna gore net ${(denemeBelgesi.net - denemeBelgesi.oncekiNet).toFixed(2)} arttin!` :
                     denemeBelgesi.net < denemeBelgesi.oncekiNet ? `⬇ Bir onceki sonucuna gore net ${(denemeBelgesi.oncekiNet - denemeBelgesi.net).toFixed(2)} azaldi, tekrar calis.` :
                     "Bir onceki sonucunla ayni nettesin."}
                  </p>
                )}
                <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 6 }}>ZORLUGA GORE DAGILIM</p>
                  {["kolay", "orta", "zor"].map((z) => denemeBelgesi.zorlukKirilim[z]?.toplam > 0 && (
                    <p key={z} style={{ fontSize: 12, margin: "3px 0" }}>{z}: {denemeBelgesi.zorlukKirilim[z].dogru}/{denemeBelgesi.zorlukKirilim[z].toplam} dogru</p>
                  ))}
                </div>
                {denemeBelgesi.altKonuKirilim && Object.keys(denemeBelgesi.altKonuKirilim).length > 0 && (
                  <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 10, marginTop: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 6 }}>ALT KONU BAZLI PERFORMANS</p>
                    {Object.keys(denemeBelgesi.altKonuKirilim).map((ak) => {
                      const k = denemeBelgesi.altKonuKirilim[ak];
                      const zayifMi = k.dogru / k.toplam < 0.5;
                      return (
                        <p key={ak} style={{ fontSize: 12, margin: "3px 0", color: zayifMi ? COLORS.coral : COLORS.ink }}>
                          {zayifMi ? "⚠ " : "✓ "}{ak}: {k.dogru}/{k.toplam}
                        </p>
                      );
                    })}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button onClick={() => {
                    setZayifDersler((l) => (l.includes(denemeDers) ? l : [...l, denemeDers]));
                    setOtomatikTespit(true);
                    setMod("kocluk");
                  }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🎯 Kocluk Planina Ekle</button>
                  <button onClick={() => window.print()} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🖨️ PDF / Yazdir</button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {mod === "hesap" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            {hesap ? (
              <div>
                <p style={{ fontSize: 14, marginBottom: 4 }}>
                  Giris yapildi: <strong>{hesap.ad}</strong> <span style={{ color: COLORS.muted, fontSize: 12 }}>({hesap.rol === "veli" ? "veli hesabi" : "ogrenci hesabi"})</span>
                </p>

                {!hesap.eposta_dogrulandi && (
                  <div style={{ background: "#FFF8E8", border: `1px solid ${COLORS.mustard}`, borderRadius: 8, padding: 12, margin: "10px 0" }}>
                    <p style={{ fontSize: 13, marginBottom: 8 }}>E-postan henuz dogrulanmadi. Gelen kutunu kontrol et.</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={dogrulamaKoduGir} onChange={(e) => setDogrulamaKoduGir(e.target.value)} placeholder="6 haneli kod" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
                      <button onClick={dogrulaGonder} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Dogrula</button>
                    </div>
                    <button onClick={kodTekrarGonder} style={{ marginTop: 8, padding: 0, border: "none", background: "none", color: COLORS.muted, fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>Kodu tekrar gonder</button>
                    {dogrulamaMesaj && <p style={{ fontSize: 12, marginTop: 6 }}>{dogrulamaMesaj}</p>}
                  </div>
                )}

                {hesap.rol === "ogrenci" && hesap.veli_baglanti_kodu && (
                  <div style={{ background: "#EAF7EE", borderRadius: 8, padding: 12, margin: "10px 0" }}>
                    <p style={{ fontSize: 13, margin: 0 }}>
                      Veli baglanti kodun: <strong style={{ fontFamily: "monospace", fontSize: 15 }}>{hesap.veli_baglanti_kodu}</strong>
                    </p>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: "4px 0 0" }}>Bu kodu velinle paylas, ilerlemeni gorebilsin.</p>
                  </div>
                )}

                {hesap.rol === "veli" && (
                  <div style={{ margin: "14px 0" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>OGRENCI BAGLA</label>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <input value={baglantiKoduGir} onChange={(e) => setBaglantiKoduGir(e.target.value)} placeholder="Ogrencinin baglanti kodu" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
                      <button onClick={veliBaglan} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Bagla</button>
                    </div>
                    {veliMesaj && <p style={{ fontSize: 12, marginBottom: 10 }}>{veliMesaj}</p>}

                    {veliOgrenciler.map((o, i) => (
                      <div key={i} style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 10, marginTop: 10 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{o.ogrenci.ad}</p>
                        {o.zayifDersler.length > 0 && (
                          <p style={{ fontSize: 12, color: COLORS.coral, marginBottom: 6 }}>Zayif dersler: {o.zayifDersler.join(", ")}</p>
                        )}
                        {o.gecmis.length === 0 ? (
                          <p style={{ fontSize: 12, color: COLORS.muted }}>Henuz quiz cozmemis.</p>
                        ) : (
                          o.gecmis.map((g, j) => (
                            <p key={j} style={{ fontSize: 12, margin: "2px 0" }}>
                              {g.ders} · {g.konu}: {g.dogru}/{g.toplam} dogru
                            </p>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={cikisYap} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, cursor: "pointer" }}>Cikis Yap</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => setHesapModu("giris")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: hesapModu === "giris" ? COLORS.coral : "#fff", color: hesapModu === "giris" ? "#fff" : COLORS.ink, fontWeight: 600, cursor: "pointer" }}>Giris Yap</button>
                  <button onClick={() => setHesapModu("kayit")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: hesapModu === "kayit" ? COLORS.coral : "#fff", color: hesapModu === "kayit" ? "#fff" : COLORS.ink, fontWeight: 600, cursor: "pointer" }}>Kayit Ol</button>
                </div>
                {hesapModu === "kayit" && (
                  <>
                    <input value={adGir} onChange={(e) => setAdGir(e.target.value)} placeholder="Adin" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <button onClick={() => setRolSec("ogrenci")} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${rolSec === "ogrenci" ? COLORS.coral : COLORS.line}`, background: rolSec === "ogrenci" ? "#FFF1EF" : "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🎓 Ogrenciyim</button>
                      <button onClick={() => setRolSec("veli")} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${rolSec === "veli" ? COLORS.coral : COLORS.line}`, background: rolSec === "veli" ? "#FFF1EF" : "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>👪 Veliyim</button>
                    </div>
                  </>
                )}
                <input value={epostaGir} onChange={(e) => setEpostaGir(e.target.value)} placeholder="E-posta" type="email" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                <input value={sifreGir} onChange={(e) => setSifreGir(e.target.value)} placeholder="Sifre (en az 6 karakter)" type="password" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 10 }} />
                {hesapHata && <p style={{ color: COLORS.coral, fontSize: 13, marginBottom: 8 }}>{hesapHata}</p>}
                <button onClick={hesapGonder} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  {hesapModu === "giris" ? "Giris Yap" : "Hesap Olustur"}
                </button>
              </div>
            )}
          </div>
        )}

        {mod === "premium" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            {aktifAbonelik ? (
              <div>
                <p style={{ fontSize: 14, marginBottom: 10 }}>
                  Aktif plan: <strong>{aktifAbonelik.plan}</strong>
                  {aktifAbonelik.bitis && ` · Yenilenme: ${new Date(aktifAbonelik.bitis).toLocaleDateString("tr-TR")}`}
                </p>
                <button onClick={abonelikIptalEt} style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.coral}`, background: "transparent", color: COLORS.coral, fontWeight: 600, cursor: "pointer" }}>
                  Aboneligi Iptal Et
                </button>
                {iptalMesaji && <p style={{ fontSize: 13, marginTop: 8, color: COLORS.muted }}>{iptalMesaji}</p>}
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
                  Sinirsiz konu anlatimi, soru uretimi ve calisma plani icin Premium'a gec.
                  <br /><em>Istedigin an, tek tikla, hic ugrasmadan iptal edebilirsin.</em>
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => premiumSatinAl("premium_aylik")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>
                    Aylik 99,90₺
                  </button>
                  <button onClick={() => premiumSatinAl("premium_yillik")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", color: COLORS.ink, fontWeight: 600 }}>
                    Yillik 899,90₺
                  </button>
                </div>
                {odemeHata && <p style={{ color: COLORS.coral, fontSize: 13 }}>{odemeHata}</p>}
                {checkoutHtml && <div dangerouslySetInnerHTML={{ __html: checkoutHtml }} />}
              </>
            )}
          </div>
        )}

        {mod === "sorucoz" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
              Cozemedigin sorunun fotografini yukle, yapay zekâ saniyeler icinde adim adim cozsun.
              <br /><em>(Rakiplerin insan egitmenle 15 dakikada verdigi hizmeti aninda sunuyoruz.)</em>
            </p>
            <input
              type="file" accept="image/*" capture="environment"
              onChange={(e) => { const f = e.target.files[0]; if (f) { setSoruGorseli(URL.createObjectURL(f)); soruGorseliCoz(f); } }}
              style={{ marginBottom: 12 }}
            />
            {soruGorseli && <img src={soruGorseli} alt="Yuklenen soru" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 12, border: `1px solid ${COLORS.line}` }} />}
            {yukleniyor === "soru" && <p style={{ fontSize: 13, color: COLORS.muted }}>Cozuluyor…</p>}
            {soruCozumu && <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>{soruCozumu}</div>}
          </div>
        )}

        {mod === "kocluk" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 8 }}>
              ZAYIF DERSLER {otomatikTespit && <span style={{ color: COLORS.coral }}>· gecmis performansina gore otomatik tespit edildi</span>}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {DERSLER.map((d) => {
                const s = zayifDersler.includes(d.ad);
                return <button key={d.ad} onClick={() => dersToggle(d.ad)} style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${s ? COLORS.coral : COLORS.line}`, background: s ? "#FFF1EF" : "#fff", color: COLORS.ink }}>{d.emoji} {d.ad}</button>;
              })}
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>HAFTALIK SAAT</label>
                <input type="number" value={haftalikSaat} onChange={(e) => setHaftalikSaat(Number(e.target.value))} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>KALAN HAFTA</label>
                <input type="number" value={kalanHafta} onChange={(e) => setKalanHafta(Number(e.target.value))} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
              </div>
            </div>
            <button onClick={planOlustur} disabled={zayifDersler.length === 0 || yukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, opacity: zayifDersler.length === 0 ? 0.5 : 1 }}>
              {yukleniyor === "plan" ? "Hazirlaniyor…" : "Calisma Plani Olustur"}
            </button>
            {plan && <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.7 }}>{plan}</div>}
          </div>
        )}

        {mod === "anlatim" && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[5, 6, 7, 8].map((s) => (
                <button key={s} onClick={() => setSinif(s)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${sinif === s ? COLORS.coral : COLORS.line}`, background: sinif === s ? "#FFF1EF" : "#fff", color: COLORS.ink }}>
                  {s}. Sinif
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
              {DERSLER.map((d) => (
                <button key={d.ad} onClick={() => { setDers(d.ad); setUniteSec(null); }} style={{ padding: "12px 6px", borderRadius: 10, border: `1.5px solid ${ders === d.ad ? COLORS.coral : COLORS.line}`, background: ders === d.ad ? "#FFF1EF" : COLORS.page, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{d.emoji}</div>{d.ad}
                </button>
              ))}
            </div>
            <div style={{ background: COLORS.page, borderRadius: 12, padding: 14, marginBottom: 14, border: `1px solid ${COLORS.line}` }}>
              {ders && sinif === 8 && MUFREDAT[ders] && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>UNITE SEC (sirayla acilir - MEB mufredati, dogrulanmis)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {MUFREDAT[ders].map((u) => {
                      const acikMi = uniteAcikMi(ders, u);
                      const tamamMi = (tamamlananUniteler[ders] || []).includes(u);
                      return (
                        <button key={u} onClick={() => { if (acikMi) { const yeni = uniteSec === u ? null : u; setUniteSec(yeni); setAktifAltKonu(null); if (yeni) altKonulariGetir(ders, yeni); } }} disabled={!acikMi} style={{
                          padding: "5px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: acikMi ? "pointer" : "not-allowed",
                          border: `1.5px solid ${uniteSec === u ? COLORS.coral : COLORS.line}`,
                          background: uniteSec === u ? "#FFF1EF" : tamamMi ? "#EAF7EE" : "#fff",
                          color: acikMi ? COLORS.ink : "#B8B8B8", opacity: acikMi ? 1 : 0.6,
                        }}>{tamamMi ? "✓ " : !acikMi ? "🔒 " : ""}{u}</button>
                      );
                    })}
                  </div>
                  {uniteSec && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLORS.line}` }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>
                        ALT KONULAR {altKonuYukleniyor && "(hazirlaniyor…)"} <em style={{ fontWeight: 400 }}>
                          {DOGRULANMIS_ALT_KONULAR[altKonuAnahtari(ders, uniteSec)] ? "(MEB kazanimi - dogrulanmis)" : "(AI onerisi, resmi liste degil)"}
                        </em>
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {(altKonuCache[altKonuAnahtari(ders, uniteSec)] || []).map((ak) => {
                          const acik = altKonuAcikMi(ders, uniteSec, ak);
                          const tam = altKonuTamamlandiMi(ders, uniteSec, ak);
                          return (
                            <button key={ak} onClick={() => { if (acik) { setAktifAltKonu(ak); setKonu(ak); } }} disabled={!acik} style={{
                              padding: "5px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: acik ? "pointer" : "not-allowed",
                              border: `1.5px solid ${aktifAltKonu === ak ? COLORS.mustard : COLORS.line}`,
                              background: aktifAltKonu === ak ? "#FEF8E8" : tam ? "#EAF7EE" : "#fff",
                              color: acik ? COLORS.ink : "#B8B8B8", opacity: acik ? 1 : 0.6,
                            }}>{tam ? "✓ " : !acik ? "🔒 " : ""}{ak}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {ders && sinif !== 8 && (
                <p style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10, fontStyle: "italic" }}>
                  {sinif}. sinif icin dogrulanmis unite listesi henuz eklenmedi, konuyu asagiya kendin yaz.
                </p>
              )}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[["basit", "Basit"], ["orta", "Orta"], ["zor", "Zor"]].map(([k, etiket]) => (
                  <button key={k} onClick={() => setZorlukSec(k)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${zorlukSec === k ? COLORS.coral : COLORS.line}`, background: zorlukSec === k ? "#FFF1EF" : "#fff", color: COLORS.ink }}>
                    {etiket}
                  </button>
                ))}
              </div>
              <input value={konu} onChange={(e) => setKonu(e.target.value)} placeholder="orn. Uslu Sayilar..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 14, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button onClick={konuAnlat} disabled={!ders || !konu.trim() || yukleniyor} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>{yukleniyor === "aciklama" ? "Hazirlaniyor…" : "Konuyu Anlat"}</button>
                <button onClick={() => soruUret(false)} disabled={!ders || !konu.trim() || yukleniyor} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600 }}>{yukleniyor === "quiz" ? "Uretiliyor…" : "5 Soru"}</button>
                <button onClick={() => soruUret(true)} disabled={!ders || !konu.trim() || yukleniyor} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.coral}`, background: "transparent", color: COLORS.coral, fontWeight: 600, fontSize: 12 }}>{yukleniyor === "quiz" ? "Uretiliyor…" : "15 Soru (Fasikul)"}</button>
              </div>
              <button onClick={paragrafPratigiUret} disabled={!ders || !konu.trim() || yukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.mustard}`, background: "transparent", color: "#8A6D00", fontWeight: 600, fontSize: 12.5 }}>
                {yukleniyor === "paragraf" ? "Hazirlaniyor…" : "📖 20 Soruluk Paragraf Pratigi + Puf Noktalari"}
              </button>
            </div>
            {paragrafMetni && (
              <div style={{ background: "#FFF8E8", borderRadius: 12, padding: 16, marginBottom: 14, border: `1px solid ${COLORS.mustard}`, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#8A6D00" }}>📖 METIN</p>
                {paragrafMetni}
                {paragrafPufNoktalari && (
                  <>
                    <p style={{ fontWeight: 700, fontSize: 12, margin: "14px 0 8px", color: "#8A6D00" }}>💡 PUF NOKTALARI / ALTIN KURALLAR</p>
                    {paragrafPufNoktalari}
                  </>
                )}
              </div>
            )}
            {aciklama && <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, marginBottom: 14, border: `1px solid ${COLORS.line}`, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{aciklama}</div>}
            {quiz && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                {quiz.map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                      {i + 1}. {s.soru}
                      {s.zorluk && (
                        <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: s.zorluk === "kolay" ? "#EAF7EE" : s.zorluk === "orta" ? "#FFF8E8" : "#FFF1EF", color: s.zorluk === "kolay" ? "#3DA35D" : s.zorluk === "orta" ? "#B8860B" : COLORS.coral }}>{s.zorluk}</span>
                      )}
                    </div>
                    {s.secenekler.map((sec, j) => {
                      const secili = cevaplar[i] === j, dogru = gonderildi && j === s.dogruIndex, yanlis = gonderildi && secili && j !== s.dogruIndex;
                      return <button key={j} onClick={() => !gonderildi && setCevaplar((c) => ({ ...c, [i]: j }))} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13, cursor: gonderildi ? "default" : "pointer", border: `1.5px solid ${dogru ? "#3DA35D" : yanlis ? COLORS.coral : secili ? COLORS.mustard : COLORS.line}`, background: dogru ? "#EAF7EE" : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff" }}>{sec}</button>;
                    })}
                  </div>
                ))}
                {!gonderildi ? (
                  <button onClick={cevaplariGonder} disabled={Object.keys(cevaplar).length < quiz.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600 }}>Cevaplari Gonder</button>
                ) : (
                  <>
                    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 18, paddingTop: 4, marginBottom: 10 }}>Sonuc: {dogruSayisi} / {quiz.length} dogru</div>
                    <button onClick={() => window.print()} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🖨️ PDF Olarak Kaydet / Yazdir</button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#7C8AA5", marginTop: 24 }}>
        <a href="/gizlilik" style={{ color: "#7C8AA5" }}>Gizlilik Politikasi</a> · <a href="/kullanim-sartlari" style={{ color: "#7C8AA5" }}>Kullanim Sartlari</a> · <a href="/erisilebilirlik" style={{ color: "#7C8AA5" }}>Erisilebilirlik</a>
      </p>
    </div>
  );
}
