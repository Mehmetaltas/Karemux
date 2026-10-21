import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { hasPackageFeature } from "@/lib/paket";
import { MUFREDAT, MUFREDAT_DIGER_SINIFLAR } from "@/lib/mufredat-veri";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { BAGLAM_TEMELLI_SORU_TALIMATI } from "@/lib/soru-talimati-sunucu";

// Faz 2 (21 Ekim): UCRETLI ozellikler (tatil programi, bursluluk) icin prompt'u SUNUCU kurar.
// Istemci yalniz yapisal parametre gonderir; prompt gonderemez, bu yuzden paket kontrolu
// prompt metnini yeniden yazarak atlatilamaz. Genel /api/claude vekili tamamen kapatildi (410).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const TATIL_TURLERI = {
  ara: { key: "ara", ad: "Ara Tatil", gun: 7, paket: "ara_tatil" },
  yariyil: { key: "yariyil", ad: "Yarıyıl Tatili", gun: 14, paket: "ara_tatil" },
  yaz: { key: "yaz", ad: "Yaz Tatili (Ilk Ay)", gun: 30, paket: "yaz_tatili" },
};
const BURSLULUK_DERSLER = ["Turkce", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler"];

function dersinUniteleri(dersAdi, sinifNo) {
  return MUFREDAT_DIGER_SINIFLAR[`${sinifNo}::${dersAdi}`] || MUFREDAT[dersAdi] || [];
}

export async function POST(req) {
  try {
    const { islem, cihazId, sinif, tatilTuru, zayifDersler, dersAdi, soruSayisi: soruSayisiHam } = await req.json();
    const sinifNo = Number(sinif);
    if (![4, 5, 6, 7, 8].includes(sinifNo)) return Response.json({ error: "Gecersiz sinif" }, { status: 400 });

    let prompt, maxTokens, gerekliPaket;
    if (islem === "tatil_programi") {
      const tatil = TATIL_TURLERI[tatilTuru];
      if (!tatil) return Response.json({ error: "Gecersiz tatil turu" }, { status: 400 });
      const liste = Array.isArray(zayifDersler) ? zayifDersler : [];
      // Ders adi serbest metin olabilir (prompt enjeksiyonu): kisa, yalniz harf/rakam/bosluk/nokta-tire.
      const temizZayif = liste.filter((d) => typeof d === "string" && d.length <= 40 && /^[\p{L}\d .&'-]+$/u.test(d)).slice(0, 8);
      const zayifMetni = temizZayif.length > 0 ? `Ozellikle zayif oldugu dersler: ${temizZayif.join(", ")}.` : "";
      gerekliPaket = tatil.paket;
      maxTokens = Math.min(6000, 800 + tatil.gun * 120);
      prompt = `Sen bir LGS calisma kocususun. ${zayifMetni} Ogrenci ${sinifNo}. sinifta, "${tatil.ad}" donemine giriyor (${tatil.gun} gunluk). ${tatil.key === "yaz" ? `Yaz tatili UZUN oldugu icin, tempo dusuk-orta tutulmali, her gun 1-1.5 saatlik hafif ama DUZENLI bir aliskanlik kurmali, tukenmisligi onlemek icin haftada 1 gun tam dinlenme olmali. Once zayif konulara odaklan (eksik kapatma), ama sure uzun oldugu icin ILERI HAZIRLIK da ekle: gorevlerin bir kismi bir sonraki sinifin/donemin konularina hafif bir on bakis olsun. Gorev cesitliligi onemli - sirayla konu anlatimi, soru cozumu, kisa test, fasikul calismasi, deneme/tekrar gibi FARKLI turlerde gorevler dagit, hep ayni turden gorev verme.` : tatil.key === "yariyil" ? "Yariyil tatili orta uzunlukta, once zayif konulari kapatmaya, sonra 2. donem'e hazirliga odaklanmali." : "Ara tatil kisa, sadece son donemdeki zayif konulari toparlamaya ve dinlenmeye odaklanmali, agir yeni konu YOK."} Iki parca uret: (1) "mesaj": ogrenciye sicak, kisa (120-160 kelime) bir konusma - tatilin ruhuna uygun (dinlenmeyi de onemsediginizi belirt). (2) "program": ${tatil.gun} GUNUN HER BIRI icin bir gorev nesnesi - {"gunNo":1,"ders":"Matematik","gorev":"Kisa, somut, TEK CUMLELIK gorev"}. Haftada en az 1 gun "Dinlenme" olarak ayarla (agir calisma yok). SADECE JSON dondur, markdown kullanma:
      {"mesaj":"...","program":[{"gunNo":1,"ders":"...","gorev":"..."}, ...]}`;
    } else if (islem === "bursluluk") {
      if (!BURSLULUK_DERSLER.includes(dersAdi)) return Response.json({ error: "Gecersiz ders" }, { status: 400 });
      const soruSayisi = Number(soruSayisiHam);
      if (!Number.isInteger(soruSayisi) || soruSayisi < 1 || soruSayisi > 20) return Response.json({ error: "Gecersiz soru sayisi" }, { status: 400 });
      gerekliPaket = "bursluluk";
      maxTokens = Math.min(6000, 500 + soruSayisi * 450);
      const uniteler = dersinUniteleri(dersAdi, sinifNo).join(", ");
      const sosyalDinNotu = dersAdi === "Sosyal Bilgiler" ? ` ONEMLI: Gercek IOKBS'de Sosyal Bilgiler sorularinin bir kismi Din Kulturu ve Ahlak Bilgisi konularini da icerir - hazirladigin ${soruSayisi} sorunun yaklasik %20-25'ini (${sinifNo}. sinif Din Kulturu mufredatindan) Din Kulturu konularindan yap, kalanini Sosyal Bilgiler'den yap.` : "";
      const kaliteMetniBursluluk = KALITE_REFERANSLARI[dersAdi] ? ` Ders icerik kalitesi referansi: ${KALITE_REFERANSLARI[dersAdi]}` : "";
      prompt = `Sen bursluluk sinavi (IOKBS) hazirlik uzmanisin. "${dersAdi}" dersinden, ${sinifNo}. sinif mufredatinin TAMAMINI (uniteler: ${uniteler}) kapsayacak sekilde, dengeli dagilmis ${soruSayisi} coktan secmeli soru hazirla.${sosyalDinNotu} ${BAGLAM_TEMELLI_SORU_TALIMATI} Sorular gercek IOKBS sinavi zorlugunda ve tarzinda olsun - Editor Yayinlari, Data Yayinlari ve IQ Yayinlari'nin IOKBS/PYBS hazirlik kitaplarindaki soru tarzi ve zorluk seviyesini referans al (resmi MEB kaynagi degil, ozel sinav hazirlik yayinlari, ancak IOKBS'e ozel en yaygin kabul goren kaynaklar bunlardir).${kaliteMetniBursluluk} Her soru icin "aciklama" alaninda dogru cevabin nedenini 1-2 cumleyle anlat. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:
      [{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"orta","aciklama":"...","beceri":"soru hangi beceriyi olcuyor (orn. islem becerisi, yorumlama, uygulama - kisa 2-4 kelime)","tahminiSureSaniye":45,"yayginHata":"ogrencilerin bu tarz soruda en sik yaptigi hata (kisa, 1 cumle)","cozumTeknigi":"bu soruyu hizli cozmenin pratik teknigi (kisa, 1 cumle)"}]`;
    } else {
      return Response.json({ error: "Gecersiz islem" }, { status: 400 });
    }

    const erisimVar = await hasPackageFeature(req, cihazId, gerekliPaket);
    if (!erisimVar) return Response.json({ error: "Bu ozellik icin ilgili paketi satin almalisin." }, { status: 403 });

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.ipSiniri ? "Bu aginda cok yogun kullanim var, biraz sonra tekrar dene." : `Bugunluk kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` },
        { status: 429 }
      );
    }

    if (typeof prompt !== "string" || prompt.length < 50) return Response.json({ error: "Istek olusturulamadi" }, { status: 500 });
    const metin = await aiCagir({ prompt, maxTokens, jsonModu: true, tur: `ucretli_${gerekliPaket}` });
    return Response.json({ text: metin });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AI servisi yanit vermedi: " + e.message }, { status: 502 });
  }
}
