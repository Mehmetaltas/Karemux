"use client";
import { useEffect, useRef, useState } from "react";

// Harici katilimci sayfasi (Sinav Merkezi madde 20): hesap acmadan ucretsiz ulusal denemeye katil,
// sonucunu gor. Hesap acinca (ayni cihazda) sonuc otomatik hesaba tasinir.
// KVKK: ad, e-posta, telefon ISTENMEZ; yalnizca bu cihaza ozel rastgele bir kimlik kullanilir.
const API = "https://api.karemux.com";

function cihazIdAl() {
  let id = localStorage.getItem("karemux_cihaz_id");
  if (!id) {
    id = "cihaz-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("karemux_cihaz_id", id);
  }
  return id;
}

const renk = { ana: "#1B4FD8", yazi: "#1B2430", soluk: "#5B6573", cizgi: "#D9DEE6", zemin: "#F6F8FB", hata: "#B42318" };
const kart = { background: "#fff", border: `1px solid ${renk.cizgi}`, borderRadius: 12, padding: 16, marginBottom: 14 };
const dugme = { background: renk.ana, color: "#fff", border: 0, borderRadius: 10, padding: "12px 18px", fontSize: 16, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" };

export default function HariciDeneme() {
  const cihazId = useRef(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veri, setVeri] = useState(null);
  const [hata, setHata] = useState("");
  const [cevaplar, setCevaplar] = useState({});
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);

  useEffect(() => {
    document.title = "Ücretsiz Ulusal Deneme — Karemux";
    try { cihazId.current = cihazIdAl(); } catch (e) { setHata("Tarayıcı kimliği oluşturulamadı. Çerez/depolama iznini açıp sayfayı yenile."); setYukleniyor(false); return; }
    fetch(`${API}/aktif?cihazId=${encodeURIComponent(cihazId.current)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setVeri(d))
      .catch(() => setHata("Deneme bilgisi alınamadı. Bağlantını kontrol edip tekrar dene."))
      .finally(() => setYukleniyor(false));
  }, []);

  async function gonder() {
    const aktif = veri?.aktifDeneme;
    if (!aktif) return;
    const bos = (veri.sorular?.length || 0) - Object.keys(cevaplar).length;
    if (bos > 0 && !window.confirm(`${bos} soru boş kaldı. Yine de bitirmek istiyor musun?`)) return;
    setGonderiliyor(true); setHata("");
    try {
      const res = await fetch(`${API}/gonder`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ ulusalDenemeId: aktif.id, cevaplar, cihazId: cihazId.current }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gönderilemedi");
      setSonuc(d);
      window.scrollTo(0, 0);
    } catch (e) {
      setHata(e.message || "Gönderilemedi, tekrar dene.");
    } finally { setGonderiliyor(false); }
  }

  const aktif = veri?.aktifDeneme;
  const sorular = veri?.sorular;
  const tarih = (t) => { try { return new Date(t).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" }); } catch (e) { return ""; } };

  const aktarCta = (
    <div style={{ ...kart, background: "#EEF3FF", borderColor: "#C7D6FB" }}>
      <strong>Sonucunu Karemux’a aktar</strong>
      <p style={{ margin: "6px 0 12px", color: renk.soluk, lineHeight: 1.5 }}>
        Ücretsiz hesap aç; bu cihazdaki deneme sonucun, yanlışların ve çalışma önerilerin hesabına otomatik taşınır.
      </p>
      <a href="/?uygulama=1" style={dugme}>Hesap aç ve sonucumu aktar</a>
    </div>
  );

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px", fontFamily: "system-ui, sans-serif", color: renk.yazi, background: renk.zemin, minHeight: "100vh", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Ücretsiz Ulusal Deneme</h1>
      <p style={{ color: renk.soluk, margin: "0 0 18px" }}>Hesap açmadan katıl. Ad, e-posta ya da telefon istenmez.</p>

      {yukleniyor && <p role="status">Yükleniyor…</p>}
      {hata && <p role="alert" style={{ color: renk.hata }}>{hata}</p>}

      {!yukleniyor && !hata && veri && !aktif && (
        <div style={kart}>
          <strong>Şu an açık bir deneme yok.</strong>
          {veri.gelecekDeneme
            ? <p style={{ margin: "8px 0 0" }}>Sıradaki deneme: <b>{veri.gelecekDeneme.ad}</b> ({veri.gelecekDeneme.sinif}. sınıf {veri.gelecekDeneme.ders}) — {tarih(veri.gelecekDeneme.acilis)} tarihinde açılır.</p>
            : <p style={{ margin: "8px 0 0", color: renk.soluk }}>Yeni deneme duyurulunca burada görünür.</p>}
        </div>
      )}

      {aktif && !sonuc && (
        <div style={kart}>
          <strong>{aktif.ad}</strong>
          <div style={{ color: renk.soluk }}>{aktif.sinif}. sınıf · {aktif.ders} · {aktif.soruSayisi} soru · {tarih(aktif.kapanis)} tarihine kadar açık</div>
        </div>
      )}

      {aktif && veri.zatenCozmus && !sonuc && (
        <>
          <div style={kart}>Bu denemeyi bu cihazdan zaten çözdün. Cevap anahtarı deneme kapandıktan sonra açılır.</div>
          {aktarCta}
        </>
      )}

      {aktif && !veri.zatenCozmus && sorular && !sonuc && (
        <>
          {sorular.map((s, i) => (
            <fieldset key={i} style={{ ...kart, margin: "0 0 14px" }}>
              <legend style={{ fontWeight: 700, padding: "0 6px" }}>Soru {i + 1}</legend>
              <p style={{ whiteSpace: "pre-wrap", margin: "4px 0 10px" }}>{s.soru}</p>
              {(s.secenekler || []).map((sec, j) => (
                <label key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 8px", minHeight: 44, borderRadius: 8, cursor: "pointer", background: cevaplar[i] === j ? "#EEF3FF" : "transparent" }}>
                  <input type="radio" name={`soru-${i}`} checked={cevaplar[i] === j} onChange={() => setCevaplar((c) => ({ ...c, [i]: j }))} style={{ marginTop: 4 }} />
                  <span>{sec}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <button onClick={gonder} disabled={gonderiliyor} style={{ ...dugme, opacity: gonderiliyor ? 0.6 : 1 }}>
            {gonderiliyor ? "Gönderiliyor…" : "Denemeyi bitir"}
          </button>
        </>
      )}

      {sonuc && (
        <>
          <div style={kart}>
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Sonucun</h2>
            <p style={{ margin: 0, fontSize: 18 }}>
              <b>{Number(sonuc.net).toFixed(2)} net</b> · {sonuc.dogru} doğru · {sonuc.yanlis} yanlış · {sonuc.bos} boş
            </p>
            {sonuc.toplamKatilimci > 1 && (
              <p style={{ margin: "8px 0 0", color: renk.soluk }}>{sonuc.toplamKatilimci} katılımcı arasında {sonuc.siram}. sıradasın (şimdilik).</p>
            )}
            <p style={{ margin: "8px 0 0", color: renk.soluk }}>Cevap anahtarı deneme kapandığında ({tarih(sonuc.kapanis)}) açılır.</p>
          </div>
          {Array.isArray(sonuc.karne) && sonuc.karne.length > 0 && (
            <div style={kart}>
              <strong>Konu karnesi</strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {sonuc.karne.map((k) => <li key={k.altKonu}>{k.altKonu}: {k.dogru} doğru, {k.yanlis} yanlış, {k.bos} boş</li>)}
              </ul>
            </div>
          )}
          {aktarCta}
        </>
      )}

      <p style={{ color: renk.soluk, fontSize: 13, marginTop: 24 }}>
        Sonucun yalnızca bu cihaza özel rastgele bir kimlikle tutulur. <a href="/gizlilik">Gizlilik ve KVKK</a>
      </p>
    </main>
  );
}
