import { sql } from "@/lib/db";
import { tokenUret } from "@/lib/auth";

export async function GET() {
  const sonuclar = {};
  try {
    const epostaTest = `test-abonelik-durum-${Date.now()}@test.com`;

    const kullanici = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, eposta_dogrulandi)
      VALUES (${epostaTest}, 'x', 'Test Abonelik Durum', 'ogrenci', true)
      RETURNING id
    `;
    const kullaniciId = kullanici[0].id;
    sonuclar.kullaniciId = kullaniciId;

    const paket = await sql`SELECT id, anahtar FROM paketler WHERE aktif = true LIMIT 1`;
    const paketId = paket[0].id;
    sonuclar.paketIdBeklenen = paketId;

    await sql`
      INSERT INTO abonelikler (kullanici_id, plan, paket_id, durum, baslangic, bitis, kaynak)
      VALUES (${kullaniciId}, ${paket[0].anahtar}, ${paketId}, 'aktif', now(), now() + interval '30 days', 'test')
    `;

    const token = tokenUret(kullaniciId);
    sonuclar.tokenUretildi = !!token;

    const yanit = await fetch("https://www.karemux.com/api/abonelik/durum", {
      headers: { cookie: `karemux_token=${token}` },
    });
    sonuclar.apiYanit = await yanit.json();

    return Response.json({ basarili: true, sonuclar });
  } catch (e) {
    return Response.json({ basarili: false, hata: e.message, sonuclar });
  }
}
