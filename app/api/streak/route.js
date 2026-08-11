import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Kullanicinin ardisik gun serisini (streak) hesaplar. gunluk_kullanim tablosunda
// zaten her aktif gun icin bir satir var (AI istegi yapildikca artan sayac) -
// bu tabloyu ayri bir "streak" tablosu kurmadan yeniden kullaniyoruz.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cihazId = searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ guncelSeri: 0, enUzunSeri: 0 });

    const satirlar = await sql`
      SELECT tarih FROM gunluk_kullanim
      WHERE kullanici_id = ${kullaniciId} AND ai_istek_sayisi > 0
      ORDER BY tarih DESC
      LIMIT 400
    `;
    const tarihler = satirlar.map((r) => new Date(r.tarih).toISOString().slice(0, 10));
    const tarihSeti = new Set(tarihler);

    // Guncel seriyi bugunden (ya da hic bugun calisilmadiysa dunden) geriye dogru sayar.
    function gunFarkStr(gunSayisi) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - gunSayisi);
      return d.toISOString().slice(0, 10);
    }
    let guncelSeri = 0;
    let baslangicOfset = tarihSeti.has(gunFarkStr(0)) ? 0 : (tarihSeti.has(gunFarkStr(1)) ? 1 : null);
    if (baslangicOfset !== null) {
      let i = baslangicOfset;
      while (tarihSeti.has(gunFarkStr(i))) { guncelSeri++; i++; }
    }

    // En uzun seri (tum gecmis icinde) - siralanmis tarihler uzerinde ardisikligi tarar.
    let enUzunSeri = 0, mevcutSayac = 0, oncekiTarih = null;
    const siraliArtan = [...tarihler].reverse();
    for (const t of siraliArtan) {
      if (oncekiTarih) {
        const fark = (new Date(t) - new Date(oncekiTarih)) / (1000 * 60 * 60 * 24);
        mevcutSayac = fark === 1 ? mevcutSayac + 1 : 1;
      } else {
        mevcutSayac = 1;
      }
      enUzunSeri = Math.max(enUzunSeri, mevcutSayac);
      oncekiTarih = t;
    }

    return Response.json({ guncelSeri, enUzunSeri, toplamAktifGun: tarihler.length });
  } catch (e) {
    console.error(e);
    return Response.json({ guncelSeri: 0, enUzunSeri: 0 });
  }
}
