import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";
import { jsonAyikla } from "@/lib/json-ayikla";
import { sorulariDenetle } from "@/lib/soruKalite";
import { soruFormatGecerliMi } from "@/lib/soruFormatDogrula";

// Ulusal Deneme uretim mantigi - hem yonetici manuel tetiklediginde
// (app/api/ulusal-deneme/olustur) hem de haftalik otomatik cron'da
// (app/api/cron/ulusal-deneme-otomatik) kullanilan paylasilan cekirdek.
export async function denemeOlustur({ ad, sinif, ders, soruSayisi, acikKalmaSaati, kapsam, il }) {
  if (!ad || !sinif || !ders) throw new Error("Eksik bilgi");

  let sarmalKonular = "";
  try {
    const hataGrup = await sql`
      SELECT alt_konu, COUNT(*)::int AS hata_sayisi
      FROM hata_kitapcigi
      WHERE ders = ${ders} AND alt_konu IS NOT NULL
      GROUP BY alt_konu
      ORDER BY hata_sayisi DESC
      LIMIT 5
    `;
    sarmalKonular = hataGrup.map((r) => r.alt_konu).join(", ");
  } catch (e) { /* sarmal veri alinamazsa genel devam et */ }

  const p = `Sen bir LGS olcme-degerlendirme uzmanisin. "${ders}" dersi icin ${sinif}. sinif mufredatinin TAMAMINI dengeli kapsayan, gercek sinav zorlugunda ${soruSayisi || 20} coktan secmeli soru hazirla. Zorluk dagilimi: %20 kolay, %55 orta, %25 zor.${sarmalKonular ? ` SARMAL YAKLASIM: ogrencilerin Turkiye genelinde en cok zorlandigi konular: ${sarmalKonular} - sorularin yaklasik 1/3'unu ozellikle bu konulara ayir, geri kalanini mufredatin geneline dagit.` : ""} Her soru gercekci bir baglam/senaryo icinde kurulsun, soyut olmasin. Celdiriciler spesifik kavram yanilgilarini yansitsin. Her soru icin "altKonu" alaninda hangi alt konuya ait oldugunu (kisa, 2-4 kelime) belirt, "aciklama" alaninda dogru cevabin nedenini anlat. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:
{"sorular":[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"altKonu":"...","aciklama":"..."}]}`;

  const cevap = await aiCagir({ prompt: p, maxTokens: Math.min(8000, 500 + (soruSayisi || 20) * 480), jsonModu: true });
  let sorularHam;
  try {
    sorularHam = jsonAyikla(cevap).sorular;
  } catch (e) {
    console.error("denemeOlustur jsonAyikla basarisiz:", e.message);
    throw new Error("Sorular uretilemedi");
  }
  if (!Array.isArray(sorularHam) || sorularHam.length === 0) throw new Error("Gecerli soru uretilemedi");

  const sorular = sorularHam.filter((s) =>
    soruFormatGecerliMi(s, { soruTrimGerekli: true, dersUniteGerekli: false })
  );
  if (sorular.length === 0) throw new Error("Uretilen sorularin hicbiri gecerli formatta degil");

  const { gecenler: denetlenmisSorular, elenenSayisi } = await sorulariDenetle(sorular, `Bu sorular "${ders}" dersi icin bir ULUSAL/Turkiye geneli denemede kullanilacak, cok yuksek dogruluk gerekiyor.`);
  if (denetlenmisSorular.length === 0) throw new Error("Sorular kalite denetiminden gecemedi");

  const simdi = new Date();
  const acilis = simdi;
  const kapanis = new Date(simdi.getTime() + (acikKalmaSaati || 24) * 60 * 60 * 1000);
  const sonuc = await sql`
    INSERT INTO ulusal_denemeler (ad, sinif, ders, sorular, acilis, kapanis, kapsam, il)
    VALUES (${ad}, ${sinif}, ${ders}, ${JSON.stringify(denetlenmisSorular)}, ${acilis.toISOString()}, ${kapanis.toISOString()}, ${kapsam || "ulusal"}, ${kapsam === "yerel" ? il : null})
    RETURNING id
  `;
  return { id: sonuc[0].id, soruSayisi: denetlenmisSorular.length, elenen: elenenSayisi, acilis, kapanis };
}
