// Faz E - SINAV OTURUMU: deneme / yazili sinavlarinin SUNUCU TARAFINDA uretimi.
// Eskiden istem (prompt) tarayicida kuruluyor, genel /api/claude uzerinden uretiliyor
// ve cevap anahtari tarayicida kaliyordu. Artik istem burada kurulur, cevap anahtari
// sunucuda saklanir, puanlama lib/puanlama.js ile yapilir.
import { sql } from "@/lib/db";
import { stringIcindekiKontrolKarakterleriKaciscala, bilinenMojibakeyiOnar } from "@/lib/json-ayikla";

// --- AI cevabi ayiklama (app/page.js'teki jsonMetniTemizle + soruJsonAyikla'nin sunucu kopyasi,
// davranis ayni: kesilmis diziyi son tam soruya kadar kurtarir) ---
export function jsonMetniTemizle(cevap, { dilFiltresi = false, parantezTemizle = false } = {}) {
  let t = cevap.replace(/```json|```/g, "");
  if (dilFiltresi) t = t.replace(/[一-鿿؀-ۿЀ-ӿऀ-ॿ฀-๿֐-׿]+/g, "");
  if (parantezTemizle) t = t.replace(/\s*\(\d{1,4}\)\s*/g, " ");
  t = t.trim();
  t = stringIcindekiKontrolKarakterleriKaciscala(t);
  t = bilinenMojibakeyiOnar(t);
  return t;
}

export function soruJsonAyikla(temizMetin) {
  const ankor = temizMetin.indexOf('"soru"');
  let baslangic = ankor !== -1 ? temizMetin.lastIndexOf("[", ankor) : temizMetin.indexOf("[");
  if (baslangic === -1) baslangic = temizMetin.indexOf("[{");
  if (baslangic === -1) throw new Error("AI gecerli bir soru listesi dondurmedi, tekrar dene");

  const sonAnkor = temizMetin.lastIndexOf('"dogruIndex"');
  let bitis = sonAnkor !== -1 ? temizMetin.indexOf("]", sonAnkor) : temizMetin.lastIndexOf("]");
  if (bitis === -1) bitis = temizMetin.lastIndexOf("]");

  const dene = (metin) => { try { return JSON.parse(metin); } catch (e) { return null; } };
  let sonuc = bitis !== -1 ? dene(temizMetin.slice(baslangic, bitis + 1)) : null;
  if (!sonuc) {
    const govde = temizMetin.slice(baslangic);
    const sonTamObjeSonu = govde.lastIndexOf("}");
    if (sonTamObjeSonu !== -1) sonuc = dene(govde.slice(0, sonTamObjeSonu + 1) + "]");
  }
  if (!Array.isArray(sonuc)) throw new Error("AI gecerli bir soru listesi dondurmedi, tekrar dene");
  return sonuc;
}

// Sinav sorusu icin kesin bicim: tam 4 secenek ve 0-3 arasi dogru indeks
// (haftalik tutarlilik denetimi de soru_bankasi'nda tam bunu arar).
export function sinavSorusuGecerliMi(s) {
  return !!s && typeof s === "object"
    && typeof s.soru === "string" && s.soru.trim().length > 0
    && Array.isArray(s.secenekler) && s.secenekler.length === 4
    && s.secenekler.every((x) => typeof x === "string" && x.trim().length > 0)
    && Number.isInteger(s.dogruIndex) && s.dogruIndex >= 0 && s.dogruIndex <= 3;
}

const YAZILI_ETIKETLERI = { yazili1: "1. Yazili", yazili2: "2. Yazili", yazili3: "3. Yazili" };

