// Fotografla soru cozumu - lib/ai.js soyutlamasi + gunluk kullanim limiti ile.
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { gorselSoruErisimVarMi } from "@/lib/paket";

export async function POST(req) {
  try {
    const { imageBase64, mediaType, ders, sinif, cihazId } = await req.json();
    if (!imageBase64) return Response.json({ error: "Gorsel bulunamadi" }, { status: 400 });
    if (imageBase64.length > 7_000_000) {
      return Response.json({ error: "Gorsel cok buyuk, lutfen daha kucuk bir fotograf yukle" }, { status: 400 });
    }

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.premium ? `Bugunluk yogun kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` : `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile daha fazla kullanabilirsin.` },
        { status: 429 }
      );
    }

    // Gorsel soru cozme, genel AI limitine EK olarak ayri bir ticari kapiya
    // tabi: gunde 3 ucretsiz -> satin alinmis kredi -> yillik_* abonelik.
    const gorselErisim = await gorselSoruErisimVarMi(req, cihazId);
    if (!gorselErisim.izinVar) {
      return Response.json(
        { error: "Bugunluk ucretsiz gorsel soru cozme hakkin (3) doldu ve kredin kalmadi. Kredi paketi satin alabilir ya da yillik pakete gecebilirsin." },
        { status: 429 }
      );
    }

    const talimat = `Bu goreseldeki soruyu, ogrencinin ONCE KENDI DUSUNMESINE firsat verecek sekilde iki parca halinde hazirla. ${ders ? `Ders: ${ders}. ` : ""}${sinif ? `Ogrenci ${sinif}. sinifta okuyor - anlatimini bu yasa/seviyeye uygun, cok karmasik terimler kullanmadan kur. ` : ""}
(1) "ipucu": Cevabi VERMEDEN, hangi kavram/yontem kullanilmasi gerektigini isaret eden, ogrenciyi dusundurecek TEK cumlelik kucuk bir ipucu.
(2) "cozum": Bir LGS ogretmeni gibi NET, ADIM ADIM tam cozum. Her adimi kisa bir cumleyle ozetle. En sonda "CEVAP: X" seklinde net sonucu yaz.
SADECE JSON dondur, markdown/LaTeX kullanma. Matematik ifadelerini sade klavye karakterleriyle yaz (orn. "5 bolu 18", "karekok 12", "3 uzeri 2").
Eger gorsel bir soru degilse ya da okunamiyorsa, SADECE {"hata":"aciklama"} dondur. Sadece Turkce yaz.
{"ipucu":"...","cozum":"..."}`;

    const hamCevap = await aiCagir({ prompt: talimat, imageBase64, mediaType, maxTokens: 1800, jsonModu: true });
    const temizle = (s) => (s || "")
      .replace(/\*\*/g, "").replace(/#+\s?/g, "").replace(/\$\$?/g, "")
      .replace(/\\sqrt\{([^}]*)\}/g, "karekok $1").replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
      .replace(/\\[a-zA-Z]+/g, "").replace(/[{}]/g, "");

    let veri;
    try {
      const temizJson = hamCevap.replace(/```json|```/g, "").trim();
      veri = JSON.parse(temizJson.slice(temizJson.indexOf("{"), temizJson.lastIndexOf("}") + 1));
    } catch (e) {
      // AI beklenen JSON formatinda donmediyse, eski davranisa geri don:
      // ham metni dogrudan cozum olarak goster, ipucu bos kalsin.
      veri = { ipucu: "", cozum: hamCevap };
    }

    if (veri.hata) {
      return Response.json({ error: veri.hata }, { status: 400 });
    }

    return Response.json({
      ipucu: temizle(veri.ipucu),
      cozum: temizle(veri.cozum),
      kalanHak: Math.max(0, limit.limit - limit.kullanim),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cozum alinamadi: " + e.message }, { status: 502 });
  }
}
