import { sql } from "@/lib/db";
import { sifreHashle } from "@/lib/auth";

export async function POST(req) {
  try {
    const { eposta, kod, yeniSifre } = await req.json();
    if (!eposta || !kod || !yeniSifre) return Response.json({ error: "Eksik bilgi" }, { status: 400 });
    if (yeniSifre.length < 6) return Response.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });

    const sonuc = await sql`
      SELECT id FROM kullanicilar
      WHERE eposta = ${eposta} AND sifre_sifirlama_kodu = ${kod} AND sifre_sifirlama_son_tarih > now()
    `;
    if (!sonuc[0]) return Response.json({ error: "Kod geçersiz veya süresi dolmuş" }, { status: 400 });

    const yeniHash = await sifreHashle(yeniSifre);
    await sql`
      UPDATE kullanicilar
      SET sifre_hash = ${yeniHash}, sifre_sifirlama_kodu = NULL, sifre_sifirlama_son_tarih = NULL
      WHERE id = ${sonuc[0].id}
    `;

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Şifre sıfırlanamadı" }, { status: 500 });
  }
}
