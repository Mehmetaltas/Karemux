"use client";
import { useState } from "react";

// V3 Dalga 6-8 - Icerik Cekirdegi kapsam raporu, 5.350 arsiv ilerlemesi, video katalogu. Yalniz gercek DB verisi.
export default function IcerikMerkezi({ sifre, T, TYPO, Panel, butonStil }) {
  const [kapsam, setKapsam] = useState(null);
  const [arsiv, setArsiv] = useState(null);
  const [video, setVideo] = useState(null);
  const [plan, setPlan] = useState(null);
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
        <button disabled={bekle} onClick={() => getir(`/api/admin/video-plani?sifre=${q}`, setPlan)} style={butonStil}>Üretim planı</button>
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

      {plan && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: TYPO.body, fontWeight: 700 }}>Üretim planı ({plan.mufredatYili}): her alt konu için paket → senaryo → ses → video</p>
          <div style={{ overflowX: "auto", maxHeight: 340, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: TYPO.caption }}>
              <thead><tr><th align="left">Sınıf / Ders</th><th>Toplam</th><th>Paket</th><th>Senaryo</th><th>Ses</th><th>Video</th><th>Yayında</th><th>₺</th></tr></thead>
              <tbody>
                {plan.ozet.map((o) => (
                  <tr key={o.sinif + o.ders} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td>{o.sinif}. {o.ders}</td><td align="center">{o.toplam}</td><td align="center">{o.paket}</td><td align="center">{o.senaryo}</td><td align="center">{o.ses}</td><td align="center">{o.video}</td><td align="center">{o.yayinda}</td><td align="center">{o.maliyet_tl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {plan.kaynakBosluklari.length > 0 && <p style={p}>Kaynakta eksik (uydurulmaz): {plan.kaynakBosluklari.map((b) => `${b.sinif}. ${b.ders}${b.gercek_bosluk_hafta ? ` planda konusu yazmayan ${b.gercek_bosluk_hafta} hafta` : ""}${b.kazanim_eksik ? " kazanım yok" : ""}`).join(" · ")}</p>}
          <p style={p}>Videolar bir kez üretilir ve kalıcı saklanır; müfredat yılı değişince yalnızca kaynağı değişen konular yeniden üretim işaretlenir.</p>
        </div>
      )}

      {video && (
        <div>
          <p style={{ fontSize: TYPO.body, fontWeight: 700 }}>Video kataloğu: {video.durumlar.length ? video.durumlar.map((d) => `${d.durum} ${d.adet}`).join(" · ") : "kayıt yok"}</p>
          <button disabled={bekle} onClick={videoPlanla} style={butonStil}>Tüm resmî üniteler için "planlı" video kaydı aç (mini ders + uzun anlatım)</button>
          <p style={p}>İki tür: mini ders (6-7 dk slayt + ses, Karemux'ta barınır, adres Vercel Blob) ve uzun anlatım (öğretmen, kamera + akıllı tahta, YouTube adresi). Gerçek video yoktur; "yayında" olabilmesi için türüne uygun adres girilmelidir. Akış: planlı → üretimde → kalite bekliyor → yayında.</p>
        </div>
      )}
    </Panel>
  );
}
