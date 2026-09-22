import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export const dynamic = "force-dynamic";

// 22 Eylul - Full Audit'te bulundu: ayni ders+soru metni birden fazla kez
// tekrarlanmis (10 grup, biri 6 kez). Her grupta EN ESKI kaydi (id en kucuk,
// genelde en cok kullanim_sayisi biriktirmis/referans edilmis olan) tutup
// digerlerini SILER - gercek veri kaybi yok, ayni icerik zaten tekrar ediyordu.
export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });

  const gruplar = await sql`
    SELECT ders, soru, array_agg(id ORDER BY id ASC) AS idler
    FROM soru_bankasi
    GROUP BY ders, soru
    HAVING COUNT(*) > 1
  `;

  let silinenToplam = 0;
  const detaylar = [];
  for (const g of gruplar) {
    const [tutulan, ...silinecekler] = g.idler;
    if (silinecekler.length === 0) continue;
    const sonuc = await sql`DELETE FROM soru_bankasi WHERE id = ANY(${silinecekler}) RETURNING id`;
    silinenToplam += sonuc.length;
    detaylar.push({ ders: g.ders, tutulanId: tutulan, silinenIdler: silinecekler, silinenSayisi: sonuc.length });
  }

  return Response.json({ grupSayisi: gruplar.length, silinenToplam, detaylar });
}
