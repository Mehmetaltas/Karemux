import { sql } from "@/lib/db";
import { sifreHashle } from "@/lib/auth";

export async function POST(req) {
  try {
    const { token, yeniSifre } = await req.json();
    if (!token || !yeniSifre) return Response.json({ error: "Eksik bilgi" }, { status: 400 });
    if (yeniSifre.length < 6) return Response.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });

    const personel = await sql`
      SELECT id FROM personel
      WHERE sifre_belirleme_token = ${token} AND sifre_belirleme_son_tarih > now()
    `;
    if (personel.length === 0) return Response.json({ error: "Link gecersiz veya suresi dolmus" }, { status: 400 });

    const hash = await sifreHashle(yeniSifre);
    await sql`
      UPDATE personel
      SET sifre_hash = ${hash}, sifre_belirleme_token = NULL, sifre_belirleme_son_tarih = NULL
      WHERE id = ${personel[0].id}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Sifre belirlenemedi" }, { status: 500 });
  }
}
