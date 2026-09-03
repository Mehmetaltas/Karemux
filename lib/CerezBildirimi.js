"use client";
import { useState, useEffect } from "react";

// Tum panellerde (ogrenci/ogretmen/admin) kullanilabilecek paylasilan
// KVKK/cerez bildirim seridi (3 Eylul).
export default function CerezBildirimi({ renkler }) {
  const [goster, setGoster] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("kx_cerez_onay")) setGoster(true);
    } catch {}
  }, []);

  function kabulEt() {
    try { localStorage.setItem("kx_cerez_onay", "1"); } catch {}
    setGoster(false);
  }

  if (!goster) return null;
  const r = renkler || { bg: "#1F3D2E", metin: "#fff", buton: "#FF6B5E" };

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: r.bg, color: r.metin, padding: "12px 16px", zIndex: 100, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12.5, boxShadow: "0 -2px 12px rgba(0,0,0,0.15)" }}>
      <p style={{ flex: 1, minWidth: 200, margin: 0 }}>
        Bu site, oturumunuzu açık tutmak için zorunlu, teknik bir çerez kullanır. Detaylar için{" "}
        <a href="/gizlilik" style={{ color: r.buton, textDecoration: "underline" }}>Gizlilik Politikası</a>'na bakabilirsiniz.
      </p>
      <button onClick={kabulEt} style={{ background: r.buton, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
        Anladım
      </button>
    </div>
  );
}
