import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";
import { sinifTablolariniHazirla } from "@/lib/ogretmen-sinif";

export const dynamic = "force-dynamic";

// Sinif analizi: GERCEK ogrenci verisinden (sinav_sonuclari + hata_kitapcigi). Yeni veri uretmez.
export async function GET(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "Gecersiz sinif" }, { status: 400 });
    await sinifTablolariniHazirla();
    const sinif = await sql`SELECT id, ad, kod FROM ogretmen_siniflari WHERE id = ${id} AND ogretmen_id = ${ogretmen.id} AND aktif = true`;
    if (sinif.length === 0) return Response.json({ error: "Sinif bulunamadi" }, { status: 404 });

    const ogrenciler = await sql`
      SELECT k.id, k.ad, k.sinif FROM ogretmen_sinif_ogrencileri g JOIN kullanicilar k ON k.id = g.kullanici_id WHERE g.sinif_id = ${id}
    `;
    if (ogrenciler.length === 0) return Response.json({ sinif: sinif[0], ogrenciler: [], dersler: [], zayifKonular: [], oneriler: ["Henüz sınıfa katılan öğrenci yok. Sınıf kodunu öğrencilerinle paylaş."] });
    const idler = ogrenciler.map((o) => o.id);

    const sonuclar = await sql`
      SELECT kullanici_id, ders, net, dogru, yanlis, bos, olusturulma FROM sinav_sonuclari
      WHERE kullanici_id = ANY(${idler}) AND tur <> 'ders_seviye' AND ders NOT LIKE '%::%' AND olusturulma >= now() - interval '60 days'
      ORDER BY olusturulma DESC
    `;
    const hatalar = await sql`
      SELECT kullanici_id, ders, COALESCE(alt_konu, 'Genel') AS konu, COUNT(*)::int AS hata
      FROM hata_kitapcigi WHERE kullanici_id = ANY(${idler}) AND cozuldu = false GROUP BY kullanici_id, ders, COALESCE(alt_konu, 'Genel')
    `;

    const ogrenciSatirlari = ogrenciler.map((o) => {
      const s = sonuclar.filter((x) => x.kullanici_id === o.id);
      const ortalama = s.length ? s.reduce((t, x) => t + Number(x.net), 0) / s.length : null;
      const son = s[0] ? new Date(s[0].olusturulma) : null;
      const gunOnce = son ? Math.floor((Date.now() - son.getTime()) / 86400000) : null;
      const hataSayisi = hatalar.filter((h) => h.kullanici_id === o.id).reduce((t, h) => t + h.hata, 0);
      let durum = "iyi";
      if (!s.length) durum = "veri_yok";
      else if (gunOnce !== null && gunOnce > 14) durum = "pasif";
      else if (s.length >= 2 && Number(s[0].net) < Number(s[1].net) - 1) durum = "dusus";
      return { ad: o.ad, sinif: o.sinif, sinavSayisi: s.length, ortalamaNet: ortalama === null ? null : Math.round(ortalama * 100) / 100, sonSinavGun: gunOnce, cozulmemisHata: hataSayisi, durum };
    });

    const dersMap = {};
    for (const x of sonuclar) {
      const d = (dersMap[x.ders] = dersMap[x.ders] || { ders: x.ders, toplam: 0, adet: 0, ogrenciler: new Set() });
      d.toplam += Number(x.net); d.adet += 1; d.ogrenciler.add(x.kullanici_id);
    }
    const dersler = Object.values(dersMap).map((d) => ({ ders: d.ders, ortalamaNet: Math.round((d.toplam / d.adet) * 100) / 100, sinavSayisi: d.adet, ogrenciSayisi: d.ogrenciler.size })).sort((a, b) => a.ortalamaNet - b.ortalamaNet);

    const konuMap = {};
    for (const h of hatalar) {
      const anahtar = `${h.ders}::${h.konu}`;
      const k = (konuMap[anahtar] = konuMap[anahtar] || { ders: h.ders, konu: h.konu, hata: 0, etkilenenOgrenci: 0 });
      k.hata += h.hata; k.etkilenenOgrenci += 1;
    }
    const zayifKonular = Object.values(konuMap).sort((a, b) => b.etkilenenOgrenci - a.etkilenenOgrenci || b.hata - a.hata).slice(0, 10);

    const oneriler = [];
    const risk = ogrenciSatirlari.filter((o) => o.durum === "dusus" || o.durum === "pasif");
    if (zayifKonular[0]) oneriler.push(`Sınıfta en yaygın zayıf konu: ${zayifKonular[0].ders} / ${zayifKonular[0].konu} (${zayifKonular[0].etkilenenOgrenci}/${ogrenciler.length} öğrenci). "Eksik Konu Paketi" veya "Tekrar Paketi" ile hedefli çalışma hazırlayabilirsin.`);
    if (dersler[0]) oneriler.push(`Ortalaması en düşük ders: ${dersler[0].ders} (ortalama ${dersler[0].ortalamaNet} net).`);
    if (risk.length) oneriler.push(`Dikkat edilecek öğrenciler: ${risk.map((r) => `${r.ad} (${r.durum === "dusus" ? "son sınavda düşüş" : "14+ gündür pasif"})`).join(", ")}.`);
    const veriYok = ogrenciSatirlari.filter((o) => o.durum === "veri_yok").length;
    if (veriYok) oneriler.push(`${veriYok} öğrencinin henüz sınav verisi yok.`);

    return Response.json({ sinif: sinif[0], ogrenciler: ogrenciSatirlari, dersler, zayifKonular, oneriler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Analiz getirilemedi" }, { status: 500 });
  }
}
