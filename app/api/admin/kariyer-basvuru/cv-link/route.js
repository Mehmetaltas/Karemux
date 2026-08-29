import { issueSignedToken, presignUrl } from "@vercel/blob";
import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "cv_link_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "cv_link_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "cv_link_admin", true);
  return { izinVar: true };
}

// Admin, bir basvurunun CV'sini gormek istediginde 10 dakika gecerli,
// imzali (private store icin) bir indirme linki uretir. Store PRIVATE
// oldugu icin dosyanin kendi URL'i dogrudan acilamaz - once bir DELEGASYON
// token'i (issueSignedToken) alinip, sonra onunla gercek imzali URL
// (presignUrl) uretiliyor. Iki adimli akis, @vercel/blob'un gercek API'si.
export async function POST(req) {
  try {
    const { sifre, basvuruId } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!basvuruId) return Response.json({ error: "basvuruId gerekli" }, { status: 400 });

    const basvuru = await sql`SELECT cv_dosya_url FROM ogretmen_basvurulari WHERE id = ${basvuruId}`;
    if (basvuru.length === 0 || !basvuru[0].cv_dosya_url) {
      return Response.json({ error: "Bu basvuruda CV dosyasi yok" }, { status: 404 });
    }

    const dosyaYolu = new URL(basvuru[0].cv_dosya_url).pathname.replace(/^\//, "");
    const suresi = Date.now() + 10 * 60 * 1000; // 10 dakika

    const signedToken = await issueSignedToken({
      pathname: dosyaYolu,
      operations: ["get"],
      validUntil: suresi,
    });
    const { presignedUrl: imzaliUrl } = await presignUrl(signedToken, {
      operation: "get",
      pathname: dosyaYolu,
      access: "private",
      validUntil: suresi,
    });

    return Response.json({ ok: true, url: imzaliUrl });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Link olusturulamadi: " + e.message }, { status: 500 });
  }
}
