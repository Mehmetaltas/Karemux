import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const talepler = await sql`
      SELECT id, rol, kullanici_id, ad, eposta, konu, mesaj, durum, oncelik, admin_yaniti, olusturulma, guncellenme
      FROM destek_talebi
      ORDER BY (durum = 'acik') DESC, olusturulma DESC
      LIMIT 100
    `;
    const acikSayisi = talepler.filter((t) => t.durum === "acik").length;
    return Response.json({ talepler, acikSayisi });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { sifre, id, adminYaniti, durum } = body;
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    if (!id) return Response.json({ error: "id gerekli" }, { status: 400 });

    await sql`
      UPDATE destek_talebi
      SET admin_yaniti = COALESCE(${adminYaniti || null}, admin_yaniti),
          durum = COALESCE(${durum || null}, durum),
          guncellenme = now()
      WHERE id = ${id}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
