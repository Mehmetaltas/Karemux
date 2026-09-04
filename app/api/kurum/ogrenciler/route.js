import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

export async function GET(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const ogrenciler = await sql`
      SELECT id, ad, eposta, sinif, sube FROM kullanicilar
      WHERE kurum_id = ${yonetici.kurumId} AND rol = 'ogrenci'
      ORDER BY sinif NULLS LAST, sube NULLS LAST, ad
    `;
    return Response.json({ ogrenciler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { ogrenciId, sube } = await req.json();
    if (!ogrenciId) return Response.json({ error: "ogrenciId gerekli" }, { status: 400 });

    const sonuc = await sql`
      UPDATE kullanicilar SET sube = ${sube || null}
      WHERE id = ${ogrenciId} AND kurum_id = ${yonetici.kurumId}
      RETURNING id
    `;
    if (sonuc.length === 0) return Response.json({ error: "Ogrenci bulunamadi veya kurumuna bagli degil" }, { status: 404 });

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
