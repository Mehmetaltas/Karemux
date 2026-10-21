import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { ogrenmeHafizasiGetir } from "@/lib/ogrenme-hafizasi";
import { soruTalimatiSecSunucu } from "@/lib/soru-talimati-sunucu";
import { sorulariDenetle } from "@/lib/soruKalite";
import { MUFREDAT, uniteleriGetir } from "@/lib/mufredat-veri";
import { jsonMetniTemizle, soruJsonAyikla, sinavSorusuGecerliMi, sinavPromptuOlustur, dersTekrarPromptuOlustur, gecenYilPromptuOlustur, dersSeviyePromptuOlustur, uniteEsle, istemciSorusu, soruBankasinaArsivle } from "@/lib/sinav-uretimi";

export const maxDuration = 60;

// Faz E - SINAV OTURUMU (deneme / yazili). Sinav sunucuda, PARTILER halinde uretilir
// (istemci eskiden de partiler halinde uretiyordu; her istek Vercel'in 60 sn sinirinin icinde kalsin
// diye parti kucuk tutulur). Cevap anahtari sinav_oturumlari'nda kalir, tarayiciya SADECE
// cevapsiz sorular gider. Puanlama /api/sinav-oturumu/gonder'de yapilir.
const EN_FAZLA_PARTI = 10;
const DENETIM_ICIN_EN_GEC_MS = 30000; // uretim bu kadar surerse denetim atlanir (fail-open)

function metin(v, enFazla) {
  return typeof v === "string" && v.trim().length > 0 && v.length <= enFazla ? v.trim() : null;
}

