import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// AI -> Insan Koc modeli: AI yeterince yardimci olamadiginda, ogrenci gercek
// bir insan ogretmenle GERCEK bir randevu alabiliyor. Ogretmenin haftalik
// musaitliginden (ogretmen_musaitlik) bir sonraki bos zaman dilimini bulur,
// mevcut randevularla catisma kontrolu yapar, Jitsi Meet linki uretir
// (ucretsiz, hesap/API anahtari gerektirmiyor) ve gercek bir randevu olusturur.

function sonrakiTarihiBul(haftaninGunu, baslangicSaat) {
  const simdi = new Date();
  const bugununGunu = simdi.getDay(); // 0=Pazar...6=Cumartesi
  const [saatH, saatM] = baslangicSaat.split(":").map(Number);
  let aday = new Date(simdi);
  let farkGun = (haftaninGunu - bugununGunu + 7) % 7;
  aday.setDate(aday.getDate() + farkGun);
  aday.setHours(saatH, saatM, 0, 0);
  if (aday <= simdi) aday.setDate(aday.getDate() + 7);
  return aday;
}

export async function POST(req) {
  try {
    const { cihazId, ders, sebep } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const ogretmenler = ders
      ? await sql`SELECT id, ad, brans FROM ogretmenler WHERE aktif = true AND brans = ${ders}`
      : await sql`SELECT id, ad, brans FROM ogretmenler WHERE aktif = true`;
    const havuz = ogretmenler.length > 0
      ? ogretmenler
      : await sql`SELECT id, ad, brans FROM ogretmenler WHERE aktif = true`;

    if (havuz.length === 0) {
      return Response.json({ error: "Su an musait ogretmen bulunmuyor, daha sonra tekrar dene" }, { status: 404 });
    }

    for (const ogretmen of havuz) {
      const musaitlikler = await sql`
        SELECT haftanin_gunu, baslangic_saat, bitis_saat
        FROM ogretmen_musaitlik WHERE ogretmen_id = ${ogretmen.id}
      `;
      for (const m of musaitlikler) {
        for (let hafta = 0; hafta < 3; hafta++) {
          const aday = sonrakiTarihiBul(m.haftanin_gunu, m.baslangic_saat);
          aday.setDate(aday.getDate() + hafta * 7);
          const [bitH, bitM] = m.bitis_saat.split(":").map(Number);
          const adayBitis = new Date(aday);
          adayBitis.setHours(bitH, bitM, 0, 0);

          const catisma = await sql`
            SELECT 1 FROM randevular
            WHERE ogretmen_id = ${ogretmen.id} AND durum != 'iptal'
              AND baslangic_zamani < ${adayBitis.toISOString()} AND bitis_zamani > ${aday.toISOString()}
          `;
          if (catisma.length === 0) {
            const odaId = `karemux-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const jitsiLink = `https://meet.jit.si/${odaId}`;
            const sonuc = await sql`
              INSERT INTO randevular (ogretmen_id, ogrenci_id, baslangic_zamani, bitis_zamani, zoom_link, zoom_meeting_id, durum)
              VALUES (${ogretmen.id}, ${kullaniciId}, ${aday.toISOString()}, ${adayBitis.toISOString()}, ${jitsiLink}, ${odaId}, 'planlandi')
              RETURNING id
            `;
            return Response.json({
              ok: true,
              randevuId: sonuc[0].id,
              ogretmenAdi: ogretmen.ad,
              baslangic: aday.toISOString(),
              bitis: adayBitis.toISOString(),
              link: jitsiLink,
            });
          }
        }
      }
    }

    return Response.json({ error: "Onumuzdeki 3 hafta icinde musait bir zaman bulunamadi" }, { status: 404 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Randevu olusturulamadi: " + e.message }, { status: 500 });
  }
}
