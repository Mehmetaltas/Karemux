import { sql } from "@/lib/db";
import { ogretmenCoz } from "@/lib/ogretmen";
import { aiCagir } from "@/lib/ai";
import { kaliteKontrolYap, deterministikKontrolYap } from "@/lib/kalite-motoru";
import { jsonAyikla } from "@/lib/json-ayikla";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";

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

    const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";
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
  "soruSeti": [{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","kontrolIfadesi":"SADECE sonucu TEK BIR SAYI olan sorularda: cevabi veren, degisken (x/y/a harfleri) ICERMEYEN, TAMAMEN SAYISAL bir ifade (orn. 3^2*3^4). Cebirsel/degiskenli sorularda (ozdeslik, carpanlara ayirma, denklem) BOS STRING birak - bu alan SADECE nihai sayisal cevabi dogrulamak icindir"}],
  "olcme": "bu ogrenme ciktisinin ne kadar kazanildigini olcmek icin somut bir degerlendirme yontemi (rubrik/kisa sinav/gozlem), 80-100 kelime"
}

soruSeti TAM 8 soru icersin: 3 kolay, 3 orta, 2 zor (sirali ver).`;

    const cevap = await aiCagir({ prompt: p, maxTokens: 14000, jsonModu: true, tur: "ders_plani" });
    const plan = jsonAyikla(cevap);

    const kaliteSonucu = kaliteKontrolYap("ders_plani", plan);
    const onayDurumu = kaliteSonucu.gecti ? "taslak" : "bekliyor";

    // Katman 2 - deterministik kontrol (GOLGE MOD, sadece log, engellemez)
    const detKontrol = deterministikKontrolYap(plan.soruSeti || []);
    if (!detKontrol.uyumlu) console.warn("ders_plani DETERMINISTIK uyari (GOLGE MOD):", ders, konu, detKontrol.uyarilar);

    const sonuc = await sql`
      INSERT INTO ders_plani (ogretmen_id, ders, sinif, unite, ogrenme_ciktisi, icerik_json, onay_durumu, kalite_kontrol)
      VALUES (${ogretmen.id}, ${ders}, ${Number(sinif)}, ${unite || ""}, ${plan.ogrenmeCiktisi || konu}, ${JSON.stringify(plan)}, ${onayDurumu}, ${JSON.stringify(kaliteSonucu)})
      RETURNING id
    `;

    return Response.json({ ok: true, id: sonuc[0].id, plan, kaliteSonucu });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Ders plani uretilemedi: " + e.message }, { status: 500 });
  }
}
