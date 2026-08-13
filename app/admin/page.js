"use client";
import { useState, useEffect } from "react";

// ==== Tasarim tokenlari - koyu "kontrol odasi" estetigi ====
const T = {
  bg: "#0B0E14",
  surface: "#141821",
  surfaceHover: "#1B212C",
  border: "#242B38",
  text: "#E8ECF1",
  textMuted: "#7C8798",
  accent: "#22D3AA",       // gelir/pozitif
  accentSoft: "#0F2E27",
  danger: "#F0625A",
  dangerSoft: "#301818",
  amber: "#E8B33C",
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Roboto Mono', ui-monospace, monospace",
};

function KpiKart({ etiket, deger, renk, altYazi, ikon }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", flex: "1 1 140px", minWidth: 140 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: T.textMuted, letterSpacing: 0.4, textTransform: "uppercase" }}>{etiket}</span>
        <span style={{ fontSize: 15, opacity: 0.7 }}>{ikon}</span>
      </div>
      <p style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: renk || T.text, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>{deger}</p>
      {altYazi && <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{altYazi}</p>}
    </div>
  );
}

function Panel({ baslik, ikon, children, sagUst }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 7 }}>
          <span>{ikon}</span> {baslik}
        </p>
        {sagUst}
      </div>
      {children}
    </div>
  );
}

