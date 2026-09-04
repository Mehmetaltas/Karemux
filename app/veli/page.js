"use client";
import { useState, useEffect } from "react";

const T = {
  bg: "#F5F5F7", page: "#fff", ink: "#1D1D1F", muted: "#76767A",
  coral: "#0974E0", line: "#E5E5EA", mustard: "#A36606",
};

export default function VeliPaneli() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullanici, setKullanici] = useState(null);
  const [ogrenciler, setOgrenciler] = useState(null);
  const [baglantiKodu, setBaglantiKodu] = useState("");
  const [baglantiMesaj, setBaglantiMesaj] = useState("");
  const [paketler, setPaketler] = useState(null);
  const [acikPaketOgrenci, setAcikPaketOgrenci] = useState(null);
  const [havaleBilgi, setHavaleBilgi] = useState(null);
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.girisYapmis || data.kullanici?.rol !== "veli") {
          window.location.href = "/veli-giris";
          return;
        }
        setKullanici(data.kullanici);
        await ogrencileriGetir();
        try {
          const pRes = await fetch("/api/paketler");
          const pData = await pRes.json();
          if (pRes.ok) setPaketler(pData.paketler || []);
        } catch {}
      } finally {
        setYukleniyor(false);
      }
    })();
  }, []);

  async function ogrencileriGetir() {
    try {
      const res = await fetch("/api/veli/ilerleme");
      const data = await res.json();
      if (res.ok) setOgrenciler(data.ogrenciler || []);
    } catch {}
  }

  async function baglan() {
    setBaglantiMesaj("");
    try {
      const res = await fetch("/api/veli/baglan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: baglantiKodu }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBaglantiMesaj(`${data.ogrenciAdi} adli ogrenciye baglandin.`);
      setBaglantiKodu("");
      ogrencileriGetir();
    } catch (e) {
      setBaglantiMesaj(e.message || "Baglanti kurulamadi");
    }
  }

  async function havaleIleSatinAl(ogrenciId, plan) {
    setHata(""); setHavaleBilgi(null);
    setIslemYukleniyor(plan);
    try {
      const res = await fetch("/api/veli/havale-baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ogrenciId, plan }),
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
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}><p aria-live="polite" style={{ color: T.muted }}>Yonlendiriliyor...</p></main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Veli Paneli</h1>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Ogrenci Bagla</h2>
          <div style={{ display: "flex", gap: 6 }}>
            <input aria-label="Ogrencinin baglanti kodu" value={baglantiKodu} onChange={(e) => setBaglantiKodu(e.target.value)} placeholder="Ogrencinin baglanti kodu" style={{ flex: 1, padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 13 }} />
            <button onClick={baglan} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Bagla</button>
          </div>
          {baglantiMesaj && <p style={{ fontSize: 12, marginTop: 8, color: T.muted }}>{baglantiMesaj}</p>}
        </section>

        {!ogrenciler ? (
          <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p>
        ) : ogrenciler.length === 0 ? (
          <p style={{ fontSize: 13, color: T.muted }}>Henuz bagli bir ogrenci yok.</p>
        ) : ogrenciler.map((o) => (
          <section key={o.ogrenci.id} style={{ background: T.page, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${T.line}` }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{o.ogrenci.ad} <span style={{ fontWeight: 400, color: T.muted, fontSize: 12 }}>({o.ogrenci.sinif}. sinif)</span></h2>
            <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 8 }}>{o.oneri}</p>
            {o.zayifDersler.length > 0 && (
              <p style={{ fontSize: 12, color: T.coral, marginBottom: 8 }}>Zayif dersler: {o.zayifDersler.join(", ")}</p>
            )}
            <p style={{ fontSize: 11.5, color: T.muted, marginBottom: 12 }}>Bu hafta aktif gun: {o.buHaftaAktifGun}/7</p>

            <button onClick={() => { setAcikPaketOgrenci(acikPaketOgrenci === o.ogrenci.id ? null : o.ogrenci.id); setHavaleBilgi(null); setHata(""); }} style={{ padding: "8px 14px", borderRadius: 6, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              {acikPaketOgrenci === o.ogrenci.id ? "Paketleri Gizle" : "Bu Ogrenci Icin Paket Satin Al"}
            </button>

            {acikPaketOgrenci === o.ogrenci.id && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                {!paketler ? (
                  <p style={{ fontSize: 12, color: T.muted }}>Paketler yukleniyor...</p>
                ) : paketler.filter((p) => !p.anahtar?.startsWith("yillik_") || p.anahtar === ({ 5: "yillik_5_sinif", 6: "yillik_6_sinif", 7: "yillik_7_sinif", 8: "yillik_8_sinif_lgs" }[o.ogrenci.sinif])).map((p) => (
                  <div key={p.anahtar} style={{ marginBottom: 8 }}>
                    <button onClick={() => havaleIleSatinAl(o.ogrenci.id, p.anahtar)} disabled={islemYukleniyor === p.anahtar} style={{ width: "100%", padding: "9px 0", borderRadius: 6, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                      {islemYukleniyor === p.anahtar ? "Hazirlaniyor..." : `🏦 ${p.ad} — ${Number(p.fiyat_tl).toLocaleString("tr-TR")}₺`}
                    </button>
                  </div>
                ))}
                {hata && <p style={{ color: "#B23A2E", fontSize: 12.5, marginTop: 6 }}>{hata}</p>}
                {havaleBilgi && (
                  <div role="alert" style={{ background: "#FFF8E8", border: `1.5px solid ${T.mustard}`, borderRadius: 10, padding: 14, marginTop: 10 }}>
                    <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Havale/EFT Bilgileri</p>
                    <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Banka:</b> {havaleBilgi.bankaAdi}</p>
                    <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Hesap Sahibi:</b> {havaleBilgi.hesapSahibi}</p>
                    <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>IBAN:</b> {havaleBilgi.iban}</p>
                    <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Tutar:</b> {havaleBilgi.tutar}₺</p>
                    <p style={{ fontSize: 12.5, marginBottom: 0, color: "#B23A2E", fontWeight: 700 }}>Aciklama alanina MUTLAKA su kodu yaz: {havaleBilgi.referans}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
