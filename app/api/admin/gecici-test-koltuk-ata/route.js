import { sql } from "@/lib/db";
import { tokenUret } from "@/lib/auth";

export async function GET() {
  const sonuclar = {};
  const damga = Date.now();
  let kurumId, yoneticiId, ogrenciId, lisansId;
  try {
    const kurum = await sql`
      INSERT INTO kurumlar (ad, kurum_kodu) VALUES (${'Test Kurum ' + damga}, ${'TK' + damga})
      RETURNING id
    `;
    kurumId = kurum[0].id;

    const yonetici = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, eposta_dogrulandi, kurum_id)
      VALUES (${'test-yonetici-' + damga + '@test.com'}, 'x', 'Test Yonetici', 'kurum_yoneticisi', true, ${kurumId})
      RETURNING id
    `;
    yoneticiId = yonetici[0].id;

    const ogrenciEposta = 'test-ogrenci-' + damga + '@test.com';
    const ogrenci = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, eposta_dogrulandi, kurum_id)
      VALUES (${ogrenciEposta}, 'x', 'Test Ogrenci', 'ogrenci', true, ${kurumId})
      RETURNING id
    `;
    ogrenciId = ogrenci[0].id;

    const paket = await sql`SELECT anahtar, fiyat_tl FROM paketler WHERE aktif = true AND sure_gun IS NOT NULL LIMIT 1`;
    const planAnahtar = paket[0].anahtar;
    const fiyat = paket[0].fiyat_tl || 100;

    const lisans = await sql`
      INSERT INTO kurum_lisans_satin_alma (kurum_id, plan, koltuk_sayisi, odendi, tutar_tl)
      VALUES (${kurumId}, ${planAnahtar}, 5, true, ${fiyat * 5})
      RETURNING id
    `;
    lisansId = lisans[0].id;

    const token = tokenUret(yoneticiId);
    const cookie = `karemux_token=${token}`;

    const yanit1 = await fetch("https://www.karemux.com/api/kurum/koltuk-ata", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ lisansId, ogrenciEposta }),
    });
    sonuclar.ilkAtamaYanit = await yanit1.json();
    sonuclar.ilkAtamaStatus = yanit1.status;

    const yanit2 = await fetch("https://www.karemux.com/api/kurum/koltuk-ata", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ lisansId, ogrenciEposta }),
    });
    sonuclar.ikinciAtamaYanit = await yanit2.json();
    sonuclar.ikinciAtamaStatus = yanit2.status;

    const abonelikKontrol = await sql`SELECT plan, durum, kurum_lisans_id FROM abonelikler WHERE kullanici_id = ${ogrenciId}`;
    sonuclar.abonelikSayisi = abonelikKontrol.length;
    sonuclar.abonelikKaydi = abonelikKontrol[0] || null;

    return Response.json({ basarili: true, sonuclar });
  } catch (e) {
    sonuclar.hata = e.message;
    return Response.json({ basarili: false, sonuclar });
  } finally {
    try {
      await sql`DELETE FROM abonelikler WHERE kullanici_id = ${ogrenciId}`;
      await sql`DELETE FROM kurum_lisans_satin_alma WHERE id = ${lisansId}`;
      await sql`DELETE FROM kullanicilar WHERE id = ${ogrenciId}`;
      await sql`DELETE FROM kullanicilar WHERE id = ${yoneticiId}`;
      await sql`DELETE FROM kurumlar WHERE id = ${kurumId}`;
    } catch (e2) { /* temizlik hatasi yutuluyor, asil sonuc onemli */ }
  }
}
