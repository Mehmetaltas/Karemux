import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  // havale-onay'in GENEL (paketler/abonelikler) dalinin AYNISI - sadece
  // admin sifresi/oturumu olmadan test icin dogrudan cagriliyor.
  const paket = await sql`SELECT sure_gun FROM paketler WHERE anahtar = 'deneme_kulubu_baslangic'`;
  const sureGun = paket[0]?.sure_gun || 365;
  await sql`
    INSERT INTO abonelikler (kullanici_id, plan, durum, iyzico_abonelik_id, baslangic, bitis)
    VALUES (7584, 'deneme_kulubu_baslangic', 'aktif', 'test-onay', now(), now() + (${sureGun}::text || ' days')::interval)
  `;
  await sql`UPDATE odemeler SET durum = 'basarili' WHERE havale_referans = 'KRX-MUGUHH5G'`;
  return Response.json({ ok: true });
}
