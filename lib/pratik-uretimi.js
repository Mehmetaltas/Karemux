// Faz E - PRATIK OTURUMU: tek konu (5 / 15 fasikul), unite testi, benzer sorular (Hata Kitapcigi)
// ve paragraf pratiginin SUNUCU TARAFINDA uretimi. Eskiden istem tarayicida kuruluyor, genel
// /api/claude uzerinden uretiliyor ve cevap anahtari tarayicida kaliyordu. Artik istem burada
// kurulur, anahtar sunucuda saklanir, puanlama /api/sinav-oturumu/gonder'de yapilir.
import { sql } from "@/lib/db";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { sinavSorusuGecerliMi } from "@/lib/sinav-uretimi";

export const PRATIK_TURLERI = ["konu", "unite", "benzer", "paragraf"];

// Her turun parti plani: toplam soru ve parti buyuklukleri (istek basina 60 sn sinirina sigsin diye
// 10'dan buyuk testler partilere bolunur; parti sayisini ve buyuklugunu istemci DEGIL sunucu belirler).
export function pratikPlani(pratikTuru, fasikul) {
  if (pratikTuru === "konu") return fasikul ? { toplam: 15, partiler: [10, 5] } : { toplam: 5, partiler: [5] };
  if (pratikTuru === "paragraf") return { toplam: 20, partiler: [10, 10] };
  if (pratikTuru === "unite" || pratikTuru === "benzer") return { toplam: 5, partiler: [5] };
  return null;
}

