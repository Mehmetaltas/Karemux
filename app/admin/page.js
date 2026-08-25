"use client";
import { useState, useEffect } from "react";

// ==== Tasarim tokenlari - "Kayit Defteri" estetigi: bir ogretmenin
// karne/not defterini andiran, kagit + kirmizi kalem + tebesir yesili dili ====
const T = {
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

const girdiStil = { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: TYPO.bodyStrong, fontFamily: T.font, outline: "none" };
const etiketStil = { fontSize: TYPO.micro, fontWeight: 600, color: T.textMuted, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.3 };
function butonStil(aktif, renk) {
  return { padding: "9px 16px", borderRadius: 6, border: "none", background: aktif ? (renk || T.accent) : T.surfaceHover, color: aktif ? T.onAccent : T.textMuted, fontWeight: 700, fontSize: TYPO.body, cursor: aktif ? "pointer" : "default", transition: "background 0.15s" };
}

export default function YonetimPaneli() {
  const [sifre, setSifre] = useState("");
  const [personelEposta, setPersonelEposta] = useState("");
  const [personelSifre, setPersonelSifre] = useState("");
  const [personelAd, setPersonelAd] = useState("");
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [sekme, setSekme] = useState("genel");
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");

  const [muhasebeVeri, setMuhasebeVeri] = useState(null);
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
  const [basvuruIslemDurumu, setBasvuruIslemDurumu] = useState(null);
  const [basvuruOnaySaatlikUcret, setBasvuruOnaySaatlikUcret] = useState({});

  async function basvurulariGetir() {
    try {
      const res = await fetch(`/api/admin/ogretmen-basvuru?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setOgretmenBasvurulari(data.basvurular);
    } catch {}
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
  const [duzenlenenKurumFiyat, setDuzenlenenKurumFiyat] = useState({});
  const [duzenlenenKurumMin, setDuzenlenenKurumMin] = useState({});
  const [kurumKaydediliyor, setKurumKaydediliyor] = useState(null);
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

  async function girisDene() {
    mesajTemizle();
    setYukleniyor(true);
    try {
      // GERCEK kisisel giris - personel tablosuyla dogrulanir (24 Agustos).
      const girisRes = await fetch("/api/personel/giris", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: personelEposta, sifre: personelSifre }),
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
    setUlusalOlusturuluyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/ulusal-deneme/olustur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yoneticiSifre: sifre, ad: ulusalAd, sinif: Number(ulusalSinif), ders: ulusalDers, acikKalmaSaati: ulusalSaat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${ulusalAd}" başlatıldı.`); setUlusalAd("");
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
  useEffect(() => { if (girisYapildi && sekme === "kurumlar" && !kurumlarVeri) kurumlariGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "randevuodeme" && !randevuOdemeVeri) randevuOdemeGetir(); }, [girisYapildi, sekme]);
  useEffect(() => { if (girisYapildi && sekme === "ogretmen" && !ogretmenBasvurulari) basvurulariGetir(); }, [girisYapildi, sekme]);
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

  async function kurumFiyatKaydet(kurumId) {
    const fiyat = duzenlenenKurumFiyat[kurumId];
    const min = duzenlenenKurumMin[kurumId];
    if (fiyat == null && min == null) return;
    setKurumKaydediliyor(kurumId); mesajTemizle();
    try {
      const mevcut = kurumlarVeri.find((k) => k.id === kurumId);
      const res = await fetch("/api/admin/kurum", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, kurumId, kisiBasiFiyatTl: fiyat != null ? Number(fiyat) : mevcut.kisi_basi_fiyat_tl, minKisiSayisi: min != null ? Number(min) : mevcut.min_kisi_sayisi }),
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
          <input type="email" value={personelEposta} onChange={(e) => setPersonelEposta(e.target.value)}
            placeholder="Eposta" style={{ ...girdiStil, padding: "12px 14px", fontSize: TYPO.bodyStrong, marginBottom: 10 }} autoFocus />
          <input type="password" value={personelSifre} onChange={(e) => setPersonelSifre(e.target.value)} onKeyDown={(e) => e.key === "Enter" && girisDene()}
            placeholder="Şifre" style={{ ...girdiStil, padding: "12px 14px", fontSize: TYPO.bodyStrong, marginBottom: 10 }} />
          <button onClick={girisDene} disabled={yukleniyor || !personelEposta || !personelSifre} style={{ ...butonStil(!!(personelEposta && personelSifre)), width: "100%", padding: "12px 0", fontSize: TYPO.bodyStrong }}>
            {yukleniyor ? "Kontrol ediliyor..." : "Giriş Yap"}
          </button>
          {hata && <p style={{ color: T.danger, fontSize: TYPO.body, marginTop: 12, textAlign: "center" }}>{hata}</p>}
        </div>
      </div>
    );
  }

  const SEKMELER = [
    ["genel", "📊 Genel Bakış"],
    ["paketler", "💰 Paketler"],
    ["giderler", "🧾 Giderler"],
    ["cari", "🤝 Cari"],
    ["kasa", "🏦 Kasa/Banka"],
    ["maliyet", "🤖 Üretim Maliyeti"],
    ["simulasyon", "🧮 Simülasyon"],
    ["planlama", "📈 Finansal Planlama"],
    ["kurumlar", "🏢 Kurumlar"],
    ["randevuodeme", "📅 Randevu Ödemeleri"],
    ["ogretmen", "🎓 Öğretmenler"],
    ["duyuru", "📢 Duyuru"],
    ["deneme", "🇹🇷 Ulusal Deneme"],
    ["talepler", "💡 Kullanıcı Talepleri"],
    ["kariyer", "🧑‍💼 Kariyer Havuzu"],
    ["ik", "🗂️ Personel Yönetimi"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, paddingBottom: 60 }}>
      <style>{`
        @keyframes adminPanelFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .admin-panel-govde { animation: adminPanelFadeIn 0.35s ease-out; }
      `}</style>
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img src="/icons/icon-192.png" alt="Karemux" style={{ width: 30, height: 30, borderRadius: 8, display: "block", objectFit: "cover" }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: TYPO.heading, margin: 0 }}>Karemux Yönetim</p>
            {personelAd && <p style={{ fontSize: TYPO.micro, color: T.textMuted, margin: 0 }}>Hoş geldin, {personelAd}</p>}
          </div>
        </div>
        <button onClick={async () => { await fetch("/api/personel/cikis", { method: "POST" }); setGirisYapildi(false); setSifre(""); setPersonelEposta(""); setPersonelSifre(""); setPersonelAd(""); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: TYPO.caption, cursor: "pointer" }}>Çıkış</button>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", gap: 6, overflowX: "auto" }}>
        {SEKMELER.map(([k, etiket]) => (
          <button key={k} onClick={() => { setSekme(k); mesajTemizle(); }} style={{ ...butonStil(true, sekme === k ? T.accent : T.surfaceHover), color: sekme === k ? T.onAccent : T.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>
            {etiket}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        {(hata || basari) && (
          <div style={{ background: hata ? T.dangerSoft : T.accentSoft, border: `1px solid ${hata ? T.danger : T.accent}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: TYPO.body, color: hata ? T.danger : T.accent }}>
            {hata || basari}
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
          <Panel baslik="Satış Paketleri" ikon="💰">
            {muhasebeVeri.paketler?.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, background: T.surfaceHover, borderRadius: 9, padding: "10px 12px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: TYPO.body, fontWeight: 600 }}>{p.ad}</p>
                  <p style={{ fontSize: TYPO.micro, color: T.textMuted }}>{p.sure_gun ? `${p.sure_gun} gün erişim` : `${p.kredi_miktari} kredi`}</p>
                </div>
                <input type="number" defaultValue={p.fiyat_tl} onChange={(e) => setDuzenlenenFiyatlar((eski) => ({ ...eski, [p.id]: e.target.value }))}
                  style={{ ...girdiStil, width: 80, textAlign: "right", padding: "7px 9px" }} />
                <span style={{ color: T.textMuted, fontSize: TYPO.caption }}>₺</span>
                <button onClick={() => fiyatKaydet(p.id)} disabled={fiyatKaydediliyor === p.id || duzenlenenFiyatlar[p.id] == null}
                  style={{ ...butonStil(duzenlenenFiyatlar[p.id] != null), padding: "7px 12px", fontSize: TYPO.caption }}>
                  {fiyatKaydediliyor === p.id ? "..." : "Kaydet"}
                </button>
              </div>
            ))}
          </Panel>
        )}

        {sekme === "giderler" && (
          <>
            <Panel baslik="Yeni Gider Ekle" ikon="➕">
              <label style={etiketStil}>Kategori</label>
              <select value={giderKategori} onChange={(e) => setGiderKategori(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
                {["muhasebe", "bagkur", "vergi", "ai_maliyeti", "domain", "sunucu", "hosting", "odeme_komisyonu", "pazarlama", "diger"].map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <label style={etiketStil}>Tutar (₺)</label>
              <input type="number" value={giderTutar} onChange={(e) => setGiderTutar(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={etiketStil}>Açıklama (opsiyonel)</label>
              <input value={giderAciklama} onChange={(e) => setGiderAciklama(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, fontSize: TYPO.body, color: T.textMuted }}>
                <input type="checkbox" checked={giderTekrarlayan} onChange={(e) => setGiderTekrarlayan(e.target.checked)} />
                Her ay otomatik tekrarla
              </label>
              <label style={etiketStil}>Hangi Kasa/Banka Hesabından? (opsiyonel, seçilirse otomatik yansır)</label>
              <select value={giderHesapId} onChange={(e) => setGiderHesapId(e.target.value)} style={{ ...girdiStil, marginBottom: 12 }}>
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
                <input type="number" value={taksitTutar} onChange={(e) => setTaksitTutar(e.target.value)} placeholder="Satış tutarı" style={girdiStil} />
                <select value={taksitSayisi} onChange={(e) => setTaksitSayisi(Number(e.target.value))} style={girdiStil}>
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
              <input value={yeniCariAd} onChange={(e) => setYeniCariAd(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={yeniCariTur} onChange={(e) => setYeniCariTur(e.target.value)} style={girdiStil}>
                  <option value="musteri">Müşteri (Kurum/Bireysel)</option>
                  <option value="tedarikci">Tedarikçi</option>
                  <option value="diger">Diğer</option>
                </select>
                <input value={yeniCariTelefon} onChange={(e) => setYeniCariTelefon(e.target.value)} placeholder="Telefon (opsiyonel)" style={girdiStil} />
              </div>
              <button onClick={cariEkle} disabled={cariEkleniyor || !yeniCariAd} style={{ ...butonStil(!!yeniCariAd), width: "100%", padding: "10px 0" }}>
                {cariEkleniyor ? "Ekleniyor..." : "Cari Ekle"}
              </button>
            </Panel>

            <Panel baslik="Cari Listesi" ikon="🤝">
              {!cariler ? <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : cariler.length === 0 ? (
                <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz cari yok.</p>
              ) : cariler.map((c) => (
                <div key={c.id} onClick={() => cariSec(c.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: secilenCariId === c.id ? T.surfaceHover : "transparent" }}>
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
                  <select value={hareketTur} onChange={(e) => setHareketTur(e.target.value)} style={girdiStil}>
                    <option value="satis_veresiye">Veresiye Satış (bize borçlandı)</option>
                    <option value="tahsilat">Tahsilat (ödedi)</option>
                    <option value="tedarik_borcu">Tedarik Borcu (biz borçlandık)</option>
                    <option value="odeme">Ödeme Yaptık</option>
                  </select>
                  <input type="number" value={hareketTutar} onChange={(e) => setHareketTutar(e.target.value)} placeholder="Tutar ₺" style={girdiStil} />
                </div>
                <input value={hareketAciklama} onChange={(e) => setHareketAciklama(e.target.value)} placeholder="Açıklama (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
                {(hareketTur === "tahsilat" || hareketTur === "odeme") && (
                  <div style={{ marginBottom: 10 }}>
                    <label style={etiketStil}>Hangi Kasa/Banka Hesabı? (opsiyonel, seçilirse otomatik yansır)</label>
                    <select value={hareketHesapId} onChange={(e) => setHareketHesapId(e.target.value)} style={girdiStil}>
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
              <input value={yeniHesapAdi} onChange={(e) => setYeniHesapAdi(e.target.value)} placeholder="Örn: İş Bankası Şirket Hesabı" style={{ ...girdiStil, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={yeniHesapTur} onChange={(e) => setYeniHesapTur(e.target.value)} style={girdiStil}>
                  <option value="banka">Banka Hesabı</option>
                  <option value="nakit">Nakit (Kasa)</option>
                </select>
                <input value={yeniHesapBanka} onChange={(e) => setYeniHesapBanka(e.target.value)} placeholder="Banka adı (opsiyonel)" style={girdiStil} />
              </div>
              <label style={etiketStil}>Başlangıç Bakiyesi (₺)</label>
              <input type="number" value={yeniHesapBaslangic} onChange={(e) => setYeniHesapBaslangic(e.target.value)} style={{ ...girdiStil, marginBottom: 14 }} />
              <button onClick={hesapEkle} disabled={hesapEkleniyor || !yeniHesapAdi} style={{ ...butonStil(!!yeniHesapAdi), width: "100%", padding: "10px 0" }}>
                {hesapEkleniyor ? "Ekleniyor..." : "Hesap Ekle"}
              </button>
            </Panel>

            <Panel baslik="Hesaplar" ikon="🏦">
              {!kasaHesaplari ? <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : kasaHesaplari.length === 0 ? (
                <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz hesap yok.</p>
              ) : kasaHesaplari.map((h) => (
                <div key={h.id} onClick={() => hesapSec(h.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: secilenHesapId === h.id ? T.surfaceHover : "transparent" }}>
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
                  <select value={kasaHareketTur} onChange={(e) => setKasaHareketTur(e.target.value)} style={girdiStil}>
                    <option value="giris">Giriş (Para Girdi)</option>
                    <option value="cikis">Çıkış (Para Çıktı)</option>
                  </select>
                  <input type="number" value={kasaHareketTutar} onChange={(e) => setKasaHareketTutar(e.target.value)} placeholder="Tutar ₺" style={girdiStil} />
                </div>
                <input value={kasaHareketAciklama} onChange={(e) => setKasaHareketAciklama(e.target.value)} placeholder="Açıklama (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
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
              <input type="number" value={hedefGelir} onChange={(e) => setHedefGelir(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={etiketStil}>Gider Hedefi (₺)</label>
              <input type="number" value={hedefGider} onChange={(e) => setHedefGider(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={etiketStil}>Not (opsiyonel)</label>
              <input value={hedefNot} onChange={(e) => setHedefNot(e.target.value)} style={{ ...girdiStil, marginBottom: 14 }} />
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
                <input type="number" value={senaryoKonuAnlatimi} onChange={(e) => setSenaryoKonuAnlatimi(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 10 }} />
                <label style={etiketStil}>Soru Cozumu (adet)</label>
                <input type="number" value={senaryoSoruCozumu} onChange={(e) => setSenaryoSoruCozumu(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 10 }} />
                <label style={etiketStil}>Tekrar Testi (adet)</label>
                <input type="number" value={senaryoTekrarTesti} onChange={(e) => setSenaryoTekrarTesti(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 10 }} />
                <label style={etiketStil}>Deneme/Yazili (adet)</label>
                <input type="number" value={senaryoDeneme} onChange={(e) => setSenaryoDeneme(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 10 }} />
                <label style={etiketStil}>Toplu Hesap Icin Kisi Sayisi</label>
                <input type="number" value={senaryoKisiSayisi} onChange={(e) => setSenaryoKisiSayisi(Number(e.target.value))} style={girdiStil} />
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

        {sekme === "kurumlar" && (
          <Panel baslik="Kurumlar ve Fiyatlandırma" ikon="🏢">
            {!kurumlarVeri ? <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : kurumlarVeri.length === 0 ? (
              <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Henüz kurum yok.</p>
            ) : kurumlarVeri.map((k) => (
              <div key={k.id} style={{ background: T.surfaceHover, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: TYPO.bodyStrong, fontWeight: 700 }}>{k.ad} <span style={{ color: T.textMuted, fontWeight: 400, fontSize: TYPO.caption }}>({k.kurum_kodu})</span></p>
                  <p style={{ fontSize: TYPO.caption, color: T.textMuted }}>{k.ogrenci_sayisi} öğrenci</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={etiketStil}>Kişi Başı Fiyat (₺/ay)</label>
                    <input type="number" defaultValue={k.kisi_basi_fiyat_tl} onChange={(e) => setDuzenlenenKurumFiyat((eski) => ({ ...eski, [k.id]: e.target.value }))} style={girdiStil} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={etiketStil}>Min. Kişi Sayısı</label>
                    <input type="number" defaultValue={k.min_kisi_sayisi} onChange={(e) => setDuzenlenenKurumMin((eski) => ({ ...eski, [k.id]: e.target.value }))} style={girdiStil} />
                  </div>
                  <button onClick={() => kurumFiyatKaydet(k.id)} disabled={kurumKaydediliyor === k.id} style={{ ...butonStil(true), padding: "9px 14px", alignSelf: "flex-end" }}>
                    {kurumKaydediliyor === k.id ? "..." : "Kaydet"}
                  </button>
                </div>
              </div>
            ))}
          </Panel>
        )}

        {sekme === "randevuodeme" && (
          <Panel baslik="Özel Ders Ödemeleri (Ücretli Randevular)" ikon="📅">
            {!randevuOdemeVeri ? <p style={{ fontSize: TYPO.body, color: T.textMuted }}>Yükleniyor...</p> : randevuOdemeVeri.length === 0 ? (
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
            <input value={yeniOgretmenAd} onChange={(e) => setYeniOgretmenAd(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
            <label style={etiketStil}>Branş</label>
            <select value={yeniOgretmenBrans} onChange={(e) => setYeniOgretmenBrans(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
              {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce", "Rehberlik"].map((d) => <option key={d} value={d}>{d === "Rehberlik" ? "🧭 Rehberlik Danışmanlığı" : d}</option>)}
            </select>
            <label style={etiketStil}>Haftalık Müsaitlik</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <select value={yeniOgretmenGun} onChange={(e) => setYeniOgretmenGun(Number(e.target.value))} style={girdiStil}>
                {["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"].map((g, i) => <option key={i} value={i}>{g}</option>)}
              </select>
              <input type="time" value={yeniOgretmenBaslangic} onChange={(e) => setYeniOgretmenBaslangic(e.target.value)} style={girdiStil} />
              <input type="time" value={yeniOgretmenBitis} onChange={(e) => setYeniOgretmenBitis(e.target.value)} style={girdiStil} />
            </div>
            <button onClick={ogretmenEkle} disabled={ogretmenEkleniyor || !yeniOgretmenAd} style={{ ...butonStil(!!yeniOgretmenAd), width: "100%", padding: "10px 0" }}>
              {ogretmenEkleniyor ? "Ekleniyor..." : "Öğretmen Ekle"}
            </button>
          </Panel>
        )}

        {sekme === "ogretmen" && (
          <Panel baslik="Öğretmen Başvuruları" ikon="📋">
            {!ogretmenBasvurulari ? (
              <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Yükleniyor...</p>
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
                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <input type="number" placeholder="Saatlik ücret ₺" value={basvuruOnaySaatlikUcret[b.id] || ""} onChange={(e) => setBasvuruOnaySaatlikUcret((eski) => ({ ...eski, [b.id]: e.target.value }))} style={{ ...girdiStil, marginBottom: 0, width: 120 }} />
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

        {sekme === "talepler" && (
          <Panel baslik="Kullanıcı Talepleri (Konu/Özellik)" ikon="💡">
            {!talepler ? (
              <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Yükleniyor...</p>
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
              <p style={{ color: T.textMuted, fontSize: TYPO.body }}>Yükleniyor...</p>
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
                  <input value={mesaiCikisNotu} onChange={(e) => setMesaiCikisNotu(e.target.value)} placeholder="Çıkış notu (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
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
                <input type="date" value={izinBaslangic} onChange={(e) => setIzinBaslangic(e.target.value)} style={girdiStil} />
                <input type="date" value={izinBitis} onChange={(e) => setIzinBitis(e.target.value)} style={girdiStil} />
              </div>
              <select value={izinTur} onChange={(e) => setIzinTur(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
                <option value="yillik">Yıllık İzin</option>
                <option value="mazeret">Mazeret İzni</option>
                <option value="hastalik">Hastalık İzni</option>
              </select>
              <input value={izinAciklama} onChange={(e) => setIzinAciklama(e.target.value)} placeholder="Açıklama (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
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
                    <select value={g.durum} onChange={(e) => gorevDurumGuncelle(g.id, e.target.value)} style={{ ...girdiStil, marginBottom: 0, fontSize: TYPO.caption, padding: "6px 8px" }}>
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
              <select value={yeniGorevAtanan} onChange={(e) => setYeniGorevAtanan(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
                <option value="">— Personel Seç —</option>
                {ikYonetimVeri?.personelListesi?.map((p) => <option key={p.id} value={p.id}>{p.ad}</option>)}
              </select>
              <input value={yeniGorevBaslik} onChange={(e) => setYeniGorevBaslik(e.target.value)} placeholder="Görev başlığı" style={{ ...girdiStil, marginBottom: 10 }} />
              <input value={yeniGorevAciklama} onChange={(e) => setYeniGorevAciklama(e.target.value)} placeholder="Açıklama (opsiyonel)" style={{ ...girdiStil, marginBottom: 10 }} />
              <input type="date" value={yeniGorevSonTarih} onChange={(e) => setYeniGorevSonTarih(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
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
              <input value={duyuruIl} onChange={(e) => setDuyuruIl(e.target.value)} placeholder="İl (boş = tümü)" style={girdiStil} />
              <select value={duyuruSinif} onChange={(e) => setDuyuruSinif(e.target.value)} style={girdiStil}>
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

        {sekme === "deneme" && (
          <Panel baslik="Türkiye Geneli Deneme Başlat" ikon="🇹🇷">
            <label style={etiketStil}>Deneme Adı</label>
            <input value={ulusalAd} onChange={(e) => setUlusalAd(e.target.value)} placeholder="Örn: 15. Hafta Türkiye Denemesi" style={{ ...girdiStil, marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <select value={ulusalSinif} onChange={(e) => setUlusalSinif(e.target.value)} style={girdiStil}>
                {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
              </select>
              <select value={ulusalDers} onChange={(e) => setUlusalDers(e.target.value)} style={girdiStil}>
                {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce"].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <label style={etiketStil}>Açık Kalma Süresi (saat)</label>
            <input type="number" value={ulusalSaat} onChange={(e) => setUlusalSaat(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 14 }} />
            <button onClick={ulusalOlustur} disabled={ulusalOlusturuluyor || !ulusalAd} style={{ ...butonStil(!!ulusalAd), width: "100%", padding: "10px 0" }}>
              {ulusalOlusturuluyor ? "Oluşturuluyor..." : "Şimdi Başlat"}
            </button>
          </Panel>
        )}
      </div>
    </div>
  );
}
