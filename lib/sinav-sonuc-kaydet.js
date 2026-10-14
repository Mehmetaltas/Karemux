// Faz E - sinav_sonuclari'na TEK yazim noktasi (sinav-sonuc ve sinav-oturumu/gonder kullanir).
import { sql } from "@/lib/db";
import { PUANLAMA_SURUMU } from "@/lib/puanlama";

// Sayilar ve net cagiran tarafindan SUNUCUDA hesaplanmis olmali.
export async function sinavSonucuKaydet(kullaniciId, { tur, ders, dogru, yanlis, bos, net }) {
  const kullaniciSatiri = await sql`SELECT hedef_il, hedef_ilce, kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
  const il = kullaniciSatiri[0]?.hedef_il || null;
  const ilce = kullaniciSatiri[0]?.hedef_ilce || null;
  const kurumId = kullaniciSatiri[0]?.kurum_id || null;

  await sql`
    INSERT INTO sinav_sonuclari (kullanici_id, tur, ders, dogru, yanlis, bos, net, il, ilce, kurum_id, puanlama_surumu)
    VALUES (${kullaniciId}, ${tur}, ${ders}, ${dogru}, ${yanlis}, ${bos}, ${net}, ${il}, ${ilce}, ${kurumId}, ${PUANLAMA_SURUMU})
  `;

  // Ayni ders + tur icin bir onceki sonucu da donduruyoruz, "gecmise gore" kiyaslama icin
  const gecmis = await sql`
    SELECT net, olusturulma FROM sinav_sonuclari
    WHERE kullanici_id = ${kullaniciId} AND ders = ${ders} AND tur = ${tur}
    ORDER BY olusturulma DESC
    LIMIT 2
  `;
  const oncekiNet = gecmis.length > 1 ? Number(gecmis[1].net) : null;

  const testSayisi = await sql`
    SELECT COUNT(*)::int AS adet FROM sinav_sonuclari
    WHERE kullanici_id = ${kullaniciId} AND ders = ${ders} AND tur = ${tur}
  `;
  const testNo = testSayisi[0]?.adet || 1;
  return { oncekiNet, testNo };
}
