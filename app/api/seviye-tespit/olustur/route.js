import { aiCagir } from "@/lib/ai";
import { jsonAyikla } from "@/lib/json-ayikla";
import { sorulariDenetle } from "@/lib/soruKalite";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

// Istemci, 4. ve 5. sinif konularindan sectigi bir listeyi ({ders, unite, sinif})
// gonderir, biz her biri icin 1 soru uretiriz. Boylece unite listesi (page.js'te
// duran mufredat verisi) tek yerde kalir, burada tekrar edilmez.
export async function POST(req) {
  try {
    const { konular, cihazId } = await req.json(); // [{ders, unite, sinif}, ...]
    if (!Array.isArray(konular) || konular.length === 0) {
      return Response.json({ error: "Konu listesi gerekli" }, { status: 400 });
    }
    if (konular.length > 30) {
      return Response.json({ error: "Cok fazla konu istendi" }, { status: 400 });
    }

    // 22 Eylul, Full Audit devami: bu route'ta hicbir erisim kontrolu yoktu -
    // kimliksiz/sinirsiz cagrilabiliyordu (tek istekte 30 soru uretebiliyordu).
    const limit = await gunlukLimitKontrolEt(req, cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.premium ? `Bugunluk yogun kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` : `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile daha fazla kullanabilirsin.` },
        { status: 429 }
      );
    }

    const dersRehberi = [...new Set(konular.map((k) => k.ders))]
      .filter((d) => KALITE_REFERANSLARI[d])
      .map((d) => `${d}: ${KALITE_REFERANSLARI[d]}`)
      .join("\n");
    const kaliteMetni = dersRehberi ? `\nKalite referanslari (ORTA zorluk seviyesini kullan, bu bir seviye tespit sinavi):\n${dersRehberi}\n` : "";

    const p = `Sen bir ilkokul/ortaokul ogretmenisin. Asagidaki ${konular.length} konunun HER BIRI icin, o konunun ait oldugu sinif seviyesine uygun TEK bir coktan secmeli soru hazirla. Konular ve sinif seviyeleri:
${konular.map((k, i) => `${i + 1}. Ders: ${k.ders}, Unite: ${k.unite}, Sinif: ${k.sinif}`).join("\n")}
${kaliteMetni}Her soru o unitenin temel/orta zorluktaki bir kazanimini olcmeli - cok kolay ya da cok zor olmasin, bu bir SEVIYE TESPIT sinavi. SADECE JSON dondur (obje icinde dizi, TEK konu olsa bile dizi formatinda), tam ${konular.length} eleman olsun, sirayla yukaridaki listeye karsilik gelsin:
{"sorular":[{"ders":"...","unite":"...","sinif":5,"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]}`;

    // 23 Eylul: GERCEK testte bulundu - iki ayri sorun. (1) Eski kirilgan
    // parse, kontrol karakterinde cokebiliyordu (bugun defalarca bulunan AYNI
    // sinif hata) - paylasilan guvenli jsonAyikla()'ya gecirildi. (2) jsonAyikla
    // SADECE {} arar, [] degil - bu yuzden format {"sorular":[...]} olarak
    // degistirildi (ayrica AI'nin TEK konu istendiginde diziyi bare objeye
    // "sadelestirme" egilimini de azaltir, nested array daha az riskli).
    const cevap = await aiCagir({ prompt: p, maxTokens: Math.min(8000, 400 + konular.length * 350), jsonModu: true });
    let sorularHam;
    try {
      sorularHam = jsonAyikla(cevap).sorular;
    } catch (e) {
      sorularHam = null;
    }

    const sorular = (Array.isArray(sorularHam) ? sorularHam : []).filter((s) =>
      s && typeof s.soru === "string" && s.soru.trim() &&
      Array.isArray(s.secenekler) && s.secenekler.length >= 2 &&
      Number.isInteger(s.dogruIndex) && s.dogruIndex >= 0 && s.dogruIndex < s.secenekler.length &&
      typeof s.ders === "string" && typeof s.unite === "string"
    );

    if (sorular.length === 0) throw new Error("Sorular uretilemedi, tekrar dene");

    const { gecenler: denetlenmisSorular, elenenSayisi } = await sorulariDenetle(sorular, "Bu sorular bir SEVIYE TESPIT sinavinda kullanilacak, ogrencinin yerlestirilecegi kademeyi belirliyor, cok yuksek dogruluk gerekiyor.");
    if (denetlenmisSorular.length === 0) throw new Error("Sorular kalite denetiminden gecemedi, tekrar dene");

    return Response.json({ sorular: denetlenmisSorular, elenen: elenenSayisi });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
