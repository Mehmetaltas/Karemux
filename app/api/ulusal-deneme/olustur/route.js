import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// Yonetici (Mehmet) her hafta manuel tetikler (ileride Vercel Cron ile otomatiklestirilebilir).
// TEK bir soru seti uretir, TUM katilimcilar AYNI sorulari gorur - boylece adil,
// karsilastirilabilir bir "Turkiye geneli" siralama mumkun olur.
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
    if (!ad || !sinif || !ders) return Response.json({ error: "Eksik bilgi" }, { status: 400 });

    const p = `Sen bir LGS olcme-degerlendirme uzmanisin. "${ders}" dersi icin ${sinif}. sinif mufredatinin TAMAMINI dengeli kapsayan, gercek sinav zorlugunda ${soruSayisi || 20} coktan secmeli soru hazirla. Zorluk dagilimi: %20 kolay, %55 orta, %25 zor. Her soru gercekci bir baglam/senaryo icinde kurulsun, soyut olmasin. Celdiriciler spesifik kavram yanilgilarini yansitsin. Her soru icin "aciklama" alaninda dogru cevabin nedenini anlat. SADECE JSON dondur, markdown kullanma. Tum metinler SADECE Turkce olmali:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"..."}]`;
    const cevap = await aiCagir({ prompt: p, maxTokens: Math.min(8000, 500 + (soruSayisi || 20) * 480), jsonModu: true });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const baslangic = temiz.indexOf("[");
    const bitis = temiz.lastIndexOf("]");
    if (baslangic === -1 || bitis === -1) throw new Error("Sorular uretilemedi");
    const sorular = JSON.parse(temiz.slice(baslangic, bitis + 1));
    if (!Array.isArray(sorular) || sorular.length === 0) throw new Error("Gecerli soru uretilemedi");

    const simdi = new Date();
    const acilis = simdi;
    const kapanis = new Date(simdi.getTime() + (acikKalmaSaati || 24) * 60 * 60 * 1000);

    const sonuc = await sql`
      INSERT INTO ulusal_denemeler (ad, sinif, ders, sorular, acilis, kapanis)
      VALUES (${ad}, ${sinif}, ${ders}, ${JSON.stringify(sorular)}, ${acilis.toISOString()}, ${kapanis.toISOString()})
      RETURNING id
    `;
    return Response.json({ id: sonuc[0].id, soruSayisi: sorular.length, acilis, kapanis });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Olusturulamadi: " + e.message }, { status: 500 });
  }
}