export async function POST(req) {
  const baslangic = Date.now();
  try {
    const g = await req.json();
    const sinavTuru = g.sinavTuru;
    const ders = metin(g.ders, 100);
    const sinif = g.sinif;
    const kapsamAciklama = typeof g.kapsamAciklama === "string" && g.kapsamAciklama.length <= 1500 ? g.kapsamAciklama : null;
    const kayitTuru = metin(g.kayitTuru, 40);
    const kayitDersAdi = metin(g.kayitDersAdi, 200);
    const kapsamUnite = metin(g.kapsamUnite, 150); // istege bagli
    const adet = g.adet, toplam = g.toplam, partiNo = g.partiNo;
    const dersTekrar = sinavTuru === "ders_tekrar";
    const gecenYil = sinavTuru === "gecen_yil";
    const dersSeviye = sinavTuru === "ders_seviye";
    const kayitTuruGecerli = !!kayitTuru && (dersTekrar ? /^ders_tekrar_[123]$/.test(kayitTuru) : gecenYil ? kayitTuru === "gecen_yil_genel" : dersSeviye ? kayitTuru === "ders_seviye" : /^(deneme|yazili)[a-z0-9_]*$/.test(kayitTuru));
    if (!["deneme", "yazili", "ders_tekrar", "gecen_yil", "ders_seviye"].includes(sinavTuru) || !ders || kapsamAciklama === null || !kayitTuruGecerli || !kayitDersAdi
      || !Number.isInteger(sinif) || sinif < 1 || sinif > 12
      || !Number.isInteger(adet) || adet < 1 || adet > EN_FAZLA_PARTI
      || !Number.isInteger(toplam) || toplam < adet || toplam > (dersTekrar ? 15 : (gecenYil || dersSeviye) ? 10 : 120)
      || !Number.isInteger(partiNo) || partiNo < 0 || partiNo > 20) {
      return Response.json({ error: "Gecersiz sinav istegi" }, { status: 400 });
    }
    const yaziliDonemNo = ["yazili1", "yazili2", "yazili3"].includes(g.yaziliDonemNo) ? g.yaziliDonemNo : null;

    const kullaniciId = await kullaniciIdCoz(req, g.cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    let oturumId = null;
    let mevcutSayi = 0;
    if (g.oturumId != null) {
      if (!/^\d+$/.test(String(g.oturumId))) return Response.json({ error: "Gecersiz oturum" }, { status: 400 });
      const mevcut = await sql`SELECT id, jsonb_array_length(sorular) AS sayi FROM sinav_oturumlari WHERE id = ${g.oturumId} AND kullanici_id = ${kullaniciId} AND kullanildi = false`;
      if (mevcut.length === 0) return Response.json({ error: "Sinav oturumu bulunamadi veya gonderilmis" }, { status: 400 });
      oturumId = mevcut[0].id;
      mevcutSayi = Number(mevcut[0].sayi) || 0;
    }

    // Gecen yil genel degerlendirmesi ders basina BIR kez yapilir (sonuc satiri varsa yeni oturum acilmaz).
    if (gecenYil && oturumId === null) {
      const yapilmis = await sql`SELECT 1 FROM sinav_sonuclari WHERE kullanici_id = ${kullaniciId} AND tur = 'gecen_yil_genel' AND ders = ${kayitDersAdi} LIMIT 1`;
      if (yapilmis.length > 0) return Response.json({ error: "Bu ders icin genel degerlendirme zaten yapildi" }, { status: 409 });
    }

    const limit = await gunlukLimitKontrolEt(req, g.cihazId);
    if (!limit.izinVar) {
      return Response.json(
        { error: limit.premium ? `Bugunluk yogun kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` : `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile daha fazla kullanabilirsin.` },
        { status: 429 }
      );
    }

    // Deneme/yazili: onceki partilerde gecerlilik filtresi / denetim soru dusurduyse bu parti eksigi tamamlar
    // ve +1 yedek soru ister; denetimden sonra hedefe kirpilir (17-19/20 benzeri eksik sinav sorununa karsi).
    // Istemci partileri EN_FAZLA_PARTI buyuklugunde keser, son parti kalani alir: onceki toplam = min(partiNo*10, toplam-adet).
    const eksikTamamlanir = sinavTuru === "deneme" || sinavTuru === "yazili";
    const oncekiBeklenen = Math.min(partiNo * EN_FAZLA_PARTI, toplam - adet);
    const eksik = eksikTamamlanir && oturumId !== null ? Math.max(0, Math.min(4, oncekiBeklenen - mevcutSayi)) : 0;
    const hedef = eksikTamamlanir ? Math.min(adet + eksik, 12) : adet;      // bu partiden sonra kalmasi gereken soru sayisi
    const istenen = eksikTamamlanir ? Math.min(hedef + 1, 12) : adet;      // modelden istenen (yedek dahil)

    const soruTalimati = await soruTalimatiSecSunucu(sinif);
    // Ders seviye: resmi unite listesi (istemcideki dersinUniteleri ile ayni mantik: sinifa ozel yoksa MUFREDAT).
    let uniteler = [];
    if (dersSeviye) {
      uniteler = uniteleriGetir(sinif, ders);
      if (uniteler.length === 0) uniteler = MUFREDAT[ders] || [];
    }
    let istem = dersTekrar
      ? dersTekrarPromptuOlustur({ ders, sinif, adet, toplam, partiNo, soruTalimati })
      : gecenYil
      ? gecenYilPromptuOlustur({ ders, sinif, adet, soruTalimati })
      : dersSeviye
      ? dersSeviyePromptuOlustur({ ders, sinif, adet, uniteler, soruTalimati })
      : sinavPromptuOlustur({ ders, sinif, sinavTuru, yaziliDonemNo, kapsamAciklama, adet: istenen, toplam: toplam > adet ? Math.max(toplam, istenen + 1) : istenen, partiNo, soruTalimati });
    try {
      const ogrenmeOzeti = await ogrenmeHafizasiGetir(kullaniciId);
      if (ogrenmeOzeti) {
        istem = `Bu ogrencinin gecmis calisma verisinden cikarilan profil: "${ogrenmeOzeti}" Bu bilgiyi, asagidaki icerigi bu ogrenciye daha uygun hale getirmek icin KULLAN (ozellikle zayif oldugu noktalara biraz daha dikkat et), ama bunu ACIKCA SOYLEME, dogal bir sekilde entegre et.\n\n---\n\n${istem}`;
      }
    } catch (e) { /* hafiza basarisiz olursa sessizce normal akisa devam */ }

    let cevap;
    try {
      cevap = await aiCagir({ prompt: istem, maxTokens: Math.min(8000, 500 + istenen * 480), jsonModu: true, tur: "sinav_uretimi" });
    } catch (e) {
      console.error(e);
      return Response.json({ error: "AI servisi yanit vermedi, tekrar dene" }, { status: 502 });
    }

    let ham;
    try {
      ham = soruJsonAyikla(jsonMetniTemizle(cevap, { dilFiltresi: true, parantezTemizle: true }));
    } catch (e) {
      return Response.json({ error: "Sorular uretilemedi, tekrar dene" }, { status: 502 });
    }
    let sorular = ham.filter(sinavSorusuGecerliMi).slice(0, istenen);
    if (sorular.length === 0) return Response.json({ error: "Gecerli soru uretilemedi, tekrar dene" }, { status: 502 });
    if (dersSeviye) sorular = sorular.map((s) => ({ ...s, unite: uniteEsle(s.unite, uniteler) }));

    // Bagimsiz kalite denetimi (Faz D ilkesi). Uretim yavas gittiyse atlanir (fail-open) ki istek 60 sn'yi asmasin.
    let denetlendi = false;
    const gecen = Date.now() - baslangic;
    if (gecen < DENETIM_ICIN_EN_GEC_MS) {
      const butce = Math.max(3000, Math.min(15000, 52000 - gecen));
      const denetim = await sorulariDenetle(sorular, `Bu sorular "${ders}" dersi icin ${sinif}. sinif ${dersTekrar ? "temel konu tekrar testi" : dersSeviye ? "ders seviye belirleme sinavi" : gecenYil ? "onceki sinif genel degerlendirmesi" : sinavTuru === "yazili" ? "yazili sinavi" : "LGS deneme sinavi"} icin uretildi, cevap anahtari cok yuksek dogrulukta olmali.`, butce);
      if (denetim.gecenler.length === 0) return Response.json({ error: "Sorular kalite denetiminden gecemedi, tekrar dene" }, { status: 502 });
      sorular = denetim.gecenler; denetlendi = true;
    }

    // Yedek dahil gelen fazla sorular denetimden sonra hedefe kirpilir.
    if (sorular.length > hedef) sorular = sorular.slice(0, hedef);

    // Anahtarli sorular sunucuda saklanir.
    const json = JSON.stringify(sorular);
    if (oturumId === null) {
      // Yeni oturum acarken 3 gunden eski (terk edilmis / kullanilmis) oturumlari temizle - tablo sismesin.
      try { await sql`DELETE FROM sinav_oturumlari WHERE olusturulma < now() - interval '3 days'`; } catch (e) { console.error("Eski oturum temizligi basarisiz:", e.message); }
      const meta = JSON.stringify({ sinavTuru, kayitTuru, kayitDersAdi, ders, sinif, toplam });
      const kayit = await sql`INSERT INTO sinav_oturumlari (kullanici_id, tur, ders, sorular, meta) VALUES (${kullaniciId}, ${kayitTuru}, ${ders}, ${json}::jsonb, ${meta}::jsonb) RETURNING id`;
      oturumId = kayit[0].id;
    } else {
      const guncel = await sql`UPDATE sinav_oturumlari SET sorular = sorular || ${json}::jsonb WHERE id = ${oturumId} AND kullanici_id = ${kullaniciId} AND kullanildi = false RETURNING id`;
      if (guncel.length === 0) return Response.json({ error: "Sinav oturumu bulunamadi veya gonderilmis" }, { status: 400 });
    }

    // Denetimden gecenler soru bankasina arsivlenir (eskiden istemci yapiyordu).
    if (denetlendi && !dersTekrar && !gecenYil) await soruBankasinaArsivle(ders, sinif, kapsamUnite, sorular, sinavTuru);

    return Response.json({ oturumId, sorular: sorular.map(istemciSorusu), denetlendi });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Sinav olusturulamadi: " + e.message }, { status: 500 });
  }
}
