import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

export async function POST(req) {
  try {
    const { cihazId, haftaBaslangic, gorevler } = await req.json(); // gorevler: [{gun, ders, gorev}]
    if (!Array.isArray(gorevler) || gorevler.length === 0) {
      return Response.json({ error: "Gorev listesi bos" }, { status: 400 });
    }
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    for (const g of gorevler) {
      if (!g.gun || !g.ders || !g.gorev) continue;
      await sql`
        INSERT INTO gunluk_gorevler (kullanici_id, cihaz_id, hafta_baslangic, gun, ders, gorev, kaynak)
        VALUES (${kullaniciId}, ${cihazId || null}, ${haftaBaslangic}, ${g.gun}, ${g.ders}, ${g.gorev}, 'koc')
      `;
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;
    const cihazId = params.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);

    const gorevler = kullaniciId
      ? await sql`SELECT id, gun, ders, gorev, kaynak, tamamlandi, hafta_baslangic FROM gunluk_gorevler WHERE kullanici_id = ${kullaniciId} ORDER BY hafta_baslangic DESC, id ASC LIMIT 50`
      : await sql`SELECT id, gun, ders, gorev, kaynak, tamamlandi, hafta_baslangic FROM gunluk_gorevler WHERE cihaz_id = ${cihazId} ORDER BY hafta_baslangic DESC, id ASC LIMIT 50`;
    return Response.json({ gorevler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id } = await req.json();
    if (!id) return Response.json({ error: "Eksik id" }, { status: 400 });
    await sql`UPDATE gunluk_gorevler SET tamamlandi = true WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
