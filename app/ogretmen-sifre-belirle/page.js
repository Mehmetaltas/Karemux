"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";

const C = { yesil: "#1F3D2E", turuncu: "#FF6B5E", metin: "#2A2A2A", muted: "#8A8A8A" };

function SifreBelirleIcerik() {
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  async function belirle() {
    setHata("");
    if (sifre !== sifreTekrar) { setHata("Şifreler eşleşmiyor"); return; }
    if (sifre.length < 6) { setHata("Şifre en az 6 karakter olmalı"); return; }
    setYukleniyor(true);
    try {
      const res = await fetch("/api/ogretmen/sifre-belirle", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, yeniSifre: sifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasarili(true);
      setTimeout(() => router.push("/ogretmen-giris"), 2000);
    } catch (e) { setHata(e.message); } finally { setYukleniyor(false); }
  }

  if (!token) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Geçersiz link.</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.yesil, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 24px", maxWidth: 360, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        <p style={{ fontSize: 20, fontWeight: 800, textAlign: "center", marginBottom: 4, color: C.yesil }}>Şifreni Belirle</p>
        <p style={{ fontSize: 13, textAlign: "center", color: C.muted, marginBottom: 24 }}>Öğretmen paneline giriş için</p>
        {basarili ? (
          <p style={{ textAlign: "center", color: C.yesil, fontWeight: 600 }}>✓ Şifren belirlendi, giriş sayfasına yönlendiriliyorsun...</p>
        ) : (
          <>
            <GosterGizleInput placeholder="Yeni şifre" value={sifre} onChange={(e) => setSifre(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 14, boxSizing: "border-box" }} />
            <GosterGizleInput placeholder="Şifreyi tekrar gir" value={sifreTekrar} onChange={(e) => setSifreTekrar(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && belirle()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 14, fontSize: 14, boxSizing: "border-box" }} />
            {hata && <p style={{ color: C.turuncu, fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}
            <button onClick={belirle} disabled={yukleniyor || !sifre || !sifreTekrar}
              style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: C.turuncu, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>
              {yukleniyor ? "Kaydediliyor..." : "Şifreyi Belirle"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SifreBelirle() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Yükleniyor...</div>}>
      <SifreBelirleIcerik />
    </Suspense>
  );
}
