import { put } from "@vercel/blob";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// Ogretmen basvuru formundan CV (PDF) yuklemesi - Vercel Blob'a kaydeder,
// donen URL frontend tarafindan cvDosyaUrl olarak basvuru formuna eklenir.
export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "cv_yukle", 5, 30);
    if (!kontrol.izinVar) {
      return Response.json({ error: "Cok fazla yukleme denemesi. 30 dakika sonra tekrar dene." }, { status: 429 });
    }

    const form = await req.formData();
    const dosya = form.get("dosya");
    if (!dosya) return Response.json({ error: "Dosya bulunamadi" }, { status: 400 });

    if (dosya.type !== "application/pdf") {
      return Response.json({ error: "Sadece PDF dosyasi kabul edilir" }, { status: 400 });
    }
    const MAKS_BOYUT = 5 * 1024 * 1024; // 5MB
    if (dosya.size > MAKS_BOYUT) {
      return Response.json({ error: "Dosya boyutu 5MB'i asamaz" }, { status: 400 });
    }

    const dosyaAdi = `cv/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
    // Store PRIVATE olarak olusturuldu (CV kisisel veri icerir, herkese acik URL RISK).
    // put() cagrisinda access parametresi yok - store'un kendi gizlilik ayari gecerli olur.
    const sonuc = await put(dosyaAdi, dosya, { addRandomSuffix: false });

    await denemeKaydet(ip, "cv_yukle", true);
    return Response.json({ ok: true, url: sonuc.url });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Dosya yuklenemedi: " + e.message }, { status: 500 });
  }
}
