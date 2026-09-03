"use client";
import { useState, useEffect } from "react";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";
import { TEMALAR, temaOku, temaKaydet } from "@/lib/temalar";
import CerezBildirimi from "@/lib/CerezBildirimi";

// ==== Tasarim tokenlari - "Kayit Defteri" estetigi: bir ogretmenin
// karne/not defterini andiran, kagit + kirmizi kalem + tebesir yesili dili ====
// T artik MUTABLE (2 Eylul) - sadece marka renkleri (bg/text/textMuted/accent)
// temaya bagli, anlamsal renkler (danger/amber) SABIT kaliyor - kirmizi hep
// "hata/uyari" demeli, temaya gore degismemeli.
let T = {
  bg: "#F7F7F5",           // kagit zemin
  surface: "#FFFFFF",      // kart/panel yuzeyi
  surfaceHover: "#EFEFEA",
  border: "#E4E4DF",       // cetvel cizgisi
  text: "#1B2430",         // murekkep lacivert
  textMuted: "#6B7280",
  accent: "#3E7D5C",       // tebesir yesili - gelir/pozitif/onay
  accentSoft: "#E3EFE8",
  danger: "#B23A2E",       // kirmizi kalem - uyari/duzeltme
  dangerSoft: "#F5E4E1",
  amber: "#B8860B",
  amberSoft: "#F5EBD6",
  inputBg: "#FFFFFF",
  onAccent: "#FFFFFF",     // vurgu renkli buton uzerindeki metin
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headingFont: "Georgia, 'Times New Roman', serif",
  mono: "'SF Mono', 'Roboto Mono', ui-monospace, monospace",
};

function adminTemayiUygula(temaAdi) {
  const t = TEMALAR[temaAdi];
  if (!t) return;
  Object.assign(T, { bg: t.page, text: t.ink, textMuted: t.muted, accent: t.coral, accentSoft: t.coral + "22" });
}

// ==== Tipografi olcegi - 16 rastgele deger yerine 7 anlamli isim ====
const TYPO = {
  micro: 10.5,      // zaman damgasi, ikincil detay
  caption: 11.5,    // etiket, yardimci metin
  body: 12.5,        // standart govde metni
  bodyStrong: 13.5,  // vurgulu metin, alt basliklar
  heading: 15,       // panel basliklari
  title: 18,         // sayfa basligi
  display: 24,        // buyuk KPI rakamlari
};

function KpiKart({ etiket, deger, renk, altYazi, ikon }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "16px 18px", flex: "1 1 140px", minWidth: 140 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: TYPO.micro, fontWeight: 600, color: T.textMuted, letterSpacing: 0.4, textTransform: "uppercase" }}>{etiket}</span>
        <span style={{ fontSize: TYPO.heading, opacity: 0.7 }}>{ikon}</span>
      </div>
      <p style={{ fontFamily: T.mono, fontSize: TYPO.display, fontWeight: 700, color: renk || T.text, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>{deger}</p>
      {altYazi && <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginTop: 4 }}>{altYazi}</p>}
    </div>
  );
}

function Panel({ baslik, ikon, children, sagUst }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
        <p style={{ fontFamily: T.headingFont, fontSize: TYPO.heading, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 7, margin: 0 }}>
          <span>{ikon}</span> {baslik}
        </p>
        {sagUst}
      </div>
      {children}
    </div>
  );
}

// Onaylanan/tamamlanan kayitlar icin kucuk, yuvarlak "kase" rozeti - Kayit
// Defteri konseptinin imza ogesi.
function KaseRozeti({ metin }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, border: `1.5px solid ${T.accent}`, color: T.accent, fontSize: TYPO.micro, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>
      ✓ {metin}
    </span>
  );
}

const girdiStil = { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: TYPO.bodyStrong, fontFamily: T.font };
const etiketStil = { fontSize: TYPO.micro, fontWeight: 600, color: T.textMuted, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.3 };
function butonStil(aktif, renk) {
  return { padding: "9px 16px", borderRadius: 6, border: "none", background: aktif ? (renk || T.accent) : T.surfaceHover, color: aktif ? T.onAccent : T.textMuted, fontWeight: 700, fontSize: TYPO.body, cursor: aktif ? "pointer" : "default", transition: "background 0.15s" };
}

