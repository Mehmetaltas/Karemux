"use client";
import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#1F3D2E", page: "#FAF6EE", ink: "#1B2430", muted: "#6B7566",
  coral: "#FF6B5E", mustard: "#E8B339", line: "#DCD5C4",
};

const DERSLER = [
  { ad: "Matematik", emoji: "➗" }, { ad: "Fen Bilimleri", emoji: "🔬" },
  { ad: "Turkce", emoji: "📖" }, { ad: "T.C. Inkilap Tarihi", emoji: "🏛️" },
  { ad: "Din Kulturu", emoji: "🕌" }, { ad: "Ingilizce", emoji: "🇬🇧" },
];

function cihazIdAl() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("karemux_cihaz_id");
  if (!id) {
    id = "cihaz-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("karemux_cihaz_id", id);
  }
  return id;
}

async function aiIstek(prompt, maxTokens, cihazId) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens, cihazId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "AI istegi basarisiz");
  return data.text;
}

export default function Ana() {
  const [mod, setMod] = useState("anlatim");
  const [ders, setDers] = useState(null);
  const [konu, setKonu] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [cevaplar, setCevaplar] = useState({});
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(null);
  const [hata, setHata] = useState("");
  const cihazIdRef = useRef(null);

  const [zayifDersler, setZayifDersler] = useState([]);
  const [otomatikTespit, setOtomatikTespit] = useState(false);
  const [haftalikSaat, setHaftalikSaat] = useState(10);
  const [kalanHafta, setKalanHafta] = useState(8);
  const [plan, setPlan] = useState("");

  const [checkoutHtml, setCheckoutHtml] = useState("");
  const [odemeHata, setOdemeHata] = useState("");
  const [aktifAbonelik, setAktifAbonelik] = useState(null);
  const [iptalMesaji, setIptalMesaji] = useState("");

  const [hesap, setHesap] = useState(null);
  const [hesapModu, setHesapModu] = useState("giris");
  const [epostaGir, setEpostaGir] = useState("");
  const [sifreGir, setSifreGir] = useState("");
  const [adGir, setAdGir] = useState("");
  const [rolSec, setRolSec] = useState("ogrenci");
  const [hesapHata, setHesapHata] = useState("");

  const [dogrulamaKoduGir, setDogrulamaKoduGir] = useState("");
  const [dogrulamaMesaj, setDogrulamaMesaj] = useState("");

  const [baglantiKoduGir, setBaglantiKoduGir] = useState("");
  const [veliMesaj, setVeliMesaj] = useState("");
  const [veliOgrenciler, setVeliOgrenciler] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.girisYapmis) setHesap(d.kullanici);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (hesap?.rol === "veli") {
      fetch("/api/veli/ilerleme").then((r) => r.json()).then((d) => {
        if (d.ogrenciler) setVeliOgrenciler(d.ogrenciler);
      }).catch(() => {});
    }
  }, [hesap]);

  useEffect(() => {
    if (hesap) {
      fetch("/api/abonelik/durum").then((r) => r.json()).then((d) => setAktifAbonelik(d.aktifAbonelik)).catch(() => {});
    }
  }, [hesap]);

  async function abonelikIptalEt() {
    setIptalMesaji("");
    try {
      const res = await fetch("/api/abonelik/iptal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIptalMesaji(data.mesaj);
      setAktifAbonelik(null);
    } catch (e) {
      setIptalMesaji("Iptal edilemedi: " + e.message);
    }
  }

  const [soruGorseli, setSoruGorseli] = useState(null);
  const [soruCozumu, setSoruCozumu] = useState("");

  useEffect(() => {
    cihazIdRef.current = cihazIdAl();
    if (!cihazIdRef.current) return;
    fetch(`/api/ilerleme?cihazId=${cihazIdRef.current}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.zayifDersler?.length) {
          setZayifDersler(d.zayifDersler);
          setOtomatikTespit(true);
        }
      })
      .catch(() => {});
  }, []);

  function dersToggle(ad) {
    setOtomatikTespit(false);
    setZayifDersler((l) => (l.includes(ad) ? l.filter((x) => x !== ad) : [...l, ad]));
  }

  async function ilerlemeyiKaydet(dersAdi, konuAdi, dogru, toplam) {
    if (!cihazIdRef.current) return;
    try {
      await fetch("/api/ilerleme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cihazId: cihazIdRef.current, ders: dersAdi, konu: konuAdi, dogruSayisi: dogru, toplamSoru: toplam }),
      });
    } catch (e) {}
  }

  async function hesapGonder() {
    setHesapHata("");
    const url = hesapModu === "giris" ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: epostaGir, sifre: sifreGir, ad: adGir, rol: rolSec }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (me.girisYapmis) setHesap(me.kullanici);
      const p = await fetch(`/api/ilerleme?cihazId=${cihazIdRef.current}`).then((r) => r.json());
      if (p.zayifDersler?.length) { setZayifDersler(p.zayifDersler); setOtomatikTespit(true); }
    } catch (e) {
      setHesapHata(e.message || "Islem basarisiz");
    }
  }

  async function cikisYap() {
    await fetch("/api/auth/logout", { method: "POST" });
    setHesap(null);
    setVeliOgrenciler([]);
  }

  async function dogrulaGonder() {
    setDogrulamaMesaj("");
    try {
      const res = await fetch("/api/auth/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: dogrulamaKoduGir }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHesap((h) => ({ ...h, eposta_dogrulandi: true }));
      setDogrulamaMesaj("E-postan dogrulandi!");
    } catch (e) {
      setDogrulamaMesaj(e.message || "Dogrulama basarisiz");
    }
  }

  async function kodTekrarGonder() {
    setDogrulamaMesaj("");
    try {
      const res = await fetch("/api/auth/dogrulama-kodu-gonder", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDogrulamaMesaj("Yeni kod gonderildi, gelen kutunu kontrol et.");
    } catch (e) {
      setDogrulamaMesaj(e.message || "Kod gonderilemedi");
    }
  }

  async function veliBaglan() {
    setVeliMesaj("");
    try {
      const res = await fetch("/api/veli/baglan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: baglantiKoduGir }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVeliMesaj(`${data.ogrenciAdi} adli ogrenciye baglandin.`);
      setBaglantiKoduGir("");
      const d = await fetch("/api/veli/ilerleme").then((r) => r.json());
      if (d.ogrenciler) setVeliOgrenciler(d.ogrenciler);
    } catch (e) {
      setVeliMesaj(e.message || "Baglanti kurulamadi");
    }
  }

  async function soruGorseliCoz(dosya) {
    setYukleniyor("soru"); setHata(""); setSoruCozumu("");
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result.split(",")[1]);
        r.onerror = reject;
        r.readAsDataURL(dosya);
      });
      const res = await fetch("/api/soru-coz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: dosya.type, ders, cihazId: cihazIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSoruCozumu(data.cozum);
    } catch (e) {
      setHata(e.message || "Soru cozulemedi, tekrar dene.");
    } finally {
      setYukleniyor(null);
    }
  }

  async function konuAnlat() {
    if (!ders || !konu.trim()) return;
    setYukleniyor("aciklama"); setHata(""); setAciklama(""); setQuiz(null); setGonderildi(false);
    try {
      const p = `Sen bir LGS (ortaokul 8. sinif) ogretmenisin. "${ders}" dersinden "${konu}" konusunu, 13-14 yasindaki bir ogrenciye sade, acik ve ornekli bir dille anlat. Madde isaretleri ve kisa paragraflar kullan. En fazla 250 kelime. Markdown bicimlendirme kullanma (yildiz **, baslik # gibi isaretler koyma), sadece duz metin yaz. Sadece Turkce yaz.`;
      const cevap = await aiIstek(p, 2000, cihazIdRef.current);
      setAciklama(cevap.replace(/\*\*/g, "").replace(/#+\s?/g, ""));
    } catch (e) { setHata(e.message || "Anlatim alinamadi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  async function soruUret() {
    if (!ders || !konu.trim()) return;
    setYukleniyor("quiz"); setHata(""); setCevaplar({}); setGonderildi(false);
    try {
      const p = `Sen bir LGS ogretmenisin. "${ders}" dersinden "${konu}" konusuyla ilgili 8. sinif seviyesinde 5 coktan secmeli soru hazirla. SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;
      const cevap = await aiIstek(p, 3000, cihazIdRef.current);
      const temiz = cevap.replace(/```json|```/g, "").trim();
      let baslangic = temiz.indexOf("[{");
      if (baslangic === -1) baslangic = temiz.indexOf("[");
      const bitisEslesme = temiz.lastIndexOf("}]");
      const bitis = bitisEslesme !== -1 ? bitisEslesme + 1 : temiz.lastIndexOf("]");
      if (baslangic === -1 || bitis === -1) throw new Error("AI gecerli bir soru listesi dondurmedi, tekrar dene");
      setQuiz(JSON.parse(temiz.slice(baslangic, bitis + 1)));
    } catch (e) { setHata(e.message || "Sorular uretilemedi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  async function planOlustur() {
    if (zayifDersler.length === 0) return;
    setYukleniyor("plan"); setHata(""); setPlan("");
    try {
      const p = `Sen bir LGS calisma kocusun. Zayif dersler: ${zayifDersler.join(", ")}. Haftalik ${haftalikSaat} saat, sinava ${kalanHafta} hafta kaldi. Haftalik program hazirla, dersleri saatlere bol, kisa odak notu ekle. Motive edici ama abartisiz. Sadece Turkce duz metin, en fazla 300 kelime, markdown isareti kullanma.`;
      setPlan(await aiIstek(p, 1500, cihazIdRef.current));
    } catch (e) { setHata(e.message || "Plan olusturulamadi, tekrar dene."); }
    finally { setYukleniyor(null); }
  }

  async function premiumSatinAl(plan) {
    setOdemeHata(""); setCheckoutHtml("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          kullanici: { ad: "Test", soyad: "Kullanici", eposta: "test@karemux.com", adres: "Istanbul, Turkiye", sehir: "Istanbul" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCheckoutHtml(data.checkoutFormContent);
    } catch (e) {
      setOdemeHata("Odeme baslatilamadi: " + e.message);
    }
  }

  const dogruSayisi = quiz && gonderildi ? quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length : null;

  function cevaplariGonder() {
    setGonderildi(true);
    const dogru = quiz.filter((s, i) => cevaplar[i] === s.dogruIndex).length;
    ilerlemeyiKaydet(ders, konu, dogru, quiz.length);
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "system-ui, sans-serif", padding: "24px 14px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: COLORS.page, margin: "0 0 4px" }}>Karemux <span style={{ color: COLORS.mustard }}>·</span> LGS Ders Kocu</h1>
        <p style={{ color: "#C9D4C7", fontSize: 13, margin: "0 0 16px" }}>Konu anlatimi, soru uretimi ve kisisel calisma plani - yapay zeka ile.</p>

        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {["anlatim", "sorucoz", "kocluk", "premium", "hesap"].map((m) => (
            <button key={m} onClick={() => setMod(m)} style={{
              flex: "1 1 auto", padding: "9px 4px", borderRadius: 8, border: "none", cursor: "pointer",
              background: mod === m ? COLORS.page : "transparent", color: mod === m ? COLORS.ink : "#C9D4C7",
              fontWeight: 600, fontSize: 12,
            }}>
              {m === "anlatim" ? "📘 Konu" : m === "sorucoz" ? "📷 Soru Coz" : m === "kocluk" ? "🎯 Kocluk" : m === "premium" ? "💳 Premium" : hesap ? `👤 ${hesap.ad}` : "👤 Hesap"}
            </button>
          ))}
        </div>

        {hata && <p style={{ color: "#FFD5D0", fontSize: 13, marginBottom: 12 }}>{hata}</p>}

        {mod === "hesap" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            {hesap ? (
              <div>
                <p style={{ fontSize: 14, marginBottom: 4 }}>
                  Giris yapildi: <strong>{hesap.ad}</strong> <span style={{ color: COLORS.muted, fontSize: 12 }}>({hesap.rol === "veli" ? "veli hesabi" : "ogrenci hesabi"})</span>
                </p>

                {!hesap.eposta_dogrulandi && (
                  <div style={{ background: "#FFF8E8", border: `1px solid ${COLORS.mustard}`, borderRadius: 8, padding: 12, margin: "10px 0" }}>
                    <p style={{ fontSize: 13, marginBottom: 8 }}>E-postan henuz dogrulanmadi. Gelen kutunu kontrol et.</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={dogrulamaKoduGir} onChange={(e) => setDogrulamaKoduGir(e.target.value)} placeholder="6 haneli kod" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
                      <button onClick={dogrulaGonder} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Dogrula</button>
                    </div>
                    <button onClick={kodTekrarGonder} style={{ marginTop: 8, padding: 0, border: "none", background: "none", color: COLORS.muted, fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>Kodu tekrar gonder</button>
                    {dogrulamaMesaj && <p style={{ fontSize: 12, marginTop: 6 }}>{dogrulamaMesaj}</p>}
                  </div>
                )}

                {hesap.rol === "ogrenci" && hesap.veli_baglanti_kodu && (
                  <div style={{ background: "#EAF7EE", borderRadius: 8, padding: 12, margin: "10px 0" }}>
                    <p style={{ fontSize: 13, margin: 0 }}>
                      Veli baglanti kodun: <strong style={{ fontFamily: "monospace", fontSize: 15 }}>{hesap.veli_baglanti_kodu}</strong>
                    </p>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: "4px 0 0" }}>Bu kodu velinle paylas, ilerlemeni gorebilsin.</p>
                  </div>
                )}

                {hesap.rol === "veli" && (
                  <div style={{ margin: "14px 0" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>OGRENCI BAGLA</label>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <input value={baglantiKoduGir} onChange={(e) => setBaglantiKoduGir(e.target.value)} placeholder="Ogrencinin baglanti kodu" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
                      <button onClick={veliBaglan} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Bagla</button>
                    </div>
                    {veliMesaj && <p style={{ fontSize: 12, marginBottom: 10 }}>{veliMesaj}</p>}

                    {veliOgrenciler.map((o, i) => (
                      <div key={i} style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 10, marginTop: 10 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{o.ogrenci.ad}</p>
                        {o.zayifDersler.length > 0 && (
                          <p style={{ fontSize: 12, color: COLORS.coral, marginBottom: 6 }}>Zayif dersler: {o.zayifDersler.join(", ")}</p>
                        )}
                        {o.gecmis.length === 0 ? (
                          <p style={{ fontSize: 12, color: COLORS.muted }}>Henuz quiz cozmemis.</p>
                        ) : (
                          o.gecmis.map((g, j) => (
                            <p key={j} style={{ fontSize: 12, margin: "2px 0" }}>
                              {g.ders} - {g.konu}: {g.dogru}/{g.toplam} dogru
                            </p>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={cikisYap} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600, cursor: "pointer" }}>Cikis Yap</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => setHesapModu("giris")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: hesapModu === "giris" ? COLORS.coral : "#fff", color: hesapModu === "giris" ? "#fff" : COLORS.ink, fontWeight: 600, cursor: "pointer" }}>Giris Yap</button>
                  <button onClick={() => setHesapModu("kayit")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: hesapModu === "kayit" ? COLORS.coral : "#fff", color: hesapModu === "kayit" ? "#fff" : COLORS.ink, fontWeight: 600, cursor: "pointer" }}>Kayit Ol</button>
                </div>
                {hesapModu === "kayit" && (
                  <>
                    <input value={adGir} onChange={(e) => setAdGir(e.target.value)} placeholder="Adin" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <button onClick={() => setRolSec("ogrenci")} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${rolSec === "ogrenci" ? COLORS.coral : COLORS.line}`, background: rolSec === "ogrenci" ? "#FFF1EF" : "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🎓 Ogrenciyim</button>
                      <button onClick={() => setRolSec("veli")} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${rolSec === "veli" ? COLORS.coral : COLORS.line}`, background: rolSec === "veli" ? "#FFF1EF" : "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>👪 Veliyim</button>
                    </div>
                  </>
                )}
                <input value={epostaGir} onChange={(e) => setEpostaGir(e.target.value)} placeholder="E-posta" type="email" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 8 }} />
                <input value={sifreGir} onChange={(e) => setSifreGir(e.target.value)} placeholder="Sifre (en az 6 karakter)" type="password" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, marginBottom: 10 }} />
                {hesapHata && <p style={{ color: COLORS.coral, fontSize: 13, marginBottom: 8 }}>{hesapHata}</p>}
                <button onClick={hesapGonder} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  {hesapModu === "giris" ? "Giris Yap" : "Hesap Olustur"}
                </button>
              </div>
            )}
          </div>
        )}

        {mod === "premium" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            {aktifAbonelik ? (
              <div>
                <p style={{ fontSize: 14, marginBottom: 10 }}>
                  Aktif plan: <strong>{aktifAbonelik.plan}</strong>
                  {aktifAbonelik.bitis && ` - Yenilenme: ${new Date(aktifAbonelik.bitis).toLocaleDateString("tr-TR")}`}
                </p>
                <button onClick={abonelikIptalEt} style={{ padding: "9px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.coral}`, background: "transparent", color: COLORS.coral, fontWeight: 600, cursor: "pointer" }}>
                  Aboneligi Iptal Et
                </button>
                {iptalMesaji && <p style={{ fontSize: 13, marginTop: 8, color: COLORS.muted }}>{iptalMesaji}</p>}
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
                  Sinirsiz konu anlatimi, soru uretimi ve calisma plani icin Premium'a gec.
                  <br /><em>Istedigin an, tek tikla, hic ugrasmadan iptal edebilirsin.</em>
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => premiumSatinAl("premium_aylik")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>
                    Aylik 99,90TL
                  </button>
                  <button onClick={() => premiumSatinAl("premium_yillik")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", color: COLORS.ink, fontWeight: 600 }}>
                    Yillik 899,90TL
                  </button>
                </div>
                {odemeHata && <p style={{ color: COLORS.coral, fontSize: 13 }}>{odemeHata}</p>}
                {checkoutHtml && <div dangerouslySetInnerHTML={{ __html: checkoutHtml }} />}
              </>
            )}
          </div>
        )}

        {mod === "sorucoz" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
              Cozemedigin sorunun fotografini yukle, yapay zeka saniyeler icinde adim adim cozsun.
            </p>
            <input
              type="file" accept="image/*" capture="environment"
              onChange={(e) => { const f = e.target.files[0]; if (f) { setSoruGorseli(URL.createObjectURL(f)); soruGorseliCoz(f); } }}
              style={{ marginBottom: 12 }}
            />
            {soruGorseli && <img src={soruGorseli} alt="Yuklenen soru" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 12, border: `1px solid ${COLORS.line}` }} />}
            {yukleniyor === "soru" && <p style={{ fontSize: 13, color: COLORS.muted }}>Cozuluyor...</p>}
            {soruCozumu && <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>{soruCozumu}</div>}
          </div>
        )}

        {mod === "kocluk" && (
          <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 8 }}>
              ZAYIF DERSLER {otomatikTespit && <span style={{ color: COLORS.coral }}>- gecmis performansina gore otomatik tespit edildi</span>}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {DERSLER.map((d) => {
                const s = zayifDersler.includes(d.ad);
                return <button key={d.ad} onClick={() => dersToggle(d.ad)} style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${s ? COLORS.coral : COLORS.line}`, background: s ? "#FFF1EF" : "#fff", color: COLORS.ink }}>{d.emoji} {d.ad}</button>;
              })}
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>HAFTALIK SAAT</label>
                <input type="number" value={haftalikSaat} onChange={(e) => setHaftalikSaat(Number(e.target.value))} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>KALAN HAFTA</label>
                <input type="number" value={kalanHafta} onChange={(e) => setKalanHafta(Number(e.target.value))} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.line}` }} />
              </div>
            </div>
            <button onClick={planOlustur} disabled={zayifDersler.length === 0 || yukleniyor} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600, opacity: zayifDersler.length === 0 ? 0.5 : 1 }}>
              {yukleniyor === "plan" ? "Hazirlaniyor..." : "Calisma Plani Olustur"}
            </button>
            {plan && <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.7 }}>{plan}</div>}
          </div>
        )}

        {mod === "anlatim" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
              {DERSLER.map((d) => (
                <button key={d.ad} onClick={() => setDers(d.ad)} style={{ padding: "12px 6px", borderRadius: 10, border: `1.5px solid ${ders === d.ad ? COLORS.coral : COLORS.line}`, background: ders === d.ad ? "#FFF1EF" : COLORS.page, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{d.emoji}</div>{d.ad}
                </button>
              ))}
            </div>
            <div style={{ background: COLORS.page, borderRadius: 12, padding: 14, marginBottom: 14, border: `1px solid ${COLORS.line}` }}>
              <input value={konu} onChange={(e) => setKonu(e.target.value)} placeholder="orn. Uslu Sayilar..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 14, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={konuAnlat} disabled={!ders || !konu.trim() || yukleniyor} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 600 }}>{yukleniyor === "aciklama" ? "Hazirlaniyor..." : "Konuyu Anlat"}</button>
                <button onClick={soruUret} disabled={!ders || !konu.trim() || yukleniyor} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${COLORS.ink}`, background: "transparent", fontWeight: 600 }}>{yukleniyor === "quiz" ? "Uretiliyor..." : "5 Soru Uret"}</button>
              </div>
            </div>
            {aciklama && <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, marginBottom: 14, border: `1px solid ${COLORS.line}`, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{aciklama}</div>}
            {quiz && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}` }}>
                {quiz.map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{i + 1}. {s.soru}</div>
                    {s.secenekler.map((sec, j) => {
                      const secili = cevaplar[i] === j, dogru = gonderildi && j === s.dogruIndex, yanlis = gonderildi && secili && j !== s.dogruIndex;
                      return <button key={j} onClick={() => !gonderildi && setCevaplar((c) => ({ ...c, [i]: j }))} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, borderRadius: 7, fontSize: 13, cursor: gonderildi ? "default" : "pointer", border: `1.5px solid ${dogru ? "#3DA35D" : yanlis ? COLORS.coral : secili ? COLORS.mustard : COLORS.line}`, background: dogru ? "#EAF7EE" : yanlis ? "#FFF1EF" : secili ? "#FEF8E8" : "#fff" }}>{sec}</button>;
                    })}
                  </div>
                ))}
                {!gonderildi ? (
                  <button onClick={cevaplariGonder} disabled={Object.keys(cevaplar).length < quiz.length} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 600 }}>Cevaplari Gonder</button>
                ) : (
                  <div style={{ textAlign: "center", fontWeight: 700, fontSize: 18, paddingTop: 4 }}>Sonuc: {dogruSayisi} / {quiz.length} dogru</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#7C8AA5", marginTop: 24 }}>
        <a href="/gizlilik" style={{ color: "#7C8AA5" }}>Gizlilik Politikasi</a> - <a href="/kullanim-sartlari" style={{ color: "#7C8AA5" }}>Kullanim Sartlari</a>
      </p>
    </div>
  );
}
