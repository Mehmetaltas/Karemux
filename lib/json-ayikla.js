// Karemux JSON Ayiklama - TEK, PAYLASILAN yardimci (18 Eylul).
// AI saglayicilari (ozellikle Groq) bazen JSON string ICINDE kacissiz
// (ham) kontrol karakteri (satir sonu/tab) dondurebiliyor - bu, standart
// JSON.parse'i "Bad control character in string literal" hatasiyla
// cokertiyor. Bu fonksiyon, SADECE tirnak icindeki (string literal)
// kontrol karakterlerini kacisli hale cevirir - yapisal bosluklar
// (objeler arasindaki bicim amacli satir sonlari) DOKUNULMAZ birakilir.
function stringIcindekiKontrolKarakterleriKaciscala(metin) {
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

// Tek, paylasilan JSON ayiklayici - tum icerik uretim route'lari buradan
// okumali. AI cevabindan markdown isaretlerini temizler, ilk {'den son
// }'a kadar olan kismi alir, kontrol karakterlerini guvenli hale getirir.
export function jsonAyikla(cevap) {
  const temiz = cevap.replace(/```json|```/g, "").trim();
  const hamJson = temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1);
  const guvenliJson = stringIcindekiKontrolKarakterleriKaciscala(hamJson);
  return JSON.parse(guvenliJson);
}
