"use client";
import { useState } from "react";

const C = {
  bg: "#F5F3ED", ink: "#1E2A38", inkSoft: "#4A5868", red: "#C1443A",
  green: "#2F8F7A", greenSoft: "#DCEEE9", line: "rgba(30,42,56,0.14)",
  font: "'Inter', -apple-system, 'Segoe UI', sans-serif",
};
const girdi = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: C.font, marginBottom: 12 };
const etiket = { fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 5, display: "block" };

const TAM_ZAMANLI = ["Yazılım Geliştirme", "Ürün/UI-UX Tasarım", "Pazarlama/İçerik", "Satış/İş Geliştirme", "Öğrenci Destek/Müşteri İlişkileri", "Operasyon/Proje Yönetimi"];
const DANISMANLIK = ["Hukuk/Uyum", "Muhasebe/Finans", "Veri Analisti", "İnsan Kaynakları"];

export default function Kariyer() {
  const [form, setForm] = useState({
    ad: "", eposta: "", telefon: "", basvuruTuru: "tam_zamanli", departman: TAM_ZAMANLI[0],
    deneyimYili: "", egitimSeviyesi: "Lisans", egitimAlani: "", portfolyoUrl: "", ozgecmisMetni: "",
    adliSicilBeyani: false, bilgiDogruluguBeyani: false,
  });
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  function alan(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function turDegistir(tur) {
    setForm((f) => ({ ...f, basvuruTuru: tur, departman: tur === "tam_zamanli" ? TAM_ZAMANLI[0] : DANISMANLIK[0] }));
  }

  async function gonder() {
    setHata("");
    if (!form.ad.trim() || !form.eposta.trim()) return setHata("Ad ve eposta gerekli.");
    if (!form.adliSicilBeyani || !form.bilgiDogruluguBeyani) return setHata("Beyanları onaylamalısın.");
    setYukleniyor(true);
    try {
      const res = await fetch("/api/kariyer-basvuru", {
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
          <p style={{ fontSize: 13.5, color: C.inkSoft, maxWidth: 320 }}>Uygun bir pozisyon açıldığında seninle iletişime geçeceğiz.</p>
        </div>
      </div>
    );
  }

  const departmanListesi = form.basvuruTuru === "tam_zamanli" ? TAM_ZAMANLI : DANISMANLIK;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.font, color: C.ink, padding: "32px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Karemux Kariyer</p>
        <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 16 }}>Şu an aktif bir ilan yok, ama havuzumuzu her zaman açık tutuyoruz — uygun bir pozisyon açıldığında seninle iletişime geçeriz.</p>

        <div style={{ background: C.greenSoft, borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Karemux'ta Çalışma Standardımız</p>
          <p style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>
            25 gün yıllık ücretli izin · Özel sağlık sigortası · Uygun pozisyonlarda esnek/uzaktan çalışma · Yasal sınırları aşmayan, ek ücretli fazla mesai
          </p>
        </div>

        <label style={etiket}>Başvuru Türü</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button type="button" onClick={() => turDegistir("tam_zamanli")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${form.basvuruTuru === "tam_zamanli" ? C.red : C.line}`, background: form.basvuruTuru === "tam_zamanli" ? C.red : "#fff", color: form.basvuruTuru === "tam_zamanli" ? "#fff" : C.ink, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Tam Zamanlı</button>
          <button type="button" onClick={() => turDegistir("danismanlik")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${form.basvuruTuru === "danismanlik" ? C.red : C.line}`, background: form.basvuruTuru === "danismanlik" ? C.red : "#fff", color: form.basvuruTuru === "danismanlik" ? "#fff" : C.ink, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Danışmanlık</button>
        </div>

        <label style={etiket}>Departman</label>
        <select value={form.departman} onChange={(e) => alan("departman", e.target.value)} style={girdi}>
          {departmanListesi.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <label style={etiket}>Ad Soyad</label>
        <input value={form.ad} onChange={(e) => alan("ad", e.target.value)} style={girdi} />

        <label style={etiket}>E-posta</label>
        <input type="email" value={form.eposta} onChange={(e) => alan("eposta", e.target.value)} style={girdi} />

        <label style={etiket}>Telefon (opsiyonel)</label>
        <input value={form.telefon} onChange={(e) => alan("telefon", e.target.value)} style={girdi} />

        <label style={etiket}>Deneyim Yılı</label>
        <input type="number" min="0" value={form.deneyimYili} onChange={(e) => alan("deneyimYili", e.target.value)} style={girdi} />

        <label style={etiket}>Eğitim Seviyesi</label>
        <select value={form.egitimSeviyesi} onChange={(e) => alan("egitimSeviyesi", e.target.value)} style={girdi}>
          <option value="Lisans">Lisans</option>
          <option value="Yuksek Lisans">Yüksek Lisans</option>
          <option value="Doktora">Doktora</option>
        </select>

        <label style={etiket}>Eğitim Alanı</label>
        <input value={form.egitimAlani} onChange={(e) => alan("egitimAlani", e.target.value)} style={girdi} />

        <label style={etiket}>Portfolyo/LinkedIn (varsa)</label>
        <input value={form.portfolyoUrl} onChange={(e) => alan("portfolyoUrl", e.target.value)} placeholder="https://..." style={girdi} />

        <label style={etiket}>Kısa Özgeçmiş</label>
        <textarea value={form.ozgecmisMetni} onChange={(e) => alan("ozgecmisMetni", e.target.value)} style={{ ...girdi, minHeight: 90 }} />

        <div style={{ background: "#F1DEDB", borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={form.adliSicilBeyani} onChange={(e) => alan("adliSicilBeyani", e.target.checked)} style={{ marginTop: 2 }} />
            <span>Adli sicil kaydımda engel bir durum olmadığını beyan ederim.</span>
          </label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
            <input type="checkbox" checked={form.bilgiDogruluguBeyani} onChange={(e) => alan("bilgiDogruluguBeyani", e.target.checked)} style={{ marginTop: 2 }} />
            <span>Verdiğim bilgilerin doğru olduğunu, yanlış/eksik beyanın sorumluluğunun tarafıma ait olduğunu kabul ederim.</span>
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
