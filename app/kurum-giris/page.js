"use client";
import { useState } from "react";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";

const T = {
  bg: "#F5F5F7", page: "#fff", ink: "#1D1D1F", muted: "#76767A",
  coral: "#0974E0", line: "#E5E5EA",
};

export default function KurumGiris() {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [beniHatirla, setBeniHatirla] = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [sifremiUnuttumAcik, setSifremiUnuttumAcik] = useState(false);
  const [sifremiUnuttumEposta, setSifremiUnuttumEposta] = useState("");
  const [sifremiUnuttumMesaj, setSifremiUnuttumMesaj] = useState("");
  const [sifremiUnuttumYukleniyor, setSifremiUnuttumYukleniyor] = useState(false);
  const [sifremiUnuttumKodGonderildi, setSifremiUnuttumKodGonderildi] = useState(false);
  const [sifremiUnuttumKod, setSifremiUnuttumKod] = useState("");
  const [sifremiUnuttumYeniSifre, setSifremiUnuttumYeniSifre] = useState("");

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
        body: JSON.stringify({ eposta: eposta.trim(), sifre, beniHatirla }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giris basarisiz");

      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.girisYapmis && meData.kullanici?.rol === "kurum_yoneticisi") {
        window.location.href = "/kurum";
      } else {
        setHata("Bu hesap bir kurum yoneticisi hesabi degil.");
      }
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  async function sifremiUnuttumGonder() {
    setSifremiUnuttumMesaj("");
    if (!sifremiUnuttumEposta.trim()) {
      setSifremiUnuttumMesaj("E-posta gerekli.");
      return;
    }
    setSifremiUnuttumYukleniyor(true);
    try {
      const res = await fetch("/api/auth/sifre-sifirlama-iste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: sifremiUnuttumEposta.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gonderilemedi");
      setSifremiUnuttumKodGonderildi(true);
      setSifremiUnuttumMesaj("Eger bu eposta kayitliysa, 6 haneli bir kod gonderildi.");
    } catch (e) {
      setSifremiUnuttumMesaj(e.message);
    } finally {
      setSifremiUnuttumYukleniyor(false);
    }
  }

  async function sifreYenile() {
    setSifremiUnuttumMesaj("");
    if (!sifremiUnuttumKod.trim() || !sifremiUnuttumYeniSifre) {
      setSifremiUnuttumMesaj("Kod ve yeni sifre gerekli.");
      return;
    }
    setSifremiUnuttumYukleniyor(true);
    try {
      const res = await fetch("/api/auth/sifre-sifirlama-tamamla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: sifremiUnuttumEposta.trim(), kod: sifremiUnuttumKod.trim(), yeniSifre: sifremiUnuttumYeniSifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSifremiUnuttumMesaj("Sifren guncellendi, simdi yeni sifrenle giris yapabilirsin.");
      setSifremiUnuttumKodGonderildi(false);
      setSifremiUnuttumAcik(false);
      setSifremiUnuttumKod("");
      setSifremiUnuttumYeniSifre("");
    } catch (e) {
      setSifremiUnuttumMesaj(e.message);
    } finally {
      setSifremiUnuttumYukleniyor(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 360, background: T.page, borderRadius: 14, padding: 24, border: `1px solid ${T.line}` }}>
        <h1 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>Karemux Kurum Girişi</h1>
        <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 20, textAlign: "center" }}>Okul / dershane yönetim paneli</p>

        {!sifremiUnuttumAcik ? (
          <>
            <input
              aria-label="E-posta"
              type="email"
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              placeholder="E-posta"
              onKeyDown={(e) => e.key === "Enter" && girisYap()}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 14 }}
            />
            <GosterGizleInput
              aria-label="Sifre"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="Şifre"
              onKeyDown={(e) => e.key === "Enter" && girisYap()}
              style={{ boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, marginBottom: 8 }}
            />

            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: T.muted, marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={beniHatirla} onChange={(e) => setBeniHatirla(e.target.checked)} />
              Beni hatırla
            </label>

            {hata && <p role="alert" style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}

            <button onClick={girisYap} disabled={yukleniyor} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 10 }}>
              {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>

            <button
              type="button"
              onClick={() => { setSifremiUnuttumAcik(true); setSifremiUnuttumEposta(eposta); }}
              style={{ width: "100%", background: "none", border: "none", color: T.coral, fontSize: 12.5, cursor: "pointer", textAlign: "center", marginBottom: 10 }}
            >
              Şifremi Unuttum
            </button>
            <p style={{ fontSize: 11.5, color: T.muted, textAlign: "center" }}>
              Hesabın yok mu? <a href="/kurum-kayit" style={{ color: T.coral, fontWeight: 600 }}>Kurum Kaydı Oluştur</a>
            </p>
          </>
        ) : (
          <>
            {!sifremiUnuttumKodGonderildi ? (
              <>
                <p style={{ fontSize: 13, marginBottom: 12 }}>Kayıtlı e-postana 6 haneli bir kod göndereceğiz.</p>
                <input
                  aria-label="Sifirlama icin e-posta"
                  type="email"
                  value={sifremiUnuttumEposta}
                  onChange={(e) => setSifremiUnuttumEposta(e.target.value)}
                  placeholder="Kayıtlı e-postan"
                  onKeyDown={(e) => e.key === "Enter" && sifremiUnuttumGonder()}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 14 }}
                />
                {sifremiUnuttumMesaj && <p role="alert" style={{ fontSize: 12.5, color: T.muted, marginBottom: 10 }}>{sifremiUnuttumMesaj}</p>}
                <button onClick={sifremiUnuttumGonder} disabled={sifremiUnuttumYukleniyor} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 10 }}>
                  {sifremiUnuttumYukleniyor ? "Gönderiliyor..." : "Kod Gönder"}
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, marginBottom: 12 }}>E-postana gelen 6 haneli kodu ve yeni şifreni gir.</p>
                <input
                  aria-label="Dogrulama kodu"
                  value={sifremiUnuttumKod}
                  onChange={(e) => setSifremiUnuttumKod(e.target.value)}
                  placeholder="6 haneli kod"
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 14, textAlign: "center", letterSpacing: 2 }}
                />
                <GosterGizleInput
                  aria-label="Yeni sifre"
                  value={sifremiUnuttumYeniSifre}
                  onChange={(e) => setSifremiUnuttumYeniSifre(e.target.value)}
                  placeholder="Yeni şifre (en az 6 karakter)"
                  onKeyDown={(e) => e.key === "Enter" && sifreYenile()}
                  style={{ boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 14 }}
                />
                {sifremiUnuttumMesaj && <p role="alert" style={{ fontSize: 12.5, color: sifremiUnuttumMesaj.includes("guncellendi") ? "#2E7D4F" : T.muted, marginBottom: 10 }}>{sifremiUnuttumMesaj}</p>}
                <button onClick={sifreYenile} disabled={sifremiUnuttumYukleniyor} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 10 }}>
                  {sifremiUnuttumYukleniyor ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                </button>
              </>
            )}
            <button type="button" onClick={() => { setSifremiUnuttumAcik(false); setSifremiUnuttumKodGonderildi(false); setSifremiUnuttumMesaj(""); }} style={{ width: "100%", background: "none", border: "none", color: T.muted, fontSize: 12.5, cursor: "pointer", textAlign: "center" }}>
              ← Girişe Dön
            </button>
          </>
        )}
      </div>
    </main>
  );
}
