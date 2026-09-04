"use client";
import { useState } from "react";

const T = {
  bg: "#F5F5F7", page: "#fff", ink: "#1D1D1F", muted: "#76767A",
  coral: "#0974E0", line: "#E5E5EA",
};

export default function VeliGiris() {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function girisYap() {
    setHata("");
    if (!eposta.trim() || !sifre) {
      setHata("E-posta ve sifre gerekli.");
      return;
    }
    setYukleniyor(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: eposta.trim(), sifre, beniHatirla: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giris basarisiz");

      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.girisYapmis && meData.kullanici?.rol === "veli") {
        window.location.href = "/veli";
      } else {
        setHata("Bu hesap bir veli hesabi degil.");
      }
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 360, background: T.page, borderRadius: 14, padding: 24, border: `1px solid ${T.line}` }}>
        <h1 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>Karemux Veli Girişi</h1>
        <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 20, textAlign: "center" }}>Çocuğunun ilerlemesini takip et</p>

        <input
          aria-label="E-posta"
          type="email"
          value={eposta}
          onChange={(e) => setEposta(e.target.value)}
          placeholder="E-posta"
          onKeyDown={(e) => e.key === "Enter" && girisYap()}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 14 }}
        />
        <input
          aria-label="Sifre"
          type="password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          placeholder="Şifre"
          onKeyDown={(e) => e.key === "Enter" && girisYap()}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 14, fontSize: 14 }}
        />

        {hata && <p role="alert" style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}

        <button onClick={girisYap} disabled={yukleniyor} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <p style={{ fontSize: 11.5, color: T.muted, marginTop: 16, textAlign: "center" }}>
          Veli hesabın yoksa, öğrencinin öğretmeninden veya Karemux desteğinden bilgi alabilirsin.
        </p>
      </div>
    </main>
  );
}
