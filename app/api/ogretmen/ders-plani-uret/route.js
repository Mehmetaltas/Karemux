import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";
import { ogretmenGunlukLimitKontrolEt } from "@/lib/ratelimit";
import { aiCagirDetay, ikinciGorusAl } from "@/lib/ai";
import { kaliteKontrolYap, deterministikKontrolYap, mufredatSinirKontrolYap, kaliteLoglariniKaydet } from "@/lib/kalite-motoru";
import { jsonAyikla } from "@/lib/json-ayikla";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { gorselKararIsteSunucu } from "@/lib/gorsel-karar-sunucu";

export const maxDuration = 60;

// Ogretmen Akademi - Plan Motoru + Gelistir-Derinlestir Motoru (17 Eylul).
// TEK AI cagrisiyla tam zincir uretir: Ogrenme Ciktisi -> On Kosul ->
// Ders Anlatimi -> Etkinlik -> Gelistir -> Derinlestir -> Soru Seti -> Olcme.
// "Kazanim" degil "Ogrenme Ciktisi" (Maarif Modeli resmi terminolojisi).

// Programatik kalite kontrolu (konu-paketi'ndeki paketKaliteKontrol ile AYNI
// ilke - AI'siz, hizli, uretimi ENGELLEMEZ, sadece isaretler).

