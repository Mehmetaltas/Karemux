import { sql } from "@/lib/db";
import { denemeSorulariUret } from "@/lib/ortak-deneme-uretimi";

// Ucretli Deneme uretim mantigi - ulusalDenemeOlustur.js ile AYNI AI
// uretim/kalite kontrol cekirdegini kullanir, ama ucretli_denemeler'e yazar
// (fiyat_tl, kapsam: 'ulusal'|'yerel', il - kurumlara satilan denemeler icin).
// 25 Agustos: bu tabloya HIC yazan bir mekanizma yoktu, bugun kuruldu.
export async function ucretliDenemeOlustur({ ad, sinif, ders, soruSayisi, fiyatTl, kapsam, il }) {
  if (!ad || !sinif || !ders || !fiyatTl) throw new Error("Eksik bilgi");
  if (kapsam === "yerel" && !il) throw new Error("Yerel kapsam icin il gerekli");

  const { sorular: denetlenmisSorular, elenen: elenenSayisi } = await denemeSorulariUret({ ders, sinif, soruSayisi, amacMetni: "ucretli bir denemede kullanilacak" });

  const sonuc = await sql`
    INSERT INTO ucretli_denemeler (ad, sinif, ders, sorular, fiyat_tl, kapsam, il)
    VALUES (${ad}, ${sinif}, ${ders}, ${JSON.stringify(denetlenmisSorular)}, ${fiyatTl}, ${kapsam || "ulusal"}, ${kapsam === "yerel" ? il : null})
    RETURNING id
  `;
  return { id: sonuc[0].id, soruSayisi: denetlenmisSorular.length, elenen: elenenSayisi };
}
