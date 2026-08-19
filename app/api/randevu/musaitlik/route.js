import { sql } from "@/lib/db";

// GET (parametresiz): tum aktif ogretmenleri dondurur (secim listesi icin).
// GET ?ogretmenId=X: o ogretmenin haftalik musaitliginden, onumuzdeki 2 hafta
// icin GERCEK, 60 dakikalik bos slotlari uretir (mevcut randevularla catisan
// slotlar elenir).
function sonrakiTarihiBul(haftaninGunu, saat, haftaOfset) {
  const simdi = new Date();
  const bugununGunu = simdi.getDay();
  const [saatH, saatM] = saat.split(":").map(Number);
  let farkGun = (haftaninGunu - bugununGunu + 7) % 7;
  const aday = new Date(simdi);
  aday.setDate(aday.getDate() + farkGun + haftaOfset * 7);
  aday.setHours(saatH, saatM, 0, 0);
  if (haftaOfset === 0 && aday <= simdi) aday.setDate(aday.getDate() + 7);
  return aday;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ogretmenId = searchParams.get("ogretmenId");

    if (!ogretmenId) {
      const ogretmenler = await sql`SELECT id, ad, brans, saatlik_ucret_tl FROM ogretmenler WHERE aktif = true ORDER BY ad ASC`;
      return Response.json({ ogretmenler });
    }

    const musaitlikler = await sql`SELECT haftanin_gunu, baslangic_saat, bitis_saat FROM ogretmen_musaitlik WHERE ogretmen_id = ${ogretmenId}`;
    const mevcutRandevular = await sql`
      SELECT baslangic_zamani, bitis_zamani FROM randevular
      WHERE ogretmen_id = ${ogretmenId} AND durum != 'iptal' AND baslangic_zamani >= now()
    `;

    const slotlar = [];
    for (const m of musaitlikler) {
      for (let hafta = 0; hafta < 2; hafta++) {
        const blokBaslangic = sonrakiTarihiBul(m.haftanin_gunu, m.baslangic_saat, hafta);
        const [bitH, bitM] = m.bitis_saat.split(":").map(Number);
        const blokBitis = new Date(blokBaslangic);
        blokBitis.setHours(bitH, bitM, 0, 0);

        // Genis musaitlik penceresini 60 dakikalik standart ders sureli
        // slotlara bol (piyasa arastirmasi: standart ders suresi 60 dk).
        let slotBaslangic = new Date(blokBaslangic);
        while (slotBaslangic.getTime() + 60 * 60000 <= blokBitis.getTime()) {
          const slotBitis = new Date(slotBaslangic.getTime() + 60 * 60000);
          const catisiyorMu = mevcutRandevular.some((r) => {
            const rBas = new Date(r.baslangic_zamani).getTime();
            const rBit = new Date(r.bitis_zamani).getTime();
            return slotBaslangic.getTime() < rBit && slotBitis.getTime() > rBas;
          });
          if (!catisiyorMu && slotBaslangic > new Date()) {
            slotlar.push(slotBaslangic.toISOString());
          }
          slotBaslangic = slotBitis;
        }
      }
    }

    return Response.json({ slotlar: slotlar.sort() });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
