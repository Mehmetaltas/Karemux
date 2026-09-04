"use client";
import { useState } from "react";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";

const T = {
  bg: "#F5F5F7", page: "#fff", ink: "#1D1D1F", muted: "#76767A",
  coral: "#0974E0", line: "#E5E5EA",
};

export default function KurumKayit() {
  const [asama, setAsama] = useState("form");
  const [kurumAdi, setKurumAdi] = useState("");
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [yoneticiAdi, setYoneticiAdi] = useState("");
  const [kod, setKod] = useState("");
  const [kurumKodu, setKurumKodu] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function kayitOl() {
    setHata("");
    if (!kurumAdi.trim() || !eposta.trim() || !sifre) {
      setHata("Kurum adı, e-posta ve şifre gerekli.");
      return;
    }
    if (sifre.length < 6) {
      setHata("Şifre en az 6 karakter olmalı.");
      return;
    }
    setYukleniyor(true);
    try {
      const res = await fetch("/api/kurum/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kurumAdi: kurumAdi.trim(), eposta: eposta.trim(), sifre, yoneticiAdi: yoneticiAdi.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız");
      setKurumKodu(data.kurumKodu);
      setAsama("dogrulama");
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  async function dogrulamaKoduGonder() {
    setHata("");
    if (!kod.trim()) {
      setHata("Doğrulama kodu gerekli.");
      return;
    }
    setYukleniyor(true);
    try {
      const res = await fetch("/api/auth/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: kod.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Doğrulama başarısız");
      window.location.href = "/kurum";
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: T.page, borderRadius: 14, padding: 24, border: `1px solid ${T.line}` }}>
        {asama === "form" ? (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>Kurum Kaydı</h1>
            <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 20, textAlign: "center" }}>Okulun / dershanen için Karemux hesabı oluştur</p>

            <input
              aria-label="Kurum adı"
              value={kurumAdi}
              onChange={(e) => setKurumAdi(e.target.value)}
              placeholder="Kurum Adı (örn. Karemux Koleji)"
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 14 }}
            />
            <input
              aria-label="Yetkili adı"
              value={yoneticiAdi}
              onChange={(e) => setYoneticiAdi(e.target.value)}
              placeholder="Yetkili Adı (opsiyonel)"
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 14 }}
            />
            <input
              aria-label="E-posta"
              type="email"
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              placeholder="E-posta"
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 14 }}
            />
            <GosterGizleInput
              aria-label="Sifre"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="Şifre (en az 6 karakter)"
              onKeyDown={(e) => e.key === "Enter" && kayitOl()}
              style={{ boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 14, fontSize: 14 }}
            />

            {hata && <p role="alert" style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}

            <button onClick={kayitOl} disabled={yukleniyor} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>
              {yukleniyor ? "Kayıt yapılıyor..." : "Kurum Kaydı Oluştur"}
            </button>

            <p style={{ fontSize: 11.5, color: T.muted, textAlign: "center" }}>
              Zaten hesabın var mı? <a href="/kurum-giris" style={{ color: T.coral, fontWeight: 600 }}>Giriş yap</a>
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>E-postanı Doğrula</h1>
            <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 16, textAlign: "center" }}>{eposta} adresine 6 haneli bir kod gönderdik.</p>

            {kurumKodu && (
              <div role="note" style={{ background: "#FDF6E8", borderRadius: 8, padding: "10px 12px", marginBottom: 14, border: "1px solid #E8D9A8" }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 2 }}>Kurum Kodun</p>
                <p style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1 }}>{kurumKodu}</p>
                <p style={{ fontSize: 10.5, color: T.muted, marginTop: 4 }}>Öğrencilerin hesaplarını bu kurumla ilişkilendirmesi için bu kodu paylaş.</p>
              </div>
            )}

            <input
              aria-label="Dogrulama kodu"
              value={kod}
              onChange={(e) => setKod(e.target.value)}
              placeholder="6 haneli kod"
              onKeyDown={(e) => e.key === "Enter" && dogrulamaKoduGonder()}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 14, textAlign: "center", letterSpacing: 2 }}
            />

            {hata && <p role="alert" style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}

            <button onClick={dogrulamaKoduGonder} disabled={yukleniyor} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              {yukleniyor ? "Doğrulanıyor..." : "Doğrula ve Devam Et"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
