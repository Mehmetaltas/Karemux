// Karemux Icerik Kalite Motoru - TEK, PAYLASILAN kalite kontrolu (18 Eylul).
// Katman 1 (yapisal) burada MERKEZILESTIRILDI - konu_paketi'ndeki
// paketKaliteKontrol ve ders_plani'ndeki planKaliteKontrol'un YERINI alir.
// Sonraki katmanlar (deterministik/capraz-model/mufredat-sinir/kendi-kendini-onaran)
// bu AYNI dosyaya EKLENECEK, ayri dosyalara DAGILMAYACAK.

import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { sql } from "@/lib/db";

const YABANCI_KARAKTER = /[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]/;

// Mojibake tespiti (18 Eylul) - AI saglayicilarinin (ozellikle Groq) bazen
// Turkce karakterleri (s,g,i,o,u,c) UTF-8 cift-kodlama hatasiyla bozmasi
// (orn. "Kardeslik" -> "KardeAYlAsk" benzeri) veya kayip bayt isareti (U+FFFD).
const MOJIBAKE_KARAKTER = /[\u00c3\u00c2\u0080-\u009f]|\ufffd/;

// Her icerik turu kendi SEMASINI burada tanimlar - motor kodu degismez,
// yeni tur eklenince (fasikul/deneme) sadece buraya bir kayit eklenir.
const SEMALAR = {
  konu_paketi: {
    metinAlanlari: [
      { yol: "anlatim.hizliOgren", minUzunluk: 40 },
      { yol: "anlatim.temelAnlatim", minUzunluk: 80 },
      { yol: "anlatim.derinAnlatim", minUzunluk: 80 },
      { yol: "anlatim.yeniNesilUygulama", minUzunluk: 40 },
    ],
    soruDizileri: [
      { yol: "soruHavuzu", beklenenSayi: 15, secenekSayisi: 4 },
      { yol: "odevSorulari", beklenenSayi: 6, secenekSayisi: null },
    ],
  },
  ders_plani: {
    metinAlanlari: [
      { yol: "ogrenmeCiktisi", minUzunluk: 40 },
      { yol: "onKosul", minUzunluk: 40 },
      { yol: "dersAnlatimi", minUzunluk: 40 },
      { yol: "etkinlik", minUzunluk: 40 },
      { yol: "gelistir", minUzunluk: 40 },
      { yol: "derinlestir", minUzunluk: 40 },
      { yol: "olcme", minUzunluk: 40 },
    ],
    soruDizileri: [
      { yol: "soruSeti", beklenenSayi: 8, secenekSayisi: 4, esnekMin: 5 },
    ],
  },
};

function yolOku(obj, yol) {
  return yol.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

// Katman 1 - Yapisal kontrol. AI'siz, hizli, uretimi ENGELLEMEZ, sadece isaretler.
export function kaliteKontrolYap(tur, icerik) {
  const sema = SEMALAR[tur];
  if (!sema) throw new Error(`kalite-motoru: taninmayan tur "${tur}" - SEMALAR'a eklenmeli`);

  const uyarilar = [];

  for (const alan of sema.metinAlanlari) {
    const metin = yolOku(icerik, alan.yol);
    if (!metin) { uyarilar.push(`${alan.yol}: alan eksik`); continue; }
    const metinStr = typeof metin === "string" ? metin : JSON.stringify(metin);
    if (YABANCI_KARAKTER.test(metinStr)) uyarilar.push(`${alan.yol}: yabanci karakter tespit edildi`);
    if (MOJIBAKE_KARAKTER.test(metinStr)) uyarilar.push(`${alan.yol}: bozuk/mojibake karakter tespit edildi (AI saglayici hatasi olabilir)`);
    if (typeof metin === "string" && metin.length < alan.minUzunluk) uyarilar.push(`${alan.yol}: cok kisa (${alan.minUzunluk} karakterden az)`);
  }

  for (const dizi of sema.soruDizileri) {
    const liste = yolOku(icerik, dizi.yol) || [];
    const beklenenMin = dizi.esnekMin || dizi.beklenenSayi;
    if (liste.length < beklenenMin) uyarilar.push(`${dizi.yol}: ${liste.length} soru var, en az ${beklenenMin} bekleniyordu`);
    const soruMetinleri = new Set();
    liste.forEach((s, i) => {
      if (dizi.secenekSayisi && (!Array.isArray(s.secenekler) || s.secenekler.length !== dizi.secenekSayisi)) {
        uyarilar.push(`${dizi.yol}[${i}]: secenekler ${dizi.secenekSayisi} degil`);
      }
      if (dizi.secenekSayisi && (typeof s.dogruIndex !== "number" || s.dogruIndex < 0 || s.dogruIndex >= dizi.secenekSayisi)) {
        uyarilar.push(`${dizi.yol}[${i}]: dogruIndex gecersiz`);
      }
      if (YABANCI_KARAKTER.test(s.soru || "")) uyarilar.push(`${dizi.yol}[${i}]: yabanci karakter`);
      if (MOJIBAKE_KARAKTER.test(s.soru || "") || (s.secenekler || []).some(sec => MOJIBAKE_KARAKTER.test(sec))) uyarilar.push(`${dizi.yol}[${i}]: bozuk/mojibake karakter tespit edildi`);
      if (soruMetinleri.has(s.soru)) uyarilar.push(`${dizi.yol}[${i}]: tekrarlanan soru metni`);
      soruMetinleri.add(s.soru);
    });
  }

  return { gecti: uyarilar.length === 0, uyarilar };
}

// Referans erisimi - Katman 3/4'te (capraz-model + mufredat sinir) kullanilacak.
// SIMDIDEN BAGLANIYOR ki unutulmasin - tek noktadan disari aciliyor.
export function dersReferansiGetir(ders) {
  return KALITE_REFERANSLARI[ders] || null;
}

// Katman 4 - Mufredat sinir kontrolu (18 Eylul). KALITE_REFERANSLARI onceden
// SADECE pasif referans olarak promptlara veriliyordu, hic kontrol edilmiyordu -
// bir ders icin referans TANIMLI DEGILSE hicbir yerde fark edilmiyordu. Bu,
// bunu AKTIF hale getirir: referans yoksa (yeni/arastirilmamis bir ders) isaretler.
export function mufredatSinirKontrolYap(ders) {
  const referans = dersReferansiGetir(ders);
  if (!referans) {
    return { gecti: false, uyarilar: [`"${ders}" dersi icin KALITE_REFERANSLARI'nda kayit YOK - icerik referanssiz uretildi, gercek piyasa arastirmasiyla eklenmeli`] };
  }
  return { gecti: true, uyarilar: [] };
}

// ==========================================================================
// KATMAN 2 - Deterministik dogrulama (18 Eylul, GOLGE MOD).
// AI'nin isaretledigi dogru cevabi mathjs ile GERCEKTEN hesaplayip karsilastirir.
// GOLGE MOD: sadece isaretler/loglar, HICBIR icerigi engellemiyor - once yanlis-
// pozitif orani gercek veriyle olculecek, sonra (Adim 5'te) engelleyici moda gecilecek.
import { evaluate } from "mathjs";

function sayisalSonucCikar(secenekMetni) {
  // "A) 8" -> "8", "B) 1/4" -> "1/4" gibi secenek metninden ham sayiyi ayiklar
  const temiz = secenekMetni.replace(/^[A-D]\)\s*/, "").trim();
  return temiz;
}

