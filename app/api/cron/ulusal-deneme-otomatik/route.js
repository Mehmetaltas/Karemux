import { denemeOlustur } from "@/lib/ulusalDenemeOlustur";

// Her hafta Pazartesi, 5/6/7/8. siniflarin HER BIRI icin otomatik bir
// Ulusal Deneme olusturur. Ders, hafta numarasina gore donusumlu secilir -
// boylece zaman icinde tum dersler dengeli sekilde kapsanir.
const SINIFLAR = [5, 6, 7, 8];
const DERSLER = ["Matematik", "Turkce", "Fen Bilimleri", "T.C. Inkilap Tarihi ve Ataturkculuk", "Ingilizce"];

function haftaNumarasi() {
  const simdi = new Date();
  const yilBasi = new Date(simdi.getFullYear(), 0, 1);
  return Math.ceil(((simdi - yilBasi) / 86400000 + yilBasi.getDay() + 1) / 7);
}

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const hafta = haftaNumarasi();
  const ders = DERSLER[hafta % DERSLER.length];
  const tarihEtiketi = new Date().toLocaleDateString("tr-TR");

  const sonuclar = [];
  for (const sinif of SINIFLAR) {
    try {
      const sonuc = await denemeOlustur({
        ad: `Haftalik Ulusal Deneme - ${ders} - ${sinif}. Sinif - ${tarihEtiketi}`,
        sinif,
        ders,
        soruSayisi: 20,
        acikKalmaSaati: 168, // 7 gun acik kalsin
      });
      sonuclar.push({ sinif, ders, id: sonuc.id, soruSayisi: sonuc.soruSayisi });
    } catch (e) {
      console.error(`Otomatik ulusal deneme olusturulamadi (${sinif}. sinif, ${ders}):`, e.message);
      sonuclar.push({ sinif, ders, hata: e.message });
    }
  }

  return Response.json({ ok: true, hafta, ders, sonuclar });
}
