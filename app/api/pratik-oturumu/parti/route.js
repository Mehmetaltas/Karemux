import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { ogrenmeHafizasiGetir } from "@/lib/ogrenme-hafizasi";
import { soruTalimatiSecSunucu } from "@/lib/soru-talimati-sunucu";
import { sorulariDenetle } from "@/lib/soruKalite";
import { jsonMetniTemizle, soruJsonAyikla, sinavSorusuGecerliMi, uniteEsle, istemciSorusu, soruBankasinaArsivle } from "@/lib/sinav-uretimi";
import {
  PRATIK_TURLERI, pratikPlani, istemMetni, konuPromptuOlustur, unitePromptuOlustur, benzerPromptuOlustur,
  paragrafPromptuOlustur, paragrafObjesiAyikla, onayliKonuHavuzu, bankadanSoruGetir, hataAltKonulari,
} from "@/lib/pratik-uretimi";

export const maxDuration = 60;

// Faz E - PRATIK OTURUMU (tek konu 5/15, unite testi, benzer sorular, paragraf pratigi).
// Sorular sunucuda uretilir (ya da onayli konu havuzundan / soru bankasindan secilir), cevap anahtari
// sinav_oturumlari'nda kalir, tarayiciya SADECE cevapsiz sorular gider. Puanlama, ilerleme ve
// Hata Kitapcigi kaydi /api/sinav-oturumu/gonder'de yapilir. Parti sayisi ve buyuklugunu sunucu belirler.
const DENETIM_ICIN_EN_GEC_MS = 30000; // uretim bu kadar surerse denetim atlanir (fail-open)
const DENETIM_ASGARI_ORAN = 0.6; // denetimden gecen soru sayisi bunun altindaysa parti reddedilir

function karistir(dizi) {
  const k = [...dizi];
  for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; }
  return k;
}

