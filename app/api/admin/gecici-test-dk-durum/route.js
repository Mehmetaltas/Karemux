import { sql } from "@/lib/db";
import { tokenUret } from "@/lib/auth";

export async function GET() {
  const sonuclar = {};
  try {
    const epostaTest = `test-dk-durum-${Date.now()}@test.com`;

    const kullanici = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, eposta_dogrulandi)
      VALUES (${epostaTest}, 'x', 'Test DK Durum', 'ogrenci', true)
      RETURNING id
    `;
    const kullaniciId = kullanici[0].id;
    sonuclar.kullaniciId = kullaniciId;

    await sql`
      INSERT INTO abonelikler (kullanici_id, plan, durum, baslangic, bitis, kaynak)
      VALUES (${kullaniciId}, 'deneme_kulubu_lgs', 'aktif', now(), now() + interval '30 days', 'test')
    `;

    const token = tokenUret(kullaniciId);

    const yanit = await fetch("https://www.karemux.com/api/deneme-kulubu/durum", {
      headers: { cookie: `karemux_token=${token}` },
    });
    sonuclar.apiYanit = await yanit.json();

    await sql`DELETE FROM abonelikler WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM kullanicilar WHERE id = ${kullaniciId}`;
    const kontrol = await sql`SELECT COUNT(*) FROM kullanicilar WHERE id = ${kullaniciId}`;
    sonuclar.temizlikDogrulandi = kontrol[0].count === "0";

    return Response.json({ basarili: true, sonuclar });
  } catch (e) {
    return Response.json({ basarili: false, hata: e.message, sonuclar });
  }
}
