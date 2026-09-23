// Karemux JSON Ayiklama - TEK, PAYLASILAN yardimci (18 Eylul).
// AI saglayicilari (ozellikle Groq) bazen JSON string ICINDE kacissiz
// (ham) kontrol karakteri (satir sonu/tab) dondurebiliyor - bu, standart
// JSON.parse'i "Bad control character in string literal" hatasiyla
// cokertiyor. Bu fonksiyon, SADECE tirnak icindeki (string literal)
// kontrol karakterlerini kacisli hale cevirir - yapisal bosluklar
// (objeler arasindaki bicim amacli satir sonlari) DOKUNULMAZ birakilir.
export function stringIcindekiKontrolKarakterleriKaciscala(metin) {
  let sonuc = "";
  let tirnakIcinde = false;
  let oncekiKacisli = false;

  for (let i = 0; i < metin.length; i++) {
    const c = metin[i];
    const kod = metin.charCodeAt(i);

    if (tirnakIcinde && !oncekiKacisli && kod < 0x20) {
      if (c === "\n") sonuc += "\\n";
      else if (c === "\r") sonuc += "\\r";
      else if (c === "\t") sonuc += "\\t";
      else sonuc += " ";
      continue;
    }

    sonuc += c;

    if (c === '"' && !oncekiKacisli) tirnakIcinde = !tirnakIcinde;
    oncekiKacisli = tirnakIcinde && c === "\\" && !oncekiKacisli;
  }

  return sonuc;
}

// Bazi AI saglayicilari (ozellikle Groq) Turkce karakterleri UTF-8/Latin-1
// cift-kodlama hatasiyla bozabiliyor (orn. gercek "ı" harfinin UTF-8 baytlari
// yanlislikla Latin-1 olarak okunup "Ä±" haline geliyor). Bu, KESIN ve TERSINE
// COVRILEBILIR bir bayt-eslesme hatasi - tahmin degil, sabit tablo.
// SADECE eslesen ikili diziler duzeltilir - tek basina kalmis (partner
// bayti kaybolmus, orn. sadece "Å") belirsiz durumlar KASITLI OLARAK
// duzeltilmez (yanlis harf tahmin etme riski), kalite-motoru'nun mojibake
// tespiti bunlari yakalayip Katman 5'in yeniden uretimine birakir.
const MOJIBAKE_TABLOSU = [
  ["Ã§", "ç"], ["Ã‡", "Ç"],
  ["Ã¶", "ö"], ["Ã–", "Ö"],
  ["Ã¼", "ü"], ["Ã", "Ü"],
  ["ÄŸ", "ğ"], ["Äž", "Ğ"],
  ["Ä±", "ı"], ["Ä°", "İ"],
  ["ÅŸ", "ş"], ["Åž", "Ş"],
];

export function bilinenMojibakeyiOnar(metin) {
  let sonuc = metin;
  for (const [bozuk, dogru] of MOJIBAKE_TABLOSU) {
    sonuc = sonuc.split(bozuk).join(dogru);
  }
  return sonuc;
}

// Tek, paylasilan JSON ayiklayici - tum icerik uretim route'lari buradan
// okumali. AI cevabindan markdown isaretlerini temizler, ilk {'den son
// }'a kadar olan kismi alir, kontrol karakterlerini guvenli hale getirir,
// BILINEN mojibake ciftlerini onarir (belirsiz/eksik olanlari OLDUGU GIBI birakir).
export function jsonAyikla(cevap) {
  const temiz = cevap.replace(/```json|```/g, "").trim();
  const hamJson = temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1);
  const guvenliJson = stringIcindekiKontrolKarakterleriKaciscala(hamJson);
  const onarilmisJson = bilinenMojibakeyiOnar(guvenliJson);
  return JSON.parse(onarilmisJson);
}
