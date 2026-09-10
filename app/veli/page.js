"use client";
import { useState, useEffect, useRef } from "react";
import { bolumBasligiStili, listeSatiriStili } from "@/lib/tasarim-sistemi";

const T = {
  bg: "#F5F5F7", page: "#fff", ink: "#1D1D1F", muted: "#76767A",
  coral: "#0974E0", line: "#E5E5EA", mustard: "#A36606",
};

export default function VeliPaneli() {
  const [vEskiSifre, setVEskiSifre] = useState("");
  const [vYeniSifre, setVYeniSifre] = useState("");
  const [vSifreYukleniyor, setVSifreYukleniyor] = useState(false);
  const [vSifreSonuc, setVSifreSonuc] = useState(null);
  const [sifreFormAcik, setSifreFormAcik] = useState(false);
  async function hesapSifreDegistir() {
    setVSifreYukleniyor(true);
    setVSifreSonuc(null);
    try {
      const r = await fetch("/api/auth/sifre-degistir", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eskiSifre: vEskiSifre, yeniSifre: vYeniSifre }),
      });
      const d = await r.json();
      if (!r.ok) { setVSifreSonuc({ hata: d.error || "Sifre degistirilemedi" }); return; }
      setVSifreSonuc({ basari: true });
      setVEskiSifre(""); setVYeniSifre("");
    } catch (e) { setVSifreSonuc({ hata: "Baglanti hatasi" }); }
    finally { setVSifreYukleniyor(false); }
  }

  const [cikisToastGoster, setCikisToastGoster] = useState(false);
  const [girisAnimasyonuGoster, setGirisAnimasyonuGoster] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setGirisAnimasyonuGoster(false), 3400);
    return () => clearTimeout(t);
  }, []);
  const sonGeriBasimRef = useRef(0);
  useEffect(() => {
    window.history.pushState({ kxSahte: true }, "");
    const geriTusu = () => {
      const simdi = Date.now();
      if (simdi - sonGeriBasimRef.current < 2000) return;
      sonGeriBasimRef.current = simdi;
      setCikisToastGoster(true);
      setTimeout(() => setCikisToastGoster(false), 2000);
      window.history.pushState({ kxSahte: true }, "");
    };
    window.addEventListener("popstate", geriTusu);
    return () => window.removeEventListener("popstate", geriTusu);
  }, []);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullanici, setKullanici] = useState(null);
  const [ogrenciler, setOgrenciler] = useState(null);
  const [baglantiKodu, setBaglantiKodu] = useState("");
  const [baglantiMesaj, setBaglantiMesaj] = useState("");
  const [paketler, setPaketler] = useState(null);
  const [acikPaketOgrenci, setAcikPaketOgrenci] = useState(null);
  const [acikDetayOgrenci, setAcikDetayOgrenci] = useState(null);
  const [havaleBilgi, setHavaleBilgi] = useState(null);
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState("");
  const [cikisYukleniyor, setCikisYukleniyor] = useState(false);
  const [odemeGecmisi, setOdemeGecmisi] = useState(null);
  const [iadeAcikId, setIadeAcikId] = useState(null);
  const [iadeSebep, setIadeSebep] = useState("");
  const [iadeYukleniyor, setIadeYukleniyor] = useState(false);
  const [iadeMesaj, setIadeMesaj] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.girisYapmis || (data.kullanici?.rol !== "veli" && !data.kullanici?.ek_roller?.includes("veli"))) {
          window.location.href = "/veli-giris";
          return;
        }
        setKullanici(data.kullanici);
        await Promise.all([ogrencileriGetir(), odemeGecmisiniGetir()]);
        try {
          const pRes = await fetch("/api/paketler");
          const pData = await pRes.json();
          if (pRes.ok) setPaketler(pData.paketler || []);
        } catch {}
      } finally {
        setYukleniyor(false);
      }
    })();
  }, []);

  async function ogrencileriGetir() {
    try {
      const res = await fetch("/api/veli/ilerleme");
      const data = await res.json();
      if (res.ok) setOgrenciler(data.ogrenciler || []);
    } catch {}
  }

  async function baglan() {
    setBaglantiMesaj("");
    try {
      const res = await fetch("/api/veli/baglan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod: baglantiKodu }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBaglantiMesaj(`${data.ogrenciAdi} adli ogrenciye baglandin.`);
      setBaglantiKodu("");
      ogrencileriGetir();
    } catch (e) {
      setBaglantiMesaj(e.message || "Baglanti kurulamadi");
    }
  }

  async function havaleIleSatinAl(ogrenciId, plan) {
    setHata(""); setHavaleBilgi(null);
    setIslemYukleniyor(plan);
    try {
      const res = await fetch("/api/veli/havale-baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ogrenciId, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHavaleBilgi(data);
    } catch (e) {
      setHata(e.message);
    } finally {
      setIslemYukleniyor(null);
    }
  }

  async function cikisYap() {
    setCikisYukleniyor(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/veli-giris";
  }

  async function odemeGecmisiniGetir() {
    try {
      const res = await fetch("/api/veli/odeme-gecmisi");
      const data = await res.json();
      setOdemeGecmisi(data.odemeler || []);
    } catch {}
  }

  async function iadeTalebiGonder(odemeId) {
    setIadeMesaj("");
    setIadeYukleniyor(true);
    try {
      const res = await fetch("/api/iade-talebi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ odemeId, sebep: iadeSebep }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIadeMesaj("Iade talebin alindi, en kisa surede degerlendirilecek.");
      setIadeSebep("");
      setIadeAcikId(null);
      odemeGecmisiniGetir();
    } catch (e) {
      setIadeMesaj(e.message);
    } finally {
      setIadeYukleniyor(false);
    }
  }

  if (yukleniyor) {
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}><p aria-live="polite" style={{ color: T.muted }}>Yukleniyor...</p></main>;
  }

  if (!kullanici) {
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}><p aria-live="polite" style={{ color: T.muted }}>Yonlendiriliyor...</p></main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      {girisAnimasyonuGoster && (
        <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "#010F3F", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "#2AAE7F", filter: "blur(40px)", opacity: 0.5, top: "18%", left: "8%", animation: "kxYanip 2.4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "#3B82C4", filter: "blur(40px)", opacity: 0.5, top: "52%", right: "3%", animation: "kxYanip 2.4s ease-in-out infinite 0.6s" }} />
          <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "#6B5CE0", filter: "blur(40px)", opacity: 0.5, bottom: "8%", left: "18%", animation: "kxYanip 2.4s ease-in-out infinite 1.2s" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", opacity: 0, animation: "kxGiris 1.4s ease-out 0.3s forwards" }}>
            <img src="/icons/icon-512.png" alt="Karemux" style={{ width: 100, height: 100, borderRadius: 20, animation: "kxNefes 2.5s ease-in-out infinite" }} />
            <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginTop: 16, opacity: 0, animation: "kxGiris 1s ease-out 1.1s forwards" }}>KAREMUX</p>
          </div>
          <style>{`
            @keyframes kxYanip { 0%, 100% { opacity: 0.2; transform: scale(0.9); } 50% { opacity: 0.4; transform: scale(1.1); } }
            @keyframes kxGiris { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
            @keyframes kxNefes { 0%, 100% { filter: drop-shadow(0 0 20px rgba(76,201,240,0.5)); } 50% { filter: drop-shadow(0 0 32px rgba(76,201,240,0.8)); } }
          `}</style>
        </div>
      )}

      {cikisToastGoster && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 300, background: "rgba(0,0,0,0.8)", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, whiteSpace: "nowrap" }}>
          Çıkmak için tekrar geri tuşuna bas
        </div>
      )}
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Veli Paneli</h1>
          <button onClick={cikisYap} disabled={cikisYukleniyor} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.line}`, background: "none", color: T.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            {cikisYukleniyor ? "..." : "Çıkış Yap"}
          </button>
        </div>
        <a href="https://github.com/Mehmetaltas/KAREMUX/releases/download/veli-apk-latest/karemux-veli-imzali.apk" style={{ display: "inline-block", padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.line}`, color: T.ink, fontSize: 11.5, fontWeight: 600, textDecoration: "none", marginBottom: 12 }}>📱 Uygulamayı İndir</a>

        <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#8A8A8E", letterSpacing: 0.5, marginBottom: 6 }}>KAREMUX VELİ</p>
        <svg viewBox="0 0 380 190" style={{ width: "100%", maxWidth: 220, display: "block", margin: "0 auto 16px" }}>
          <defs>
            <linearGradient id="kxMaviMuhur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7FC4E8" />
              <stop offset="55%" stopColor="#3B82C4" />
              <stop offset="100%" stopColor="#215E96" />
            </linearGradient>
          </defs>
          <style>{`
            @keyframes kxPariltiYanSon { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            @keyframes kxMuhurNefes { 0%, 100% { filter: drop-shadow(0 0 3px rgba(59,130,196,0.5)); } 50% { filter: drop-shadow(0 0 14px rgba(59,130,196,0.9)); } }
            .kx-isik { animation: kxPariltiYanSon 1.4s ease-in-out infinite; }
            .kx-isik2 { animation: kxPariltiYanSon 1.4s ease-in-out infinite 0.4s; }
            .kx-isik3 { animation: kxPariltiYanSon 1.4s ease-in-out infinite 0.8s; }
            .kx-muhur-grup { animation: kxMuhurNefes 2.2s ease-in-out infinite; }
          `}</style>
          <g className="kx-muhur-grup" transform="translate(190,95)">
            <polygon points="0,-75 12,-50 40,-62 30,-36 62,-40 42,-18 75,0 42,18 62,40 30,36 40,62 12,50 0,75 -12,50 -40,62 -30,36 -62,40 -42,18 -75,0 -42,-18 -62,-40 -30,-36 -40,-62 -12,-50" fill="url(#kxMaviMuhur)" stroke="#215E96" strokeWidth="1.5" />
            <circle r="52" fill="#FFFFFF" stroke="#3B82C4" strokeWidth="2.5" />
            <circle className="kx-isik" r="3" cx="-30" cy="-38" fill="#FFFFFF" />
            <circle className="kx-isik2" r="2.5" cx="34" cy="-30" fill="#FFFFFF" />
            <circle className="kx-isik3" r="3" cx="0" cy="-46" fill="#FFFFFF" />
            <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#215E96">MAARİF</text>
            <text x="0" y="16" textAnchor="middle" fontSize="14" fontWeight="700" fill="#215E96">MODELİ</text>
            <text x="0" y="40" textAnchor="middle" fontSize="20" fill="#3B82C4">✓</text>
          </g>
        </svg>

        <p style={bolumBasligiStili(T)}>HESAP</p>
        <div style={{ background: T.page, borderRadius: 12, border: `1px solid ${T.line}`, marginBottom: 16, padding: "0 16px" }}>
          <div onClick={() => setSifreFormAcik((a) => !a)} style={{ ...listeSatiriStili(T, { ilkSatir: true }), justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <i className="ti ti-lock" style={{ fontSize: 20, color: T.muted }} />
              <span style={{ fontSize: 14 }}>Şifreni değiştir</span>
            </div>
            <i className={`ti ti-chevron-${sifreFormAcik ? "up" : "down"}`} style={{ fontSize: 16, color: T.muted }} />
          </div>
          {sifreFormAcik && (
            <div style={{ paddingBottom: 16 }}>
              <input type="password" placeholder="Eski şifre" value={vEskiSifre} onChange={(e) => setVEskiSifre(e.target.value)} aria-label="Eski şifre" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 8, fontSize: 13, boxSizing: "border-box" }} />
              <input type="password" placeholder="Yeni şifre (en az 6 karakter)" value={vYeniSifre} onChange={(e) => setVYeniSifre(e.target.value)} aria-label="Yeni şifre" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.line}`, marginBottom: 10, fontSize: 13, boxSizing: "border-box" }} />
              {vSifreSonuc?.hata && <p role="alert" style={{ color: "#C0392B", fontSize: 12, marginBottom: 8 }}>{vSifreSonuc.hata}</p>}
              {vSifreSonuc?.basari && <p style={{ color: "#1E7A46", fontSize: 12, marginBottom: 8 }}>Şifren güncellendi ✓</p>}
              <button onClick={hesapSifreDegistir} disabled={vSifreYukleniyor || !vEskiSifre || !vYeniSifre} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: T.accent || "#B85C38", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: (vSifreYukleniyor || !vEskiSifre || !vYeniSifre) ? 0.5 : 1 }}>{vSifreYukleniyor ? "Güncelleniyor..." : "Şifreyi Güncelle"}</button>
            </div>
          )}
        </div>

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Ogrenci Bagla</h2>
          <div style={{ display: "flex", gap: 6 }}>
            <input aria-label="Ogrencinin baglanti kodu" value={baglantiKodu} onChange={(e) => setBaglantiKodu(e.target.value)} placeholder="Ogrencinin baglanti kodu" style={{ flex: 1, padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 13 }} />
            <button onClick={baglan} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: T.coral, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Bagla</button>
          </div>
          {baglantiMesaj && <p style={{ fontSize: 12, marginTop: 8, color: T.muted }}>{baglantiMesaj}</p>}
        </section>

        {!ogrenciler ? (
          <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p>
        ) : ogrenciler.length === 0 ? (
          <p style={{ fontSize: 13, color: T.muted }}>Henuz bagli bir ogrenci yok.</p>
        ) : ogrenciler.map((o) => (
          <section key={o.ogrenci.id} style={{ background: T.page, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${T.line}` }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{o.ogrenci.ad} <span style={{ fontWeight: 400, color: T.muted, fontSize: 12 }}>({o.ogrenci.sinif}. sinif)</span></h2>
            <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 8 }}>{o.oneri}</p>
            {o.zayifDersler.length > 0 && (
              <p style={{ fontSize: 12, color: T.coral, marginBottom: 8 }}>Zayif dersler: {o.zayifDersler.join(", ")}</p>
            )}
            <p style={{ fontSize: 11.5, color: T.muted, marginBottom: 12 }}>Bu hafta aktif gun: {o.buHaftaAktifGun}/7</p>

            <button onClick={() => setAcikDetayOgrenci(acikDetayOgrenci === o.ogrenci.id ? null : o.ogrenci.id)} style={{ padding: "8px 14px", borderRadius: 6, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 12, cursor: "pointer", marginRight: 8, marginBottom: 8 }}>
              {acikDetayOgrenci === o.ogrenci.id ? "Detayli Raporu Gizle" : "Detayli Rapor"}
            </button>

            {acikDetayOgrenci === o.ogrenci.id && (
              <div style={{ marginBottom: 12, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                {o.netOzet?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Son 30 Gun — Ders Bazinda Ortalama Net</p>
                    {o.netOzet.map((n, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.line}`, fontSize: 12 }}>
                        <span>{n.ders}</span>
                        <span style={{ fontWeight: 700 }}>{n.ortalama_net} net ({n.test_sayisi} test)</span>
                      </div>
                    ))}
                  </div>
                )}
                {o.enZayifKonular?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>En Zayif Konular</p>
                    {o.enZayifKonular.map((z, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.line}`, fontSize: 11.5 }}>
                        <span>{z.ders} · {z.alt_konu}</span>
                        <span style={{ color: "#B23A2E", fontWeight: 700 }}>{z.hata_sayisi} hata</span>
                      </div>
                    ))}
                  </div>
                )}
                {o.gecmis?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Konu Bazinda Gecmis</p>
                    {o.gecmis.slice(0, 10).map((g, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.line}`, fontSize: 11.5 }}>
                        <span>{g.ders} · {g.konu}</span>
                        <span style={{ color: T.muted }}>{g.dogru}/{g.toplam} dogru</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {o.kurumDuyurulari?.length > 0 && (
              <div style={{ background: "#FDF6E8", borderRadius: 10, padding: 12, marginBottom: 12, border: "1px solid #E8D9A8" }}>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>📢 Kurum Duyuruları</p>
                {o.kurumDuyurulari.map((d) => (
                  <div key={d.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #E8D9A8" }}>
                    <p style={{ fontSize: 12, fontWeight: 700 }}>{d.baslik}</p>
                    <p style={{ fontSize: 11.5, color: T.muted, whiteSpace: "pre-wrap" }}>{d.icerik}</p>
                    <p style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{new Date(d.olusturulma).toLocaleDateString("tr-TR")}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { setAcikPaketOgrenci(acikPaketOgrenci === o.ogrenci.id ? null : o.ogrenci.id); setHavaleBilgi(null); setHata(""); }} style={{ padding: "8px 14px", borderRadius: 6, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              {acikPaketOgrenci === o.ogrenci.id ? "Paketleri Gizle" : "Bu Ogrenci Icin Paket Satin Al"}
            </button>

            {acikPaketOgrenci === o.ogrenci.id && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                {!paketler ? (
                  <p style={{ fontSize: 12, color: T.muted }}>Paketler yukleniyor...</p>
                ) : paketler.filter((p) => !p.anahtar?.startsWith("yillik_") || p.anahtar === ({ 5: "yillik_5_sinif", 6: "yillik_6_sinif", 7: "yillik_7_sinif", 8: "yillik_8_sinif_lgs" }[o.ogrenci.sinif])).map((p) => (
                  <div key={p.anahtar} style={{ marginBottom: 8 }}>
                    <button onClick={() => havaleIleSatinAl(o.ogrenci.id, p.anahtar)} disabled={islemYukleniyor === p.anahtar} style={{ width: "100%", padding: "9px 0", borderRadius: 6, border: `1.5px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                      {islemYukleniyor === p.anahtar ? "Hazirlaniyor..." : `🏦 ${p.ad} — ${Number(p.fiyat_tl).toLocaleString("tr-TR")}₺`}
                    </button>
                  </div>
                ))}
                {hata && <p style={{ color: "#B23A2E", fontSize: 12.5, marginTop: 6 }}>{hata}</p>}
                {havaleBilgi && (
                  <div role="alert" style={{ background: "#FFF8E8", border: `1.5px solid ${T.mustard}`, borderRadius: 10, padding: 14, marginTop: 10 }}>
                    <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Havale/EFT Bilgileri</p>
                    <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Banka:</b> {havaleBilgi.bankaAdi}</p>
                    <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Hesap Sahibi:</b> {havaleBilgi.hesapSahibi}</p>
                    <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>IBAN:</b> {havaleBilgi.iban}</p>
                    <p style={{ fontSize: 12.5, marginBottom: 4 }}><b>Tutar:</b> {havaleBilgi.tutar}₺</p>
                    <p style={{ fontSize: 12.5, marginBottom: 0, color: "#B23A2E", fontWeight: 700 }}>Aciklama alanina MUTLAKA su kodu yaz: {havaleBilgi.referans}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        ))}

        <section style={{ background: T.page, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${T.line}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Ödeme Geçmişim</h2>
          {!odemeGecmisi ? <p aria-live="polite" style={{ fontSize: 13, color: T.muted }}>Yukleniyor...</p> : odemeGecmisi.length === 0 ? (
            <p style={{ fontSize: 13, color: T.muted }}>Henuz bir odeme yapmadin.</p>
          ) : odemeGecmisi.map((o) => (
            <div key={o.id} style={{ borderBottom: `1px solid ${T.line}`, padding: "10px 0" }}>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{o.ogrenci_ad} — {o.plan}</p>
              <p style={{ fontSize: 12, color: T.muted }}>{o.tutar}₺ · {o.yontem} · {o.durum} · {new Date(o.olusturulma).toLocaleDateString("tr-TR")}</p>
              {o.iade_id && <p style={{ fontSize: 11.5, color: T.mustard, marginTop: 4 }}>İade talebi: {o.iade_durumu}</p>}
              {o.iadeHakkiVar && (
                <div style={{ marginTop: 6 }}>
                  {iadeAcikId === o.id ? (
                    <div>
                      <textarea aria-label="Iade sebebi" value={iadeSebep} onChange={(e) => setIadeSebep(e.target.value)} placeholder="Iade sebebini kisaca yaz (opsiyonel)" rows={2} style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.line}`, marginBottom: 6, fontSize: 12.5, fontFamily: "inherit" }} />
                      <button onClick={() => iadeTalebiGonder(o.id)} disabled={iadeYukleniyor} style={{ padding: "7px 12px", borderRadius: 6, border: "none", background: "#B23A2E", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", marginRight: 6 }}>
                        {iadeYukleniyor ? "Gonderiliyor..." : "Iade Talebini Gonder"}
                      </button>
                      <button onClick={() => { setIadeAcikId(null); setIadeMesaj(""); }} style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${T.line}`, background: "none", color: T.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Vazgeç</button>
                    </div>
                  ) : (
                    <button onClick={() => setIadeAcikId(o.id)} style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${T.line}`, background: "none", color: T.ink, fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>İlk Hafta Garantisi — İade Talebi Aç</button>
                  )}
                  {iadeAcikId === o.id && iadeMesaj && <p style={{ fontSize: 11.5, color: iadeMesaj.includes("alindi") ? "#2E7D4F" : "#B23A2E", marginTop: 6 }}>{iadeMesaj}</p>}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
