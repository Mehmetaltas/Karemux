import { aiCagir } from "@/lib/ai";
import { kaliteKontrolYap, deterministikKontrolYap } from "@/lib/kalite-motoru";
import { sql } from "@/lib/db";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { resendIstemcisi } from "@/lib/email";

// TEK KONU MOTORU - Adim 1 (14 Eylul). Bir konu icin TEK AI cagrisiyla
// anlatim+soru havuzu+odev URETIP icerik_onbellek'e icerik_json olarak
// yazan endpoint. Cache varsa AI'ya HIC gitmez (maliyet=0). Bu, mevcut
// konuAnlat()/soruUret() akislarini BOZMAZ - onlar hala calisiyor, bu
// SADECE yeni, paralel bir yol. Once buradan test edilip kanitlanacak,
// sonra frontend kademeli olarak buna baglanacak (fallback korunarak).

function jsonAyikla(cevap) {
  const temiz = cevap.replace(/```json|```/g, "").trim();
  return JSON.parse(temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1));
}

// Kalite Kontrol Motoru - Adim 1 (16 Eylul, programatik/AI'siz, hizli ve
// ucretsiz kontroller). Master plandaki "AI->QC->Ogretmen->Onay->Yayin"
// zincirinin İLK halkasi. Simdilik SADECE isaretler (uretimi engellemez,
// ogrenciye gostermeyi durdurmaz) - admin'in gorebilecegi bir "uyarilar"
// listesi olusturur. Ileride bu liste admin panelde goruntulenip
// ogretmen onayina cikacak.

