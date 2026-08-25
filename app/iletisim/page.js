"use client";
import { useState } from "react";

const C = {
  bg: "#F5F3ED", ink: "#1E2A38", inkSoft: "#4A5868", red: "#C1443A",
  line: "rgba(30,42,56,0.14)", font: "'Inter', -apple-system, 'Segoe UI', sans-serif",
};
const girdi = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: C.font, marginBottom: 12 };
const etiket = { fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 5, display: "block" };

export default function Iletisim() {
  const [form, setForm] = useState({ ad: "", eposta: "", konu: "", mesaj: "" });
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  function alan(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function gonder() {
    setHata("");
    if (!form.ad.trim() || !form.eposta.trim() || !form.mesaj.trim()) return setHata("Ad, eposta ve mesaj gerekli.");
    setYukleniyor(true);
    try {
      const res = await fetch("/api/iletisim", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGonderildi(true);
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  if (gonderildi) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.font, padding: 24, textAlign: "center" }}>
        <div>
          <p style={{ fontSize: 40, marginBottom: 12 }}>✅</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Mesajın Gönderildi</p>
          <p style={{ fontSize: 13.5, color: C.inkSoft, maxWidth: 320 }}>En kısa sürede sana geri döneceğiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.font, color: C.ink, padding: "32px 20px" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <p style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Bize Ulaş</p>
        <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 24 }}>Sorun, öneri veya iş birliği için buradan yazabilirsin.</p>

        <label style={etiket}>Ad Soyad</label>
        <input value={form.ad} onChange={(e) => alan("ad", e.target.value)} style={girdi} />

        <label style={etiket}>E-posta</label>
        <input type="email" value={form.eposta} onChange={(e) => alan("eposta", e.target.value)} style={girdi} />

        <label style={etiket}>Konu (opsiyonel)</label>
        <input value={form.konu} onChange={(e) => alan("konu", e.target.value)} style={girdi} />

        <label style={etiket}>Mesaj</label>
        <textarea value={form.mesaj} onChange={(e) => alan("mesaj", e.target.value)} style={{ ...girdi, minHeight: 120 }} />

        {hata && <p style={{ color: C.red, fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}
        <button onClick={gonder} disabled={yukleniyor} style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: C.red, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {yukleniyor ? "Gönderiliyor..." : "Gönder"}
        </button>
      </div>
    </div>
  );
}
