import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const silinecekler = [490,491,492,493,494,495,496,497,498,499,500,811,2217,2218,2219,2220,2221,2222,2223,2224,2225,2226];
    const kontrolOnce = await sql`SELECT id FROM soru_bankasi WHERE id = ANY(${silinecekler}::int[])`;
    const silinen = await sql`DELETE FROM soru_bankasi WHERE id = ANY(${silinecekler}::int[]) RETURNING id`;

    await sql`UPDATE soru_bankasi SET secenekler = secenekler #- '{4}' WHERE id = 1403`;
    await sql`UPDATE soru_bankasi SET secenekler = secenekler #- '{4}' WHERE id = 3100`;

    const yeniMetin = (await sql`SELECT soru FROM soru_bankasi WHERE id = 3050`)[0]?.soru?.replace("körfの内deki", "körfezdeki");
    if (yeniMetin) await sql`UPDATE soru_bankasi SET soru = ${yeniMetin} WHERE id = 3050`;

    return Response.json({ ok: true, kontrolOnceSayisi: kontrolOnce.length, kontrolOnceIdler: kontrolOnce.map(s => s.id), silinenSayisi: silinen.length, silinenIdler: silinen.map(s => s.id) });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