// Bir soru+secenek dizisini deterministik kontrol eder. kontrolIfadesi bossa
// (Matematik/Fen disi dersler icin normal) sessizce atlar, uyari uretmez.
export function deterministikKontrolYap(soruDizisi) {
  const uyarilar = [];
  soruDizisi.forEach((s, i) => {
    if (!s.kontrolIfadesi || typeof s.kontrolIfadesi !== "string" || s.kontrolIfadesi.trim() === "") return;
    if (typeof s.dogruIndex !== "number" || !Array.isArray(s.secenekler)) return;
    try {
      const hesaplanan = evaluate(s.kontrolIfadesi);
      const hesaplananStr = typeof hesaplanan === "number" ? String(hesaplanan) : hesaplanan.toString();
      const isaretliSecenek = sayisalSonucCikar(s.secenekler[s.dogruIndex] || "");
      // Basit metin karsilastirmasi - tam eslesme olmayabilir (orn. "1/4" vs "0.25"),
      // bu yuzden GOLGE MOD: uyumsuzluk sadece LOGLANIR, icerik ENGELLENMEZ.
      if (isaretliSecenek && hesaplananStr && !isaretliSecenek.includes(hesaplananStr) && !hesaplananStr.includes(isaretliSecenek)) {
        uyarilar.push(`soru[${i}]: kontrolIfadesi "${s.kontrolIfadesi}" = ${hesaplananStr}, ama isaretli secenek "${isaretliSecenek}" - UYUMSUZ OLABILIR (golge mod, dogrulanmali)`);
      }
    } catch (e) {
      uyarilar.push(`soru[${i}]: kontrolIfadesi "${s.kontrolIfadesi}" hesaplanamadi (${e.message})`);
    }
  });
  return { uyumlu: uyarilar.length === 0, uyarilar };
}

// Katman 5 - Kalici kalite kaydi (18 Eylul, GOLGE MOD asamasi).
// 4 katmanin (yapisal/deterministik/capraz-model/mufredat-sinir) sonuclarini
// TEK, capraz-icerik-turu bir tabloya (icerik_kalite_log) yazar - amac
// yanlis-pozitif oranini GERCEK VERIYLE olcmek (Adim 5, golge mod).
// Ates-et-unut (fire-and-forget) - loglama basarisiz olsa da ana akisi
// ENGELLEMEZ/GECIKTIRMEZ (ai_saglayici_log'daki ayni ilke).
// Sonraki adim (Adim 6, HENUZ YOK): golge mod verisi guvenilir cikarsa
// bu katmanlar ENGELLEYICI moda gecer, basarisiz icerik burada
// karantinaya alinir (yayinlanmaz), insan onayi tamamen kalkar.
export function kaliteLoglariniKaydet(kaynakTablo, kaynakId, katmanSonuclari) {
  for (const { katman, gecti, uyarilar } of katmanSonuclari) {
    sql`INSERT INTO icerik_kalite_log (kaynak_tablo, kaynak_id, katman, sonuc, detay) VALUES (${kaynakTablo}, ${kaynakId}, ${katman}, ${gecti ? "gecti" : "uyari"}, ${JSON.stringify({ uyarilar })})`.catch((e) => {
      console.error("kaliteLoglariniKaydet basarisiz (etkisiz, sadece log kaybi):", e.message);
    });
  }
}
