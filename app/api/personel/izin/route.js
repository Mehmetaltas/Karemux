import { sql } from "@/lib/db";
import { personelCoz } from "@/lib/personel";

export async function GET(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const izinler = await sql`
    SELECT id, baslangic_tarihi, bitis_tarihi, tur, durum, aciklama, talep_tarihi
    FROM personel_izin WHERE personel_id = ${personel.id} ORDER BY talep_tarihi DESC
  `;
  return Response.json({ izinler });
}

export async function POST(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const { baslangicTarihi, bitisTarihi, tur, aciklama } = await req.json();
    if (!baslangicTarihi || !bitisTarihi) return Response.json({ error: "Tarih araligi gerekli" }, { status: 400 });
    await sql`
      INSERT INTO personel_izin (personel_id, baslangic_tarihi, bitis_tarihi, tur, aciklama)
      VALUES (${personel.id}, ${baslangicTarihi}, ${bitisTarihi}, ${tur || "yillik"}, ${aciklama || null})
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Talep gonderilemedi" }, { status: 500 });
  }
}