export function sinavPromptuOlustur({ ders, sinif, sinavTuru, yaziliDonemNo, kapsamAciklama, adet, toplam, partiNo, soruTalimati }) {
  const baslikMetni = sinavTuru === "yazili"
    ? `okul donem ici YAZILI SINAVI formatinda (sinirli kapsamli, ${YAZILI_ETIKETLERI[yaziliDonemNo] || ""})`
    : "gercek LGS DENEME SINAVI formatinda";
  const kolay = Math.round(adet * 0.2), orta = Math.round(adet * 0.55), zor = Math.max(0, adet - kolay - orta);
  const adetMetni = toplam > adet
    ? `bu parti icin TAM ${adet} soru olsun (${partiNo + 1}. parti, farkli ornekler/sayilar kullan, onceki partilerle AYNI soruyu tekrar etme)`
    : `toplam ${adet} soru olsun`;
  return `Sen bir LGS/ortaokul olcme-degerlendirme uzmanisin. "${ders}" dersi icin ${baslikMetni} hazirla, ${sinif}. sinif seviyesinde, ${adetMetni}. ${kapsamAciklama} Sorulari, 2022-2026 yillari arasindaki gercek sinavlarin soru tarzina, uslubuna ve zorluk seviyesine birebir benzet - ama sorularin kendisi ozgun olsun, gercek gecmis sorulari birebir kopyalama ya da "gecmis yil cikti" diye sunma. 2026 LGS onceki yillara gore belirgin sekilde daha zor ve secici geldi (uzmanlar hemfikir) - sorulari buna gore kalibre et: ezber bilgiden cok dikkat, zaman yonetimi, yorumlama ve strateji gerektiren sorular olsun, Turkce'de uzun paragraflar/celdiriciler, Matematik'te islem degil dikkat ve mantik agirlikli sorular kullan. Zorluk dagilimi GERCEK 2026 LGS oranina yakin olsun: soru sayisinin yaklasik %20'si kolay, %55'i orta, %25'i zor olsun (orn. ${adet} soruda ~${kolay} kolay, ~${orta} orta, ~${zor} zor). ${soruTalimati} Her sorunun hangi ALT KONUYU/KAZANIMI olctugunu 2-4 kelimeyle "altKonu" alaninda belirt (orn. "Asal Carpanlar", "EBOB Hesabi" gibi kisa ve spesifik). Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle, dogru ve tutarli bir sekilde anlat. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan. SADECE JSON dondur, baska hicbir aciklama ekleme:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","altKonu":"...","aciklama":"...","beceri":"soru hangi beceriyi olcuyor (orn. islem becerisi, yorumlama, uygulama - kisa 2-4 kelime)","tahminiSureSaniye":45,"yayginHata":"ogrencilerin bu tarz soruda en sik yaptigi hata (kisa, 1 cumle)","cozumTeknigi":"bu soruyu hizli cozmenin pratik teknigi (kisa, 1 cumle)"}]`;
}

// Ders Tekrari testi (onceki sinifin temel konulari) istemi - eskiden tarayicida kuruluyordu.
export function dersTekrarPromptuOlustur({ ders, sinif, adet, toplam, partiNo, soruTalimati }) {
  const adetMetni = toplam > adet
    ? `TAM ${adet} soru (bu ${partiNo + 1}. parti; onceki partilerle AYNI soruyu tekrar etme)`
    : `${adet} soru`;
  return `Sen "${ders}" dersi ogretmenisin. ${sinif}. sinif "${ders}" mufredatinin temel konularindan ${adetMetni} coktan secmeli soru hazirla. ${soruTalimati} ONEMLI: Her soruyu yazdiktan sonra HESABI KENDIN ADIM ADIM COZ ve dogruIndex'in GERCEKTEN dogru oldugundan emin ol - matematiksel hata yapma, cevaplar arasinda celiski olmasin. Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle, DOGRU VE TUTARLI bir sekilde anlat (ogrenci yanlis yaparsa bunu okuyup ogrensin). SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma. HER SORUDA MUTLAKA "secenekler" alaninda TAM 4 secenek (A,B,C,D) olsun:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","aciklama":"...","beceri":"soru hangi beceriyi olcuyor (orn. islem becerisi, yorumlama, uygulama - kisa 2-4 kelime)","tahminiSureSaniye":45,"yayginHata":"ogrencilerin bu tarz soruda en sik yaptigi hata (kisa, 1 cumle)","cozumTeknigi":"bu soruyu hizli cozmenin pratik teknigi (kisa, 1 cumle)"}]`;
}

// GECEN YIL GENEL DEGERLENDIRME (bir kez): ogrenci simdi bir ust sinifa gecti, onceki sinifin
// temel konularini olcer. `sinif` = ONCEKI sinif.
export function gecenYilPromptuOlustur({ ders, sinif, adet, soruTalimati }) {
  return `Sen "${ders}" dersi olcme-degerlendirme uzmanisin. Ogrenci simdi bir ust sinifa gecti; ${sinif}. sinifi gercekten ogrenmis mi olcmemiz gerekiyor. ${sinif}. sinif "${ders}" mufredatinin GENEL VE TEMEL konularini kapsayan TAM ${adet} soruluk bir GENEL DEGERLENDIRME sinavi hazirla; sorular farkli konu basliklarina yayilsin, temel kavram anlayisini olcsun, kolaydan zora dogru sirali olsun. ${soruTalimati} ONEMLI: Her soruyu yazdiktan sonra HESABI KENDIN ADIM ADIM COZ ve dogruIndex'in GERCEKTEN dogru oldugundan emin ol - matematiksel hata yapma, cevaplar arasinda celiski olmasin. Her soru icin "aciklama" alaninda, dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle, DOGRU VE TUTARLI bir sekilde anlat. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c, I) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma. HER SORUDA MUTLAKA "secenekler" alaninda TAM 4 secenek (A,B,C,D) olsun:
[{"altKonu":"sorunun konu basligi (kisa)","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","aciklama":"...","beceri":"soru hangi beceriyi olcuyor (orn. islem becerisi, yorumlama, uygulama - kisa 2-4 kelime)","tahminiSureSaniye":45,"yayginHata":"ogrencilerin bu tarz soruda en sik yaptigi hata (kisa, 1 cumle)","cozumTeknigi":"bu soruyu hizli cozmenin pratik teknigi (kisa, 1 cumle)"}]`;
}

