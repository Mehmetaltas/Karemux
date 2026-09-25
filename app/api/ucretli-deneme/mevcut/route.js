import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { denemeKulubuUyeMi } from "@/lib/deneme-kulubu";

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ denemeler: [] });

    // 24 Eylul - Deneme Kulubu (MASTER v2): bireysel uye ise kurum gerekmez,
    // TUM aktif havuza erisir. Kurum-satin-alma akisi DEGISMEDEN duruyor.
    const uyelik = await denemeKulubuUyeMi(kullaniciId);
    if (uyelik.uye) {
      const denemeler = await sql`
        SELECT d.id, d.ad, d.ders, d.sinif,
          (SELECT COUNT(*) FROM jsonb_array_elements(d.sorular))::int AS soru_sayisi,
          (s.id IS NOT NULL) AS cozuldu
        FROM ucretli_denemeler d
        LEFT JOIN ucretli_deneme_sonuclari s ON s.deneme_id = d.id AND s.kullanici_id = ${kullaniciId}
        WHERE d.aktif = true
        ORDER BY d.olusturulma DESC
      `;
      return Response.json({ denemeler, denemeKulubuSeviyesi: uyelik.seviyeAdi });
    }

    const kullanici = await sql`SELECT kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    const kurumId = kullanici[0]?.kurum_id;
    if (!kurumId) return Response.json({ denemeler: [] });

    const denemeler = await sql`
      SELECT d.id, d.ad, d.ders, d.sinif,
        (SELECT COUNT(*) FROM jsonb_array_elements(d.sorular))::int AS soru_sayisi,
        (s.id IS NOT NULL) AS cozuldu
      FROM ucretli_denemeler d
      JOIN kurum_deneme_satin_alma k ON k.deneme_id = d.id AND k.kurum_id = ${kurumId} AND k.odendi = true
      LEFT JOIN ucretli_deneme_sonuclari s ON s.deneme_id = d.id AND s.kullanici_id = ${kullaniciId}
      WHERE d.aktif = true
      ORDER BY d.olusturulma DESC
    `;

    return Response.json({ denemeler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
