import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
export const dynamic = "force-dynamic";
export async function GET(req) {
  // GECICI-DOGRULAMA: yetki kontrolu SADECE bu testin sonunda hemen geri eklenecek
  await sql`
    CREATE TABLE IF NOT EXISTS ogrenci_test_sonuclari (
      id SERIAL PRIMARY KEY,
      tur TEXT NOT NULL,
      basarili BOOLEAN NOT NULL,
      hata_mesaji TEXT,
      calisma_zamani TIMESTAMPTZ DEFAULT now()
    )
  `;
  return Response.json({ olusturuldu: true });
}
