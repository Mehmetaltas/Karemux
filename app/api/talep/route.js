import { sql } from "@/lib/db";

// Ozellik/konu talep sistemi: ayni konu birden fazla kez istenirse otomatik
// sayaci artirir (baslik_normalize uzerinden esler). Boylece "438 ogrenci
// Basinc konusu istedi" gibi somut bir oncelik sinyali olusur.
export async function POST(req) {
  try {
    const { tur, baslik, aciklama } = await req.json();
    if (!tur || !["konu", "ozellik"].includes(tur) || !baslik || typeof baslik !== "string" || baslik.trim().length < 2) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }
    const basliklTemiz = baslik.trim();
    const normalize = basliklTemiz.toLocaleLowerCase("tr").trim();

    const sonuc = await sql`
      INSERT INTO talepler (tur, baslik, baslik_normalize, aciklama, talep_sayisi, son_talep)
      VALUES (${tur}, ${basliklTemiz}, ${normalize}, ${aciklama || null}, 1, now())
      ON CONFLICT (tur, baslik_normalize)
      DO UPDATE SET talep_sayisi = talepler.talep_sayisi + 1, son_talep = now()
      RETURNING talep_sayisi
    `;
    return Response.json({ ok: true, talepSayisi: sonuc[0].talep_sayisi });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

// Yonetici ozet gorunumu: en cok istenen konu/ozellikler, oncelik sirasiyla.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sifre = searchParams.get("sifre");
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const talepler = await sql`
      SELECT tur, baslik, talep_sayisi, ilk_talep, son_talep
      FROM talepler
      ORDER BY talep_sayisi DESC, son_talep DESC
      LIMIT 100
    `;
    return Response.json({ talepler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
