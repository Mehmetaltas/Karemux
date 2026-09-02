import { aiCagir } from "@/lib/ai";
import { ogretmenCoz } from "@/lib/ogretmen";
import { personelAdminMi } from "@/lib/personel";
import { sql } from "@/lib/db";

const BAGLAM_TEMELLI_SORU_TALIMATI = `Sorulari "Baglam Temelli Soru" yaklasimiyla yaz: her soru gercekci bir senaryo, veri veya durum icinde kurulsun. Celdiriciler rastgele olmamali, spesifik bir kavram yanilgisini yansitmali. Turkce'ye ozgu karakterleri DOGRU ve EKSIKSIZ kullan.`;

const KALITE_REFERANSLARI = {
  "Matematik": "KOLAY sorular Nitelik Yayinlari tarzinda; ORTA sorular Okyanus Master tarzinda; ZOR sorular Sinan Kuzucu Yayinlari tarzinda.",
  "Fen Bilimleri": "KOLAY sorular Canta Yayinlari Kazandiran Defter tarzinda; ORTA sorular Okyanus Master tarzinda; ZOR sorular Nartest Power tarzinda.",
  "Turkce": "KOLAY sorular Tonguc Akademi tarzinda; ORTA sorular KR Akademi tarzinda; ZOR sorular Sinan Kuzucu Yayinlari tarzinda.",
  "T.C. Inkilap Tarihi": "KOLAY sorular Tonguc Akademi tarzinda; ORTA sorular KR Akademi tarzinda; ZOR sorular Nitelik Yayinlari Ust Duzey Soru Bankasi tarzinda.",
  "Din Kulturu": "KOLAY sorular Tonguc Akademi tarzinda; ORTA sorular KR Akademi tarzinda; ZOR sorular Nitelik Yayinlari Ust Duzey Soru Bankasi tarzinda.",
};

// cikti_tipi: "sorular" (coktan secmeli soru listesi) | "metin" (duz metin rapor/ozet)
const TUR_TANIMLARI = {
  calisma_kagidi: { baslik: "Çalışma Kağıdı", soruSayisi: 8, aciklama: "kısa konu özeti + karışık zorlukta 8 soru + cevap anahtarı", ciktiTipi: "sorular" },
  soru_seti: { baslik: "Soru Seti", soruSayisi: 10, aciklama: "sadece 10 soru (kolaydan zora sıralı) + cevap anahtarı", ciktiTipi: "sorular" },
  yazili: { baslik: "Yazılı (A Kitapçığı)", soruSayisi: 15, aciklama: "gerçek yazılı sınav formatında 15 soru + cevap anahtarı + zorluk dağılımı (%20 kolay, %55 orta, %25 zor)", ciktiTipi: "sorular" },
  fasikul: { baslik: "Fasikül", soruSayisi: 15, aciklama: "konu özeti + 15 soru (ilk 5 kolay, sonraki 5 orta, son 5 zor) + cevap anahtarı", ciktiTipi: "sorular" },
  kazanim_testi: { baslik: "Kazanım Testi", soruSayisi: 8, aciklama: "tek bir kazanıma/alt konuya odaklı 8 soru + cevap anahtarı", ciktiTipi: "sorular" },
  tekrar_paketi: { baslik: "Tekrar Paketi", soruSayisi: 12, aciklama: "konuyu farklı açılardan pekiştiren, karışık zorlukta 12 tekrar sorusu + cevap anahtarı", ciktiTipi: "sorular" },
  odev_paketi: { baslik: "Ödev Paketi", soruSayisi: 6, aciklama: "evde tek başına çözülebilecek, adım adım çözümlü 6 soru + detaylı cevap anahtarı", ciktiTipi: "sorular" },
  brans_denemesi: { baslik: "Branş Denemesi", soruSayisi: 20, aciklama: "TÜM DERSİ (tek üniteyle sınırlı değil) kapsayan, gerçek sınav formatında 20 soru + cevap anahtarı + zorluk dağılımı", ciktiTipi: "sorular" },
  eksik_konu_paketi: { baslik: "Eksik Konu Paketi", soruSayisi: 10, aciklama: "öğretmenin belirttiği zayıf konulara ÖZEL, hedefli 10 pekiştirme sorusu + cevap anahtarı", ciktiTipi: "sorular", notGerekli: true },
  veli_ozeti: { baslik: "Veli Bilgilendirme Özeti", aciklama: "öğretmenin gözlem notlarından, veliye gönderilecek profesyonel ve nazik bir bilgilendirme metni", ciktiTipi: "metin", notGerekli: true },
  sinif_analizi: { baslik: "Sınıf Başarı Analizi", aciklama: "öğretmenin verdiği sınıf performans notlarından, düzenli bir analiz raporu", ciktiTipi: "metin", notGerekli: true },
};

