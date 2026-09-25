import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { denemeKulubuUyeMi, DENEME_KULUBU_SEVIYELERI } from "@/lib/deneme-kulubu";

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ uye: false, seviyeler: DENEME_KULUBU_SEVIYELERI });

    const uyelik = await denemeKulubuUyeMi(kullaniciId);
    if (!uyelik.uye) return Response.json({ uye: false, seviyeler: DENEME_KULUBU_SEVIYELERI });

    const bitisSonuc = await sql`SELECT bitis FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND plan = ${uyelik.seviye} AND durum = 'aktif' ORDER BY bitis DESC LIMIT 1`;
    return Response.json({ uye: true, seviye: uyelik.seviye, seviyeAdi: uyelik.seviyeAdi, bitis: bitisSonuc[0]?.bitis || null });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
