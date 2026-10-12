import { sql } from "@/lib/db";

const GECICI_ANAHTAR = "karemux-gecici-12ekim-dalga9-ucretlideneme-test";
const GECICI_DENEME_ID = 8;

export async function POST(req) {
  try {
    const { anahtar, kullaniciId } = await req.json();
    if (anahtar !== GECICI_ANAHTAR) return Response.json({ error: "yetkisiz" }, { status: 401 });

    const kullaniciSatiri = await sql`SELECT hedef_il, hedef_ilce FROM kullanicilar WHERE id = ${kullaniciId}`;
    const il = kullaniciSatiri[0]?.hedef_il || null;
    const ilce = kullaniciSatiri[0]?.hedef_ilce || null;

    const sonuc = await sql`
      INSERT INTO ucretli_deneme_sonuclari (deneme_id, kullanici_id, kurum_id, dogru, yanlis, bos, net, il, ilce)
      VALUES (${GECICI_DENEME_ID}, ${kullaniciId}, NULL, 5, 2, 3, 4.33, ${il}, ${ilce})
      RETURNING id, il, ilce
    `;

    await sql`DELETE FROM ucretli_deneme_sonuclari WHERE id = ${sonuc[0].id}`;

    return Response.json({ kullaniciId, kaydedilen: sonuc[0], temizlendi: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