export default function YonetimPaneli() {
  const [sifre, setSifre] = useState("");
  const [personelEposta, setPersonelEposta] = useState("");
  const [personelSifre, setPersonelSifre] = useState("");
  const [personelBeniHatirla, setPersonelBeniHatirla] = useState(true);
  const [unutumModuAdmin, setUnutumModuAdmin] = useState(false);
  const [unutumMesajAdmin, setUnutumMesajAdmin] = useState("");
  const [personelAd, setPersonelAd] = useState("");
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [sekme, setSekme] = useState("genel");
  const [tema, setTemaState] = useState("orman");
  const [menuAcik, setMenuAcik] = useState(false);
  useEffect(() => { const t = temaOku("orman"); adminTemayiUygula(t); setTemaState(t); }, []);
  function temaSec(t) { adminTemayiUygula(t); temaKaydet(t); setTemaState(t); }
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");

  const [muhasebeVeri, setMuhasebeVeri] = useState(null);
  const [ogretmenTestSonuclari, setOgretmenTestSonuclari] = useState(null);
  const [hijyenSonuc, setHijyenSonuc] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [duzenlenenFiyatlar, setDuzenlenenFiyatlar] = useState({});
  const [fiyatKaydediliyor, setFiyatKaydediliyor] = useState(null);

  const [giderKategori, setGiderKategori] = useState("muhasebe");
  const [giderTutar, setGiderTutar] = useState("");
  const [giderAciklama, setGiderAciklama] = useState("");
  const [giderTekrarlayan, setGiderTekrarlayan] = useState(false);
  const [giderEkleniyor, setGiderEkleniyor] = useState(false);
  const [giderHesapId, setGiderHesapId] = useState("");

  const [taksitTutar, setTaksitTutar] = useState("");
  const [taksitSayisi, setTaksitSayisi] = useState(1);

  const [yeniOgretmenAd, setYeniOgretmenAd] = useState("");
  const [yeniOgretmenBrans, setYeniOgretmenBrans] = useState("Matematik");
  const [yeniOgretmenGun, setYeniOgretmenGun] = useState(1);
  const [yeniOgretmenBaslangic, setYeniOgretmenBaslangic] = useState("16:00");
  const [yeniOgretmenBitis, setYeniOgretmenBitis] = useState("20:00");
  const [ogretmenEkleniyor, setOgretmenEkleniyor] = useState(false);
  const [ogretmenlerListesi, setOgretmenlerListesi] = useState(null);
  const [canliDersOturumlari, setCanliDersOturumlari] = useState(null);
  const [cdTur, setCdTur] = useState("grup");
  const [cdOgretmenId, setCdOgretmenId] = useState("");
  const [cdDers, setCdDers] = useState("Matematik");
  const [cdKonu, setCdKonu] = useState("");
  const [cdBaslangic, setCdBaslangic] = useState("");
  const [cdSureDk, setCdSureDk] = useState(60);
  const [cdOturumSayisi, setCdOturumSayisi] = useState(8);
  const [cdOturumAraligiGun, setCdOturumAraligiGun] = useState(3);
  const [cdMaxKapasite, setCdMaxKapasite] = useState(5);
  const [cdOlusturuluyor, setCdOlusturuluyor] = useState(false);

  async function ogretmenleriGetir() {
    try {
      const res = await fetch(`/api/admin/ogretmen?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setOgretmenlerListesi(data.ogretmenler);
    } catch {}
  }

  async function canliDersleriGetir() {
    try {
      const res = await fetch(`/api/admin/canli-ders?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setCanliDersOturumlari(data.oturumlar);
    } catch {}
  }

  async function canliDersOlustur() {
    if (!cdOgretmenId || !cdBaslangic) { setHata("Ogretmen ve baslangic zamani gerekli."); return; }
    setCdOlusturuluyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/canli-ders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sifre, tur: cdTur, ogretmenId: Number(cdOgretmenId), ders: cdDers, konu: cdKonu || null,
          baslangicISO: new Date(cdBaslangic).toISOString(), sureDk: Number(cdSureDk),
          oturumSayisi: Number(cdOturumSayisi), oturumAraligiGun: Number(cdOturumAraligiGun), maxKapasite: Number(cdMaxKapasite),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`Oturum olusturuldu (${data.fiyatTl}₺/ogrenci).`);
      setCdKonu(""); setCdBaslangic("");
      canliDersleriGetir();
    } catch (e) { setHata(e.message); } finally { setCdOlusturuluyor(false); }
  }
  const [talepler, setTalepler] = useState(null);
  const [kariyerBasvurulari, setKariyerBasvurulari] = useState(null);

  // --- Kisisel Ik: Mesai/Izin/Gorev ---
  const [mesaiVeri, setMesaiVeri] = useState(null);
  const [mesaiIslemDurumu, setMesaiIslemDurumu] = useState(false);
  const [mesaiCikisNotu, setMesaiCikisNotu] = useState("");
  const [izinlerim, setIzinlerim] = useState(null);
  const [izinBaslangic, setIzinBaslangic] = useState("");
  const [izinBitis, setIzinBitis] = useState("");
  const [izinTur, setIzinTur] = useState("yillik");
  const [izinAciklama, setIzinAciklama] = useState("");
  const [izinGonderiliyor, setIzinGonderiliyor] = useState(false);
  const [gorevlerim, setGorevlerim] = useState(null);

  async function mesaiGetir() {
    try {
      const res = await fetch("/api/personel/mesai");
      const data = await res.json();
      if (res.ok) setMesaiVeri(data);
    } catch {}
  }
  async function mesaiIslemYap(aksiyon) {
    setMesaiIslemDurumu(true); mesajTemizle();
    try {
      const res = await fetch("/api/personel/mesai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aksiyon, not: mesaiCikisNotu || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMesaiCikisNotu("");
      mesaiGetir();
    } catch (e) { setHata(e.message); } finally { setMesaiIslemDurumu(false); }
  }

  async function izinleriGetir() {
    try {
      const res = await fetch("/api/personel/izin");
      const data = await res.json();
      if (res.ok) setIzinlerim(data.izinler);
    } catch {}
  }
  async function izinTalepEt() {
    if (!izinBaslangic || !izinBitis) { setHata("Baslangic ve bitis tarihi gerekli."); return; }
    setIzinGonderiliyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/personel/izin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslangicTarihi: izinBaslangic, bitisTarihi: izinBitis, tur: izinTur, aciklama: izinAciklama || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Izin talebin gonderildi."); setIzinBaslangic(""); setIzinBitis(""); setIzinAciklama("");
      izinleriGetir();
    } catch (e) { setHata(e.message); } finally { setIzinGonderiliyor(false); }
  }

  async function gorevleriGetir() {
    try {
      const res = await fetch("/api/personel/gorevlerim");
      const data = await res.json();
      if (res.ok) setGorevlerim(data.gorevler);
    } catch {}
  }
  async function gorevDurumGuncelle(gorevId, durum) {
    try {
      await fetch("/api/personel/gorevlerim", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gorevId, durum }),
      });
      gorevleriGetir();
    } catch {}
  }

  // --- Admin: Personel Yonetimi ---
  const [ikYonetimVeri, setIkYonetimVeri] = useState(null);
  const [izinKararDurumu, setIzinKararDurumu] = useState(null);
  const [yeniGorevBaslik, setYeniGorevBaslik] = useState("");
  const [yeniGorevAciklama, setYeniGorevAciklama] = useState("");
  const [yeniGorevAtanan, setYeniGorevAtanan] = useState("");
  const [yeniGorevSonTarih, setYeniGorevSonTarih] = useState("");
  const [gorevAtaniyor, setGorevAtaniyor] = useState(false);

  async function ikYonetimGetir() {
    try {
      const res = await fetch(`/api/admin/personel-yonetim?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setIkYonetimVeri(data);
    } catch {}
  }
  async function izinKararVer(izinId, karar) {
    setIzinKararDurumu(izinId);
    try {
      await fetch("/api/admin/personel-yonetim", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, islem: "izinKarar", izinId, karar }),
      });
      ikYonetimGetir();
    } catch {} finally { setIzinKararDurumu(null); }
  }
  async function gorevAta() {
    if (!yeniGorevBaslik.trim()) return;
    setGorevAtaniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/personel-yonetim", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, islem: "gorevAta", atananPersonelId: yeniGorevAtanan || null, baslik: yeniGorevBaslik, aciklama: yeniGorevAciklama || null, oncelik: "normal", sonTarih: yeniGorevSonTarih || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Gorev atandi."); setYeniGorevBaslik(""); setYeniGorevAciklama(""); setYeniGorevSonTarih("");
      ikYonetimGetir();
    } catch (e) { setHata(e.message); } finally { setGorevAtaniyor(false); }
  }

  async function kariyerBasvurulariGetir() {
    try {
      const res = await fetch(`/api/admin/kariyer-basvuru?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setKariyerBasvurulari(data.basvurular);
    } catch {}
  }

  async function talepleriGetir() {
    try {
      const res = await fetch(`/api/talep?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setTalepler(data.talepler);
    } catch {}
  }
  const [ogretmenBasvurulari, setOgretmenBasvurulari] = useState(null);
  const [ogretmenListesi, setOgretmenListesi] = useState(null);
  const [ogretmenBekleyenler, setOgretmenBekleyenler] = useState(null);
  const [ogretmenOnayDurumu, setOgretmenOnayDurumu] = useState(null);
  const [hesapFormAcik, setHesapFormAcik] = useState(null); // hangi ogretmen icin form acik
  const [hesapEposta, setHesapEposta] = useState({});
  const [hesapSifreDurumu, setHesapSifreDurumu] = useState(null);
  const [cvLinkYukleniyor, setCvLinkYukleniyor] = useState(null);
  const [basvuruIslemDurumu, setBasvuruIslemDurumu] = useState(null);
  const [basvuruOnaySaatlikUcret, setBasvuruOnaySaatlikUcret] = useState({});

  async function bekleyenOgretmenleriGetir() {
    try {
      const res = await fetch(`/api/admin/ogretmen-bekleyen?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setOgretmenBekleyenler(data.bekleyenler);
    } catch {}
  }

  async function ogretmenOnaylaVeyaReddet(ogretmenId, karar) {
    setOgretmenOnayDurumu(ogretmenId);
    try {
      const res = await fetch("/api/admin/ogretmen-onayla", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, ogretmenId, karar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOgretmenBekleyenler((eski) => eski.filter((o) => o.id !== ogretmenId));
      if (karar === "onayla") setOgretmenListesi(null); // aktif listeyi yenile
    } catch (e) { setHata(e.message); } finally { setOgretmenOnayDurumu(null); }
  }

  async function aktifOgretmenleriGetir() {
    try {
      const res = await fetch(`/api/admin/ogretmen?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setOgretmenListesi(data.ogretmenler);
    } catch {}
  }

  async function hesapOlustur(ogretmenId) {
    const eposta = hesapEposta[ogretmenId];
    if (!eposta?.trim()) { setHata("E-posta gerekli"); return; }
    setHesapSifreDurumu(ogretmenId);
    try {
      const res = await fetch("/api/admin/ogretmen-hesap", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, ogretmenId, eposta: eposta.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Hesap oluşturuldu. Öğretmene şifre belirleme e-postası gönderildi: ${eposta.trim()}`);
      setHesapFormAcik(null);
    } catch (e) { setHata(e.message); } finally { setHesapSifreDurumu(null); }
  }

  async function basvurulariGetir() {
    try {
      const res = await fetch(`/api/admin/ogretmen-basvuru?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setOgretmenBasvurulari(data.basvurular);
    } catch {}
  }

  async function cvGoruntule(basvuruId) {
    setCvLinkYukleniyor(basvuruId);
    try {
      const res = await fetch("/api/admin/kariyer-basvuru/cv-link", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, basvuruId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.open(data.url, "_blank");
    } catch (e) {
      setHata(e.message);
    } finally {
      setCvLinkYukleniyor(null);
    }
  }

  async function basvuruKararVer(id, karar) {
    setBasvuruIslemDurumu(id); mesajTemizle();
    try {
      const govde = { sifre, basvuruId: id, karar };
      if (karar === "onayla") {
        const ucret = basvuruOnaySaatlikUcret[id];
        if (!ucret || Number(ucret) <= 0) { setHata("Onay icin saatlik ucret girilmeli."); setBasvuruIslemDurumu(null); return; }
        govde.saatlikUcret = ucret;
      }
      const res = await fetch("/api/admin/ogretmen-basvuru", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(govde),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(karar === "onayla" ? "Basvuru onaylandi, ogretmen olusturuldu." : "Basvuru reddedildi.");
      basvurulariGetir();
    } catch (e) {
      setHata(e.message);
    } finally {
      setBasvuruIslemDurumu(null);
    }
  }

  const [duyuruMesaji, setDuyuruMesaji] = useState("");
  const [duyuruIl, setDuyuruIl] = useState("");
  const [duyuruSinif, setDuyuruSinif] = useState("");
  const [duyuruGonderiliyor, setDuyuruGonderiliyor] = useState(false);
  const [duyuruSonuc, setDuyuruSonuc] = useState(null);

  const [ulusalAd, setUlusalAd] = useState("");
  const [ulusalSinif, setUlusalSinif] = useState("8");
  const [ulusalDers, setUlusalDers] = useState("Matematik");
  const [ulusalSaat, setUlusalSaat] = useState(24);
  const [ulusalOlusturuluyor, setUlusalOlusturuluyor] = useState(false);
  const [ulusalKapsam, setUlusalKapsam] = useState("ulusal");
  const [ulusalIl, setUlusalIl] = useState("");

  const [cariler, setCariler] = useState(null);
  const [yeniCariAd, setYeniCariAd] = useState("");
  const [yeniCariTur, setYeniCariTur] = useState("musteri");
  const [yeniCariTelefon, setYeniCariTelefon] = useState("");
  const [cariEkleniyor, setCariEkleniyor] = useState(false);
  const [secilenCariId, setSecilenCariId] = useState(null);
  const [cariHareketleri, setCariHareketleri] = useState(null);
  const [hareketTur, setHareketTur] = useState("satis_veresiye");
  const [hareketTutar, setHareketTutar] = useState("");
  const [hareketAciklama, setHareketAciklama] = useState("");
  const [hareketHesapId, setHareketHesapId] = useState("");
  const [hareketEkleniyor, setHareketEkleniyor] = useState(false);

  const [kasaHesaplari, setKasaHesaplari] = useState(null);
  const [kasaToplamBakiye, setKasaToplamBakiye] = useState(0);
  const [yeniHesapAdi, setYeniHesapAdi] = useState("");
  const [yeniHesapTur, setYeniHesapTur] = useState("banka");
  const [yeniHesapBanka, setYeniHesapBanka] = useState("");
  const [yeniHesapBaslangic, setYeniHesapBaslangic] = useState("");
  const [hesapEkleniyor, setHesapEkleniyor] = useState(false);
  const [secilenHesapId, setSecilenHesapId] = useState(null);
  const [kasaHareketleri, setKasaHareketleri] = useState(null);
  const [kasaHareketTur, setKasaHareketTur] = useState("giris");
  const [kasaHareketTutar, setKasaHareketTutar] = useState("");
  const [kasaHareketAciklama, setKasaHareketAciklama] = useState("");
  const [kasaHareketEkleniyor, setKasaHareketEkleniyor] = useState(false);
  const [maliyetVeri, setMaliyetVeri] = useState(null);
  const [simulasyonVeri, setSimulasyonVeri] = useState(null);
  const [senaryoKonuAnlatimi, setSenaryoKonuAnlatimi] = useState(10);
  const [senaryoSoruCozumu, setSenaryoSoruCozumu] = useState(15);
  const [senaryoTekrarTesti, setSenaryoTekrarTesti] = useState(5);
  const [senaryoDeneme, setSenaryoDeneme] = useState(2);
  const [senaryoKisiSayisi, setSenaryoKisiSayisi] = useState(100);
  const [planlamaVeri, setPlanlamaVeri] = useState(null);
  const [hedefGelir, setHedefGelir] = useState("");
  const [hedefGider, setHedefGider] = useState("");
  const [hedefNot, setHedefNot] = useState("");
  const [hedefKaydediliyor, setHedefKaydediliyor] = useState(false);
  const [kurumlarVeri, setKurumlarVeri] = useState(null);
  const [ucretliDenemelerVeri, setUcretliDenemelerVeri] = useState(null);
  const [udAd, setUdAd] = useState("");
  const [udSinif, setUdSinif] = useState(8);
  const [udDers, setUdDers] = useState("Matematik");
  const [udFiyat, setUdFiyat] = useState("");
  const [udKapsam, setUdKapsam] = useState("ulusal");
  const [udIl, setUdIl] = useState("");
  const [udOlusturuluyor, setUdOlusturuluyor] = useState(false);
  const [duzenlenenKurumFiyat, setDuzenlenenKurumFiyat] = useState({});
  const [duzenlenenKurumEposta, setDuzenlenenKurumEposta] = useState({});
  const [raporGonderiliyor, setRaporGonderiliyor] = useState(null);
  const [duzenlenenKurumMin, setDuzenlenenKurumMin] = useState({});
  const [kurumKaydediliyor, setKurumKaydediliyor] = useState(null);
  const [indirimKodlariVeri, setIndirimKodlariVeri] = useState(null);
  const [mufredatVeri, setMufredatVeri] = useState(null);
  const [iadeVeri, setIadeVeri] = useState(null);
  const [ikizVeri, setIkizVeri] = useState(null);
  const [ikizOneriIslemDurumu, setIkizOneriIslemDurumu] = useState(null);
  const [iadeIslemDurumu, setIadeIslemDurumu] = useState(null);
  const [ikKod, setIkKod] = useState("");
  const [ikAciklama, setIkAciklama] = useState("");
  const [ikYuzde, setIkYuzde] = useState("");
  const [ikSabitTutar, setIkSabitTutar] = useState("");
  const [ikMaxKullanim, setIkMaxKullanim] = useState("");
  const [ikGecerlilikBitis, setIkGecerlilikBitis] = useState("");
  const [ikOlusturuluyor, setIkOlusturuluyor] = useState(false);
  const [ikDurumDegistiriliyor, setIkDurumDegistiriliyor] = useState(null);
  const [randevuOdemeVeri, setRandevuOdemeVeri] = useState(null);
  const [randevuIsaretleniyor, setRandevuIsaretleniyor] = useState(null);

  async function randevuOdemeGetir() {
    try {
      const res = await fetch(`/api/admin/randevu-odeme?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setRandevuOdemeVeri(data.randevular);
    } catch {}
  }

  async function randevuOdendiIsaretle(randevuId, odendi) {
    setRandevuIsaretleniyor(randevuId); mesajTemizle();
    try {
      const res = await fetch("/api/admin/randevu-odeme", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, randevuId, odendi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Randevu ödeme durumu güncellendi."); randevuOdemeGetir();
    } catch (e) { setHata(e.message); } finally { setRandevuIsaretleniyor(null); }
  }

  function mesajTemizle() { setHata(""); setBasari(""); }

  async function personelSifremiUnuttum() {
    setUnutumMesajAdmin("Gönderiliyor...");
    try {
      await fetch("/api/personel/sifre-sifirlama-iste", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: personelEposta }),
      });
      setUnutumMesajAdmin("E-postan varsa, sıfırlama linki gönderildi. Gelen kutunu kontrol et.");
    } catch { setUnutumMesajAdmin("Bir hata oluştu, tekrar dene."); }
  }

  async function girisDene() {
    mesajTemizle();
    setYukleniyor(true);
    try {
      // GERCEK kisisel giris - personel tablosuyla dogrulanir (24 Agustos).
      const girisRes = await fetch("/api/personel/giris", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: personelEposta, sifre: personelSifre, beniHatirla: personelBeniHatirla }),
      });
      const girisData = await girisRes.json();
      if (!girisRes.ok) throw new Error(girisData.error || "Giris basarisiz");
      setPersonelAd(girisData.ad);
      setSifre(girisData.sifre);

      const res = await fetch(`/api/admin/muhasebe?sifre=${encodeURIComponent(girisData.sifre)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş başarısız");
      setMuhasebeVeri(data);
      setGirisYapildi(true);
    } catch (e) {
      setHata(e.message || "Hatali giris ya da baglanti sorunu.");
    } finally {
      setYukleniyor(false);
    }
  }

  async function verileriYenile() {
    try {
      const res = await fetch(`/api/admin/muhasebe?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setMuhasebeVeri(data);
    } catch {}
  }

  async function fiyatKaydet(paketId) {
    const yeniFiyat = duzenlenenFiyatlar[paketId];
    if (yeniFiyat == null || yeniFiyat === "") return;
    setFiyatKaydediliyor(paketId); mesajTemizle();
    try {
      const res = await fetch("/api/admin/muhasebe", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, paketId, yeniFiyat: Number(yeniFiyat) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Fiyat güncellendi."); verileriYenile();
    } catch (e) { setHata(e.message); } finally { setFiyatKaydediliyor(null); }
  }

  async function giderEkle() {
    if (!giderTutar) return;
    setGiderEkleniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/muhasebe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, kategori: giderKategori, tutarTl: Number(giderTutar), aciklama: giderAciklama, tekrarlayan: giderTekrarlayan, hesapId: giderHesapId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Gider eklendi."); setGiderTutar(""); setGiderAciklama(""); setGiderTekrarlayan(false);
      verileriYenile();
    } catch (e) { setHata(e.message); } finally { setGiderEkleniyor(false); }
  }

  function taksitHesapla(tutar, taksit) {
    if (!tutar || taksit < 1) return null;
    const oranlar = { 1: 0.029, 2: 0.032, 3: 0.035, 6: 0.039, 9: 0.042, 12: 0.045 };
    const enYakin = Object.keys(oranlar).map(Number).reduce((en, k) => (Math.abs(k - taksit) < Math.abs(en - taksit) ? k : en));
    const oran = oranlar[enYakin];
    const komisyon = tutar * oran + 0.25;
    return { komisyon: komisyon.toFixed(2), net: (tutar - komisyon).toFixed(2), oran: (oran * 100).toFixed(2) };
  }

  async function ogretmenEkle() {
    if (!yeniOgretmenAd) return;
    if (yeniOgretmenBitis <= yeniOgretmenBaslangic) { setHata("Bitiş saati başlangıçtan sonra olmalı."); return; }
    setOgretmenEkleniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/ogretmen", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, ad: yeniOgretmenAd, brans: yeniOgretmenBrans, musaitlik: [{ gun: yeniOgretmenGun, baslangic: yeniOgretmenBaslangic, bitis: yeniOgretmenBitis }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${yeniOgretmenAd}" eklendi.`); setYeniOgretmenAd("");
    } catch (e) { setHata(e.message); } finally { setOgretmenEkleniyor(false); }
  }

  async function duyuruGonder() {
    if (!duyuruMesaji) return;
    setDuyuruGonderiliyor(true); mesajTemizle(); setDuyuruSonuc(null);
    try {
      const res = await fetch("/api/admin/duyuru", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, mesaj: duyuruMesaji, il: duyuruIl || null, sinif: duyuruSinif ? Number(duyuruSinif) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDuyuruSonuc(data); setDuyuruMesaji("");
    } catch (e) { setHata(e.message); } finally { setDuyuruGonderiliyor(false); }
  }

  async function ulusalOlustur() {
    if (!ulusalAd) return;
    if (ulusalKapsam === "yerel" && !ulusalIl) { setHata("Yerel kapsam icin il gerekli."); return; }
    setUlusalOlusturuluyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/ulusal-deneme/olustur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yoneticiSifre: sifre, ad: ulusalAd, sinif: Number(ulusalSinif), ders: ulusalDers, acikKalmaSaati: ulusalSaat, kapsam: ulusalKapsam, il: ulusalKapsam === "yerel" ? ulusalIl : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${ulusalAd}" başlatıldı.`); setUlusalAd(""); setUlusalIl("");
    } catch (e) { setHata(e.message); } finally { setUlusalOlusturuluyor(false); }
  }

  async function carileriGetir() {
    try {
      const res = await fetch(`/api/admin/cari?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setCariler(data.cariler);
    } catch {}
  }

  async function cariEkle() {
    if (!yeniCariAd) return;
    setCariEkleniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/cari", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, ad: yeniCariAd, tur: yeniCariTur, telefon: yeniCariTelefon || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${yeniCariAd}" eklendi.`); setYeniCariAd(""); setYeniCariTelefon("");
      carileriGetir();
    } catch (e) { setHata(e.message); } finally { setCariEkleniyor(false); }
  }

  async function cariSec(id) {
    setSecilenCariId(id); setCariHareketleri(null);
    try {
      const res = await fetch(`/api/admin/cari/hareket?sifre=${encodeURIComponent(sifre)}&cariId=${id}`);
      const data = await res.json();
      if (res.ok) setCariHareketleri(data.hareketler);
    } catch {}
  }

  async function hareketEkle() {
    if (!secilenCariId || !hareketTutar) return;
    setHareketEkleniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/cari/hareket", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, cariId: secilenCariId, tur: hareketTur, tutarTl: Number(hareketTutar), aciklama: hareketAciklama || null, hesapId: hareketHesapId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Hareket eklendi."); setHareketTutar(""); setHareketAciklama("");
      carileriGetir(); cariSec(secilenCariId);
    } catch (e) { setHata(e.message); } finally { setHareketEkleniyor(false); }
  }

  useEffect(() => { if (basari) { const t = setTimeout(() => setBasari(""), 4000); return () => clearTimeout(t); } }, [basari]);
  useEffect(() => { if (girisYapildi && sekme === "cari" && !cariler) carileriGetir(); }, [girisYapildi, sekme]);
  useEffect(() => {
    if (girisYapildi && sekme === "genel" && !ogretmenTestSonuclari) {
      fetch("/api/cron/ogretmen-test-sonuc").then((r) => r.json()).then((d) => setOgretmenTestSonuclari(d.sonuclar || []));
    }
  }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && (sekme === "kasa" || sekme === "cari" || sekme === "giderler") && !kasaHesaplari) kasaGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "maliyet" && !maliyetVeri) maliyetGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "simulasyon" && !simulasyonVeri) simulasyonGetir(); }, [girisYapildi, sekme]);

  async function simulasyonGetir() {
    try {
      const res = await fetch(`/api/admin/simulasyon?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setSimulasyonVeri(data);
    } catch {}
  }
  useEffect(() => { if (girisYapildi && sekme === "planlama" && !planlamaVeri) planlamaGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "kurumlar") { if (!kurumlarVeri) kurumlariGetir(); if (!ucretliDenemelerVeri) ucretliDenemeleriGetir(); } }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "indirimkodlari" && !indirimKodlariVeri) indirimKodlariGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "mufredat" && !mufredatVeri) mufredatGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "iadeler" && !iadeVeri) iadeleriGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "ikiz" && !ikizVeri) ikizGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "canliders") { if (!canliDersOturumlari) canliDersleriGetir(); if (!ogretmenlerListesi) ogretmenleriGetir(); } }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "randevuodeme" && !randevuOdemeVeri) randevuOdemeGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "ogretmen" && !ogretmenBasvurulari) basvurulariGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "ogretmen" && !ogretmenListesi) aktifOgretmenleriGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "ogretmen" && !ogretmenBekleyenler) bekleyenOgretmenleriGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "talepler" && !talepler) talepleriGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "kariyer" && !kariyerBasvurulari) kariyerBasvurulariGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "ik") { if (!mesaiVeri) mesaiGetir(); if (!izinlerim) izinleriGetir(); if (!gorevlerim) gorevleriGetir(); if (!ikYonetimVeri) ikYonetimGetir(); } }, [girisYapildi, sekme]);

  async function kurumlariGetir() {
    try {
      const res = await fetch(`/api/admin/kurum?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setKurumlarVeri(data.kurumlar);
    } catch {}
  }

  async function ikizGetir() {
    try {
      const res = await fetch(`/api/admin/sistem-ikizi?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setIkizVeri(data);
    } catch {}
  }

  async function ikizOneriKararVer(id, durum) {
    setIkizOneriIslemDurumu(id);
    try {
      const res = await fetch("/api/admin/sistem-ikizi", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, id, durum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      ikizGetir();
    } catch (e) { setHata(e.message); } finally { setIkizOneriIslemDurumu(null); }
  }

  async function iadeleriGetir() {
    try {
      const res = await fetch(`/api/admin/iade-talepleri?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setIadeVeri(data.talepler);
    } catch {}
  }

  async function iadeKararVer(id, durum) {
    setIadeIslemDurumu(id);
    try {
      const res = await fetch("/api/admin/iade-talepleri", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, id, durum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      iadeleriGetir();
    } catch (e) { setHata(e.message); } finally { setIadeIslemDurumu(null); }
  }

  async function mufredatGetir() {
    try {
      const res = await fetch(`/api/admin/mufredat?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setMufredatVeri(data);
    } catch {}
  }

  async function indirimKodlariGetir() {
    try {
      const res = await fetch(`/api/admin/indirim-kodu?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setIndirimKodlariVeri(data.kodlar);
    } catch {}
  }

  async function indirimKoduOlustur() {
    if (!ikKod || (!ikYuzde && !ikSabitTutar)) return;
    setIkOlusturuluyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/indirim-kodu", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sifre, kod: ikKod, aciklama: ikAciklama || null,
          yuzde: ikYuzde ? Number(ikYuzde) : null,
          sabitTutar: ikSabitTutar ? Number(ikSabitTutar) : null,
          maxKullanim: ikMaxKullanim ? Number(ikMaxKullanim) : null,
          gecerlilikBitis: ikGecerlilikBitis || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${ikKod.toUpperCase()}" kodu oluşturuldu.`);
      setIkKod(""); setIkAciklama(""); setIkYuzde(""); setIkSabitTutar(""); setIkMaxKullanim(""); setIkGecerlilikBitis("");
      indirimKodlariGetir();
    } catch (e) { setHata(e.message); } finally { setIkOlusturuluyor(false); }
  }

  async function indirimKoduDurumDegistir(id, yeniDurum) {
    setIkDurumDegistiriliyor(id); mesajTemizle();
    try {
      const res = await fetch("/api/admin/indirim-kodu", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, id, aktif: yeniDurum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      indirimKodlariGetir();
    } catch (e) { setHata(e.message); } finally { setIkDurumDegistiriliyor(null); }
  }

  async function ucretliDenemeleriGetir() {
    try {
      const res = await fetch(`/api/admin/ucretli-deneme?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setUcretliDenemelerVeri(data);
    } catch {}
  }

  async function ucretliDenemeOlustur() {
    if (!udAd || !udFiyat) return;
    if (udKapsam === "yerel" && !udIl) { setHata("Yerel kapsam icin il gerekli."); return; }
    setUdOlusturuluyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/ucretli-deneme", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, islem: "olustur", ad: udAd, sinif: Number(udSinif), ders: udDers, soruSayisi: 20, fiyatTl: Number(udFiyat), kapsam: udKapsam, il: udKapsam === "yerel" ? udIl : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${udAd}" olusturuldu (${data.soruSayisi} soru).`); setUdAd(""); setUdFiyat(""); setUdIl("");
      ucretliDenemeleriGetir();
    } catch (e) { setHata(e.message); } finally { setUdOlusturuluyor(false); }
  }

  async function denemeRaporuGonder(denemeId) {
    setRaporGonderiliyor(denemeId); mesajTemizle();
    try {
      const res = await fetch("/api/admin/ulusal-deneme/rapor-gonder", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, denemeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(data.gonderilenKurumSayisi > 0 ? `Rapor ${data.gonderilenKurumSayisi} kuruma gonderildi.` : (data.not || "Gonderilecek kurum bulunamadi."));
    } catch (e) { setHata(e.message); } finally { setRaporGonderiliyor(null); }
  }

  async function kurumFiyatKaydet(kurumId) {
    const fiyat = duzenlenenKurumFiyat[kurumId];
    const min = duzenlenenKurumMin[kurumId];
    const eposta = duzenlenenKurumEposta[kurumId];
    if (fiyat == null && min == null && eposta == null) return;
    setKurumKaydediliyor(kurumId); mesajTemizle();
    try {
      const mevcut = kurumlarVeri.find((k) => k.id === kurumId);
      const res = await fetch("/api/admin/kurum", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, kurumId, kisiBasiFiyatTl: fiyat != null ? Number(fiyat) : mevcut.kisi_basi_fiyat_tl, minKisiSayisi: min != null ? Number(min) : mevcut.min_kisi_sayisi, eposta: eposta != null ? eposta : mevcut.eposta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Kurum fiyatı güncellendi."); kurumlariGetir();
    } catch (e) { setHata(e.message); } finally { setKurumKaydediliyor(null); }
  }

  async function maliyetGetir() {
    try {
      const res = await fetch(`/api/admin/maliyet?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setMaliyetVeri(data);
    } catch {}
  }

  async function planlamaGetir() {
    try {
      const res = await fetch(`/api/admin/planlama?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) {
        setPlanlamaVeri(data);
        if (data.hedef) { setHedefGelir(String(data.hedef.gelir_hedefi_tl)); setHedefGider(String(data.hedef.gider_hedefi_tl)); setHedefNot(data.hedef.notlar || ""); }
      }
    } catch {}
  }

  async function hedefKaydet() {
    if (!planlamaVeri) return;
    setHedefKaydediliyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/planlama", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, yil: planlamaVeri.yil, ay: planlamaVeri.ay, gelirHedefiTl: Number(hedefGelir) || 0, giderHedefiTl: Number(hedefGider) || 0, notlar: hedefNot || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Hedef kaydedildi."); planlamaGetir();
    } catch (e) { setHata(e.message); } finally { setHedefKaydediliyor(false); }
  }

  async function kasaGetir() {
    try {
      const res = await fetch(`/api/admin/kasa?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) { setKasaHesaplari(data.hesaplar); setKasaToplamBakiye(data.toplamBakiye); }
    } catch {}
  }

  async function hesapEkle() {
    if (!yeniHesapAdi) return;
    setHesapEkleniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/kasa", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, hesapAdi: yeniHesapAdi, tur: yeniHesapTur, bankaAdi: yeniHesapBanka || null, baslangicBakiyesi: Number(yeniHesapBaslangic) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${yeniHesapAdi}" eklendi.`); setYeniHesapAdi(""); setYeniHesapBanka(""); setYeniHesapBaslangic("");
      kasaGetir();
    } catch (e) { setHata(e.message); } finally { setHesapEkleniyor(false); }
  }

  async function hesapSec(id) {
    setSecilenHesapId(id); setKasaHareketleri(null);
    try {
      const res = await fetch(`/api/admin/kasa/hareket?sifre=${encodeURIComponent(sifre)}&hesapId=${id}`);
      const data = await res.json();
      if (res.ok) setKasaHareketleri(data.hareketler);
    } catch {}
  }

  async function kasaHareketEkle() {
    if (!secilenHesapId || !kasaHareketTutar) return;
    setKasaHareketEkleniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/kasa/hareket", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, hesapId: secilenHesapId, tur: kasaHareketTur, tutarTl: Number(kasaHareketTutar), aciklama: kasaHareketAciklama || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Hareket eklendi."); setKasaHareketTutar(""); setKasaHareketAciklama("");
      kasaGetir(); hesapSec(secilenHesapId);
    } catch (e) { setHata(e.message); } finally { setKasaHareketEkleniyor(false); }
  }

  // ==== GİRİŞ EKRANI ====
  if (!girisYapildi) {
    return (
      <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 50% 0%, ${T.accentSoft} 0%, ${T.bg} 60%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font, padding: 20 }}>
        <style>{`
          @keyframes adminFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes adminLogoPop { 0% { opacity: 0; transform: scale(0.5) rotate(-15deg); } 60% { opacity: 1; transform: scale(1.1) rotate(3deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
          @keyframes adminGlow { 0%, 100% { box-shadow: 0 0 24px rgba(62,125,92,0.15); } 50% { box-shadow: 0 0 40px rgba(62,125,92,0.3); } }
          .admin-giris-kutu { animation: adminFadeUp 0.5s ease-out; }
          .admin-logo { animation: adminLogoPop 0.6s cubic-bezier(0.34,1.56,0.64,1), adminGlow 3s ease-in-out infinite 0.6s; }
        `}</style>
        <div className="admin-giris-kutu" style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <img src="/icons/icon-192.png" alt="Karemux" className="admin-logo" style={{ width: 52, height: 52, borderRadius: 14, margin: "0 auto 14px", display: "block", boxShadow: "0 4px 16px rgba(27,36,48,0.18)" }} />
            <p style={{ color: T.text, fontSize: TYPO.title, fontWeight: 700 }}>Karemux Yönetim</p>
            <p style={{ color: T.textMuted, fontSize: TYPO.body, marginTop: 3 }}>Bu alan sadece yöneticiye açıktır</p>
          </div>
          <input type="email" value={personelEposta} onChange={(e) => setPersonelEposta(e.target.value)} aria-label="Personel eposta"
            placeholder="Eposta" style={{ ...girdiStil, padding: "12px 14px", fontSize: TYPO.bodyStrong, marginBottom: 10 }} autoFocus />
          <GosterGizleInput value={personelSifre} onChange={(e) => setPersonelSifre(e.target.value)} onKeyDown={(e) => e.key === "Enter" && girisDene()}
            placeholder="Şifre" style={{ ...girdiStil, padding: "12px 14px", fontSize: TYPO.bodyStrong, marginBottom: 10 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: TYPO.caption, color: T.textMuted, cursor: "pointer" }}>
            <input type="checkbox" checked={personelBeniHatirla} aria-label="Beni hatirla" onChange={(e) => setPersonelBeniHatirla(e.target.checked)} />
            Beni hatırla (bu cihazda oturumu açık tut)
          </label>
          <button onClick={girisDene} disabled={yukleniyor || !personelEposta || !personelSifre} style={{ ...butonStil(!!(personelEposta && personelSifre)), width: "100%", padding: "12px 0", fontSize: TYPO.bodyStrong }}>
            {yukleniyor ? "Kontrol ediliyor..." : "Giriş Yap"}
          </button>
          {hata && <p style={{ color: T.danger, fontSize: TYPO.body, marginTop: 12, textAlign: "center" }}>{hata}</p>}
          <button onClick={() => setUnutumModuAdmin(!unutumModuAdmin)} style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "none", color: T.textMuted, fontSize: 12, marginTop: 12, cursor: "pointer", textDecoration: "underline" }}>Şifremi unuttum</button>
          {unutumModuAdmin && (
            <div style={{ marginTop: 8, textAlign: "center" }}>
              <button onClick={personelSifremiUnuttum} disabled={!personelEposta} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 6, border: `1px solid ${T.accent}`, background: "none", color: T.accent, cursor: "pointer" }}>E-postama sıfırlama linki gönder</button>
              {unutumMesajAdmin && <p style={{ fontSize: 11.5, color: T.textMuted, marginTop: 6 }}>{unutumMesajAdmin}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  const SEKME_GRUPLARI = [
    { baslik: null, sekmeler: [["genel", "📊 Genel Bakış"]] },
    { baslik: "💰 Finans", sekmeler: [
      ["paketler", "💰 Paketler"], ["giderler", "🧾 Giderler"], ["cari", "🤝 Cari"], ["kasa", "🏦 Kasa/Banka"],
      ["maliyet", "🤖 Üretim Maliyeti"], ["simulasyon", "🧮 Simülasyon"], ["planlama", "📈 Finansal Planlama"],
      ["indirimkodlari", "🏷️ İndirim Kodları"], ["iadeler", "🛡️ İade Talepleri"],
    ]},
    { baslik: "🎓 Eğitim", sekmeler: [["mufredat", "📚 Müfredat"], ["ogretmen", "🎓 Öğretmenler"]] },
    { baslik: "🎥 Canlı Hizmetler", sekmeler: [["canliders", "🎥 Canlı Ders"], ["randevuodeme", "📅 Randevu Ödemeleri"], ["kurumlar", "🏢 Kurumlar"]] },
    { baslik: "👥 İnsan Kaynakları", sekmeler: [["ik", "🗂️ Personel Yönetimi"], ["kariyer", "🧑‍💼 Kariyer Havuzu"]] },
    { baslik: "📢 İletişim", sekmeler: [["duyuru", "📢 Duyuru"], ["talepler", "💡 Kullanıcı Talepleri"]] },
    { baslik: "⚙️ Sistem", sekmeler: [["ikiz", "🐋 Sistem İkizi"], ["tema", "🎨 Tema"]] },
  ];
  const SEKMELER = SEKME_GRUPLARI.flatMap((g) => g.sekmeler);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, paddingBottom: 60 }}>
      <style>{`
        @keyframes adminPanelFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .admin-panel-govde { animation: adminPanelFadeIn 0.35s ease-out; }
      `}</style>
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setMenuAcik(true)} style={{ background: "none", border: "none", color: T.text, fontSize: 22, cursor: "pointer", padding: 0 }}>☰</button>
          <img src="/icons/icon-192.png" alt="Karemux" style={{ width: 28, height: 28, borderRadius: 8, display: "block", objectFit: "cover" }} />
          <div>
            <h1 style={{ fontWeight: 700, fontSize: TYPO.heading, margin: 0 }}>Karemux Yönetim</h1>
            {personelAd && <p style={{ fontSize: TYPO.micro, color: T.textMuted, margin: 0 }}>Hoş geldin, {personelAd}</p>}
          </div>
        </div>
      </div>

      {menuAcik && (
        <div onClick={() => setMenuAcik(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.surface, width: 280, height: "100%", padding: "20px 16px", boxShadow: "2px 0 12px rgba(0,0,0,0.15)", overflowY: "auto" }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{personelAd || "Yönetim"}</p>
            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 18 }}>Karemux Yönetim Paneli</p>
            {SEKME_GRUPLARI.map((g, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                {g.baslik && <p style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{g.baslik}</p>}
                {g.sekmeler.map(([k, etiket]) => (
                  <button key={k} onClick={() => { setSekme(k); mesajTemizle(); setMenuAcik(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 8, border: "none", background: sekme === k ? T.accentSoft : "transparent", color: sekme === k ? T.accent : T.text, fontSize: 13.5, fontWeight: sekme === k ? 700 : 500, cursor: "pointer", marginBottom: 1 }}>
                    {etiket}
                  </button>
                ))}
              </div>
            ))}
            <button onClick={async () => { await fetch("/api/personel/cikis", { method: "POST" }); setGirisYapildi(false); setSifre(""); setPersonelEposta(""); setPersonelSifre(""); setPersonelAd(""); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 10px", borderRadius: 8, border: "none", background: "none", color: T.danger, fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginTop: 10 }}>
              Çıkış Yap
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        {(hata || basari) && (
          <div style={{ background: hata ? T.dangerSoft : T.accentSoft, border: `1px solid ${hata ? T.danger : T.accent}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: TYPO.body, color: hata ? T.danger : T.accent }}>
            {hata || basari}
          </div>
        )}

        {sekme === "genel" && (
          <>
            <button onClick={async () => {
              try {
                const res = await fetch(`/api/admin/gecici-tablo-listesi?sifre=${encodeURIComponent(sifre)}`);
                const data = await res.json();
                if (!res.ok) { setHijyenSonuc("HATA: " + JSON.stringify(data)); return; }
                setHijyenSonuc(data.tablolar.map((t) => `${t.tablo}: ${t.satir_sayisi}`).join("\n"));
              } catch (e) { setHijyenSonuc("İSTİSNA: " + e.message); }
            }} style={{ ...butonStil(true), padding: "9px 14px", fontSize: TYPO.body, marginBottom: 12 }}>
              🧹 Hijyen: Tablo Listesi
            </button>
            {hijyenSonuc && (
              <>
                <button onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(hijyenSonuc);
                    alert("Panoya kopyalandı!");
                  } catch (e) { alert("Kopyalanamadı: " + e.message); }
                }} style={{ ...butonStil(true), padding: "9px 14px", fontSize: TYPO.body, marginBottom: 8 }}>
                  📋 Panoya Kopyala
                </button>
                <textarea readOnly value={hijyenSonuc}
                  style={{ width: "100%", height: 300, padding: 10, borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: "monospace", marginBottom: 12, boxSizing: "border-box" }} />
              </>
            )}
          </>
        )}

        {sekme === "genel" && ogretmenTestSonuclari?.some((s) => !s.basarili) && (
          <div style={{ background: "#FDECEA", border: `1px solid ${T.danger}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: T.danger }}>⚠️ Öğretmen Materyal Araçları — Bazı Araçlar Başarısız</p>
            {ogretmenTestSonuclari.filter((s) => !s.basarili).map((s) => (
              <p key={s.tur} style={{ fontSize: 11.5, color: T.textMuted, margin: "2px 0" }}>{s.tur}: {s.hata_mesaji}</p>
            ))}
          </div>
        )}

        {sekme === "genel" && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Hızlı Erişim</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["paketler", "ogretmen", "talepler", "ikiz", "cari", "kariyer"].map((k) => {
                const etiket = SEKME_GRUPLARI.flatMap((g) => g.sekmeler).find(([kk]) => kk === k)?.[1];
                if (!etiket) return null;
                return (
                  <button key={k} onClick={() => { setSekme(k); mesajTemizle(); }} style={{ textAlign: "left", background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: 12, cursor: "pointer" }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, margin: 0, color: T.text }}>{etiket}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sekme === "genel" && muhasebeVeri && (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <KpiKart etiket="Bu Ay Gelir" deger={`${muhasebeVeri.buAy.gelir.toFixed(0)} ₺`} renk={T.accent} altYazi={`${muhasebeVeri.buAy.satisAdedi} satış`} ikon="💵" />
              <KpiKart etiket="Bu Ay Gider" deger={`${muhasebeVeri.buAy.gider.toFixed(0)} ₺`} renk={T.danger} ikon="📉" />
              <KpiKart etiket={muhasebeVeri.buAy.kar >= 0 ? "Bu Ay Kâr" : "Bu Ay Zarar"} deger={`${muhasebeVeri.buAy.kar.toFixed(0)} ₺`} renk={muhasebeVeri.buAy.kar >= 0 ? T.accent : T.danger} ikon={muhasebeVeri.buAy.kar >= 0 ? "📈" : "⚠️"} />
              <KpiKart etiket="Tahmini AI Maliyeti" deger={`~${muhasebeVeri.buAy.tahminiAiMaliyetTl || 0} ₺`} renk={T.amber} altYazi="Gerçek fatura için sağlayıcı paneli" ikon="🤖" />
            </div>

            <Panel baslik="Genel Toplam (Kuruluştan Beri)" ikon="🏦">
              <div style={{ display: "flex", gap: 20 }}>
                <div><p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 3 }}>GELİR</p><p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 700 }}>{muhasebeVeri.genel.gelir.toFixed(0)} ₺</p></div>
                <div><p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 3 }}>GİDER</p><p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 700 }}>{muhasebeVeri.genel.gider.toFixed(0)} ₺</p></div>
                <div><p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 3 }}>{muhasebeVeri.genel.kar >= 0 ? "KÂR" : "ZARAR"}</p><p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 700, color: muhasebeVeri.genel.kar >= 0 ? T.accent : T.danger }}>{muhasebeVeri.genel.kar.toFixed(0)} ₺</p></div>
              </div>
            </Panel>

            {muhasebeVeri.paketBazindaSatis?.some((p) => p.adet > 0) && (
              <Panel baslik="Paket Bazında Satış (Bu Ay)" ikon="📦">
                {muhasebeVeri.paketBazindaSatis.filter((p) => p.adet > 0).map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < muhasebeVeri.paketBazindaSatis.length - 1 ? `1px solid ${T.border}` : "none", fontSize: TYPO.body }}>
                    <span style={{ color: T.textMuted }}>{p.ad}</span>
                    <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{p.adet} adet · {Number(p.toplam).toFixed(0)} ₺</span>
                  </div>
                ))}
              </Panel>
            )}

            {muhasebeVeri.giderKategoriler?.length > 0 && (
              <Panel baslik="Gider Dağılımı (Bu Ay)" ikon="🧾">
                {muhasebeVeri.giderKategoriler.map((g, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < muhasebeVeri.giderKategoriler.length - 1 ? `1px solid ${T.border}` : "none", fontSize: TYPO.body }}>
                    <span style={{ color: T.textMuted, textTransform: "capitalize" }}>{g.kategori}</span>
                    <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{Number(g.toplam).toFixed(0)} ₺</span>
                  </div>
                ))}
              </Panel>
            )}
          </>
        )}

        {sekme === "paketler" && muhasebeVeri && (
          <>
          <Panel baslik="Özel Ders / Canlı Ders Referans Fiyatları" ikon="🎓">
            <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 12 }}>
              Bunlar satılabilir "paket" değil — öğretmen kademesine (A/B/C) göre değişen, otomatik hesaplanan fiyatlardır (bkz. lib/fiyatlandirma.js). Referans amaçlıdır, buradan düzenlenemez.
            </p>
            <p style={{ fontSize: TYPO.bodyStrong, fontWeight: 700, marginBottom: 6 }}>1-1 Özel Ders (randevu)</p>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: TYPO.body, borderBottom: `1px solid ${T.border}` }}><span>C Kademe</span><span style={{ fontFamily: T.mono }}>600₺/saat</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: TYPO.body, borderBottom: `1px solid ${T.border}` }}><span>B Kademe</span><span style={{ fontFamily: T.mono }}>900₺/saat</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: TYPO.body, marginBottom: 14 }}><span>A Kademe</span><span style={{ fontFamily: T.mono }}>1.300₺+/saat</span></div>
            <p style={{ fontSize: TYPO.bodyStrong, fontWeight: 700, marginBottom: 6 }}>Canlı Grup Dersi / Kamp / Soru Çözüm (sabit: 5 kişilik grup)</p>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: TYPO.body, borderBottom: `1px solid ${T.border}` }}><span>Grup Dersi (haftada 2 gün, ayda 8 ders)</span><span style={{ fontFamily: T.mono }}>1.200₺/ay</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: TYPO.body, borderBottom: `1px solid ${T.border}` }}><span>Kamp (5 gün, günde 2 saat, tek seferlik)</span><span style={{ fontFamily: T.mono }}>1.600₺</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: TYPO.body }}><span>Soru Çözüm Saati (haftada 1 gün, ayda 4 ders)</span><span style={{ fontFamily: T.mono }}>600₺/ay</span></div>
            <p style={{ fontSize: TYPO.micro, color: T.textMuted, marginTop: 6 }}>5 kişilik sabit grup, C kademe (600₺/sa) öğretmen varsayımıyla hesaplanmıştır. Gerçek oturum saatlik ücretine göre değişir.</p>
          </Panel>

          <Panel baslik="Satış Paketleri" ikon="💰">
            {muhasebeVeri.paketler?.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, background: T.surfaceHover, borderRadius: 9, padding: "10px 12px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: TYPO.body, fontWeight: 600 }}>{p.ad}</p>
                  <p style={{ fontSize: TYPO.micro, color: T.textMuted }}>{p.sure_gun ? `${p.sure_gun} gün erişim` : `${p.kredi_miktari} kredi`}</p>
                </div>
                <input type="number" defaultValue={p.fiyat_tl} aria-label="Fiyat" onChange={(e) => setDuzenlenenFiyatlar((eski) => ({ ...eski, [p.id]: e.target.value }))}
                  style={{ ...girdiStil, width: 80, textAlign: "right", padding: "7px 9px" }} />
                <span style={{ color: T.textMuted, fontSize: TYPO.caption }}>₺</span>
                <button onClick={() => fiyatKaydet(p.id)} disabled={fiyatKaydediliyor === p.id || duzenlenenFiyatlar[p.id] == null}
                  style={{ ...butonStil(duzenlenenFiyatlar[p.id] != null), padding: "7px 12px", fontSize: TYPO.caption }}>
                  {fiyatKaydediliyor === p.id ? "..." : "Kaydet"}
                </button>
              </div>
            ))}
          </Panel>
          </>
        )}

        {sekme === "giderler" && (
          <>
            <Panel baslik="Yeni Gider Ekle" ikon="➕">
              <label style={etiketStil}>Kategori</label>
              <select value={giderKategori} aria-label="Gider kategorisi" onChange={(e) => setGiderKategori(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
                {["muhasebe", "bagkur", "vergi", "ai_maliyeti", "domain", "sunucu", "hosting", "odeme_komisyonu", "pazarlama", "diger"].map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <label style={etiketStil}>Tutar (₺)</label>
              <input type="number" value={giderTutar} aria-label="Gider tutari" onChange={(e) => setGiderTutar(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={etiketStil}>Açıklama (opsiyonel)</label>
              <input value={giderAciklama} aria-label="Gider aciklamasi" onChange={(e) => setGiderAciklama(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, fontSize: TYPO.body, color: T.textMuted }}>
                <input type="checkbox" checked={giderTekrarlayan} aria-label="Tekrarlayan gider" onChange={(e) => setGiderTekrarlayan(e.target.checked)} />
                Her ay otomatik tekrarla
              </label>
              <label style={etiketStil}>Hangi Kasa/Banka Hesabından? (opsiyonel, seçilirse otomatik yansır)</label>
              <select value={giderHesapId} aria-label="Hesap" onChange={(e) => setGiderHesapId(e.target.value)} style={{ ...girdiStil, marginBottom: 12 }}>
                <option value="">— Seçilmedi —</option>
                {kasaHesaplari?.map((h) => <option key={h.id} value={h.id}>{h.hesap_adi}</option>)}
              </select>
              <button onClick={giderEkle} disabled={giderEkleniyor || !giderTutar} style={{ ...butonStil(!!giderTutar, T.danger), width: "100%", padding: "10px 0" }}>
                {giderEkleniyor ? "Ekleniyor..." : "Gider Ekle"}
              </button>
            </Panel>

            {muhasebeVeri?.sonGiderler?.length > 0 && (
              <Panel baslik="Son Giderler" ikon="🧾">
                {muhasebeVeri.sonGiderler.map((g) => (
                  <div key={g.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}`, fontSize: TYPO.body }}>
                    <div>
                      <span style={{ textTransform: "capitalize" }}>{g.kategori}</span>
                      {g.aciklama && <span style={{ color: T.textMuted }}> — {g.aciklama}</span>}
                    </div>
                    <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.danger }}>{Number(g.tutar_tl).toFixed(0)} ₺</span>
                  </div>
                ))}
              </Panel>
            )}

            <Panel baslik="Taksit Komisyon Hesaplayıcı" ikon="📐" sagUst={<span style={{ fontSize: TYPO.micro, color: T.textMuted }}>tahmini</span>}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input type="number" value={taksitTutar} aria-label="Satis tutari" onChange={(e) => setTaksitTutar(e.target.value)} placeholder="Satış tutarı" style={girdiStil} />
                <select value={taksitSayisi} aria-label="Taksit sayisi" onChange={(e) => setTaksitSayisi(Number(e.target.value))} style={girdiStil}>
                  {[1, 2, 3, 6, 9, 12].map((t) => <option key={t} value={t}>{t} Taksit</option>)}
                </select>
              </div>
              {taksitTutar && (() => {
                const s = taksitHesapla(Number(taksitTutar), taksitSayisi);
                return s ? <p style={{ fontSize: TYPO.body }}>Komisyon (~%{s.oran}): <strong style={{ color: T.danger }}>{s.komisyon} ₺</strong> · Net: <strong style={{ color: T.accent }}>{s.net} ₺</strong></p> : null;
              })()}
            </Panel>
          </>
        )}

        {sekme === "cari" && (
          <>
            <Panel baslik="Yeni Cari Ekle" ikon="➕">
              <label style={etiketStil}>Ad / Unvan</label>
              <input value={yeniCariAd} aria-label="Cari adi" onChange={(e) => setYeniCariAd(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={yeniCariTur} aria-label="Cari turu" onChange={(e) => setYeniCariTur(e.target.value)} style={girdiStil}>
                  <option value="musteri">Müşteri (Kurum/Bireysel)</option>
                  <option value="tedarikci">Tedarikçi</option>
                  <option value="diger">Diğer</option>
                </select>
                <input value={yeniCariTelefon} aria-label="Telefon" onChange={(e) => setYeniCariTelefon(e.target.value)} placeholder="Telefon (opsiyonel)" style={girdiStil} />
              </div>
              <button onClick={cariEkle} disabled={cariEkleniyor || !yeniCariAd} style={{ ...butonStil(!!yeniCariAd), width: "100%", padding: "10px 0" }}>
                {cariEkleniyor ? "Ekleniyor..." : "Cari Ekle"}
              </button>
            </Panel>

            <Panel baslik="Cari Listesi" ikon="🤝">
              {!cariler ? <p aria-live="polite" style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : cariler.length === 0 ? (
                <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz cari yok.</p>
              ) : cariler.map((c) => (
                <div key={c.id} onClick={() => cariSec(c.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cariSec(c.id); } }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: secilenCariId === c.id ? T.surfaceHover : "transparent" }}>
                  <div>
                    <p style={{ fontSize: TYPO.body, fontWeight: 600 }}>{c.ad}</p>
                    <p style={{ fontSize: TYPO.micro, color: T.textMuted, textTransform: "capitalize" }}>{c.tur}</p>
                  </div>
                  <p style={{ fontFamily: T.mono, fontSize: TYPO.bodyStrong, fontWeight: 700, color: Number(c.bakiye) > 0 ? T.accent : Number(c.bakiye) < 0 ? T.danger : T.textMuted }}>
                    {Number(c.bakiye) > 0 ? `+${Number(c.bakiye).toFixed(0)} ₺` : `${Number(c.bakiye).toFixed(0)} ₺`}
                  </p>
                </div>
              ))}
            </Panel>

            {secilenCariId && (
              <Panel baslik="Hareket Ekle" ikon="📝">
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <select value={hareketTur} aria-label="Hareket turu" onChange={(e) => setHareketTur(e.target.value)} style={girdiStil}>
                    <option value="satis_veresiye">Veresiye Satış (bize borçlandı)</option>
                    <option value="tahsilat">Tahsilat (ödedi)</option>
                    <option value="tedarik_borcu">Tedarik Borcu (biz borçlandık)</option>
                    <option value="odeme">Ödeme Yaptık</option>
                  </select>
                  <input type="number" value={hareketTutar} aria-label="Hareket tutari" onChange={(e) => setHareketTutar(e.target.value)} placeholder="Tutar ₺" style={girdiStil} />
                </div>
                <input value={hareketAciklama} aria-label="Hareket aciklamasi" onChange={(e) => setHareketAciklama(e.target.value)} placeholder="Açıklama (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
                {(hareketTur === "tahsilat" || hareketTur === "odeme") && (
                  <div style={{ marginBottom: 10 }}>
                    <label style={etiketStil}>Hangi Kasa/Banka Hesabı? (opsiyonel, seçilirse otomatik yansır)</label>
                    <select value={hareketHesapId} aria-label="Hesap" onChange={(e) => setHareketHesapId(e.target.value)} style={girdiStil}>
                      <option value="">— Seçilmedi —</option>
                      {kasaHesaplari?.map((h) => <option key={h.id} value={h.id}>{h.hesap_adi}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={hareketEkle} disabled={hareketEkleniyor || !hareketTutar} style={{ ...butonStil(!!hareketTutar), width: "100%", padding: "10px 0", marginBottom: 14 }}>
                  {hareketEkleniyor ? "Ekleniyor..." : "Hareket Ekle"}
                </button>
                {cariHareketleri?.length > 0 && (
                  <div>
                    <p style={{ fontSize: TYPO.micro, fontWeight: 700, color: T.textMuted, marginBottom: 8, textTransform: "uppercase" }}>Son Hareketler</p>
                    {cariHareketleri.map((h) => (
                      <div key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: TYPO.caption }}>
                        <span style={{ color: T.textMuted }}>{h.tarih} — {h.tur}{h.aciklama ? ` (${h.aciklama})` : ""}</span>
                        <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{Number(h.tutar_tl).toFixed(0)} ₺</span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            )}
          </>
        )}

        {sekme === "kasa" && (
          <>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: TYPO.micro, fontWeight: 600, color: T.textMuted, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 }}>Toplam Bakiye (Tüm Hesaplar)</p>
              <p style={{ fontFamily: T.mono, fontSize: TYPO.display, fontWeight: 700, color: kasaToplamBakiye >= 0 ? T.accent : T.danger }}>{kasaToplamBakiye.toFixed(0)} ₺</p>
            </div>

            <Panel baslik="Yeni Hesap Ekle" ikon="➕">
              <label style={etiketStil}>Hesap Adı</label>
              <input value={yeniHesapAdi} aria-label="Hesap adi" onChange={(e) => setYeniHesapAdi(e.target.value)} placeholder="Örn: İş Bankası Şirket Hesabı" style={{ ...girdiStil, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={yeniHesapTur} aria-label="Hesap turu" onChange={(e) => setYeniHesapTur(e.target.value)} style={girdiStil}>
                  <option value="banka">Banka Hesabı</option>
                  <option value="nakit">Nakit (Kasa)</option>
                </select>
                <input value={yeniHesapBanka} aria-label="Banka adi" onChange={(e) => setYeniHesapBanka(e.target.value)} placeholder="Banka adı (opsiyonel)" style={girdiStil} />
              </div>
              <label style={etiketStil}>Başlangıç Bakiyesi (₺)</label>
              <input type="number" value={yeniHesapBaslangic} aria-label="Baslangic bakiyesi" onChange={(e) => setYeniHesapBaslangic(e.target.value)} style={{ ...girdiStil, marginBottom: 14 }} />
              <button onClick={hesapEkle} disabled={hesapEkleniyor || !yeniHesapAdi} style={{ ...butonStil(!!yeniHesapAdi), width: "100%", padding: "10px 0" }}>
                {hesapEkleniyor ? "Ekleniyor..." : "Hesap Ekle"}
              </button>
            </Panel>

            <Panel baslik="Hesaplar" ikon="🏦">
              {!kasaHesaplari ? <p aria-live="polite" style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : kasaHesaplari.length === 0 ? (
                <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz hesap yok.</p>
              ) : kasaHesaplari.map((h) => (
                <div key={h.id} onClick={() => hesapSec(h.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hesapSec(h.id); } }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: secilenHesapId === h.id ? T.surfaceHover : "transparent" }}>
                  <div>
                    <p style={{ fontSize: TYPO.body, fontWeight: 600 }}>{h.tur === "nakit" ? "💵" : "🏦"} {h.hesap_adi}</p>
                    {h.banka_adi && <p style={{ fontSize: TYPO.micro, color: T.textMuted }}>{h.banka_adi}</p>}
                  </div>
                  <p style={{ fontFamily: T.mono, fontSize: TYPO.bodyStrong, fontWeight: 700, color: Number(h.bakiye) >= 0 ? T.accent : T.danger }}>{Number(h.bakiye).toFixed(0)} ₺</p>
                </div>
              ))}
            </Panel>

            {secilenHesapId && (
              <Panel baslik="Hareket Ekle" ikon="📝">
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <select value={kasaHareketTur} aria-label="Kasa hareket turu" onChange={(e) => setKasaHareketTur(e.target.value)} style={girdiStil}>
                    <option value="giris">Giriş (Para Girdi)</option>
                    <option value="cikis">Çıkış (Para Çıktı)</option>
                  </select>
                  <input type="number" value={kasaHareketTutar} aria-label="Kasa hareket tutari" onChange={(e) => setKasaHareketTutar(e.target.value)} placeholder="Tutar ₺" style={girdiStil} />
                </div>
                <input value={kasaHareketAciklama} aria-label="Kasa hareket aciklamasi" onChange={(e) => setKasaHareketAciklama(e.target.value)} placeholder="Açıklama (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
                <button onClick={kasaHareketEkle} disabled={kasaHareketEkleniyor || !kasaHareketTutar} style={{ ...butonStil(!!kasaHareketTutar), width: "100%", padding: "10px 0", marginBottom: 14 }}>
                  {kasaHareketEkleniyor ? "Ekleniyor..." : "Hareket Ekle"}
                </button>
                {kasaHareketleri?.length > 0 && (
                  <div>
                    <p style={{ fontSize: TYPO.micro, fontWeight: 700, color: T.textMuted, marginBottom: 8, textTransform: "uppercase" }}>Son Hareketler</p>
                    {kasaHareketleri.map((k) => (
                      <div key={k.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: TYPO.caption }}>
                        <span style={{ color: T.textMuted }}>{k.tarih} — {k.tur === "giris" ? "Giriş" : "Çıkış"}{k.aciklama ? ` (${k.aciklama})` : ""}</span>
                        <span style={{ fontFamily: T.mono, fontWeight: 700, color: k.tur === "giris" ? T.accent : T.danger }}>{k.tur === "giris" ? "+" : "-"}{Number(k.tutar_tl).toFixed(0)} ₺</span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            )}
          </>
        )}

        {sekme === "maliyet" && maliyetVeri && (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <KpiKart etiket="Uretim Gideri (Bu Ay)" deger={`${maliyetVeri.uretimToplam.toFixed(0)} ₺`} renk={T.danger} altYazi="Gerçek gider kayıtları" ikon="🏭" />
              <KpiKart etiket="Tahmini AI Maliyeti" deger={`~${maliyetVeri.tahminiAiMaliyetTl} ₺`} renk={T.amber} altYazi={`${maliyetVeri.toplamIstek} istek (KABA TAHMIN)`} ikon="🤖" />
              <KpiKart etiket="Kisi Basi Ortalama" deger={`~${maliyetVeri.kisiBasiOrtalamaMaliyet} ₺`} renk={T.accent} altYazi={`${maliyetVeri.aktifKullanici} aktif kullanici`} ikon="👤" />
            </div>

            <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: TYPO.caption, color: T.amber }}>
              ⚠️ Bu sayfadaki AI maliyeti TAHMINIDIR (istek başı ~0.01₺ varsayımıyla) — gerçek fatura değildir. Sağlayıcıların (Anthropic, Google, Groq) kendi konsollarından arada bir gerçek maliyetle karşılaştırıp bu tahmini kalibre etmen önerilir.
            </div>

            {maliyetVeri.uretimGiderleri?.length > 0 && (
              <Panel baslik="Uretim Gideri Kategorileri (Bu Ay)" ikon="🏭">
                {maliyetVeri.uretimGiderleri.map((g, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < maliyetVeri.uretimGiderleri.length - 1 ? `1px solid ${T.border}` : "none", fontSize: TYPO.body }}>
                    <span style={{ color: T.textMuted, textTransform: "capitalize" }}>{g.kategori}</span>
                    <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{Number(g.toplam).toFixed(0)} ₺</span>
                  </div>
                ))}
              </Panel>
            )}

            {maliyetVeri.enCokKullananlar?.length > 0 && (
              <Panel baslik="En Cok AI Kullanan 10 Ogrenci (Bu Ay)" ikon="📊">
                {maliyetVeri.enCokKullananlar.map((k, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < maliyetVeri.enCokKullananlar.length - 1 ? `1px solid ${T.border}` : "none", fontSize: TYPO.body }}>
                    <span>{k.ad} <span style={{ color: T.textMuted, fontSize: TYPO.micro }}>#{k.id}</span></span>
                    <span style={{ fontFamily: T.mono }}>{k.istekSayisi} istek · <strong style={{ color: T.amber }}>~{k.tahminiMaliyetTl} ₺</strong></span>
                  </div>
                ))}
              </Panel>
            )}
          </>
        )}

        {sekme === "planlama" && planlamaVeri && (
          <>
            <Panel baslik={`Bu Ay Hedef (${planlamaVeri.ay}/${planlamaVeri.yil})`} ikon="🎯">
              <label style={etiketStil}>Gelir Hedefi (₺)</label>
              <input type="number" value={hedefGelir} aria-label="Hedef gelir" onChange={(e) => setHedefGelir(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={etiketStil}>Gider Hedefi (₺)</label>
              <input type="number" value={hedefGider} aria-label="Hedef gider" onChange={(e) => setHedefGider(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={etiketStil}>Not (opsiyonel)</label>
              <input value={hedefNot} aria-label="Hedef notu" onChange={(e) => setHedefNot(e.target.value)} style={{ ...girdiStil, marginBottom: 14 }} />
              <button onClick={hedefKaydet} disabled={hedefKaydediliyor} style={{ ...butonStil(true), width: "100%", padding: "10px 0" }}>
                {hedefKaydediliyor ? "Kaydediliyor..." : "Hedefi Kaydet"}
              </button>
            </Panel>

            <Panel baslik="Hedef vs Gerceklesen" ikon="📊">
              <div style={{ display: "flex", gap: 20, marginBottom: 4 }}>
                <div><p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 3 }}>GELIR (Gerceklesen / Hedef)</p><p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 700 }}>{planlamaVeri.gerceklesen.gelir.toFixed(0)} ₺ / {planlamaVeri.hedef ? Number(planlamaVeri.hedef.gelir_hedefi_tl).toFixed(0) : "—"} ₺</p></div>
                <div><p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 3 }}>GIDER (Gerceklesen / Hedef)</p><p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 700 }}>{planlamaVeri.gerceklesen.gider.toFixed(0)} ₺ / {planlamaVeri.hedef ? Number(planlamaVeri.hedef.gider_hedefi_tl).toFixed(0) : "—"} ₺</p></div>
              </div>
            </Panel>

            <Panel baslik="Basit Projeksiyon (Bir Sonraki Ay)" ikon="🔮" sagUst={<span style={{ fontSize: TYPO.micro, color: T.textMuted }}>{planlamaVeri.projeksiyon.veriliAySayisi} aylik veri</span>}>
              <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: TYPO.caption, color: T.amber }}>
                ⚠️ "Hicbir sey degismezse" senaryosu: son tamamlanmis aylarin ortalama geliri, tekrarlayan giderler dusulerek. Gercek is planlaması yerine gecmez.
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div><p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 3 }}>ORT. AYLIK GELIR</p><p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 700 }}>{planlamaVeri.projeksiyon.ortalamaAylikGelir.toFixed(0)} ₺</p></div>
                <div><p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 3 }}>TEKRARLAYAN GIDER</p><p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 700, color: T.danger }}>{planlamaVeri.projeksiyon.tekrarlayanAylikGider.toFixed(0)} ₺</p></div>
                <div><p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 3 }}>TAHMINI KAR</p><p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 700, color: planlamaVeri.projeksiyon.tahminiAylikKar >= 0 ? T.accent : T.danger }}>{planlamaVeri.projeksiyon.tahminiAylikKar.toFixed(0)} ₺</p></div>
              </div>
            </Panel>
          </>
        )}

        {sekme === "simulasyon" && simulasyonVeri && (() => {
          const b = simulasyonVeri.birimMaliyetler;
          const kisiBasi = senaryoKonuAnlatimi * b.konu_anlatimi.maliyetTl + senaryoSoruCozumu * b.soru_cozumu.maliyetTl + senaryoTekrarTesti * b.tekrar_testi.maliyetTl + senaryoDeneme * b.deneme_yazili.maliyetTl;
          const topluMaliyet = kisiBasi * senaryoKisiSayisi;
          return (
            <>
              <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: TYPO.caption, color: T.amber }}>
                ⚠️ Bu bir SIMULASYONDUR - gercek kullanim GEREKCE farkli olabilir. Model: {simulasyonVeri.varsayimlar.model}, Kur: {simulasyonVeri.varsayimlar.usdTry} TL/USD.
              </div>
              <Panel baslik="Bir Ayda Senaryo (Kisi Basi)" ikon="👤">
                <label style={etiketStil}>Konu Anlatimi (adet)</label>
                <input type="number" value={senaryoKonuAnlatimi} aria-label="Konu anlatimi maliyeti" onChange={(e) => setSenaryoKonuAnlatimi(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 10 }} />
                <label style={etiketStil}>Soru Cozumu (adet)</label>
                <input type="number" value={senaryoSoruCozumu} aria-label="Soru cozumu maliyeti" onChange={(e) => setSenaryoSoruCozumu(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 10 }} />
                <label style={etiketStil}>Tekrar Testi (adet)</label>
                <input type="number" value={senaryoTekrarTesti} aria-label="Tekrar testi maliyeti" onChange={(e) => setSenaryoTekrarTesti(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 10 }} />
                <label style={etiketStil}>Deneme/Yazili (adet)</label>
                <input type="number" value={senaryoDeneme} aria-label="Deneme maliyeti" onChange={(e) => setSenaryoDeneme(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 10 }} />
                <label style={etiketStil}>Toplu Hesap Icin Kisi Sayisi</label>
                <input type="number" value={senaryoKisiSayisi} aria-label="Kisi sayisi" onChange={(e) => setSenaryoKisiSayisi(Number(e.target.value))} style={girdiStil} />
              </Panel>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <KpiKart etiket="Kisi Basi Aylik Maliyet" deger={`${kisiBasi.toFixed(2)} ₺`} renk={T.amber} ikon="👤" />
                <KpiKart etiket={`${senaryoKisiSayisi} Kisilik Toplam`} deger={`${topluMaliyet.toFixed(0)} ₺`} renk={T.danger} ikon="👥" />
              </div>

              <Panel baslik="Birim Maliyetler (Referans)" ikon="📐">
                {Object.entries(b).map(([anahtar, o]) => (
                  <div key={anahtar} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}`, fontSize: TYPO.body }}>
                    <span style={{ color: T.textMuted }}>{o.ad}</span>
                    <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{String(o.maliyetTl).replace(".", ",")} ₺</span>
                  </div>
                ))}
              </Panel>
            </>
          );
        })()}

        {sekme === "tema" && (
          <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: 16, maxWidth: 360 }}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🎨 Tema</p>
            <p style={{ fontSize: 11.5, color: T.textMuted, marginBottom: 14 }}>Panelin görünümünü değiştir.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.keys(TEMALAR).map((t) => (
                <button key={t} onClick={() => temaSec(t)} style={{
                  padding: "14px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                  border: `2px solid ${tema === t ? TEMALAR[t].mustard : "transparent"}`,
                  background: TEMALAR[t].gradient, color: TEMALAR[t].page, fontSize: 12, fontWeight: 700,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{TEMALAR[t].ikon}</div>
                  {TEMALAR[t].isim}
                  {tema === t && <div style={{ fontSize: 9, marginTop: 2, opacity: 0.85 }}>✓ Aktif</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {sekme === "ikiz" && (
          <>
            <Panel baslik="Bekleyen Strateji Önerileri" ikon="🎯">
              {!ikizVeri ? <p aria-live="polite" style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : (
                (ikizVeri.oneriler || []).filter((o) => o.durum === "oneriliyor").length === 0 ? (
                  <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Bekleyen öneri yok.</p>
                ) : ikizVeri.oneriler.filter((o) => o.durum === "oneriliyor").map((o) => (
                  <div key={o.id} style={{ background: T.surfaceHover, borderRadius: 10, padding: 12, marginBottom: 10, borderLeft: `3px solid ${o.oncelik === "yuksek" ? T.danger : o.oncelik === "orta" ? T.mustard : T.textMuted}` }}>
                    <p style={{ fontSize: TYPO.bodyStrong, fontWeight: 700 }}>{o.baslik} <span style={{ fontSize: TYPO.micro, color: T.textMuted, fontWeight: 400 }}>({o.oncelik})</span></p>
                    <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginTop: 4 }}>{o.aciklama}</p>
                    {o.dayanak && <p style={{ fontSize: TYPO.micro, color: T.textMuted, marginTop: 4, fontStyle: "italic" }}>Dayanak: {o.dayanak}</p>}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={() => ikizOneriKararVer(o.id, "onaylandi")} disabled={ikizOneriIslemDurumu === o.id} style={{ ...butonStil(true), padding: "6px 12px", fontSize: TYPO.caption }}>Onayla</button>
                      <button onClick={() => ikizOneriKararVer(o.id, "reddedildi")} disabled={ikizOneriIslemDurumu === o.id} style={{ ...butonStil(true, T.danger), padding: "6px 12px", fontSize: TYPO.caption }}>Reddet</button>
                    </div>
                  </div>
                ))
              )}
            </Panel>

            {ikizVeri?.boyutlar?.map((b) => {
              const buBoyutunDegiskenleri = (ikizVeri.degiskenler || []).filter((d) => d.boyut_id === b.id);
              if (buBoyutunDegiskenleri.length === 0) return null;
              return (
                <Panel key={b.id} baslik={b.ad} ikon="📊">
                  {buBoyutunDegiskenleri.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: TYPO.caption }}>
                      <span style={{ color: T.textMuted }}>{d.ad}</span>
                      <span style={{ fontFamily: T.mono, fontWeight: 700, color: d.guncel_deger == null ? T.danger : T.text }}>
                        {d.guncel_deger == null ? "DOĞRULANMADI" : `${d.guncel_deger} ${d.birim || ""}`}
                      </span>
                    </div>
                  ))}
                </Panel>
              );
            })}

            <Panel baslik="Motor Formülleri (Katman 3)" ikon="🧮">
              {(ikizVeri?.iliskiler || []).map((r, i) => (
                <p key={i} style={{ fontSize: TYPO.caption, color: T.textMuted, padding: "4px 0", borderBottom: `1px solid ${T.border}` }}>
                  <strong>{r.ad}:</strong> {r.formul_aciklama}
                </p>
              ))}
            </Panel>
          </>
        )}

        {sekme === "iadeler" && (
          <Panel baslik="İade Talepleri (İlk Hafta Garantisi)" ikon="🛡️">
            {!iadeVeri ? <p aria-live="polite" style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : iadeVeri.length === 0 ? (
              <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz iade talebi yok.</p>
            ) : iadeVeri.map((t) => (
              <div key={t.id} style={{ background: T.surfaceHover, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <p style={{ fontSize: TYPO.bodyStrong, fontWeight: 700 }}>{t.ad || "?"} <span style={{ color: T.textMuted, fontWeight: 400 }}>({t.eposta})</span></p>
                <p style={{ fontSize: TYPO.caption, color: T.textMuted }}>{t.paket} · {t.tutar_tl}₺ · {new Date(t.talep_tarihi).toLocaleDateString("tr-TR")}</p>
                {t.sebep && <p style={{ fontSize: TYPO.caption, fontStyle: "italic", marginTop: 4 }}>"{t.sebep}"</p>}
                <p style={{ fontSize: TYPO.micro, marginTop: 6, color: t.durum === "beklemede" ? T.mustard : t.durum === "onaylandi" ? T.accent : T.danger }}>Durum: {t.durum}</p>
                {t.durum === "beklemede" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => iadeKararVer(t.id, "onaylandi")} disabled={iadeIslemDurumu === t.id} style={{ ...butonStil(true), padding: "6px 12px", fontSize: TYPO.caption }}>Onayla</button>
                    <button onClick={() => iadeKararVer(t.id, "reddedildi")} disabled={iadeIslemDurumu === t.id} style={{ ...butonStil(true, T.danger), padding: "6px 12px", fontSize: TYPO.caption }}>Reddet</button>
                  </div>
                )}
              </div>
            ))}
          </Panel>
        )}

        {sekme === "mufredat" && (
          <>
            <Panel baslik="Müfredat Kapsamı Özeti" ikon="📚">
              {!mufredatVeri ? <p aria-live="polite" style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: TYPO.caption }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        <th style={{ textAlign: "left", padding: "6px 4px" }}>Sınıf</th>
                        <th style={{ textAlign: "left", padding: "6px 4px" }}>Ders</th>
                        <th style={{ textAlign: "right", padding: "6px 4px" }}>Toplam</th>
                        <th style={{ textAlign: "right", padding: "6px 4px", color: T.accent }}>Doğrulanmış</th>
                        <th style={{ textAlign: "right", padding: "6px 4px", color: T.danger }}>Eksik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mufredatVeri.ozet.map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: "6px 4px" }}>{r.sinif}</td>
                          <td style={{ padding: "6px 4px" }}>{r.ders}</td>
                          <td style={{ padding: "6px 4px", textAlign: "right" }}>{r.toplam}</td>
                          <td style={{ padding: "6px 4px", textAlign: "right", color: T.accent }}>{r.dogrulanmis}</td>
                          <td style={{ padding: "6px 4px", textAlign: "right", color: r.eksik > 0 ? T.danger : T.textMuted }}>{r.eksik}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </Panel>

            {mufredatVeri?.eksikDetay?.length > 0 && (
              <Panel baslik={`Doldurulması Gereken Üniteler (${mufredatVeri.eksikDetay.length})`} ikon="⚠️">
                {mufredatVeri.eksikDetay.map((e, i) => (
                  <p key={i} style={{ fontSize: TYPO.caption, color: T.textMuted, padding: "4px 0", borderBottom: `1px solid ${T.border}` }}>
                    {e.sinif}. Sınıf · {e.ders} · <strong>{e.unite}</strong>
                  </p>
                ))}
              </Panel>
            )}

            {mufredatVeri?.soruBankasiOzet?.length > 0 && (
              <Panel baslik="Soru Bankası — İçerik Türü Envanteri" ikon="🗂️">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: TYPO.caption }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      <th style={{ textAlign: "left", padding: "6px 4px" }}>Kaynak Türü</th>
                      <th style={{ textAlign: "right", padding: "6px 4px" }}>Toplam</th>
                      <th style={{ textAlign: "right", padding: "6px 4px", color: "#4CAF50" }}>Kolay</th>
                      <th style={{ textAlign: "right", padding: "6px 4px", color: T.mustard }}>Orta</th>
                      <th style={{ textAlign: "right", padding: "6px 4px", color: T.danger }}>Zor</th>
                      <th style={{ textAlign: "right", padding: "6px 4px" }}>Sınıf</th>
                      <th style={{ textAlign: "right", padding: "6px 4px" }}>Ders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mufredatVeri.soruBankasiOzet.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "6px 4px", fontWeight: 700 }}>{r.kaynak_turu || "(etiketsiz)"}</td>
                        <td style={{ padding: "6px 4px", textAlign: "right" }}>{r.toplam}</td>
                        <td style={{ padding: "6px 4px", textAlign: "right", color: "#4CAF50" }}>{r.kolay}</td>
                        <td style={{ padding: "6px 4px", textAlign: "right", color: T.mustard }}>{r.orta}</td>
                        <td style={{ padding: "6px 4px", textAlign: "right", color: T.danger }}>{r.zor}</td>
                        <td style={{ padding: "6px 4px", textAlign: "right" }}>{r.sinif_sayisi}</td>
                        <td style={{ padding: "6px 4px", textAlign: "right" }}>{r.ders_sayisi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            )}
          </>
        )}

        {sekme === "indirimkodlari" && (
          <>
            <Panel baslik="Yeni İndirim Kodu" ikon="🏷️">
              <label style={etiketStil}>Kod</label>
              <input value={ikKod} aria-label="Indirim kodu" onChange={(e) => setIkKod(e.target.value)} placeholder="Örn: ILKKAYIT25" style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={etiketStil}>Açıklama (opsiyonel)</label>
              <input value={ikAciklama} aria-label="Indirim aciklamasi" onChange={(e) => setIkAciklama(e.target.value)} placeholder="Örn: İlk 100 kayıt kampanyası" style={{ ...girdiStil, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={etiketStil}>Yüzde İndirim (%)</label>
                  <input type="number" value={ikYuzde} aria-label="Indirim yuzdesi" onChange={(e) => setIkYuzde(e.target.value)} placeholder="Örn: 25" style={girdiStil} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={etiketStil}>veya Sabit Tutar (₺)</label>
                  <input type="number" value={ikSabitTutar} aria-label="Sabit indirim tutari" onChange={(e) => setIkSabitTutar(e.target.value)} placeholder="Örn: 100" style={girdiStil} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={etiketStil}>Maks. Kullanım (opsiyonel)</label>
                  <input type="number" value={ikMaxKullanim} aria-label="Maksimum kullanim" onChange={(e) => setIkMaxKullanim(e.target.value)} placeholder="Sınırsız" style={girdiStil} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={etiketStil}>Son Geçerlilik (opsiyonel)</label>
                  <input type="date" value={ikGecerlilikBitis} aria-label="Gecerlilik bitis tarihi" onChange={(e) => setIkGecerlilikBitis(e.target.value)} style={girdiStil} />
                </div>
              </div>
              <button onClick={indirimKoduOlustur} disabled={ikOlusturuluyor || !ikKod || (!ikYuzde && !ikSabitTutar)} style={{ ...butonStil(!!(ikKod && (ikYuzde || ikSabitTutar))), width: "100%", padding: "10px 0" }}>
                {ikOlusturuluyor ? "Oluşturuluyor..." : "Kodu Oluştur"}
              </button>
            </Panel>

            <Panel baslik="Mevcut İndirim Kodları" ikon="📋">
              {!indirimKodlariVeri ? <p aria-live="polite" style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : indirimKodlariVeri.length === 0 ? (
                <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz indirim kodu yok.</p>
              ) : indirimKodlariVeri.map((k) => (
                <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: TYPO.body, gap: 8 }}>
                  <span>
                    <strong>{k.kod}</strong>{" "}
                    <span style={{ color: T.textMuted, fontSize: TYPO.caption }}>
                      ({k.yuzde ? `%${k.yuzde}` : `${k.sabit_tutar}₺`} · {k.kullanim_sayisi}{k.max_kullanim ? `/${k.max_kullanim}` : ""} kullanım{k.aciklama ? ` · ${k.aciklama}` : ""})
                    </span>
                  </span>
                  <button onClick={() => indirimKoduDurumDegistir(k.id, !k.aktif)} disabled={ikDurumDegistiriliyor === k.id} style={{ ...butonStil(k.aktif), padding: "5px 10px", fontSize: TYPO.micro }}>
                    {ikDurumDegistiriliyor === k.id ? "..." : k.aktif ? "Aktif (kapat)" : "Pasif (aç)"}
                  </button>
                </div>
              ))}
            </Panel>
          </>
        )}

        {sekme === "kurumlar" && (
          <>
            <Panel baslik="Ücretsiz Deneme Oluştur (Karemux)" ikon="🇹🇷">
              <label style={etiketStil}>Deneme Adı</label>
              <input value={ulusalAd} aria-label="Deneme adi" onChange={(e) => setUlusalAd(e.target.value)} placeholder="Örn: 15. Hafta Türkiye Denemesi" style={{ ...girdiStil, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={ulusalSinif} aria-label="Sinif" onChange={(e) => setUlusalSinif(e.target.value)} style={girdiStil}>
                  {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
                </select>
                <select value={ulusalDers} aria-label="Ders" onChange={(e) => setUlusalDers(e.target.value)} style={girdiStil}>
                  {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={ulusalKapsam} aria-label="Kapsam" onChange={(e) => setUlusalKapsam(e.target.value)} style={girdiStil}>
                  <option value="ulusal">Ulusal (Türkiye Geneli)</option>
                  <option value="yerel">Yerel (İl Bazlı)</option>
                </select>
                {ulusalKapsam === "yerel" && (
                  <input value={ulusalIl} aria-label="Il" onChange={(e) => setUlusalIl(e.target.value)} placeholder="İl (örn: İstanbul)" style={girdiStil} />
                )}
              </div>
              <label style={etiketStil}>Açık Kalma Süresi (saat)</label>
              <input type="number" value={ulusalSaat} aria-label="Saat" onChange={(e) => setUlusalSaat(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 14 }} />
              <button onClick={ulusalOlustur} disabled={ulusalOlusturuluyor || !ulusalAd} style={{ ...butonStil(!!ulusalAd), width: "100%", padding: "10px 0" }}>
                {ulusalOlusturuluyor ? "Oluşturuluyor..." : "Şimdi Başlat"}
              </button>
            </Panel>

            <Panel baslik="Ücretli Deneme Oluştur" ikon="🎲">
              <label style={etiketStil}>Deneme Adı</label>
              <input value={udAd} aria-label="Deneme adi" onChange={(e) => setUdAd(e.target.value)} placeholder="Örn: İstanbul Yerel Deneme #1" style={{ ...girdiStil, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={udSinif} aria-label="Sinif" onChange={(e) => setUdSinif(e.target.value)} style={girdiStil}>
                  {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
                </select>
                <select value={udDers} aria-label="Ders" onChange={(e) => setUdDers(e.target.value)} style={girdiStil}>
                  {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={udKapsam} aria-label="Kapsam" onChange={(e) => setUdKapsam(e.target.value)} style={girdiStil}>
                  <option value="ulusal">Ulusal (Türkiye Geneli)</option>
                  <option value="yerel">Yerel (İl Bazlı)</option>
                </select>
                {udKapsam === "yerel" && (
                  <input value={udIl} aria-label="Il" onChange={(e) => setUdIl(e.target.value)} placeholder="İl (örn: İstanbul)" style={girdiStil} />
                )}
              </div>
              <label style={etiketStil}>Fiyat (₺)</label>
              <input type="number" value={udFiyat} aria-label="Fiyat" onChange={(e) => setUdFiyat(e.target.value)} style={{ ...girdiStil, marginBottom: 14 }} />
              <button onClick={ucretliDenemeOlustur} disabled={udOlusturuluyor || !udAd || !udFiyat} style={{ ...butonStil(!!(udAd && udFiyat)), width: "100%", padding: "10px 0" }}>
                {udOlusturuluyor ? "AI ile sorular üretiliyor..." : "Deneme Oluştur"}
              </button>
            </Panel>

            <Panel baslik="Ücretli Denemeler" ikon="📋">
              {!ucretliDenemelerVeri?.denemeler || ucretliDenemelerVeri.denemeler.length === 0 ? (
                <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz ücretli deneme yok.</p>
              ) : (
                ucretliDenemelerVeri.denemeler.map((d) => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: TYPO.body, gap: 8 }}>
                    <span>{d.ad} <span style={{ color: T.textMuted, fontSize: TYPO.caption }}>({d.ders}, {d.sinif}. sınıf, {d.kapsam === "yerel" ? `Yerel: ${d.il}` : "Ulusal"})</span></span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{d.fiyat_tl}₺</span>
                      <button onClick={() => denemeRaporuGonder(d.id)} disabled={raporGonderiliyor === d.id} style={{ ...butonStil(true), padding: "5px 10px", fontSize: TYPO.micro }}>
                        {raporGonderiliyor === d.id ? "..." : "Raporu Gönder"}
                      </button>
                    </span>
                  </div>
                ))
              )}
            </Panel>

            <Panel baslik="Kurumlar ve Fiyatlandırma" ikon="🏢">
            {!kurumlarVeri ? <p aria-live="polite" style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : kurumlarVeri.length === 0 ? (
              <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz kurum yok.</p>
            ) : kurumlarVeri.map((k) => (
              <div key={k.id} style={{ background: T.surfaceHover, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: TYPO.bodyStrong, fontWeight: 700 }}>{k.ad} <span style={{ color: T.textMuted, fontWeight: 400, fontSize: TYPO.caption }}>({k.kurum_kodu})</span></p>
                  <p style={{ fontSize: TYPO.caption, color: T.textMuted }}>{k.ogrenci_sayisi} öğrenci</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={etiketStil}>Kişi Başı Fiyat (₺/ay)</label>
                    <input type="number" defaultValue={k.kisi_basi_fiyat_tl} aria-label="Kisi basi fiyat" onChange={(e) => setDuzenlenenKurumFiyat((eski) => ({ ...eski, [k.id]: e.target.value }))} style={girdiStil} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={etiketStil}>Min. Kişi Sayısı</label>
                    <input type="number" defaultValue={k.min_kisi_sayisi} aria-label="Minimum kisi sayisi" onChange={(e) => setDuzenlenenKurumMin((eski) => ({ ...eski, [k.id]: e.target.value }))} style={girdiStil} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={etiketStil}>Kurum E-posta (rapor için)</label>
                    <input type="email" defaultValue={k.eposta || ""} aria-label="Kurum eposta" placeholder="kurum@ornek.com" onChange={(e) => setDuzenlenenKurumEposta((eski) => ({ ...eski, [k.id]: e.target.value }))} style={girdiStil} />
                  </div>
                  <button onClick={() => kurumFiyatKaydet(k.id)} disabled={kurumKaydediliyor === k.id} style={{ ...butonStil(true), padding: "9px 14px", alignSelf: "flex-end" }}>
                    {kurumKaydediliyor === k.id ? "..." : "Kaydet"}
                  </button>
                </div>
              </div>
            ))}
          </Panel>
          </>
        )}

        {sekme === "canliders" && (
          <>
            <Panel baslik="Canlı Ders Oturumu Oluştur" ikon="🎥">
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={cdTur} aria-label="Ders turu" onChange={(e) => setCdTur(e.target.value)} style={girdiStil}>
                  <option value="grup">Grup</option>
                  <option value="kamp">Kamp</option>
                  <option value="soru_cozum">Soru Çözüm</option>
                </select>
                <select value={cdOgretmenId} aria-label="Ogretmen" onChange={(e) => setCdOgretmenId(e.target.value)} style={girdiStil}>
                  <option value="">— Öğretmen Seç —</option>
                  {ogretmenlerListesi?.map((o) => <option key={o.id} value={o.id}>{o.ad} ({o.brans}, {o.kademe || "?"} · {o.saatlik_ucret_tl}₺/sa)</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={cdDers} aria-label="Ders" onChange={(e) => setCdDers(e.target.value)} style={girdiStil}>
                  {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <input value={cdKonu} aria-label="Konu" onChange={(e) => setCdKonu(e.target.value)} placeholder="Konu (opsiyonel)" style={girdiStil} />
              </div>
              <label style={etiketStil}>Başlangıç Zamanı</label>
              <input type="datetime-local" value={cdBaslangic} aria-label="Baslangic tarihi" onChange={(e) => setCdBaslangic(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={etiketStil}>Süre (dk)</label>
                  <select value={cdSureDk} aria-label="Sure" onChange={(e) => setCdSureDk(e.target.value)} style={girdiStil}>
                    {[30, 45, 60].map((s) => <option key={s} value={s}>{s} dk</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={etiketStil}>Oturum Sayısı</label>
                  <input type="number" min="1" value={cdOturumSayisi} aria-label="Oturum sayisi" onChange={(e) => setCdOturumSayisi(e.target.value)} style={girdiStil} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={etiketStil}>Aralık (gün)</label>
                  <input type="number" min="0" value={cdOturumAraligiGun} aria-label="Oturum araligi gun" onChange={(e) => setCdOturumAraligiGun(e.target.value)} style={girdiStil} />
                </div>
              </div>
              <label style={etiketStil}>Maksimum Kapasite</label>
              <input type="number" min="2" value={cdMaxKapasite} aria-label="Maksimum kapasite" onChange={(e) => setCdMaxKapasite(e.target.value)} style={{ ...girdiStil, marginBottom: 14 }} />
              <button onClick={canliDersOlustur} disabled={cdOlusturuluyor || !cdOgretmenId || !cdBaslangic} style={{ ...butonStil(!!(cdOgretmenId && cdBaslangic)), width: "100%", padding: "10px 0" }}>
                {cdOlusturuluyor ? "Oluşturuluyor..." : "Oturum Oluştur"}
              </button>
            </Panel>

            <Panel baslik="Planlanan Oturumlar" ikon="📋">
              {!canliDersOturumlari || canliDersOturumlari.length === 0 ? (
                <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Planlanan oturum yok.</p>
              ) : (
                canliDersOturumlari.map((o) => (
                  <div key={o.id} style={{ background: T.surfaceHover, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: TYPO.bodyStrong }}>{o.ders}{o.konu ? ` — ${o.konu}` : ""} <span style={{ color: T.textMuted, fontWeight: 500, fontSize: TYPO.caption }}>({o.tur})</span></p>
                    <p style={{ fontSize: TYPO.caption, color: T.textMuted }}>{o.ogretmen_adi} · {new Date(o.baslangic_zamani).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })} · {o.sure_dk}dk · {o.kayitli_ogrenci}/{o.max_kapasite} öğrenci</p>
                    <p style={{ fontFamily: T.mono, fontSize: TYPO.caption, marginTop: 4 }}>{o.fiyat_tl}₺/öğrenci · Öğretmen payı: {o.ogretmen_payi_tl}₺</p>
                  </div>
                ))
              )}
            </Panel>
          </>
        )}

        {sekme === "randevuodeme" && (
          <Panel baslik="Özel Ders Ödemeleri (Ücretli Randevular)" ikon="📅">
            {!randevuOdemeVeri ? <p aria-live="polite" style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : randevuOdemeVeri.length === 0 ? (
              <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Ücretli randevu yok.</p>
            ) : randevuOdemeVeri.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: TYPO.body }}>
                <span>{r.ogrenci_adi} — {r.ogretmen_adi} · {new Date(r.baslangic_zamani).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })} · <strong>{r.ucret_tl}₺</strong></span>
                <button onClick={() => randevuOdendiIsaretle(r.id, !r.odendi)} disabled={randevuIsaretleniyor === r.id} style={{ ...butonStil(!r.odendi), padding: "6px 12px", fontSize: TYPO.caption }}>
                  {randevuIsaretleniyor === r.id ? "..." : r.odendi ? "✓ Ödendi" : "Ödendi işaretle"}
                </button>
              </div>
            ))}
          </Panel>
        )}

        {sekme === "ogretmen" && (
          <Panel baslik="Yeni Öğretmen Ekle" ikon="🎓">
            <label style={etiketStil}>Ad Soyad</label>
            <input value={yeniOgretmenAd} aria-label="Ogretmen adi" onChange={(e) => setYeniOgretmenAd(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
            <label style={etiketStil}>Branş</label>
            <select value={yeniOgretmenBrans} aria-label="Brans" onChange={(e) => setYeniOgretmenBrans(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
              {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce", "Rehberlik"].map((d) => <option key={d} value={d}>{d === "Rehberlik" ? "🧭 Rehberlik Danışmanlığı" : d}</option>)}
            </select>
            <label style={etiketStil}>Haftalık Müsaitlik</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <select value={yeniOgretmenGun} aria-label="Gun" onChange={(e) => setYeniOgretmenGun(Number(e.target.value))} style={girdiStil}>
                {["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"].map((g, i) => <option key={i} value={i}>{g}</option>)}
              </select>
              <input type="time" value={yeniOgretmenBaslangic} aria-label="Baslangic saati" onChange={(e) => setYeniOgretmenBaslangic(e.target.value)} style={girdiStil} />
              <input type="time" value={yeniOgretmenBitis} aria-label="Bitis saati" onChange={(e) => setYeniOgretmenBitis(e.target.value)} style={girdiStil} />
            </div>
            <button onClick={ogretmenEkle} disabled={ogretmenEkleniyor || !yeniOgretmenAd} style={{ ...butonStil(!!yeniOgretmenAd), width: "100%", padding: "10px 0" }}>
              {ogretmenEkleniyor ? "Ekleniyor..." : "Öğretmen Ekle"}
            </button>
          </Panel>
        )}

        {sekme === "ogretmen" && (
          <Panel baslik="Öğretmen Başvuruları" ikon="📋">
            {!ogretmenBasvurulari ? (
              <p aria-live="polite" style={{ color: T.textMuted, fontSize: TYPO.body }}>Yükleniyor...</p>
            ) : ogretmenBasvurulari.filter((b) => b.durum === "beklemede").length === 0 ? (
              <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Bekleyen başvuru yok.</p>
            ) : (
              ogretmenBasvurulari.filter((b) => b.durum === "beklemede").map((b) => (
                <div key={b.id} style={{ background: T.surfaceHover, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: TYPO.bodyStrong, marginBottom: 2 }}>{b.ad} <span style={{ color: T.textMuted, fontWeight: 500 }}>· {b.brans} · {b.istenen_kademe} kademe</span></p>
                  <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 6 }}>{b.eposta} {b.telefon ? `· ${b.telefon}` : ""}</p>
                  <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 2 }}>Kategori: {b.kategori} · Deneyim: {b.deneyim_yili ?? "?"} yıl · Eğitim: {b.egitim_seviyesi}{b.egitim_alani ? ` (${b.egitim_alani})` : ""}</p>
                  {b.sertifikalar && <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 2 }}>Sertifikalar: {b.sertifikalar}</p>}
                  {b.sinav_hazirlik_deneyimi && <p style={{ fontSize: TYPO.caption, color: T.accent, marginBottom: 2 }}>✓ Sınav hazırlık deneyimi var</p>}
                  {b.ozgecmis_metni && <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginTop: 6, fontStyle: "italic" }}>{b.ozgecmis_metni}</p>}
                  <p style={{ fontSize: TYPO.micro, color: T.accent, marginTop: 6 }}>✓ Adli sicil beyanı · ✓ Bilgi doğruluğu beyanı</p>
                  {b.cv_dosya_url && (
                    <button onClick={() => cvGoruntule(b.id)} disabled={cvLinkYukleniyor === b.id} style={{ ...butonStil(true), padding: "6px 12px", fontSize: TYPO.caption, marginTop: 8 }}>
                      {cvLinkYukleniyor === b.id ? "..." : "📄 CV Görüntüle"}
                    </button>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <input type="number" placeholder="Saatlik ücret ₺" value={basvuruOnaySaatlikUcret[b.id] || ""} aria-label="Saatlik ucret" onChange={(e) => setBasvuruOnaySaatlikUcret((eski) => ({ ...eski, [b.id]: e.target.value }))} style={{ ...girdiStil, marginBottom: 0, width: 120 }} />
                    <button onClick={() => basvuruKararVer(b.id, "onayla")} disabled={basvuruIslemDurumu === b.id} style={{ ...butonStil(true), padding: "9px 14px", fontSize: TYPO.body }}>
                      {basvuruIslemDurumu === b.id ? "..." : "Onayla"}
                    </button>
                    <button onClick={() => basvuruKararVer(b.id, "reddet")} disabled={basvuruIslemDurumu === b.id} style={{ ...butonStil(true, T.danger), padding: "9px 14px", fontSize: TYPO.body }}>
                      Reddet
                    </button>
                  </div>
                </div>
              ))
            )}
          </Panel>
        )}

        {sekme === "ogretmen" && ogretmenBekleyenler?.length > 0 && (
          <Panel baslik={`Bekleyen Kayıtlar (${ogretmenBekleyenler.length})`} ikon="⏳">
            {ogretmenBekleyenler.map((o) => (
              <div key={o.id} style={{ background: T.surfaceHover, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: TYPO.bodyStrong, marginBottom: 2 }}>{o.ad} <span style={{ color: T.textMuted, fontWeight: 500 }}>· {o.brans}</span></p>
                <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 8 }}>{o.eposta} · {new Date(o.olusturulma).toLocaleDateString("tr-TR")}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => ogretmenOnaylaVeyaReddet(o.id, "onayla")} disabled={ogretmenOnayDurumu === o.id} style={{ ...butonStil(true), padding: "8px 14px", fontSize: TYPO.body }}>
                    {ogretmenOnayDurumu === o.id ? "..." : "Onayla"}
                  </button>
                  <button onClick={() => ogretmenOnaylaVeyaReddet(o.id, "reddet")} disabled={ogretmenOnayDurumu === o.id} style={{ ...butonStil(true, T.danger), padding: "8px 14px", fontSize: TYPO.body }}>
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </Panel>
        )}

        {sekme === "ogretmen" && (
          <Panel baslik="Öğretmen Hesapları (Materyal Aracı Girişi)" ikon="🔑">
            {!ogretmenListesi ? (
              <p aria-live="polite" style={{ color: T.textMuted, fontSize: TYPO.body }}>Yükleniyor...</p>
            ) : ogretmenListesi.length === 0 ? (
              <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Henüz onaylı öğretmen yok.</p>
            ) : ogretmenListesi.map((o) => (
              <div key={o.id} style={{ borderBottom: `1px solid ${T.border}`, padding: "10px 0" }}>
                <p style={{ fontSize: TYPO.bodyStrong, fontWeight: 700 }}>{o.ad} <span style={{ color: T.textMuted, fontWeight: 400 }}>· {o.brans}</span></p>
                {hesapFormAcik === o.id ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                    <input type="email" placeholder="E-posta" value={hesapEposta[o.id] || ""} aria-label="Hesap eposta" onChange={(e) => setHesapEposta((eski) => ({ ...eski, [o.id]: e.target.value }))} style={{ ...girdiStil, marginBottom: 0, flex: 1 }} />
                    <button onClick={() => hesapOlustur(o.id)} disabled={hesapSifreDurumu === o.id} style={{ ...butonStil(true), padding: "9px 12px", fontSize: TYPO.caption }}>
                      {hesapSifreDurumu === o.id ? "..." : "Oluştur"}
                    </button>
                    <button onClick={() => setHesapFormAcik(null)} style={{ ...butonStil(true, T.textMuted), padding: "9px 12px", fontSize: TYPO.caption }}>İptal</button>
                  </div>
                ) : (
                  <button onClick={() => setHesapFormAcik(o.id)} style={{ ...butonStil(true), padding: "6px 12px", fontSize: TYPO.caption, marginTop: 6 }}>🔑 Öğretmen Girişi Hesabı Oluştur</button>
                )}
              </div>
            ))}
          </Panel>
        )}

        {sekme === "talepler" && (
          <Panel baslik="Kullanıcı Talepleri (Konu/Özellik)" ikon="💡">
            {!talepler ? (
              <p aria-live="polite" style={{ color: T.textMuted, fontSize: TYPO.body }}>Yükleniyor...</p>
            ) : talepler.length === 0 ? (
              <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Henüz talep yok.</p>
            ) : (
              talepler.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div>
                    <p style={{ fontSize: TYPO.bodyStrong, fontWeight: 700, margin: 0 }}>{t.tur === "konu" ? "📖" : "✨"} {t.baslik}</p>
                    <p style={{ fontSize: TYPO.micro, color: T.textMuted, margin: 0 }}>Son talep: {new Date(t.son_talep).toLocaleDateString("tr-TR")}</p>
                  </div>
                  <p style={{ fontFamily: T.mono, fontSize: TYPO.heading, fontWeight: 800, color: T.accent, margin: 0 }}>{t.talep_sayisi}</p>
                </div>
              ))
            )}
          </Panel>
        )}

        {sekme === "kariyer" && (
          <Panel baslik="Kariyer Havuzu" ikon="🧑‍💼">
            {!kariyerBasvurulari ? (
              <p aria-live="polite" style={{ color: T.textMuted, fontSize: TYPO.body }}>Yükleniyor...</p>
            ) : kariyerBasvurulari.length === 0 ? (
              <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Henüz başvuru yok.</p>
            ) : (
              kariyerBasvurulari.map((b) => (
                <div key={b.id} style={{ background: T.surfaceHover, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: TYPO.bodyStrong, marginBottom: 2 }}>{b.ad} <span style={{ color: T.textMuted, fontWeight: 500 }}>· {b.departman} · {b.basvuru_turu === "danismanlik" ? "Danışmanlık" : "Tam Zamanlı"}</span></p>
                  <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 2 }}>{b.eposta}{b.telefon ? ` · ${b.telefon}` : ""}</p>
                  <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 2 }}>Deneyim: {b.deneyim_yili ?? "?"} yıl · Eğitim: {b.egitim_seviyesi || "?"}{b.egitim_alani ? ` (${b.egitim_alani})` : ""}</p>
                  {b.portfolyo_url && <p style={{ fontSize: TYPO.caption, marginBottom: 2 }}><a href={b.portfolyo_url} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{b.portfolyo_url}</a></p>}
                  {b.ozgecmis_metni && <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginTop: 6, fontStyle: "italic" }}>{b.ozgecmis_metni}</p>}
                </div>
              ))
            )}
          </Panel>
        )}

        {sekme === "ik" && (
          <>
            <Panel baslik="Mesai" ikon="🕐">
              {mesaiVeri?.acikKayit ? (
                <>
                  <p style={{ fontSize: TYPO.body, color: T.accent, marginBottom: 10 }}>✓ Şu an mesaidesin — giriş: {new Date(mesaiVeri.acikKayit.giris_zamani).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</p>
                  <input value={mesaiCikisNotu} aria-label="Cikis notu" onChange={(e) => setMesaiCikisNotu(e.target.value)} placeholder="Çıkış notu (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
                  <button onClick={() => mesaiIslemYap("cikis")} disabled={mesaiIslemDurumu} style={{ ...butonStil(true, T.danger), width: "100%", padding: "10px 0" }}>Çıkış Yap</button>
                </>
              ) : (
                <button onClick={() => mesaiIslemYap("giris")} disabled={mesaiIslemDurumu} style={{ ...butonStil(true), width: "100%", padding: "10px 0" }}>Girişi Başlat</button>
              )}
              {mesaiVeri?.sonKayitlar?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 6 }}>Son Kayıtlar</p>
                  {mesaiVeri.sonKayitlar.map((k) => (
                    <p key={k.id} style={{ fontSize: TYPO.caption, color: T.textMuted, margin: "4px 0" }}>
                      {new Date(k.giris_zamani).toLocaleDateString("tr-TR")} · {new Date(k.giris_zamani).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} → {k.cikis_zamani ? new Date(k.cikis_zamani).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "devam ediyor"}
                    </p>
                  ))}
                </div>
              )}
            </Panel>

            <Panel baslik="İzin Talebi" ikon="🏖️">
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input type="date" value={izinBaslangic} aria-label="Izin baslangic tarihi" onChange={(e) => setIzinBaslangic(e.target.value)} style={girdiStil} />
                <input type="date" value={izinBitis} aria-label="Izin bitis tarihi" onChange={(e) => setIzinBitis(e.target.value)} style={girdiStil} />
              </div>
              <select value={izinTur} aria-label="Izin turu" onChange={(e) => setIzinTur(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
                <option value="yillik">Yıllık İzin</option>
                <option value="mazeret">Mazeret İzni</option>
                <option value="hastalik">Hastalık İzni</option>
              </select>
              <input value={izinAciklama} aria-label="Izin aciklamasi" onChange={(e) => setIzinAciklama(e.target.value)} placeholder="Açıklama (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
              <button onClick={izinTalepEt} disabled={izinGonderiliyor} style={{ ...butonStil(true), width: "100%", padding: "10px 0" }}>Talep Gönder</button>
              {izinlerim?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  {izinlerim.map((i) => (
                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: TYPO.caption, borderBottom: `1px solid ${T.border}` }}>
                      <span>{i.baslangic_tarihi} → {i.bitis_tarihi} ({i.tur})</span>
                      <span style={{ color: i.durum === "onaylandi" ? T.accent : i.durum === "reddedildi" ? T.danger : T.amber, fontWeight: 700 }}>{i.durum}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel baslik="Görevlerim" ikon="✅">
              {!gorevlerim || gorevlerim.length === 0 ? (
                <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Atanmış görevin yok.</p>
              ) : (
                gorevlerim.map((g) => (
                  <div key={g.id} style={{ background: T.surfaceHover, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: TYPO.bodyStrong }}>{g.baslik}</p>
                    {g.aciklama && <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 6 }}>{g.aciklama}</p>}
                    {g.son_tarih && <p style={{ fontSize: TYPO.micro, color: T.textMuted, marginBottom: 6 }}>Son tarih: {g.son_tarih}</p>}
                    <select value={g.durum} onChange={(e) => gorevDurumGuncelle(g.id, e.target.value)} aria-label="Gorev durumu" style={{ ...girdiStil, marginBottom: 0, fontSize: TYPO.caption, padding: "6px 8px" }}>
                      <option value="acik">Açık</option>
                      <option value="devam_ediyor">Devam Ediyor</option>
                      <option value="tamamlandi">Tamamlandı</option>
                    </select>
                  </div>
                ))
              )}
            </Panel>

            <Panel baslik="Şu An Mesaide" ikon="🟢">
              {!ikYonetimVeri?.bugunMesaide || ikYonetimVeri.bugunMesaide.length === 0 ? (
                <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Şu an mesaide kimse yok.</p>
              ) : (
                ikYonetimVeri.bugunMesaide.map((m) => (
                  <p key={m.id} style={{ fontSize: TYPO.body, margin: "4px 0" }}>🟢 {m.personel_adi} — {new Date(m.giris_zamani).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}'den beri</p>
                ))
              )}
            </Panel>

            <Panel baslik="İzin Talepleri" ikon="🏖️">
              {!ikYonetimVeri?.izinler || ikYonetimVeri.izinler.filter((i) => i.durum === "beklemede").length === 0 ? (
                <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Bekleyen izin talebi yok.</p>
              ) : (
                ikYonetimVeri.izinler.filter((i) => i.durum === "beklemede").map((i) => (
                  <div key={i.id} style={{ background: T.surfaceHover, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: TYPO.bodyStrong }}>{i.personel_adi} — {i.tur}</p>
                    <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 8 }}>{i.baslangic_tarihi} → {i.bitis_tarihi}{i.aciklama ? ` · ${i.aciklama}` : ""}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => izinKararVer(i.id, "onaylandi")} disabled={izinKararDurumu === i.id} style={{ ...butonStil(true), padding: "7px 12px", fontSize: TYPO.caption }}>Onayla</button>
                      <button onClick={() => izinKararVer(i.id, "reddedildi")} disabled={izinKararDurumu === i.id} style={{ ...butonStil(true, T.danger), padding: "7px 12px", fontSize: TYPO.caption }}>Reddet</button>
                    </div>
                  </div>
                ))
              )}
            </Panel>

            <Panel baslik="Görev Ata" ikon="📌">
              <select value={yeniGorevAtanan} aria-label="Atanan kisi" onChange={(e) => setYeniGorevAtanan(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
                <option value="">— Personel Seç —</option>
                {ikYonetimVeri?.personelListesi?.map((p) => <option key={p.id} value={p.id}>{p.ad}</option>)}
              </select>
              <input value={yeniGorevBaslik} aria-label="Gorev basligi" onChange={(e) => setYeniGorevBaslik(e.target.value)} placeholder="Görev başlığı" style={{ ...girdiStil, marginBottom: 10 }} />
              <input value={yeniGorevAciklama} aria-label="Gorev aciklamasi" onChange={(e) => setYeniGorevAciklama(e.target.value)} placeholder="Açıklama (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
              <input type="date" value={yeniGorevSonTarih} aria-label="Son tarih" onChange={(e) => setYeniGorevSonTarih(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <button onClick={gorevAta} disabled={gorevAtaniyor || !yeniGorevBaslik} style={{ ...butonStil(!!yeniGorevBaslik), width: "100%", padding: "10px 0" }}>Görev Ata</button>
            </Panel>

            <Panel baslik="Tüm Görevler" ikon="📋">
              {!ikYonetimVeri?.gorevler || ikYonetimVeri.gorevler.length === 0 ? (
                <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Henüz görev yok.</p>
              ) : (
                ikYonetimVeri.gorevler.map((g) => (
                  <div key={g.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: TYPO.caption, borderBottom: `1px solid ${T.border}` }}>
                    <span>{g.baslik} {g.atanan_adi ? `— ${g.atanan_adi}` : ""}</span>
                    <span style={{ color: g.durum === "tamamlandi" ? T.accent : T.textMuted, fontWeight: 700 }}>{g.durum}</span>
                  </div>
                ))
              )}
            </Panel>
          </>
        )}

        {sekme === "duyuru" && (
          <Panel baslik="Hedefli Duyuru Gönder (Telegram)" ikon="📢">
            <label style={etiketStil}>Mesaj</label>
            <textarea value={duyuruMesaji} onChange={(e) => setDuyuruMesaji(e.target.value)} style={{ ...girdiStil, minHeight: 70, marginBottom: 10, fontFamily: T.font }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={duyuruIl} aria-label="Il" onChange={(e) => setDuyuruIl(e.target.value)} placeholder="İl (boş = tümü)" style={girdiStil} />
              <select value={duyuruSinif} aria-label="Sinif" onChange={(e) => setDuyuruSinif(e.target.value)} style={girdiStil}>
                <option value="">Tüm Sınıflar</option>
                {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
              </select>
            </div>
            <button onClick={duyuruGonder} disabled={duyuruGonderiliyor || !duyuruMesaji} style={{ ...butonStil(!!duyuruMesaji), width: "100%", padding: "10px 0" }}>
              {duyuruGonderiliyor ? "Gönderiliyor..." : "Duyuruyu Gönder"}
            </button>
            {duyuruSonuc && <p style={{ fontSize: TYPO.body, color: T.accent, marginTop: 10 }}>✓ {duyuruSonuc.basarili}/{duyuruSonuc.hedeflenen} kişiye ulaştırıldı.</p>}
          </Panel>
        )}

      </div>
      <CerezBildirimi renkler={{ bg: T.text, metin: "#fff", buton: T.accent }} />
    </main>
  );
}
