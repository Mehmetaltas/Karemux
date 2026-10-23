import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";
import { tumCekirdek, katla } from "@/lib/icerik-cekirdegi";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "icerik_cekirdegi_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "icerik_cekirdegi_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "icerik_cekirdegi_admin", true);
  return { izinVar: true };
}

// Kapsam raporu: her resmi unite icin plan haftasi, soru_bankasi soru sayisi ve uygun konu paketi sayisi.
// Salt okunur; bos kalan uniteler hangi icerigin uretilecegini gosterir.
export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const sorular = await sql`SELECT sinif, ders, unite, COUNT(*)::int AS adet FROM soru_bankasi GROUP BY sinif, ders, unite`;
  let paketler = [];
  try {
    paketler = await sql`
      SELECT sinif, ders, unite, COUNT(DISTINCT konu)::int AS konu_sayisi
      FROM icerik_onbellek
      WHERE icerik_turu = 'konu_paketi' AND (onay_durumu = 'onaylandi' OR onay_durumu IS NULL)
      GROUP BY sinif, ders, unite`;
  } catch (e) { console.error("icerik-cekirdegi paket sorgusu:", e.message); }

  const anahtar = (r) => `${Number(r.sinif)}|${katla(r.ders)}|${katla(r.unite)}`;
  const soruMap = new Map(sorular.map((r) => [anahtar(r), r.adet]));
  const paketMap = new Map(paketler.map((r) => [anahtar(r), r.konu_sayisi]));

  let toplamUnite = 0, soruVar = 0, paketVar = 0, planBagli = 0;
  const dersler = tumCekirdek().map((c) => ({
    sinif: c.sinif,
    ders: c.ders,
    plandaOlupKoddaOlmayan: c.plandaOlupKoddaOlmayan,
    uniteler: c.uniteler.map((u) => {
      const k = `${c.sinif}|${katla(c.ders)}|${katla(u.unite)}`;
      const soru = soruMap.get(k) || 0, paket = paketMap.get(k) || 0;
      toplamUnite++; if (soru) soruVar++; if (paket) paketVar++; if (u.haftalar.length) planBagli++;
      return { unite: u.unite, haftalar: u.haftalar, soru, konuPaketi: paket };
    }),
  }));

  return Response.json({ ozet: { toplamUnite, soruVar, paketVar, planBagli }, dersler });
}
