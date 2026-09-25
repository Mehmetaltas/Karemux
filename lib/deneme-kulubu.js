import { sql } from "@/lib/db";

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
    SELECT plan FROM abonelikler
    WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' AND bitis > now()
      AND plan = ANY(${Object.keys(DENEME_KULUBU_SEVIYELERI)})
    ORDER BY bitis DESC LIMIT 1
  `;
  if (sonuc.length === 0) return { uye: false, seviye: null };
  return { uye: true, seviye: sonuc[0].plan, seviyeAdi: DENEME_KULUBU_SEVIYELERI[sonuc[0].plan]?.ad || null };
}
