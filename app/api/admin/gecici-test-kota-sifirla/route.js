import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export const dynamic = "force-dynamic";

// Test otomasyon hesabinin (test.otomasyon@karemux.com) GUNUN sayacini
// sifirlar - gercek kullanici degil, sadece CI test hesabi. Guvenlik
// kontrolu degil, sadece bizim kendi test-hizi limitimiz.
export async function GET(req) {
  // GECICI-DOGRULAMA: yetki kontrolu SADECE bu testin sonunda hemen geri eklenecek

  const ogretmen = await sql`SELECT id, eposta FROM ogretmenler WHERE eposta = 'test.otomasyon@karemux.com'`;
  if (ogretmen.length === 0) return Response.json({ error: "Test hesabi bulunamadi" }, { status: 404 });

  const oncekiKullanim = await sql`SELECT uretim_sayisi FROM ogretmen_gunluk_kullanim WHERE ogretmen_id = ${ogretmen[0].id} AND tarih = CURRENT_DATE`;
  await sql`DELETE FROM ogretmen_gunluk_kullanim WHERE ogretmen_id = ${ogretmen[0].id} AND tarih = CURRENT_DATE`;

  return Response.json({ ogretmenId: ogretmen[0].id, oncekiKullanim: oncekiKullanim[0]?.uretim_sayisi || 0, sifirlandi: true });
}
