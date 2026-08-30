import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "mufredat_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "mufredat_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "mufredat_admin", true);
  return { izinVar: true };
}

// SADECE admin panelde gorunur - hicbir public/ogrenci API'si bu veriyi dondurmez.
export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const ozet = await sql`
    SELECT sinif, ders,
      COUNT(*)::int AS toplam,
      COUNT(*) FILTER (WHERE dogrulanma_kaynagi = 'resmi_pdf_dogrulu')::int AS dogrulanmis,
      COUNT(*) FILTER (WHERE dogrulanma_kaynagi = 'eksik_ai_tahmini')::int AS eksik
    FROM mufredat
    GROUP BY sinif, ders
    ORDER BY sinif, ders
  `;

  const eksikDetay = await sql`
    SELECT sinif, ders, unite
    FROM mufredat
    WHERE dogrulanma_kaynagi = 'eksik_ai_tahmini'
    ORDER BY sinif, ders, unite
  `;

  return Response.json({ ozet, eksikDetay });
}
