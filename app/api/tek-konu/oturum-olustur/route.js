import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";
import { istemciSorusu } from "@/lib/sinav-uretimi";
import { istemMetni } from "@/lib/pratik-uretimi";
import { tekKonuHavuzdanGetir, tekKonuSorulariUret } from "@/lib/tek-konu-sorulari";

export const maxDuration = 60;

// Faz E (20 Ekim): tek konu oturumunun SORULARI sunucuda hazirlanir; tarayicidan yalnizca
// { sinif, ders, unite, konu, anlatim } gelir. Cevap anahtari tek_konu_oturumu'nda kalir,
// tarayiciya cevapsiz sorular doner. Anahtar ancak /tamamla'dan sonra gelir.
export async function POST(req) {
  try {
    const g = await req.json();
    if (g.v !== 2) return Response.json({ error: "Sayfa guncellendi, lutfen sayfayi yenile" }, { status: 409 });
    const kullaniciId = await kullaniciIdCoz(req, g.cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const ders = istemMetni(g.ders, 100);
    const konu = istemMetni(g.konu, 300);
    const uniteHam = g.unite == null || g.unite === "" ? null : istemMetni(g.unite, 150);
    const anlatim = typeof g.anlatim === "string" ? g.anlatim.trim() : "";
    if (!ders || !konu || !Number.isInteger(g.sinif) || g.sinif < 1 || g.sinif > 12
      || (g.unite != null && g.unite !== "" && !uniteHam) || !anlatim || anlatim.length > 30000) {
      return Response.json({ error: "Eksik veya gecersiz bilgi" }, { status: 400 });
    }
    const sinif = g.sinif;

    let sorular = await tekKonuHavuzdanGetir({ sinif, ders, unite: uniteHam, konu });
    if (!sorular) {
      const limit = await gunlukLimitKontrolEt(req, g.cihazId);
      if (!limit.izinVar) {
        return Response.json({ error: limit.premium ? `Bugunluk yogun kullanim sinirina ulastin (${limit.limit}/gun), yarin devam edebilirsin.` : `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun). Premium ile daha fazla kullanabilirsin.` }, { status: 429 });
      }
      try {
        sorular = await tekKonuSorulariUret({ sinif, ders, unite: uniteHam, konu });
      } catch (e) {
        console.error("Tek konu sorulari uretilemedi:", e.message);
        return Response.json({ error: "Sorular uretilemedi, tekrar dene" }, { status: 502 });
      }
    }

    const sonuc = await sql`
      INSERT INTO tek_konu_oturumu (kullanici_id, sinif, ders, unite, konu, anlatim, sorular)
      VALUES (${kullaniciId}, ${sinif}, ${ders}, ${uniteHam}, ${konu}, ${anlatim}, ${JSON.stringify(sorular)})
      RETURNING id
    `;

    return Response.json({ ok: true, oturumId: sonuc[0].id, sorular: sorular.map(istemciSorusu) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Oturum olusturulamadi" }, { status: 500 });
  }
}
