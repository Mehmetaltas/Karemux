import { HAFTALAR, TATILLER, DONEM_BASI, DONEM_SONU, RESMI_TATILLER } from "@/lib/akademik-takvim";
import { YILLIK_PLAN } from "@/lib/yillik-plan.data";

// Plan Motoru (V3 Dalga 5): "Resmi Plan" = MEB'in haftalik cerceve yillik plani (okulda bu hafta ne isleniyor).
// Ogrenme Plani (kisiye ozel eksik kapatma) ayri tutulur; burasi yalniz resmi plani verir.

export const DERS_SIRASI = ["Turkce", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "T.C. Inkilap Tarihi", "Din Kulturu", "Ingilizce"];
export const DERS_ADLARI = {
  Turkce: "Türkçe", Matematik: "Matematik", "Fen Bilimleri": "Fen Bilimleri", "Sosyal Bilgiler": "Sosyal Bilgiler",
  "T.C. Inkilap Tarihi": "T.C. İnkılap Tarihi ve Atatürkçülük", "Din Kulturu": "Din Kültürü ve Ahlak Bilgisi", Ingilizce: "İngilizce",
};

export function istanbulBugun(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function tatilBul(tarih) {
  for (const [ad, a, b] of TATILLER) if (tarih >= a && tarih <= b) return ad;
  return null;
}

// tarih: "YYYY-MM-DD". Donus: { tarih, durum: "oncesi"|"ders"|"hafta_sonu"|"tatil"|"sonrasi", hafta, sonrakiHafta, tatil, resmiTatil }
export function takvimDurumu(tarih) {
  const resmi = RESMI_TATILLER.find(([, t]) => t === tarih)?.[0] || null;
  if (tarih < DONEM_BASI) return { tarih, durum: "oncesi", hafta: null, sonrakiHafta: 1, tatil: null, resmiTatil: resmi };
  if (tarih > DONEM_SONU) return { tarih, durum: "sonrasi", hafta: null, sonrakiHafta: null, tatil: null, resmiTatil: resmi };
  for (let i = 0; i < HAFTALAR.length; i++) {
    const [n, ilk, son] = HAFTALAR[i];
    if (tarih >= ilk && tarih <= son) return { tarih, durum: "ders", hafta: n, sonrakiHafta: n < 37 ? n + 1 : null, tatil: null, resmiTatil: resmi };
    if (tarih < ilk) {
      // onceki haftanin bitisi ile bu haftanin baslangici arasindayiz: tatil ya da hafta sonu
      const tatil = tatilBul(tarih);
      const onceki = i > 0 ? HAFTALAR[i - 1][0] : null;
      if (tatil) return { tarih, durum: "tatil", hafta: null, sonrakiHafta: n, tatil, resmiTatil: resmi };
      return { tarih, durum: "hafta_sonu", hafta: onceki, sonrakiHafta: n, tatil: null, resmiTatil: resmi };
    }
  }
  return { tarih, durum: "sonrasi", hafta: null, sonrakiHafta: null, tatil: null, resmiTatil: resmi };
}

export function haftaTarihleri(n) {
  const h = HAFTALAR.find((x) => x[0] === n);
  return h ? { baslangic: h[1], bitis: h[2] } : null;
}

export function dersListesi(sinif) {
  return DERS_SIRASI.filter((d) => YILLIK_PLAN[`${d}::${sinif}`]);
}

// Bir sinifin tum derslerinin verilen haftadaki resmi plani
export function haftaPlani(sinif, hafta) {
  if (!hafta) return [];
  return dersListesi(sinif).map((ders) => {
    const kayit = YILLIK_PLAN[`${ders}::${sinif}`].find((x) => x[0] === hafta);
    return { ders, dersAdi: DERS_ADLARI[ders], unite: kayit?.[1] || "", konu: kayit?.[2] || "" };
  });
}

export function dersYillikPlani(sinif, ders) {
  const l = YILLIK_PLAN[`${ders}::${sinif}`];
  return l ? l.map(([hafta, unite, konu]) => ({ hafta, ...(haftaTarihleri(hafta) || {}), unite, konu })) : null;
}
