// KAREMUX Design System (8 Eylul) - lib/temalar.js'teki renk/tema katmanina
// DOKUNMUYOR (zaten iyi mimari edilmis, 5 tema tutarli). Bu dosya EKSIK
// olan katmanlari (Typography/Spacing/Radius/Component) ekliyor. Kademeli
// gocu destekler: YENI kod bunu kullanir, ESKI kod dokunulmadan kalir -
// rip-and-replace yok.

// ===== TYPOGRAFI =====
export const TIPO = {
  baslikBuyuk: { fontSize: 22, fontWeight: 800, lineHeight: 1.2 },   // Sayfa/ana baslik
  baslik: { fontSize: 17, fontWeight: 700, lineHeight: 1.25 },       // Bolum basligi
  altBaslik: { fontSize: 14, fontWeight: 700, lineHeight: 1.3 },     // Kart/panel basligi
  govde: { fontSize: 13, fontWeight: 400, lineHeight: 1.6 },         // Ana metin
  govdeVurgu: { fontSize: 13, fontWeight: 600, lineHeight: 1.5 },    // Vurgulu govde
  kucuk: { fontSize: 11.5, fontWeight: 400, lineHeight: 1.4 },       // Yardimci/ikincil metin
  mikro: { fontSize: 10, fontWeight: 400, lineHeight: 1.3 },         // Etiket/durum metni
};

// ===== BOSLUK =====
export const BOSLUK = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

// ===== KOSE YUVARLAKLIGI =====
export const RADIUS = { kucuk: 6, orta: 10, buyuk: 16, tam: 999 };

// ===== BILESEN URETICILERI (tema-uyumlu) =====
// tema parametresi lib/temalar.js'teki TEMALAR[x] objesi olmali.

export function kartStili(tema, secenekler = {}) {
  return {
    background: secenekler.arkaPlan || "#fff",
    border: `1px solid ${tema.line}`,
    borderRadius: RADIUS.orta,
    padding: BOSLUK.lg,
    boxShadow: secenekler.golgeYok ? "none" : "0 2px 10px rgba(0,0,0,0.05)",
    ...secenekler.ekstra,
  };
}

export function butonStili(tema, tip = "birincil") {
  if (tip === "birincil") {
    return {
      background: tema.mustard, color: "#fff", border: "none",
      borderRadius: RADIUS.orta, padding: "10px 18px",
      fontWeight: 700, fontSize: TIPO.govdeVurgu.fontSize, cursor: "pointer",
    };
  }
  return {
    background: "none", color: tema.ink, border: `1.5px solid ${tema.line}`,
    borderRadius: RADIUS.orta, padding: "10px 18px",
    fontWeight: 700, fontSize: TIPO.govdeVurgu.fontSize, cursor: "pointer",
  };
}

// ===== LISTE SATIRI (8 Eylul, LinkedIn tarzi ayarlar/menu referansindan) =====
// Ikon + metin + ok ucu deseni. Tabler ikon fontu layout.js'te yuklu -
// kullanim: <i className="ti ti-user" style={{ fontSize: 20 }} />
export function listeSatiriStili(tema, secenekler = {}) {
  return {
    display: "flex", alignItems: "center", gap: 14, padding: "14px 0",
    borderTop: secenekler.ilkSatir ? "none" : `1px solid ${tema.line}`,
    textDecoration: "none", color: tema.ink, cursor: "pointer",
  };
}

export function bolumBasligiStili(tema) {
  return {
    fontSize: 11, color: tema.muted, textTransform: "uppercase",
    letterSpacing: 0.5, fontWeight: 700, marginBottom: 4, marginTop: 16,
  };
}

export function rozetStili(tema, durum = "notr") {
  const renkler = {
    basarili: { bg: "rgba(61,163,93,0.15)", metin: "#2E7D4F" },
    uyari: { bg: "rgba(232,179,57,0.18)", metin: "#8A6D1A" },
    hata: { bg: "rgba(232,80,63,0.15)", metin: tema.coral },
    notr: { bg: tema.line + "40", metin: tema.muted },
  };
  const r = renkler[durum] || renkler.notr;
  return {
    display: "inline-block", background: r.bg, color: r.metin,
    borderRadius: RADIUS.tam, padding: "3px 10px",
    fontSize: TIPO.mikro.fontSize, fontWeight: 700,
  };
}
