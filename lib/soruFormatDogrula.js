// Ortak soru format dogrulama (12 Ekim, Sinav Uretim Motoru birlestirmesi,
// Faz D adim 1). 4 mekanizmadaki (seviye-tespit/olustur, onay-sinavi-olustur,
// ulusalDenemeOlustur, konu-paketi) neredeyse ayni kopya filtre kodunu tek
// yere tasir. DAVRANIS DEGISMEDI - her cagiran, kendi mevcut davranisina
// birebir karsilik gelen opsiyonlari gecirir (bkz. her route'taki yorum).
//
// NOT (12 Ekim, TARA/Faz C dogrulamasi): konu-paketi/route.js'te soruHavuzu
// icin HICBIR tekil-soru format filtresi yoktu (sadece dizi bos mu kontrolu
// vardi) - bu yuzden bu fonksiyon konu-paketi'ne HENUZ uygulanmadi, ayri bir
// karar/adim olarak birakildi (davranis degistirecegi icin).
export function soruFormatGecerliMi(s, { soruTrimGerekli = true, dersUniteGerekli = false } = {}) {
  if (!s || typeof s !== "object") return false;
  if (typeof s.soru !== "string") return false;
  if (soruTrimGerekli && !s.soru.trim()) return false;
  if (!Array.isArray(s.secenekler) || s.secenekler.length < 2) return false;
  if (!Number.isInteger(s.dogruIndex) || s.dogruIndex < 0 || s.dogruIndex >= s.secenekler.length) return false;
  if (dersUniteGerekli && (typeof s.ders !== "string" || typeof s.unite !== "string")) return false;
  return true;
}