// Istemden gelen serbest metni istem icine koymadan once temizler (tirnak, satir sonu, uzunluk).
export function istemMetni(v, enFazla) {
  if (typeof v !== "string") return null;
  const t = v.replace(/["\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return t.length > 0 && t.length <= enFazla ? t : null;
}

const TEMIZ_TURKCE = "Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Portekizce gibi bati dillerinden TEK KELIME bile kullanma.";
const SORU_SEKLI = `{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"orta","altKonu":"...","aciklama":"dogru cevabin NEDEN dogru oldugu, 1-2 cumle","beceri":"soru hangi beceriyi olcuyor (orn. islem becerisi, yorumlama, uygulama - kisa 2-4 kelime)","tahminiSureSaniye":45,"yayginHata":"ogrencilerin bu tarz soruda en sik yaptigi hata (kisa, 1 cumle)","cozumTeknigi":"bu soruyu hizli cozmenin pratik teknigi (kisa, 1 cumle)"}`;
const DOGRULUK = "ONEMLI: Her soruyu yazdiktan sonra cevabi KENDIN ADIM ADIM kontrol et ve dogruIndex'in GERCEKTEN dogru oldugundan emin ol; HER SORUDA TAM 4 secenek (A,B,C,D) olsun.";

// TEK KONU: 5 soru (normal) ya da 15 soru fasikul (1. parti 5 kolay + 5 orta, 2. parti 5 zor).
export function konuPromptuOlustur({ ders, sinif, konu, unite, fasikul, partiNo, soruTalimati }) {
  const uniteMetni = unite ? ` (${unite} unitesinden, gercek LGS tarzinda)` : "";
  if (!fasikul) {
    return `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni} "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde 5 coktan secmeli soru hazirla. ${soruTalimati} ${DOGRULUK} ${TEMIZ_TURKCE} SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme:\n[${SORU_SEKLI}]`;
  }
  const kalite = KALITE_REFERANSLARI[ders]
    ? ` Kalite referansi: ${KALITE_REFERANSLARI[ders]}`
    : " Bu, meshur ozel yayin kaynaklarinin (MEB yayinlarindan daha ust seviye, sik tercih edilen ek kaynaklar seviyesinde) fasikul formatinda olsun.";
  const olcut = "SOMUT OLCUT: KOLAY = tek adimda dogrudan kazanim/kavram hatirlama, celdiriciler belirgin; ORTA = 2 adimli uygulama, MEB soru tarzina yakin dengeli celdiriciler; ZOR = cok asamali muhakeme/analiz, paragraf-grafik-tablo yorumlama iceren yeni nesil format, celdiriciler ince ayrimli kavram yanilgilarina dayali.";
  const dagilim = partiNo === 0
    ? "Bu, 15 soruluk fasikulun 1. partisi: TAM 10 soru hazirla; ILK 5 SORU KOLAY, SONRAKI 5 SORU ORTA seviyede olsun (sirali ver)."
    : "Bu, 15 soruluk fasikulun 2. partisi: TAM 5 soru hazirla; HEPSI ZOR seviyede olsun. Ilk partideki sorulari tekrar etme, farkli ornekler ve sayilar kullan.";
  return `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni} "${konu}" konusuyla ilgili ${sinif}. sinif seviyesinde fasikul formatinda coktan secmeli sorular hazirla. ${dagilim} ${olcut} ${soruTalimati}${kalite} Sorular mantik yurutme ve yorum gerektiren tarzda olsun, ezber bilgi sorma. ${DOGRULUK} ${TEMIZ_TURKCE} SADECE JSON dondur, markdown kod blogu kullanma, baska hicbir aciklama ekleme:\n[${SORU_SEKLI.replace('"zorluk":"orta"', '"zorluk":"kolay"')}]`;
}

// UNITE TESTI: unitenin tamamini kapsayan 5 soru (istege bagli alt baslik siniri).
export function unitePromptuOlustur({ ders, sinif, unite, altBasliklar, soruTalimati }) {
  const sinir = altBasliklar && altBasliklar.length > 0
    ? ` SADECE su alt basliklardan sorular hazirla: ${altBasliklar.join(", ")}. Unitenin diger alt basliklarindan soru sorma.`
    : "";
  return `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinin "${unite}" unitesinin TAMAMINI kapsayan, ${sinif}. sinif seviyesinde 5 coktan secmeli soru hazirla.${sinir} ${soruTalimati} ${DOGRULUK} SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma:\n[${SORU_SEKLI}]`;
}

// BENZER SORULAR: ogrencinin Hata Kitapcigi'ndaki alt konulardan 5 yeni soru.
export function benzerPromptuOlustur({ ders, sinif, altKonular, soruTalimati }) {
  const liste = altKonular.length > 0 ? altKonular.join(", ") : "gecmiste yanlis yapilan konular";
  return `Sen "${ders}" dersi ogretmenisin. ${sinif}. sinif seviyesindeki ogrencinin daha once yanlis yaptigi su konulardan: ${liste} - bu konulari pekistirecek 5 YENI (birebir ayni olmayan, ama ayni beceriyi olcen) coktan secmeli soru hazirla. "altKonu" alaninda YUKARIDAKI LISTEDEN birini AYNEN yaz. ${soruTalimati} ${DOGRULUK} SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma:\n[${SORU_SEKLI}]`;
}

// PARAGRAF PRATIGI: 1. parti = metin + puf noktalari + 10 soru (obje); 2. parti = ayni metne 10 daha zor soru (dizi).
export function paragrafPromptuOlustur({ ders, sinif, konu, unite, partiNo, metin, soruTalimati }) {
  const uniteMetni = unite ? ` (${unite} unitesinden)` : "";
  const kalite = KALITE_REFERANSLARI[ders] ? ` Kalite referansi: ${KALITE_REFERANSLARI[ders]}` : "";
  if (partiNo === 0) {
    return `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni} "${konu}" konusuyla ilgili once orta uzunlukta (120-180 kelime) bir metin/paragraf yaz, sonra bu metne dayali TAM 10 coktan secmeli soru hazirla (${sinif}. sinif seviyesinde, kolaydan ortaya dogru sirali; bu 20 soruluk pratigin 1. yarisi). ${soruTalimati}${kalite} Son olarak bu konuyla ilgili 3-5 maddelik kisa "puf noktalari / altin kurallar" listesi ekle (formul, dikkat edilecek nokta, sik yapilan hatalar gibi). Sorular okudugunu anlama, yorumlama ve dikkat gerektirsin. ${DOGRULUK} ${TEMIZ_TURKCE} SADECE JSON dondur, baska hicbir aciklama ekleme, markdown kullanma:\n{"metin":"...","pufNoktalari":["...","..."],"sorular":[${SORU_SEKLI.replace('"zorluk":"orta"', '"zorluk":"kolay"')}]}`;
  }
  return `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${uniteMetni} "${konu}" konusu icin asagidaki metne dayali, TAM 10 coktan secmeli soru hazirla (${sinif}. sinif seviyesinde; bu 20 soruluk pratigin 2. yarisi: ORTA-ZOR seviyede, ilk yaridaki sorulari tekrar etme, metnin farkli yonlerini sor).\n\nMETIN:\n${metin}\n\n${soruTalimati}${kalite} Sorular okudugunu anlama, yorumlama ve dikkat gerektirsin. ${DOGRULUK} ${TEMIZ_TURKCE} SADECE JSON dizisi dondur, baska hicbir aciklama ekleme, markdown kullanma:\n[${SORU_SEKLI.replace('"zorluk":"orta"', '"zorluk":"zor"')}]`;
}

// Paragraf 1. parti cevabi bir OBJE: { metin, pufNoktalari, sorular } (istemcideki ayiklama mantiginin kopyasi).
export function paragrafObjesiAyikla(temizMetin) {
  const b = temizMetin.indexOf("{");
  const s = temizMetin.lastIndexOf("}");
  if (b === -1 || s === -1) throw new Error("Paragraf pratigi olusturulamadi, tekrar dene");
  const veri = JSON.parse(temizMetin.slice(b, s + 1));
  const metin = typeof veri.metin === "string" ? veri.metin.trim() : "";
  const puf = Array.isArray(veri.pufNoktalari) ? veri.pufNoktalari.filter((x) => typeof x === "string" && x.trim()).slice(0, 8) : [];
  return { metin, pufNoktalari: puf, sorular: Array.isArray(veri.sorular) ? veri.sorular : [] };
}

// Onayli konu paketinin soru havuzu (ogretmen onayli, AI'ya gitmeden). Yoksa / yetersizse bos dizi.
export async function onayliKonuHavuzu({ sinif, ders, unite, konu }) {
  try {
    const satir = await sql`
      SELECT id, icerik_json FROM icerik_onbellek
      WHERE sinif = ${Number(sinif)} AND ders = ${ders} AND unite = ${unite || ""}
        AND konu = ${konu} AND icerik_turu = 'konu_paketi' AND onay_durumu = 'onaylandi'
      LIMIT 1
    `;
    if (satir.length === 0 || !satir[0].icerik_json) return [];
    let paket = satir[0].icerik_json;
    if (typeof paket === "string") paket = JSON.parse(paket);
    const havuz = Array.isArray(paket?.soruHavuzu) ? paket.soruHavuzu.filter(sinavSorusuGecerliMi) : [];
    if (havuz.length > 0) {
      try { await sql`UPDATE icerik_onbellek SET kullanim_sayisi = kullanim_sayisi + 1, son_kullanim = now() WHERE id = ${satir[0].id}`; } catch (e) { /* sayac kritik degil */ }
    }
    return havuz;
  } catch (e) {
    console.error("Onayli konu havuzu okunamadi:", e.message);
    return [];
  }
}

// Soru bankasindan (ayni ders + sinif + unite) rastgele sorular; yeterli degilse bos dizi.
export async function bankadanSoruGetir({ ders, sinif, unite, adet }) {
  try {
    const satirlar = await sql`
      SELECT soru, secenekler, dogru_index, alt_konu, aciklama FROM soru_bankasi
      WHERE ders = ${ders} AND unite = ${unite} AND (sinif = ${sinif} OR sinif IS NULL)
        AND (kaynak_turu IS NULL OR kaynak_turu <> 'paragraf')
      ORDER BY RANDOM() LIMIT ${adet}
    `;
    const sorular = satirlar
      .map((s) => ({ soru: s.soru, secenekler: s.secenekler, dogruIndex: s.dogru_index, altKonu: s.alt_konu || null, aciklama: s.aciklama || null }))
      .filter(sinavSorusuGecerliMi);
    return sorular.length >= Math.ceil(adet * 0.7) ? sorular : [];
  } catch (e) {
    console.error("Soru bankasi okunamadi:", e.message);
    return [];
  }
}

// Ogrencinin cozulmemis hata kitapcigi kayitlarindaki alt konular (en yeni once).
export async function hataAltKonulari(kullaniciId, ders) {
  const satirlar = await sql`
    SELECT alt_konu FROM hata_kitapcigi
    WHERE kullanici_id = ${kullaniciId} AND ders = ${ders} AND cozuldu = false
    ORDER BY olusturulma DESC LIMIT 100
  `;
  const altKonular = [...new Set(satirlar.map((r) => r.alt_konu).filter(Boolean))].slice(0, 15);
  return { kayitSayisi: satirlar.length, altKonular };
}
