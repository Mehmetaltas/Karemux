"use client";
import { useState } from "react";

const C = {
  bg: "#F5F3ED", ink: "#1E2A38", inkSoft: "#4A5868", red: "#C1443A",
  green: "#2F8F7A", greenSoft: "#DCEEE9", line: "rgba(30,42,56,0.14)",
  font: "'Inter', -apple-system, 'Segoe UI', sans-serif",
};

const girdi = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: C.font, marginBottom: 12 };
const etiket = { fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 5, display: "block" };

export default function OgretmenBasvuru() {
  const [form, setForm] = useState({
    ad: "", eposta: "", telefon: "", brans: "Matematik", kategori: "branş_ogretmeni",
    istenenKademe: "B", deneyimYili: "", egitimSeviyesi: "Lisans", egitimAlani: "",
    sertifikalar: "", sinavHazirlikDeneyimi: false, ozgecmisMetni: "", cvDosyaUrl: "",
    adliSicilBeyani: false, bilgiDogruluguBeyani: false,
  });
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [cvYukleniyor, setCvYukleniyor] = useState(false);
  const [cvDosyaAdi, setCvDosyaAdi] = useState("");

  function alan(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function cvSec(e) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    setHata("");
    if (dosya.type !== "application/pdf") { setHata("CV sadece PDF formatinda olmali."); return; }
    if (dosya.size > 5 * 1024 * 1024) { setHata("CV dosyasi 5MB'i asamaz."); return; }
    setCvYukleniyor(true);
    try {
      const fd = new FormData();
      fd.append("dosya", dosya);
      const res = await fetch("/api/kariyer/cv-yukle", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alan("cvDosyaUrl", data.url);
      setCvDosyaAdi(dosya.name);
    } catch (err) {
      setHata(err.message);
    } finally {
      setCvYukleniyor(false);
    }
  }

  async function gonder() {
    setHata("");
    if (!form.ad.trim() || !form.eposta.trim()) return setHata("Ad ve eposta gerekli.");
    if (!form.adliSicilBeyani) return setHata("Adli sicil kaydı beyanını onaylamalısın.");
    if (!form.bilgiDogruluguBeyani) return setHata("Bilgi doğruluğu beyanını onaylamalısın.");
    setYukleniyor(true);
    try {
      const res = await fetch("/api/ogretmen-basvuru", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGonderildi(true);
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  if (gonderildi) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.font, padding: 24, textAlign: "center" }}>
        <div>
          <p style={{ fontSize: 40, marginBottom: 12 }}>✅</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Başvurun Alındı</p>
          <p style={{ fontSize: 13.5, color: C.inkSoft, maxWidth: 320 }}>Başvurunu inceleyip sana e-posta üzerinden dönüş yapacağız. Karemux'a ilgin için teşekkürler.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.font, color: C.ink, padding: "32px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Karemux Öğretmen Başvurusu</p>
        <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 24 }}>Karemux'ta ders vermek için başvurunu doldur — inceleyip sana geri döneceğiz.</p>

        <label style={etiket}>Ad Soyad</label>
        <input value={form.ad} onChange={(e) => alan("ad", e.target.value)} style={girdi} />

        <label style={etiket}>E-posta</label>
        <input type="email" value={form.eposta} onChange={(e) => alan("eposta", e.target.value)} style={girdi} />

        <label style={etiket}>Telefon (opsiyonel)</label>
        <input value={form.telefon} onChange={(e) => alan("telefon", e.target.value)} style={girdi} />

        <label style={etiket}>Branş</label>
        <select value={form.brans} onChange={(e) => alan("brans", e.target.value)} style={girdi}>
          {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce", "Rehberlik"].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <label style={etiket}>Kategori</label>
        <select value={form.kategori} onChange={(e) => alan("kategori", e.target.value)} style={girdi}>
          <option value="akademisyen">Akademisyen</option>
          <option value="branş_ogretmeni">Branş Öğretmeni</option>
          <option value="teknik_temel">Teknik Temelden Dersler</option>
          <option value="rehber_koc">Rehberlik/Koçluk</option>
        </select>

        <label style={etiket}>Başvurmak İstediğin Kademe</label>
        <select value={form.istenenKademe} onChange={(e) => alan("istenenKademe", e.target.value)} style={girdi}>
          <option value="C">C — Yeni Mezun / Teknik-Temel (0-2 yıl deneyim)</option>
          <option value="B">B — Deneyimli Branş Öğretmeni (3-7 yıl)</option>
          <option value="A">A — Akademisyen / Uzman (8+ yıl)</option>
        </select>

        <label style={etiket}>Deneyim Yılı</label>
        <input type="number" min="0" value={form.deneyimYili} onChange={(e) => alan("deneyimYili", e.target.value)} style={girdi} />

        <label style={etiket}>Eğitim Seviyesi</label>
        <select value={form.egitimSeviyesi} onChange={(e) => alan("egitimSeviyesi", e.target.value)} style={girdi}>
          <option value="Lisans">Lisans</option>
          <option value="Yuksek Lisans">Yüksek Lisans</option>
          <option value="Doktora">Doktora</option>
        </select>

        <label style={etiket}>Eğitim Alanı (bölüm)</label>
        <input value={form.egitimAlani} onChange={(e) => alan("egitimAlani", e.target.value)} placeholder="Örn: Matematik Öğretmenliği" style={girdi} />

        <label style={etiket}>Sertifikalar (varsa)</label>
        <textarea value={form.sertifikalar} onChange={(e) => alan("sertifikalar", e.target.value)} style={{ ...girdi, minHeight: 60 }} />

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14, cursor: "pointer" }}>
          <input type="checkbox" checked={form.sinavHazirlikDeneyimi} onChange={(e) => alan("sinavHazirlikDeneyimi", e.target.checked)} />
          LGS/YKS gibi sınav hazırlık deneyimim var
        </label>

        <label style={etiket}>CV (PDF, opsiyonel, maks 5MB)</label>
        <input type="file" accept="application/pdf" onChange={cvSec} disabled={cvYukleniyor} style={{ ...girdi, padding: "8px 12px" }} />
        {cvYukleniyor && <p style={{ fontSize: 12, color: C.inkSoft, marginTop: -6, marginBottom: 12 }}>Yukleniyor...</p>}
        {cvDosyaAdi && !cvYukleniyor && <p style={{ fontSize: 12, color: C.green, marginTop: -6, marginBottom: 12 }}>✓ {cvDosyaAdi} yuklendi</p>}

        <label style={etiket}>Kısa Özgeçmiş</label>
        <textarea value={form.ozgecmisMetni} onChange={(e) => alan("ozgecmisMetni", e.target.value)} style={{ ...girdi, minHeight: 90 }} />

        <div style={{ background: "#EEF2F6", borderRadius: 10, padding: 14, marginBottom: 12, border: `1px solid ${C.line}` }}>
          <p style={{ fontSize: 12.5, color: C.ink, fontWeight: 700, marginBottom: 4 }}>📄 Sözleşme Bilgilendirmesi</p>
          <p style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.5 }}>
            Başvurunuz onaylandığı takdirde, Karemux ile aranızda 1 (bir) yıl süreli, yıllık yenilenen bir
            Hizmet Sözleşmesi imzalanacaktır. Bu sözleşme; ücretlendirme, gizlilik, fikri mülkiyet ve
            fesih/mazeret (hastalık, mazeret bildirimi ve belgelenmesi, gerektiğinde geçici vekil ataması gibi)
            şartlarını içerir. Sözleşme metni, onay sürecinde tarafınıza ayrıca iletilecektir.
          </p>
        </div>

        <div style={{ background: C.greenSoft, borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={form.adliSicilBeyani} onChange={(e) => alan("adliSicilBeyani", e.target.checked)} style={{ marginTop: 2 }} />
            <span>Adli sicil kaydımda çocuklarla çalışmama engel bir durum olmadığını beyan ederim.</span>
          </label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
            <input type="checkbox" checked={form.bilgiDogruluguBeyani} onChange={(e) => alan("bilgiDogruluguBeyani", e.target.checked)} style={{ marginTop: 2 }} />
            <span>Verdiğim bilgilerin doğru olduğunu, yanlış/eksik beyanın doğuracağı hukuki sorumluluğun tarafıma ait olduğunu kabul ederim.</span>
          </label>
        </div>

        {hata && <p style={{ color: C.red, fontSize: 12.5, marginBottom: 10 }}>{hata}</p>}
        <button onClick={gonder} disabled={yukleniyor} style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: C.red, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {yukleniyor ? "Gönderiliyor..." : "Başvuruyu Gönder"}
        </button>
      </div>
    </div>
  );
}
