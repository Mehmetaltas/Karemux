// Karemux Icerik Kalite Motoru - TEK, PAYLASILAN kalite kontrolu (18 Eylul).
// Katman 1 (yapisal) burada MERKEZILESTIRILDI - konu_paketi'ndeki
// paketKaliteKontrol ve ders_plani'ndeki planKaliteKontrol'un YERINI alir.
// Sonraki katmanlar (deterministik/capraz-model/mufredat-sinir/kendi-kendini-onaran)
// bu AYNI dosyaya EKLENECEK, ayri dosyalara DAGILMAYACAK.

import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";

const YABANCI_KARAKTER = /[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]/;

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
