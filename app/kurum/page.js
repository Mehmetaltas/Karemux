"use client";
import { useState, useEffect } from "react";

const T = {
  bg: "#F5F5F7", page: "#fff", ink: "#1D1D1F", muted: "#76767A",
  coral: "#0974E0", line: "#E5E5EA", mustard: "#A36606",
};

export default function KurumPaneli() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullanici, setKullanici] = useState(null);
  const [kurum, setKurum] = useState(null);
  const [denemeler, setDenemeler] = useState(null);
  const [vergiNo, setVergiNo] = useState("");
  const [vergiDairesi, setVergiDairesi] = useState("");
  const [yetkiliUnvan, setYetkiliUnvan] = useState("");
  const [profilMesaj, setProfilMesaj] = useState("");
  const [havaleBilgi, setHavaleBilgi] = useState(null);
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState("");
  const [cikisYukleniyor, setCikisYukleniyor] = useState(false);
  const [lisanslar, setLisanslar] = useState(null);
  const [yillikPaketler, setYillikPaketler] = useState(null);
  const [lisansPlanSecim, setLisansPlanSecim] = useState("");
  const [lisansKoltukSayisi, setLisansKoltukSayisi] = useState(1);
  const [lisansHavaleBilgi, setLisansHavaleBilgi] = useState(null);
  const [lisansIslemYukleniyor, setLisansIslemYukleniyor] = useState(false);
  const [lisansHata, setLisansHata] = useState("");
  const [koltukAtaAcikLisans, setKoltukAtaAcikLisans] = useState(null);
  const [koltukAtaEposta, setKoltukAtaEposta] = useState("");
  const [koltukAtaYukleniyor, setKoltukAtaYukleniyor] = useState(false);
  const [koltukAtaMesaj, setKoltukAtaMesaj] = useState("");
  const [rapor, setRapor] = useState(null);
  const [raporYukleniyor, setRaporYukleniyor] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [ogrenciler, setOgrenciler] = useState(null);
  const [duyurular, setDuyurular] = useState(null);
  const [duyuruBaslik, setDuyuruBaslik] = useState("");
  const [duyuruIcerik, setDuyuruIcerik] = useState("");
  const [duyuruYukleniyor, setDuyuruYukleniyor] = useState(false);
  const [personel, setPersonel] = useState(null);
  const [personelAd, setPersonelAd] = useState("");
  const [personelGorev, setPersonelGorev] = useState("");
  const [personelEposta, setPersonelEposta] = useState("");
  const [personelYukleniyor, setPersonelYukleniyor] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.girisYapmis || data.kullanici?.rol !== "kurum_yoneticisi") {
          window.location.href = "/kurum-giris";
          return;
        }
        setKullanici(data.kullanici);
        await Promise.all([kurumGetir(), denemeleriGetir(), lisanslariGetir(), yillikPaketleriGetir(), raporuGetir(), ogrencileriGetir(), duyurulariGetir(), personeliGetir()]);
      } finally {
        setYukleniyor(false);
      }
    })();
  }, []);

  async function kurumGetir() {
    try {
      const res = await fetch("/api/kurum/profil");
      const data = await res.json();
      if (res.ok && data.kurum) {
        setKurum(data.kurum);
        setVergiNo(data.kurum.vergi_no || "");
        setVergiDairesi(data.kurum.vergi_dairesi || "");
        setYetkiliUnvan(data.kurum.yetkili_unvan || "");
        setLogoUrl(data.kurum.logo_url || "");
      }
    } catch {}
  }

  async function denemeleriGetir() {
    try {
      const res = await fetch("/api/kurum/denemeler");
      const data = await res.json();
      if (res.ok) setDenemeler(data.denemeler || []);
    } catch {}
  }

  async function profilKaydet() {
    setProfilMesaj("");
    try {
      const res = await fetch("/api/kurum/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vergiNo, vergiDairesi, yetkiliUnvan, logoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfilMesaj("Kaydedildi.");
      kurumGetir();
    } catch (e) {
      setProfilMesaj(e.message);
    }
  }

  async function havaleIleSatinAl(denemeId) {
    setHata(""); setHavaleBilgi(null);
    setIslemYukleniyor(denemeId);
    try {
      const res = await fetch("/api/kurum/havale-baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denemeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHavaleBilgi(data);
    } catch (e) {
      setHata(e.message);
    } finally {
      setIslemYukleniyor(null);
    }
  }

  async function cikisYap() {
    setCikisYukleniyor(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/kurum-giris";
  }

  async function lisanslariGetir() {
    try {
      const res = await fetch("/api/kurum/lisanslar");
      const data = await res.json();
      if (res.ok) setLisanslar(data.lisanslar || []);
    } catch {}
  }

  async function yillikPaketleriGetir() {
    try {
      const res = await fetch("/api/paketler");
      const data = await res.json();
      if (res.ok) setYillikPaketler((data.paketler || []).filter((p) => p.anahtar?.startsWith("yillik_")));
    } catch {}
  }

  async function havaleIleLisansSatinAl() {
    setLisansHata(""); setLisansHavaleBilgi(null);
    if (!lisansPlanSecim) { setLisansHata("Once bir paket sec."); return; }
    if (!Number.isInteger(lisansKoltukSayisi) || lisansKoltukSayisi < 1) { setLisansHata("Gecerli bir koltuk sayisi gir."); return; }
    setLisansIslemYukleniyor(true);
    try {
      const res = await fetch("/api/kurum/lisans-havale-baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: lisansPlanSecim, koltukSayisi: lisansKoltukSayisi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLisansHavaleBilgi(data);
      lisanslariGetir();
    } catch (e) {
      setLisansHata(e.message);
    } finally {
      setLisansIslemYukleniyor(false);
    }
  }

  async function koltukAta(lisansId) {
    setKoltukAtaMesaj("");
    if (!koltukAtaEposta.trim()) { setKoltukAtaMesaj("Ogrenci e-postasi gerekli."); return; }
    setKoltukAtaYukleniyor(true);
    try {
      const res = await fetch("/api/kurum/koltuk-ata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lisansId, ogrenciEposta: koltukAtaEposta.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKoltukAtaMesaj("Koltuk basariyla atandi.");
      setKoltukAtaEposta("");
      lisanslariGetir();
    } catch (e) {
      setKoltukAtaMesaj(e.message);
    } finally {
      setKoltukAtaYukleniyor(false);
    }
  }

  async function raporuGetir() {
    setRaporYukleniyor(true);
    try {
      const res = await fetch("/api/kurum/rapor");
      const data = await res.json();
      if (res.ok) setRapor(data);
    } catch {} finally { setRaporYukleniyor(false); }
  }

  async function ogrencileriGetir() {
    try {
      const res = await fetch("/api/kurum/ogrenciler");
      const data = await res.json();
      if (res.ok) setOgrenciler(data.ogrenciler || []);
    } catch {}
  }

  async function subeGuncelle(ogrenciId, sube) {
    try {
      await fetch("/api/kurum/ogrenciler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ogrenciId, sube }),
      });
      ogrencileriGetir();
    } catch {}
  }

  async function duyurulariGetir() {
    try {
      const res = await fetch("/api/kurum/duyuru");
      const data = await res.json();
      if (res.ok) setDuyurular(data.duyurular || []);
    } catch {}
  }

  async function duyuruEkle() {
    if (!duyuruBaslik.trim() || !duyuruIcerik.trim()) return;
    setDuyuruYukleniyor(true);
    try {
      await fetch("/api/kurum/duyuru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik: duyuruBaslik, icerik: duyuruIcerik }),
      });
      setDuyuruBaslik(""); setDuyuruIcerik("");
      duyurulariGetir();
    } catch {} finally { setDuyuruYukleniyor(false); }
  }

  async function duyuruSil(duyuruId) {
    try {
      await fetch("/api/kurum/duyuru", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duyuruId }),
      });
      duyurulariGetir();
    } catch {}
  }

  async function personeliGetir() {
    try {
      const res = await fetch("/api/kurum/personel");
      const data = await res.json();
      if (res.ok) setPersonel(data.personel || []);
    } catch {}
  }

  async function personelEkle() {
    if (!personelAd.trim()) return;
    setPersonelYukleniyor(true);
    try {
      await fetch("/api/kurum/personel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad: personelAd, gorev: personelGorev, eposta: personelEposta }),
      });
      setPersonelAd(""); setPersonelGorev(""); setPersonelEposta("");
      personeliGetir();
    } catch {} finally { setPersonelYukleniyor(false); }
  }

  async function personelSil(personelId) {
    try {
      await fetch("/api/kurum/personel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personelId }),
      });
      personeliGetir();
    } catch {}
  }

  if (yukleniyor) {
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}><p aria-live="polite" style={{ color: T.muted }}>Yukleniyor...</p></main>;
  }

  if (!kullanici) {
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}><p aria-live="polite" style={{ color: T.muted }}>Yonlendiriliyor...</p></main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Kurum Paneli</h1>
          <button onClick={cikisYap} disabled={cikisYukleniyor} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.line}`, background: "none", color: T.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            {cikisYukleniyor ? "..." : "Çıkış Yap"}
          </button>
        </div>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>{kurum?.ad}</p>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Fatura / Vergi Bilgileri</h2>
          <input aria-label="Vergi numarasi" value={vergiNo} onChange={(e) => setVergiNo(e.target.value)} placeholder="Vergi Numarasi (10 hane)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
          <input aria-label="Vergi dairesi" value={vergiDairesi} onChange={(e) => setVergiDairesi(e.target.value)} placeholder="Vergi Dairesi" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
          <input aria-label="Yetkili unvani" value={yetkiliUnvan} onChange={(e) => setYetkiliUnvan(e.target.value)} placeholder="Yetkili Unvani (opsiyonel)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
          <input aria-label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Logo URL (opsiyonel, baska bir yerde barindirilan gorsel linki)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 13 }} />
          {logoUrl && <img src={logoUrl} alt="Kurum logosu" style={{ maxHeight: 50, marginBottom: 10, borderRadius: 6 }} onError={(e) => { e.target.style.display = "none"; }} />}
          <button onClick={profilKaydet} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Kaydet</button>
          {profilMesaj && <p style={{ fontSize: 12, marginTop: 8, color: T.muted }}>{profilMesaj}</p>}
        </section>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Ucretli Denemeler</h2>
          {!denemeler ? <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p> : denemeler.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted }}>Su an aktif deneme yok.</p>
          ) : denemeler.map((d) => (
            <div key={d.id} style={{ borderBottom: `1px solid ${T.line}`, padding: "10px 0" }}>
              <p style={{ fontWeight: 700, fontSize: 13.5 }}>{d.ad}</p>
              <p style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{d.ders} · {d.sinif}. Sinif · {d.kapsam}{d.il ? ` (${d.il})` : ""} · {Number(d.fiyat_tl).toLocaleString("tr-TR")}₺</p>
              {d.odendi ? (
                <p style={{ fontSize: 12, color: "#2E7D4F", fontWeight: 700 }}>Satin alindi</p>
              ) : (
                <button onClick={() => havaleIleSatinAl(d.id)} disabled={islemYukleniyor === d.id} style={{ padding: "8px 14px", borderRadius: 6, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  {islemYukleniyor === d.id ? "Hazirlaniyor..." : "🏦 Banka Havalesi ile Satin Al"}
                </button>
              )}
            </div>
          ))}
          {hata && <p style={{ color: "#B23A2E", fontSize: 12.5, marginTop: 8 }}>{hata}</p>}
          {havaleBilgi && (
            <div role="alert" style={{ background: "#FFF8E8", border: `1.5px solid ${T.mustard}`, borderRadius: 10, padding: 14, marginTop: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Havale/EFT Bilgileri</p>
              <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Banka:</b> {havaleBilgi.bankaAdi}</p>
              <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Hesap Sahibi:</b> {havaleBilgi.hesapSahibi}</p>
              <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>IBAN:</b> {havaleBilgi.iban}</p>
              <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Tutar:</b> {havaleBilgi.tutar}₺</p>
              <p style={{ fontSize: 12.5, marginBottom: 8, color: "#B23A2E", fontWeight: 700 }}>Aciklama alanina MUTLAKA su kodu yaz: {havaleBilgi.referans}</p>
            </div>
          )}
        </section>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginTop: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Lisanslarım</h2>
          {!lisanslar ? <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p> : lisanslar.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>Henuz bir lisansin yok.</p>
          ) : lisanslar.map((l) => (
            <div key={l.id} style={{ borderBottom: `1px solid ${T.line}`, padding: "10px 0" }}>
              <p style={{ fontWeight: 700, fontSize: 13.5 }}>{l.plan}</p>
              <p style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{l.kullanilan_koltuk}/{l.koltuk_sayisi} koltuk kullanimda · {Number(l.tutar_tl).toLocaleString("tr-TR")}₺ · {new Date(l.satin_alma_tarihi).toLocaleDateString("tr-TR")}</p>
              {l.kullanilan_koltuk < l.koltuk_sayisi && (
                <button onClick={() => { setKoltukAtaAcikLisans(koltukAtaAcikLisans === l.id ? null : l.id); setKoltukAtaMesaj(""); }} style={{ padding: "6px 12px", borderRadius: 6, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
                  {koltukAtaAcikLisans === l.id ? "Kapat" : "🪑 Koltuk Ata"}
                </button>
              )}
              {koltukAtaAcikLisans === l.id && (
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <input aria-label="Ogrenci epostasi" type="email" value={koltukAtaEposta} onChange={(e) => setKoltukAtaEposta(e.target.value)} placeholder="Ogrencinin e-postasi" style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 12.5 }} />
                  <button onClick={() => koltukAta(l.id)} disabled={koltukAtaYukleniyor} style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    {koltukAtaYukleniyor ? "..." : "Ata"}
                  </button>
                </div>
              )}
              {koltukAtaAcikLisans === l.id && koltukAtaMesaj && <p style={{ fontSize: 11.5, color: koltukAtaMesaj.includes("basariyla") ? "#2E7D4F" : "#B23A2E", marginTop: 6 }}>{koltukAtaMesaj}</p>}
            </div>
          ))}

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>Yeni Lisans Satin Al</h3>
            {!yillikPaketler ? (
              <p style={{ fontSize: 12, color: T.muted }}>Paketler yukleniyor...</p>
            ) : (
              <>
                <select aria-label="Paket sec" value={lisansPlanSecim} onChange={(e) => setLisansPlanSecim(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }}>
                  <option value="">Paket sec...</option>
                  {yillikPaketler.map((p) => (
                    <option key={p.anahtar} value={p.anahtar}>{p.ad} — {Number(p.fiyat_tl).toLocaleString("tr-TR")}₺/koltuk</option>
                  ))}
                </select>
                <input aria-label="Koltuk sayisi" type="number" min="1" value={lisansKoltukSayisi} onChange={(e) => setLisansKoltukSayisi(parseInt(e.target.value) || 1)} placeholder="Koltuk sayisi" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 13 }} />
                <button onClick={havaleIleLisansSatinAl} disabled={lisansIslemYukleniyor} style={{ width: "100%", padding: "9px 0", borderRadius: 6, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  {lisansIslemYukleniyor ? "Hazirlaniyor..." : "🏦 Banka Havalesi ile Satin Al"}
                </button>
              </>
            )}
            {lisansHata && <p style={{ color: "#B23A2E", fontSize: 12.5, marginTop: 8 }}>{lisansHata}</p>}
            {lisansHavaleBilgi && (
              <div role="alert" style={{ background: "#FFF8E8", border: `1.5px solid ${T.mustard}`, borderRadius: 10, padding: 14, marginTop: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Havale/EFT Bilgileri</p>
                <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Banka:</b> {lisansHavaleBilgi.bankaAdi}</p>
                <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Hesap Sahibi:</b> {lisansHavaleBilgi.hesapSahibi}</p>
                <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>IBAN:</b> {lisansHavaleBilgi.iban}</p>
                <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Tutar:</b> {lisansHavaleBilgi.tutar}₺</p>
                <p style={{ fontSize: 12.5, marginBottom: 0, color: "#B23A2E", fontWeight: 700 }}>Aciklama alanina MUTLAKA su kodu yaz: {lisansHavaleBilgi.referans}</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginTop: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Kurum Raporu</h2>
          {raporYukleniyor && <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p>}
          {rapor && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
                  <p style={{ color: "#E8B339", fontSize: 22, fontWeight: 900 }}>{rapor.ogrenciSayisi}</p>
                  <p style={{ color: "#8A968E", fontSize: 9 }}>TOPLAM ÖĞRENCİ</p>
                </div>
                <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
                  <p style={{ color: "#2E7D4F", fontSize: 22, fontWeight: 900 }}>{rapor.buHaftaAktifOgrenci}</p>
                  <p style={{ color: "#8A968E", fontSize: 9 }}>BU HAFTA AKTİF</p>
                </div>
                <div style={{ flex: 1, background: "#1B2430", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
                  <p style={{ color: T.coral, fontSize: 22, fontWeight: 900 }}>{rapor.genelOrtalamaNet ?? "—"}</p>
                  <p style={{ color: "#8A968E", fontSize: 9 }}>GENEL ORT. NET</p>
                </div>
              </div>

              {rapor.gunlukTrend?.length >= 2 && (() => {
                const genislik = 320, yukseklik = 90, kenar = 12;
                const maxDeger = Math.max(...rapor.gunlukTrend.map((v) => Number(v.aktif_ogrenci)), 1);
                const adim = (genislik - kenar * 2) / (rapor.gunlukTrend.length - 1);
                const noktalar = rapor.gunlukTrend.map((v, i) => ({
                  x: kenar + i * adim,
                  y: yukseklik - kenar - (Number(v.aktif_ogrenci) / maxDeger) * (yukseklik - kenar * 2),
                }));
                const yol = noktalar.map((n, i) => `${i === 0 ? "M" : "L"}${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(" ");
                return (
                  <div style={{ background: T.bg, borderRadius: 12, padding: 16, border: `1px solid ${T.line}`, marginBottom: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 10 }}>SON 7 GÜN — GÜNLÜK AKTİF ÖĞRENCİ</p>
                    <svg viewBox={`0 0 ${genislik} ${yukseklik}`} style={{ width: "100%", height: 100 }} role="img" aria-label="Son 7 gunun gunluk aktif ogrenci sayisi trend grafigi">
                      <path d={yol} fill="none" stroke="#2E7D4F" strokeWidth="2.5" />
                      {noktalar.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r="3" fill="#2E7D4F" />)}
                    </svg>
                  </div>
                );
              })()}

              {rapor.sinifDagilimi?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Sınıf Dağılımı</p>
                  {rapor.sinifDagilimi.map((s) => (
                    <div key={s.sinif} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.line}`, fontSize: 12.5 }}>
                      <span>{s.sinif}. Sınıf</span>
                      <span style={{ fontWeight: 700 }}>{s.sayi} öğrenci</span>
                    </div>
                  ))}
                </div>
              )}

              {rapor.dersBazindaNet?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Ders Bazında Ortalama Net</p>
                  {rapor.dersBazindaNet.map((d) => (
                    <div key={d.ders} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.line}`, fontSize: 12.5 }}>
                      <span>{d.ders}</span>
                      <span style={{ fontWeight: 700 }}>{d.ortalama_net} net ({d.test_sayisi} test)</span>
                    </div>
                  ))}
                </div>
              )}

              {rapor.zayifKonular?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>En Çok Hata Yapılan Konular</p>
                  {rapor.zayifKonular.slice(0, 5).map((z, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.line}`, fontSize: 12 }}>
                      <span>{z.ders} · {z.alt_konu}</span>
                      <span style={{ color: "#B23A2E", fontWeight: 700 }}>{z.hata_sayisi} hata</span>
                    </div>
                  ))}
                </div>
              )}

              {rapor.ulusalKarsilastirma?.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Ulusal Denemelerde Türkiye Karşılaştırması</p>
                  {rapor.ulusalKarsilastirma.map((u) => (
                    <div key={u.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.line}` }}>
                      <p style={{ fontSize: 12, fontWeight: 700 }}>{u.ad}</p>
                      <p style={{ fontSize: 11.5, color: T.muted }}>Kurum: {u.kurum_ortalama ?? "—"} net ({u.kurum_katilimci} kişi) · Türkiye: {u.turkiye_ortalama ?? "—"} net ({u.turkiye_katilimci} kişi)</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginTop: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Öğrenciler — Sınıf/Şube</h2>
          {!ogrenciler ? <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p> : ogrenciler.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted }}>Henuz bagli bir ogrenci yok.</p>
          ) : ogrenciler.map((o) => (
            <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.line}`, padding: "8px 0" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{o.ad}</p>
                <p style={{ fontSize: 11, color: T.muted }}>{o.eposta} · {o.sinif ? `${o.sinif}. Sinif` : "Sinif belirtilmemis"}</p>
              </div>
              <input
                aria-label={`${o.ad} icin sube`}
                defaultValue={o.sube || ""}
                onBlur={(e) => subeGuncelle(o.id, e.target.value)}
                placeholder="Şube (örn. A)"
                style={{ width: 70, padding: "6px 8px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 12, textAlign: "center" }}
              />
            </div>
          ))}
        </section>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginTop: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Duyurular</h2>
          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${T.line}` }}>
            <input aria-label="Duyuru basligi" value={duyuruBaslik} onChange={(e) => setDuyuruBaslik(e.target.value)} placeholder="Duyuru Başlığı" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
            <textarea aria-label="Duyuru icerigi" value={duyuruIcerik} onChange={(e) => setDuyuruIcerik(e.target.value)} placeholder="Duyuru içeriği..." rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical" }} />
            <button onClick={duyuruEkle} disabled={duyuruYukleniyor} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {duyuruYukleniyor ? "Ekleniyor..." : "Duyuru Ekle"}
            </button>
          </div>
          {!duyurular ? <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p> : duyurular.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted }}>Henuz duyuru yok.</p>
          ) : duyurular.map((d) => (
            <div key={d.id} style={{ borderBottom: `1px solid ${T.line}`, padding: "10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{d.baslik}</p>
                <button onClick={() => duyuruSil(d.id)} style={{ background: "none", border: "none", color: "#B23A2E", fontSize: 11, cursor: "pointer" }}>Sil</button>
              </div>
              <p style={{ fontSize: 12, color: T.ink, marginTop: 4, whiteSpace: "pre-wrap" }}>{d.icerik}</p>
              <p style={{ fontSize: 10.5, color: T.muted, marginTop: 4 }}>{new Date(d.olusturulma).toLocaleDateString("tr-TR")}</p>
            </div>
          ))}
        </section>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginTop: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Kadro (Kurum Personeli)</h2>
          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${T.line}` }}>
            <input aria-label="Personel adi" value={personelAd} onChange={(e) => setPersonelAd(e.target.value)} placeholder="Ad Soyad" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
            <input aria-label="Gorevi" value={personelGorev} onChange={(e) => setPersonelGorev(e.target.value)} placeholder="Görevi (örn. Matematik Öğretmeni)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
            <input aria-label="Eposta" type="email" value={personelEposta} onChange={(e) => setPersonelEposta(e.target.value)} placeholder="E-posta (opsiyonel)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
            <button onClick={personelEkle} disabled={personelYukleniyor} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {personelYukleniyor ? "Ekleniyor..." : "Personel Ekle"}
            </button>
          </div>
          {!personel ? <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p> : personel.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted }}>Henuz personel eklenmemis.</p>
          ) : personel.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.line}`, padding: "8px 0" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{p.ad}</p>
                <p style={{ fontSize: 11, color: T.muted }}>{p.gorev || "—"}{p.eposta ? ` · ${p.eposta}` : ""}</p>
              </div>
              <button onClick={() => personelSil(p.id)} style={{ background: "none", border: "none", color: "#B23A2E", fontSize: 11, cursor: "pointer" }}>Sil</button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