export async function POST(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const { ders, sinif, unite, konu } = await req.json();
    if (!ders || !sinif || !konu) return Response.json({ error: "ders, sinif, konu zorunlu" }, { status: 400 });

    // 21 Eylul, Full Audit'te bulundu: materyal-uret'te GUNLUK LIMIT vardi,
    // burada YOKTU (sadece kimlik dogrulama vardi) - giren herhangi bir
    // ogretmen sinirsiz, pahali (ana uretim+Katman 3) plan uretebiliyordu.
    if (ogretmen?.id) {
      const limit = await ogretmenGunlukLimitKontrolEt(ogretmen.id);
      if (!limit.izinVar) {
        return Response.json({ error: `Gunluk uretim sinirina ulastin (${limit.limit}/gun). Yarin devam edebilirsin.` }, { status: 429 });
      }
    }

    const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";
    // kontrolIfadesi (Katman 2/deterministik dogrulama) SADECE Matematik'te
    // isteniyor (18 Eylul, kullanici karari) - Fen dahil diger derslerde bu
    // alanin hic bahsi gecmiyor, AI'nin yapay sayisal soru uretme guduusu
    // olusmasin diye. Fen'de GERCEKTEN sayisal olan sorular (fizik/kimya
    // hesaplamasi) olabilir ama bunlar zorlanmiyor, kendiliginden cikarsa
    // Katman 2 zaten bos kontrolIfadesi ile atlar - bilincli tercih.
    const kontrolIfadesiTalimati = ders === "Matematik"
      ? `,"kontrolIfadesi":"Sorunun cevabi TEK BIR SAYI ise (sozel problem OLSA BILE), cevabi veren TAMAMEN SAYISAL bir ifade yaz (orn. 3^2*5). SADECE cevap harfli/degiskenli (x/y/a iceren) ise BOS STRING birak"`
      : "";
    const p = `Sen Turkiye Yuzyili Maarif Modeli'ne (resmi MEB muframi reformu) uygun calisan, deneyimli bir "${ders}" ogretmenisin. "${konu}" konusu${unite ? ` (${unite} unitesinden)` : ""} icin ${sinif}. sinif seviyesinde TAM bir ders plani zinciri hazirla.

ONEMLI TERMINOLOJI: "Kazanim" DEGIL "Ogrenme Ciktisi" de, "Mufredat" DEGIL "Maarif Modeli/Ogretim Programi" de - bu, MEB'in resmi guncel terminolojisi.

Kalite referansi: ${kaliteReferansi}

SADECE JSON dondur, markdown kullanma. SADECE Turkce yaz, Latin alfabesi disinda TEK BIR karakter bile kullanma, bati dillerinden TEK KELIME bile kullanma:

{
  "ogrenmeCiktisi": "bu konunun ogrenme ciktisi ifadesi, MEB tarzinda net bir cumle",
  "onKosul": "bu konuyu ogrenmeden once ogrencinin bilmesi gereken on bilgiler, 2-3 cumle",
  "dersAnlatimi": "gercek bir ogretmenin sinifta anlatacagi sekilde, 'bak/simdi' hitaplariyla, 200-250 kelime anlatim",
  "etkinlik": "sinif ici uygulanabilir, somut bir etkinlik tanimi (materyal+adimlar), 100-150 kelime",
  "gelistir": "TEMEL EKSIGI olan ogrenci icin: basitten karmasiga adim adim ornek + yanlis anlama tespiti + kisa tekrar onerisi, 120-150 kelime",
  "derinlestir": "OGRENMIS ogrenciyi ILERI tasimak icin: yeni nesil/coklu adimli problem + disiplinler arasi baglanti + acik uclu gorev onerisi, 120-150 kelime",
  "soruSeti": [{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"${kontrolIfadesiTalimati}}],
  "olcme": "bu ogrenme ciktisinin ne kadar kazanildigini olcmek icin somut bir degerlendirme yontemi (rubrik/kisa sinav/gozlem), 80-100 kelime"
}

soruSeti TAM 8 soru icersin: 3 kolay, 3 orta, 2 zor (sirali ver).`;

    const { metin: cevap, saglayici } = await aiCagirDetay({ prompt: p, maxTokens: 14000, jsonModu: true, tur: "ders_plani" });
    let plan = jsonAyikla(cevap);
    let uretimSaglayicisi = saglayici;

    // 23 Eylul: Gorsel Motoru eklendi - Full Audit'te bulundu, arsivin temel
    // tasi olan bu route'ta hic gorsel yoktu.
    plan.gorselSvg = await gorselKararIsteSunucu(ders, konu, sinif);

    // Katman 4 - mufredat sinir kontrolu (SADE, 18 Eylul: yapay-matematik
    // deseni ve buna bagli otomatik yeniden uretim KALDIRILDI - gercek veriyle
    // (MEB/EBA kaynaklari) dogrulandi ki cok yuksek yanlis-pozitif veriyordu,
    // GERCEK mufredat iceriğini (orn. Din Kulturu Zekat hesabi) hatali
    // sayiyordu. Sadece referans var/yok kontrolu kaldi, GOLGE MOD, sadece log.
    const mufredatSonuc = mufredatSinirKontrolYap(ders);
    if (!mufredatSonuc.gecti) console.warn("ders_plani MUFREDAT-SINIR uyari (GOLGE MOD):", ders, konu, mufredatSonuc.uyarilar);

    const kaliteSonucu = kaliteKontrolYap("ders_plani", plan);
    const onayDurumu = kaliteSonucu.gecti ? "taslak" : "bekliyor";

    // Katman 2 - deterministik kontrol (GOLGE MOD, sadece log, engellemez)
    const detKontrol = deterministikKontrolYap(plan.soruSeti || []);
    if (!detKontrol.uyumlu) console.warn("ders_plani DETERMINISTIK uyari (GOLGE MOD):", ders, konu, detKontrol.uyarilar);

    // Katman 3 - capraz-model dogrulama (GOLGE MOD, sadece log, engellemez, hic throw etmez)
    const soruOzeti = JSON.stringify((plan.soruSeti || []).map((s) => ({ soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogruIndex })));
    const caprazSonuc = await ikinciGorusAl(uretimSaglayicisi, soruOzeti);
    if (caprazSonuc?.hataVarMi) console.warn("ders_plani CAPRAZ-MODEL uyari (GOLGE MOD):", ders, konu, caprazSonuc.bulgular);

    const sonuc = await sql`
      INSERT INTO ders_plani (ogretmen_id, ders, sinif, unite, ogrenme_ciktisi, icerik_json, onay_durumu, kalite_kontrol)
      VALUES (${ogretmen.id}, ${ders}, ${Number(sinif)}, ${unite || ""}, ${plan.ogrenmeCiktisi || konu}, ${JSON.stringify(plan)}, ${onayDurumu}, ${JSON.stringify(kaliteSonucu)})
      RETURNING id
    `;

    // Katman 5 - 4 katmanin sonuclarini kalici tabloya kaydet (GOLGE MOD, ates-et-unut)
    await kaliteLoglariniKaydet("ders_plani", sonuc[0].id, [
      { katman: "yapisal", gecti: kaliteSonucu.gecti, uyarilar: kaliteSonucu.uyarilar },
      { katman: "deterministik", gecti: detKontrol.uyumlu, uyarilar: detKontrol.uyarilar },
      { katman: "capraz_model", gecti: !caprazSonuc?.hataVarMi, uyarilar: caprazSonuc?.bulgular || [] },
      { katman: "mufredat_sinir", gecti: mufredatSonuc.gecti, uyarilar: mufredatSonuc.uyarilar },
    ]);

    return Response.json({ ok: true, id: sonuc[0].id, plan, kaliteSonucu });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Ders plani uretilemedi: " + e.message }, { status: 500 });
  }
}
