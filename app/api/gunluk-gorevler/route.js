import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Faz E (20 Ekim): POST artik kimlik ister ve boyut sinirlidir (kimliksiz/sinirsiz yazim kapandi);
// PATCH yalnizca gorevin sahibi icin calisir (baskasinin gorevini "tamamlandi" yapma acigi kapandi).
const EN_FAZLA_GOREV = 30;
const metinSinirla = (v, en) => (v === undefined || v === null ? "" : String(v).trim().slice(0, en));


// 22 Ekim (Madde 35): gorev tamamlama artik yalniz oz-bildirim degil. Gorevin gunu ve dersi icin sunucuda gercek bir calisma kaydi
// (sinav sonucu, tamamlanmis pratik oturumu, tek konu testi, hata kitapcigi kaydi) varsa "dogrulandi" isaretlenir.
const sade = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/İ/g, "i").toLowerCase().trim();
const GUN_SIRASI = ["pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi", "pazar"];
const DERS_ANAHTARLARI = ["matematik", "fen", "turkce", "inkilap", "sosyal", "din", "ingilizce"];
const dersAnahtari = (d) => DERS_ANAHTARLARI.find((k) => sade(d).includes(k)) || sade(d);
function gorevTarihi(g) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(g.gun)) return g.gun;
  const idx = GUN_SIRASI.indexOf(sade(g.gun));
  if (idx < 0 || !g.hafta_baslangic) return null;
  const t = new Date(g.hafta_baslangic);
  if (Number.isNaN(t.getTime())) return null;
  t.setUTCDate(t.getUTCDate() + idx);
  return t.toISOString().slice(0, 10);
}
async function gorevleriDogrula(kullaniciId, gorevler) {
  const tarihli = gorevler.map((g) => ({ g, tarih: gorevTarihi(g) }));
  const tarihler = [...new Set(tarihli.map((x) => x.tarih).filter(Boolean))];
  if (tarihler.length === 0) return gorevler.map((g) => ({ ...g, dogrulandi: false }));
  const kayitlar = await sql`
    SELECT tarih::text AS tarih, ders FROM (
      SELECT (olusturulma AT TIME ZONE 'Europe/Istanbul')::date AS tarih, split_part(ders, '::', 1) AS ders FROM sinav_sonuclari WHERE kullanici_id = ${kullaniciId}
      UNION ALL SELECT (olusturulma AT TIME ZONE 'Europe/Istanbul')::date, ders FROM tek_konu_oturumu WHERE kullanici_id = ${kullaniciId}
      UNION ALL SELECT (olusturulma AT TIME ZONE 'Europe/Istanbul')::date, ders FROM hata_kitapcigi WHERE kullanici_id = ${kullaniciId}
      UNION ALL SELECT (olusturulma AT TIME ZONE 'Europe/Istanbul')::date, meta->>'ders' FROM sinav_oturumlari WHERE kullanici_id = ${kullaniciId} AND kullanildi = true
    ) x WHERE tarih = ANY(${tarihler}::date[])
  `;
  return tarihli.map(({ g, tarih }) => ({
    ...g,
    dogrulandi: !!tarih && kayitlar.some((k) => k.tarih === tarih && dersAnahtari(k.ders) === dersAnahtari(g.ders)),
  }));
}

export async function POST(req) {
  try {
    const { cihazId, haftaBaslangic, gorevler } = await req.json(); // gorevler: [{gun, ders, gorev}]
    if (!Array.isArray(gorevler) || gorevler.length === 0 || gorevler.length > EN_FAZLA_GOREV) {
      return Response.json({ error: "Gorev listesi bos ya da cok uzun" }, { status: 400 });
    }
    if (typeof haftaBaslangic !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(haftaBaslangic)) {
      return Response.json({ error: "Gecersiz hafta baslangici" }, { status: 400 });
    }
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    for (const g of gorevler) {
      const gun = metinSinirla(g?.gun, 30), ders = metinSinirla(g?.ders, 100), gorev = metinSinirla(g?.gorev, 500);
      if (!gun || !ders || !gorev) continue;
      await sql`
        INSERT INTO gunluk_gorevler (kullanici_id, cihaz_id, hafta_baslangic, gun, ders, gorev, kaynak)
        VALUES (${kullaniciId}, ${cihazId || null}, ${haftaBaslangic}, ${gun}, ${ders}, ${gorev}, 'koc')
      `;
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const cihazId = params.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    const gorevler = kullaniciId
      ? await sql`SELECT id, gun, ders, gorev, kaynak, tamamlandi, hafta_baslangic FROM gunluk_gorevler WHERE kullanici_id = ${kullaniciId} ORDER BY hafta_baslangic DESC, id ASC LIMIT 50`
      : await sql`SELECT id, gun, ders, gorev, kaynak, tamamlandi, hafta_baslangic FROM gunluk_gorevler WHERE cihaz_id = ${cihazId} ORDER BY hafta_baslangic DESC, id ASC LIMIT 50`;
    let sonuc = gorevler;
    if (kullaniciId) {
      try { sonuc = await gorevleriDogrula(kullaniciId, gorevler); } catch (e) { console.error("Gorev dogrulama atlandi:", e.message); }
    }
    return Response.json({ gorevler: sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, cihazId } = await req.json();
    if (!id || !/^\d+$/.test(String(id))) return Response.json({ error: "Eksik id" }, { status: 400 });
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Kullanici belirlenemedi" }, { status: 401 });
    const guncel = await sql`
      UPDATE gunluk_gorevler SET tamamlandi = true
      WHERE id = ${id} AND (kullanici_id = ${kullaniciId} OR (kullanici_id IS NULL AND cihaz_id = ${cihazId || null}))
      RETURNING id
    `;
    if (guncel.length === 0) return Response.json({ error: "Gorev bulunamadi" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