const girdiStil = { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#0F131B", color: T.text, fontSize: 13, fontFamily: T.font, outline: "none" };
const etiketStil = { fontSize: 10.5, fontWeight: 600, color: T.textMuted, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.3 };
function butonStil(aktif, renk) {
  return { padding: "9px 16px", borderRadius: 8, border: "none", background: aktif ? (renk || T.accent) : "#232A38", color: aktif ? "#08110D" : T.textMuted, fontWeight: 700, fontSize: 12.5, cursor: aktif ? "pointer" : "default", transition: "background 0.15s" };
}

export default function YonetimPaneli() {
  const [sifre, setSifre] = useState("");
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [sekme, setSekme] = useState("genel");
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");

  const [muhasebeVeri, setMuhasebeVeri] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [duzenlenenFiyatlar, setDuzenlenenFiyatlar] = useState({});
  const [fiyatKaydediliyor, setFiyatKaydediliyor] = useState(null);

  const [giderKategori, setGiderKategori] = useState("muhasebe");
  const [giderTutar, setGiderTutar] = useState("");
  const [giderAciklama, setGiderAciklama] = useState("");
  const [giderTekrarlayan, setGiderTekrarlayan] = useState(false);
  const [giderEkleniyor, setGiderEkleniyor] = useState(false);

  const [taksitTutar, setTaksitTutar] = useState("");
  const [taksitSayisi, setTaksitSayisi] = useState(1);

  const [yeniOgretmenAd, setYeniOgretmenAd] = useState("");
  const [yeniOgretmenBrans, setYeniOgretmenBrans] = useState("Matematik");
  const [yeniOgretmenGun, setYeniOgretmenGun] = useState(1);
  const [yeniOgretmenBaslangic, setYeniOgretmenBaslangic] = useState("16:00");
  const [yeniOgretmenBitis, setYeniOgretmenBitis] = useState("20:00");
  const [ogretmenEkleniyor, setOgretmenEkleniyor] = useState(false);

  const [duyuruMesaji, setDuyuruMesaji] = useState("");
  const [duyuruIl, setDuyuruIl] = useState("");
  const [duyuruSinif, setDuyuruSinif] = useState("");
  const [duyuruGonderiliyor, setDuyuruGonderiliyor] = useState(false);
  const [duyuruSonuc, setDuyuruSonuc] = useState(null);

  const [ulusalAd, setUlusalAd] = useState("");
  const [ulusalSinif, setUlusalSinif] = useState("8");
  const [ulusalDers, setUlusalDers] = useState("Matematik");
  const [ulusalSaat, setUlusalSaat] = useState(24);
  const [ulusalOlusturuluyor, setUlusalOlusturuluyor] = useState(false);

  function mesajTemizle() { setHata(""); setBasari(""); }

  async function girisDene() {
    mesajTemizle();
    setYukleniyor(true);
    try {
      const res = await fetch(`/api/admin/muhasebe?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş başarısız");
      setMuhasebeVeri(data);
      setGirisYapildi(true);
    } catch (e) {
      setHata(e.message || "Şifre hatalı ya da bağlantı sorunu.");
    } finally {
      setYukleniyor(false);
    }
  }

  async function verileriYenile() {
    try {
      const res = await fetch(`/api/admin/muhasebe?sifre=${encodeURIComponent(sifre)}`);
      const data = await res.json();
      if (res.ok) setMuhasebeVeri(data);
    } catch {}
  }

  async function fiyatKaydet(paketId) {
    const yeniFiyat = duzenlenenFiyatlar[paketId];
    if (yeniFiyat == null || yeniFiyat === "") return;
    setFiyatKaydediliyor(paketId); mesajTemizle();
    try {
      const res = await fetch("/api/admin/muhasebe", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, paketId, yeniFiyat: Number(yeniFiyat) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Fiyat güncellendi."); verileriYenile();
    } catch (e) { setHata(e.message); } finally { setFiyatKaydediliyor(null); }
  }

  async function giderEkle() {
    if (!giderTutar) return;
    setGiderEkleniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/muhasebe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, kategori: giderKategori, tutarTl: Number(giderTutar), aciklama: giderAciklama, tekrarlayan: giderTekrarlayan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari("Gider eklendi."); setGiderTutar(""); setGiderAciklama(""); setGiderTekrarlayan(false);
      verileriYenile();
    } catch (e) { setHata(e.message); } finally { setGiderEkleniyor(false); }
  }

  function taksitHesapla(tutar, taksit) {
    if (!tutar || taksit < 1) return null;
    const oranlar = { 1: 0.029, 2: 0.032, 3: 0.035, 6: 0.039, 9: 0.042, 12: 0.045 };
    const enYakin = Object.keys(oranlar).map(Number).reduce((en, k) => (Math.abs(k - taksit) < Math.abs(en - taksit) ? k : en));
    const oran = oranlar[enYakin];
    const komisyon = tutar * oran + 0.25;
    return { komisyon: komisyon.toFixed(2), net: (tutar - komisyon).toFixed(2), oran: (oran * 100).toFixed(2) };
  }

  async function ogretmenEkle() {
    if (!yeniOgretmenAd) return;
    if (yeniOgretmenBitis <= yeniOgretmenBaslangic) { setHata("Bitiş saati başlangıçtan sonra olmalı."); return; }
    setOgretmenEkleniyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/admin/ogretmen", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, ad: yeniOgretmenAd, brans: yeniOgretmenBrans, musaitlik: [{ gun: yeniOgretmenGun, baslangic: yeniOgretmenBaslangic, bitis: yeniOgretmenBitis }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${yeniOgretmenAd}" eklendi.`); setYeniOgretmenAd("");
    } catch (e) { setHata(e.message); } finally { setOgretmenEkleniyor(false); }
  }

  async function duyuruGonder() {
    if (!duyuruMesaji) return;
    setDuyuruGonderiliyor(true); mesajTemizle(); setDuyuruSonuc(null);
    try {
      const res = await fetch("/api/admin/duyuru", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, mesaj: duyuruMesaji, il: duyuruIl || null, sinif: duyuruSinif ? Number(duyuruSinif) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDuyuruSonuc(data); setDuyuruMesaji("");
    } catch (e) { setHata(e.message); } finally { setDuyuruGonderiliyor(false); }
  }

  async function ulusalOlustur() {
    if (!ulusalAd) return;
    setUlusalOlusturuluyor(true); mesajTemizle();
    try {
      const res = await fetch("/api/ulusal-deneme/olustur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yoneticiSifre: sifre, ad: ulusalAd, sinif: Number(ulusalSinif), ders: ulusalDers, acikKalmaSaati: ulusalSaat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBasari(`"${ulusalAd}" başlatıldı.`); setUlusalAd("");
    } catch (e) { setHata(e.message); } finally { setUlusalOlusturuluyor(false); }
  }

  useEffect(() => { if (basari) { const t = setTimeout(() => setBasari(""), 4000); return () => clearTimeout(t); } }, [basari]);

  // ==== GİRİŞ EKRANI ====
  if (!girisYapildi) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font, padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 20 }}>🔐</div>
            <p style={{ color: T.text, fontSize: 17, fontWeight: 700 }}>Karemux Yönetim</p>
            <p style={{ color: T.textMuted, fontSize: 12, marginTop: 3 }}>Bu alan sadece yöneticiye açıktır</p>
          </div>
          <input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} onKeyDown={(e) => e.key === "Enter" && girisDene()}
            placeholder="Yönetici şifresi" style={{ ...girdiStil, padding: "12px 14px", fontSize: 14, marginBottom: 10 }} autoFocus />
          <button onClick={girisDene} disabled={yukleniyor || !sifre} style={{ ...butonStil(!!sifre), width: "100%", padding: "12px 0", fontSize: 13.5 }}>
            {yukleniyor ? "Kontrol ediliyor..." : "Giriş Yap"}
          </button>
          {hata && <p style={{ color: T.danger, fontSize: 12, marginTop: 12, textAlign: "center" }}>{hata}</p>}
        </div>
      </div>
    );
  }

  const SEKMELER = [
    ["genel", "📊 Genel Bakış"],
    ["paketler", "💰 Paketler"],
    ["giderler", "🧾 Giderler"],
    ["ogretmen", "🎓 Öğretmenler"],
    ["duyuru", "📢 Duyuru"],
    ["deneme", "🇹🇷 Ulusal Deneme"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, paddingBottom: 60 }}>
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔐</div>
          <p style={{ fontWeight: 700, fontSize: 14.5 }}>Karemux Yönetim</p>
        </div>
        <button onClick={() => { setGirisYapildi(false); setSifre(""); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 11.5, cursor: "pointer" }}>Çıkış</button>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", gap: 6, overflowX: "auto" }}>
        {SEKMELER.map(([k, etiket]) => (
          <button key={k} onClick={() => { setSekme(k); mesajTemizle(); }} style={{ ...butonStil(true, sekme === k ? T.accent : "#1B212C"), color: sekme === k ? "#08110D" : T.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>
            {etiket}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        {(hata || basari) && (
          <div style={{ background: hata ? T.dangerSoft : T.accentSoft, border: `1px solid ${hata ? T.danger : T.accent}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: hata ? T.danger : T.accent }}>
            {hata || basari}
          </div>
        )}

        {sekme === "genel" && muhasebeVeri && (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <KpiKart etiket="Bu Ay Gelir" deger={`${muhasebeVeri.buAy.gelir.toFixed(0)} ₺`} renk={T.accent} altYazi={`${muhasebeVeri.buAy.satisAdedi} satış`} ikon="💵" />
              <KpiKart etiket="Bu Ay Gider" deger={`${muhasebeVeri.buAy.gider.toFixed(0)} ₺`} renk={T.danger} ikon="📉" />
              <KpiKart etiket={muhasebeVeri.buAy.kar >= 0 ? "Bu Ay Kâr" : "Bu Ay Zarar"} deger={`${muhasebeVeri.buAy.kar.toFixed(0)} ₺`} renk={muhasebeVeri.buAy.kar >= 0 ? T.accent : T.danger} ikon={muhasebeVeri.buAy.kar >= 0 ? "📈" : "⚠️"} />
              <KpiKart etiket="Tahmini AI Maliyeti" deger={`~${muhasebeVeri.buAy.tahminiAiMaliyetTl || 0} ₺`} renk={T.amber} altYazi="Gerçek fatura için sağlayıcı paneli" ikon="🤖" />
            </div>

            <Panel baslik="Genel Toplam (Kuruluştan Beri)" ikon="🏦">
              <div style={{ display: "flex", gap: 20 }}>
                <div><p style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 3 }}>GELİR</p><p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700 }}>{muhasebeVeri.genel.gelir.toFixed(0)} ₺</p></div>
                <div><p style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 3 }}>GİDER</p><p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700 }}>{muhasebeVeri.genel.gider.toFixed(0)} ₺</p></div>
                <div><p style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 3 }}>{muhasebeVeri.genel.kar >= 0 ? "KÂR" : "ZARAR"}</p><p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: muhasebeVeri.genel.kar >= 0 ? T.accent : T.danger }}>{muhasebeVeri.genel.kar.toFixed(0)} ₺</p></div>
              </div>
            </Panel>

            {muhasebeVeri.paketBazindaSatis?.some((p) => p.adet > 0) && (
              <Panel baslik="Paket Bazında Satış (Bu Ay)" ikon="📦">
                {muhasebeVeri.paketBazindaSatis.filter((p) => p.adet > 0).map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < muhasebeVeri.paketBazindaSatis.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 12.5 }}>
                    <span style={{ color: T.textMuted }}>{p.ad}</span>
                    <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{p.adet} adet · {Number(p.toplam).toFixed(0)} ₺</span>
                  </div>
                ))}
              </Panel>
            )}

            {muhasebeVeri.giderKategoriler?.length > 0 && (
              <Panel baslik="Gider Dağılımı (Bu Ay)" ikon="🧾">
                {muhasebeVeri.giderKategoriler.map((g, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < muhasebeVeri.giderKategoriler.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 12.5 }}>
                    <span style={{ color: T.textMuted, textTransform: "capitalize" }}>{g.kategori}</span>
                    <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{Number(g.toplam).toFixed(0)} ₺</span>
                  </div>
                ))}
              </Panel>
            )}
          </>
        )}

        {sekme === "paketler" && muhasebeVeri && (
          <Panel baslik="Satış Paketleri" ikon="💰">
            {muhasebeVeri.paketler?.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, background: "#0F131B", borderRadius: 9, padding: "10px 12px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600 }}>{p.ad}</p>
                  <p style={{ fontSize: 10.5, color: T.textMuted }}>{p.sure_gun ? `${p.sure_gun} gün erişim` : `${p.kredi_miktari} kredi`}</p>
                </div>
                <input type="number" defaultValue={p.fiyat_tl} onChange={(e) => setDuzenlenenFiyatlar((eski) => ({ ...eski, [p.id]: e.target.value }))}
                  style={{ ...girdiStil, width: 80, textAlign: "right", padding: "7px 9px" }} />
                <span style={{ color: T.textMuted, fontSize: 11 }}>₺</span>
                <button onClick={() => fiyatKaydet(p.id)} disabled={fiyatKaydediliyor === p.id || duzenlenenFiyatlar[p.id] == null}
                  style={{ ...butonStil(duzenlenenFiyatlar[p.id] != null), padding: "7px 12px", fontSize: 11 }}>
                  {fiyatKaydediliyor === p.id ? "..." : "Kaydet"}
                </button>
              </div>
            ))}
          </Panel>
        )}

        {sekme === "giderler" && (
          <>
            <Panel baslik="Yeni Gider Ekle" ikon="➕">
              <label style={etiketStil}>Kategori</label>
              <select value={giderKategori} onChange={(e) => setGiderKategori(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
                {["muhasebe", "bagkur", "vergi", "ai_maliyeti", "domain", "sunucu", "hosting", "odeme_komisyonu", "pazarlama", "diger"].map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <label style={etiketStil}>Tutar (₺)</label>
              <input type="number" value={giderTutar} onChange={(e) => setGiderTutar(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={etiketStil}>Açıklama (opsiyonel)</label>
              <input value={giderAciklama} onChange={(e) => setGiderAciklama(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, fontSize: 12, color: T.textMuted }}>
                <input type="checkbox" checked={giderTekrarlayan} onChange={(e) => setGiderTekrarlayan(e.target.checked)} />
                Her ay otomatik tekrarla
              </label>
              <button onClick={giderEkle} disabled={giderEkleniyor || !giderTutar} style={{ ...butonStil(!!giderTutar, T.danger), width: "100%", padding: "10px 0" }}>
                {giderEkleniyor ? "Ekleniyor..." : "Gider Ekle"}
              </button>
            </Panel>

            {muhasebeVeri?.sonGiderler?.length > 0 && (
              <Panel baslik="Son Giderler" ikon="🧾">
                {muhasebeVeri.sonGiderler.map((g) => (
                  <div key={g.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}>
                    <div>
                      <span style={{ textTransform: "capitalize" }}>{g.kategori}</span>
                      {g.aciklama && <span style={{ color: T.textMuted }}> — {g.aciklama}</span>}
                    </div>
                    <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.danger }}>{Number(g.tutar_tl).toFixed(0)} ₺</span>
                  </div>
                ))}
              </Panel>
            )}

            <Panel baslik="Taksit Komisyon Hesaplayıcı" ikon="📐" sagUst={<span style={{ fontSize: 9.5, color: T.textMuted }}>tahmini</span>}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input type="number" value={taksitTutar} onChange={(e) => setTaksitTutar(e.target.value)} placeholder="Satış tutarı" style={girdiStil} />
                <select value={taksitSayisi} onChange={(e) => setTaksitSayisi(Number(e.target.value))} style={girdiStil}>
                  {[1, 2, 3, 6, 9, 12].map((t) => <option key={t} value={t}>{t} Taksit</option>)}
                </select>
              </div>
              {taksitTutar && (() => {
                const s = taksitHesapla(Number(taksitTutar), taksitSayisi);
                return s ? <p style={{ fontSize: 12.5 }}>Komisyon (~%{s.oran}): <strong style={{ color: T.danger }}>{s.komisyon} ₺</strong> · Net: <strong style={{ color: T.accent }}>{s.net} ₺</strong></p> : null;
              })()}
            </Panel>
          </>
        )}

        {sekme === "ogretmen" && (
          <Panel baslik="Yeni Öğretmen Ekle" ikon="🎓">
            <label style={etiketStil}>Ad Soyad</label>
            <input value={yeniOgretmenAd} onChange={(e) => setYeniOgretmenAd(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
            <label style={etiketStil}>Branş</label>
            <select value={yeniOgretmenBrans} onChange={(e) => setYeniOgretmenBrans(e.target.value)} style={{ ...girdiStil, marginBottom: 10 }}>
              {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce", "Rehberlik"].map((d) => <option key={d} value={d}>{d === "Rehberlik" ? "🧭 Rehberlik Danışmanlığı" : d}</option>)}
            </select>
            <label style={etiketStil}>Haftalık Müsaitlik</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <select value={yeniOgretmenGun} onChange={(e) => setYeniOgretmenGun(Number(e.target.value))} style={girdiStil}>
                {["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"].map((g, i) => <option key={i} value={i}>{g}</option>)}
              </select>
              <input type="time" value={yeniOgretmenBaslangic} onChange={(e) => setYeniOgretmenBaslangic(e.target.value)} style={girdiStil} />
              <input type="time" value={yeniOgretmenBitis} onChange={(e) => setYeniOgretmenBitis(e.target.value)} style={girdiStil} />
            </div>
            <button onClick={ogretmenEkle} disabled={ogretmenEkleniyor || !yeniOgretmenAd} style={{ ...butonStil(!!yeniOgretmenAd), width: "100%", padding: "10px 0" }}>
              {ogretmenEkleniyor ? "Ekleniyor..." : "Öğretmen Ekle"}
            </button>
          </Panel>
        )}

        {sekme === "duyuru" && (
          <Panel baslik="Hedefli Duyuru Gönder (Telegram)" ikon="📢">
            <label style={etiketStil}>Mesaj</label>
            <textarea value={duyuruMesaji} onChange={(e) => setDuyuruMesaji(e.target.value)} style={{ ...girdiStil, minHeight: 70, marginBottom: 10, fontFamily: T.font }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={duyuruIl} onChange={(e) => setDuyuruIl(e.target.value)} placeholder="İl (boş = tümü)" style={girdiStil} />
              <select value={duyuruSinif} onChange={(e) => setDuyuruSinif(e.target.value)} style={girdiStil}>
                <option value="">Tüm Sınıflar</option>
                {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
              </select>
            </div>
            <button onClick={duyuruGonder} disabled={duyuruGonderiliyor || !duyuruMesaji} style={{ ...butonStil(!!duyuruMesaji), width: "100%", padding: "10px 0" }}>
              {duyuruGonderiliyor ? "Gönderiliyor..." : "Duyuruyu Gönder"}
            </button>
            {duyuruSonuc && <p style={{ fontSize: 12, color: T.accent, marginTop: 10 }}>✓ {duyuruSonuc.basarili}/{duyuruSonuc.hedeflenen} kişiye ulaştırıldı.</p>}
          </Panel>
        )}

        {sekme === "deneme" && (
          <Panel baslik="Türkiye Geneli Deneme Başlat" ikon="🇹🇷">
            <label style={etiketStil}>Deneme Adı</label>
            <input value={ulusalAd} onChange={(e) => setUlusalAd(e.target.value)} placeholder="Örn: 15. Hafta Türkiye Denemesi" style={{ ...girdiStil, marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <select value={ulusalSinif} onChange={(e) => setUlusalSinif(e.target.value)} style={girdiStil}>
                {[5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. Sınıf</option>)}
              </select>
              <select value={ulusalDers} onChange={(e) => setUlusalDers(e.target.value)} style={girdiStil}>
                {["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce"].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <label style={etiketStil}>Açık Kalma Süresi (saat)</label>
            <input type="number" value={ulusalSaat} onChange={(e) => setUlusalSaat(Number(e.target.value))} style={{ ...girdiStil, marginBottom: 14 }} />
            <button onClick={ulusalOlustur} disabled={ulusalOlusturuluyor || !ulusalAd} style={{ ...butonStil(!!ulusalAd), width: "100%", padding: "10px 0" }}>
              {ulusalOlusturuluyor ? "Oluşturuluyor..." : "Şimdi Başlat"}
            </button>
          </Panel>
        )}
      </div>
    </div>
  );
}