export async function GET(req) {
  try {
    const u = new URL(req.url);
    const sinif = u.searchParams.get("sinif");
    const ders = u.searchParams.get("ders");
    const konu = u.searchParams.get("konu");
    const unite = u.searchParams.get("unite") || "";

    if (!sinif || !ders || !konu) {
      return Response.json({ error: "sinif, ders, konu zorunlu" }, { status: 400 });
    }

    // 1. Cache kontrolu
    const mevcut = await sql`
      SELECT id, icerik_json FROM icerik_onbellek
      WHERE sinif = ${Number(sinif)} AND ders = ${ders} AND unite = ${unite}
        AND konu = ${konu} AND icerik_turu = 'konu_paketi'
      LIMIT 1
    `;
    if (mevcut.length > 0 && mevcut[0].icerik_json) {
      await sql`UPDATE icerik_onbellek SET kullanim_sayisi = kullanim_sayisi + 1, son_kullanim = now() WHERE id = ${mevcut[0].id}`;
      return Response.json({ kaynak: "cache", paket: mevcut[0].icerik_json });
    }

    // 2. Tek AI cagrisiyla TAM paket uretimi
    const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";
    const p = `Sen deneyimli, alaninda uzman bir "${ders}" ogretmenisin. "${konu}" konusu${unite ? ` (${unite} unitesinden)` : ""} icin, ${sinif}. sinif seviyesinde TAM bir konu paketi hazirla.

SESIN COK ONEMLI: Bu bir DERS KITABI DEGIL, gercek bir ogretmenin sinifta/ozel derste, karsisindaki TEK BIR ogrenciyle yaptigi CANLI bir diyalog. "Once X hesaplanir" gibi SOGUK cumleleri KESINLIKLE YAZMA. Onun yerine "Bak, once suna bakalim...", "Simdi..." gibi KONUSUR gibi yaz. Her 2-3 cumlede bir hitap MUTLAKA olsun, cumleler kisa (8-12 kelime) olsun.

ONEMLI UYARI: "Aferin", "tam da bunu bekliyordum", "harikasin" gibi KALIP OVGU/TESVIK cumlelerini KULLANMA - bunlar yazida yapay/mekanik durur, gercek bir insan boyle konusmaz her cumlede. Sabit bir soru-cevap sablonunu (her paragrafta "Peki... dersin?" gibi) HER YERDE TEKRARLAMA - bu da mekanik/muhurlenmis hissettirir. Bunun yerine: konuya ve baglama gore DOGAL, DEGISKEN bir anlatim kur - bazen ogrenciye kisa bir soru sorup cevaplayabilirsin, bazen sadece "bak/simdi" ile devam edebilirsin, bazen bir hatayi onceden tahmin edip uyarabilirsin. Hangi teknigi ne zaman kullanacagina konu KENDI belirlesin, sabit bir kalip her paragrafta zorunlu DEGIL. Amac, bir insanin GERCEKTEN konusuyormus gibi DOGAL, degisken bir akis - ayni cumle yapisini/kalibi tekrar tekrar KOPYALAMA.

Kalite referansi: ${kaliteReferansi}

SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma:

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
    {"soru":"...", "secenekler":["A) ...","B) ...","C) ...","D) ..."], "dogruIndex":0, "zorluk":"kolay", "aciklama":"kisa cozum aciklamasi", "kontrolIfadesi":"SADECE Matematik/Fen Bilimleri icin: sorunun cevabini veren TEMIZ bir matematik ifadesi (orn. "3^2*3^4" veya "20*22"), sayisal olmayan/hesaplanamayan sorularda BOS STRING birak"}
  ],
  "odevSorulari": [
    {"soru":"...", "cozum":"adim adim detayli cozum metni"}
  ]
}

soruHavuzu TAM 15 soru icersin: 5 kolay, 6 orta, 4 zor (sirali ver). odevSorulari TAM 6 acik uclu soru icersin (coktan secmeli DEGIL), her biri icin adim adim detayli cozum ver.`;

    const cevap = await aiCagir({ prompt: p, maxTokens: 10000, jsonModu: true, tur: "konu_paketi" });
    const paket = jsonAyikla(cevap);

    if (!paket.anlatim || !Array.isArray(paket.soruHavuzu) || paket.soruHavuzu.length === 0) {
      return Response.json({ error: "Paket uretilemedi, tekrar dene" }, { status: 500 });
    }

    // 2.5 Kalite Kontrolu - uretimi ENGELLEMEZ, sadece isaretler
    const kaliteSonucu = kaliteKontrolYap("konu_paketi", paket);
    paket.kaliteKontrol = kaliteSonucu;
    if (!kaliteSonucu.gecti) console.warn("konu_paketi kalite uyarisi:", ders, konu, kaliteSonucu.uyarilar);

    // Katman 2 - deterministik kontrol (GOLGE MOD, sadece log, engellemez)
    const detKontrol = deterministikKontrolYap(paket.soruHavuzu || []);
    if (!detKontrol.uyumlu) console.warn("konu_paketi DETERMINISTIK uyari (GOLGE MOD):", ders, konu, detKontrol.uyarilar);

    // 3. Cache'e kaydet (basit metin alani icin anlatim.temelAnlatim kullanilir)
    // Kalite kontrolunden gecemeyen paketler 'bekliyor' olarak isaretlenir -
    // ogretmen inceleme kuyruguna girer (16 Eylul, Quality Control Motoru adim 2).
    const onayDurumu = kaliteSonucu.gecti ? null : "bekliyor";
    try {
      await sql`
        INSERT INTO icerik_onbellek (sinif, ders, unite, konu, zorluk_seviyesi, icerik_turu, icerik, icerik_json, kullanim_sayisi, olusturulma, son_kullanim, onay_durumu)
        VALUES (${Number(sinif)}, ${ders}, ${unite}, ${konu}, '', 'konu_paketi', ${paket.anlatim.temelAnlatim || ""}, ${JSON.stringify(paket)}, 1, now(), now(), ${onayDurumu})
      `;
    } catch (e) { console.error("konu_paketi cache yazilamadi:", e); }

    // Isaretlenen paket icin eslesen branstaki ogretmen(ler)e bildirim gonder
    if (onayDurumu === "bekliyor") {
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

    return Response.json({ kaynak: "yeni_uretim", paket });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Konu paketi getirilemedi: " + e.message }, { status: 500 });
  }
}
