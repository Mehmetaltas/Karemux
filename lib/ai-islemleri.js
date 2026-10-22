// Faz 2 (21 Ekim): TUM yapay zeka istekleri artik prompt'u SUNUCUDA kurar.
// Istemci yalniz islem kodu + yapisal parametre gonderir (/api/ai-islem); serbest prompt GONDEREMEZ.
// Bu, genel bir "ucretsiz yapay zeka vekili" olarak kotuye kullanimi ve ucretli ozelliklerin
// prompt yeniden yazilarak atlatilmasini kapatir. Prompt metinleri istemcideki eski halinden
// BIREBIR alinmistir (davranis degismedi); degisen sey prompt'u KIMIN kurdugu.
import { MUFREDAT, MUFREDAT_DIGER_SINIFLAR } from "@/lib/mufredat-veri";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { BAGLAM_TEMELLI_SORU_TALIMATI } from "@/lib/soru-talimati-sunucu";
import { dilKurali } from "@/lib/dil-kurali";

const GORSEL_TIPI_REHBERI = `Eger bu konu icin bir egitim gorseli GERCEKTEN faydali olacaksa (ozellikle geometri/grafik/sema iceren konularda), su tiplerden birini sec ve parametrelerini doldur:
- ucgen: {a,b,c (kenar uzunluklari sayi, opsiyonel), kenarEtiketleri:{ab,bc,ac (string, orn "5 cm")}, aciEtiketleri:{a,b,c}, vurgulananKose:"A"|"B"|"C"}
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

const DERS_ADLARI = ["Matematik", "Fen Bilimleri", "Turkce", "T.C. Inkilap Tarihi", "Sosyal Bilgiler", "Din Kulturu", "Ingilizce"];
const PARAGRAF_TURLERI = ["Ana Fikir Bulma", "Yardımcı Fikir Bulma", "Başlık Bulma", "Paragraf Tamamlama", "Paragrafı İkiye Bölme", "Düşünceyi Geliştirme Yolları", "Anlatım Biçimleri", "Grafik ve Tablo Yorumlama"];

function gorunurDersler(sinifNo) {
  if (sinifNo === 8) return DERS_ADLARI.filter((d) => d !== "Sosyal Bilgiler");
  return DERS_ADLARI.filter((d) => d !== "T.C. Inkilap Tarihi");
}
function dersinUniteleri(dersAdi, sinifNo) {
  return MUFREDAT_DIGER_SINIFLAR[`${sinifNo}::${dersAdi}`] || MUFREDAT[dersAdi] || [];
}

// --- girdi dogrulayicilar: serbest metin KISA, tek satir, kontrol karakteri yok ---
class GirdiHatasi extends Error {}
function kisa(v, ad, max = 160) {
  if (typeof v !== "string") throw new GirdiHatasi(`${ad} gecersiz`);
  const t = Array.from(v, (c) => { const k = c.charCodeAt(0); return k < 32 || k === 127 || c === "`" ? " " : c; }).join("").replace(/\s+/g, " ").trim();
  if (!t || t.length > max) throw new GirdiHatasi(`${ad} gecersiz`);
  return t;
}
function uzun(v, ad, max) {
  if (typeof v !== "string") throw new GirdiHatasi(`${ad} gecersiz`);
  const t = Array.from(v, (c) => { const k = c.charCodeAt(0); return (k < 32 && k !== 9 && k !== 10 && k !== 13) || k === 127 ? "" : c; }).join("").trim();
  if (!t || t.length > max) throw new GirdiHatasi(`${ad} gecersiz`);
  return t;
}
function secim(v, liste, ad) {
  if (!liste.includes(v)) throw new GirdiHatasi(`${ad} gecersiz`);
  return v;
}
function sayi(v, ad, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new GirdiHatasi(`${ad} gecersiz`);
  return n;
}
function tamsayi(v, ad, min, max) {
  const n = sayi(v, ad, min, max);
  if (!Number.isInteger(n)) throw new GirdiHatasi(`${ad} gecersiz`);
  return n;
}
const sinifOku = (g) => tamsayi(g.sinif, "sinif", 4, 8);
const dersOku = (v, ad = "ders") => secim(v, DERS_ADLARI, ad);

