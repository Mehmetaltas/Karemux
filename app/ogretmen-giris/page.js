"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";

const C = { yesil: "#1F3D2E", turuncu: "#FF6B5E", altin: "#E8B339", metin: "#2A2A2A", muted: "#8A8A8A" };
const BRANSLAR = ["Matematik", "Türkçe", "Fen Bilimleri", "T.C. İnkılap Tarihi", "Sosyal Bilgiler", "Din Kültürü", "İngilizce", "Rehberlik"];

export default function OgretmenGiris() {
  const [sekme, setSekme] = useState("giris"); // "giris" | "kaydol"
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [ad, setAd] = useState("");
  const [brans, setBrans] = useState(BRANSLAR[0]);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [unutumModu, setUnutumModu] = useState(false);
  const [unutumMesaj, setUnutumMesaj] = useState("");
  const router = useRouter();

  async function girisYap() {
    setHata(""); setYukleniyor(true);
    try {
      const res = await fetch("/api/ogretmen/giris", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta, sifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giris basarisiz");
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
    <div style={{ minHeight: "100vh", background: C.yesil, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 24px", maxWidth: 360, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        <p style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 4, color: C.yesil }}>Karemux</p>
        <p style={{ fontSize: 14, textAlign: "center", color: C.muted, marginBottom: 20 }}>Öğretmen Paneli</p>

        <div style={{ display: "flex", marginBottom: 20, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.yesil}` }}>
          <button onClick={() => { setSekme("giris"); setHata(""); setBasarili(""); }} style={{ flex: 1, padding: "9px 0", border: "none", background: sekme === "giris" ? C.yesil : "#fff", color: sekme === "giris" ? "#fff" : C.yesil, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Giriş Yap</button>
          <button onClick={() => { setSekme("kaydol"); setHata(""); setBasarili(""); }} style={{ flex: 1, padding: "9px 0", border: "none", background: sekme === "kaydol" ? C.yesil : "#fff", color: sekme === "kaydol" ? "#fff" : C.yesil, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Kaydol</button>
        </div>

        {sekme === "kaydol" && (
          <input placeholder="Ad Soyad" value={ad} onChange={(e) => setAd(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 14, boxSizing: "border-box" }} />
        )}

        <input type="email" placeholder="E-posta" value={eposta} onChange={(e) => setEposta(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 14, boxSizing: "border-box" }} />

        {sekme === "kaydol" && (
          <select value={brans} onChange={(e) => setBrans(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 14, boxSizing: "border-box" }}>
            {BRANSLAR.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        )}

        <GosterGizleInput placeholder="Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (sekme === "giris" ? girisYap() : kaydolYap())}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 14, fontSize: 14, boxSizing: "border-box" }} />

        {hata && <p style={{ color: C.turuncu, fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}
        {basarili && <p style={{ color: C.yesil, fontSize: 12.5, marginBottom: 10, fontWeight: 600 }}>{basarili}</p>}

        {sekme === "giris" ? (
          <button onClick={girisYap} disabled={yukleniyor || !eposta || !sifre}
            style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: C.turuncu, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        ) : (
          <button onClick={kaydolYap} disabled={yukleniyor || !ad || !eposta || !sifre}
            style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: C.turuncu, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>
            {yukleniyor ? "Kaydediliyor..." : "Kaydol"}
          </button>
        )}

        {sekme === "giris" && (
          <>
            <button onClick={() => setUnutumModu(!unutumModu)} style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "none", color: C.muted, fontSize: 12, marginTop: 12, cursor: "pointer", textDecoration: "underline" }}>Şifremi unuttum</button>
            {unutumModu && (
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <button onClick={sifremiUnuttum} disabled={!eposta} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.turuncu}`, background: "none", color: C.turuncu, cursor: "pointer" }}>E-postama sıfırlama linki gönder</button>
                {unutumMesaj && <p style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{unutumMesaj}</p>}
              </div>
            )}
          </>
        )}

        <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 18 }}>
          Ders vermek/gelir elde etmek için <a href="/ogretmen-basvuru" style={{ color: C.yesil, fontWeight: 600 }}>iş başvurusu</a> ayrı bir süreçtir.
        </p>
      </div>
    </div>
  );
}
