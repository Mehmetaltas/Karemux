import { sql } from "@/lib/db";

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  if (sifre !== "karemux-gecici-12ekim-dalga9-test") {
    return Response.json({ error: "yetkisiz" }, { status: 401 });
  }

  let kullanici = await sql`SELECT id, hedef_il, hedef_ilce, kurum_id FROM kullanicilar WHERE hedef_il IS NOT NULL LIMIT 1`;
  let geciciKullaniciId = null;
  if (kullanici.length === 0) {
    const yeni = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, hedef_il, hedef_ilce)
      VALUES ('gecici-test-dalga9@karemux.com', 'anon', 'Gecici Test', 'İstanbul', 'Kadıköy')
      RETURNING id, hedef_il, hedef_ilce, kurum_id
    `;
    kullanici = yeni;
    geciciKullaniciId = yeni[0].id;
  }
  const kullaniciId = kullanici[0].id;

  const kullaniciSatiri = await sql`SELECT hedef_il, hedef_ilce, kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
  const il = kullaniciSatiri[0]?.hedef_il || null;
  const ilce = kullaniciSatiri[0]?.hedef_ilce || null;
  const kurumId = kullaniciSatiri[0]?.kurum_id || null;

  const kayit = await sql`
    INSERT INTO sinav_sonuclari (kullanici_id, tur, ders, dogru, yanlis, bos, net, il, ilce, kurum_id)
    VALUES (${kullaniciId}, 'gecici_test', 'Test Dersi', 5, 2, 1, 4.3, ${il}, ${ilce}, ${kurumId})
    RETURNING id, il, ilce, kurum_id
  `;

  const sonuc = { kullaniciId, kaydedilen: kayit[0] };

  await sql`DELETE FROM sinav_sonuclari WHERE id = ${kayit[0].id}`;
  if (geciciKullaniciId) await sql`DELETE FROM kullanicilar WHERE id = ${geciciKullaniciId}`;

  return Response.json({ ...sonuc, temizlendi: true });
}
