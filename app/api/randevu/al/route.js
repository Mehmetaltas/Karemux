import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// GET ?cihazId=X: mevcut kullanicinin yaklasan randevularini dondurur.
// POST: bir slotu rezerve eder - ogretmenin saatlik_ucret_tl'sinden GERCEK
// ucreti hesaplar, Jitsi linki uretir (ucretsiz, API anahtari gerektirmez).
// odendi=false ile olusturulur - odeme tahsilati AYRI bir is (henuz yok,
// hafizada not).

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cihazId = searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ randevular: [] });

    const randevular = await sql`
      SELECT r.id, r.baslangic_zamani, r.zoom_link, r.ucret_tl, r.odendi, o.ad AS ogretmen_adi, o.brans
      FROM randevular r
      JOIN ogretmenler o ON o.id = r.ogretmen_id
      WHERE r.ogrenci_id = ${kullaniciId} AND r.durum != 'iptal' AND r.baslangic_zamani >= now()
      ORDER BY r.baslangic_zamani ASC
    `;
    return Response.json({ randevular });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { ogretmenId, baslangicISO, cihazId, sureDk } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    if (!ogretmenId || !baslangicISO) return Response.json({ error: "Eksik veri" }, { status: 400 });

    const gecerliSure = [30, 45, 60].includes(Number(sureDk)) ? Number(sureDk) : 60;

    const ogretmen = await sql`SELECT ad, saatlik_ucret_tl FROM ogretmenler WHERE id = ${ogretmenId} AND aktif = true`;
    if (ogretmen.length === 0) return Response.json({ error: "Ogretmen bulunamadi" }, { status: 404 });

    const baslangic = new Date(baslangicISO);
    const bitis = new Date(baslangic.getTime() + gecerliSure * 60000);

    const catisma = await sql`
      SELECT 1 FROM randevular
      WHERE ogretmen_id = ${ogretmenId} AND durum != 'iptal'
        AND baslangic_zamani < ${bitis.toISOString()} AND bitis_zamani > ${baslangic.toISOString()}
    `;
    if (catisma.length > 0) return Response.json({ error: "Bu saat dolu, baska bir slot secin" }, { status: 409 });

    // Ogretmen payi (KOMISYONSUZ, gercek tutar) + ogrenciye gosterilen fiyat
    // (%20 Karemux komisyonu DAHIL, ayri yazilmaz - Canli Ders ile ayni desen, 23 Agustos karari).
    const ogretmenPayiTl = Math.round(((Number(ogretmen[0].saatlik_ucret_tl) || 0) * gecerliSure / 60) * 100) / 100;
    const ucretTl = Math.round((ogretmenPayiTl * 1.20) * 100) / 100;
    const odaId = `karemux-ders-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const jitsiLink = `https://meet.jit.si/${odaId}`;

    const sonuc = await sql`
      INSERT INTO randevular (ogretmen_id, ogrenci_id, baslangic_zamani, bitis_zamani, zoom_link, zoom_meeting_id, durum, ucret_tl, ogretmen_payi_tl, odendi)
      VALUES (${ogretmenId}, ${kullaniciId}, ${baslangic.toISOString()}, ${bitis.toISOString()}, ${jitsiLink}, ${odaId}, 'planlandi', ${ucretTl}, ${ogretmenPayiTl}, false)
      RETURNING id
    `;
    return Response.json({ ok: true, id: sonuc[0].id, ucretTl });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
