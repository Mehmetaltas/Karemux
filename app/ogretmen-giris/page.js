"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";

const C = {
  paper: "#F5F3ED",
  ink: "#1E2A38",
  inkSoft: "#4A5868",
  red: "#C1443A",
  redSoft: "#F1DEDB",
  green: "#2F8F7A",
  greenSoft: "#DCEEE9",
  grid: "rgba(30,42,56,0.09)",
  displayFont: "'Archivo Black', 'Arial Black', sans-serif",
  bodyFont: "'Inter', -apple-system, 'Segoe UI', sans-serif",
};
const BRANSLAR = ["Matematik", "Türkçe", "Fen Bilimleri", "T.C. İnkılap Tarihi", "Sosyal Bilgiler", "Din Kültürü", "İngilizce", "Rehberlik"];

function KareliArkaplan({ children, style }) {
  return (
    <div style={{
      backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
      backgroundSize: "24px 24px", ...style,
    }}>
      {children}
    </div>
  );
}

export default function OgretmenGiris() {
  const [sekme, setSekme] = useState("giris");
  const [beniHatirla, setBeniHatirla] = useState(true);
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [ad, setAd] = useState("");
  const [brans, setBrans] = useState(BRANSLAR[0]);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [unutumModu, setUnutumModu] = useState(false);
  const [unutumMesaj, setUnutumMesaj] = useState("");

  useEffect(() => {
    try {
      const kayitli = localStorage.getItem("karemux_hatirla_ogretmen");
      if (kayitli) {
        const { eposta: e, sifre: s } = JSON.parse(kayitli);
        setEposta(e || "");
        setSifre(s || "");
      }
    } catch (e) {}
  }, []);
  const router = useRouter();

  async function girisYap() {
    setHata(""); setYukleniyor(true);
    try {
      const res = await fetch("/api/ogretmen/giris", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta, sifre, beniHatirla }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giris basarisiz");
      try {
        if (beniHatirla) {
          localStorage.setItem("karemux_hatirla_ogretmen", JSON.stringify({ eposta, sifre }));
        } else {
          localStorage.removeItem("karemux_hatirla_ogretmen");
        }
      } catch (e) {}
      router.push("/ogretmen");
    } catch (e) { setHata(e.message); } finally { setYukleniyor(false); }
  }

  async function kaydolYap() {
    setHata(""); setBasarili(""); setYukleniyor(true);
    try {
      const res = await fetch("/api/ogretmen/kaydol", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad, eposta, brans, sifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayit basarisiz");
      setBasarili("Kaydın alındı! Admin onayından sonra bu e-posta ve şifreyle giriş yapabilirsin.");
      setAd(""); setEposta(""); setSifre("");
    } catch (e) { setHata(e.message); } finally { setYukleniyor(false); }
  }

  async function sifremiUnuttum() {
    setUnutumMesaj("Gönderiliyor...");
    try {
      await fetch("/api/ogretmen/sifre-sifirlama-iste", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta }),
      });
      setUnutumMesaj("E-postan varsa, sıfırlama linki gönderildi. Gelen kutunu kontrol et.");
    } catch { setUnutumMesaj("Bir hata oluştu, tekrar dene."); }
  }

  return (
    <KareliArkaplan style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: C.bodyFont }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "34px 26px", maxWidth: 380, width: "100%", boxShadow: "0 6px 28px rgba(30,42,56,0.14)", border: `1px solid ${C.grid}` }}>
        <p style={{ fontFamily: C.displayFont, fontSize: 22, textAlign: "center", marginBottom: 4, color: C.ink }}>Karemux</p>
        <p style={{ fontSize: 13.5, textAlign: "center", color: C.inkSoft, marginBottom: 22 }}>Öğretmen Paneli</p>

        <div style={{ display: "flex", marginBottom: 20, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.ink}` }}>
          <button onClick={() => { setSekme("giris"); setHata(""); setBasarili(""); }} style={{ flex: 1, padding: "9px 0", border: "none", background: sekme === "giris" ? C.ink : "#fff", color: sekme === "giris" ? "#fff" : C.ink, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Giriş Yap</button>
          <button onClick={() => { setSekme("kaydol"); setHata(""); setBasarili(""); }} style={{ flex: 1, padding: "9px 0", border: "none", background: sekme === "kaydol" ? C.ink : "#fff", color: sekme === "kaydol" ? "#fff" : C.ink, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Kaydol</button>
        </div>

        {sekme === "kaydol" && (
          <input placeholder="Ad Soyad" value={ad} onChange={(e) => setAd(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.grid}`, marginBottom: 10, fontSize: 14, boxSizing: "border-box", fontFamily: C.bodyFont }} />
        )}

        <input type="email" placeholder="E-posta" value={eposta} onChange={(e) => setEposta(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.grid}`, marginBottom: 10, fontSize: 14, boxSizing: "border-box", fontFamily: C.bodyFont }} />

        {sekme === "kaydol" && (
          <select value={brans} onChange={(e) => setBrans(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.grid}`, marginBottom: 10, fontSize: 14, boxSizing: "border-box", fontFamily: C.bodyFont }}>
            {BRANSLAR.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        )}

        <GosterGizleInput placeholder="Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (sekme === "giris" ? girisYap() : kaydolYap())}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.grid}`, marginBottom: 10, fontSize: 14, boxSizing: "border-box", fontFamily: C.bodyFont }} />

        {sekme === "giris" && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 12.5, color: C.inkSoft, cursor: "pointer" }}>
            <input type="checkbox" checked={beniHatirla} onChange={(e) => setBeniHatirla(e.target.checked)} />
            Beni hatırla (bu cihazda oturumu açık tut)
          </label>
        )}

        {hata && <p style={{ color: C.red, fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}
        {basarili && <p style={{ color: C.green, fontSize: 12.5, marginBottom: 10, fontWeight: 600 }}>{basarili}</p>}

        {sekme === "giris" ? (
          <button onClick={girisYap} disabled={yukleniyor || !eposta || !sifre}
            style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: C.red, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        ) : (
          <button onClick={kaydolYap} disabled={yukleniyor || !ad || !eposta || !sifre}
            style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: C.red, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>
            {yukleniyor ? "Kaydediliyor..." : "Kaydol"}
          </button>
        )}

        {sekme === "giris" && (
          <>
            <button onClick={() => setUnutumModu(!unutumModu)} style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "none", color: C.inkSoft, fontSize: 12, marginTop: 12, cursor: "pointer", textDecoration: "underline" }}>Şifremi unuttum</button>
            {unutumModu && (
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <button onClick={sifremiUnuttum} disabled={!eposta} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.red}`, background: "none", color: C.red, cursor: "pointer" }}>E-postama sıfırlama linki gönder</button>
                {unutumMesaj && <p style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 6 }}>{unutumMesaj}</p>}
              </div>
            )}
          </>
        )}

        <p style={{ fontSize: 11, color: C.inkSoft, textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
          Karemux öğretmen kadrosunda yer almak ister misin? <a href="/ogretmen-basvuru" style={{ color: C.green, fontWeight: 600 }}>Buradan başvurabilirsin</a> — seni tanımaktan mutluluk duyarız.
        </p>
      </div>
    </KareliArkaplan>
  );
}
