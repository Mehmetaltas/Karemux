import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";
import { okulNoTablosuHazirla, okulNoTemizle, okulNoGecerliMi } from "@/lib/okul-no";

export async function GET(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    await okulNoTablosuHazirla();
    const ogrenciler = await sql`
      SELECT k.id, k.ad, k.eposta, k.sinif, k.sube, n.okul_no FROM kullanicilar k
      LEFT JOIN kurum_okul_no n ON n.kullanici_id = k.id AND n.kurum_id = ${yonetici.kurumId}
      WHERE k.kurum_id = ${yonetici.kurumId} AND k.rol = 'ogrenci'
      ORDER BY k.sinif NULLS LAST, k.sube NULLS LAST, k.ad
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

    const { ogrenciId, sube, okulNo } = await req.json();
    if (!ogrenciId) return Response.json({ error: "ogrenciId gerekli" }, { status: 400 });

    if (okulNo !== undefined) {
      const no = okulNoTemizle(okulNo);
      const ogr = await sql`SELECT id FROM kullanicilar WHERE id = ${ogrenciId} AND kurum_id = ${yonetici.kurumId} AND rol = 'ogrenci'`;
      if (ogr.length === 0) return Response.json({ error: "Ogrenci bulunamadi veya kurumuna bagli degil" }, { status: 404 });
      await okulNoTablosuHazirla();
      if (no === "") {
        await sql`DELETE FROM kurum_okul_no WHERE kullanici_id = ${ogrenciId}`;
      } else {
        if (!okulNoGecerliMi(no)) return Response.json({ error: "Okul no sadece harf, rakam ve tire icerebilir (en fazla 20)" }, { status: 400 });
        try {
          await sql`INSERT INTO kurum_okul_no (kullanici_id, kurum_id, okul_no) VALUES (${ogrenciId}, ${yonetici.kurumId}, ${no})
            ON CONFLICT (kullanici_id) DO UPDATE SET okul_no = EXCLUDED.okul_no, kurum_id = EXCLUDED.kurum_id`;
        } catch (e) {
          if (String(e.message).includes("kurum_id")) return Response.json({ error: "Bu okul no kurumda baska bir ogrencide kayitli" }, { status: 409 });
          throw e;
        }
      }
      if (sube === undefined) return Response.json({ ok: true });
    }

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
