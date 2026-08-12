import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Basitlestirilmis aralikli tekrar (spaced repetition) araligi: yanlis yapilan bir
// soru dogru cevaplandikca gittikce daha uzun araliklarla tekrar karsina cikar.
// 5. asamayi (30 gun) basariyla gecince "ustesinden gelindi" sayilir (cozuldu=true).
const ARALIKLAR_GUN = [1, 3, 7, 14, 30];

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ kayitlar: [] });

    const kayitlar = await sql`
      SELECT id, ders, alt_konu, soru, secenekler, dogru_index, aciklama, tekrar_asamasi
      FROM hata_kitapcigi
      WHERE kullanici_id = ${kullaniciId} AND cozuldu = false AND sonraki_tekrar <= CURRENT_DATE
      ORDER BY sonraki_tekrar ASC
      LIMIT 20
    `;
    return Response.json({ kayitlar });
  } catch (e) {
    console.error(e);
    return Response.json({ kayitlar: [] });
  }
}

export async function POST(req) {
  try {
    const { id, dogruMu, cihazId } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const kayit = await sql`SELECT tekrar_asamasi FROM hata_kitapcigi WHERE id = ${id} AND kullanici_id = ${kullaniciId}`;
    if (kayit.length === 0) return Response.json({ error: "Kayit bulunamadi" }, { status: 404 });

    if (dogruMu) {
      const yeniAsama = kayit[0].tekrar_asamasi + 1;
      if (yeniAsama >= ARALIKLAR_GUN.length) {
        // Son asamayi da gecti - ustesinden gelindi sayilir, artik tekrar listesine dusmez.
        await sql`UPDATE hata_kitapcigi SET cozuldu = true, tekrar_asamasi = ${yeniAsama} WHERE id = ${id}`;
        return Response.json({ ok: true, ustesindenGelindi: true });
      }
      const gunSayisi = ARALIKLAR_GUN[yeniAsama];
      await sql`
        UPDATE hata_kitapcigi
        SET tekrar_asamasi = ${yeniAsama}, sonraki_tekrar = CURRENT_DATE + ${gunSayisi}
        WHERE id = ${id}
      `;
      return Response.json({ ok: true, sonrakiTekrarGun: gunSayisi });
    } else {
      // Yanlis yapildi - basa don, yarin tekrar sorulsun.
      await sql`UPDATE hata_kitapcigi SET tekrar_asamasi = 0, sonraki_tekrar = CURRENT_DATE + 1 WHERE id = ${id}`;
      return Response.json({ ok: true, sonrakiTekrarGun: 1 });
    }
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
