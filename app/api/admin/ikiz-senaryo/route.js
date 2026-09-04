import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

// Dijital Ikiz Senaryo Motoru / "Sirket Ikizi" (4 Eylul) - ikiz_senaryo tablosu
// (girdi_json/sonuc_json) daha once bos duruyordu, bu route ile ilk kez
// gercek hesaplama motoruna bagliyor. Amac: "N ogrenci + M ogretmen + X AI
// kullanimi olursa net kar/zarar ne olur" sorusunu, GERCEK verilerle
// (giderler tablosundaki gercek sabit giderler) cevaplayabilmek.
//
// DURUSTLUK NOTU: KDV_ORANI_TASLAK bir VARSAYIMDIR, mali musavir onayina
// kadar kesin degildir - sonuc_json'da acikca "taslak" etiketiyle donuyor.

const KDV_ORANI_TASLAK = 0.20; // TASLAK - mali musavir onayina kadar kesin degil

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

    const senaryolar = await sql`
      SELECT id, ad, sonuc_json, olusturulma FROM ikiz_senaryo
      ORDER BY olusturulma DESC LIMIT 20
    `;

    return Response.json({ sabitGider, senaryolar, kdvOraniTaslak: KDV_ORANI_TASLAK });
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

    const ogrenciSayisi = Number(body.ogrenciSayisi) || 0;
    const ortalamaAylikGelirKisiBasiTl = Number(body.ortalamaAylikGelirKisiBasiTl) || 0;
    const ogretmenSayisi = Number(body.ogretmenSayisi) || 0;
    const ortalamaAylikOgretmenMaliyetiTl = Number(body.ortalamaAylikOgretmenMaliyetiTl) || 0;
    const aylikAiMaliyetTahminiTl = Number(body.aylikAiMaliyetTahminiTl) || 0;
    const ekstraAylikGiderTl = Number(body.ekstraAylikGiderTl) || 0;

    const sabitGider = await gercekAylikSabitGider();

    const toplamGelir = ogrenciSayisi * ortalamaAylikGelirKisiBasiTl;
    const ogretmenMaliyetiToplam = ogretmenSayisi * ortalamaAylikOgretmenMaliyetiTl;
    const toplamGiderKdvHaric = ogretmenMaliyetiToplam + aylikAiMaliyetTahminiTl + sabitGider.toplamTahminiAylikTl + ekstraAylikGiderTl;
    const kdvTahminiTl = Math.round(toplamGelir * KDV_ORANI_TASLAK * 100) / 100;
    const netKarZararTl = Math.round((toplamGelir - toplamGiderKdvHaric - kdvTahminiTl) * 100) / 100;
    const karMarjiYuzde = toplamGelir > 0 ? Math.round((netKarZararTl / toplamGelir) * 10000) / 100 : null;

    const girdi = { ogrenciSayisi, ortalamaAylikGelirKisiBasiTl, ogretmenSayisi, ortalamaAylikOgretmenMaliyetiTl, aylikAiMaliyetTahminiTl, ekstraAylikGiderTl };
    const sonuc = {
      toplamGelirTl: Math.round(toplamGelir * 100) / 100,
      ogretmenMaliyetiToplamTl: Math.round(ogretmenMaliyetiToplam * 100) / 100,
      sabitGider,
      kdvTahminiTl,
      kdvOraniTaslak: KDV_ORANI_TASLAK,
      toplamGiderTl: Math.round((toplamGiderKdvHaric + kdvTahminiTl) * 100) / 100,
      netKarZararTl,
      karMarjiYuzde,
      durum: netKarZararTl >= 0 ? "karli" : "zararli",
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
