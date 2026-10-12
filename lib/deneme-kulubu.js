import { sql } from "@/lib/db";
import { isYillikAboneMi } from "@/lib/paket";

// Deneme Kulübü - MASTER v2 mimarisi (24 Eylül): Sınav Merkezi'nin (ucretli_denemeler
// havuzu) üzerinde çalışan bireysel üyelik katmanı. Kurum satın alması gerektirmez -
// kullanıcı DOĞRUDAN üye olabilir. Ödeme altyapısı YENİ DEĞİL - mevcut genel
// paketler/abonelikler + havale/İyzico akışı (checkout/havale-baslat, checkout/route.js,
// admin/havale-onay, checkout/callback) hiç değiştirilmeden aynen kullanılıyor.
export const DENEME_KULUBU_SEVIYELERI = {
  deneme_kulubu_baslangic: { ad: "Başlangıç", sira: 1 },
  deneme_kulubu_standart: { ad: "Standart", sira: 2 },
  deneme_kulubu_lgs: { ad: "LGS", sira: 3 },
};

export async function denemeKulubuUyeMi(kullaniciId) {
  if (!kullaniciId) return { uye: false, seviye: null };
  const sonuc = await sql`
    SELECT plan, bitis FROM abonelikler
    WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' AND bitis > now()
      AND plan = ANY(${Object.keys(DENEME_KULUBU_SEVIYELERI)})
    ORDER BY bitis DESC LIMIT 1
  `;
  if (sonuc.length > 0) {
    return {
      uye: true,
      seviye: sonuc[0].plan,
      seviyeAdi: DENEME_KULUBU_SEVIYELERI[sonuc[0].plan]?.ad || null,
      // 1 Ekim: Dalga 1 Adim 5 - bitis eklendi, route'daki ayri 2. sorgu kaldirildi (DRY)
      bitis: sonuc[0].bitis,
    };
  }

  // 12 Ekim: Dalga 9 (Sinav Merkezi) - kullanici onayiyla genisletildi. Dalga
  // 2'de ONAYLANMIS hak eslemesinde yillik_* paketleri deneme_kulubu_* ile
  // AYNI sekilde 7 hakkin hepsini TRUE aliyor (bkz. KAREMUX-DALGA1-ABONELIK-
  // MOTORU.md) - "sinirsiz her sey" vaadinin dogal sonucu olarak yillik abone
  // de Deneme Kulubu'ne kurum satin alma gerekmeden erisebilmeli. NOT:
  // hasEntitlement(..., "online_exam_access") KASITLI OLARAK kullanilmadi -
  // bursluluk paketi de bu hakka true sahip (Dalga 2 eslemesi), yanlislikla
  // bursluluk abonelerini de bu kapsama alirdi. isYillikAboneMi() ile SADECE
  // yillik_* paketlerine daraltildi. Eski plan-bazli kontrol DEGISMEDI, bu EK bir yol.
  if (await isYillikAboneMi(kullaniciId)) {
    return { uye: true, seviye: "yillik_entitlement", seviyeAdi: "Sınırsız (Yıllık)", bitis: null };
  }

  return { uye: false, seviye: null };
}
