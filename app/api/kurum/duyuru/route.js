import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

// Kurum duyurulari - kurum yoneticisi ekler, kurumun ogrencileri gorur (4 Eylul).
export async function GET(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const duyurular = await sql`
      SELECT id, baslik, icerik, olusturulma FROM kurum_duyuru
      WHERE kurum_id = ${yonetici.kurumId}
      ORDER BY olusturulma DESC
      LIMIT 30
    `;
    return Response.json({ duyurular });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { baslik, icerik } = await req.json();
    if (!baslik?.trim() || !icerik?.trim()) return Response.json({ error: "Baslik ve icerik gerekli" }, { status: 400 });

    await sql`INSERT INTO kurum_duyuru (kurum_id, baslik, icerik) VALUES (${yonetici.kurumId}, ${baslik.trim()}, ${icerik.trim()})`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Olusturulamadi" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { duyuruId } = await req.json();
    if (!duyuruId) return Response.json({ error: "duyuruId gerekli" }, { status: 400 });

    await sql`DELETE FROM kurum_duyuru WHERE id = ${duyuruId} AND kurum_id = ${yonetici.kurumId}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Silinemedi" }, { status: 500 });
  }
}
