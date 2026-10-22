import { sql } from "@/lib/db";
import { denemeSorulariUret } from "@/lib/ortak-deneme-uretimi";

// Ulusal Deneme uretim mantigi - hem yonetici manuel tetiklediginde
// (app/api/ulusal-deneme/olustur) hem de haftalik otomatik cron'da
// (app/api/cron/ulusal-deneme-otomatik) kullanilan paylasilan cekirdek.
export async function denemeOlustur({ ad, sinif, ders, soruSayisi, acikKalmaSaati, kapsam, il }) {
  if (!ad || !sinif || !ders) throw new Error("Eksik bilgi");

  const { sorular: denetlenmisSorular, elenen: elenenSayisi } = await denemeSorulariUret({ ders, sinif, soruSayisi, amacMetni: "bir ULUSAL/Turkiye geneli denemede kullanilacak" });

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
