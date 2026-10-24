"use client";
import { useEffect, useState } from "react";

// Konu anlatiminin altinda YALNIZ yayindaki videolar gosterilir (kalite_bekliyor/planli gorunmez). Video yoksa hicbir sey cizilmez.
// mini_ders: Karemux'ta barinan mp4 (Vercel Blob). uzun_anlatim: YouTube (youtube-nocookie gomme).
const ytId = (url) => { const m = /(?:youtu\.be\/|v=|embed\/)([\w-]{11})/.exec(String(url || "")); return m ? m[1] : null; };
const katla = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9çğıöşü ]/g, "").trim();

export default function KonuVideolari({ sinif, ders, unite, konu }) {
  const [liste, setListe] = useState([]);
  useEffect(() => {
    let iptal = false;
    if (!sinif || !ders || !unite) { setListe([]); return; }
    fetch(`/api/video-katalogu?sinif=${encodeURIComponent(sinif)}&ders=${encodeURIComponent(ders)}&unite=${encodeURIComponent(unite)}`)
      .then((r) => r.json()).then((d) => { if (!iptal) setListe(Array.isArray(d.videolar) ? d.videolar : []); })
      .catch(() => { if (!iptal) setListe([]); });
    return () => { iptal = true; };
  }, [sinif, ders, unite]);
  // Bu alt konuya ait videolar; ünite genelindeki (alt_konu bos) uzun anlatim da gosterilir.
  const uygun = liste.filter((v) => (!v.alt_konu && v.video_turu === "uzun_anlatim") || katla(v.alt_konu) === katla(konu));
  if (uygun.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      {uygun.map((v) => (
        <div key={v.id} style={{ background: "#FDFBF6", borderRadius: 12, border: "1px solid #E5DFD3", padding: 12, marginBottom: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>{v.video_turu === "mini_ders" ? "🎬 Mini Ders" : "👩‍🏫 Öğretmen Anlatımı"}{v.sure_sn ? ` · ${Math.round(v.sure_sn / 60)} dk` : ""}</p>
          {v.video_turu === "mini_ders" ? (
            <video controls preload="metadata" playsInline style={{ width: "100%", borderRadius: 8, background: "#000" }} src={v.url} aria-label={`${v.alt_konu || v.unite} mini ders videosu`}>
              <track kind="captions" srcLang="tr" label="Türkçe" />
            </video>
          ) : ytId(v.url) ? (
            <iframe title={`${v.alt_konu || v.unite} öğretmen anlatımı`} src={`https://www.youtube-nocookie.com/embed/${ytId(v.url)}`} loading="lazy" allowFullScreen style={{ width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 8 }} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
