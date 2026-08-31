import { aiCagir } from "@/lib/ai";
import { ogretmenCoz } from "@/lib/ogretmen";
import { personelAdminMi } from "@/lib/personel";
import { sql } from "@/lib/db";

// Ogretmen Materyal Ureticisi (31 Agustos) - "Metadata-Driven Icerik" fikrinin
// gercek karsiligi: TEK esnek motor, 4 farkli cikti turunu (calisma_kagidi/
// soru_seti/yazili/fasikul) uretir. Ayni kalite-referansi mantigi (kolay/
// orta/zor + yayinevi referanslari) ogrenci tarafindaki Fasikul akisiyla
// TUTARLI tutuldu.
const BAGLAM_TEMELLI_SORU_TALIMATI = `Sorulari "Baglam Temelli Soru" yaklasimiyla yaz: her soru gercekci bir senaryo, veri veya durum icinde kurulsun. Celdiriciler rastgele olmamali, spesifik bir kavram yanilgisini yansitmali. Turkce'ye ozgu karakterleri DOGRU ve EKSIKSIZ kullan.`;

const KALITE_REFERANSLARI = {
  "Matematik": "KOLAY sorular Nitelik Yayinlari tarzinda; ORTA sorular Okyanus Master tarzinda; ZOR sorular Sinan Kuzucu Yayinlari tarzinda.",
  "Fen Bilimleri": "KOLAY sorular Canta Yayinlari Kazandiran Defter tarzinda; ORTA sorular Okyanus Master tarzinda; ZOR sorular Nartest Power tarzinda.",
  "Turkce": "KOLAY sorular Tonguc Akademi tarzinda; ORTA sorular KR Akademi tarzinda; ZOR sorular Sinan Kuzucu Yayinlari tarzinda.",
  "T.C. Inkilap Tarihi": "KOLAY sorular Tonguc Akademi tarzinda; ORTA sorular KR Akademi tarzinda; ZOR sorular Nitelik Yayinlari Ust Duzey Soru Bankasi tarzinda.",
  "Din Kulturu": "KOLAY sorular Tonguc Akademi tarzinda; ORTA sorular KR Akademi tarzinda; ZOR sorular Nitelik Yayinlari Ust Duzey Soru Bankasi tarzinda.",
};

const TUR_TANIMLARI = {
  calisma_kagidi: { baslik: "Çalışma Kağıdı", soruSayisi: 8, aciklama: "kısa konu özeti + karışık zorlukta 8 soru + cevap anahtarı" },
  soru_seti: { baslik: "Soru Seti", soruSayisi: 10, aciklama: "sadece 10 soru (kolaydan zora sıralı) + cevap anahtarı" },
  yazili: { baslik: "Yazılı (A Kitapçığı)", soruSayisi: 15, aciklama: "gerçek yazılı sınav formatında 15 soru + cevap anahtarı + zorluk dağılımı (%20 kolay, %55 orta, %25 zor)" },
  fasikul: { baslik: "Fasikül", soruSayisi: 15, aciklama: "konu özeti + 15 soru (ilk 5 kolay, sonraki 5 orta, son 5 zor) + cevap anahtarı" },
};

export async function POST(req) {
  try {
    const govde = await req.json();
    // Ogretmen oturumu YETERLI. Admin de ADMIN SIFRESIYLE kalite kontrolu
    // amaciyla ayni motoru kullanabilir (kalici, guvenli - diger admin
    // uc noktalariyla ayni desen).
    const ogretmenOturum = await ogretmenCoz(req);
    const adminYetkili = govde.adminSifre === process.env.ULUSAL_DENEME_YONETICI_SIFRESI && (await personelAdminMi(req));
    const ogretmen = ogretmenOturum || (adminYetkili ? { ad: "Admin (Kalite Kontrol)" } : null);
    if (!ogretmen) return Response.json({ error: "Oturum yok" }, { status: 401 });

    const { tur, sinif, ders, konu } = govde;
    const tanim = TUR_TANIMLARI[tur];
    if (!tanim || !sinif || !ders || !konu?.trim()) return Response.json({ error: "Eksik veya gecersiz bilgi" }, { status: 400 });

    const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";
    const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden "${konu}" konusuyla ilgili, ${sinif}. sinif seviyesinde bir "${tanim.baslik}" hazirla: ${tanim.aciklama}. ${BAGLAM_TEMELLI_SORU_TALIMATI}${kaliteReferansi ? " Kalite referansi: " + kaliteReferansi : ""} SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:
{"baslik":"...","ozet":"kisa konu ozeti (yoksa bos birak)","sorular":[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]}`;

    const cevap = await aiCagir({ prompt: p, maxTokens: 6000, jsonModu: true });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const veri = JSON.parse(temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1));

    if (!veri.sorular || !Array.isArray(veri.sorular) || veri.sorular.length === 0) {
      return Response.json({ error: "Materyal uretilemedi, tekrar dene" }, { status: 500 });
    }

    // Uretilen sorular soru_bankasina kaydediliyor - hem gelecekte yeniden
    // kullanilabilir (AI maliyeti tekrarlanmaz) hem de kaynak_turu ile
    // net gruplanmis oluyor, digerleriyle karismiyor (ogretmen_ONEKI).
    try {
      for (const s of veri.sorular) {
        if (!s.soru || !Array.isArray(s.secenekler) || s.dogruIndex == null) continue;
        await sql`
          INSERT INTO soru_bankasi (ders, sinif, unite, zorluk, soru, secenekler, dogru_index, kaynak_turu)
          VALUES (${ders}, ${sinif}, ${konu.trim()}, ${s.zorluk || null}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, ${"ogretmen_" + tur})
        `;
      }
    } catch (e) { console.error("Ogretmen materyali soru bankasina kaydedilemedi:", e); }

    return Response.json({ ok: true, materyal: veri, tur, olusturan: ogretmen.ad });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Materyal uretilemedi: " + e.message }, { status: 500 });
  }
}
