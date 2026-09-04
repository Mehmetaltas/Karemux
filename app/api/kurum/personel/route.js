import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

// Kurumun KENDI kadro listesi (bilgi amacli, dizin niteliginde) - Karemux'un
// ogretmen pazaryeriyle (ogretmenler tablosu) KARISTIRILMIYOR, kasitli olarak
// ayri tutuldu (4 Eylul).
export async function GET(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const personel = await sql`
      SELECT id, ad, gorev, eposta, telefon FROM kurum_personel
      WHERE kurum_id = ${yonetici.kurumId}
      ORDER BY ad
    `;
    return Response.json({ personel });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { ad, gorev, eposta, telefon } = await req.json();
    if (!ad?.trim()) return Response.json({ error: "Ad gerekli" }, { status: 400 });

    await sql`
      INSERT INTO kurum_personel (kurum_id, ad, gorev, eposta, telefon)
      VALUES (${yonetici.kurumId}, ${ad.trim()}, ${gorev?.trim() || null}, ${eposta?.trim() || null}, ${telefon?.trim() || null})
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Eklenemedi" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { personelId } = await req.json();
    if (!personelId) return Response.json({ error: "personelId gerekli" }, { status: 400 });

    await sql`DELETE FROM kurum_personel WHERE id = ${personelId} AND kurum_id = ${yonetici.kurumId}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Silinemedi" }, { status: 500 });
  }
}
