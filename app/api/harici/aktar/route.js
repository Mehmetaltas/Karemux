import { oturumdanKullaniciId } from "@/lib/auth";
import { golgeHesabiAktar, cihazIdGecerliMi } from "@/lib/harici-katilim";

// "Sonucumu Karemux'a aktar": giris yapmis kullanicinin bu cihazdaki hesapsiz (harici) katilim
// kayitlarini kendi hesabina tasir. Oturum sart; tek seferlik ve sessiz (hata kullaniciyi engellemez).
export async function POST(req) {
  try {
    const kullaniciId = oturumdanKullaniciId(req);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });
    const { cihazId } = await req.json().catch(() => ({}));
    if (!cihazIdGecerliMi(cihazId)) return Response.json({ aktarilan: false, tasinan: {} });
    const sonuc = await golgeHesabiAktar(kullaniciId, cihazId);
    return Response.json({ aktarilan: sonuc.aktarilan, tasinan: sonuc.tasinan });
  } catch (e) {
    console.error("Harici aktarim hatasi:", e.message);
    return Response.json({ aktarilan: false, tasinan: {} });
  }
}
