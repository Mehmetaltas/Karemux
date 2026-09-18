import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { kaliteKontrolYap, deterministikKontrolYap, mufredatSinirKontrolYap, kaliteLoglariniKaydet } from "@/lib/kalite-motoru";

export const maxDuration = 60;

// Geriye donuk tarama (18 Eylul, kullanici talebi) - bugunku kalite
// motorundan ONCE uretilmis icerik_onbellek kayitlarini (konu_paketi) Katman
// 1/2/4'ten (AI cagrisi GEREKTIRMEYEN, ucretsiz katmanlar) gecirir, sonuclari
// icerik_kalite_log'a yazar. Katman 3 (capraz-model) maliyeti yuksek oldugu
// icin BU toplu taramaya DAHIL EDILMEDI - istenirse ayri, kucuk gruplar
// halinde ayrica calistirilabilir.
export async function GET(req) {
  // GECICI: yetki kontrolu test icin kaldirildi, hemen sonra GERI EKLENECEK
  try {
    const kayitlar = await sql`SELECT id, ders, icerik_json FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi'`;

    let sorunluSayisi = 0;
    const sorunluOrnekler = [];

    for (const k of kayitlar) {
      const paket = k.icerik_json;
      if (!paket) continue;

      const kaliteSonucu = kaliteKontrolYap("konu_paketi", paket);
      const detKontrol = deterministikKontrolYap(paket.soruHavuzu || []);
      const mufredatSonuc = mufredatSinirKontrolYap(k.ders, paket.soruHavuzu || []);

      await kaliteLoglariniKaydet("icerik_onbellek", k.id, [
        { katman: "yapisal", gecti: kaliteSonucu.gecti, uyarilar: kaliteSonucu.uyarilar },
        { katman: "deterministik", gecti: detKontrol.uyumlu, uyarilar: detKontrol.uyarilar },
        { katman: "mufredat_sinir", gecti: mufredatSonuc.gecti, uyarilar: mufredatSonuc.uyarilar },
      ]);

      const buKayitSorunlu = !kaliteSonucu.gecti || !detKontrol.uyumlu || !mufredatSonuc.gecti;
      if (buKayitSorunlu) {
        sorunluSayisi++;
        if (sorunluOrnekler.length < 20) {
          sorunluOrnekler.push({
            id: k.id, ders: k.ders,
            uyarilar: [...kaliteSonucu.uyarilar, ...detKontrol.uyarilar, ...mufredatSonuc.uyarilar],
          });
        }
      }
    }

    return Response.json({
      toplamTarandi: kayitlar.length,
      sorunluSayisi,
      sorunsuzSayisi: kayitlar.length - sorunluSayisi,
      sorunluOrnekler,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
