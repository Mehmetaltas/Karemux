import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ozellik geri bildirimi: 👍 isine yaradi / 👎 sorun vardi / 💡 oneri.
// User Intelligence (Faz 4) icin gercek kullanici verisi bu tablodan beslenecek.
export async function POST(req) {
  try {
    const { cihazId, ozellik, tur, mesaj } = await req.json();
    if (!ozellik || !tur || !["begeni", "sorun", "oneri"].includes(tur)) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    await sql`
      INSERT INTO geri_bildirimler (kullanici_id, ozellik, tur, mesaj)
      VALUES (${kullaniciId}, ${ozellik}, ${tur}, ${mesaj || null})
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

// Yonetici ozet gorunumu: hangi ozellik ne kadar begenildi/sorun bildirildi.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sifre = searchParams.get("sifre");
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const ozet = await sql`
      SELECT ozellik, tur, COUNT(*)::int AS adet
      FROM geri_bildirimler
      GROUP BY ozellik, tur
      ORDER BY ozellik, tur
    `;
    return Response.json({ ozet });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
