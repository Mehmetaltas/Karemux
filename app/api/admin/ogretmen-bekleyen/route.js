import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

// Bekleyen (aktif=false, yani kendi kendine kaydolmus ama henuz onaylanmamis) ogretmenleri listeler.
export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_bekleyen", 10, 15);
  if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme." }, { status: 429 });
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "ogretmen_bekleyen", false);
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  await denemeKaydet(ip, "ogretmen_bekleyen", true);

  const bekleyenler = await sql`SELECT id, ad, brans, eposta, olusturulma FROM ogretmenler WHERE aktif = false ORDER BY olusturulma DESC`;
  return Response.json({ bekleyenler });
}
