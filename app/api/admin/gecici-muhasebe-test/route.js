import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const aylikTrend = await sql`
    SELECT ay.baslangic::date AS ay,
      COALESCE((SELECT SUM(net_gelir_tl) FROM satislar WHERE olusturulma >= ay.baslangic AND olusturulma < ay.baslangic + interval '1 month'),0)::numeric AS gelir,
      COALESCE((SELECT SUM(tutar_tl) FROM giderler WHERE tarih >= ay.baslangic AND tarih < (ay.baslangic + interval '1 month')::date),0)::numeric AS gider
    FROM generate_series(date_trunc('month', CURRENT_DATE) - interval '5 months', date_trunc('month', CURRENT_DATE), interval '1 month') AS ay(baslangic)
    ORDER BY ay.baslangic
  `;
  const bekleyenOdemeYaslandirma = await sql`
    SELECT id, tutar, plan, yontem, olusturulma, EXTRACT(DAY FROM now() - olusturulma)::int AS bekleyenGun
    FROM odemeler WHERE durum = 'beklemede' ORDER BY olusturulma ASC LIMIT 20
  `;
  const islemGecmisi = await sql`
    SELECT id, personel_ad, islem_turu, detay, tutar_tl, olusturulma
    FROM muhasebe_islem_gecmisi ORDER BY olusturulma DESC LIMIT 20
  `;
  return Response.json({ aylikTrend, bekleyenOdemeYaslandirma, islemGecmisi });
}
