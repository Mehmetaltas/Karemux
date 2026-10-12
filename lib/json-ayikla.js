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

// 12 Ekim: lastIndexOf("}") HATALIYDI - AI cevabi JSON'dan SONRA ekstra
// metin icerip (aciklama, ikinci ornek, vb.) o metinde HERHANGI bir "}"
// geciyorsa, lastIndexOf o YANLIS (en sondaki) "}"yi yakaliyor ve JSON.parse
// "Unexpected non-whitespace character after JSON" hatasi veriyordu (10
// Ekim'e kadar en az 2 kez CI'da gozlendi - konu_paketi araci). Duzeltme:
// parantez DENGESI sayarak (tirnak ici karakterleri saymadan) JSON'un
// GERCEK bittigi noktayi buluyoruz - ilk { acilisindan itibaren derinlik
// 0'a dustugu ilk nokta.
function jsonGercekBitisiniBul(metin, baslangic) {
  let derinlik = 0;
  let tirnakIcinde = false;
  let oncekiKacisli = false;
  for (let i = baslangic; i < metin.length; i++) {
    const c = metin[i];
    if (tirnakIcinde) {
      if (c === '"' && !oncekiKacisli) tirnakIcinde = false;
      oncekiKacisli = c === "\\" && !oncekiKacisli;
      continue;
    }
    if (c === '"') { tirnakIcinde = true; oncekiKacisli = false; continue; }
    if (c === "{") derinlik++;
    else if (c === "}") {
      derinlik--;
      if (derinlik === 0) return i;
    }
  }
  return -1; // dengelenmemis - bozuk JSON, cagiran taraf JSON.parse hatasiyla yakalayacak
}

// Tek, paylasilan JSON ayiklayici - tum icerik uretim route'lari buradan
// okumali. AI cevabindan markdown isaretlerini temizler, ilk {'den PARANTEZ
// DENGESININ gercekten kapandigi noktaya kadar olan kismi alir (ekstra
// metin varsa yok sayilir), kontrol karakterlerini guvenli hale getirir,
// BILINEN mojibake ciftlerini onarir (belirsiz/eksik olanlari OLDUGU GIBI birakir).
export function jsonAyikla(cevap) {
  const temiz = cevap.replace(/```json|```/g, "").trim();
  const baslangic = temiz.indexOf("{");
  const bitis = baslangic === -1 ? -1 : jsonGercekBitisiniBul(temiz, baslangic);
  const hamJson = bitis === -1
    ? temiz.slice(baslangic, temiz.lastIndexOf("}") + 1) // eski davranisa duser (dengelenemediyse)
    : temiz.slice(baslangic, bitis + 1);
  const guvenliJson = stringIcindekiKontrolKarakterleriKaciscala(hamJson);
  const onarilmisJson = bilinenMojibakeyiOnar(guvenliJson);
  return JSON.parse(onarilmisJson);
}
