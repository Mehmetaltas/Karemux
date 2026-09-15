import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const boyutlar = await sql`SELECT * FROM ikiz_boyut LIMIT 5`;
    const degiskenler = await sql`SELECT * FROM ikiz_degisken ORDER BY id DESC LIMIT 15`;
    const senaryolar = await sql`SELECT * FROM ikiz_senaryo ORDER BY id DESC LIMIT 5`;
    return Response.json({ boyutlar, degiskenler, senaryolar });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
