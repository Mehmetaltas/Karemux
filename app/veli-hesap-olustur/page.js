"use client";
import { useState, useEffect } from "react";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";

export default function VeliHesapOlustur() {
  const [token, setToken] = useState(null);
  const [dogrulaniyor, setDogrulaniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [ogrenciAdi, setOgrenciAdi] = useState("");
  const [veliEposta, setVeliEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [tamamlandi, setTamamlandi] = useState(false);

  useEffect(() => {
    const t = new URL(window.location.href).searchParams.get("token");
    if (!t) { setHata("Bağlantı eksik veya hatalı."); setDogrulaniyor(false); return; }
    setToken(t);
    fetch(`/api/auth/veli-hesap-dogrula?token=${encodeURIComponent(t)}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) { setHata(d.error || "Bağlantı geçersiz."); return; }
        setOgrenciAdi(d.ogrenciAdi); setVeliEposta(d.veliEposta);
      })
      .catch(() => setHata("Bağlantı kurulamadı, tekrar dene."))
      .finally(() => setDogrulaniyor(false));
  }, []);

  async function gonder() {
    setHata("");
    if (sifre.length < 6) { setHata("Şifre en az 6 karakter olmalı."); return; }
    if (sifre !== sifreTekrar) { setHata("Şifreler eşleşmiyor."); return; }
    setYukleniyor(true);
    try {
      const res = await fetch("/api/auth/veli-hesap-olustur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTamamlandi(true);
      setTimeout(() => { window.location.href = "/veli-giris"; }, 1800);
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E5EA", padding: "32px 24px", maxWidth: 380, width: "100%" }}>
        {dogrulaniyor ? (
          <p aria-live="polite" style={{ textAlign: "center", color: "#76767A", fontSize: 14 }}>Doğrulanıyor...</p>
        ) : tamamlandi ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>✓</p>
            <h1 style={{ fontSize: 18, marginBottom: 6 }}>Hesabın hazır</h1>
            <p style={{ fontSize: 13, color: "#76767A" }}>Giriş sayfasına yönlendiriliyorsun...</p>
          </div>
        ) : hata && !ogrenciAdi ? (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>Bağlantı geçersiz</h1>
            <p style={{ fontSize: 13.5, color: "#76767A" }}>{hata}</p>
            <a href="/veli-giris" style={{ display: "inline-block", marginTop: 16, color: "#0974E0", fontWeight: 600, fontSize: 13.5, textDecoration: "none" }}>Giriş sayfasına git</a>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <span style={{ fontSize: 22 }}>👪</span>
              </div>
              <h1 style={{ fontSize: 18, marginBottom: 4 }}>Veli hesabını oluştur</h1>
              <p style={{ fontSize: 13, color: "#76767A", margin: 0 }}><strong>{ogrenciAdi}</strong> onaylandı. Kendi hesabını kurmak için bir şifre belirle.</p>
            </div>

            <label style={{ fontSize: 12.5, color: "#76767A", display: "block", marginBottom: 6 }}>E-posta</label>
            <input value={veliEposta} disabled aria-label="E-posta" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #E5E5EA", marginBottom: 12, background: "#F5F5F7", color: "#76767A" }} />

            <label style={{ fontSize: 12.5, color: "#76767A", display: "block", marginBottom: 6 }}>Şifre belirle</label>
            <GosterGizleInput placeholder="En az 6 karakter" value={sifre} onChange={(e) => setSifre(e.target.value)} aria-label="Şifre"
              style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #E5E5EA", marginBottom: 12 }} />

            <label style={{ fontSize: 12.5, color: "#76767A", display: "block", marginBottom: 6 }}>Şifreyi tekrar gir</label>
            <GosterGizleInput placeholder="Şifreni tekrar yaz" value={sifreTekrar} onChange={(e) => setSifreTekrar(e.target.value)} aria-label="Şifre tekrar"
              style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #E5E5EA", marginBottom: 16 }} />

            {hata && <p role="alert" style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{hata}</p>}

            <button onClick={gonder} disabled={yukleniyor || !sifre || !sifreTekrar} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: "#0974E0", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: (yukleniyor || !sifre || !sifreTekrar) ? 0.5 : 1 }}>
              {yukleniyor ? "Oluşturuluyor..." : "Hesabı oluştur ve giriş yap"}
            </button>

            <p style={{ fontSize: 12, color: "#76767A", textAlign: "center", marginTop: 16 }}>
              Zaten bir Karemux hesabın var mı? <a href="/veli-giris" style={{ color: "#0974E0" }}>Giriş yap</a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
