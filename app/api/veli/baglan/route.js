import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function POST(req) {
  const veliId = oturumdanKullaniciId(req);
  if (!veliId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

  try {
    const { kod } = await req.json();
    if (!kod) return Response.json({ error: "Bağlantı kodu gerekli" }, { status: 400 });

    const veli = await sql`SELECT rol FROM kullanicilar WHERE id = ${veliId}`;
    if (veli[0]?.rol !== "veli") {
      return Response.json({ error: "Bu işlem sadece veli hesapları için geçerli" }, { status: 403 });
    }

    const ogrenci = await sql`SELECT id, ad FROM kullanicilar WHERE veli_baglanti_kodu = ${kod.toUpperCase()}`;
    if (!ogrenci[0]) {
      return Response.json({ error: "Kod geçersiz, öğrenciyle birlikte kontrol et" }, { status: 404 });
    }
    if (ogrenci[0].id === veliId) {
      return Response.json({ error: "Kendi hesabına bağlanamazsın" }, { status: 400 });
    }

    await sql`
      INSERT INTO veli_ogrenci (veli_id, ogrenci_id) VALUES (${veliId}, ${ogrenci[0].id})
      ON CONFLICT (veli_id, ogrenci_id) DO NOTHING
    `;

    return Response.json({ ok: true, ogrenciAdi: ogrenci[0].ad });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Bağlantı kurulamadı" }, { status: 500 });
  }
}
