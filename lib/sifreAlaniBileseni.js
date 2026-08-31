"use client";
import { useState } from "react";

// Paylasilan sifre input bileseni (31 Agustos) - goster/gizle goz ikonu
// iceriyor. Tum giris formlari (ogretmen/admin/istihbarat/ogrenci) bunu
// kullanir, her yerde ayri ayri yazilmaz.
export function GosterGizleInput({ style, ...props }) {
  const [gorunur, setGorunur] = useState(false);
  return (
    <div style={{ position: "relative", width: style?.width || "100%" }}>
      <input {...props} type={gorunur ? "text" : "password"} style={{ ...style, paddingRight: 40 }} />
      <button type="button" onClick={() => setGorunur(!gorunur)} tabIndex={-1}
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: 4, color: "#8A8A8A" }}>
        {gorunur ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
