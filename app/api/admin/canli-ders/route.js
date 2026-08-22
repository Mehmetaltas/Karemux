import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// Fiyatlandirma mantigi (kullanicinin onayladigi model):
// - Ogretmen, oturum basina KENDI saatlik_ucret_tl'sine gore SABIT bir ucret alir
//   (kac ogrenci katilirsa katilsin - gercek sinif ekonomisiyle ayni).
// - Ogrenciye gosterilen fiyat = (ogretmen_payi_toplam / max_kapasite) * 1.20
//   (%20 Karemux komisyonu, AYRI YAZILMAZ - tek toplam fiyat gosterilir).
function fiyatHesapla(saatlikUcret, sureDk, oturumSayisi, maxKapasite) {
  const ogretmenPayiToplam = Math.round((Number(saatlikUcret) * (sureDk / 60) * oturumSayisi) * 100) / 100;
  const ogrenciPayiHam = ogretmenPayiToplam / maxKapasite;
  const fiyatTl = Math.round((ogrenciPayiHam * 1.20) / 5) * 5; // 5 TL'ye yuvarla, sade gorunsun
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

    if (!["grup", "kamp", "soru_cozum"].includes(tur)) return Response.json({ error: "Gecersiz tur" }, { status: 400 });
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
