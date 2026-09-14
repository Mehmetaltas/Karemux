import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";

// Tutarlilik Denetimi (14 Eylul) - "Ingilizce'nin tek-seviyeli kaldigi
// fark edilmeden kalmasi" turunden zafiyetlerin OTOMATIK yakalanmasi icin.
// Kalici bir cozum: bu route her calistiginda KALITE_REFERANSLARI'ndaki
// HER dersi tarar, KOLAY/ORTA/ZOR ucunu de icermeyen (tek-seviyeli kalmis)
// referanslari otomatik isaretler - insan "fark edince" degil, sistem
// KENDISI soyler.
export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const bulgular = [];

    // 1. Kalite referanslarinin 3-seviyeli olup olmadigi kontrolu
    for (const [ders, aciklama] of Object.entries(KALITE_REFERANSLARI)) {
      const buyukHal = aciklama.toUpperCase();
      const kolayVar = buyukHal.includes("KOLAY");
      const ortaVar = buyukHal.includes("ORTA");
      const zorVar = buyukHal.includes("ZOR");
      if (!(kolayVar && ortaVar && zorVar)) {
        bulgular.push({
          tur: "eksik_seviye_referansi",
          ders,
          detay: `KOLAY:${kolayVar} ORTA:${ortaVar} ZOR:${zorVar} - uc seviye de yok, tek-seviyeli kalmis olabilir`,
        });
      }
    }

    // 2. Soru bankasinda zorluk etiketi HIC dolmamis (kaynak_turu) var mi
    const etiketsizKaynaklar = await sql`
      SELECT kaynak_turu, COUNT(*)::int AS toplam,
        COUNT(*) FILTER (WHERE zorluk IS NOT NULL)::int AS etiketli
      FROM soru_bankasi GROUP BY kaynak_turu
      HAVING COUNT(*) FILTER (WHERE zorluk IS NOT NULL) = 0
    `;
    for (const k of etiketsizKaynaklar) {
      bulgular.push({
        tur: "zorluk_etiketi_hic_yok",
        kaynakTuru: k.kaynak_turu,
        detay: `${k.toplam} soru, hicbirinde zorluk etiketi yok`,
      });
    }

    // 3. mufredat tablosunda hangi ders/sinif kombinasyonlari HIC yok
    const dersSinifKombinasyonlari = await sql`
      SELECT DISTINCT sinif, ders FROM mufredat ORDER BY sinif, ders
    `;

    return Response.json({
      calistirilmaZamani: new Date().toISOString(),
      toplamBulgu: bulgular.length,
      bulgular,
      not: bulgular.length === 0 ? "Su an bilinen desenlerde tutarsizlik bulunamadi." : "Yukaridaki bulgular manuel incelenmeli.",
      mufredatKapsamiDersSinifSayisi: dersSinifKombinasyonlari.length,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
