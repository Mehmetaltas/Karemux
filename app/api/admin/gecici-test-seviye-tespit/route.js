import { sql } from "@/lib/db";

const GECICI_ANAHTAR = "karemux-gecici-12ekim-dalga9-seviyetespit-test";

export async function POST(req) {
  try {
    const { anahtar, kullaniciId } = await req.json();
    if (anahtar !== GECICI_ANAHTAR) return Response.json({ error: "yetkisiz" }, { status: 401 });

    const sonuclar = [
      { ders: "Matematik", unite: "Kesirler", sinif: 5, dogruMu: true },
      { ders: "Matematik", unite: "Ondalik", sinif: 5, dogruMu: false },
    ];
    const dogruSayisi = sonuclar.filter((s) => s.dogruMu).length;
    const zayifOlanlar = sonuclar.filter((s) => !s.dogruMu);

    const kullaniciSatiri = await sql`SELECT hedef_il, hedef_ilce, kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    const il = kullaniciSatiri[0]?.hedef_il || null;
    const ilce = kullaniciSatiri[0]?.hedef_ilce || null;
    const kurumId = kullaniciSatiri[0]?.kurum_id || null;

    const sonuc = await sql`
      INSERT INTO seviye_tespit_sonuc (kullanici_id, toplam_soru, dogru_sayisi, zayif_unite_sayisi, il, ilce, kurum_id)
      VALUES (${kullaniciId}, ${sonuclar.length}, ${dogruSayisi}, ${zayifOlanlar.length}, ${il}, ${ilce}, ${kurumId})
      RETURNING id, il, ilce, kurum_id
    `;

    await sql`DELETE FROM seviye_tespit_sonuc WHERE id = ${sonuc[0].id}`;

    return Response.json({ kullaniciId, kaydedilen: sonuc[0], temizlendi: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
