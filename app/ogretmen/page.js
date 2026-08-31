"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const C = { yesil: "#1F3D2E", turuncu: "#FF6B5E", altin: "#E8B339", metin: "#2A2A2A", muted: "#8A8A8A", bg: "#FDFBF6" };

const MENU = [
  { kod: "ozet", ad: "📊 Genel Bakış", hazir: true },
  { kod: "calisma-kagidi", ad: "📄 Çalışma Kağıdı Üret", hazir: true, tur: "calisma_kagidi" },
  { kod: "soru-seti", ad: "✏️ Soru Seti Üret", hazir: true, tur: "soru_seti" },
  { kod: "yazili", ad: "🏫 Yazılı Üret (A/B)", hazir: true, tur: "yazili" },
  { kod: "fasikul", ad: "📖 Fasikül Üret", hazir: true, tur: "fasikul" },
  { kod: "ogrenme-teknikleri", ad: "🧠 Öğrenme Teknikleri", hazir: true },
];

const MATERYAL_DERSLER = ["Matematik", "Turkce", "Fen Bilimleri", "Ingilizce", "Sosyal Bilgiler", "T.C. Inkilap Tarihi", "Din Kulturu"];

function MateryalUreticisi({ tur, dersVarsayilan }) {
  const [sinif, setSinif] = useState(8);
  const [ders, setDers] = useState(dersVarsayilan || "Matematik");
  const [konu, setKonu] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);
  const [hata, setHata] = useState("");

  async function uret() {
    if (!konu.trim()) { setHata("Konu gerekli"); return; }
    setYukleniyor(true); setHata(""); setSonuc(null);
    try {
      const res = await fetch("/api/ogretmen/materyal-uret", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tur, sinif, ders, konu: konu.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSonuc(data.materyal);
    } catch (e) { setHata(e.message); } finally { setYukleniyor(false); }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <select value={sinif} onChange={(e) => setSinif(Number(e.target.value))} style={{ padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }}>
          {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
        </select>
        <select value={ders} onChange={(e) => setDers(e.target.value)} style={{ flex: 1, padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }}>
          {MATERYAL_DERSLER.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <input placeholder="Konu (örn: Üslü Sayılar)" value={konu} onChange={(e) => setKonu(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 13.5, boxSizing: "border-box" }} />
      {hata && <p style={{ color: "#FF6B5E", fontSize: 12.5, marginBottom: 8 }}>{hata}</p>}
      <button onClick={uret} disabled={yukleniyor || !konu.trim()} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: "#FF6B5E", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>
        {yukleniyor ? "Üretiliyor... (~20 sn)" : "Üret"}
      </button>

      {sonuc && (
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5DFD3", padding: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{sonuc.baslik}</p>
          {sonuc.ozet && <p style={{ fontSize: 13, lineHeight: 1.6, color: "#555", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #eee" }}>{sonuc.ozet}</p>}
          {sonuc.sorular.map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>{i + 1}. {s.soru}</p>
              {(s.secenekler || []).map((sec, j) => (
                <p key={j} style={{ fontSize: 13, margin: "3px 0 3px 10px", fontWeight: j === s.dogruIndex ? 700 : 400, color: j === s.dogruIndex ? "#1F3D2E" : "#333" }}>
                  {sec}{j === s.dogruIndex ? " ✓" : ""}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
        {["calisma-kagidi", "soru-seti", "yazili", "fasikul"].includes(sekme) && (
          <MateryalUreticisi tur={MENU.find((m) => m.kod === sekme)?.tur} dersVarsayilan={ogretmen.brans} />
        )}
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
