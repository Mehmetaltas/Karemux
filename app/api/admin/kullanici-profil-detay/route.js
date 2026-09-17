import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return Response.json({ error: "id gerekli" }, { status: 400 });

    const kullaniciRes = await sql`
      SELECT id, ad, eposta, rol, sinif, il, ilce, okul, telefon, hedef_okul, hedef_puan,
        kurum_id, olusturulma, eposta_dogrulandi, veli_eposta, veli_onay_verildi
      FROM kullanicilar WHERE id = ${id}
    `;
    if (kullaniciRes.length === 0) return Response.json({ error: "Kullanici bulunamadi" }, { status: 404 });
    const kullanici = kullaniciRes[0];

    const abonelikGecmisi = await sql`
      SELECT plan, durum, baslangic, bitis, kaynak FROM abonelikler
      WHERE kullanici_id = ${id} ORDER BY baslangic DESC
    `;

    const satisGecmisi = await sql`
      SELECT tutar_tl, net_gelir_tl, taksit_sayisi, olusturulma FROM satislar
      WHERE kullanici_id = ${id} ORDER BY olusturulma DESC
    `;

    let kullanimOzeti = [];
    try {
      kullanimOzeti = await sql`
        SELECT tarih, istek_sayisi FROM gunluk_kullanim
        WHERE kullanici_id = ${id} ORDER BY tarih DESC LIMIT 30
      `;
    } catch (e) { /* tablo/kolon farkli olabilir */ }

    let destekTalepleri = [];
    try {
      destekTalepleri = await sql`
        SELECT konu, durum, olusturulma FROM destek_talebi
        WHERE kullanici_id = ${id} ORDER BY olusturulma DESC LIMIT 10
      `;
    } catch (e) { /* tablo/kolon farkli olabilir */ }

    return Response.json({ kullanici, abonelikGecmisi, satisGecmisi, kullanimOzeti, destekTalepleri });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
