import { aiCagirDetay, ikinciGorusAl } from "@/lib/ai";
import { kaliteKontrolYap, deterministikKontrolYap, mufredatSinirKontrolYap, kaliteLoglariniKaydet } from "@/lib/kalite-motoru";
import { jsonAyikla } from "@/lib/json-ayikla";
import { sql } from "@/lib/db";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { resendIstemcisi } from "@/lib/email";
import { gorselKararIsteSunucu } from "@/lib/gorsel-karar-sunucu";
import { soruTalimatiSecSunucu } from "@/lib/soru-talimati-sunucu";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { soruFormatGecerliMi } from "@/lib/soruFormatDogrula";
import { sorulariDenetle } from "@/lib/soruKalite";
import { OTOMASYON_TEST_CIHAZ_ID } from "@/lib/otomasyon-test";
import { paketiHerkeseAc } from "@/lib/halka-acik-paket";

export const maxDuration = 60;

// 22 Ekim: canli kanit - anlatimda "(3^2)^3 = 3^6 = 72" (dogrusu 729) cikti. Capraz dogrulama yalniz SORULARA bakiyor,
// anlatimdaki sayisal hata yakalanmiyordu. Burada "a^b = sonuc" biciminde yazilmis ESITLIKLER sunucuda hesaplanip dogrulanir.
// Zincirli/ifadeli esitlikler (2^3=2*2*2, 2^3.2^2=...) bilerek atlanir: sonuc sayisindan sonra * . x ^ / + - gelirse eslesme yok sayilir.
function usEsitligiHatalari(metin) {
  const hatalar = [];
  const re = /(\d{1,3})\^(\d{1,2})\s*=\s*(\d{1,15})(?![\d.,]|\s*[-*·×x^/+])/g;
  let m;
  while ((m = re.exec(String(metin || ""))) !== null) {
    const taban = Number(m[1]), us = Number(m[2]), yazilan = Number(m[3]);
    const dogru = Math.pow(taban, us);
    if (Number.isSafeInteger(dogru) && dogru !== yazilan) hatalar.push(`${taban}^${us} = ${dogru} (yazilan: ${yazilan})`);
  }
  return hatalar;
}


// Soru havuzu icin 18 soru istenir (6 kolay, 7 orta, 5 zor); bagimsiz denetim bazi sorulari eler (canli: havuzlar 10-14 soruya
// inmisti, kalite kontrolu 15 istiyor). Denetimden sonra zorluk dagilimi korunarak 15'e kirpilir (5 kolay, 6 orta, 4 zor).
function dengeliKirp(sorular, hedef) {
  if (!Array.isArray(sorular) || sorular.length <= hedef) return sorular;
  const kota = { kolay: 5, orta: 6, zor: 4 };
  const sayac = { kolay: 0, orta: 0, zor: 0 };
  const secili = new Set();
  sorular.forEach((s, i) => {
    const z = typeof s?.zorluk === "string" ? s.zorluk.trim().toLowerCase() : "";
    if (z in kota && sayac[z] < kota[z]) { sayac[z]++; secili.add(i); }
  });
  sorular.forEach((s, i) => { if (secili.size < hedef && !secili.has(i)) secili.add(i); });
  return sorular.filter((s, i) => secili.has(i));
}

// TEK KONU MOTORU - Adim 1 (14 Eylul). Bir konu icin TEK AI cagrisiyla
// anlatim+soru havuzu+odev URETIP icerik_onbellek'e icerik_json olarak
// yazan endpoint. Cache varsa AI'ya HIC gitmez (maliyet=0). Bu, mevcut
// konuAnlat()/soruUret() akislarini BOZMAZ - onlar hala calisiyor, bu
// SADECE yeni, paralel bir yol. Once buradan test edilip kanitlanacak,
// sonra frontend kademeli olarak buna baglanacak (fallback korunarak).

// Kalite Kontrol Motoru - Adim 1 (16 Eylul, programatik/AI'siz, hizli ve
// ucretsiz kontroller). Master plandaki "AI->QC->Ogretmen->Onay->Yayin"
// zincirinin İLK halkasi. Simdilik SADECE isaretler (uretimi engellemez,
// ogrenciye gostermeyi durdurmaz) - admin'in gorebilecegi bir "uyarilar"
// listesi olusturur. Ileride bu liste admin panelde goruntulenip
// ogretmen onayina cikacak.

