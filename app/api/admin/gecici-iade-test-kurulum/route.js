import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  // PATCH route'undaki AYNI mantik, gercek test verisiyle deneniyor.
  const id = 1; // talepId
  const talep = await sql`SELECT id, kullanici_id, odeme_id, paket, tutar_tl, durum FROM iade_talepleri WHERE id = ${id}`;
  if (talep.length === 0) return Response.json({ hata: "talep bulunamadi" });
  if (talep[0].durum !== "beklemede") return Response.json({ hata: "zaten sonuclanmis" });

  await sql`UPDATE iade_talepleri SET durum = 'onaylandi', admin_notu = 'test-otomasyon', sonuclanma_tarihi = now() WHERE id = ${id}`;

  await sql`UPDATE odemeler SET durum = 'iade_edildi' WHERE id = ${talep[0].odeme_id}`;

  const aktifAbonelik = await sql`
    SELECT id FROM abonelikler
    WHERE kullanici_id = ${talep[0].kullanici_id} AND plan = ${talep[0].paket} AND durum = 'aktif'
    ORDER BY baslangic DESC LIMIT 1
  `;
  let abonelikGuncellendiMi = false;
  if (aktifAbonelik[0]) {
    await sql`UPDATE abonelikler SET durum = 'iptal', bitis = now() WHERE id = ${aktifAbonelik[0].id}`;
    abonelikGuncellendiMi = true;
  }

  await sql`
    INSERT INTO giderler (kategori, tutar_tl, aciklama, tarih)
    VALUES ('iade', ${talep[0].tutar_tl}, ${`Iade - ${talep[0].paket} - talep #${id}`}, CURRENT_DATE)
  `;

  // Dogrulama - hepsini geri oku
  const dogrulama = {
    iadeTalebi: (await sql`SELECT durum, admin_notu FROM iade_talepleri WHERE id = ${id}`)[0],
    odeme: (await sql`SELECT durum FROM odemeler WHERE id = ${talep[0].odeme_id}`)[0],
    abonelik: aktifAbonelik[0] ? (await sql`SELECT durum, bitis FROM abonelikler WHERE id = ${aktifAbonelik[0].id}`)[0] : null,
    giderKaydi: (await sql`SELECT kategori, tutar_tl, aciklama FROM giderler WHERE aciklama = ${`Iade - ${talep[0].paket} - talep #${id}`}`)[0],
    abonelikGuncellendiMi,
  };
  return Response.json(dogrulama);
}
