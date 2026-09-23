import { aiCagir } from "@/lib/ai";
import { gorselUret } from "@/lib/gorsel-motoru";

// Gorsel Motoru - Sunucu Tarafi Paylasilan Karar Fonksiyonu (23 Eylul).
// Onceden materyal-uret'te tek basina duran mantik, konu-paketi ve
// ders-plani-uret'in de aynisini kullanabilmesi icin buraya tasindi -
// AI SADECE tip+parametre seciyor, gercek cizimi lib/gorsel-motoru.js yapiyor.
const GORSEL_TIPI_REHBERI = `Eger bu materyal icin bir egitim gorseli GERCEKTEN faydali olacaksa (ozellikle geometri/grafik/sema iceren konularda), su tiplerden birini sec ve parametrelerini doldur:
- ucgen: {a,b,c (kenar uzunluklari sayi, opsiyonel), kenarEtiketleri:{ab,bc,ac (string)}, aciEtiketleri:{a,b,c}, vurgulananKose:"A"|"B"|"C"}
- dortgen: {tip:"kare"|"dikdortgen", kenarEtiketleri:{ust,sol}}
- cember: {yaricapEtiketi (string), capGoster (bool)}
- aci: {derece (0-360 sayi), etiket (string)}
- cokgen: {kenarSayisi (sayi), etiket (string)}
- sayi_dogrusu: {min,max (sayi), noktalar:[{deger (sayi), etiket, doluMu (bool)}]}
- koordinat_duzlemi: {fonksiyonTipi:"dogrusal"|"karesel", katsayilar:{m,n} veya {a,b,c}, noktalar:[{x,y,etiket}]}
- cizgi_grafigi veya sutun_grafigi: {veriler:[sayilar], etiketler:[string]}
- pasta_grafigi: {veriler:[sayilar], etiketler:[string]}
- fen_semasi: {anahtar:"su_dongusu"|"gunes_sistemi"|"elektrik_devresi"|"hucre_yapisi"|"sindirim_sistemi"}
Gorsel gerekmiyorsa gerekli:false don. SADECE JSON dondur: {"gerekli":true veya false,"gorselTipi":"...","parametreler":{...}}`;

export async function gorselKararIsteSunucu(ders, konu, sinif) {
  try {
    const p = `"${ders}" dersinden "${konu}" konusu, ${sinif}. sinif seviyesinde. ${GORSEL_TIPI_REHBERI}`;
    // Kisa butce (12sn) - bu opsiyonel/best-effort bir zenginlestirme, ana
    // uretimin ustune eklenip toplam sureyi 60sn siniri ustune cikarmamali.
    const cevap = await aiCagir({ prompt: p, maxTokens: 600, jsonModu: true, tur: "gorsel_karar" }, 12000);
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const baslangic = temiz.indexOf("{");
    const bitis = temiz.lastIndexOf("}");
    if (baslangic === -1 || bitis === -1) return null;
    const karar = JSON.parse(temiz.slice(baslangic, bitis + 1));
    if (!karar.gerekli || !karar.gorselTipi) return null;
    return gorselUret(karar.gorselTipi, karar.parametreler || {});
  } catch (e) {
    return null;
  }
}
