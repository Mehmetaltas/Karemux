"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const C = { yesil: "#1F3D2E", turuncu: "#FF6B5E", altin: "#E8B339", metin: "#2A2A2A", muted: "#8A8A8A", bg: "#FDFBF6" };

const MENU = [
  { kod: "ozet", ad: "📊 Genel Bakış", hazir: true },
  { kod: "calisma-kagidi", ad: "📄 Çalışma Kağıdı Üret", hazir: true, tur: "calisma_kagidi" },
  { kod: "soru-seti", ad: "✏️ Soru Seti Üret", hazir: true, tur: "soru_seti" },
  { kod: "yazili", ad: "🏫 Yazılı Üret (A/B)", hazir: true, tur: "yazili" },
  { kod: "fasikul", ad: "📖 Fasikül Üret", hazir: true, tur: "fasikul" },
  { kod: "kazanim-testi", ad: "🎯 Kazanım Testi", hazir: true, tur: "kazanim_testi" },
  { kod: "tekrar-paketi", ad: "🔄 Tekrar Paketi", hazir: true, tur: "tekrar_paketi" },
  { kod: "odev-paketi", ad: "📚 Ödev Paketi", hazir: true, tur: "odev_paketi" },
  { kod: "brans-denemesi", ad: "🏆 Branş Denemesi", hazir: true, tur: "brans_denemesi" },
  { kod: "eksik-konu-paketi", ad: "🧩 Eksik Konu Paketi", hazir: true, tur: "eksik_konu_paketi" },
  { kod: "veli-ozeti", ad: "👨‍👩‍👧 Veli Bilgilendirme Özeti", hazir: true, tur: "veli_ozeti" },
  { kod: "sinif-analizi", ad: "📈 Sınıf Başarı Analizi", hazir: true, tur: "sinif_analizi" },
  { kod: "materyallerim", ad: "🗂️ Materyallerim", hazir: true },
  { kod: "profil", ad: "⚙️ Profil / Şifre", hazir: true },
  { kod: "is-basvuru", ad: "💼 İş Başvurusu Yap", hazir: true, dis: true, link: "/ogretmen-basvuru" },
];

const MATERYAL_DERSLER = ["Matematik", "Turkce", "Fen Bilimleri", "Ingilizce", "Sosyal Bilgiler", "T.C. Inkilap Tarihi", "Din Kulturu"];

// Sorulari VE her sorunun sik sirasini karistirip B Kitapciği uretir -
// yeni AI cagrisi YAPMAZ, ayni sorularla, dogruIndex'i yeniden hesaplar.
function karistirVeBKitapciğiUret(sorular) {
  function karistir(dizi) {
    const kopya = [...dizi];
    for (let i = kopya.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
    }
    return kopya;
  }
  const soruSirasiKarisik = karistir(sorular);
  return soruSirasiKarisik.map((s) => {
    const dogruMetin = s.secenekler[s.dogruIndex];
    const harfsizSecenekler = s.secenekler.map((sec) => sec.replace(/^[A-D]\)\s*/, ""));
    const dogruMetinHarfsiz = dogruMetin.replace(/^[A-D]\)\s*/, "");
    const indeksler = karistir([0, 1, 2, 3].slice(0, harfsizSecenekler.length));
    const yeniSecenekler = indeksler.map((eskiIdx, yeniIdx) => `${String.fromCharCode(65 + yeniIdx)}) ${harfsizSecenekler[eskiIdx]}`);
    const yeniDogruIndex = indeksler.findIndex((eskiIdx) => harfsizSecenekler[eskiIdx] === dogruMetinHarfsiz);
    return { ...s, secenekler: yeniSecenekler, dogruIndex: yeniDogruIndex };
  });
}

