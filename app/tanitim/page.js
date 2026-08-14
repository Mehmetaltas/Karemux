"use client";
import { useState, useEffect } from "react";

const C = {
  paper: "#F5F3ED",
  paperDeep: "#EFEBE0",
  ink: "#1E2A38",
  inkSoft: "#4A5868",
  red: "#C1443A",
  redSoft: "#F1DEDB",
  green: "#2F8F7A",
  greenSoft: "#DCEEE9",
  grid: "rgba(30,42,56,0.09)",
  displayFont: "'Archivo Black', 'Arial Black', sans-serif",
  bodyFont: "'Inter', -apple-system, 'Segoe UI', sans-serif",
  monoFont: "'IBM Plex Mono', 'Roboto Mono', ui-monospace, monospace",
};

function KareliArkaplan({ children, style }) {
  return (
    <div style={{
      backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
      backgroundSize: "24px 24px", ...style,
    }}>
      {children}
    </div>
  );
}

function NotladirilmisSayi({ deger, etiket, isaret }) {
  return (
    <div style={{ position: "relative", textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <p style={{ fontFamily: C.monoFont, fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 700, color: C.ink }}>{deger}</p>
        {isaret && (
          <svg viewBox="0 0 100 50" style={{ position: "absolute", top: -14, left: -18, right: -18, bottom: -10, width: "calc(100% + 36px)", height: "calc(100% + 24px)", pointerEvents: "none" }}>
            <ellipse cx="50" cy="25" rx="48" ry="23" fill="none" stroke={C.red} strokeWidth="2.5" transform="rotate(-3 50 25)" />
          </svg>
        )}
      </div>
      <p style={{ fontFamily: C.bodyFont, fontSize: 11, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.5, marginTop: 6, textTransform: "uppercase" }}>{etiket}</p>
    </div>
  );
}

export default function Tanitim() {
  const [istatistik, setIstatistik] = useState(null);
  useEffect(() => { fetch("/api/istatistik").then((r) => r.json()).then(setIstatistik).catch(() => {}); }, []);

  return (
    <div style={{ background: C.paper, fontFamily: C.bodyFont, color: C.ink, overflowX: "hidden" }}>

      {/* ==== HERO ==== */}
      <KareliArkaplan style={{ padding: "56px 20px 64px", textAlign: "center", borderBottom: `1px solid ${C.grid}` }}>
        <div style={{ display: "inline-block", background: C.ink, color: C.paper, padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, marginBottom: 22 }}>
          5. SINIFTAN LGS'YE — TEK SİSTEM
        </div>
        <h1 style={{ fontFamily: C.displayFont, fontSize: "clamp(32px, 9vw, 56px)", lineHeight: 1.05, margin: "0 0 18px", letterSpacing: -0.5 }}>
          Defterini aç,<br /><span style={{ color: C.red }}>Karemux</span> yanında.
        </h1>
        <p style={{ fontSize: 15.5, color: C.inkSoft, maxWidth: 380, margin: "0 auto 28px", lineHeight: 1.6 }}>
          Yapay zeka ile sınırsız konu anlatımı, soru çözümü ve kişisel çalışma planı — dershane fiyatının onda birinden az.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/" style={{ background: C.red, color: "#fff", padding: "13px 26px", borderRadius: 10, fontWeight: 700, fontSize: 14.5, textDecoration: "none" }}>Hemen Ücretsiz Başla →</a>
          <a href="#fiyatlar" style={{ background: "transparent", color: C.ink, border: `1.5px solid ${C.ink}`, padding: "13px 26px", borderRadius: 10, fontWeight: 700, fontSize: 14.5, textDecoration: "none" }}>Paketleri Gör</a>
        </div>
      </KareliArkaplan>

      {/* ==== GERCEK SAYILAR - "notlandirilmis" ==== */}
      <div style={{ padding: "40px 20px", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          <NotladirilmisSayi deger="163" etiket="Ünite / Tema" isaret />
          <NotladirilmisSayi deger="480+" etiket="Alt Konu" />
          <NotladirilmisSayi deger={istatistik ? `${istatistik.soruBankasiToplam}+` : "…"} etiket="Soru Bankası" />
        </div>
        <p style={{ textAlign: "center", fontSize: 11.5, color: C.inkSoft, marginTop: 20, fontStyle: "italic" }}>
          + yapay zeka ile anlık, sınırsız soru üretimi
        </p>
      </div>

      {/* ==== NEDEN KAREMUX ==== */}
      <div style={{ padding: "20px 20px 48px", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontFamily: C.displayFont, fontSize: 22, marginBottom: 22, textAlign: "center" }}>Neden Karemux?</h2>
        {[
          { ikon: "🤖", b: "Yapay Zeka ile Sınırsız Üretim", a: "Statik soru bankası değil — her seferinde taze, seviyene uygun içerik." },
          { ikon: "🗺️", b: "Zayıf Konunu Sana Gösterir", a: "Nerede eksiğin var, tek bakışta gör; sistem otomatik plan çıkarır." },
          { ikon: "🎓", b: "Gerçek Öğretmenle Görüntülü Ders", a: "İstersen özel ders, istersen rehberlik danışmanlığı — tek tıkla randevu." },
          { ikon: "💸", b: "Dershanenin Onda Biri Fiyatına", a: "29.000₺'lik paketler yerine, aylık 349₺'den başlayan erişim." },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: C.paperDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.ikon}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 2 }}>{m.b}</p>
              <p style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 }}>{m.a}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ==== FIYATLAR - "karne" tarzi ==== */}
      <KareliArkaplan style={{ padding: "44px 20px 56px", borderTop: `1px solid ${C.grid}` }} >
        <div id="fiyatlar" style={{ maxWidth: 460, margin: "0 auto" }}>
          <h2 style={{ fontFamily: C.displayFont, fontSize: 22, marginBottom: 6, textAlign: "center" }}>Paketler</h2>
          <p style={{ textAlign: "center", fontSize: 12.5, color: C.inkSoft, marginBottom: 26 }}>Ayrı ayrı da alabilirsin, yıllık full ile hepsi bir arada.</p>

          <div style={{ background: "#fff", border: `2px solid ${C.red}`, borderRadius: 16, padding: 22, marginBottom: 16, position: "relative" }}>
            <div style={{ position: "absolute", top: -12, left: 20, background: C.red, color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 10.5, fontWeight: 700 }}>EN AVANTAJLI</div>
            <p style={{ fontWeight: 800, fontSize: 17, marginTop: 6 }}>Yıllık Full Paket</p>
            <p style={{ fontFamily: C.monoFont, fontSize: 30, fontWeight: 700, margin: "8px 0 4px" }}>2.999₺ <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 400 }}>/ yıl</span></p>
            <p style={{ fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 12 }}>≈ 250₺/ay — %50 tasarruf</p>
            <p style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.7 }}>Sınırsız her şey + Bursluluk + Ara/Yaz Tatil Programı + Haftalık Deneme</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Aylık Premium", "349₺/ay"],
              ["Bursluluk Paketi", "129₺"],
              ["Yaz Tatili", "349₺"],
              ["Ara Tatil", "79₺"],
              ["Özel Ders (Tek)", "249₺/ay"],
              ["Rehberlik", "149₺/ay"],
            ].map(([ad, fiyat], i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${C.grid}`, borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 600 }}>{ad}</p>
                <p style={{ fontFamily: C.monoFont, fontSize: 15, fontWeight: 700, marginTop: 3 }}>{fiyat}</p>
              </div>
            ))}
          </div>
        </div>
      </KareliArkaplan>

      {/* ==== KAPANIS CTA ==== */}
      <div style={{ padding: "48px 20px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: C.displayFont, fontSize: "clamp(22px, 6vw, 30px)", marginBottom: 14 }}>Kalemini al, başla.</h2>
        <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 22 }}>Kayıt ücretsiz, kredi kartı gerekmez.</p>
        <a href="/" style={{ background: C.red, color: "#fff", padding: "14px 30px", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block" }}>Karemux'a Git →</a>
        <p style={{ marginTop: 28, fontSize: 11, color: C.inkSoft }}>Web · PC · Tablet · Mobil — tüm cihazlarda aynı hesapla çalışır.</p>
      </div>

    </div>
  );
}
