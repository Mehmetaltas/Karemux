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
          Sınırsız konu anlatımı, soru çözümü ve kişisel çalışma planı — dershane fiyatının onda birinden az.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://karemux-nu.vercel.app/" style={{ background: C.red, color: "#fff", padding: "13px 26px", borderRadius: 10, fontWeight: 700, fontSize: 14.5, textDecoration: "none" }}>Hemen Ücretsiz Başla →</a>
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
          + anlık, sınırsız soru üretimi
        </p>
      </div>

      {/* ==== NEDEN KAREMUX ==== */}
      <div style={{ padding: "20px 20px 48px", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontFamily: C.displayFont, fontSize: 22, marginBottom: 22, textAlign: "center" }}>Neden Karemux?</h2>
        {[
          { ikon: "✨", b: "Akıllı Sistemle Sınırsız Üretim", a: "Statik soru bankası değil — her seferinde taze, seviyene uygun içerik." },
          { ikon: "🗺️", b: "Zayıf Konunu Sana Gösterir", a: "Nerede eksiğin var, tek bakışta gör; sistem otomatik plan çıkarır." },
          { ikon: "🎓", b: "Gerçek Öğretmenle Görüntülü Ders", a: "İstersen özel ders, istersen rehberlik danışmanlığı — tek tıkla randevu." },
          { ikon: "💸", b: "Dershanenin Onda Biri Fiyatına", a: "29.000₺'lik paketler yerine, yıllık 5.000₺'ye tam erişim." },
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

      {/* ==== TAM OZELLIK LISTESI ==== */}
      <KareliArkaplan style={{ padding: "44px 20px 52px", borderTop: `1px solid ${C.grid}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{ fontFamily: C.displayFont, fontSize: 22, marginBottom: 6, textAlign: "center" }}>Defterde Neler Var?</h2>
          <p style={{ textAlign: "center", fontSize: 12.5, color: C.inkSoft, marginBottom: 28 }}>Tek sistemde, 5. sınıftan LGS'ye kadar ihtiyacın olan her şey.</p>

          {[
            { baslik: "📖 Öğrenme", ogeler: ["Sınırsız Konu Anlatımı (6 ders)", "Yeni Nesil Soru Çözümü", "Paragraf Stüdyosu (8 tür pratik)", "Formül ve Kural Kartları", "Kelime Kartları (İngilizce + Türkçe)", "Fotoğrafla Soru Çözme"] },
            { baslik: "📝 Sınav Hazırlığı", ogeler: ["Deneme Sınavı", "Yazılı Hazırlığı", "Türkiye Geneli Deneme (gerçek sıralama)", "Bursluluk Sınavı (İOKBS) Hazırlığı", "Sınav Stratejisi Rehberi", "Sınav Kaygısı Desteği"] },
            { baslik: "🎯 Kişisel Takip", ogeler: ["Zayıf Konu Haritası", "Aralıklı Tekrar Sistemi", "Haftalık Çalışma Planı", "Hedef Okulum ve Puan Hesaplayıcı", "Karne ve İlerleme Raporu", "Ara Tatil ve Yaz Tatili Programları"] },
            { baslik: "👥 İnsan Desteği", ogeler: ["Öğretmenle Görüntülü Özel Ders", "Canlı Grup Dersi", "Canlı Konu Kampı", "Canlı Soru Çözüm Saati", "Rehber Öğretmenle Danışmanlık", "Veli Paneli (canlı takip)", "Kurum/Dershane Paneli (toplu rapor)", "Kurumlara Özel Toplu Lisans", "Kurumlara Özel Deneme Satışı"] },
          ].map((grup, gi) => (
            <div key={gi} style={{ marginBottom: 22 }}>
              <p style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 10, color: C.red }}>{grup.baslik}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 12px" }}>
                {grup.ogeler.map((oge, oi) => (
                  <div key={oi} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.inkSoft, lineHeight: 1.4 }}>
                    <span style={{ color: C.green, fontWeight: 800, flexShrink: 0 }}>✓</span>{oge}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </KareliArkaplan>

      {/* ==== RAKIP KARSILASTIRMA ==== */}
      <div style={{ padding: "44px 20px 52px", maxWidth: 520, margin: "0 auto" }}>
        <h2 style={{ fontFamily: C.displayFont, fontSize: 22, marginBottom: 6, textAlign: "center" }}>Neye Göre Farklı?</h2>
        <p style={{ textAlign: "center", fontSize: 12.5, color: C.inkSoft, marginBottom: 24 }}>Piyasadaki dershane ve dijital paketlerle dürüst bir karşılaştırma.</p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480, fontSize: 12.5 }}>
            <thead>
              <tr>
                <td style={{ padding: "10px 8px", fontWeight: 700, fontSize: 11, color: C.inkSoft }}></td>
                <td style={{ padding: "10px 8px", fontWeight: 800, textAlign: "center", background: C.red, color: "#fff", borderRadius: "10px 10px 0 0" }}>Karemux</td>
                <td style={{ padding: "10px 8px", fontWeight: 700, textAlign: "center", color: C.inkSoft }}>Geleneksel Dershane</td>
                <td style={{ padding: "10px 8px", fontWeight: 700, textAlign: "center", color: C.inkSoft }}>Statik Soru Bankası Uygulamaları</td>
              </tr>
            </thead>
            <tbody>
              {[
                ["Yıllık Fiyat", "5.000₺", "30.000–180.000₺", "Genelde daha ucuz ama sınırlı"],
                ["Soru Kaynağı", "Akıllı sistemle anlık, sınırsız üretim", "Basılı kitap + kaynak", "Sabit, önceden hazırlanmış havuz"],
                ["Kişiselleştirme", "Her öğrenciye özel, gerçek zamanlı", "Sınıf ortalamasına göre", "Genellikle yok / sınırlı"],
                ["Gerçek Öğretmen", "İsteğe bağlı, görüntülü randevu", "Zorunlu, sabit program", "Yok"],
                ["Esneklik", "İstediğin an, istediğin yerden", "Sabit ders saatleri", "İstediğin an"],
              ].map((satir, si) => (
                <tr key={si} style={{ borderBottom: `1px solid ${C.grid}` }}>
                  {satir.map((h, hi) => (
                    <td key={hi} style={{
                      padding: "11px 8px", textAlign: hi === 0 ? "left" : "center",
                      fontWeight: hi === 0 ? 700 : hi === 1 ? 700 : 500,
                      color: hi === 1 ? C.ink : C.inkSoft,
                      background: hi === 1 ? C.redSoft : "transparent",
                    }}>{h}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 10, color: C.inkSoft, marginTop: 12, fontStyle: "italic", textAlign: "center" }}>
          Rakip fiyat aralıkları, ilgili firmaların herkese açık web sitelerinden alınan güncel bilgilere dayanır.
        </p>
      </div>

      {/* ==== OZEL DERS ==== */}
      <div style={{ padding: "0 20px 48px", maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontFamily: C.displayFont, fontSize: "clamp(20px, 5vw, 26px)", textAlign: "center", marginBottom: 8 }}>1-1 Özel Ders de İstersen</h2>
        <p style={{ fontSize: 13.5, color: C.inkSoft, textAlign: "center", marginBottom: 24 }}>Görüntülü, gerçek öğretmenle birebir ders — öğretmen seviyesine göre net saatlik ücret.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { kademe: "C", aciklama: "Yeni mezun / teknik-temel", fiyat: "600₺/saat" },
            { kademe: "B", aciklama: "Deneyimli branş öğretmeni", fiyat: "900₺/saat" },
            { kademe: "A", aciklama: "Akademisyen / uzman", fiyat: "1.300₺+/saat" },
          ].map((k) => (
            <div key={k.kademe} style={{ flex: "1 1 180px", maxWidth: 220, background: "#fff", border: `1px solid ${C.grid}`, borderRadius: 12, padding: 18, textAlign: "center" }}>
              <p style={{ fontFamily: C.displayFont, fontSize: 22, fontWeight: 800, color: C.red, marginBottom: 4 }}>{k.kademe} Kademe</p>
              <p style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 10 }}>{k.aciklama}</p>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{k.fiyat}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: C.inkSoft, textAlign: "center", marginTop: 14 }}>
          <strong>Branşlar:</strong> Matematik, Fen Bilimleri, Türkçe, T.C. İnkılap Tarihi (8. sınıf), Sosyal Bilgiler (5-7. sınıf), Din Kültürü, İngilizce.
        </p>
        <p style={{ fontSize: 10.5, color: C.inkSoft, textAlign: "center", marginTop: 6, fontStyle: "italic" }}>
          Ders saatlerini öğretmen ekranından seçersin.
        </p>
      </div>

      {/* ==== CANLI DERS (GRUP/KAMP/SORU COZUM) ==== */}
      <div style={{ padding: "0 20px 48px", maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontFamily: C.displayFont, fontSize: "clamp(20px, 5vw, 26px)", textAlign: "center", marginBottom: 8 }}>Canlı Grup Dersi, Kamp, Soru Çözüm, Rehberlik ve Koçluk, Rehberlik ve Koçluk</h2>
        <p style={{ fontSize: 13.5, color: C.inkSoft, textAlign: "center", marginBottom: 24 }}>Görüntülü, gerçek öğretmenle sabit 5 kişilik gruplar, net paket fiyatı.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ flex: "1 1 200px", maxWidth: 230, background: "#fff", border: `1px solid ${C.grid}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Grup Dersi</p>
            <p style={{ fontSize: 11, color: C.inkSoft, marginBottom: 10 }}>Haftada 2 gün, 1'er saat<br/>Ayda 8 ders</p>
            <p style={{ fontFamily: C.displayFont, fontSize: 22, fontWeight: 800, color: C.red }}>1.210₺/ay</p>
          </div>
          <div style={{ flex: "1 1 200px", maxWidth: 230, background: "#fff", border: `1px solid ${C.grid}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Kamp</p>
            <p style={{ fontSize: 11, color: C.inkSoft, marginBottom: 10 }}>5 gün, günde 2 saat<br/>Tek seferlik yoğun program</p>
            <p style={{ fontFamily: C.displayFont, fontSize: 22, fontWeight: 800, color: C.red }}>1.610₺</p>
          </div>
          <div style={{ flex: "1 1 200px", maxWidth: 230, background: "#fff", border: `1px solid ${C.grid}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Soru Çözüm Saati</p>
            <p style={{ fontSize: 11, color: C.inkSoft, marginBottom: 10 }}>Canlı öğretmenli, küçük grup<br/>Haftada 1 gün, ayda 4 ders</p>
            <p style={{ fontFamily: C.displayFont, fontSize: 22, fontWeight: 800, color: C.red }}>610₺/ay</p>
            <p style={{ fontSize: 9.5, color: C.inkSoft, marginTop: 6 }}>AI ile sınırsız soru çözümü Premium'da zaten dahil (417₺/ay'dan) — bu, gerçek öğretmenle canlı grup deneyimi</p>
          </div>
          <div style={{ flex: "1 1 200px", maxWidth: 230, background: "#fff", border: `1px solid ${C.grid}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Grup Rehberliği</p>
            <p style={{ fontSize: 11, color: C.inkSoft, marginBottom: 10 }}>5 kişilik grup, haftada 1 gün<br/>Ayda 4 görüşme</p>
            <p style={{ fontFamily: C.displayFont, fontSize: 22, fontWeight: 800, color: C.red }}>605₺/ay</p>
          </div>
          <div style={{ flex: "1 1 200px", maxWidth: 230, background: "#fff", border: `1px solid ${C.grid}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Birebir Koçluk</p>
            <p style={{ fontSize: 11, color: C.inkSoft, marginBottom: 10 }}>Kişiye özel, haftada 1 gün<br/>Ayda 4 görüşme</p>
            <p style={{ fontFamily: C.displayFont, fontSize: 22, fontWeight: 800, color: C.red }}>2.890₺/ay</p>
          </div>
        </div>
        <p style={{ fontSize: 10.5, color: C.inkSoft, textAlign: "center", marginTop: 14, fontStyle: "italic" }}>
          Branşlar: Matematik, Fen Bilimleri, Türkçe, T.C. İnkılap Tarihi (8. sınıf), Sosyal Bilgiler (5-7. sınıf), Din Kültürü, İngilizce.
        </p>
        <div style={{ maxWidth: 480, margin: "20px auto 0", background: C.grid ? "#F5F3ED" : "#F5F3ED", borderRadius: 10, padding: "14px 18px", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>🛡️ İlk Hafta Memnuniyet Garantisi</p>
          <p style={{ fontSize: 10.5, color: C.inkSoft }}>Aylık paketlerde (Grup Dersi, Soru Çözüm, Rehberlik/Koçluk) ilk kez satın alan yeni öğrenciler, ilk 7 gün içinde memnun kalmazsa ücretini iade alır.</p>
        </div>
      </div>

      {/* ==== KAPANIS CTA ==== */}
      <div style={{ padding: "48px 20px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: C.displayFont, fontSize: "clamp(22px, 6vw, 30px)", marginBottom: 14 }}>Kalemini al, başla.</h2>
        <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 22 }}>Kayıt ücretsiz, kredi kartı gerekmez.</p>
        <a href="https://karemux-nu.vercel.app/" style={{ background: C.red, color: "#fff", padding: "14px 30px", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block" }}>Karemux'a Git →</a>
        <p style={{ marginTop: 28, fontSize: 11, color: C.inkSoft }}>Web · PC · Tablet · Mobil — tüm cihazlarda aynı hesapla çalışır.</p>
        <p style={{ marginTop: 14, fontSize: 12 }}><a href="/ogretmen-giris" style={{ color: C.inkSoft, textDecoration: "underline" }}>Öğretmen misiniz? Buradan giriş yapın →</a></p>
      </div>

      {/* ==== FOOTER ==== */}
      <div style={{ padding: "24px 20px 40px", textAlign: "center", borderTop: `1px solid ${C.grid}` }}>
        <p style={{ fontSize: 11.5, color: C.inkSoft }}>
          <a href="/iletisim" style={{ color: C.inkSoft, textDecoration: "underline" }}>İletişim</a>
          {" · "}
          <a href="/ogretmen-basvuru" style={{ color: C.inkSoft, textDecoration: "underline" }}>Öğretmen Başvurusu</a>
          {" · "}
          <a href="/kariyer" style={{ color: C.inkSoft, textDecoration: "underline" }}>Kariyer</a>
          {" · "}
          info@karemux.com
        </p>
        <p style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 10 }}>
          <a href="https://www.youtube.com/@KAREMUXEGITIMSISTEMLERI" target="_blank" rel="noopener noreferrer" style={{ color: C.inkSoft, textDecoration: "underline" }}>YouTube</a>
          {" · "}
          <a href="https://www.instagram.com/karemuxegitim" target="_blank" rel="noopener noreferrer" style={{ color: C.inkSoft, textDecoration: "underline" }}>Instagram</a>
          {" · "}
          <a href="https://www.linkedin.com/in/karemux-e%C4%9Fitim-sistemleri-30a6ba431" target="_blank" rel="noopener noreferrer" style={{ color: C.inkSoft, textDecoration: "underline" }}>LinkedIn</a>
        </p>
      </div>

    </div>
  );
}
