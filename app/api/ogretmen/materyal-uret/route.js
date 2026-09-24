import { aiCagirDetay, ikinciGorusAl } from "@/lib/ai";
import { jsonAyikla } from "@/lib/json-ayikla";
import { turkceKarakterEksikMi } from "@/lib/kalite-motoru";

// AI ara sira bozuk JSON kacis karakteri uretebiliyor (bilinen, sistemik bir
// kararsizlik - 12 Eylul). Bunu tek bir yerden yonetip, parse basarisiz olursa
// AI'yi 1 KEZ daha cagirip tekrar deniyoruz - boylece 11 aracin hepsi ayni
// dayaniklilik iyilestirmesinden faydalanir, tek tek yamalanmaz.
// aiCagirVeJsonAyikla artik { veri, uretimSaglayicisi } donduruyor (24 Eylul) -
// uretimSaglayicisi, Katman 3 capraz-model dogrulamasinin (ikinciGorusAl)
// HANGI saglayiciyi HARIC TUTACAGINI bilmesi icin gerekli.
async function aiCagirVeJsonAyikla(prompt, maxTokens, harfDuzeltmesiYap) {
  // 21 Eylul: 2 tam denemenin (her biri 4 saglayiciyi da deneyebilir) TOPLAMI,
  // saglayicilar (Gemini kota/Anthropic kredi) sorunluyken Vercel'in 60sn
  // siniri asiliyordu (GERCEK kanit: odev_paketi'nde tam 60.000sn'de kesildigi
  // GitHub Actions loglarinda olculdu). Bugunku markdown-sarma duzeltmesi
  // (lib/ai.js) bu retry'nin en yaygin tetikleyicisini zaten cozdugu icin,
  // JSON-parse hatasinda ARTIK retry YOK (asagida ayri bir sebeple - Turkce
  // karakter kaybinda - TEK, KISA butceli bir retry var, 24 Eylul).
  function ayikla(cevap) {
    if (harfDuzeltmesiYap) {
      const harfDuzeltilmis = cevap.replace(/"dogruIndex"\s*:\s*"?([A-D])"?/gi, (_, harf) => `"dogruIndex":${harf.toUpperCase().charCodeAt(0) - 65}`);
      return jsonAyikla(harfDuzeltilmis);
    }
    return jsonAyikla(cevap);
  }

  const { metin: cevap, saglayici } = await aiCagirDetay({ prompt, maxTokens, jsonModu: true });
  let veri = ayikla(cevap); // 22 Eylul: paylasilan guvenli jsonAyikla() - eski elle-yazilmis parcaTemiz+JSON.parse, AI'nin string icinde kacissiz kontrol karakteri donmesiyle cokuyordu (GERCEK GitHub Actions testinde bulundu)
  let uretimSaglayicisi = saglayici;

  // 24 Eylul: GERCEK kullanici testinde (Tek Konu Motoru) bulunan AYNI hata -
  // bir saglayici Turkce'ye ozgu harfleri (ı/ü/ö/ş/ğ/ç) TAMAMEN ASCII'ye
  // cevirebiliyor. konu-paketi/ders-plani-uret'teki AYNI korumanin
  // materyal-uret'in TUM 11 aracina TEK NOKTADAN eklenmesi.
  if (turkceKarakterEksikMi(JSON.stringify(veri))) {
    console.warn("materyal-uret ASCII-transliterasyon supheli, YENIDEN uretiliyor");
    try {
      const { metin: cevap2, saglayici: saglayici2 } = await aiCagirDetay({ prompt, maxTokens, jsonModu: true }, null, 20000); // kisa butce - 60sn sinirini asmamali
      veri = ayikla(cevap2);
      uretimSaglayicisi = saglayici2;
    } catch (e) { /* basarisiz olursa ilk uretimle devam */ }
  }

  return { veri, uretimSaglayicisi };
}
import { ogretmenCoz } from "@/lib/ogretmen";
import { personelAdminMi } from "@/lib/personel";
import { sql } from "@/lib/db";
import { ogretmenGunlukLimitKontrolEt } from "@/lib/ratelimit";
import { gorselKararIsteSunucu } from "@/lib/gorsel-karar-sunucu";
import { soruTalimatiSecSunucu } from "@/lib/soru-talimati-sunucu";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";

