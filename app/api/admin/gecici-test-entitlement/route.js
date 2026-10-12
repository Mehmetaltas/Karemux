import { sql } from "@/lib/db";
import { hasEntitlement } from "@/lib/paket";

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  if (sifre !== "karemux-gecici-12ekim-dalga2-test") {
    return Response.json({ error: "yetkisiz" }, { status: 401 });
  }

  // Mevcut gercek bir kullaniciyi kullan (FK sorunu olmasin), gecici bir
  // deneme_kulubu_standart aboneligi ac, hasEntitlement'i test et, SONRA SIL.
  const birKullanici = await sql`SELECT kullanici_id FROM abonelikler LIMIT 1`;
  const kullaniciId = birKullanici[0]?.kullanici_id;
  if (!kullaniciId) return Response.json({ error: "test icin kullanici bulunamadi" });

  const paket = await sql`SELECT id FROM paketler WHERE anahtar = 'deneme_kulubu_standart'`;
  const gecici = await sql`
    INSERT INTO abonelikler (kullanici_id, plan, durum, paket_id, kaynak)
    VALUES (${kullaniciId}, 'deneme_kulubu_standart', 'aktif', ${paket[0].id}, 'gecici_test')
    RETURNING id
  `;

  const sonucTrue = await hasEntitlement(kullaniciId, "exam_access");
  const sonucYanlisHak = await hasEntitlement(kullaniciId, "olmayan_bir_hak");

  await sql`DELETE FROM abonelikler WHERE id = ${gecici[0].id}`;

  return Response.json({ kullaniciId, sonucTrue, sonucYanlisHak, temizlendi: true });
}
