import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const matematikKayit = await sql`SELECT id, ders, konu FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi' AND ders = 'Matematik' LIMIT 1`;
    if (matematikKayit.length === 0) return Response.json({ mesaj: "Hiç Matematik konu_paketi kaydi yok, once biri uretilmeli" });

    await sql`
      UPDATE icerik_onbellek SET onay_durumu = 'bekliyor'
      WHERE id = ${matematikKayit[0].id}
    `;
    return Response.json({ ok: true, isaretlenenKayit: matematikKayit[0] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
