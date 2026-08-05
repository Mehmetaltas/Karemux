import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function POST(req) {
  const kullaniciId = oturumdanKullaniciId(req);
  if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

  try {
    const { okul, telefon, sinif } = await req.json();
    await sql`
      UPDATE kullanicilar
      SET okul = ${okul || null}, telefon = ${telefon || null}, sinif = ${sinif || null}
      WHERE id = ${kullaniciId}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