// Gorsel Motoru - 23 Eylul'de paylasilan lib/gorsel-karar-sunucu.js'ye
// tasindi (konu-paketi ve ders-plani-uret de aynisini kullaniyor artik).

export const maxDuration = 60; // Vercel fonksiyon zaman asimini uzat (buyuk uretimler icin)

// Soru tarzi (Baglam/Kazanim Temelli) - 23 Eylul'de lib/soru-talimati-sunucu.js'ye
// tasindi (konu-paketi ve ders-plani-uret de aynisini kullaniyor artik).

// cikti_tipi: "sorular" (coktan secmeli soru listesi) | "metin" (duz metin rapor/ozet) | "acik_uclu" (soru+adim adim cozum, sikli degil)
const TUR_TANIMLARI = {
  calisma_kagidi: { baslik: "Çalışma Kağıdı", soruSayisi: 8, aciklama: "kısa konu özeti + karışık zorlukta 8 soru + cevap anahtarı", ciktiTipi: "sorular" },
  soru_seti: { baslik: "Soru Seti", soruSayisi: 10, aciklama: "sadece 10 soru (kolaydan zora sıralı) + cevap anahtarı", ciktiTipi: "sorular" },
  yazili: { baslik: "Yazılı (A Kitapçığı)", soruSayisi: 15, aciklama: "gerçek yazılı sınav formatında 15 soru + cevap anahtarı + zorluk dağılımı (%20 kolay, %55 orta, %25 zor)", ciktiTipi: "sorular" },
  fasikul: { baslik: "Fasikül", soruSayisi: 15, aciklama: "konu özeti + 15 soru (ilk 5 kolay, sonraki 5 orta, son 5 zor) + cevap anahtarı", ciktiTipi: "sorular" },
  kazanim_testi: { baslik: "Öğrenme Çıktısı Testi", soruSayisi: 8, aciklama: "tek bir kazanıma/alt konuya odaklı 8 soru + cevap anahtarı", ciktiTipi: "sorular" },
  tekrar_paketi: { baslik: "Tekrar Paketi", soruSayisi: 12, aciklama: "konuyu farklı açılardan pekiştiren, karışık zorlukta 12 tekrar sorusu + cevap anahtarı", ciktiTipi: "sorular" },
  odev_paketi: { baslik: "Ödev Paketi", soruSayisi: 6, aciklama: "evde tek başına çözülebilecek, ACIK UCLU (coktan secmeli DEGIL) 6 soru + her biri icin adim adim detayli cozum", ciktiTipi: "acik_uclu" },
  brans_denemesi: { baslik: "Branş Denemesi", soruSayisi: 20, aciklama: "TÜM DERSİ (tek üniteyle sınırlı değil) kapsayan, gerçek sınav formatında 20 soru + cevap anahtarı + zorluk dağılımı", ciktiTipi: "sorular" },
  eksik_konu_paketi: { baslik: "Eksik Konu Paketi", soruSayisi: 10, aciklama: "öğretmenin belirttiği zayıf konulara ÖZEL, hedefli 10 pekiştirme sorusu + cevap anahtarı", ciktiTipi: "sorular", notGerekli: true },
  veli_ozeti: { baslik: "Veli Bilgilendirme Özeti", aciklama: "öğretmenin gözlem notlarından, veliye gönderilecek profesyonel ve nazik bir bilgilendirme metni", ciktiTipi: "metin", notGerekli: true },
  sinif_analizi: { baslik: "Sınıf Başarı Analizi", aciklama: "öğretmenin verdiği sınıf performans notlarından, düzenli bir analiz raporu", ciktiTipi: "metin", notGerekli: true },
};

