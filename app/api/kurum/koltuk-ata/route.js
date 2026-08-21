import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

// Satin alinmis, bos bir koltugu belirli bir ogrenciye atar - ogrenci kurumun
// EPOSTASINI degil, kurumun kurum_kodu ile ONCEDEN kendini baglamis olmali
// (kurum/baglan) - kurum sadece KENDI kurum_id'sindeki ogrencilere koltuk atayabilir.
export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { lisansId, ogrenciEposta } = await req.json();
    if (!lisansId || !ogrenciEposta) return Response.json({ error: "lisansId ve ogrenciEposta gerekli" }, { status: 400 });

    const lisansSonuc = await sql`
      SELECT l.id, l.plan, l.koltuk_sayisi, p.sure_gun,
             (SELECT COUNT(*) FROM abonelikler a WHERE a.kurum_lisans_id = l.id AND a.durum = 'aktif')::int AS kullanilan
      FROM kurum_lisans_satin_alma l
      JOIN paketler p ON p.anahtar = l.plan
      WHERE l.id = ${lisansId} AND l.kurum_id = ${yonetici.kurumId} AND l.odendi = true
    `;
    if (lisansSonuc.length === 0) return Response.json({ error: "Gecersiz lisans" }, { status: 404 });
    const lisans = lisansSonuc[0];
    if (lisans.kullanilan >= lisans.koltuk_sayisi) {
      return Response.json({ error: "Bu lisansta bos koltuk kalmadi" }, { status: 400 });
    }

    const ogrenciSonuc = await sql`SELECT id FROM kullanicilar WHERE eposta = ${ogrenciEposta} AND kurum_id = ${yonetici.kurumId}`;
    if (ogrenciSonuc.length === 0) {
      return Response.json({ error: "Bu eposta ile kurumunuza baglanmis bir ogrenci bulunamadi (once ogrenci kurum kodunuzla kendini baglamis olmali)" }, { status: 404 });
    }
    const ogrenciId = ogrenciSonuc[0].id;

    const zatenVar = await sql`SELECT 1 FROM abonelikler WHERE kullanici_id = ${ogrenciId} AND durum = 'aktif'`;
    if (zatenVar.length > 0) {
      return Response.json({ error: "Bu ogrencinin zaten aktif bir aboneligi var" }, { status: 400 });
    }

    await sql`
      INSERT INTO abonelikler (kullanici_id, plan, durum, baslangic, bitis, kaynak, kurum_lisans_id)
      VALUES (${ogrenciId}, ${lisans.plan}, 'aktif', now(), now() + (${lisans.sure_gun} || ' days')::interval, 'kurum', ${lisansId})
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Koltuk atanamadi" }, { status: 500 });
  }
}