export async function POST(req) {
  const baslangic = Date.now();
  try {
    const g = await req.json();
    const pratikTuru = g.pratikTuru;
    if (!PRATIK_TURLERI.includes(pratikTuru)) return Response.json({ error: "Gecersiz pratik istegi" }, { status: 400 });
    const partiNo = g.partiNo;
    if (!Number.isInteger(partiNo) || partiNo < 0 || partiNo > 3) return Response.json({ error: "Gecersiz pratik istegi" }, { status: 400 });

    const kullaniciId = await kullaniciIdCoz(req, g.cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    // Parametreler: yeni oturumda istekten (dogrulanarak), devam eden oturumda SAKLI meta'dan okunur.
    let P;
    let oturumId = null;
    let metaMevcut = null;
    let mevcutSayi = 0;
    if (g.oturumId != null) {
      if (!/^\d+$/.test(String(g.oturumId))) return Response.json({ error: "Gecersiz oturum" }, { status: 400 });
      const mevcut = await sql`SELECT id, meta, jsonb_array_length(sorular) AS sayi FROM sinav_oturumlari WHERE id = ${g.oturumId} AND kullanici_id = ${kullaniciId} AND kullanildi = false`;
      if (mevcut.length === 0) return Response.json({ error: "Pratik oturumu bulunamadi veya gonderilmis" }, { status: 400 });
      metaMevcut = mevcut[0].meta || {};
      if (metaMevcut.pratikTuru !== pratikTuru || metaMevcut.hazirParti !== partiNo || metaMevcut.tamam === true) {
        return Response.json({ error: "Pratik oturumu sirasi gecersiz" }, { status: 409 });
      }
      oturumId = mevcut[0].id;
      mevcutSayi = Number(mevcut[0].sayi) || 0;
      P = {
        ders: metaMevcut.ders, sinif: metaMevcut.sinif, konu: metaMevcut.konu || null, unite: metaMevcut.unite || null,
        altKonu: metaMevcut.altKonu || null, fasikul: metaMevcut.fasikul === true, altBasliklar: [],
      };
    } else {
      if (partiNo !== 0) return Response.json({ error: "Gecersiz pratik istegi" }, { status: 400 });
      const ders = istemMetni(g.ders, 100);
      const sinif = g.sinif;
      const konu = istemMetni(g.konu, 150);
      const unite = istemMetni(g.unite, 150);
      const altKonu = g.altKonu == null || g.altKonu === "" ? null : istemMetni(g.altKonu, 150);
      const fasikul = g.fasikul === true;
      let altBasliklar = [];
      if (g.altBasliklar != null) {
        if (!Array.isArray(g.altBasliklar) || g.altBasliklar.length > 15) return Response.json({ error: "Gecersiz pratik istegi" }, { status: 400 });
        altBasliklar = g.altBasliklar.map((x) => istemMetni(x, 100));
        if (altBasliklar.some((x) => !x)) return Response.json({ error: "Gecersiz pratik istegi" }, { status: 400 });
      }
      if (!ders || !Number.isInteger(sinif) || sinif < 1 || sinif > 12
        || ((pratikTuru === "konu" || pratikTuru === "paragraf") && !konu)
        || (pratikTuru === "unite" && !unite)
        || (g.altKonu != null && g.altKonu !== "" && !altKonu)
        || (fasikul && pratikTuru !== "konu")) {
        return Response.json({ error: "Gecersiz pratik istegi" }, { status: 400 });
      }
      P = { ders, sinif, konu, unite, altKonu, fasikul, altBasliklar };
    }

    const plan = pratikPlani(pratikTuru, P.fasikul);
    if (!plan || partiNo >= plan.partiler.length) return Response.json({ error: "Gecersiz pratik istegi" }, { status: 400 });
    // Onceki partilerde denetim/gecerlilik filtresi soru dusurduyse (paragraf: 17-19/20 sorunu) bu parti eksigi tamamlar,
    // ayrica +1 yedek soru istenir; denetimden sonra hedefe kirpilir. Ilk parti (metin + puf) yavas oldugu icin yedek istenmez.
    const planAdet = plan.partiler[partiNo];
    const eksik = pratikTuru === "paragraf" && partiNo > 0
      ? Math.max(0, Math.min(3, plan.partiler.slice(0, partiNo).reduce((a, b) => a + b, 0) - mevcutSayi))
      : 0;
    const adet = planAdet + eksik;
    const istenen = pratikTuru === "paragraf" && partiNo > 0 ? adet + 1 : adet;

    const limit = await gunlukLimitKontrolEt(req, g.cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.premium ? `Bugunluk yogun kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` : `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile daha fazla kullanabilirsin.` },
        { status: 429 }
      );
    }

    let sorular = null;      // hazir sorular (havuz / banka) ya da AI'dan gelenler
    let kaynak = "ai";
    let paragraf = null;     // { metin, pufNoktalari }
    let benzerAltKonular = [];

    // 1) AI'ya hic gitmeden: onayli konu havuzu (tek konu) / soru bankasi (unite, alt baslik siniri yoksa).
    if (partiNo === 0 && oturumId === null) {
      if (pratikTuru === "konu") {
        const havuz = await onayliKonuHavuzu({ sinif: P.sinif, ders: P.ders, unite: P.unite, konu: P.konu });
        if (havuz.length >= (P.fasikul ? 10 : 5)) {
          sorular = P.fasikul ? havuz.slice(0, 15) : karistir(havuz).slice(0, 5);
          kaynak = "havuz";
        }
      } else if (pratikTuru === "unite" && P.altBasliklar.length === 0) {
        const banka = await bankadanSoruGetir({ ders: P.ders, sinif: P.sinif, unite: P.unite, adet: 5 });
        if (banka.length > 0) { sorular = banka; kaynak = "banka"; }
      }
    }

    if (pratikTuru === "benzer") {
      const h = await hataAltKonulari(kullaniciId, P.ders);
      if (h.kayitSayisi === 0) return Response.json({ error: "Hata Kitapciginda bu ders icin kayit yok" }, { status: 400 });
      benzerAltKonular = h.altKonular;
    }

    let denetlendi = false;
    let metin = metaMevcut?.metin || null;
    if (sorular === null) {
      // 2) AI ile uretim
      const soruTalimati = await soruTalimatiSecSunucu(P.sinif);
      if (pratikTuru === "paragraf" && partiNo === 1 && !metin) return Response.json({ error: "Pratik oturumu eksik, yeniden baslat" }, { status: 409 });
      let istem = pratikTuru === "konu"
        ? konuPromptuOlustur({ ders: P.ders, sinif: P.sinif, konu: P.konu, unite: P.unite, fasikul: P.fasikul, partiNo, soruTalimati })
        : pratikTuru === "unite"
        ? unitePromptuOlustur({ ders: P.ders, sinif: P.sinif, unite: P.unite, altBasliklar: P.altBasliklar, soruTalimati })
        : pratikTuru === "benzer"
        ? benzerPromptuOlustur({ ders: P.ders, sinif: P.sinif, altKonular: benzerAltKonular, soruTalimati })
        : paragrafPromptuOlustur({ ders: P.ders, sinif: P.sinif, konu: P.konu, unite: P.unite, partiNo, metin, soruTalimati, adet: istenen });
      try {
        const ogrenmeOzeti = await ogrenmeHafizasiGetir(kullaniciId);
        if (ogrenmeOzeti) {
          istem = `Bu ogrencinin gecmis calisma verisinden cikarilan profil: "${ogrenmeOzeti}" Bu bilgiyi, asagidaki icerigi bu ogrenciye daha uygun hale getirmek icin KULLAN (ozellikle zayif oldugu noktalara biraz daha dikkat et), ama bunu ACIKCA SOYLEME, dogal bir sekilde entegre et.\n\n---\n\n${istem}`;
        }
      } catch (e) { /* hafiza basarisiz olursa sessizce normal akisa devam */ }

      let cevap;
      try {
        const ekToken = pratikTuru === "paragraf" && partiNo === 0 ? 1500 : 0;
        cevap = await aiCagir({ prompt: istem, maxTokens: Math.min(8000, 500 + istenen * 480 + ekToken), jsonModu: true, tur: "pratik_uretimi" });
      } catch (e) {
        console.error(e);
        return Response.json({ error: "AI servisi yanit vermedi, tekrar dene" }, { status: 502 });
      }

      let ham;
      try {
        const temiz = jsonMetniTemizle(cevap, { dilFiltresi: true, parantezTemizle: true });
        if (pratikTuru === "paragraf" && partiNo === 0) {
          const obje = paragrafObjesiAyikla(temiz);
          if (!obje.metin) throw new Error("metin yok");
          paragraf = { metin: obje.metin, pufNoktalari: obje.pufNoktalari };
          metin = obje.metin;
          ham = obje.sorular;
        } else {
          ham = soruJsonAyikla(temiz);
        }
      } catch (e) {
        console.error("Pratik cevabi ayiklanamadi:", e.message);
        return Response.json({ error: "Sorular uretilemedi, tekrar dene" }, { status: 502 });
      }
      sorular = ham.filter(sinavSorusuGecerliMi).slice(0, istenen);
      if (sorular.length === 0) return Response.json({ error: "Gecerli soru uretilemedi, tekrar dene" }, { status: 502 });
      // Eksik parti (ornegin 5 sorudan 1'i) kabul edilmez: 19 Ekim kanitinda kesilen ciktidan 1-4 soru geldi, oturum 20 yerine 15 soruyla bitti.
      if (sorular.length < Math.ceil(adet * DENETIM_ASGARI_ORAN)) {
        return Response.json({ error: "Yeterli soru uretilemedi, tekrar dene" }, { status: 502 });
      }

      // alt konu: benzer sorularda hata listesindeki ada eslenir (eslesmezse bos), digerlerinde AI'nin yazdigi kisa baslik.
      sorular = sorular.map((s) => {
        let ak = typeof s.altKonu === "string" && s.altKonu.trim() ? s.altKonu.trim().slice(0, 150) : null;
        if (pratikTuru === "benzer") { const e = uniteEsle(ak, benzerAltKonular); ak = e === "Genel" ? null : e; }
        return { ...s, altKonu: ak };
      });

      // Bagimsiz kalite denetimi (fail-open; uretim yavassa atlanir).
      const gecen = Date.now() - baslangic;
      if (gecen < DENETIM_ICIN_EN_GEC_MS) {
        const butce = Math.max(3000, Math.min(15000, 52000 - gecen));
        const paragrafBaglami = pratikTuru === "paragraf" && metin ? ` Sorular su paragrafa dayalidir, paragrafa gore degerlendir: """${metin.slice(0, 1800)}"""` : "";
        const denetim = await sorulariDenetle(sorular, `Bu sorular "${P.ders}" dersi icin ${P.sinif}. sinif ${pratikTuru === "paragraf" ? "paragraf" : pratikTuru === "benzer" ? "pekistirme" : "konu"} pratigi icin uretildi, cevap anahtari cok yuksek dogrulukta olmali.${paragrafBaglami}`, butce);
        if (denetim.gecenler.length < Math.ceil(sorular.length * DENETIM_ASGARI_ORAN)) {
          return Response.json({ error: "Sorular kalite denetiminden gecemedi, tekrar dene" }, { status: 502 });
        }
        sorular = denetim.gecenler; denetlendi = true;
      }
    }

    // Yedek dahil gelen fazla sorular hedefe kirpilir (denetimden sonra).
    if (sorular.length > adet) sorular = sorular.slice(0, adet);

    // 3) Anahtarli sorular + meta sunucuda saklanir.
    const tamam = kaynak !== "ai" || partiNo + 1 >= plan.partiler.length;
    const json = JSON.stringify(sorular);
    if (oturumId === null) {
      try { await sql`DELETE FROM sinav_oturumlari WHERE olusturulma < now() - interval '3 days'`; } catch (e) { console.error("Eski oturum temizligi basarisiz:", e.message); }
      const meta = JSON.stringify({
        sinavTuru: "pratik", kayitTuru: `pratik_${pratikTuru}`, kayitDersAdi: P.ders, ders: P.ders, sinif: P.sinif, toplam: plan.toplam,
        pratikTuru, konu: P.konu, unite: P.unite, altKonu: P.altKonu, fasikul: P.fasikul, kaynak,
        hazirParti: tamam ? plan.partiler.length : 1, tamam, metin: paragraf ? paragraf.metin : null,
      });
      const kayit = await sql`INSERT INTO sinav_oturumlari (kullanici_id, tur, ders, sorular, meta) VALUES (${kullaniciId}, ${`pratik_${pratikTuru}`}, ${P.ders}, ${json}::jsonb, ${meta}::jsonb) RETURNING id`;
      oturumId = kayit[0].id;
    } else {
      // Ayni partiyi iki kez eklemeyi (cift tiklama) onleyen kosullu guncelleme.
      const guncel = await sql`
        UPDATE sinav_oturumlari
        SET sorular = sorular || ${json}::jsonb,
            meta = meta || ${JSON.stringify({ hazirParti: partiNo + 1, tamam })}::jsonb
        WHERE id = ${oturumId} AND kullanici_id = ${kullaniciId} AND kullanildi = false AND (meta->>'hazirParti')::int = ${partiNo}
        RETURNING id
      `;
      if (guncel.length === 0) return Response.json({ error: "Pratik oturumu bulunamadi veya sirasi gecersiz" }, { status: 409 });
    }

    // Denetimden gecen AI sorulari soru bankasina arsivlenir. Paragraf sorulari metne bagli oldugu icin ARSIVLENMEZ;
    // benzer sorular da (kisiye ozel) arsivlenmez.
    if (denetlendi && kaynak === "ai" && (pratikTuru === "konu" || pratikTuru === "unite")) {
      await soruBankasinaArsivle(P.ders, P.sinif, P.unite, sorular, pratikTuru === "konu" && P.fasikul ? "fasikul" : "quiz");
    }

    return Response.json({ oturumId, sorular: sorular.map(istemciSorusu), sonraki: !tamam, kaynak, denetlendi, paragraf });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Pratik olusturulamadi: " + e.message }, { status: 500 });
  }
}
