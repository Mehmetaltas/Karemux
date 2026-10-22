import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";
import { sinifTablolariniHazirla, calismaKayitlari, dersAnahtari } from "@/lib/ogretmen-sinif";

export const dynamic = "force-dynamic";
const DERSLER = ["Matematik", "Fen Bilimleri", "Turkce", "T.C. Inkilap Tarihi", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce"];

// Ogretmen: sinifa odev ver / odevlerin tamamlanma durumunu gor.
export async function GET(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    await sinifTablolariniHazirla();
    const sinifId = Number(new URL(req.url).searchParams.get("sinifId"));
    if (!Number.isInteger(sinifId)) return Response.json({ error: "Gecersiz sinif" }, { status: 400 });
    const sinif = await sql`SELECT id FROM ogretmen_siniflari WHERE id = ${sinifId} AND ogretmen_id = ${ogretmen.id} AND aktif = true`;
    if (sinif.length === 0) return Response.json({ error: "Sinif bulunamadi" }, { status: 404 });
    const odevler = await sql`SELECT id, baslik, ders, konu, aciklama, son_tarih::text AS son_tarih, olusturulma FROM ogretmen_odevleri WHERE sinif_id = ${sinifId} ORDER BY olusturulma DESC LIMIT 30`;
    const ogrenciler = await sql`SELECT kullanici_id FROM ogretmen_sinif_ogrencileri WHERE sinif_id = ${sinifId}`;
    const idler = ogrenciler.map((o) => o.kullanici_id);
    const sonuc = [];
    for (const o of odevler) {
      const kayit = await calismaKayitlari(idler, o.olusturulma);
      const dogrulanan = new Set(kayit.filter((k) => dersAnahtari(k.ders) === dersAnahtari(o.ders)).map((k) => k.kullanici_id)).size;
      const isaret = await sql`SELECT COUNT(*)::int AS adet FROM ogretmen_odev_teslim WHERE odev_id = ${o.id}`;
      sonuc.push({ ...o, ogrenciSayisi: idler.length, dogrulananOgrenci: dogrulanan, isaretleyenOgrenci: isaret[0].adet });
    }
    return Response.json({ odevler: sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Odevler getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const { sinifId, baslik, ders, konu, aciklama, sonTarih } = await req.json();
    const b = typeof baslik === "string" ? baslik.trim().slice(0, 120) : "";
    if (b.length < 3) return Response.json({ error: "Baslik en az 3 karakter olmali" }, { status: 400 });
    if (!DERSLER.includes(ders)) return Response.json({ error: "Gecersiz ders" }, { status: 400 });
    const tarih = typeof sonTarih === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sonTarih) ? sonTarih : null;
    await sinifTablolariniHazirla();
    const sinif = await sql`SELECT id FROM ogretmen_siniflari WHERE id = ${Number(sinifId)} AND ogretmen_id = ${ogretmen.id} AND aktif = true`;
    if (sinif.length === 0) return Response.json({ error: "Sinif bulunamadi" }, { status: 404 });
    await sql`
      INSERT INTO ogretmen_odevleri (sinif_id, baslik, ders, konu, aciklama, son_tarih)
      VALUES (${sinif[0].id}, ${b}, ${ders}, ${typeof konu === "string" ? konu.trim().slice(0, 160) : null}, ${typeof aciklama === "string" ? aciklama.trim().slice(0, 1000) : null}, ${tarih})
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Odev olusturulamadi" }, { status: 500 });
  }
}
