import { KAGITLAR } from "@/lib/yazili-hazirlik/index";
import { kagitHtml } from "@/lib/yazili-hazirlik/render";
import { gorselUret } from "@/lib/gorsel-motoru";

export const dynamic = "force-dynamic";

// "Yazılıya Hazırlanıyorum" çalışma kâğıtları: yazdır/PDF olarak kaydet (tarayıcı: Yazdır → PDF).
// ?kagit=mat7 → kâğıt (HTML, A4 sayfalı) ; parametresiz → hazır kâğıtların listesi (JSON).
// Erişim kısıtı kararı verilene kadar herkese açıktır (docs/TAKIP-46.md).
export async function GET(req) {
  const anahtar = new URL(req.url).searchParams.get("kagit");
  if (!anahtar) {
    return Response.json({ kagitlar: Object.entries(KAGITLAR).map(([k, v]) => ({ anahtar: k, sinif: v.sinif, ders: v.ders, donem: v.donem, yazili: v.yazili, kapsam: v.kapsam })) });
  }
  const k = KAGITLAR[anahtar];
  if (!k) return Response.json({ error: "Kâğıt bulunamadı" }, { status: 404 });
  const html = kagitHtml(k, { logoUri: "/icons/icon-192.png", gorselUret });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
