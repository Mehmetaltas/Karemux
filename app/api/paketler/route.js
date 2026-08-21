import { sql } from "@/lib/db";

// Herkese acik (kimlik dogrulama gerektirmez) satilabilir paket listesi -
// magaza/satis ekrani icin. Hassas olmayan alanlar dondurulur.
export async function GET() {
  const paketler = await sql`
    SELECT anahtar, ad, aciklama, fiyat_tl, sure_gun, kredi_miktari
    FROM paketler
    WHERE aktif = true
    ORDER BY
      CASE WHEN anahtar LIKE 'yillik_%' THEN 0 ELSE 1 END,
      fiyat_tl ASC
  `;
  return Response.json({ paketler });
}
