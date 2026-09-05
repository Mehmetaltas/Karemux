import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function GET(req) {
  const veliId = oturumdanKullaniciId(req);
  if (!veliId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });

  try {
    const ogrenciler = await sql`
      SELECT k.id, k.ad, k.sinif, k.kurum_id FROM veli_ogrenci vo
      JOIN kullanicilar k ON k.id = vo.ogrenci_id
      WHERE vo.veli_id = ${veliId}
    `;

    const sonuc = [];
    for (const ogrenci of ogrenciler) {
      const satirlar = await sql`
        SELECT ders, konu, SUM(dogru_sayisi) AS dogru, SUM(toplam_soru) AS toplam, MAX(olusturulma) AS son_calisma
        FROM ilerleme
        WHERE kullanici_id = ${ogrenci.id}
        GROUP BY ders, konu
        ORDER BY (SUM(dogru_sayisi)::float / NULLIF(SUM(toplam_soru), 0)) ASC
      `;
      const zayifDersler = [...new Set(
        satirlar.filter((s) => s.dogru / s.toplam < 0.6).map((s) => s.ders)
      )];

      // Ders bazinda son 30 gunun net ortalamasi (deneme/yazili)
      const netSatirlari = await sql`
        SELECT ders, AVG(net)::numeric(5,2) AS ortalama_net, COUNT(*)::int AS test_sayisi
        FROM sinav_sonuclari
        WHERE kullanici_id = ${ogrenci.id} AND olusturulma >= now() - interval '30 days' AND (tur = 'deneme' OR tur = 'yazili')
        GROUP BY ders
      `;

      // Bu haftaki aktif gun sayisi (basit "ne kadar calisti" gostergesi)
      const aktifGunler = await sql`
        SELECT COUNT(*)::int AS gun FROM gunluk_kullanim
        WHERE kullanici_id = ${ogrenci.id} AND tarih >= (CURRENT_DATE - interval '7 days') AND ai_istek_sayisi > 0
      `;

      const hataGrup = await sql`
        SELECT ders, alt_konu, COUNT(*)::int AS hata_sayisi
        FROM hata_kitapcigi
        WHERE kullanici_id = ${ogrenci.id} AND cozuldu = false AND alt_konu IS NOT NULL
        GROUP BY ders, alt_konu
      `;
      const seviyeGrup = await sql`
        SELECT ders, unite AS alt_konu, (COUNT(*)::int * 3) AS hata_sayisi
        FROM seviye_tespit_kademe
        WHERE kullanici_id = ${ogrenci.id} AND tamamlandi = false
        GROUP BY ders, unite
      `;
      const enZayifKonular = [...hataGrup, ...seviyeGrup]
        .filter((r) => r.hata_sayisi > 0)
        .sort((a, b) => b.hata_sayisi - a.hata_sayisi)
        .slice(0, 3);

      const oneri = enZayifKonular.length > 0
        ? `${ogrenci.ad}, en cok "${enZayifKonular[0].alt_konu}" (${enZayifKonular[0].ders}) konusunda zorlaniyor - bu haftaki calismalarinda buna oncelik vermesini onerebilirsin.`
        : (aktifGunler[0]?.gun || 0) < 3
          ? `${ogrenci.ad} bu hafta az aktif oldu (${aktifGunler[0]?.gun || 0} gun) - kisa bir hatirlatma iyi olabilir.`
          : `${ogrenci.ad} genel olarak iyi gidiyor, belirgin bir zayif nokta yok.`;

      // Ogrencinin kurumu varsa, kurumun duyurularini da ekle (5 Eylul).
      const duyurular = ogrenci.kurum_id
        ? await sql`SELECT id, baslik, icerik, olusturulma FROM kurum_duyuru WHERE kurum_id = ${ogrenci.kurum_id} ORDER BY olusturulma DESC LIMIT 5`
        : [];

      sonuc.push({
        ogrenci: { id: ogrenci.id, ad: ogrenci.ad, sinif: ogrenci.sinif },
        kurumDuyurulari: duyurular,
        gecmis: satirlar,
        zayifDersler,
        netOzet: netSatirlari,
        buHaftaAktifGun: aktifGunler[0]?.gun || 0,
        enZayifKonular,
        oneri,
      });
    }

    return Response.json({ ogrenciler: sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
