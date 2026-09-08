import { denemeOlustur } from "@/lib/ulusalDenemeOlustur";
import { personelAdminMi } from "@/lib/personel";

export const maxDuration = 60;

// P0 denetiminde bulundu (8 Eylul): admin/page.js bu route'u cagiriyordu ama
// hic olusturulmamisti - lib/ulusalDenemeOlustur.js'in yorumunda "hem yonetici
// manuel tetikledigimde hem cron'da kullanilacak" yaziyordu, sadece cron
// tarafi (cron/ulusal-deneme-otomatik) yapilmisti. Ayni cekirdek fonksiyon
// burada da kullaniliyor - mantik zaten hazirdi, sadece bu sarmalayici eksikti.
export async function POST(req) {
  try {
    const { yoneticiSifre, ad, sinif, ders, acikKalmaSaati, kapsam, il } = await req.json();
    if (yoneticiSifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    if (!ad || !sinif || !ders) {
      return Response.json({ error: "Eksik bilgi (ad/sinif/ders gerekli)" }, { status: 400 });
    }

    const sonuc = await denemeOlustur({ ad, sinif, ders, soruSayisi: 20, acikKalmaSaati: acikKalmaSaati || 24, kapsam, il });
    return Response.json({ ok: true, ...sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message || "Deneme olusturulamadi" }, { status: 500 });
  }
}