// Faz E (20 Ekim): tarayiciya giden paket paketiHerkeseAc ile suzulur - soru havuzunun cevap
// anahtarlari (dogruIndex/aciklama/kontrolIfadesi) ve odev cozumleri cevapta YER ALMAZ.
export async function GET(req) {
  try {
    const u = new URL(req.url);
    const istekBaslangicMs = Date.now();
    const sinif = u.searchParams.get("sinif");
    const ders = u.searchParams.get("ders");
    const konu = u.searchParams.get("konu");
    const unite = u.searchParams.get("unite") || "";
    const cihazId = u.searchParams.get("cihazId");

    if (!sinif || !ders || !konu) {
      return Response.json({ error: "sinif, ders, konu zorunlu" }, { status: 400 });
    }

    // 21 Eylul, Full Audit'te bulunan KRITIK acik: bu route'ta hicbir erisim
    // kontrolu yoktu - kimliksiz/sinirsiz cagrilabiliyordu (gercek maliyet
    // riski). soru-coz'daki kanitlanmis desenle (gunlukLimitKontrolEt) kapatildi.
    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.premium ? "Bugunluk yogun kullanim sinirina ulastin (" + limit.limit + "/gun), yarin devam edebilirsin." : "Gunluk ucretsiz kullanim hakkin doldu (" + limit.limit + "/gun). Premium ile daha fazla kullanabilirsin." },
        { status: 429 }
      );
    }

    // 1. Cache kontrolu
    // Kalite kontrolunden GECEN paket onay_durumu NULL olarak yazilir; eskiden yalniz 'onaylandi' satirlar onbellekten
    // sunuldugu icin gecen paketler hic kullanilmiyor, her istek yeniden uretiliyor ve yeni satir ekliyordu (canli veri:
    // 5 konuda 40 tekrar satir, yalniz 1 onayli). Artik ogretmen onayli satir ya da kalite kontrolu gecmis (kaliteKontrol.gecti)
    // satir sunulur; ogrenciye zaten bu halde gosterilmis icerik tekrar uretilmez. Basarisiz/bekleyen paket sunulmaz.
    const adaylar = await sql`
      SELECT id, onay_durumu, icerik_json FROM icerik_onbellek
      WHERE sinif = ${Number(sinif)} AND ders = ${ders} AND unite = ${unite}
        AND konu = ${konu} AND icerik_turu = 'konu_paketi' AND (onay_durumu = 'onaylandi' OR onay_durumu IS NULL)
      ORDER BY (onay_durumu = 'onaylandi') DESC NULLS LAST, olusturulma DESC
      LIMIT 5
    `;
    const mevcut = [];
    for (const a of adaylar) {
      if (!a.icerik_json) continue;
      if (a.onay_durumu === "onaylandi") { mevcut.push(a); break; }
      let p = a.icerik_json;
      if (typeof p === "string") { try { p = JSON.parse(p); } catch (e) { continue; } }
      // Saklanan damgaya degil TAZE kontrole bakilir: eski satirlarda damga 'gecti' iken havuz sonradan 15'in altina inmis olabilir (canli: id 60).
      let temiz = false;
      try { temiz = !!p && kaliteKontrolYap("konu_paketi", p).gecti === true; } catch (e) { temiz = false; }
      if (temiz) { mevcut.push(a); break; }
    }
    if (mevcut.length > 0 && mevcut[0].icerik_json) {
      await sql`UPDATE icerik_onbellek SET kullanim_sayisi = kullanim_sayisi + 1, son_kullanim = now() WHERE id = ${mevcut[0].id}`;
      return Response.json({ kaynak: "cache", paket: paketiHerkeseAc(mevcut[0].icerik_json) });
    }

    // 2. Tek AI cagrisiyla TAM paket uretimi
    const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";
    // kontrolIfadesi (Katman 2/deterministik dogrulama) SADECE Matematik'te
    // isteniyor (18 Eylul, kullanici karari) - Fen dahil diger derslerde
    // yapay sayisal soru uretme guduusu olusmasin diye hic bahsi gecmiyor.
    const kontrolIfadesiTalimati = ders === "Matematik"
      ? `, "kontrolIfadesi":"Sorunun cevabi TEK BIR SAYI ise (sozel problem OLSA BILE), cevabi veren TAMAMEN SAYISAL bir ifade yaz (orn. 3^2*3^4 veya 20*22). SADECE cevap harfli/degiskenli (x/y/a iceren) ise BOS STRING birak"`
      : "";
    // 22 Ekim: canli kanit - Ingilizce paket TURKCE gecmis zaman/genis zaman anlatti ve Turkce cumlelerle soru sordu; cunku
    // "Tum metinler SADECE Turkce" kurali dersten bagimsizdi. Ingilizce dersinde ogretilen dil Ingilizce'dir.
    const dilKurali = ders === "Ingilizce"
      ? "Aciklama ve anlatim metinleri Turkce yazilsin (ogrenci Turkce konusan bir ortaokul ogrencisi). ANCAK bu bir INGILIZCE dersidir: ogretilen konunun ornek cumleleri, kelimeleri ve diyaloglari INGILIZCE yazilmali (yaninda Turkce aciklama/karsilik verilebilir). Coktan secmeli SORU metinleri ve SECENEKLER INGILIZCE olmali (gercek LGS Ingilizce sinavi gibi); sadece 'aciklama' ve 'cozum' alanlari Turkce olsun. Konu INGILIZCE dilbilgisi/kelime konusudur: Turkce cumleyi Ingilizce kurala gore degerlendirmeyi isteyen soru YAZMA, Turkce dilbilgisi ANLATMA. Cince/Arapca/Kiril gibi baska alfabeler kullanma"
      : "Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma";
    const soruTalimati = await soruTalimatiSecSunucu(sinif);
    const p = `Sen deneyimli, alaninda uzman bir "${ders}" ogretmenisin. "${konu}" konusu${unite ? ` (${unite} unitesinden)` : ""} icin, ${sinif}. sinif seviyesinde TAM bir konu paketi hazirla.

SESIN COK ONEMLI: Bu bir DERS KITABI DEGIL, gercek bir ogretmenin sinifta/ozel derste, karsisindaki TEK BIR ogrenciyle yaptigi CANLI bir diyalog. "Once X hesaplanir" gibi SOGUK cumleleri KESINLIKLE YAZMA. Onun yerine "Bak, once suna bakalim...", "Simdi..." gibi KONUSUR gibi yaz. Her 2-3 cumlede bir hitap MUTLAKA olsun, cumleler kisa (8-12 kelime) olsun.

ONEMLI UYARI: "Aferin", "tam da bunu bekliyordum", "harikasin" gibi KALIP OVGU/TESVIK cumlelerini KULLANMA - bunlar yazida yapay/mekanik durur, gercek bir insan boyle konusmaz her cumlede. Sabit bir soru-cevap sablonunu (her paragrafta "Peki... dersin?" gibi) HER YERDE TEKRARLAMA - bu da mekanik/muhurlenmis hissettirir. Bunun yerine: konuya ve baglama gore DOGAL, DEGISKEN bir anlatim kur - bazen ogrenciye kisa bir soru sorup cevaplayabilirsin, bazen sadece "bak/simdi" ile devam edebilirsin, bazen bir hatayi onceden tahmin edip uyarabilirsin. Hangi teknigi ne zaman kullanacagina konu KENDI belirlesin, sabit bir kalip her paragrafta zorunlu DEGIL. Amac, bir insanin GERCEKTEN konusuyormus gibi DOGAL, degisken bir akis - ayni cumle yapisini/kalibi tekrar tekrar KOPYALAMA.

Kalite referansi: ${kaliteReferansi}
${soruTalimati}

SADECE JSON dondur, markdown kullanma. ${dilKurali}:

{
  "anlatim": {
    "hizliOgren": "30 saniyede ozet, 2-3 cumle",
    "temelAnlatim": "konunun temel mantigi, ana kavramlar, TANIM+SOMUT ORNEK ile, 150-200 kelime",
    "derinAnlatim": "konunun NEDEN ve NASIL calistigi, daha derin bakis, 200-250 kelime",
    "pufNoktalari": ["sinavda zaman kazandiran pratik kisayol/teknik 1", "teknik 2", "teknik 3"],
    "sikHatalar": ["ogrencilerin sik yaptigi hata 1", "hata 2", "hata 3"],
    "yeniNesilUygulama": "gercek bir yeni nesil LGS tarzi problemde bu bilginin nasil kullanilacagini gosteren somut ornek, 120-150 kelime"
  },
  "soruHavuzu": [
    {"soru":"...", "secenekler":["A) ...","B) ...","C) ...","D) ..."], "dogruIndex":0, "zorluk":"kolay", "aciklama":"kisa cozum aciklamasi"${kontrolIfadesiTalimati}}
  ],
  "odevSorulari": [
    {"soru":"...", "cozum":"adim adim detayli cozum metni"}
  ]
}

soruHavuzu TAM 18 soru icersin: 6 kolay, 7 orta, 5 zor (sirali ver). odevSorulari TAM 6 acik uclu soru icersin (coktan secmeli DEGIL), her biri icin adim adim detayli cozum ver.`;

    // 22 Ekim: TEK 10.000 token'lik cagri yerine UC PARALEL parca (canli kanit: tek cagri 53,7 sn surdu, anlatim talimatin
    // %50'si kadar kisa geldi). Anlatim ve soru havuzu zorunlu; odev opsiyonel (eksikse asagidaki tamamlama adimi doldurur).
    const sema = p.indexOf("SADECE JSON dondur, markdown kullanma.");
    const baslik = sema > 0 ? p.slice(0, sema) : p;
    const jsonKurali = `SADECE JSON dondur, markdown kullanma. ${dilKurali}:\n\n`;
    // 22 Ekim: canli kanit - bir parcanin JSON'u bozuk geldi ("Expected ',' or ']' ... position 7853") ve tum paket 500 verdi.
    // Her parca kendi basina ayristirilir; bozuksa (sure varsa) FARKLI bir saglayiciyla bir kez daha uretilir.
    const parcaCoz = async (parametreler, butceMs) => {
      const r = await aiCagirDetay(parametreler, null, butceMs);
      try {
        return { veri: jsonAyikla(r.metin), saglayici: r.saglayici };
      } catch (e) {
        console.warn("konu_paketi parca JSON bozuk, farkli saglayiciyla tekrar:", parametreler.tur, r.saglayici, e.message);
        if (Date.now() - istekBaslangicMs > 32000) throw e;
        const alt = ["gemini", "anthropic", "groq"].filter((x) => x !== r.saglayici);
        const r2 = await aiCagirDetay(parametreler, alt, 20000);
        return { veri: jsonAyikla(r2.metin), saglayici: r2.saglayici };
      }
    };
    const parcaliUret = async (butceMs) => {
      const anlatimPrompt = (duzeltme) => `${baslik}${jsonKurali}{
  "anlatim": {
    "hizliOgren": "30 saniyede ozet, 2-3 cumle",
    "temelAnlatim": "konunun temel mantigi, ana kavramlar, TANIM+SOMUT ORNEK ile, EN AZ 150 kelime",
    "derinAnlatim": "konunun NEDEN ve NASIL calistigi, daha derin bakis, EN AZ 200 kelime",
    "pufNoktalari": ["sinavda zaman kazandiran pratik kisayol/teknik 1", "teknik 2", "teknik 3"],
    "sikHatalar": ["ogrencilerin sik yaptigi hata 1", "hata 2", "hata 3"],
    "yeniNesilUygulama": "gercek bir yeni nesil LGS tarzi problemde bu bilginin nasil kullanilacagini gosteren somut ornek, EN AZ 120 kelime"
  }
}

Uzunluk hedeflerini KISALTMA. Metindeki TUM sayisal hesaplari (us, carpma, bolme, toplama) yazmadan once tek tek yeniden hesapla; yanlis sonuc YAZMA.${duzeltme || ""}`;
      const soruPrompt = (adet, dagilim, ek) => `${baslik}${jsonKurali}{
  "soruHavuzu": [
    {"soru":"...", "secenekler":["A) ...","B) ...","C) ...","D) ..."], "dogruIndex":0, "zorluk":"kolay", "aciklama":"kisa cozum aciklamasi"${kontrolIfadesiTalimati}}
  ]
}

soruHavuzu TAM ${adet} soru icersin: ${dagilim} (sirali ver). Her soruda tam 4 secenek, tek ve tartismasiz dogru cevap olsun.${ek}`;
      const odevPrompt = (adet, ek) => `${baslik}${jsonKurali}{
  "odevSorulari": [
    {"soru":"...", "cozum":"adim adim detayli cozum metni"}
  ]
}

odevSorulari TAM ${adet} acik uclu soru icersin (coktan secmeli DEGIL), her biri icin adim adim detayli cozum ver.${ek}`;

      const anlatimUret = async () => {
        let r = await parcaCoz({ prompt: anlatimPrompt(""), maxTokens: 4500, jsonModu: true, tur: "konu_paketi_anlatim" }, butceMs);
        let a = r.veri;
        const metinler = () => [a?.anlatim?.temelAnlatim, a?.anlatim?.derinAnlatim, a?.anlatim?.yeniNesilUygulama].join(" \n ");
        let hatalar = usEsitligiHatalari(metinler());
        if (hatalar.length > 0) {
          console.warn("konu_paketi anlatim SAYISAL HATA, yeniden uretiliyor:", ders, konu, hatalar);
          try {
            const r2 = await parcaCoz({ prompt: anlatimPrompt(`\nONCEKI DENEMEDE su hesaplar YANLIS yazilmisti: ${hatalar.join("; ")}. Bunlari DOGRU sonucla yaz.`), maxTokens: 4500, jsonModu: true, tur: "konu_paketi_anlatim" }, Math.min(butceMs, 20000));
            if (r2.veri?.anlatim?.temelAnlatim) { a = r2.veri; r = r2; hatalar = usEsitligiHatalari(metinler()); }
          } catch (e) { /* ilk anlatimla devam */ }
        }
        return { anlatim: a.anlatim, saglayici: r.saglayici, sayisalHata: hatalar };
      };

      // 22 Ekim: canli kanit - Anthropic ~100-130 token/sn; 7.500 token'lik tek soru cagrisi 28 sn, ucretsiz katman 503 beklemesi
      // eklenince 60 sn asildi (504). Soru ve odev ikiser YARIM cagriya bolunur (hepsi paralel).
      const [an, so1, so2, od1, od2] = await Promise.allSettled([
        anlatimUret(),
        parcaCoz({ prompt: soruPrompt(9, "6 kolay, 3 orta", " Bu, 18 soruluk havuzun ILK YARISI: temel kural ve dogrudan hesaplama sorulari."), maxTokens: 4000, jsonModu: true, tur: "konu_paketi" }, butceMs),
        parcaCoz({ prompt: soruPrompt(9, "4 orta, 5 zor", " Bu, 18 soruluk havuzun IKINCI YARISI: kolay sorulari TEKRARLAMA; yorum, kural birlestirme ve yeni nesil LGS tarzi sorular agirlikli olsun."), maxTokens: 4000, jsonModu: true, tur: "konu_paketi" }, butceMs),
        parcaCoz({ prompt: odevPrompt(3, ""), maxTokens: 3000, jsonModu: true, tur: "konu_paketi_odev" }, butceMs),
        parcaCoz({ prompt: odevPrompt(3, " Bu, 6 odevlik setin IKINCI YARISI: farkli beceri ve baglamlara odaklan, konuyu farkli acilardan sorgula."), maxTokens: 3000, jsonModu: true, tur: "konu_paketi_odev" }, butceMs),
      ]);
      if (an.status !== "fulfilled" || !an.value.anlatim) throw new Error("Anlatim uretilemedi: " + (an.reason?.message || "bos"));
      const soruParcalari = [so1, so2].filter((x) => x.status === "fulfilled");
      if (soruParcalari.length === 0) throw new Error("Soru havuzu uretilemedi: " + (so1.reason?.message || "bos"));
      const gorulen = new Set();
      const soruHavuzu = [];
      for (const x of soruParcalari) {
        for (const q of Array.isArray(x.value.veri?.soruHavuzu) ? x.value.veri.soruHavuzu : []) {
          const anahtar = String(q?.soru || "").trim().toLowerCase();
          if (!anahtar || gorulen.has(anahtar)) continue;
          gorulen.add(anahtar);
          soruHavuzu.push(q);
        }
      }
      const odevSorulari = [od1, od2]
        .filter((x) => x.status === "fulfilled")
        .flatMap((x) => (Array.isArray(x.value.veri?.odevSorulari) ? x.value.veri.odevSorulari : []));
      return {
        paket: { anlatim: an.value.anlatim, soruHavuzu, odevSorulari },
        saglayici: soruParcalari[0].value.saglayici,
      };
    };

    // Gorsel karari parcalarla PARALEL baslar (birbirine bagimli degil); sonucu asagida beklenir.
    const gorselSozu = gorselKararIsteSunucu(ders, konu, sinif).catch(() => null);
    const ilk = await parcaliUret(38000);
    let paket = ilk.paket;
    let uretimSaglayicisi = ilk.saglayici;

    if (!paket.anlatim || !Array.isArray(paket.soruHavuzu) || paket.soruHavuzu.length === 0) {
      return Response.json({ error: "Paket uretilemedi, tekrar dene" }, { status: 500 });
    }

    // 23 Eylul: Gorsel Motoru eklendi - Full Audit'te bulundu, arsivin temel
    // tasi olan bu route'ta hic gorsel yoktu (materyal-uret'te vardi).
    paket.gorselSvg = await gorselSozu;

    // 2.5 Kalite Kontrolu - uretimi ENGELLEMEZ, sadece isaretler
    let kaliteSonucu = kaliteKontrolYap("konu_paketi", paket);
    if (!kaliteSonucu.gecti) console.warn("konu_paketi kalite uyarisi:", ders, konu, kaliteSonucu.uyarilar);

    // 23 Eylul: GERCEK kullanici testinde bulundu - bir saglayici Turkce'ye
    // ozgu harfleri (ı/ü/ö/ş/ğ/ç) TAMAMEN ASCII'ye cevirmisti ("Yıldız" ->
    // "Yildiz" TUM metin boyunca). Bu, diger uyarilardan farkli olarak
    // TEK SEFERLIK bir yeniden uretimi HAKLI CIKARIR (yanlis-pozitif riski
    // cok dusuk) - digerleri gibi sadece isaretlemekle YETINILMEZ.
    if (kaliteSonucu.uyarilar.some((u) => u.includes("ASCII-transliterasyon"))) {
      console.warn("konu_paketi ASCII-transliterasyon supheli, YENIDEN uretiliyor:", ders, konu);
      try {
        const { paket: paket2, saglayici: saglayici2 } = await parcaliUret(20000); // 23 Eylul: kisa butce - bu retry, ana uretim+gorsel karari UZERINE eklenip 60sn sinirini asmamali (GERCEK testte kanitlandi)
        if (paket2.anlatim && Array.isArray(paket2.soruHavuzu) && paket2.soruHavuzu.length > 0) {
          paket2.gorselSvg = paket.gorselSvg;
          paket = paket2;
          uretimSaglayicisi = saglayici2;
          kaliteSonucu = kaliteKontrolYap("konu_paketi", paket);
        }
      } catch (yenidenUretimHatasi) { /* basarisiz olursa ilk uretimle devam */ }
    }
    paket.kaliteKontrol = kaliteSonucu;

    const soruHavuzuFormatGecen = (paket.soruHavuzu || []).filter((s) =>
      soruFormatGecerliMi(s, { soruTrimGerekli: true, dersUniteGerekli: false })
    );
    if (soruHavuzuFormatGecen.length === 0) {
      return Response.json(
        { error: "Soru havuzu uretilemedi (format), tekrar dene" },
        { status: 500 }
      );
    }
    const denetimBaglami = "Bu sorular \"" + ders + "\" dersi \""
      + konu + "\" konusu icin bir konu anlatimi paketinin soru"
      + " havuzunda kullanilacak, ogrenciye dogrudan gosterilecek,"
      + " cok yuksek dogruluk gerekiyor.";
    const denetimSonucu = await sorulariDenetle(soruHavuzuFormatGecen, denetimBaglami);
    let soruHavuzuKaliteGecen = denetimSonucu.gecenler;
    let soruHavuzuElenen = denetimSonucu.elenenSayisi;

    // Eleme sonrasi 15'in altinda kalirsa (canli kanit 21 Ekim: 13, 12 soru; denetim 4-7 soru eliyor) eksik kismi KUCUK bir ikinci cagriyla
    // tamamla: yalniz eksik + 3 yedek soru istenir, ayni bagimsiz denetimden gecer. Sure yetmiyorsa (60 sn sinir) atlanir; eski davranis korunur.
    if (soruHavuzuKaliteGecen.length < 15 && Date.now() - istekBaslangicMs < 32000) {
      try {
        const eksikSayi = 15 - soruHavuzuKaliteGecen.length;
        const istenenYeni = eksikSayi + 3;
        const kota = { kolay: 5, orta: 6, zor: 4 };
        const var1 = { kolay: 0, orta: 0, zor: 0 };
        soruHavuzuKaliteGecen.forEach((x) => { const z = typeof x?.zorluk === "string" ? x.zorluk.trim().toLowerCase() : ""; if (z in var1) var1[z]++; });
        const ihtiyac = ["kolay", "orta", "zor"].map((z) => `${Math.max(0, kota[z] - var1[z])} ${z}`).join(", ");
        const mevcutSorular = soruHavuzuKaliteGecen.map((x, i) => `${i + 1}. ${x.soru}`).join("\n");
        const tamamlaPrompt = `Sen deneyimli bir "${ders}" ogretmenisin. "${konu}" konusu${unite ? ` (${unite} unitesinden)` : ""} icin ${sinif}. sinif seviyesinde coktan secmeli sorular hazirlayacaksin. Asagidaki sorular ZATEN var, bunlari ve bunlara benzer sorulari TEKRARLAMA:
${mevcutSorular}

TAM ${istenenYeni} YENI soru uret (zorluk ihtiyaci: ${ihtiyac}; kalanini orta yap). Her soruda tam 4 secenek, tek ve tartismasiz dogru cevap, acikca yanlis celdiriciler olsun. ${dilKurali}.
SADECE JSON dondur: {"sorular":[{"soru":"...", "secenekler":["A) ...","B) ...","C) ...","D) ..."], "dogruIndex":0, "zorluk":"kolay", "aciklama":"kisa cozum aciklamasi"${kontrolIfadesiTalimati}}]}`;
        const { metin: tamamlaCevap } = await aiCagirDetay({ prompt: tamamlaPrompt, maxTokens: 900 + istenenYeni * 450, jsonModu: true, tur: "konu_paketi_tamamlama" }, null, 14000);
        const yeniHam = jsonAyikla(tamamlaCevap);
        const yeniFormatGecen = (Array.isArray(yeniHam.sorular) ? yeniHam.sorular : []).filter((x) =>
          soruFormatGecerliMi(x, { soruTrimGerekli: true, dersUniteGerekli: false })
        );
        if (yeniFormatGecen.length > 0) {
          const yeniDenetim = await sorulariDenetle(yeniFormatGecen, denetimBaglami, 7000);
          soruHavuzuKaliteGecen = soruHavuzuKaliteGecen.concat(yeniDenetim.gecenler);
          soruHavuzuElenen += yeniDenetim.elenenSayisi + (yeniHam.sorular.length - yeniFormatGecen.length);
          paket.soruHavuzuTamamlandi = yeniDenetim.gecenler.length;
        }
      } catch (tamamlaHatasi) { console.warn("konu_paketi havuz tamamlama basarisiz:", ders, konu, tamamlaHatasi.message); }
    }
    // Odev sayisi 6'nin altinda kalirsa (canli: 5, ve Ingilizce 7'de 2-3) eksik odevler kucuk bir ikinci cagriyla tamamlanir.
    const odevGecerli = (o) => o && typeof o.soru === "string" && o.soru.trim() && typeof o.cozum === "string" && o.cozum.trim();
    if (Array.isArray(paket.odevSorulari)) paket.odevSorulari = paket.odevSorulari.filter(odevGecerli);
    if ((paket.odevSorulari || []).length < 6 && Date.now() - istekBaslangicMs < 40000) {
      try {
        const eksikOdev = 6 - (paket.odevSorulari || []).length;
        const mevcutOdev = (paket.odevSorulari || []).map((o, i) => `${i + 1}. ${o.soru}`).join("\n");
        const odevPrompt = `Sen deneyimli bir "${ders}" ogretmenisin. "${konu}" konusu${unite ? ` (${unite} unitesinden)` : ""} icin ${sinif}. sinif seviyesinde ACIK UCLU (coktan secmeli DEGIL) odev sorulari hazirla. Su sorular ZATEN var, bunlari tekrarlama:
${mevcutOdev || "(yok)"}

TAM ${eksikOdev} YENI acik uclu soru uret, her biri icin adim adim detayli cozum yaz. ${dilKurali}.
SADECE JSON dondur: {"odevSorulari":[{"soru":"...", "cozum":"adim adim detayli cozum metni"}]}`;
        const { metin: odevCevap } = await aiCagirDetay({ prompt: odevPrompt, maxTokens: 800 + eksikOdev * 700, jsonModu: true, tur: "konu_paketi_odev_tamamlama" }, null, 15000);
        const yeniOdev = jsonAyikla(odevCevap);
        const eklenecek = (Array.isArray(yeniOdev.odevSorulari) ? yeniOdev.odevSorulari : []).filter(odevGecerli).slice(0, eksikOdev);
        if (eklenecek.length > 0) paket.odevSorulari = (paket.odevSorulari || []).concat(eklenecek);
      } catch (odevHatasi) { console.warn("konu_paketi odev tamamlama basarisiz:", ders, konu, odevHatasi.message); }
    }
    if (soruHavuzuKaliteGecen.length === 0) {
      return Response.json(
        { error: "Soru havuzu kalite denetiminden gecemedi, tekrar dene" },
        { status: 500 }
      );
    }
    paket.soruHavuzu = dengeliKirp(soruHavuzuKaliteGecen, 15);
    paket.soruHavuzuElenen = soruHavuzuElenen;

    // 14 Ekim: eleme sonrasi havuz 15'in altina inebilir (canli kanit:
    // icerik_onbellek id 56 ve 58). Yapisal kontrol ELEMEDEN ONCE yapildigi
    // icin eksik paket "gecti" damgasi alip ogretmen kuyruguna GIRMIYORDU.
    // Kontrolu son haliyle yeniden calistiriyoruz: eksik paket artik
    // 'bekliyor' olur ve ogretmene gercek nedenle bildirilir.
    kaliteSonucu = kaliteKontrolYap("konu_paketi", paket);
    paket.kaliteKontrol = kaliteSonucu;

    // Katman 2 - deterministik kontrol (GOLGE MOD, sadece log, engellemez)
    const detKontrol = deterministikKontrolYap(paket.soruHavuzu || []);
    if (!detKontrol.uyumlu) console.warn("konu_paketi DETERMINISTIK uyari (GOLGE MOD):", ders, konu, detKontrol.uyarilar);

    // Katman 3 - capraz-model dogrulama (GOLGE MOD, sadece log, engellemez, hic throw etmez)
    const soruOzeti = JSON.stringify((paket.soruHavuzu || []).map((s) => ({ soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogruIndex })));
    // 22 Ekim: golge mod (yalniz log) - sure kisitliysa atlanir, 60 sn sinirini zorlamasin
    const caprazSonuc = Date.now() - istekBaslangicMs < 40000 ? await ikinciGorusAl(uretimSaglayicisi, soruOzeti) : null;
    if (caprazSonuc?.hataVarMi) console.warn("konu_paketi CAPRAZ-MODEL uyari (GOLGE MOD):", ders, konu, caprazSonuc.bulgular);

    // Katman 4 - mufredat sinir kontrolu (SADE, 18 Eylul: yapay-matematik
    // deseni ve buna bagli otomatik yeniden uretim KALDIRILDI - gercek veriyle
    // (MEB/EBA kaynaklari) dogrulandi ki cok yuksek yanlis-pozitif veriyordu.
    // Sadece referans var/yok kontrolu kaldi, GOLGE MOD, sadece log.
    const mufredatSonuc = mufredatSinirKontrolYap(ders);
    if (!mufredatSonuc.gecti) console.warn("konu_paketi MUFREDAT-SINIR uyari (GOLGE MOD):", ders, konu, mufredatSonuc.uyarilar);

    // 3. Cache'e kaydet (basit metin alani icin anlatim.temelAnlatim kullanilir)
    // Kalite kontrolunden gecemeyen paketler 'bekliyor' olarak isaretlenir -
    // ogretmen inceleme kuyruguna girer (16 Eylul, Quality Control Motoru adim 2).
    const onayDurumu = kaliteSonucu.gecti ? null : "bekliyor";

    // Otomasyon testi: akis yukarida TAM calisti (uretim, denetim, kalite),
    // ama kalici kayit ve ogretmen bildirimi YAPILMAZ. Aksi halde her test
    // kosusu yeni bekliyor satiri ve e-posta uretiyordu.
    if (cihazId === OTOMASYON_TEST_CIHAZ_ID) {
      return Response.json({ kaynak: "yeni_uretim", paket: paketiHerkeseAc(paket), testModu: true });
    }
    // Ayni konu icin zaten 'bekliyor' satiri varsa yenisi eklenmez ve ogretmene tekrar e-posta gonderilmez
    // (canli veri: 2 konuda 11 bekleyen satir, her yeniden uretim kuyruga ve gelen kutusuna yeni kayit ekliyordu).
    let zatenBekliyor = false;
    if (onayDurumu === "bekliyor") {
      try {
        const var1 = await sql`
          SELECT 1 FROM icerik_onbellek
          WHERE sinif = ${Number(sinif)} AND ders = ${ders} AND unite = ${unite} AND konu = ${konu}
            AND icerik_turu = 'konu_paketi' AND onay_durumu = 'bekliyor' LIMIT 1
        `;
        zatenBekliyor = var1.length > 0;
      } catch (e) { /* kontrol basarisizsa eski davranis: kaydet */ }
    }
    if (!zatenBekliyor) try {
      const cacheSonuc = await sql`
        INSERT INTO icerik_onbellek (sinif, ders, unite, konu, zorluk_seviyesi, icerik_turu, icerik, icerik_json, kullanim_sayisi, olusturulma, son_kullanim, onay_durumu)
        VALUES (${Number(sinif)}, ${ders}, ${unite}, ${konu}, '', 'konu_paketi', ${paket.anlatim.temelAnlatim || ""}, ${JSON.stringify(paket)}, 1, now(), now(), ${onayDurumu})
        RETURNING id
      `;
      // Katman 5 - 4 katmanin sonuclarini kalici tabloya kaydet (GOLGE MOD, ates-et-unut)
      await kaliteLoglariniKaydet("icerik_onbellek", cacheSonuc[0].id, [
        { katman: "yapisal", gecti: kaliteSonucu.gecti, uyarilar: kaliteSonucu.uyarilar },
        { katman: "deterministik", gecti: detKontrol.uyumlu, uyarilar: detKontrol.uyarilar },
        { katman: "capraz_model", gecti: !caprazSonuc?.hataVarMi, uyarilar: caprazSonuc?.bulgular || [] },
        { katman: "mufredat_sinir", gecti: mufredatSonuc.gecti, uyarilar: mufredatSonuc.uyarilar },
      ]);
    } catch (e) { console.error("konu_paketi cache yazilamadi:", e); }

    // Isaretlenen paket icin eslesen branstaki ogretmen(ler)e bildirim gonder
    if (onayDurumu === "bekliyor" && !zatenBekliyor) {
      try {
        const ilgiliOgretmenler = await sql`SELECT eposta, ad FROM ogretmenler WHERE brans = ${ders} AND aktif = true`;
        for (const o of ilgiliOgretmenler) {
          await resendIstemcisi().emails.send({
            from: "Karemux <bildirim@karemux.com>",
            to: o.eposta,
            subject: `İnceleme bekleyen içerik: ${ders} - ${konu}`,
            text: `Merhaba ${o.ad},\n\n"${konu}" (${ders}, ${sinif}. sınıf) konusu için otomatik üretilen içerik, kalite kontrolünde bazı uyarılar aldı ve senin incelemeni bekliyor.\n\nUyarılar: ${kaliteSonucu.uyarilar.join("; ")}\n\nÖğretmen panelindeki "İçerik İncelemesi" sekmesinden inceleyip onaylayabilir veya reddedebilirsin.\n\nKaremux Ekibi`,
          }).catch((e) => console.error("Inceleme bildirimi gonderilemedi:", e.message));
        }
      } catch (e) { console.error("Ogretmen bildirimi hatasi:", e); }
    }

    return Response.json({ kaynak: "yeni_uretim", paket: paketiHerkeseAc(paket) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Konu paketi getirilemedi: " + e.message }, { status: 500 });
  }
}
