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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.girisYapmis || data.kullanici?.rol !== "kurum_yoneticisi") {
          setYukleniyor(false);
          return;
        }
        setKullanici(data.kullanici);
        await Promise.all([kurumGetir(), denemeleriGetir()]);
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
        body: JSON.stringify({ vergiNo, vergiDairesi, yetkiliUnvan }),
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

  if (yukleniyor) {
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}><p aria-live="polite" style={{ color: T.muted }}>Yukleniyor...</p></main>;
  }

  if (!kullanici) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, padding: 24, textAlign: "center" }}>
        <p style={{ color: T.muted, fontSize: 14 }}>Bu sayfa sadece giris yapmis kurum yoneticileri icindir. Once ana sayfadan giris yap.</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Kurum Paneli</h1>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>{kurum?.ad}</p>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Fatura / Vergi Bilgileri</h2>
          <input aria-label="Vergi numarasi" value={vergiNo} onChange={(e) => setVergiNo(e.target.value)} placeholder="Vergi Numarasi (10 hane)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
          <input aria-label="Vergi dairesi" value={vergiDairesi} onChange={(e) => setVergiDairesi(e.target.value)} placeholder="Vergi Dairesi" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13 }} />
          <input aria-label="Yetkili unvani" value={yetkiliUnvan} onChange={(e) => setYetkiliUnvan(e.target.value)} placeholder="Yetkili Unvani (opsiyonel)" style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 13 }} />
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
      </div>
    </main>
  );
}
