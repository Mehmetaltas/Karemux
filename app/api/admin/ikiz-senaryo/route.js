import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

const KDV_ORANI_TASLAK = 0.20; // TASLAK - mali musavir onayina kadar kesin degil

const DONEM_AY_CARPANI = {
  gunluk: 1 / 30,
  haftalik: 1 / 4.33,
  aylik: 1,
  uc_aylik: 3,
  alti_aylik: 6,
  yillik: 12,
};

const SENARYO_CARPANLARI = {
  iyimser: { gelir: 1.15, gider: 0.95 },
  gerceki: { gelir: 1.0, gider: 1.0 },
  kotumser: { gelir: 0.75, gider: 1.15 },
};

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "ikiz_senaryo", 10, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "ikiz_senaryo", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "ikiz_senaryo", true);
  return { izinVar: true };
}

async function gercekAylikSabitGider() {
  const tekrarlayan = await sql`
    SELECT COALESCE(SUM(tutar_tl), 0)::float AS toplam FROM giderler WHERE tekrarlayan = true
  `;
  const tekSeferlik90Gun = await sql`
    SELECT COALESCE(SUM(tutar_tl), 0)::float AS toplam FROM giderler
    WHERE tekrarlayan = false AND tarih >= (CURRENT_DATE - INTERVAL '90 days')
  `;
  const tekrarlayanToplam = tekrarlayan[0].toplam;
  const tekSeferlikAylikOrtalama = tekSeferlik90Gun[0].toplam / 3;
  return {
    tekrarlayanAylikTl: Math.round(tekrarlayanToplam * 100) / 100,
    tekSeferlikAylikOrtalamaTl: Math.round(tekSeferlikAylikOrtalama * 100) / 100,
    toplamTahminiAylikTl: Math.round((tekrarlayanToplam + tekSeferlikAylikOrtalama) * 100) / 100,
  };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const sabitGider = await gercekAylikSabitGider();

    const personelSayisi = await sql`SELECT COUNT(*)::int AS adet FROM personel WHERE aktif = true`;

    const senaryolar = await sql`
      SELECT id, ad, girdi_json, sonuc_json, olusturulma FROM ikiz_senaryo
      ORDER BY olusturulma DESC LIMIT 30
    `;

    return Response.json({
      sabitGider,
      gercekAktifPersonelSayisi: personelSayisi[0]?.adet ?? null,
      senaryolar,
      kdvOraniTaslak: KDV_ORANI_TASLAK,
      donemSecenekleri: Object.keys(DONEM_AY_CARPANI),
      senaryoTipiSecenekleri: Object.keys(SENARYO_CARPANLARI),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { sifre, ad } = body;
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const donem = DONEM_AY_CARPANI[body.donem] ? body.donem : "aylik";
    const senaryoTipi = SENARYO_CARPANLARI[body.senaryoTipi] ? body.senaryoTipi : "gerceki";
    const ayCarpani = DONEM_AY_CARPANI[donem];
    const carpan = SENARYO_CARPANLARI[senaryoTipi];

    const ogrenciSayisi = Number(body.ogrenciSayisi) || 0;
    const ortalamaAylikGelirKisiBasiTl = Number(body.ortalamaAylikGelirKisiBasiTl) || 0;
    const ogretmenSayisi = Number(body.ogretmenSayisi) || 0;
    const ortalamaAylikOgretmenMaliyetiTl = Number(body.ortalamaAylikOgretmenMaliyetiTl) || 0;
    const personelMaliyetiAylikTl = Number(body.personelMaliyetiAylikTl) || 0;
    const aylikAiMaliyetTahminiTl = Number(body.aylikAiMaliyetTahminiTl) || 0;
    const ekstraAylikGiderTl = Number(body.ekstraAylikGiderTl) || 0;

    const sabitGider = await gercekAylikSabitGider();

    const aylikGelirHam = ogrenciSayisi * ortalamaAylikGelirKisiBasiTl;
    const aylikOgretmenMaliyetiHam = ogretmenSayisi * ortalamaAylikOgretmenMaliyetiTl;
    const aylikGiderHamKdvHaric = aylikOgretmenMaliyetiHam + personelMaliyetiAylikTl + aylikAiMaliyetTahminiTl + sabitGider.toplamTahminiAylikTl + ekstraAylikGiderTl;

    const aylikGelir = aylikGelirHam * carpan.gelir;
    const aylikGiderKdvHaric = aylikGiderHamKdvHaric * carpan.gider;

    const donemGelir = aylikGelir * ayCarpani;
    const donemGiderKdvHaric = aylikGiderKdvHaric * ayCarpani;
    const donemKdvTahmini = donemGelir * KDV_ORANI_TASLAK;
    const donemNetKarZarar = donemGelir - donemGiderKdvHaric - donemKdvTahmini;
    const karMarjiYuzde = donemGelir > 0 ? (donemNetKarZarar / donemGelir) * 100 : null;

    const girdi = {
      donem, senaryoTipi,
      ogrenciSayisi, ortalamaAylikGelirKisiBasiTl,
      ogretmenSayisi, ortalamaAylikOgretmenMaliyetiTl,
      personelMaliyetiAylikTl, aylikAiMaliyetTahminiTl, ekstraAylikGiderTl,
    };
    const sonuc = {
      donem, senaryoTipi,
      senaryoCarpanlari: carpan,
      donemAyCarpani: Math.round(ayCarpani * 10000) / 10000,
      donemGelirTl: Math.round(donemGelir * 100) / 100,
      donemOgretmenMaliyetiTl: Math.round(aylikOgretmenMaliyetiHam * carpan.gider * ayCarpani * 100) / 100,
      donemPersonelMaliyetiTl: Math.round(personelMaliyetiAylikTl * carpan.gider * ayCarpani * 100) / 100,
      donemSabitGiderTl: Math.round(sabitGider.toplamTahminiAylikTl * carpan.gider * ayCarpani * 100) / 100,
      donemKdvTahminiTl: Math.round(donemKdvTahmini * 100) / 100,
      kdvOraniTaslak: KDV_ORANI_TASLAK,
      donemToplamGiderTl: Math.round((donemGiderKdvHaric + donemKdvTahmini) * 100) / 100,
      donemNetKarZararTl: Math.round(donemNetKarZarar * 100) / 100,
      karMarjiYuzde: karMarjiYuzde !== null ? Math.round(karMarjiYuzde * 100) / 100 : null,
      durum: donemNetKarZarar >= 0 ? "karli" : "zararli",
      sabitGiderKaynagi: sabitGider,
    };

    const eklenen = await sql`
      INSERT INTO ikiz_senaryo (ad, girdi_json, sonuc_json, olusturulma)
      VALUES (${ad || "Adsiz senaryo"}, ${JSON.stringify(girdi)}, ${JSON.stringify(sonuc)}, now())
      RETURNING id
    `;

    return Response.json({ ok: true, id: eklenen[0].id, sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Hesaplanamadi" }, { status: 500 });
  }
}
