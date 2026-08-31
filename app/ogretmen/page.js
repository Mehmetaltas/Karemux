"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const C = { yesil: "#1F3D2E", turuncu: "#FF6B5E", altin: "#E8B339", metin: "#2A2A2A", muted: "#8A8A8A", bg: "#FDFBF6" };

const MENU = [
  { kod: "ozet", ad: "📊 Genel Bakış", hazir: true },
  { kod: "calisma-kagidi", ad: "📄 Çalışma Kağıdı Üret", hazir: false },
  { kod: "soru-seti", ad: "✏️ Soru Seti Üret", hazir: false },
  { kod: "yazili", ad: "🏫 Yazılı Üret (A/B)", hazir: false },
  { kod: "fasikul", ad: "📖 Fasikül Üret", hazir: false },
  { kod: "ogrenme-teknikleri", ad: "🧠 Öğrenme Teknikleri", hazir: true },
];

export default function OgretmenPanel() {
  const [ogretmen, setOgretmen] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const [sekme, setSekme] = useState("ozet");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/ogretmen/ben").then((r) => {
      if (!r.ok) { router.push("/ogretmen-giris"); return null; }
      return r.json();
    }).then((d) => { if (d) setOgretmen(d.ogretmen); });
  }, []);

  async function cikisYap() {
    await fetch("/api/ogretmen/cikis", { method: "POST" });
    router.push("/ogretmen-giris");
  }

  if (!ogretmen) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Yükleniyor...</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: C.yesil, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setMenuAcik(true)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>☰</button>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Karemux Öğretmen</p>
        <div style={{ width: 22 }} />
      </div>

      {menuAcik && (
        <div onClick={() => setMenuAcik(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: 260, height: "100%", padding: "20px 16px", boxShadow: "2px 0 12px rgba(0,0,0,0.15)" }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ogretmen.ad}</p>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{ogretmen.brans}</p>
            {MENU.map((m) => (
              <button key={m.kod} onClick={() => { setSekme(m.kod); setMenuAcik(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 10px", borderRadius: 8, border: "none", background: sekme === m.kod ? "#FEF8E8" : "transparent", color: m.hazir ? C.metin : C.muted, fontSize: 13.5, fontWeight: sekme === m.kod ? 700 : 500, cursor: "pointer", marginBottom: 2 }}>
                {m.ad}{!m.hazir && <span style={{ fontSize: 10, marginLeft: 6, color: C.turuncu }}>(yakında)</span>}
              </button>
            ))}
            <button onClick={cikisYap} style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 10px", borderRadius: 8, border: "none", background: "none", color: C.turuncu, fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginTop: 20 }}>
              Çıkış Yap
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        {sekme === "ozet" && (
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Hoş geldin, {ogretmen.ad}</p>
            <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 20 }}>{ogretmen.brans} branşında Karemux materyal araçlarına erişimin var.</p>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5DFD3", padding: 16 }}>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Çalışma kağıdı, soru seti, yazılı ve fasikül üretim araçları yakında burada olacak. Şimdilik Öğrenme Teknikleri Kütüphanesi'ne göz atabilirsin.</p>
            </div>
          </div>
        )}
        {sekme === "ogrenme-teknikleri" && <OgretmenTeknikGorunumu />}
        {!MENU.find((m) => m.kod === sekme)?.hazir && sekme !== "ozet" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5DFD3", padding: 20, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: C.muted }}>Bu araç yakında eklenecek.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const DERSLER = ["Matematik", "Turkce", "Fen Bilimleri", "Ingilizce", "Sosyal Bilgiler", "T.C. Inkilap Tarihi", "Din Kulturu"];

function OgretmenTeknikGorunumu() {
  const [ders, setDers] = useState("Matematik");
  const [liste, setListe] = useState(null);
  useEffect(() => {
    fetch(`/api/ogrenme-teknikleri?ders=${encodeURIComponent(ders)}`).then((r) => r.json()).then((d) => setListe(d.teknikler || []));
  }, [ders]);
  return (
    <div>
      <select value={ders} onChange={(e) => setDers(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 14, fontSize: 13.5 }}>
        {DERSLER.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      {liste === null ? <p style={{ fontSize: 13, color: C.muted }}>Yükleniyor...</p> : liste.length === 0 ? (
        <p style={{ fontSize: 13, color: C.muted }}>Bu ders için henüz teknik eklenmedi.</p>
      ) : liste.map((t, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5DFD3", padding: 14, marginBottom: 10 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: C.turuncu, marginBottom: 4 }}>{t.teknik_adi}</p>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>{t.aciklama}</p>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: C.muted, fontStyle: "italic" }}>{t.nasil_uygulanir}</p>
        </div>
      ))}
    </div>
  );
}
