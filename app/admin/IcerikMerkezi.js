"use client";
import { useState } from "react";

// V3 Dalga 6-8 - Icerik Cekirdegi kapsam raporu, 5.350 arsiv ilerlemesi, video katalogu. Yalniz gercek DB verisi.
export default function IcerikMerkezi({ sifre, T, TYPO, Panel, butonStil }) {
  const [kapsam, setKapsam] = useState(null);
  const [arsiv, setArsiv] = useState(null);
  const [video, setVideo] = useState(null);
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");
  const [bekle, setBekle] = useState(false);
  const q = encodeURIComponent(sifre);

  async function getir(url, set) {
    setHata(""); setBekle(true);
    try {
      const r = await fetch(url); const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Alınamadı");
      set(d);
    } catch (e) { setHata(e.message); } finally { setBekle(false); }
  }
  async function videoPlanla() {
    setBekle(true); setHata(""); setBilgi("");
    try {
      const r = await fetch("/api/admin/video-katalogu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sifre, islem: "planla_hepsi" }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Başarısız");
      setBilgi(`${d.eklenen} yeni video kaydı 'planlı' olarak açıldı.`);
      await getir(`/api/admin/video-katalogu?sifre=${q}`, setVideo);
    } catch (e) { setHata(e.message); } finally { setBekle(false); }
  }
  const p = { fontSize: TYPO.caption, color: T.textMuted, margin: "4px 0" };

  return (
    <Panel baslik="İçerik Çekirdeği: Kapsam, Arşiv, Video" ikon="🧱">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <button disabled={bekle} onClick={() => getir(`/api/admin/icerik-cekirdegi?sifre=${q}`, setKapsam)} style={butonStil}>Kapsam raporu</button>
        <button disabled={bekle} onClick={() => getir(`/api/admin/arsiv-ilerleme?sifre=${q}`, setArsiv)} style={butonStil}>Arşiv ilerlemesi</button>
        <button disabled={bekle} onClick={() => getir(`/api/admin/video-katalogu?sifre=${q}`, setVideo)} style={butonStil}>Video kataloğu</button>
      </div>
      {hata && <p role="alert" style={{ color: T.danger || "#B42318", fontSize: TYPO.body }}>{hata}</p>}
      {bilgi && <p role="status" style={{ fontSize: TYPO.body }}>{bilgi}</p>}

      {kapsam && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: TYPO.body, fontWeight: 700 }}>Kapsam: {kapsam.ozet.toplamUnite} resmî ünite · {kapsam.ozet.planBagli} plana bağlı · {kapsam.ozet.soruVar} ünitede soru var · {kapsam.ozet.paketVar} ünitede konu paketi var</p>
          <div style={{ overflowX: "auto", maxHeight: 320, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: TYPO.caption }}>
              <thead><tr><th align="left">Sınıf / Ders / Ünite</th><th>Hafta</th><th>Soru</th><th>Paket</th></tr></thead>
              <tbody>
                {kapsam.dersler.flatMap((d) => d.uniteler.map((u) => (
                  <tr key={d.sinif + d.ders + u.unite} style={{ borderTop: `1px solid ${T.border}`, background: !u.soru && !u.konuPaketi ? "rgba(180,35,24,0.06)" : undefined }}>
                    <td>{d.sinif}. {d.ders} — {u.unite}</td>
                    <td align="center">{u.haftalar.length ? `${Math.min(...u.haftalar)}–${Math.max(...u.haftalar)}` : "—"}</td>
                    <td align="center">{u.soru}</td><td align="center">{u.konuPaketi}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
          <p style={p}>Kırmızı zemin: ne soru ne konu paketi var (üretim sırası bu satırlardan başlar).</p>
        </div>
      )}

      {arsiv && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: TYPO.body, fontWeight: 700 }}>Arşiv: hedef {arsiv.hedef} · gerçek {arsiv.gercek} · bekleyen {arsiv.bekleyen} · kalite hatalı {arsiv.kaliteHatali} · eksik {arsiv.eksik}</p>
          <p style={p}>Hedef = {arsiv.hedefAltKonu} alt konu × {arsiv.materyalBasina} materyal. Soru bankasında {arsiv.soruBankasiSoruSayisi} soru var.</p>
          {arsiv.turler.map((t) => <p key={t.icerik_turu} style={p}>{t.icerik_turu}: toplam {t.toplam}, onaylı {t.onayli}, kalite geçti {t.kalite_gecti}, bekleyen {t.bekleyen}, reddedilen {t.reddedilen}</p>)}
          <p style={p}>{arsiv.not}</p>
        </div>
      )}

      {video && (
        <div>
          <p style={{ fontSize: TYPO.body, fontWeight: 700 }}>Video kataloğu: {video.durumlar.length ? video.durumlar.map((d) => `${d.durum} ${d.adet}`).join(" · ") : "kayıt yok"}</p>
          <button disabled={bekle} onClick={videoPlanla} style={butonStil}>Tüm resmî üniteler için "planlı" video kaydı aç</button>
          <p style={p}>Gerçek video yoktur; kayıt "yayında" olabilmesi için önce geçerli bir video adresi girilmelidir. Yayın akışı: planlı → üretimde → kalite bekliyor → yayında.</p>
        </div>
      )}
    </Panel>
  );
}
