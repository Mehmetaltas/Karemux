import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export const dynamic = "force-dynamic";

// 22 Ekim: Sinav Analizleri (Madde 22). Yeni veri URETMEZ; sinav_sonuclari ve hata_kitapcigi'ndan
// ogrencinin kendi durumunu cikarir: ders bazli net seyri, onceki sinava gore fark, durum etiketi,
// en guclu / oncelikli ders, konu bazli hata etiketleri ve veriden uretilen oneriler.
// Sinif ortalamasi YALNIZ en az 5 farkli ogrenci varsa doner (gizlilik/anlamlilik esigi).
const GRUP_MIN = 5;

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ dersler: [], konular: [], oneriler: [], sinavSayisi: 0 });

    const sonuclar = await sql`
      SELECT tur, ders, dogru, yanlis, bos, net, olusturulma FROM sinav_sonuclari
      WHERE kullanici_id = ${kullaniciId} AND tur <> 'ders_seviye' AND ders NOT LIKE '%::%'
      ORDER BY olusturulma DESC LIMIT 300
    `;

    const kullanici = await sql`SELECT sinif FROM kullanicilar WHERE id = ${kullaniciId}`;
    const sinif = kullanici[0]?.sinif ?? null;

    const gruplar = {};
    for (const r of sonuclar) (gruplar[r.ders] = gruplar[r.ders] || []).push(r);

    const dersler = [];
    for (const [ders, liste] of Object.entries(gruplar)) {
      const net = (x) => Number(x.net);
      const son = liste[0], onceki = liste[1] || null;
      const ortalama = liste.reduce((t, x) => t + net(x), 0) / liste.length;
      const soruSayisi = Number(son.dogru) + Number(son.yanlis) + Number(son.bos);
      const yanlisOrani = soruSayisi > 0 ? Number(son.yanlis) / soruSayisi : 0;
      const bosOrani = soruSayisi > 0 ? Number(son.bos) / soruSayisi : 0;
      const fark = onceki ? Math.round((net(son) - net(onceki)) * 100) / 100 : null;
      const etiketler = [];
      if (soruSayisi > 0 && Number(son.dogru) === 0) etiketler.push("Hiç doğru yok");
      if (yanlisOrani >= 0.3) etiketler.push("Yanlış fazla");
      if (bosOrani >= 0.3) etiketler.push("Boş bırakıldı");
      if (fark !== null && fark < 0) etiketler.push("Düşüşte");
      if (fark !== null && fark > 0) etiketler.push("Yükselişte");
      dersler.push({
        ders, sinavSayisi: liste.length, sonNet: net(son), oncekiNet: onceki ? net(onceki) : null, fark,
        ortalamaNet: Math.round(ortalama * 100) / 100, dogru: Number(son.dogru), yanlis: Number(son.yanlis), bos: Number(son.bos),
        etiketler,
        seyir: liste.slice(0, 8).reverse().map((x) => ({ net: net(x), tarih: x.olusturulma })),
      });
    }

    // Sinif ortalamasi (en az GRUP_MIN farkli ogrenci)
    if (sinif && dersler.length > 0) {
      try {
        const ort = await sql`
          SELECT s.ders, COUNT(DISTINCT s.kullanici_id)::int AS ogrenci, AVG(s.net)::float AS ort
          FROM sinav_sonuclari s JOIN kullanicilar k ON k.id = s.kullanici_id
          WHERE k.sinif = ${sinif} AND s.tur <> 'ders_seviye' AND s.ders NOT LIKE '%::%'
            AND s.ders = ANY(${dersler.map((d) => d.ders)}) AND s.olusturulma >= now() - interval '90 days'
          GROUP BY s.ders
        `;
        for (const o of ort) {
          const d = dersler.find((x) => x.ders === o.ders);
          if (d && o.ogrenci >= GRUP_MIN) { d.sinifOrtalamasi = Math.round(o.ort * 100) / 100; d.sinifOgrenciSayisi = o.ogrenci; }
        }
      } catch (e) { console.error("Sinif ortalamasi hesaplanamadi:", e.message); }
    }

    // Konu bazli etiketler: cozulmemis hatalar, en cok hata yapilan once
    const konuSatirlari = await sql`
      SELECT ders, COALESCE(alt_konu, 'Genel') AS konu, COUNT(*)::int AS hata
      FROM hata_kitapcigi WHERE kullanici_id = ${kullaniciId} AND cozuldu = false
      GROUP BY ders, COALESCE(alt_konu, 'Genel') ORDER BY hata DESC LIMIT 12
    `;
    const konular = konuSatirlari.map((k) => ({
      ders: k.ders, konu: k.konu, hata: k.hata,
      etiket: k.hata >= 5 ? "Tekrar et" : k.hata >= 3 ? "Yanlış fazla" : "Göz at",
    }));

    // Oneriler: yalnizca mevcut veriden uretilir
    const oneriler = [];
    const sirali = [...dersler].sort((a, b) => b.sonNet - a.sonNet);
    if (sirali.length >= 2) {
      oneriler.push(`En güçlü dersin ${sirali[0].ders} (son net ${sirali[0].sonNet}). Öncelikli dersin ${sirali[sirali.length - 1].ders} (son net ${sirali[sirali.length - 1].sonNet}).`);
    } else if (sirali.length === 1) {
      oneriler.push(`${sirali[0].ders} dersinde ${sirali[0].sinavSayisi} sınav kaydın var; kıyas için diğer derslerde de deneme çöz.`);
    }
    for (const d of dersler) {
      if (d.fark !== null && d.fark < 0) oneriler.push(`${d.ders}: önceki sınava göre ${Math.abs(d.fark)} net düştün. Hata Kitapçığındaki ${d.ders} sorularını tekrar et.`);
      if (d.yanlis > 0 && d.bos === 0 && d.yanlis >= d.dogru / 2) oneriler.push(`${d.ders}: yanlışların net kaybettiriyor (4 yanlış 1 doğruyu götürür). Emin olmadığın soruda iki seçeneği eleyemiyorsan boş bırakmayı dene.`);
      if (d.sinifOrtalamasi !== undefined && d.sonNet < d.sinifOrtalamasi) oneriler.push(`${d.ders}: sınıf ortalamasının (${d.sinifOrtalamasi}) ${Math.round((d.sinifOrtalamasi - d.sonNet) * 100) / 100} net altındasın.`);
    }
    if (konular.length > 0) oneriler.push(`Önce ${konular[0].ders} / ${konular[0].konu} konusuna dön (${konular[0].hata} çözülmemiş hata).`);

    return Response.json({ dersler, konular, oneriler: oneriler.slice(0, 8), sinavSayisi: sonuclar.length, grupMin: GRUP_MIN });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Analiz getirilemedi" }, { status: 500 });
  }
}
