import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function POST(req) {
  const kullaniciId = oturumdanKullaniciId(req);
  if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

  try {
    const { okul, telefon, sinif, il } = await req.json();
    await sql`
      UPDATE kullanicilar
      SET okul = ${okul || null}, telefon = ${telefon || null}, sinif = ${sinif || null}, il = ${il || null}
      WHERE id = ${kullaniciId}
    `;

    // Ogrenci, listemizde (mevcut_okullar) olmayan bir okul adi yazdiysa, bunu
    // "onaysiz" olarak veritabanina ekliyoruz - boylece liste zamanla, gercek
    // kullanicilarin girdigi okullarla kendi kendini tamamliyor. Il/ilce burada
    // bilinmiyor (bu ekranda sorulmuyor), NULL birakilir - istenirse sonra elle
    // veya "Hedef Okulum" ekranindaki il/ilce ile eslestirilebilir.
    const temizOkulAdi = (okul || "").trim();
    if (temizOkulAdi.length > 3) {
      const mevcut = await sql`
        SELECT id FROM mevcut_okullar WHERE LOWER(okul_adi) = LOWER(${temizOkulAdi}) LIMIT 1
      `;
      if (mevcut.length === 0) {
        await sql`
          INSERT INTO mevcut_okullar (il, ilce, okul_adi, onaylandi)
          VALUES (NULL, NULL, ${temizOkulAdi}, false)
        `;
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
