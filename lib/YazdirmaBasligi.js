"use client";

// Paylasilan yazdirma basligi/altligi (8 Eylul) - TUM yazdirilan materyallerde
// (denemeler, yazililar, konu anlatimlari, ogretmen materyalleri) tutarli
// KAREMUX markasi + varsa kurum logosu + telif/sahiplik notu.
//
// ONEMLI: Kendine ozel gizleme stili YOK - mevcut ".yazdir-alani" print CSS
// deseni (visibility: hidden/visible tabanli) zaten bunu yonetiyor. Bu
// bilesen SADECE ".yazdir-alani" div'inin ICINE yerlestirilmeli - o zaman
// ekranda otomatik gizli, yazdirirken otomatik gorunur olur.
export default function YazdirmaBasligi({ kurumLogoUrl, kurumAdi }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #1F3D2E", paddingBottom: 8, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#1F3D2E" }}>KAREMUX</span>
        <span style={{ fontSize: 10, color: "#6B7566" }}>5. Sınıftan LGS'ye Hazırlık</span>
      </div>
      {kurumLogoUrl && (
        <img src={kurumLogoUrl} alt={kurumAdi || "Kurum logosu"} style={{ height: 32, maxWidth: 120, objectFit: "contain" }} />
      )}
    </div>
  );
}

export function YazdirmaAltligi() {
  return (
    <p style={{ fontSize: 9, color: "#8A968E", textAlign: "center", marginTop: 16, borderTop: "1px solid #E5DFD3", paddingTop: 6 }}>
      © Karemux Eğitim Sistemleri — karemux.com — Bu içerik Karemux tarafından üretilmiştir, izinsiz çoğaltılamaz.
    </p>
  );
}