export async function POST(req) {
  try {
    const govde = await req.json();
    const ogretmenOturum = await ogretmenCoz(req);
    const adminYetkili = govde.adminSifre === process.env.ULUSAL_DENEME_YONETICI_SIFRESI && (await personelAdminMi(req));
    const ogretmen = ogretmenOturum || (adminYetkili ? { ad: "Admin (Kalite Kontrol)" } : null);
    if (!ogretmen) return Response.json({ error: "Oturum yok" }, { status: 401 });

    const { tur, sinif, ders, konu, ogretmenNotu } = govde;
    const soruTalimati = await soruTalimatiSecSunucu(sinif);
    const tanim = TUR_TANIMLARI[tur];
    if (!tanim || !sinif || !ders || !konu?.trim()) return Response.json({ error: "Eksik veya gecersiz bilgi" }, { status: 400 });

    if (ogretmenOturum?.id) {
      const limit = await ogretmenGunlukLimitKontrolEt(ogretmenOturum.id);
      if (!limit.izinVar) {
        return Response.json({ error: `Gunluk uretim sinirina ulastin (${limit.limit}/gun). Yarin devam edebilirsin.` }, { status: 429 });
      }
    }
    if (tanim.notGerekli && !ogretmenNotu?.trim()) return Response.json({ error: "Bu arac icin ogretmen notu gerekli" }, { status: 400 });

    const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";

    if (tanim.ciktiTipi === "metin") {
      const p = `Sen deneyimli bir ${ders} ogretmenisin. Ogretmenin sundugu su notlardan, "${tanim.baslik}" hazirla: "${ogretmenNotu.trim()}". ${tanim.aciklama}. Profesyonel, nazik ve yapici bir dille yaz, sadece ogretmenin belirttigi bilgileri kullan, uydurma detay ekleme. SADECE JSON dondur: {"baslik":"...","icerik":"..."}. Tum metinler SADECE Turkce olmali.`;
      const { veri } = await aiCagirVeJsonAyikla(p, 2000, true);
      if (!veri.icerik) return Response.json({ error: "Materyal uretilemedi, tekrar dene" }, { status: 500 });
      if (ogretmenOturum?.id) {
      try {
        await sql`
          INSERT INTO ogretmen_materyalleri (ogretmen_id, tur, sinif, ders, konu, materyal)
          VALUES (${ogretmenOturum.id}, ${tur}, ${sinif}, ${ders}, ${konu?.trim() || null}, ${JSON.stringify(veri)})
        `;
      } catch (e) { console.error("Materyal gecmise kaydedilemedi:", e); }
    }
    return Response.json({ ok: true, materyal: veri, tur, olusturan: ogretmen.ad });
    }

    if (tanim.ciktiTipi === "acik_uclu") {
      const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde bir "${tanim.baslik}" hazirla: ${tanim.aciklama}. ${soruTalimati}${kaliteReferansi ? " Kalite referansi: " + kaliteReferansi : ""} ONEMLI: Bu sorular ACIK UCLU olmali - coktan secmeli SIK (A/B/C/D) OLMAMALI, ogrenci kendi cozumunu yazmali. Her soru icin "cozum" alaninda, ogrencinin kontrol edebilecegi ADIM ADIM, DETAYLI bir cozum ver (sadece sonuc degil, tum adimlari goster) - SESIN COK ONEMLI: cozumu, sicak bir ogretmenin evde tek basina calisan ogrenciye yaninda oturup anlatiyormus gibi yaz. SOGUK/DERS KITABI cumleleri ("Once X hesaplanir, sonra Y bulunur.") KESINLIKLE YAZMA. Onun yerine "Bak, once suna bakalim...", "Simdi burada dikkat et..." gibi KONUSUR gibi yaz. Her 2-3 cumlede bir hitap MUTLAKA olsun, cumleler kisa (8-12 kelime) olsun. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:
{"baslik":"...","ozet":"kisa konu ozeti (yoksa bos birak)","sorular":[{"soru":"...","cozum":"adim adim detayli cozum metni","zorluk":"kolay"}]}`;

      const { veri, uretimSaglayicisi } = await aiCagirVeJsonAyikla(p, 7000, false); // 22 Eylul: 4000 yetersizdi, acik uclu detayli cozumler kesiliyordu (GERCEK testte kanitlandi: yarim kalmis JSON hatasi)

      if (!veri.sorular || !Array.isArray(veri.sorular) || veri.sorular.length === 0) {
        return Response.json({ error: "Materyal uretilemedi, tekrar dene" }, { status: 500 });
      }

      // Katman 3 - capraz-model dogrulama (24 Eylul, GOLGE MOD, sadece log, engellemez)
      const soruOzeti2 = JSON.stringify(veri.sorular.map((s) => ({ soru: s.soru, cozum: s.cozum })));
      const caprazSonuc2 = await ikinciGorusAl(uretimSaglayicisi, soruOzeti2);
      if (caprazSonuc2?.hataVarMi) console.warn("materyal-uret CAPRAZ-MODEL uyari (GOLGE MOD):", tur, ders, konu, caprazSonuc2.bulgular);

      veri.gorselSvg = await gorselKararIsteSunucu(ders, konu.trim(), sinif);

      if (ogretmenOturum?.id) {
        try {
          await sql`
            INSERT INTO ogretmen_materyalleri (ogretmen_id, tur, sinif, ders, konu, materyal)
            VALUES (${ogretmenOturum.id}, ${tur}, ${sinif}, ${ders}, ${konu?.trim() || null}, ${JSON.stringify(veri)})
          `;
        } catch (e) { console.error("Materyal gecmise kaydedilemedi:", e); }
      }
      return Response.json({ ok: true, materyal: veri, tur, olusturan: ogretmen.ad });
    }

    if (tur === "brans_denemesi") {
      // 22 Eylul, Full Audit bulgusu: AI daha once "unite" alanini SERBEST
      // uyduruyordu (orn. Ingilizce'de "Unit 1: Simple Present" gibi mufredat
      // tablosuyla HIC eslesmeyen isimler) - 410 kayit boyle "yetim" cikmisti.
      // Gercek mufredat unitelerini cekip AI'ya SADECE bunlardan secmesini
      // soyluyoruz, boylece uretilen sorular Content Core'a baglanabilir.
      const gercekUniteler = await sql`SELECT DISTINCT unite FROM mufredat WHERE ders = ${ders} AND sinif = ${Number(sinif)}`;
      const uniteListesiMetni = gercekUniteler.length > 0
        ? `\n\nBu dersin GERCEK mufredat uniteleri (SADECE bu listeden sec, kendi uydurma):\n${gercekUniteler.map((u) => "- " + u.unite).join("\n")}`
        : "";

      const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinin TAMAMINI (tek uniteyle sinirli DEGIL) kapsayan, gercek bir sinav kitapcigi kalitesinde "${tanim.baslik}" hazirla. ${sinif}. sinif seviyesinde ${tanim.soruSayisi} soru olsun. ${soruTalimati}${kaliteReferansi ? " Kalite referansi: " + kaliteReferansi : ""} ONEMLI KURALLAR: (1) Sorular EN AZ 5 FARKLI UNITEDEN gelsin, tek bir uniteye yogunlasma - her sorunun hangi uniteden geldigini "unite" alaninda belirt, ${gercekUniteler.length > 0 ? "AŞAĞIDAKİ GERÇEK ÜNİTE LİSTESİNDEN BİREBİR SEÇEREK" : "gercekci bir isimle"}. (2) Zorluk dagilimi TAM OLARAK soyle olsun: ilk %20'si kolay, ortadaki %55'i orta, son %25'i zor (sirali ver). (3) Gercekci bir sinav suresi oner (soru basina ortalama 100 saniye hesabiyla). (4) Kisa, net bir sinav yonergesi yaz (ogrenciye nasil cevaplayacagini anlatan 1-2 cumle). (5) Her soru icin ayrica "beceri" (soru hangi beceriyi olcuyor, 2-4 kelime), "tahminiSureSaniye" (sayisal), "yayginHata" (ogrencilerin bu tarz soruda en sik yaptigi hata, kisa), "cozumTeknigi" (hizli cozum ipucu, kisa) alanlarini da doldur. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:${uniteListesiMetni}
{"baslik":"...","yonerge":"...","sinavSuresiDk":40,"sorular":[{"unite":"...","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","beceri":"...","tahminiSureSaniye":45,"yayginHata":"...","cozumTeknigi":"..."}]}`;

      const { veri, uretimSaglayicisi } = await aiCagirVeJsonAyikla(p, 8000, true);

      if (!veri.sorular || !Array.isArray(veri.sorular) || veri.sorular.length === 0) {
        return Response.json({ error: "Materyal uretilemedi, tekrar dene" }, { status: 500 });
      }

      // Katman 3 - capraz-model dogrulama (24 Eylul, GOLGE MOD, sadece log, engellemez)
      const soruOzeti3 = JSON.stringify(veri.sorular.map((s) => ({ soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogruIndex })));
      const caprazSonuc3 = await ikinciGorusAl(uretimSaglayicisi, soruOzeti3);
      if (caprazSonuc3?.hataVarMi) console.warn("materyal-uret CAPRAZ-MODEL uyari (GOLGE MOD):", tur, ders, konu, caprazSonuc3.bulgular);

      try {
        for (const s of veri.sorular) {
          if (!s.soru || !Array.isArray(s.secenekler) || s.dogruIndex == null) continue;
          await sql`
            INSERT INTO soru_bankasi (ders, sinif, unite, zorluk, soru, secenekler, dogru_index, kaynak_turu, beceri, tahmini_sure_saniye, yaygin_hata, cozum_teknigi)
            VALUES (${ders}, ${sinif}, ${s.unite || konu.trim()}, ${s.zorluk || null}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, ${"ogretmen_" + tur}, ${s.beceri || null}, ${s.tahminiSureSaniye || null}, ${s.yayginHata || null}, ${s.cozumTeknigi || null})
          `;
        }
      } catch (e) { console.error("Ogretmen materyali soru bankasina kaydedilemedi:", e); }

      if (ogretmenOturum?.id) {
        try {
          await sql`
            INSERT INTO ogretmen_materyalleri (ogretmen_id, tur, sinif, ders, konu, materyal)
            VALUES (${ogretmenOturum.id}, ${tur}, ${sinif}, ${ders}, ${konu?.trim() || null}, ${JSON.stringify(veri)})
          `;
        } catch (e) { console.error("Materyal gecmise kaydedilemedi:", e); }
      }
      return Response.json({ ok: true, materyal: veri, tur, olusturan: ogretmen.ad });
    }

    const notMetni = tanim.notGerekli ? ` Ogretmenin belirttigi hedef: "${ogretmenNotu.trim()}" - sorulari BUNA GORE hedefle.` : "";
    const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${tur === "brans_denemesi" ? "" : ` "${konu}" konusuyla ilgili`} ${sinif}. sinif seviyesinde bir "${tanim.baslik}" hazirla: ${tanim.aciklama}.${notMetni} ${soruTalimati}${kaliteReferansi ? " Kalite referansi: " + kaliteReferansi : ""} SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:
{"baslik":"...","ozet":"kisa konu ozeti (yoksa bos birak)","sorular":[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]}`;

    const { veri, uretimSaglayicisi } = await aiCagirVeJsonAyikla(p, 7000, true);

    if (!veri.sorular || !Array.isArray(veri.sorular) || veri.sorular.length === 0) {
      return Response.json({ error: "Materyal uretilemedi, tekrar dene" }, { status: 500 });
    }

    // Katman 3 - capraz-model dogrulama (24 Eylul, GOLGE MOD, sadece log, engellemez)
    const soruOzeti4 = JSON.stringify(veri.sorular.map((s) => ({ soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogruIndex })));
    const caprazSonuc4 = await ikinciGorusAl(uretimSaglayicisi, soruOzeti4);
    if (caprazSonuc4?.hataVarMi) console.warn("materyal-uret CAPRAZ-MODEL uyari (GOLGE MOD):", tur, ders, konu, caprazSonuc4.bulgular);

    veri.gorselSvg = await gorselKararIsteSunucu(ders, konu.trim(), sinif);

    try {
      for (const s of veri.sorular) {
        if (!s.soru || !Array.isArray(s.secenekler) || s.dogruIndex == null) continue;
        await sql`
          INSERT INTO soru_bankasi (ders, sinif, unite, zorluk, soru, secenekler, dogru_index, kaynak_turu)
          VALUES (${ders}, ${sinif}, ${konu.trim()}, ${s.zorluk || null}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, ${"ogretmen_" + tur})
        `;
      }
    } catch (e) { console.error("Ogretmen materyali soru bankasina kaydedilemedi:", e); }

    if (ogretmenOturum?.id) {
      try {
        await sql`
          INSERT INTO ogretmen_materyalleri (ogretmen_id, tur, sinif, ders, konu, materyal)
          VALUES (${ogretmenOturum.id}, ${tur}, ${sinif}, ${ders}, ${konu?.trim() || null}, ${JSON.stringify(veri)})
        `;
      } catch (e) { console.error("Materyal gecmise kaydedilemedi:", e); }
    }
    return Response.json({ ok: true, materyal: veri, tur, olusturan: ogretmen.ad });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Materyal uretilemedi: " + e.message }, { status: 500 });
  }
}
