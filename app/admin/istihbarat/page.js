"use client";
import { useState } from "react";
import { GosterGizleInput } from "@/lib/sifreAlaniBileseni";

export default function IstihbaratPaneli() {
  const [sifre, setSifre] = useState("");
  const [veri, setVeri] = useState(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function verileriGetir() {
    setYukleniyor(true);
    setHata("");
    try {
      const [talepRes, geriBildirimRes] = await Promise.all([
        fetch(`/api/talep?sifre=${encodeURIComponent(sifre)}`),
        fetch(`/api/geri-bildirim?sifre=${encodeURIComponent(sifre)}`),
      ]);
      const talepData = await talepRes.json();
      const geriBildirimData = await geriBildirimRes.json();
      if (!talepRes.ok || !geriBildirimRes.ok) throw new Error(talepData.error || geriBildirimData.error || "Yetkisiz");
      setVeri({ talepler: talepData.talepler || [], ozet: geriBildirimData.ozet || [], sonSikayetler: geriBildirimData.sonSikayetler || [] });
    } catch (e) {
      setHata(e.message || "Getirilemedi");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 16px", fontFamily: "system-ui, sans-serif", color: "#1B2430" }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>📊 Karemux Kullanıcı İstihbaratı</h1>

      {!veri && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <GosterGizleInput value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="Yönetici şifresi" style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ccc" }} />
          <button onClick={verileriGetir} disabled={yukleniyor} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1B2430", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            {yukleniyor ? "..." : "Getir"}
          </button>
        </div>
      )}
      {hata && <p style={{ color: "#B23A2E", marginBottom: 16 }}>{hata}</p>}

      {veri && (
        <div>
          <section style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 15, marginBottom: 10 }}>🎯 En Çok İstenen Konu/Özellikler ({veri.talepler.length})</h2>
            {veri.talepler.length === 0 ? <p style={{ color: "#888", fontSize: 13 }}>Henüz talep yok.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {veri.talepler.map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#F4F0E4", borderRadius: 8, fontSize: 13 }}>
                    <span>{t.tur === "konu" ? "📚" : "⚙️"} {t.baslik}</span>
                    <strong>{t.talep_sayisi}x</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 15, marginBottom: 10 }}>👍👎 Özellik Geri Bildirim Özeti</h2>
            {veri.ozet.length === 0 ? <p style={{ color: "#888", fontSize: 13 }}>Henüz geri bildirim yok.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {veri.ozet.map((o, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: o.tur === "begeni" ? "#EAF7EE" : "#FFF1EF", borderRadius: 8, fontSize: 13 }}>
                    <span>{o.tur === "begeni" ? "👍" : "👎"} {o.ozellik}</span>
                    <strong>{o.adet}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 style={{ fontSize: 15, marginBottom: 10 }}>💬 Son Şikayet Metinleri</h2>
            {veri.sonSikayetler.length === 0 ? <p style={{ color: "#888", fontSize: 13 }}>Henüz metinli şikayet yok.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {veri.sonSikayetler.map((s, i) => (
                  <div key={i} style={{ padding: "8px 12px", background: "#FAF6EE", borderRadius: 8, fontSize: 12.5 }}>
                    <strong>{s.ozellik}:</strong> {s.mesaj}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