export const AI_ISLEMLERI = {
  gorsel_karar: {
    maxTokens: () => 600, jsonModu: true, tur: "gorsel_karar",
    hazirla(g) {
      const ders = kisa(g.ders, "ders", 60), konu = kisa(g.konu, "konu", 160), sinif = sinifOku(g);
      return { prompt: `"${ders}" dersinden "${konu}" konusu, ${sinif}. sinif seviyesinde. ${GORSEL_TIPI_REHBERI}` };
    },
  },
  icerik_denetle: {
    maxTokens: () => 300, jsonModu: true,
    hazirla(g) {
      const baglam = kisa(g.baglam, "baglam", 240);
      const metin = uzun(g.metin, "metin", 12000);
      return { prompt: `Sen bagimsiz bir egitim icerigi kalite kontrolorusun. ${baglam} Asagidaki metni incele: acik bir bilgi/mantik hatasi var mi, ya da Turkce disi bir dil/alfabe (Ingilizce kelime, Kiril, Cince vb.) karismis mi? SADECE JSON dondur: {"temizMi":true} ya da {"temizMi":false,"sorun":"kisa aciklama, en fazla 15 kelime"}

METIN:
${metin.slice(0, 3000)}` };
    },
  },
  soru_aciklama: {
    maxTokens: () => 500,
    hazirla(g) {
      const soru = uzun(g.soru, "soru", 1500);
      if (!Array.isArray(g.secenekler) || g.secenekler.length < 2 || g.secenekler.length > 6) throw new GirdiHatasi("secenekler gecersiz");
      const secenekler = g.secenekler.map((s) => uzun(String(s), "secenek", 400));
      const dogruIndex = tamsayi(g.dogruIndex, "dogruIndex", 0, secenekler.length - 1);
      const secilenIndex = g.secilenIndex === null || g.secilenIndex === undefined ? null : tamsayi(g.secilenIndex, "secilenIndex", 0, secenekler.length - 1);
      return { prompt: `Bir ogrenci su coktan secmeli soruyu yanlis cevapladi:
Soru: ${soru}
Secenekler: ${secenekler.join(" | ")}
Ogrencinin verdigi cevap: ${(secilenIndex === null ? undefined : secenekler[secilenIndex]) || "bos birakildi"}
Dogru cevap: ${secenekler[dogruIndex]}
Ogrenciye, dogru cevabin NEDEN dogru oldugunu ve ogrencinin verdigi cevabin NEDEN yanlis oldugunu, kisa (60-90 kelime), net ve ogretici bir dille acikla. SADECE Turkce yaz; yalniz soru veya seceneklerden yapilan ALINTILAR ile Ingilizce dersindeki Ingilizce ornek cumleler kendi dilinde kalabilir, baska hicbir yerde baska dilden TEK KELIME bile kullanma. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma. Markdown kullanma, sadece duz metin.` };
    },
  },
  ders_tekrar: {
    maxTokens: (p) => (p.tur >= 2 ? 4200 : 3000),
    hazirla(g) {
      const dersAdi = dersOku(g.dersAdi, "dersAdi"), sinif = sinifOku(g);
      const oncekiSinif = Math.max(1, sinif - 1);
      const tur = tamsayi(g.tur, "tur", 1, 9);
      const prompt = tur >= 2
        ? `Sen deneyimli, alaninda uzman bir "${dersAdi}" ogretmenisin. Ogrenciye ${oncekiSinif}. sinif "${dersAdi}" temel konularini DAHA ONCE bir kez anlattin ama ogrenci testte basarili olamadi - yani ilk anlatim yeterli gelmedi. Bu sefer FARKLI BIR YAKLASIMLA anlat: farkli, gunluk hayattan daha somut ornekler kullan, kavramlari daha yavas ve adim adim ac, olasi kafa karistirici noktalari ONCEDEN tahmin edip aciklayarak onle. Her alt kavram icin "Ornek:" diye etiketlenmis en az bir somut ornek coz. Bu, DAHA DETAYLI ve DAHA DERINLEMESINE bir anlatim olmali. En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle. Toplamda 550-650 kelime. SADECE duz metin yaz, markdown/LaTeX kullanma. ${dilKurali(dersAdi, "SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma")}. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma.`
        : `Sen deneyimli, alaninda uzman bir "${dersAdi}" ogretmenisin. Ogrencinin ${oncekiSinif}. sinif temeli zayif cikti, once bunu guclendirmemiz gerekiyor. ${oncekiSinif}. sinif "${dersAdi}" mufredatinin EN TEMEL ve EN ONEMLI kavramlarini, sade ve anlasilir bir dille anlat - once tanim, sonra "Ornek:" diye etiketlenmis somut ornek, gerekirse formul/kural. Konu basliklarina ayirarak yaz. En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle. Toplamda 350-450 kelime. SADECE duz metin yaz, markdown/LaTeX kullanma. ${dilKurali(dersAdi, "SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma")}. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma.`;
      return { prompt, tur };
    },
  },
  onerili_unite: {
    maxTokens: (p) => p.maxTokens, ragDersi: (p) => p.ragDersi,
    hazirla(g) {
      const secilenDers = dersOku(g.secilenDers, "secilenDers"), sinif = sinifOku(g);
      const unite = kisa(g.unite, "unite", 160);
      const zorlukMetni = { basit: "cok basit ve yavas", orta: "orta seviyede", zor: "ileri seviyede" }[g.zorlukSec] || "orta seviyede";
      const altBasliklar = Array.isArray(g.manuelAltBaslik) ? g.manuelAltBaslik.slice(0, 12).map((s) => kisa(s, "altBaslik", 120)) : [];
      const temelUyarisi = g.gecenYilZayif === true
        ? ` ONEMLI: Bu ogrencinin bir onceki sinif temeli zayif olcyuldu, bu yuzden konuya girmeden once cok kisa (1-2 cumle) bir "on bilgi hatirlatmasi" ekle, temel kavramlari atlamadan anlat.`
        : "";
      const kapsamSiniri = altBasliklar.length > 0
        ? ` SADECE su alt basliklara odaklan: ${altBasliklar.join(", ")}. Unitenin diger alt basliklarina girme.`
        : "";
      const altBaslikEkSayisi = Math.max(0, (altBasliklar.length || 1) - 1);
      return { prompt: `Sen deneyimli, alaninda uzman bir "${secilenDers}" ogretmenisin. "${unite}" unitesinin TAMAMINI, ${sinif}. sinifta okuyan bir ogrenciye ${zorlukMetni} ama PROFESYONEL ve KALITELI bir dille, piyasadaki en iyi LGS yayinlarindan daha derin ve daha kullanisli bir sekilde anlat.${temelUyarisi}${kapsamSiniri} SESIN COK ONEMLI - SU KURALA KESINLIKLE UY: Yazdigin HER CUMLE, gercek bir ogretmenin sinifta veya ozel derste, karsisindaki tek bir ogrenciye soyleyecegi CUMLE gibi olmali. Ornek FARK: "Once toplam ogrenci sayisi 24'tur. En az bir ders alanlar = 10+12-6=16." gibi SOGUK/DERS KITABI cumleleri KESINLIKLE YAZMA. Onun yerine: "Bak, once elimizdeki toplam sayiya bakalim: 24 ogrenci var. Simdi 'en az bir ders alan' kac kisi, onu bulalim..." gibi, KONUSUR gibi yaz. Her 2-3 cumlede bir "bak", "simdi", "dikkat et", "iste burada" gibi bir hitap MUTLAKA olsun. Cumleler kisa olsun (ortalama 8-12 kelime), art arda uzun/resmi cumleler yazma. ONEMLI: Konuyu OLDUGUNDAN KOLAY GOSTERME - piyasadaki bircok kaynak bu hatayi yapiyor ve gercek sinavda ogrenciler zorlaniyor. Gercek LGS sorularindaki zorluk seviyesini yansitacak derinlikte anlat, yuzeysel gecme. Anlatimi ASAGIDAKI 6 BASLIK ALTINDA yaz - HER BASLIK BUYUK HARFLERLE, KENDI SATIRINDA, BASKA HICBIR KELIME OLMADAN yazilmali: HIZLI OGREN (2-3 cumlelik cok kisa ozet, ana fikri 30 saniyede yakalatir), TEMEL ANLATIM (konunun temel mantigi, ana kavramlar, TANIM+SOMUT ORNEK ile, 150-200 kelime), DERIN ANLATIM (konunun NEDEN ve NASIL calistigi, daha derin bakisla, birden fazla cozum yontemi varsa dahil et, 200-250 kelime), PUF NOKTALARI (sinavda zaman kazandiran 3-4 pratik kisayol/teknik, her biri "- " ile baslayan ayri satir), SIK YAPILAN HATALAR (ogrencilerin bu konuda sik yaptigi 3-4 hata, her biri "- " ile baslayan ayri satir), YENI NESIL UYGULAMA (bu bilgiyi gercek bir yeni nesil LGS tarzi problemde nasil kullanacagini gosteren somut bir ornek, 120-150 kelime). SADECE bu 6 baslik ve icerikleriyle yaz, baska hicbir aciklama/giris cumlesi ekleme, markdown kullanma. Matematik ifadelerini normal klavye karakterleriyle yaz (orn. "kok 12", "3 uzeri 2"). ${dilKurali(secilenDers, "SADECE Turkce yaz, baska dilden TEK KELIME bile kullanma")}. Turkce'ye ozgu noktali/simgeli karakterleri (i, g, u, s, o, c harflerinin ozel hallerini) DOGRU ve EKSIKSIZ kullan, ASCII'ye sadelestirilmis yazma.`, maxTokens: 5500 + altBaslikEkSayisi * 1200, ragDersi: secilenDers };
    },
  },
  alt_konu: {
    maxTokens: () => 500, jsonModu: true,
    hazirla(g) {
      const dersAdi = dersOku(g.dersAdi, "dersAdi"), uniteAdi = kisa(g.uniteAdi, "uniteAdi", 160);
      return { prompt: `Sen bir LGS/ortaokul ogretmenisin. "${dersAdi}" dersinin "${uniteAdi}" unitesini, ogrencinin sirayla calisabilecegi 4-6 kisa ALT KONU basligina bol (orn. "Asal Carpanlar", "EBOB Hesabi" gibi kisa, 2-4 kelimelik basliklar). Bu senin onerdigin bir calisma sirasi olsun, MEB'in resmi bir listesi oldugunu iddia etme. SADECE JSON dizisi dondur, baska hicbir aciklama ekleme, markdown kullanma:
["Alt Konu 1","Alt Konu 2","Alt Konu 3"]` };
    },
  },
  kelime_karti: {
    maxTokens: () => 1800, jsonModu: true,
    hazirla(g) {
      const kelimeKartiDers = secim(g.kelimeKartiDers, ["Ingilizce", "Turkce"], "kelimeKartiDers");
      const kelimeKartiUnite = kelimeKartiDers === "Ingilizce" ? kisa(g.kelimeKartiUnite, "kelimeKartiUnite", 160) : "";
      const sinif = sinifOku(g);
      const prompt = kelimeKartiDers === "Ingilizce"
        ? `Sen Ingilizce ogretmenisin. "${kelimeKartiUnite}" konusuyla ilgili, ${sinif}. sinif seviyesine uygun 10 Ingilizce kelime karti hazirla. Kalite referansi: Milestone Ingilizce LGS Denemesi (Levent Cilek, TEAM ELT Publishing) ve Marka Yayinlari LGS Ingilizce Deneme serisi tarzinda - LGS formatina uygun, dengeli kelime secimi. Her kart icin: Ingilizce kelime, Turkce anlami, ve o kelimeyi kullanan BASIT bir Ingilizce ornek cumle (parantez icinde Turkce cevirisiyle). SADECE JSON dondur, markdown kullanma:
[{"kelime":"...","anlam":"...","ornekCumle":"... (Turkce ceviri)"}]`
        : `Sen Turkce ogretmenisin. ${sinif}. sinif seviyesine uygun, ogrencilerin kelime hazinesini zenginlestirecek 10 Turkce kelime (az bilinen ama seviyeye uygun, edebi metinlerde/LGS'de karsilarina cikabilecek kelimeler) hazirla. Kalite referansi: ${KALITE_REFERANSLARI["Turkce"]} Her kart icin: kelime, kisa ve net anlami, ve o kelimeyi kullanan bir ornek cumle. SADECE JSON dondur, markdown kullanma:
[{"kelime":"...","anlam":"...","ornekCumle":"..."}]`;
      return { prompt };
    },
  },
  seviye_konu: {
    maxTokens: () => 2500,
    hazirla(g) {
      const u = { ders: dersOku(g.ders), unite: kisa(g.unite, "unite", 160), kaynak_sinif: tamsayi(g.kaynak_sinif, "kaynak_sinif", 1, 8) };
      return { prompt: `Sen deneyimli bir "${u.ders}" ogretmenisin. "${u.unite}" konusunu, ${u.kaynak_sinif}. sinif seviyesinde bir ogrenciye, MEB mufredati kazanimlarina sadik kalarak, sade ve anlasilir bir dille anlat. Once kisa bir giris, sonra ana kavramlar (her biri icin tanim, somut bir gunluk hayat ornegi ve kisa bir cozumlu ornek), sonda 3 maddelik "dikkat edilecek noktalar / sik yapilan hatalar". Toplam 450-600 kelime, konuyu yuzeysel gecme, gercek bir ders anlatimi kadar derinlikli olsun. SADECE duz metin yaz, markdown/LaTeX kullanma. ${dilKurali(u.ders, "Tum metin SADECE Turkce olmali, Latin alfabesi disinda (Kiril, Cince, Arapca vb.) TEK BIR karakter bile kullanma, Ingilizce/Almanca/Fransizca/Ispanyolca gibi bati dillerinden de TEK KELIME bile kullanma")}.` };
    },
  },
  paragraf: {
    maxTokens: () => 1800, jsonModu: true,
    hazirla(g) {
      const sinif = sinifOku(g);
      const paragrafTuru = secim(g.paragrafTuru, PARAGRAF_TURLERI, "paragrafTuru");
      const zorlukMetni = { kolay: "kisa ve net, temel seviyede", orta: "orta uzunlukta, LGS standart zorlukta", zor: "uzun, cok katmanli, ust duzey dusunme gerektiren (LGS'nin en zor sorulari tarzinda)" }[g.paragrafZorluk];
      if (!zorlukMetni) throw new GirdiHatasi("paragrafZorluk gecersiz");
      return { prompt: `Sen bir Turkce ogretmenisin ve LGS paragraf sorulari konusunda uzmansin. ${sinif}. sinif seviyesinde, "${paragrafTuru}" turunde, ${zorlukMetni} BIR paragraf sorusu hazirla. ${BAGLAM_TEMELLI_SORU_TALIMATI} Kalite referansi: ${KALITE_REFERANSLARI["Turkce"]} Paragraf gercek bir LGS paragrafi kalitesinde olsun - 100-180 kelime arasi, akici, gercek bir konu (bilim, sanat, tarih, gunluk hayat, cevre vb.) hakkinda olsun, yapay/bosluk doldurma hissi vermesin. Celdiriciler ozellikle bu paragraf turune ozgu tipik hatalari yansitsin (orn. Ana Fikir sorusunda "dogru ama paragrafin butununu kapsamayan" bir secenegi celdirici olarak kullan). SADECE JSON dondur, markdown kullanma:
{"paragraf":"...","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"...","beceri":"soru hangi beceriyi olcuyor (orn. islem becerisi, yorumlama, uygulama - kisa 2-4 kelime)","tahminiSureSaniye":45,"yayginHata":"ogrencilerin bu tarz soruda en sik yaptigi hata (kisa, 1 cumle)","cozumTeknigi":"bu soruyu hizli cozmenin pratik teknigi (kisa, 1 cumle)"}` };
    },
  },
  formul: {
    maxTokens: () => 1800,
    hazirla(g) {
      const dersAdi = dersOku(g.dersAdi, "dersAdi"), uniteAdi = kisa(g.uniteAdi, "uniteAdi", 160), sinif = sinifOku(g);
      const kaliteMetniFormul = KALITE_REFERANSLARI[dersAdi] ? ` Kalite referansi: ${KALITE_REFERANSLARI[dersAdi]}` : "";
      return { prompt: `Sen "${dersAdi}" dersi ogretmenisin. "${uniteAdi}" unitesinin EN ONEMLI 8-10 formulunu/kuralini/sinavda-dikkat noktasini, ${sinif}. sinif seviyesinde, COK KISA bir "hizli bakis karti" formatinda listele.${kaliteMetniFormul} HER MADDE TEK SATIR ve EN FAZLA 12 KELIME olsun (formul + 2-4 kelimelik aciklama) - uzun cumle YASAK. SADECE Turkce yaz, markdown kullanma (yildiz vb.), her maddeyi yeni satirda '•' ile basla. Son maddeyi MUTLAKA tamamla, yarim birakma.` };
    },
  },
  karne: {
    maxTokens: () => 1600,
    hazirla(g) {
      if (!Array.isArray(g.ozet) || g.ozet.length === 0 || g.ozet.length > 12) throw new GirdiHatasi("ozet gecersiz");
      const ozet = g.ozet.map((o) => ({
        ders: kisa(o.ders, "ders", 80),
        testSayisi: tamsayi(o.testSayisi, "testSayisi", 1, 100000),
        ortalamaNet: sayi(o.ortalamaNet, "ortalamaNet", -1000, 1000).toFixed(1),
        sonNet: sayi(o.sonNet, "sonNet", -1000, 1000).toFixed(1),
      }));
      const veriMetni = ozet.map((o) => `${o.ders}: ${o.testSayisi} test, ortalama net ${o.ortalamaNet}, en son net ${o.sonNet}`).join("; ");
      return { prompt: `Sen bir egitim kocususun. Su gercek sinav verilerine dayanarak DERIN, KISISEL bir karne/durum degerlendirmesi yaz: ${veriMetni}. Su noktalara deg: (1) En guclu oldugu 1-2 dersi somut sayilarla ovun, (2) En cok destege ihtiyaci olan 1-2 dersi nazik ama net sekilde belirt, (3) Son sinav ile ortalamasini kiyaslayip bir trend yorumu yap (yukseliyor mu, sabit mi, dususte mi), (4) Somut, uygulanabilir 2-3 tavsiye ver. Sicak, samimi, gercekci bir mentor tonu kullan - ne asiri ovucu ne cesaret kirici ol. 250-320 kelime, SADECE Turkce duz metin, markdown kullanma. Turkce'ye ozgu noktali/simgeli karakterleri DOGRU ve EKSIKSIZ kullan.` };
    },
  },
  konu_anlat: {
    maxTokens: () => 3200,
    hazirla(g) {
      const ders = dersOku(g.ders), konu = kisa(g.konu, "konu", 160), sinif = sinifOku(g);
      const uniteSec = g.uniteSec ? kisa(g.uniteSec, "uniteSec", 160) : "";
      const uniteMetni = uniteSec ? ` (${uniteSec} unitesinden)` : "";
      const yasMetni = { 5: "10-11", 6: "11-12", 7: "12-13", 8: "13-14" }[sinif] || "13-14";
      const zorlukMetni = { basit: "cok basit ve yavas, temel seviyeden baslayarak", orta: "orta seviyede, ders kitabi diline uygun", zor: "ileri seviyede, LGS'de sik cikan zorlayici detaylara da deginerek" }[g.zorlukSec] || "orta seviyede, ders kitabi diline uygun";
      return { prompt: `Sen deneyimli, alaninda uzman bir "${ders}" ogretmenisin. "${konu}" konusunu${uniteMetni}, ${sinif}. sinifta okuyan ${yasMetni} yasindaki bir ogrenciye ${zorlukMetni} ama PROFESYONEL ve KALITELI bir dille, ozel ders yayinlarinin (MEB yayinlarindan daha ust seviye) kalitesinde anlat. SESIN COK ONEMLI - SU KURALA KESINLIKLE UY: Yazdigin HER CUMLE, gercek bir ogretmenin sinifta veya ozel derste, karsisindaki tek bir ogrenciye soyleyecegi CUMLE gibi olmali. Ornek FARK: "Once toplam ogrenci sayisi 24'tur. En az bir ders alanlar = 10+12-6=16." gibi SOGUK/DERS KITABI cumleleri KESINLIKLE YAZMA. Onun yerine: "Bak, once elimizdeki toplam sayiya bakalim: 24 ogrenci var. Simdi 'en az bir ders alan' kac kisi, onu bulalim..." gibi, KONUSUR gibi yaz. Her 2-3 cumlede bir "bak", "simdi", "dikkat et", "iste burada" gibi bir hitap MUTLAKA olsun. Cumleler kisa olsun (ortalama 8-12 kelime), art arda uzun/resmi cumleler yazma. ONEMLI: Konuyu OLDUGUNDAN KOLAY GOSTERME, gercek sinav zorlugunu yansit. AYNEN SU FORMATTA yaz (basliklari birebir kullan): once konunun tanimini ve neden onemli oldugunu 2-3 cumleyle ver. Sonra her alt kavram icin "Ornek:" diye etiketlenmis en az bir somut, sayisal ornek coz (adim adim). En sonda MUTLAKA "DIKKAT EDILECEK NOKTALAR" basligiyla, 2-4 maddelik ("- " ile baslayan) kisa bir liste ekle (sik yapilan hatalar, ipuclari). Toplamda 350-450 kelime. SADECE duz metin yaz: markdown (yildiz **, baslik #), LaTeX (dolar isareti $, \\sqrt, \\frac gibi komutlar) KULLANMA. Matematik ifadelerini normal klavye karakterleriyle yaz (ornek: "karekok 12", "3 uzeri 2", "1/2" gibi). ${dilKurali(ders, "SADECE Turkce yaz, Latin alfabesi disinda (Cince, Arapca, Kiril vb.) TEK BIR karakter bile kullanma. Ingilizce, Almanca, Fransizca, Portekizce, Ispanyolca gibi herhangi bir bati dilinden de TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan")}.` };
    },
  },
  plan: {
    maxTokens: () => 2200, jsonModu: true,
    hazirla(g) {
      const sinif = sinifOku(g);
      if (!Array.isArray(g.zayifDersler) || g.zayifDersler.length === 0 || g.zayifDersler.length > 7) throw new GirdiHatasi("zayifDersler gecersiz");
      const zayifDersler = g.zayifDersler.map((d) => dersOku(d, "zayifDersler"));
      const haftalikSaat = sayi(g.haftalikSaat, "haftalikSaat", 1, 100);
      const kalanHafta = sayi(g.kalanHafta, "kalanHafta", 1, 100);
      const tamamlanan = g.tamamlananSayilari && typeof g.tamamlananSayilari === "object" ? g.tamamlananSayilari : {};
      const ilerlemeOzeti = zayifDersler.map((d) => {
        const tm = Math.max(0, Math.min(1000, Number(tamamlanan[d]) || 0));
        const toplam = dersinUniteleri(d, sinif).length;
        return toplam > 0 ? `${d}: ${tm}/${toplam} unite tamamlanmis` : null;
      }).filter(Boolean).join(", ");
      const kisiselBaglam = [
        ilerlemeOzeti ? `Guncel ilerlemesi: ${ilerlemeOzeti}. Bu gercek veriyi dikkate alarak konus.` : "",
      ].filter(Boolean).join(" ");
      let konuOzeti = "";
      if (g.zayifAltKonular && typeof g.zayifAltKonular === "object") {
        konuOzeti = Object.keys(g.zayifAltKonular).slice(0, 8).map((d) => {
          const ders = kisa(d, "ders", 60);
          const liste = Array.isArray(g.zayifAltKonular[d]) ? g.zayifAltKonular[d].slice(0, 3).map((s) => kisa(s, "altKonu", 120)) : [];
          return liste.length ? `${ders}: ${liste.join(", ")}` : null;
        }).filter(Boolean).join("; ");
      }
      let saatlikNot = "";
      if (g.saatlik && typeof g.saatlik === "object") {
        const enIyi = tamsayi(g.saatlik.enIyiSaat, "enIyiSaat", 0, 23), enKotu = tamsayi(g.saatlik.enKotuSaat, "enKotuSaat", 0, 23);
        saatlikNot = ` Ogrenci saat ${enIyi}:00 civarinda daha basarili oluyor, saat ${enKotu}:00 civarinda daha cok zorlaniyor - agir konulari ona gore onerebilirsin.`;
      }
      return { prompt: `Sen bir LGS calisma kocususun - samimi bir MENTOR gibi konus. ${kisiselBaglam} Zayif dersler: ${zayifDersler.join(", ")}.${konuOzeti ? ` En cok zorlandigi ALT KONULAR (oncelik sirasiyla): ${konuOzeti}. Gorevleri mumkun oldugunca bu SPESIFIK konulara gore yaz, genel ders adiyla yetinme.` : ""}${saatlikNot} Haftalik ${haftalikSaat} saat, sinava ${kalanHafta} hafta kaldi. Iki parca uret: (1) "mesaj": ogrenciye sicak, kisa (150-200 kelime) bir konusma metni - programi ozetle, plato/basari notunu ekle. (2) "program": Pazartesi'den Pazar'a kadar HER GUN icin bir gorev nesnesi (bos gunler icin de "Dinlenme" gibi bir ders yaz) - {"gun":"Pazartesi","ders":"Matematik","gorev":"Kisa, somut, TEK CUMLELIK gorev tanimi"}. SADECE su JSON formatinda don, baska aciklama ekleme, markdown kullanma:
{"mesaj":"...","program":[{"gun":"Pazartesi","ders":"...","gorev":"..."},{"gun":"Sali","ders":"...","gorev":"..."},{"gun":"Carsamba","ders":"...","gorev":"..."},{"gun":"Persembe","ders":"...","gorev":"..."},{"gun":"Cuma","ders":"...","gorev":"..."},{"gun":"Cumartesi","ders":"...","gorev":"..."},{"gun":"Pazar","ders":"...","gorev":"..."}]}` };
    },
  },
  seviye_tespit: {
    maxTokens: () => 5000, jsonModu: true,
    hazirla(g) {
      const sinif = sinifOku(g);
      const dersListesi = gorunurDersler(sinif).join(", ");
      return { prompt: `Sen bir egitim kurumunda seviye tespit sinavi hazirlayan bir olcme-degerlendirme uzmanisin. Su derslerin HER BIRINDEN 2'ser soru olmak uzere toplam 12 soruluk bir SEVIYE TESPIT SINAVI hazirla: ${dersListesi}. ${sinif}. sinif seviyesinde, her dersten 1 kolay 1 orta zorlukta soru olsun. Her sorunun hangi derse ait oldugunu "ders" alaninda MUTLAKA belirt (yukaridaki isimlerle BIREBIR ayni yaz). Sorular mantik yurutme gerektirsin, ezber bilgi sorma. Tum metinler SADECE Turkce olmali, Latin alfabesi disinda TEK BIR karakter bile kullanma, ayrica Ingilizce/Almanca/Fransizca/Portekizce gibi baska dilden TEK KELIME bile kullanma, sadece oz Turkce kelimeler kullan. ISTISNA: "ders" alani Ingilizce olan sorularin soru metni ve SECENEKLERI INGILIZCE yazilmali (aciklama Turkce kalsin). SADECE JSON dondur, baska hicbir aciklama ekleme:
[{"ders":"Matematik","soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay","beceri":"soru hangi beceriyi olcuyor (orn. islem becerisi, yorumlama, uygulama - kisa 2-4 kelime)","tahminiSureSaniye":45,"yayginHata":"ogrencilerin bu tarz soruda en sik yaptigi hata (kisa, 1 cumle)","cozumTeknigi":"bu soruyu hizli cozmenin pratik teknigi (kisa, 1 cumle)"}]` };
    },
  },
};

export { GirdiHatasi };