function MateryalGorunumu({ baslik, ozet, sorular, cevapGoster }) {
  return (
    <div className="yazdir-alani" style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5DFD3", padding: 16 }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{baslik}</p>
      {ozet && <p style={{ fontSize: 13, lineHeight: 1.6, color: "#555", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #eee" }}>{ozet}</p>}
      {sorular.map((s, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>{i + 1}. {s.soru}</p>
          {(s.secenekler || []).map((sec, j) => (
            <p key={j} style={{ fontSize: 13, margin: "3px 0 3px 10px", fontWeight: cevapGoster && j === s.dogruIndex ? 700 : 400, color: cevapGoster && j === s.dogruIndex ? "#1F3D2E" : "#333" }}>
              {sec}{cevapGoster && j === s.dogruIndex ? " ✓" : ""}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

const NOT_GEREKLI_TURLER = ["eksik_konu_paketi", "veli_ozeti", "sinif_analizi"];
const METIN_TURLER = ["veli_ozeti", "sinif_analizi"];

function MateryalUreticisi({ tur, dersVarsayilan }) {
  const [sinif, setSinif] = useState(8);
  const [ders, setDers] = useState(dersVarsayilan || "Matematik");
  const [konu, setKonu] = useState("");
  const [ogretmenNotu, setOgretmenNotu] = useState("");
  const [uniteler, setUniteler] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);
  const [bKitapcik, setBKitapcik] = useState(null);
  const [hata, setHata] = useState("");
  const [cevapGoster, setCevapGoster] = useState(true);
  const [aktifGorunum, setAktifGorunum] = useState("A"); // "A" | "B"
  const notGerekli = NOT_GEREKLI_TURLER.includes(tur);
  const metinTipi = METIN_TURLER.includes(tur);

  useEffect(() => {
    setKonu(""); setUniteler(null);
    fetch(`/api/ogretmen/uniteler?sinif=${sinif}&ders=${encodeURIComponent(ders)}`)
      .then((r) => r.json()).then((d) => setUniteler(d.uniteler || []));
  }, [sinif, ders]);

  async function uret() {
    if (!konu.trim()) { setHata("Konu gerekli"); return; }
    if (notGerekli && !ogretmenNotu.trim()) { setHata("Öğretmen notu gerekli"); return; }
    setYukleniyor(true); setHata(""); setSonuc(null); setBKitapcik(null); setAktifGorunum("A");
    try {
      const res = await fetch("/api/ogretmen/materyal-uret", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tur, sinif, ders, konu: konu.trim(), ogretmenNotu: ogretmenNotu.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSonuc(data.materyal);
    } catch (e) { setHata(e.message); } finally { setYukleniyor(false); }
  }

  function bKitapciğiOlustur() {
    setBKitapcik({ ...sonuc, sorular: karistirVeBKitapciğiUret(sonuc.sorular) });
    setAktifGorunum("B");
  }

  const gosterilecek = aktifGorunum === "B" && bKitapcik ? bKitapcik : sonuc;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <select value={sinif} onChange={(e) => setSinif(Number(e.target.value))} style={{ padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }}>
          {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
        </select>
        <select value={ders} onChange={(e) => setDers(e.target.value)} style={{ flex: 1, padding: "9px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }}>
          {MATERYAL_DERSLER.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      {uniteler === null ? (
        <p style={{ fontSize: 12.5, color: "#999", marginBottom: 10 }}>Üniteler yükleniyor...</p>
      ) : uniteler.length > 0 ? (
        <select value={konu} onChange={(e) => setKonu(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 13.5, boxSizing: "border-box" }}>
          <option value="">Ünite seç...</option>
          {uniteler.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      ) : (
        <>
          <input placeholder="Konu (örn: Üslü Sayılar)" value={konu} onChange={(e) => setKonu(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 4, fontSize: 13.5, boxSizing: "border-box" }} />
          <p style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>Bu ders/sınıf için hazır ünite listesi yok, serbest yazabilirsin.</p>
        </>
      )}
      {notGerekli && (
        <textarea placeholder={tur === "eksik_konu_paketi" ? "Öğrencinin zayıf olduğu konular/hatalar (örn: negatif sayılarda işlem hatası, üslü ifadelerde kural karışıklığı)" : tur === "veli_ozeti" ? "Öğrenci hakkında gözlem notların (örn: son 2 haftada derse katılımı arttı, ödevlerini düzenli yapıyor ama sınavlarda dikkat hatası yapıyor)" : "Sınıfın genel durumu hakkında notların (örn: sınıf ortalaması %65, en çok zorlanılan konu üslü sayılar, 3 öğrenci temel eksikleriyle geride)"}
          value={ogretmenNotu} onChange={(e) => setOgretmenNotu(e.target.value)} rows={4}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 13, boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
      )}
      {hata && <p style={{ color: "#FF6B5E", fontSize: 12.5, marginBottom: 8 }}>{hata}</p>}
      <button onClick={uret} disabled={yukleniyor || !konu.trim() || (notGerekli && !ogretmenNotu.trim())} style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: "#FF6B5E", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>
        {yukleniyor ? "Üretiliyor... (~20 sn)" : "Üret"}
      </button>

      {sonuc && metinTipi && (
        <div className="yazdir-alani" style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5DFD3", padding: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{sonuc.baslik}</p>
          <p style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{sonuc.icerik}</p>
          <button className="yazdirma-disi" onClick={() => window.print()} style={{ marginTop: 12, padding: "7px 12px", borderRadius: 7, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer" }}>🖨️ Yazdır</button>
        </div>
      )}

      {sonuc && !metinTipi && (
        <>
          <div className="yazdirma-disi" style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <button onClick={() => setCevapGoster(!cevapGoster)} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #ddd", background: cevapGoster ? "#FEF8E8" : "#fff", fontSize: 12, cursor: "pointer" }}>
              {cevapGoster ? "✓ Cevap Anahtarı Görünüyor" : "Öğrenci Kopyası (Cevapsız)"}
            </button>
            {tur === "yazili" && (
              <button onClick={bKitapciğiOlustur} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #ddd", background: bKitapcik ? "#EAF7EE" : "#fff", fontSize: 12, cursor: "pointer" }}>
                {bKitapcik ? "✓ B Kitapçığı Hazır" : "B Kitapçığı Oluştur"}
              </button>
            )}
            {bKitapcik && (
              <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: "1px solid #ddd" }}>
                <button onClick={() => setAktifGorunum("A")} style={{ padding: "7px 12px", border: "none", background: aktifGorunum === "A" ? "#1F3D2E" : "#fff", color: aktifGorunum === "A" ? "#fff" : "#333", fontSize: 12, cursor: "pointer" }}>A</button>
                <button onClick={() => setAktifGorunum("B")} style={{ padding: "7px 12px", border: "none", background: aktifGorunum === "B" ? "#1F3D2E" : "#fff", color: aktifGorunum === "B" ? "#fff" : "#333", fontSize: 12, cursor: "pointer" }}>B</button>
              </div>
            )}
            <button onClick={() => window.print()} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer" }}>🖨️ Yazdır</button>
          </div>
          <MateryalGorunumu baslik={gosterilecek.baslik + (aktifGorunum === "B" ? " (B Kitapçığı)" : "")} ozet={gosterilecek.ozet} sorular={gosterilecek.sorular} cevapGoster={cevapGoster} />
        </>
      )}
    </div>
  );
}

export default function OgretmenPanel() {
  const [ogretmen, setOgretmen] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const [sekme, setSekme] = useState("ozet");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/ogretmen/ben").then((r) => {
      if (!r.ok) { router.push("/ogretmen-giris"); return null; }
      return r.json();
    }).then((d) => { if (d) setOgretmen(d.ogretmen); });
  }, []);

  async function cikisYap() {
    await fetch("/api/ogretmen/cikis", { method: "POST" });
    router.push("/ogretmen-giris");
  }

  if (!ogretmen) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Yükleniyor...</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .yazdir-alani, .yazdir-alani * { visibility: visible; }
          .yazdir-alani { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .yazdirma-disi { display: none !important; }
        }
      `}</style>
      <div style={{ background: C.yesil, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setMenuAcik(true)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>☰</button>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Karemux Öğretmen</p>
        <div style={{ width: 22 }} />
      </div>

      {menuAcik && (
        <div onClick={() => setMenuAcik(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: 260, height: "100%", padding: "20px 16px", boxShadow: "2px 0 12px rgba(0,0,0,0.15)" }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ogretmen.ad}</p>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{ogretmen.brans}</p>
            {MENU.map((m) => (
              <button key={m.kod} onClick={() => { if (m.dis) { window.open(m.link, "_blank"); setMenuAcik(false); return; } setSekme(m.kod); setMenuAcik(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 10px", borderRadius: 8, border: "none", background: sekme === m.kod ? "#FEF8E8" : "transparent", color: m.hazir ? C.metin : C.muted, fontSize: 13.5, fontWeight: sekme === m.kod ? 700 : 500, cursor: "pointer", marginBottom: 2 }}>
                {m.ad}{!m.hazir && <span style={{ fontSize: 10, marginLeft: 6, color: C.turuncu }}>(yakında)</span>}
              </button>
            ))}
            <button onClick={cikisYap} style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 10px", borderRadius: 8, border: "none", background: "none", color: C.turuncu, fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginTop: 20 }}>
              Çıkış Yap
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        {sekme === "ozet" && (
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Hoş geldin, {ogretmen.ad}</p>
            <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 20 }}>{ogretmen.brans} branşında Karemux'un 11 materyal üretim aracına erişimin var.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {MENU.filter((m) => m.tur).map((m) => (
                <button key={m.kod} onClick={() => setSekme(m.kod)} style={{ textAlign: "left", background: "#fff", borderRadius: 10, border: "1px solid #E5DFD3", padding: 12, cursor: "pointer" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{m.ad}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {["calisma-kagidi", "soru-seti", "yazili", "fasikul", "kazanim-testi", "tekrar-paketi", "odev-paketi", "brans-denemesi", "eksik-konu-paketi", "veli-ozeti", "sinif-analizi"].includes(sekme) && (
          <MateryalUreticisi tur={MENU.find((m) => m.kod === sekme)?.tur} dersVarsayilan={ogretmen.brans} />
        )}
        {sekme === "materyallerim" && <Materyallerim />}
        {sekme === "profil" && <ProfilSifreDegistir />}
      </div>
    </div>
  );
}

function Materyallerim() {
  const [liste, setListe] = useState(null);
  const [acikMateryal, setAcikMateryal] = useState(null);
  useEffect(() => {
    fetch("/api/ogretmen/materyallerim").then((r) => r.json()).then((d) => setListe(d.materyaller || []));
  }, []);

  async function sil(id) {
    await fetch("/api/ogretmen/materyallerim", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setListe((eski) => eski.filter((m) => m.id !== id));
  }

  if (acikMateryal) {
    return (
      <div>
        <button onClick={() => setAcikMateryal(null)} className="yazdirma-disi" style={{ marginBottom: 10, padding: "7px 12px", borderRadius: 7, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer" }}>← Geri</button>
        <button onClick={() => window.print()} className="yazdirma-disi" style={{ marginBottom: 10, marginLeft: 8, padding: "7px 12px", borderRadius: 7, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer" }}>🖨️ Yazdır</button>
        {acikMateryal.materyal.icerik ? (
          <div className="yazdir-alani" style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5DFD3", padding: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{acikMateryal.materyal.baslik}</p>
            <p style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{acikMateryal.materyal.icerik}</p>
          </div>
        ) : (
          <MateryalGorunumu baslik={acikMateryal.materyal.baslik} ozet={acikMateryal.materyal.ozet} sorular={acikMateryal.materyal.sorular} cevapGoster={true} />
        )}
      </div>
    );
  }

  return (
    <div>
      {liste === null ? <p style={{ fontSize: 13, color: "#999" }}>Yükleniyor...</p> : liste.length === 0 ? (
        <p style={{ fontSize: 13, color: "#999" }}>Henüz materyal üretmedin.</p>
      ) : liste.map((m) => (
        <div key={m.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5DFD3", padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => setAcikMateryal(m)} style={{ cursor: "pointer", flex: 1 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>{m.materyal.baslik}</p>
            <p style={{ fontSize: 11.5, color: "#999", margin: "2px 0 0" }}>{m.ders} · {m.sinif}. Sınıf · {new Date(m.olusturulma).toLocaleDateString("tr-TR")}</p>
          </div>
          <button onClick={() => sil(m.id)} style={{ background: "none", border: "none", color: "#FF6B5E", fontSize: 16, cursor: "pointer" }}>🗑️</button>
        </div>
      ))}
    </div>
  );
}

function ProfilSifreDegistir() {
  const [mevcutSifre, setMevcutSifre] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function degistir() {
    setHata(""); setBasarili(""); setYukleniyor(true);
    try {
      const res = await fetch("/api/ogretmen/sifre-degistir", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mevcutSifre, yeniSifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasarili("Şifren güncellendi.");
      setMevcutSifre(""); setYeniSifre("");
    } catch (e) { setHata(e.message); } finally { setYukleniyor(false); }
  }

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5DFD3", padding: 16, maxWidth: 360 }}>
      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Şifre Değiştir</p>
      <GosterGizleInput placeholder="Mevcut şifre" value={mevcutSifre} onChange={(e) => setMevcutSifre(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 13.5, boxSizing: "border-box" }} />
      <GosterGizleInput placeholder="Yeni şifre (en az 6 karakter)" value={yeniSifre} onChange={(e) => setYeniSifre(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, fontSize: 13.5, boxSizing: "border-box" }} />
      {hata && <p style={{ color: "#FF6B5E", fontSize: 12.5, marginBottom: 8 }}>{hata}</p>}
      {basarili && <p style={{ color: "#1F3D2E", fontSize: 12.5, marginBottom: 8, fontWeight: 600 }}>{basarili}</p>}
      <button onClick={degistir} disabled={yukleniyor || !mevcutSifre || !yeniSifre} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#FF6B5E", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
        {yukleniyor ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </button>
    </div>
  );
}

