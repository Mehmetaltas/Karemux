import { dersCekirdegi } from "@/lib/icerik-cekirdegi";
import { istanbulBugun, takvimDurumu, haftaPlani, haftaTarihleri, dersListesi, dersYillikPlani, DERS_ADLARI } from "@/lib/plan-motoru";

// Herkese acik (kisisel veri yok): resmi MEB 2026-2027 yillik plani. ?sinif=4..8 [&tarih=YYYY-MM-DD] [&ders=Matematik]
export async function GET(req) {
  const u = new URL(req.url);
  const sinif = Number(u.searchParams.get("sinif"));
  if (!Number.isInteger(sinif) || sinif < 4 || sinif > 8) return Response.json({ error: "Sınıf 4-8 arasında olmalı" }, { status: 400 });
  const tarihParam = u.searchParams.get("tarih");
  if (tarihParam && !/^\d{4}-\d{2}-\d{2}$/.test(tarihParam)) return Response.json({ error: "Tarih YYYY-AA-GG biçiminde olmalı" }, { status: 400 });
  const tarih = tarihParam || istanbulBugun();

  const durum = takvimDurumu(tarih);
  const ders = u.searchParams.get("ders");
  if (ders) {
    const tum = dersYillikPlani(sinif, ders);
    if (!tum) return Response.json({ error: "Bu sınıf için bu ders planı yok" }, { status: 404 });
    return Response.json({ sinif, ders, dersAdi: DERS_ADLARI[ders], durum, plan: tum }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
  }
  // Okulda hangi uniteler baslamis/bitmis: ogrenci okulun gerisindeyse konu anlatimi kilidini bu liste acar.
  // anchor = su an okulda islenen (ya da en son islenen) hafta.
  const anchor = durum.hafta ?? (durum.sonrakiHafta ? durum.sonrakiHafta - 1 : durum.durum === "sonrasi" ? 37 : 0);
  const okulAcik = {}, gecmis = [];
  for (const d of dersListesi(sinif)) {
    const c = dersCekirdegi(sinif, d);
    okulAcik[d] = c.uniteler.filter((u) => u.haftalar.length && Math.min(...u.haftalar) <= anchor).map((u) => u.unite);
    for (const u of c.uniteler) {
      if (u.haftalar.length && Math.max(...u.haftalar) < anchor) gecmis.push({ ders: d, dersAdi: DERS_ADLARI[d], unite: u.unite, ilkHafta: Math.min(...u.haftalar), sonHafta: Math.max(...u.haftalar) });
    }
  }
  gecmis.sort((a, b) => b.sonHafta - a.sonHafta);
  return Response.json({
    okulAcik, gecmis,
    sinif, durum, dersler: dersListesi(sinif), dersAdlari: DERS_ADLARI,
    buHafta: durum.hafta ? { hafta: durum.hafta, ...haftaTarihleri(durum.hafta), dersler: haftaPlani(sinif, durum.hafta) } : null,
    sonrakiHafta: durum.sonrakiHafta ? { hafta: durum.sonrakiHafta, ...haftaTarihleri(durum.sonrakiHafta), dersler: haftaPlani(sinif, durum.sonrakiHafta) } : null,
  }, { headers: { "Cache-Control": "public, s-maxage=600" } });
}