// DERS SEVIYE TESPITI: dersin TUM unitelerine yayilan seviye belirleme sinavi.
export function dersSeviyePromptuOlustur({ ders, sinif, adet, uniteler, soruTalimati }) {
  const uniteListesi = uniteler.length ? `Bu dersin uniteleri: ${uniteler.join(", ")}. Her uniteden en az 1 soru gelsin (soru sayisi yetiyorsa), tum unitelere yayilsin; "unite" alaninda YUKARIDAKI LISTEDEN birini AYNEN yaz.` : "";
  return `Sen bir "${ders}" dersi olcme-degerlendirme uzmanisin. Bu dersin TAMAMINA yayilan, ogrencinin genel seviyesini olcen TAM ${adet} soruluk bir SEVIYE BELIRLEME sinavi hazirla, ${sinif}. sinif seviyesinde. ${uniteListesi} Her sorunun hangi uniteden oldugunu "unite" alaninda, hangi alt konuyu olctugunu "altKonu" alaninda belirt. Sorular kolaydan zora dogru sirali olsun, mantik yurutme gerektirsin. ${soruTalimati} ONEMLI: Her soruyu yazdiktan sonra HESABI KENDIN ADIM ADIM COZ ve dogruIndex'in GERCEKTEN dogru oldugundan emin ol. Her soru icin "aciklama" alaninda dogru cevabin NEDEN dogru oldugunu 1-2 cumleyle anlat. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali, baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri DOGRU ve EKSIKSIZ kullan. HER SORUDA MUTLAKA "secenekler" alaninda TAM 4 secenek (A,B,C,D) olsun:
[{"unite":"...","altKonu":"...","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","aciklama":"...","beceri":"soru hangi beceriyi olcuyor (orn. islem becerisi, yorumlama, uygulama - kisa 2-4 kelime)","tahminiSureSaniye":45,"yayginHata":"ogrencilerin bu tarz soruda en sik yaptigi hata (kisa, 1 cumle)","cozumTeknigi":"bu soruyu hizli cozmenin pratik teknigi (kisa, 1 cumle)"}]`;
}

// AI'nin yazdigi unite adini resmi unite listesindeki ada esler (tam esitlik, sonra icerme); bulamazsa "Genel".
export function uniteEsle(ham, uniteler) {
  const n = (x) => String(x || "").trim().toLowerCase();
  const h = n(ham);
  if (!h) return "Genel";
  const tam = uniteler.find((u) => n(u) === h);
  if (tam) return tam;
  const kismi = uniteler.find((u) => n(u).includes(h) || h.includes(n(u)));
  return kismi || "Genel";
}

// Tarayiciya giden bicim: cevap anahtari, aciklama ve cozum ipuclari YOK.
export function istemciSorusu(s) {
  return { soru: s.soru, secenekler: s.secenekler, zorluk: s.zorluk || null, altKonu: s.altKonu || null, unite: s.unite || null };
}

// Denetimden gecen sorulari kalici soru bankasina arsivler (eskiden istemci
// /api/soru-bankasi'na gonderiyordu). Hata olsa da sinavi bozmaz.
export async function soruBankasinaArsivle(ders, sinif, unite, sorular, kaynakTuru) {
  for (const s of sorular) {
    try {
      await sql`
        INSERT INTO soru_bankasi (ders, sinif, unite, alt_konu, zorluk, soru, secenekler, dogru_index, kaynak_turu, aciklama, beceri, tahmini_sure_saniye, yaygin_hata, cozum_teknigi)
        VALUES (${ders}, ${sinif || null}, ${unite || null}, ${s.altKonu || null}, ${s.zorluk || null}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, ${kaynakTuru || null}, ${s.aciklama || null}, ${s.beceri || null}, ${Number.isInteger(s.tahminiSureSaniye) ? s.tahminiSureSaniye : null}, ${s.yayginHata || null}, ${s.cozumTeknigi || null})
      `;
    } catch (e) {
      console.error("Soru bankasina kayit hatasi:", e.message);
    }
  }
}
