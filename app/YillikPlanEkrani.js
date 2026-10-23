"use client";
import { useEffect, useState } from "react";

// Ogrenci ekrani: "Bu hafta okulda ne isleniyor?" (resmi MEB yillik plani). Akademik Takvim + Plan Motoru (V3 Dalga 4-5).
const AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
function tarihYaz(iso) {
  if (!iso) return "";
  const [, a, g] = iso.split("-").map(Number);
  return `${g} ${AY[a - 1]}`;
}
function aralik(h) { return h ? `${tarihYaz(h.baslangic)} – ${tarihYaz(h.bitis)}` : ""; }

export default function YillikPlanEkrani({ sinif, COLORS, onDers }) {
  const [veri, setVeri] = useState(null);
  const [hata, setHata] = useState("");
  const [acikDers, setAcikDers] = useState(null);
  const [tamPlan, setTamPlan] = useState(null);

  useEffect(() => {
    setVeri(null); setHata(""); setAcikDers(null); setTamPlan(null);
    fetch(`/api/yillik-plan?sinif=${sinif}`).then((r) => r.json())
      .then((d) => { if (d.error) setHata(d.error); else setVeri(d); })
      .catch(() => setHata("Yıllık plan alınamadı, tekrar dene."));
  }, [sinif]);

  async function tamPlanAc(ders) {
    if (acikDers === ders) { setAcikDers(null); return; }
    setAcikDers(ders); setTamPlan(null);
    try {
      const d = await fetch(`/api/yillik-plan?sinif=${sinif}&ders=${encodeURIComponent(ders)}`).then((r) => r.json());
      setTamPlan(d.plan || []);
    } catch (e) { setTamPlan([]); }
  }

  const kart = { background: COLORS.page, borderRadius: 12, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 12 };
  const d = veri?.durum;
  const bugunBilgi = d && (
    d.durum === "tatil" ? `${d.tatil} sürüyor. Okullar ${tarihYaz(veri.sonrakiHafta?.baslangic)} tarihinde açılır.`
    : d.durum === "oncesi" ? `Ders yılı ${tarihYaz("2026-09-14")} tarihinde başlıyor.`
    : d.durum === "sonrasi" ? "2026-2027 ders yılı tamamlandı."
    : d.durum === "hafta_sonu" ? "Hafta sonu: geçen haftayı tekrar etmek ve yeni haftaya hazırlanmak için iyi bir zaman."
    : d.resmiTatil ? `Bugün resmî tatil: ${d.resmiTatil}.` : "");

  return (
    <div>
      <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
        <p style={{ fontSize: 22, marginBottom: 4 }}>📆</p>
        <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Bu Hafta Okulda ({sinif}. Sınıf)</p>
        <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>MEB 2026-2027 resmî yıllık planı</p>
      </div>
      {hata && <p role="alert" style={{ color: "#B42318" }}>{hata}</p>}
      {!veri && !hata && <p role="status">Yükleniyor…</p>}
      {veri && (
        <>
          {bugunBilgi && <div style={kart}><p style={{ margin: 0, fontSize: 14 }}>{bugunBilgi}</p></div>}
          {veri.buHafta && (
            <div style={kart}>
              <p style={{ margin: "0 0 8px", fontWeight: 700 }}>{d.durum === "hafta_sonu" ? "Geçen hafta" : "Bu hafta"} · {veri.buHafta.hafta}. hafta <span style={{ fontWeight: 400, color: COLORS.muted }}>({aralik(veri.buHafta)})</span></p>
              {veri.buHafta.dersler.map((x) => (
                <div key={x.ders} style={{ padding: "8px 0", borderTop: `1px solid ${COLORS.line}` }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{x.dersAdi}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13 }}>{x.unite}{x.konu ? ` — ${x.konu}` : ""}</p>
                </div>
              ))}
            </div>
          )}
          {veri.sonrakiHafta && (
            <div style={kart}>
              <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Sıradaki hafta · {veri.sonrakiHafta.hafta}. hafta <span style={{ fontWeight: 400, color: COLORS.muted }}>({aralik(veri.sonrakiHafta)})</span></p>
              {veri.sonrakiHafta.dersler.map((x) => (
                <div key={x.ders} style={{ padding: "6px 0", borderTop: `1px solid ${COLORS.line}` }}>
                  <p style={{ margin: 0, fontSize: 13 }}><b>{x.dersAdi}:</b> {x.unite}{x.konu ? ` — ${x.konu}` : ""}</p>
                </div>
              ))}
            </div>
          )}
          {veri.gecmis && veri.gecmis.length > 0 && (
            <div style={kart}>
              <p style={{ margin: "0 0 4px", fontWeight: 700 }}>Okulda geçilen, geride kalmış olabileceğin konular</p>
              <p style={{ margin: "0 0 10px", fontSize: 12.5, color: COLORS.muted, lineHeight: 1.5 }}>
                Sıra serbest: istediğin dersten, istediğin üniteden başlayabilirsin. Önerimiz: önce bu haftanın konuları, sonra aşağıdaki listeyi en yakından geriye doğru çalış. Nerede eksiğin olduğundan emin değilsen Seviye Tespit Sınavı’nı çöz.
              </p>
              {veri.gecmis.slice(0, 40).map((g) => (
                <div key={g.ders + g.unite} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: `1px solid ${COLORS.line}` }}>
                  <div style={{ flex: 1, fontSize: 13 }}><b>{g.dersAdi}</b> — {g.unite}<span style={{ color: COLORS.muted }}> ({g.ilkHafta === g.sonHafta ? `${g.ilkHafta}. hafta` : `${g.ilkHafta}–${g.sonHafta}. hafta`})</span></div>
                  {onDers && <button onClick={() => onDers(g.ders, g.unite)} style={{ minHeight: 44, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, background: COLORS.page, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Çalış</button>}
                </div>
              ))}
            </div>
          )}
          <div style={kart}>
            <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Tüm yıl planı</p>
            {veri.dersler.map((ders) => (
              <div key={ders}>
                <button onClick={() => tamPlanAc(ders)} aria-expanded={acikDers === ders} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 4px", minHeight: 44, border: 0, borderTop: `1px solid ${COLORS.line}`, background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  {acikDers === ders ? "▾" : "▸"} {(veri.dersAdlari || {})[ders] || ders}
                </button>
                {acikDers === ders && (
                  <div style={{ padding: "0 4px 10px" }}>
                    {!tamPlan && <p>Yükleniyor…</p>}
                    {tamPlan && tamPlan.map((p) => (
                      <p key={p.hafta} style={{ margin: "4px 0", fontSize: 13, color: p.hafta === veri.durum.hafta ? COLORS.ink : COLORS.muted, fontWeight: p.hafta === veri.durum.hafta ? 700 : 400 }}>
                        {p.hafta}. hafta ({aralik(p)}): {p.unite}{p.konu ? ` — ${p.konu}` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
        </>
      )}
    </div>
  );
}
