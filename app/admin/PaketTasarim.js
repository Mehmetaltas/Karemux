"use client";
import { useEffect, useState } from "react";

// V3 Dalga 3 - Paket Tasarim Merkezi arayuzu. Stil nesneleri admin/page.js'ten gecirilir (tek gorunum).
const bos = { anahtar: "", ad: "", aciklama: "", fiyatTl: "", sureGun: "", krediMiktari: "", gunlukAiLimiti: "", aktif: false, haklar: {}, kapsam: { siniflar: [], dersler: [] } };

export default function PaketTasarim({ sifre, T, TYPO, Panel, girdiStil, etiketStil, butonStil }) {
  const [veri, setVeri] = useState(null);
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");
  const [duzen, setDuzen] = useState(null); // { id|null, ...alanlar }
  const [kaydediliyor, setKaydediliyor] = useState(false);

  async function yukle() {
    try {
      const res = await fetch(`/api/admin/paket-tasarim?sifre=${encodeURIComponent(sifre)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setVeri(d);
    } catch (e) { setHata(e.message || "Paketler alınamadı"); }
  }
  useEffect(() => { yukle(); }, []);

  function duzenle(p) {
    setHata(""); setBilgi("");
    setDuzen({
      id: p.id, anahtar: p.anahtar, ad: p.ad || "", aciklama: p.aciklama || "", fiyatTl: String(p.fiyat_tl ?? ""),
      sureGun: p.sure_gun ?? "", krediMiktari: p.kredi_miktari ?? "", gunlukAiLimiti: p.gunluk_ai_limiti ?? "",
      aktif: !!p.aktif, haklar: p.haklar || {}, kapsam: { siniflar: p.kapsam?.siniflar || [], dersler: p.kapsam?.dersler || [] },
      aktifAbone: p.aktif_abone || 0,
    });
  }

  const ayarla = (k, v) => setDuzen((d) => ({ ...d, [k]: v }));
  const listeDegistir = (alan, deger) => setDuzen((d) => {
    const mevcut = d.kapsam[alan];
    return { ...d, kapsam: { ...d.kapsam, [alan]: mevcut.includes(deger) ? mevcut.filter((x) => x !== deger) : [...mevcut, deger] } };
  });

  async function kaydet() {
    setKaydediliyor(true); setHata(""); setBilgi("");
    try {
      const yeni = duzen.id == null;
      const res = await fetch("/api/admin/paket-tasarim", {
        method: yeni ? "POST" : "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre, paketId: duzen.id, ...duzen }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setBilgi(yeni ? "Paket pasif olarak oluşturuldu. Satışa açmak için düzenleyip 'Satışta' kutusunu işaretle." : "Paket kaydedildi.");
      setDuzen(null);
      await yukle();
    } catch (e) { setHata(e.message || "Kaydedilemedi"); } finally { setKaydediliyor(false); }
  }

  const kutu = { display: "flex", alignItems: "center", gap: 7, fontSize: TYPO.body, minHeight: 32 };

  return (
    <>
      <Panel baslik="Paket Tasarım Merkezi" ikon="🧩" sagUst={<button onClick={() => { setHata(""); setBilgi(""); setDuzen({ ...bos, id: null }); }} style={{ ...butonStil(true), padding: "7px 12px" }}>+ Yeni paket</button>}>
        <p style={{ fontSize: TYPO.caption, color: T.textMuted, marginBottom: 12 }}>
          Paketler silinmez (abonelik ve ödeme kayıtları bağlı); satıştan kaldırmak için pasife al. Yeni paket her zaman pasif başlar.
          Haklar paket satın alındığında hangi sınav özelliklerinin açılacağını belirler. Kapsam şimdilik bilgi amaçlıdır; erişim filtresi olarak uygulanmaz.
        </p>
        {hata && <p role="alert" style={{ color: T.danger, fontSize: TYPO.body }}>{hata}</p>}
        {bilgi && <p role="status" style={{ color: T.accent, fontSize: TYPO.body }}>{bilgi}</p>}
        {!veri && !hata && <p>Yükleniyor…</p>}
        {veri?.paketler.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, background: T.surfaceHover, borderRadius: 9, padding: "10px 12px", opacity: p.aktif ? 1 : 0.7 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: TYPO.body, fontWeight: 600, margin: 0 }}>{p.ad} <span style={{ fontWeight: 400, color: T.textMuted, fontFamily: T.mono, fontSize: TYPO.micro }}>{p.anahtar}</span></p>
              <p style={{ fontSize: TYPO.micro, color: T.textMuted, margin: 0 }}>
                {p.fiyat_tl}₺ · {p.sure_gun ? `${p.sure_gun} gün` : `${p.kredi_miktari} kredi`} · {Object.keys(p.haklar || {}).length} hak · {p.aktif_abone} aktif abone · {p.aktif ? "Satışta" : "Pasif"}
              </p>
            </div>
            <button onClick={() => duzenle(p)} style={{ ...butonStil(true), padding: "7px 12px", fontSize: TYPO.caption }}>Düzenle</button>
          </div>
        ))}
      </Panel>

      {duzen && veri && (
        <Panel baslik={duzen.id == null ? "Yeni Paket" : `Düzenle: ${duzen.ad}`} ikon="✏️">
          {duzen.id == null && (<>
            <label style={etiketStil} htmlFor="pt-anahtar">Anahtar (değişmez, küçük harf/rakam/_)</label>
            <input id="pt-anahtar" value={duzen.anahtar} onChange={(e) => ayarla("anahtar", e.target.value.toLowerCase())} placeholder="ornek_paket" style={{ ...girdiStil, marginBottom: 10 }} />
          </>)}
          <label style={etiketStil} htmlFor="pt-ad">Ad</label>
          <input id="pt-ad" value={duzen.ad} onChange={(e) => ayarla("ad", e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
          <label style={etiketStil} htmlFor="pt-aciklama">Açıklama</label>
          <input id="pt-aciklama" value={duzen.aciklama} onChange={(e) => ayarla("aciklama", e.target.value)} style={{ ...girdiStil, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {[["fiyatTl", "Fiyat (₺)"], ["sureGun", "Süre (gün)"], ["krediMiktari", "Kredi"], ["gunlukAiLimiti", "Günlük AI limiti"]].map(([k, e]) => (
              <div key={k} style={{ flex: "1 1 120px" }}>
                <label style={etiketStil} htmlFor={`pt-${k}`}>{e}</label>
                <input id={`pt-${k}`} type="number" min="0" value={duzen[k]} onChange={(ev) => ayarla(k, ev.target.value)} style={girdiStil} />
              </div>
            ))}
          </div>
          <p style={etiketStil}>Haklar</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 16px", marginBottom: 10 }}>
            {veri.haklar.map(([k, e]) => (
              <label key={k} style={kutu}><input type="checkbox" checked={duzen.haklar[k] === true} onChange={(ev) => ayarla("haklar", { ...duzen.haklar, [k]: ev.target.checked })} /> {e}</label>
            ))}
          </div>
          <p style={etiketStil}>Kapsam: sınıflar</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 16px", marginBottom: 10 }}>
            {veri.siniflar.map((s) => <label key={s} style={kutu}><input type="checkbox" checked={duzen.kapsam.siniflar.includes(s)} onChange={() => listeDegistir("siniflar", s)} /> {s}. sınıf</label>)}
          </div>
          <p style={etiketStil}>Kapsam: dersler</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 16px", marginBottom: 12 }}>
            {veri.dersler.map((d) => <label key={d} style={kutu}><input type="checkbox" checked={duzen.kapsam.dersler.includes(d)} onChange={() => listeDegistir("dersler", d)} /> {d}</label>)}
          </div>
          {duzen.id != null && (
            <label style={{ ...kutu, marginBottom: 6 }}><input type="checkbox" checked={duzen.aktif} onChange={(e) => ayarla("aktif", e.target.checked)} /> Satışta (herkese açık paket listesinde görünür)</label>
          )}
          {duzen.id != null && !duzen.aktif && duzen.aktifAbone > 0 && (
            <p style={{ color: T.amber, fontSize: TYPO.caption }}>Bu pakette {duzen.aktifAbone} aktif abone var; pasife almak mevcut aboneliklerini bitirmez, yalnızca yeni satışı durdurur.</p>
          )}
          {duzen.id != null && duzen.aktifAbone > 0 && (
            <p style={{ color: T.amber, fontSize: TYPO.caption }}>Hak ve limit değişiklikleri {duzen.aktifAbone} aktif abonenin erişimini hemen etkiler.</p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={kaydet} disabled={kaydediliyor} style={{ ...butonStil(!kaydediliyor), flex: 1, padding: "10px 0" }}>{kaydediliyor ? "Kaydediliyor…" : "Kaydet"}</button>
            <button onClick={() => setDuzen(null)} style={{ ...butonStil(false), padding: "10px 16px" }}>Vazgeç</button>
          </div>
        </Panel>
      )}
    </>
  );
}
