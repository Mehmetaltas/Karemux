import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { denemeOlustur } from "@/lib/ulusalDenemeOlustur";

// Yonetici (Mehmet) manuel tetikler. Ayni uretim mantigi artik
// lib/ulusalDenemeOlustur.js'de - haftalik otomatik cron da bunu kullanir.
export async function POST(req) {
  try {
    const { ad, sinif, ders, soruSayisi, acikKalmaSaati, yoneticiSifre } = await req.json();

    const ip = istekIpAdresi(req);
    const ipKontrol = await denemeSiniriKontrolEt(ip, "ulusal_deneme_yonetici", 5, 15);
    if (!ipKontrol.izinVar) {
      return Response.json({ error: "Çok fazla başarısız deneme. 15 dakika sonra tekrar dene." }, { status: 429 });
    }
    if (yoneticiSifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
      await denemeKaydet(ip, "ulusal_deneme_yonetici", false);
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    await denemeKaydet(ip, "ulusal_deneme_yonetici", true);

    const sonuc = await denemeOlustur({ ad, sinif, ders, soruSayisi, acikKalmaSaati });
    return Response.json(sonuc);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Olusturulamadi: " + e.message }, { status: 500 });
  }
}