export async function POST(req) {
  try {
    const govde = await req.json();
    const ogretmenOturum = await ogretmenCoz(req);
    const adminYetkili = govde.adminSifre === process.env.ULUSAL_DENEME_YONETICI_SIFRESI && (await personelAdminMi(req));
    const ogretmen = ogretmenOturum || (adminYetkili ? { ad: "Admin (Kalite Kontrol)" } : null);
    if (!ogretmen) return Response.json({ error: "Oturum yok" }, { status: 401 });

    const { tur, sinif, ders, konu, ogretmenNotu } = govde;
    const tanim = TUR_TANIMLARI[tur];
    if (!tanim || !sinif || !ders || !konu?.trim()) return Response.json({ error: "Eksik veya gecersiz bilgi" }, { status: 400 });
    if (tanim.notGerekli && !ogretmenNotu?.trim()) return Response.json({ error: "Bu arac icin ogretmen notu gerekli" }, { status: 400 });

    const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";

    if (tanim.ciktiTipi === "metin") {
      const p = `Sen deneyimli bir ${ders} ogretmenisin. Ogretmenin sundugu su notlardan, "${tanim.baslik}" hazirla: "${ogretmenNotu.trim()}". ${tanim.aciklama}. Profesyonel, nazik ve yapici bir dille yaz, sadece ogretmenin belirttigi bilgileri kullan, uydurma detay ekleme. SADECE JSON dondur: {"baslik":"...","icerik":"..."}. Tum metinler SADECE Turkce olmali.`;
      const cevap = await aiCagir({ prompt: p, maxTokens: 2000, jsonModu: true });
      const temiz = cevap.replace(/```json|```/g, "").trim();
      const veri = JSON.parse(temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1));
      if (!veri.icerik) return Response.json({ error: "Materyal uretilemedi, tekrar dene" }, { status: 500 });
      if (ogretmenOturum?.id) {
      try {
        await sql`
          INSERT INTO ogretmen_materyalleri (ogretmen_id, tur, sinif, ders, konu, materyal)
          VALUES (${ogretmenOturum.id}, ${tur}, ${sinif}, ${ders}, ${konu?.trim() || null}, ${JSON.stringify(veri)})
        `;
      } catch (e) { console.error("Materyal gecmise kaydedilemedi:", e); }
    }
    return Response.json({ ok: true, materyal: veri, tur, olusturan: ogretmen.ad });
    }

    const notMetni = tanim.notGerekli ? ` Ogretmenin belirttigi hedef: "${ogretmenNotu.trim()}" - sorulari BUNA GORE hedefle.` : "";
    const p = `Sen bir LGS/ortaokul ogretmenisin. "${ders}" dersinden${tur === "brans_denemesi" ? "" : ` "${konu}" konusuyla ilgili`} ${sinif}. sinif seviyesinde bir "${tanim.baslik}" hazirla: ${tanim.aciklama}.${notMetni} ${BAGLAM_TEMELLI_SORU_TALIMATI}${kaliteReferansi ? " Kalite referansi: " + kaliteReferansi : ""} SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:
{"baslik":"...","ozet":"kisa konu ozeti (yoksa bos birak)","sorular":[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"zorluk":"kolay"}]}`;

    const cevap = await aiCagir({ prompt: p, maxTokens: 7000, jsonModu: true });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const veri = JSON.parse(temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1));

    if (!veri.sorular || !Array.isArray(veri.sorular) || veri.sorular.length === 0) {
      return Response.json({ error: "Materyal uretilemedi, tekrar dene" }, { status: 500 });
    }

    try {
      for (const s of veri.sorular) {
        if (!s.soru || !Array.isArray(s.secenekler) || s.dogruIndex == null) continue;
        await sql`
          INSERT INTO soru_bankasi (ders, sinif, unite, zorluk, soru, secenekler, dogru_index, kaynak_turu)
          VALUES (${ders}, ${sinif}, ${konu.trim()}, ${s.zorluk || null}, ${s.soru}, ${JSON.stringify(s.secenekler)}, ${s.dogruIndex}, ${"ogretmen_" + tur})
        `;
      }
    } catch (e) { console.error("Ogretmen materyali soru bankasina kaydedilemedi:", e); }

    if (ogretmenOturum?.id) {
      try {
        await sql`
          INSERT INTO ogretmen_materyalleri (ogretmen_id, tur, sinif, ders, konu, materyal)
          VALUES (${ogretmenOturum.id}, ${tur}, ${sinif}, ${ders}, ${konu?.trim() || null}, ${JSON.stringify(veri)})
        `;
      } catch (e) { console.error("Materyal gecmise kaydedilemedi:", e); }
    }
    return Response.json({ ok: true, materyal: veri, tur, olusturan: ogretmen.ad });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Materyal uretilemedi: " + e.message }, { status: 500 });
  }
}
