import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function POST(req) {
  const kullaniciId = oturumdanKullaniciId(req);
  if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

  try {
    const { kod } = await req.json();
    const sonuc = await sql`
      SELECT dogrulama_kodu, dogrulama_kodu_son_tarih FROM kullanicilar WHERE id = ${kullaniciId}
    `;
    const kullanici = sonuc[0];
    if (!kullanici) return Response.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

    if (!kullanici.dogrulama_kodu || kullanici.dogrulama_kodu !== kod) {
      return Response.json({ error: "Kod hatalı" }, { status: 400 });
    }
    if (new Date(kullanici.dogrulama_kodu_son_tarih) < new Date()) {
      return Response.json({ error: "Kodun süresi dolmuş, yeni kod iste" }, { status: 400 });
    }

    await sql`
      UPDATE kullanicilar SET eposta_dogrulandi = true, dogrulama_kodu = NULL
      WHERE id = ${kullaniciId}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Doğrulama başarısız" }, { status: 500 });
  }
}
