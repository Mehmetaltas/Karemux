// Fotografla soru cozumu - lib/ai.js soyutlamasi + gunluk kullanim limiti ile.
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

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
        { error: `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile sinirsiz kullanabilirsin.` },
        { status: 429 }
      );
    }

    const talimat = `Bu goreseldeki soruyu coz. ${ders ? `Ders: ${ders}. ` : ""}${sinif ? `Ogrenci ${sinif}. sinifta okuyor - anlatimini bu yasa/seviyeye uygun, cok karmasik terimler kullanmadan, sanki karsisinda oturmus sabirla anlatiyormus gibi kur. ` : ""}
Bir LGS ogretmeni gibi davran: NET, ADIM ADIM coz. Her adimi kisa bir cumleyle ozetle,
gereksiz uzun aciklama yapma. En sonda "CEVAP: X" seklinde net sonucu yaz.
COK ONEMLI - BICIM KURALLARI: SADECE duz metin yaz. KESINLIKLE markdown (yildiz **, kare ayrac vb.)
veya LaTeX (dolar isareti $, backslash komutlari, \\frac, \\sqrt vb.) KULLANMA. Matematik ifadelerini
sade klavye karakterleriyle yaz (ornek: "5 bolu 18", "karekok 12", "3 uzeri 2", "0,27 devirli").
Eger gorsel bir soru degilse ya da okunamiyorsa bunu acikca belirt. Sadece Turkce yaz.`;

    const cozum = await aiCagir({ prompt: talimat, imageBase64, mediaType, maxTokens: 1500 });
    const cozumTemiz = cozum
      .replace(/\*\*/g, "").replace(/#+\s?/g, "").replace(/\$\$?/g, "")
      .replace(/\\sqrt\{([^}]*)\}/g, "karekok $1").replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
      .replace(/\\[a-zA-Z]+/g, "").replace(/[{}]/g, "");
    return Response.json({ cozum: cozumTemiz, kalanHak: Math.max(0, limit.limit - limit.kullanim) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cozum alinamadi: " + e.message }, { status: 502 });
  }
}
