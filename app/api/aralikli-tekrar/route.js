import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Basitlestirilmis aralikli tekrar (spaced repetition) araligi: yanlis yapilan bir
// soru dogru cevaplandikca gittikce daha uzun araliklarla tekrar karsina cikar.
// 5. asamayi (30 gun) basariyla gecince "ustesinden gelindi" sayilir (cozuldu=true).
const ARALIKLAR_GUN = [1, 3, 7, 14, 30];

// Faz E (20 Ekim): cevap anahtari (dogru_index/aciklama) listede GELMEZ; ogrenci secimini gonderir,
// dogru/yanlis karari SUNUCUDA verilir ve anahtar yanitla birlikte doner. Eskiden istemci "dogruMu"
// bildiriyordu, bu yuzden hata kaydi cevaplanmadan "cozuldu" yapilabiliyordu.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ kayitlar: [] });

    const kayitlar = await sql`
      SELECT id, ders, alt_konu, soru, secenekler, tekrar_asamasi
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
    const { id, secilenIndex, dogruMu, cihazId } = await req.json();
    if (secilenIndex === undefined && dogruMu !== undefined) {
      return Response.json({ error: "Sayfa guncellendi, lutfen sayfayi yenile" }, { status: 409 });
    }
    if (!id || !/^\d+$/.test(String(id)) || !Number.isInteger(secilenIndex) || secilenIndex < 0) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const kayit = await sql`
      SELECT tekrar_asamasi, dogru_index, aciklama, secenekler FROM hata_kitapcigi
      WHERE id = ${id} AND kullanici_id = ${kullaniciId} AND cozuldu = false
    `;
    if (kayit.length === 0) return Response.json({ error: "Kayit bulunamadi" }, { status: 404 });
    const { tekrar_asamasi: asama, dogru_index: dogruIndex, aciklama } = kayit[0];
    const secenekSayisi = Array.isArray(kayit[0].secenekler) ? kayit[0].secenekler.length : 0;
    if (secilenIndex >= secenekSayisi) return Response.json({ error: "Gecersiz secenek" }, { status: 400 });
    const dogru = secilenIndex === Number(dogruIndex);
    const anahtar = { dogruMu: dogru, dogruIndex: Number(dogruIndex), aciklama: aciklama || null };
    const cakisma = () => Response.json({ error: "Bu soru zaten cevaplandi" }, { status: 409 });

    // Cift tiklama / yarisan istekler: asama ayni kaldigi surece tek guncelleme gecer.
    if (dogru) {
      const yeniAsama = asama + 1;
      if (yeniAsama >= ARALIKLAR_GUN.length) {
        // Son asamayi da gecti - ustesinden gelindi sayilir, artik tekrar listesine dusmez.
        const g = await sql`UPDATE hata_kitapcigi SET cozuldu = true, tekrar_asamasi = ${yeniAsama} WHERE id = ${id} AND kullanici_id = ${kullaniciId} AND tekrar_asamasi = ${asama} AND cozuldu = false RETURNING id`;
        if (g.length === 0) return cakisma();
        return Response.json({ ok: true, ustesindenGelindi: true, ...anahtar });
      }
      const gunSayisi = ARALIKLAR_GUN[yeniAsama];
      const g = await sql`
        UPDATE hata_kitapcigi
        SET tekrar_asamasi = ${yeniAsama}, sonraki_tekrar = CURRENT_DATE + ${gunSayisi}
        WHERE id = ${id} AND kullanici_id = ${kullaniciId} AND tekrar_asamasi = ${asama} AND cozuldu = false
        RETURNING id
      `;
      if (g.length === 0) return cakisma();
      return Response.json({ ok: true, sonrakiTekrarGun: gunSayisi, ...anahtar });
    }
    // Yanlis yapildi - basa don, yarin tekrar sorulsun.
    const g = await sql`UPDATE hata_kitapcigi SET tekrar_asamasi = 0, sonraki_tekrar = CURRENT_DATE + 1 WHERE id = ${id} AND kullanici_id = ${kullaniciId} AND tekrar_asamasi = ${asama} AND cozuldu = false RETURNING id`;
    if (g.length === 0) return cakisma();
    return Response.json({ ok: true, sonrakiTekrarGun: 1, ...anahtar });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
