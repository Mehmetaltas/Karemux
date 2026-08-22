import { sql } from "@/lib/db";

// Herkese acik (kimlik dogrulama gerektirmez) - yaklasan, hala yer olan
// canli ders oturumlarini listeler. Ogrenciye gosterilen tek bir toplam
// fiyat - ogretmen_payi_tl (ic hesap) DONMEZ.
export async function GET(req) {
  const tur = new URL(req.url).searchParams.get("tur"); // opsiyonel filtre: grup|kamp|soru_cozum

  const oturumlar = await sql`
    SELECT o.id, o.tur, o.ders, o.konu, o.baslangic_zamani, o.sure_dk, o.oturum_sayisi, o.max_kapasite,
           o.fiyat_tl, og.ad AS ogretmen_adi, og.brans,
           (SELECT COUNT(*) FROM canli_ders_katilimcilari k WHERE k.oturum_id = o.id)::int AS kayitli_ogrenci
    FROM canli_ders_oturumlari o
    JOIN ogretmenler og ON og.id = o.ogretmen_id
    WHERE o.durum = 'planlandi' AND o.baslangic_zamani >= now()
      ${tur ? sql`AND o.tur = ${tur}` : sql``}
    ORDER BY o.baslangic_zamani ASC
  `;

  const doluDegil = oturumlar
    .filter((o) => o.kayitli_ogrenci < o.max_kapasite)
    .map((o) => ({ ...o, kalanKontenjan: o.max_kapasite - o.kayitli_ogrenci }));

  return Response.json({ oturumlar: doluDegil });
}
