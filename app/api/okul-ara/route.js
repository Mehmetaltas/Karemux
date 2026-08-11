import { sql } from "@/lib/db";

// Okul adinda arama yapar (yazdikca oneri) - il/ilce'ye gore de daraltilabilir.
// Liste 2017 tarihli MEB verisine dayanir, listede olmayan (yeni acilan/isim
// degistiren) okullar icin kullanici serbestce kendi yazabilir (bu API zorunlu degil).
export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const q = (params.get("q") || "").trim();
    const il = params.get("il") || "";
    if (q.length < 2) return Response.json({ sonuclar: [] });

    const sonuc = il
      ? await sql`
          SELECT id, il, ilce, okul_adi FROM mevcut_okullar
          WHERE il = ${il} AND okul_adi ILIKE ${"%" + q + "%"}
          ORDER BY okul_adi
          LIMIT 15
        `
      : await sql`
          SELECT id, il, ilce, okul_adi FROM mevcut_okullar
          WHERE okul_adi ILIKE ${"%" + q + "%"}
          ORDER BY okul_adi
          LIMIT 15
        `;
    return Response.json({ sonuclar: sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ sonuclar: [] });
  }
}
