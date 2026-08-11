"use client";
import { useState } from "react";

export default function SeslendirmeAdmin() {
  const [metin, setMetin] = useState("");
  const [sesId, setSesId] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [sesUrl, setSesUrl] = useState(null);
  const [dosyaAdi, setDosyaAdi] = useState("slayt");

  async function seslendir() {
    if (!metin.trim()) { setHata("Metin bos olamaz"); return; }
    setYukleniyor(true); setHata(""); setSesUrl(null);
    try {
      const res = await fetch("/api/seslendirme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metin, sesId: sesId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seslendirme basarisiz");
      const byteDizisi = Uint8Array.from(atob(data.sesBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([byteDizisi], { type: data.mediaType || "audio/mpeg" });
      setSesUrl(URL.createObjectURL(blob));
    } catch (e) {
      setHata(e.message || "Bir hata olustu");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>🔊 Seslendirme Aracı (Admin)</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Slayt metnini yapıştır, seslendir, indir. Video üretimi için kullanılır.
      </p>

      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Ses ID (boş bırakılırsa varsayılan kullanılır)</label>
      <input value={sesId} onChange={(e) => setSesId(e.target.value)} placeholder="ElevenLabs Voice ID (opsiyonel)"
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 16, fontSize: 14 }} />

      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Dosya adı (indirirken)</label>
      <input value={dosyaAdi} onChange={(e) => setDosyaAdi(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 16, fontSize: 14 }} />

      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Metin</label>
      <textarea value={metin} onChange={(e) => setMetin(e.target.value)} rows={6}
        placeholder="Slayt metnini buraya yapıştır..."
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 14, marginBottom: 16, fontFamily: "inherit" }} />

      <button onClick={seslendir} disabled={yukleniyor}
        style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: "#1F3D2E", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        {yukleniyor ? "Seslendiriliyor..." : "🔊 Seslendir"}
      </button>

      {hata && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 12, fontWeight: 600 }}>{hata}</p>}

      {sesUrl && (
        <div style={{ marginTop: 20, padding: 16, background: "#f5f5f0", borderRadius: 10 }}>
          <audio controls src={sesUrl} style={{ width: "100%", marginBottom: 10 }} />
          <a href={sesUrl} download={`${dosyaAdi || "ses"}.mp3`}
            style={{ display: "inline-block", padding: "8px 16px", borderRadius: 8, background: "#E8B339", color: "#1F3D2E", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            ⬇️ MP3 İndir
          </a>
        </div>
      )}
    </div>
  );
}
