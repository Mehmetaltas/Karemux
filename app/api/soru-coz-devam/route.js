// Soru Coz sonrasi "anlamadim, acikla" tarzi takip sohbeti. Orijinal soru+cozum
// metnini baglam olarak kullanir - gorseli tekrar gondermeye gerek yok.
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { moderasyonKontrolEt } from "@/lib/moderasyon";
import { gorselSoruErisimVarMi } from "@/lib/paket";

export async function POST(req) {
  try {
    const { orijinalCozum, sohbetGecmisi, yeniMesaj, ders, sinif, cihazId, imageBase64, mediaType } = await req.json();
    if ((!yeniMesaj || !yeniMesaj.trim()) && !imageBase64) return Response.json({ error: "Mesaj bos olamaz" }, { status: 400 });
    if (imageBase64 && imageBase64.length > 7_000_000) {
      return Response.json({ error: "Gorsel cok buyuk, lutfen daha kucuk bir fotograf yukle" }, { status: 400 });
    }

    if (imageBase64) {
      const gorselErisim = await gorselSoruErisimVarMi(req, cihazId);
      if (!gorselErisim.izinVar) {
        return Response.json({ error: "Bugunluk ucretsiz gorsel soru cozme hakkin (3) doldu ve kredin kalmadi. Kredi paketi satin alabilir ya da yillik pakete gecebilirsin." }, { status: 429 });
      }
    }

    if (yeniMesaj && yeniMesaj.trim()) {
      const moderasyon = await moderasyonKontrolEt(yeniMesaj);
      if (!moderasyon.uygunMu) {
        return Response.json({ error: "Bu mesaj uygun degil, lutfen dersle ilgili bir soru yaz." }, { status: 400 });
      }
    }

    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.premium ? `Bugunluk yogun kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` : `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile daha fazla kullanabilirsin.` },
        { status: 429 }
      );
    }

    const gecmisMetni = (sohbetGecmisi || [])
      .map((m) => `${m.rol === "ogrenci" ? "Ogrenci" : "Sen"}: ${m.metin}`)
      .join("\n");

    const talimat = `Sen sabirli bir ${ders || ""} ogretmenisin.${sinif ? ` Ogrenci ${sinif}. sinifta okuyor, anlatimini bu seviyeye uygun kur.` : ""}
Az once su soruyu cozdun:
---
${orijinalCozum}
---
${gecmisMetni ? `Daha once bu sohbette konustuklariniz:\n${gecmisMetni}\n---\n` : ""}
Simdi ogrenci sana ${imageBase64 ? "yeni bir fotograf gonderdi" + (yeniMesaj?.trim() ? ` ve su notu ekledi: "${yeniMesaj.trim()}"` : " (ek bir soru/kisim hakkinda)") : `su takip sorusunu/mesajini yazdi: "${yeniMesaj.trim()}"`}.

Ogrenciyi YARI YOLDA BIRAKMA - onun tam olarak neyi anlamadigini dusun ve o noktaya
odaklanarak, sabirla, farkli bir ornekle veya daha basit kelimelerle tekrar anlat.
Kisa ve net cevap ver (en fazla 4-5 cumle), ogretmen gibi konus, "harika soru" gibi
gereksiz giris cumleleri kurma, direkt konuya gir.
BICIM: SADECE duz metin, markdown (yildiz) veya LaTeX ($, backslash) KESINLIKLE kullanma.
Matematik ifadelerini sade klavye karakterleriyle yaz. SADECE Turkce yaz.`;

    const cevap = await aiCagir(imageBase64 ? { prompt: talimat, imageBase64, mediaType, maxTokens: 700 } : { prompt: talimat, maxTokens: 700 });
    const cevapTemiz = cevap
      .replace(/\*\*/g, "").replace(/#+\s?/g, "").replace(/\$\$?/g, "")
      .replace(/\\sqrt\{([^}]*)\}/g, "karekok $1").replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
      .replace(/\\[a-zA-Z]+/g, "").replace(/[{}]/g, "");
    return Response.json({ cevap: cevapTemiz, kalanHak: Math.max(0, limit.limit - limit.kullanim) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cevap alinamadi: " + e.message }, { status: 502 });
  }
}
