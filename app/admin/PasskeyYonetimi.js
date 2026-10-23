"use client";
import { useEffect, useState } from "react";

// Personel hesabi: parmak izi / yuz / guvenlik anahtari (passkey) ikinci adimini ekle-kaldir.
export default function PasskeyYonetimi({ T }) {
  const [liste, setListe] = useState(null);
  const [ad, setAd] = useState("");
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");
  const [bekle, setBekle] = useState(false);

  async function yukle() {
    try {
      const r = await fetch("/api/personel/passkey/liste");
      const d = await r.json();
      if (r.ok) setListe(d.passkeyler);
    } catch (e) {}
  }
  useEffect(() => { yukle(); }, []);

  async function ekle() {
    setHata(""); setBilgi(""); setBekle(true);
    try {
      if (!window.PublicKeyCredential) throw new Error("Bu tarayıcı passkey desteklemiyor.");
      const { startRegistration } = await import("@simplewebauthn/browser");
      const b = await fetch("/api/personel/passkey/kayit-baslat", { method: "POST" });
      const opts = await b.json();
      if (!b.ok) throw new Error(opts.error || "Başlatılamadı");
      const yanit = await startRegistration({ optionsJSON: opts });
      const t = await fetch("/api/personel/passkey/kayit-bitir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ yanit, ad: ad || "Cihazım" }) });
      const d = await t.json();
      if (!t.ok) throw new Error(d.error || "Kaydedilemedi");
      setBilgi("Passkey eklendi. Bundan sonra girişte şifreden sonra bu cihazla doğrulama istenir.");
      setAd(""); yukle();
    } catch (e) { setHata(e.message || "Eklenemedi"); } finally { setBekle(false); }
  }
  async function sil(id) {
    if (!window.confirm("Bu passkey kaldırılsın mı? Hiç passkey kalmazsa giriş yalnızca şifreyle olur.")) return;
    await fetch("/api/personel/passkey/sil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    yukle();
  }

  return (
    <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: 16, maxWidth: 360, marginTop: 14 }}>
      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🔐 Parmak İzi / Passkey</p>
      <p style={{ fontSize: 11.5, color: T.textMuted, marginBottom: 12 }}>Eklersen girişte şifreden sonra parmak izi, yüz ya da güvenlik anahtarı istenir.</p>
      {liste && liste.map((p) => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${T.border}`, fontSize: 12.5 }}>
          <span style={{ flex: 1 }}>{p.ad || "Cihaz"}</span>
          <button onClick={() => sil(p.id)} style={{ minHeight: 44, padding: "0 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", cursor: "pointer", fontSize: 12 }}>Kaldır</button>
        </div>
      ))}
      {liste && liste.length === 0 && <p style={{ fontSize: 12, color: T.textMuted }}>Henüz passkey yok.</p>}
      <input value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Cihaz adı (örn. Telefonum)" aria-label="Cihaz adı" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, margin: "10px 0 8px", fontSize: 13, boxSizing: "border-box" }} />
      <button disabled={bekle} onClick={ekle} style={{ minHeight: 44, padding: "0 16px", borderRadius: 8, border: "none", background: T.accent || "#1B4FD8", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{bekle ? "Bekleniyor…" : "Passkey ekle"}</button>
      {hata && <p role="alert" style={{ color: T.danger, fontSize: 12, marginTop: 8 }}>{hata}</p>}
      {bilgi && <p role="status" style={{ fontSize: 12, marginTop: 8 }}>{bilgi}</p>}
    </div>
  );
}
