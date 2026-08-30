import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ilk Hafta Memnuniyet Garantisi (30 Agustos): yeni musteri, ilk kez aldigi
// aylik paket icin ilk 7 gun icinde iade talebi acabilir. Bu route SADECE
// talebi kaydeder - gercek Iyzico iadesi admin tarafindan elle onaylanir
// (Iyzico anahtarlari henuz baglanmadi).
export async function POST(req) {
  try {
    const { odemeId, sebep, cihazId } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    if (!odemeId) return Response.json({ error: "odemeId gerekli" }, { status: 400 });

    const odeme = await sql`
      SELECT id, kullanici_id, tutar, plan, olusturulma, durum
      FROM odemeler WHERE id = ${odemeId} AND kullanici_id = ${kullaniciId}
    `;
    if (odeme.length === 0) return Response.json({ error: "Odeme bulunamadi" }, { status: 404 });
    if (odeme[0].durum !== "basarili") return Response.json({ error: "Sadece basarili odemeler icin iade talebi acilabilir" }, { status: 400 });

    const gecenGun = (Date.now() - new Date(odeme[0].olusturulma).getTime()) / 86400000;
    if (gecenGun > 7) return Response.json({ error: "Ilk Hafta Garantisi suresi (7 gun) dolmus" }, { status: 400 });

    // Ayni odeme icin daha once talep acilmis mi kontrolu
    const mevcut = await sql`SELECT 1 FROM iade_talepleri WHERE odeme_id = ${odemeId}`;
    if (mevcut.length > 0) return Response.json({ error: "Bu odeme icin zaten bir iade talebi var" }, { status: 409 });

    await sql`
      INSERT INTO iade_talepleri (kullanici_id, odeme_id, paket, tutar_tl, sebep)
      VALUES (${kullaniciId}, ${odemeId}, ${odeme[0].plan || "bilinmiyor"}, ${odeme[0].tutar}, ${sebep || null})
    `;

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Iade talebi olusturulamadi: " + e.message }, { status: 500 });
  }
}
