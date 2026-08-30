import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { topluDersFiyatiHesapla } from "@/lib/fiyatlandirma";

// Fiyatlandirma mantigi (26 Agustos'ta degisen is modeline gore - bkz
// lib/fiyatlandirma.js): Karemux hizmeti ogretmenden satin alip kendi
// uzerine kar koyarak ogrenciye satan taraf (reseller).
// - Ogretmen, oturum basina KENDI saatlik_ucret_tl'sine gore SABIT bir ucret alir
//   (kac ogrenci katilirsa katilsin - gercek sinif ekonomisiyle ayni).
// - Ogrenciye gosterilen fiyat = kisi basi ogretmen payi + kar marji + gizli
//   giderler (taksit komisyonu/banka - TAHMINI, mali musavir onayina acik),
//   tek toplam fiyat gosterilir.
// Paket Denemesi destek maliyeti (30 Agustos): Kamp/Grup/Soru Cozum/Rehberlik/
// Kocluk katilimcilarina ayda 2 kez il bazli tam deneme (5 ders) acan cron'un
// (paket-deneme-otomatik) ortalama TL maliyeti, paket fiyatlarina sabit bir
// ek olarak yansitilir - gercek formul: simulasyon panelindekiyle AYNI
// sabitler (19 Agustos arastirmasi). Kucuk, sabit bir tutar oldugu icin
// (~10 TL/ay) her paket turune esit ekleniyor, sade kalsin diye.
const DENEME_DESTEGI_TL = 10;

// NOT (30 Agustos): "kocluk" (birebir) buradan KALDIRILDI - Koçluk artik
// Randevu (Ozel Ders) sistemine ait (lib esnek 1-1 rezervasyon + catisma
// kontrolu zaten orada var, burada tekrarlamiyoruz). Bkz app/api/randevu/al.
function fiyatHesapla(saatlikUcret, sureDk, oturumSayisi, maxKapasite) {
  const ogretmenPayiToplam = Math.round((Number(saatlikUcret) * (sureDk / 60) * oturumSayisi) * 100) / 100;
  const ogrenciPayiHam = ogretmenPayiToplam / maxKapasite;
  const fiyatTl = Math.round((topluDersFiyatiHesapla(ogrenciPayiHam) + DENEME_DESTEGI_TL) / 5) * 5;
  return { ogretmenPayiToplam, fiyatTl };
}

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "canli_ders_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "canli_ders_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "canli_ders_admin", true);
  return { izinVar: true };
}

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const oturumlar = await sql`
    SELECT o.id, o.tur, o.ders, o.konu, o.baslangic_zamani, o.sure_dk, o.oturum_sayisi, o.max_kapasite,
           o.fiyat_tl, o.ogretmen_payi_tl, o.durum, og.ad AS ogretmen_adi,
           (SELECT COUNT(*) FROM canli_ders_katilimcilari k WHERE k.oturum_id = o.id)::int AS kayitli_ogrenci
    FROM canli_ders_oturumlari o
    JOIN ogretmenler og ON og.id = o.ogretmen_id
    WHERE o.durum = 'planlandi'
    ORDER BY o.baslangic_zamani ASC
  `;
  return Response.json({ oturumlar });
}

export async function POST(req) {
  try {
    const { sifre, tur, ogretmenId, ders, konu, baslangicISO, sureDk, oturumSayisi, oturumAraligiGun, maxKapasite } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    if (!["grup", "kamp", "soru_cozum", "rehberlik"].includes(tur)) return Response.json({ error: "Gecersiz tur" }, { status: 400 });
    if (!ogretmenId || !ders || !baslangicISO || !maxKapasite) return Response.json({ error: "Eksik veri" }, { status: 400 });

    const ogretmen = await sql`SELECT saatlik_ucret_tl FROM ogretmenler WHERE id = ${ogretmenId} AND aktif = true`;
    if (ogretmen.length === 0) return Response.json({ error: "Ogretmen bulunamadi" }, { status: 404 });

    const gecerliSure = [30, 45, 60].includes(Number(sureDk)) ? Number(sureDk) : 60;
    const gecerliOturumSayisi = Math.max(1, Number(oturumSayisi) || 1);
    const gecerliAralik = Math.max(0, Number(oturumAraligiGun) || 0);
    const gecerliKapasite = Math.max(2, Number(maxKapasite));

    const { ogretmenPayiToplam, fiyatTl } = fiyatHesapla(ogretmen[0].saatlik_ucret_tl, gecerliSure, gecerliOturumSayisi, gecerliKapasite);

    const odaId = `karemux-canlidasres-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const jitsiLink = `https://meet.jit.si/${odaId}`;

    const sonuc = await sql`
      INSERT INTO canli_ders_oturumlari (tur, ogretmen_id, ders, konu, baslangic_zamani, sure_dk, oturum_sayisi, oturum_araligi_gun, max_kapasite, fiyat_tl, ogretmen_payi_tl, jitsi_link, jitsi_oda_id)
      VALUES (${tur}, ${ogretmenId}, ${ders}, ${konu || null}, ${baslangicISO}, ${gecerliSure}, ${gecerliOturumSayisi}, ${gecerliAralik}, ${gecerliKapasite}, ${fiyatTl}, ${ogretmenPayiToplam}, ${jitsiLink}, ${odaId})
      RETURNING id
    `;
    return Response.json({ ok: true, id: sonuc[0].id, fiyatTl, ogretmenPayiToplam });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
