import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ogrencinin ODENMIS (odendi=true) canli ders/kamp/soru cozum katilimlarini
// listeler - "yaklasan derslerim" gorunumu icin. Onceden bu bilgiyi gormenin
// hicbir yolu yoktu, satin alma sonrasi oturum listeden kayboluyordu.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const katilimlar = await sql`
      SELECT o.id, o.tur, o.ders, o.konu, o.baslangic_zamani, o.sure_dk, o.oturum_sayisi,
             o.oturum_araligi_gun, o.jitsi_link, og.ad AS ogretmen_adi, og.brans
      FROM canli_ders_katilimcilari k
      JOIN canli_ders_oturumlari o ON o.id = k.oturum_id
      JOIN ogretmenler og ON og.id = o.ogretmen_id
      WHERE k.ogrenci_id = ${kullaniciId} AND k.odendi = true
      ORDER BY o.baslangic_zamani ASC
    `;
    return Response.json({ katilimlar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Katilimlar alinamadi: " + e.message }, { status: 500 });
  }
}
