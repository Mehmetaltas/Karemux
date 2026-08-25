import { sql } from "@/lib/db";
import { personelCoz } from "@/lib/personel";

// Bugunku acik (cikis yapilmamis) mesai kaydini dondurur.
export async function GET(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const acikKayit = await sql`
    SELECT id, giris_zamani, cikis_zamani FROM personel_mesai
    WHERE personel_id = ${personel.id} AND cikis_zamani IS NULL
    ORDER BY giris_zamani DESC LIMIT 1
  `;
  const sonKayitlar = await sql`
    SELECT id, giris_zamani, cikis_zamani, calisma_notu FROM personel_mesai
    WHERE personel_id = ${personel.id} ORDER BY giris_zamani DESC LIMIT 14
  `;
  return Response.json({ acikKayit: acikKayit[0] || null, sonKayitlar });
}

export async function POST(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const { aksiyon, not: calismaNotu } = await req.json();
    if (aksiyon === "giris") {
      const acik = await sql`SELECT id FROM personel_mesai WHERE personel_id = ${personel.id} AND cikis_zamani IS NULL`;
      if (acik.length > 0) return Response.json({ error: "Zaten acik bir mesai kaydin var" }, { status: 400 });
      await sql`INSERT INTO personel_mesai (personel_id) VALUES (${personel.id})`;
      return Response.json({ ok: true });
    }
    if (aksiyon === "cikis") {
      const acik = await sql`SELECT id FROM personel_mesai WHERE personel_id = ${personel.id} AND cikis_zamani IS NULL ORDER BY giris_zamani DESC LIMIT 1`;
      if (acik.length === 0) return Response.json({ error: "Acik bir mesai kaydin yok" }, { status: 400 });
      await sql`UPDATE personel_mesai SET cikis_zamani = now(), calisma_notu = ${calismaNotu || null} WHERE id = ${acik[0].id}`;
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Gecersiz aksiyon" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Islem basarisiz" }, { status: 500 });
  }
}
