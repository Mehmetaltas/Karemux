import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";
import { sorulariDenetle } from "@/lib/soruKalite";

// Ucretli Deneme uretim mantigi - ulusalDenemeOlustur.js ile AYNI AI
// uretim/kalite kontrol cekirdegini kullanir, ama ucretli_denemeler'e yazar
// (fiyat_tl, kapsam: 'ulusal'|'yerel', il - kurumlara satilan denemeler icin).
// 25 Agustos: bu tabloya HIC yazan bir mekanizma yoktu, bugun kuruldu.
export async function ucretliDenemeOlustur({ ad, sinif, ders, soruSayisi, fiyatTl, kapsam, il }) {
  if (!ad || !sinif || !ders || !fiyatTl) throw new Error("Eksik bilgi");
  if (kapsam === "yerel" && !il) throw new Error("Yerel kapsam icin il gerekli");

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
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"altKonu":"...","aciklama":"..."}]`;

  const cevap = await aiCagir({ prompt: p, maxTokens: Math.min(8000, 500 + (soruSayisi || 20) * 480), jsonModu: true });
  const temiz = cevap.replace(/```json|```/g, "").trim();
  const baslangic = temiz.indexOf("[");
  const bitis = temiz.lastIndexOf("]");
  if (baslangic === -1 || bitis === -1) throw new Error("Sorular uretilemedi");
  const sorularHam = JSON.parse(temiz.slice(baslangic, bitis + 1));
  if (!Array.isArray(sorularHam) || sorularHam.length === 0) throw new Error("Gecerli soru uretilemedi");

  const sorular = sorularHam.filter((s) =>
    s && typeof s.soru === "string" && s.soru.trim() &&
    Array.isArray(s.secenekler) && s.secenekler.length >= 2 &&
    Number.isInteger(s.dogruIndex) && s.dogruIndex >= 0 && s.dogruIndex < s.secenekler.length
  );
  if (sorular.length === 0) throw new Error("Uretilen sorularin hicbiri gecerli formatta degil");

  const { gecenler: denetlenmisSorular, elenenSayisi } = await sorulariDenetle(sorular, `Bu sorular "${ders}" dersi icin ucretli bir denemede kullanilacak, cok yuksek dogruluk gerekiyor.`);
  if (denetlenmisSorular.length === 0) throw new Error("Sorular kalite denetiminden gecemedi");

  const sonuc = await sql`
    INSERT INTO ucretli_denemeler (ad, sinif, ders, sorular, fiyat_tl, kapsam, il)
    VALUES (${ad}, ${sinif}, ${ders}, ${JSON.stringify(denetlenmisSorular)}, ${fiyatTl}, ${kapsam || "ulusal"}, ${kapsam === "yerel" ? il : null})
    RETURNING id
  `;
  return { id: sonuc[0].id, soruSayisi: denetlenmisSorular.length, elenen: elenenSayisi };
}
