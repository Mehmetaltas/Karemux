"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";

const C = { yesil: "#1F3D2E", turuncu: "#FF6B5E", altin: "#E8B339", metin: "#2A2A2A", muted: "#8A8A8A" };

export default function OgretmenGiris() {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [unutumModu, setUnutumModu] = useState(false);
  const [unutumMesaj, setUnutumMesaj] = useState("");
  const router = useRouter();

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

  return (
    <div style={{ minHeight: "100vh", background: C.yesil, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 24px", maxWidth: 360, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        <p style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 4, color: C.yesil }}>Karemux</p>
        <p style={{ fontSize: 14, textAlign: "center", color: C.muted, marginBottom: 24 }}>Öğretmen Girişi</p>
        <input type="email" placeholder="E-posta" value={eposta} onChange={(e) => setEposta(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 14, boxSizing: "border-box" }} />
        <GosterGizleInput placeholder="Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && girisYap()}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 14, fontSize: 14, boxSizing: "border-box" }} />
        {hata && <p style={{ color: C.turuncu, fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}
        <button onClick={girisYap} disabled={yukleniyor || !eposta || !sifre}
          style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: C.turuncu, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>
          {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
        <button onClick={() => setUnutumModu(!unutumModu)} style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "none", color: C.muted, fontSize: 12, marginTop: 12, cursor: "pointer", textDecoration: "underline" }}>Şifremi unuttum</button>
        {unutumModu && (
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <button onClick={sifremiUnuttum} disabled={!eposta} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.turuncu}`, background: "none", color: C.turuncu, cursor: "pointer" }}>E-postama sıfırlama linki gönder</button>
            {unutumMesaj && <p style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{unutumMesaj}</p>}
          </div>
        )}
        <p style={{ fontSize: 11.5, color: C.muted, textAlign: "center", marginTop: 16 }}>Hesap bilgileriniz Karemux tarafından size özel oluşturulmuştur.</p>
      </div>
    </div>
  );
}
