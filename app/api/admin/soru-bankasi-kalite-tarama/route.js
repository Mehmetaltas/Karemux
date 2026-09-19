import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { YABANCI_KARAKTER, MOJIBAKE_KARAKTER, mufredatSinirKontrolYap, kaliteLoglariniKaydet } from "@/lib/kalite-motoru";

export const maxDuration = 60;

// Geriye donuk tarama (18 Eylul) - soru_bankasi (3136 kayit, eski Materyal
// Motoru'ndan) bugunku kalite motorundan HIC gecmemisti. Katman 1 (yabanci
// karakter/mojibake) + Katman 4 (yapay matematik, sayisal olmayan derslerde)
// - AI cagrisi gerektirmeyen, ucretsiz katmanlar. Eski kayitlarda
// kontrolIfadesi YOK, Katman 2 (deterministik) bu yuzden ATLANDI.
export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const kayitlar = await sql`SELECT id, ders, soru, secenekler FROM soru_bankasi`;

    let sorunluSayisi = 0;
    const sorunluOrnekler = [];
    const dersBazindaSorun = {};

    for (const k of kayitlar) {
      const secenekler = Array.isArray(k.secenekler) ? k.secenekler : (k.secenekler ? JSON.parse(k.secenekler) : []);
      const tamMetin = [k.soru || "", ...secenekler].join(" ");

      const uyarilar = [];
      if (YABANCI_KARAKTER.test(tamMetin)) uyarilar.push("yabanci karakter");
      if (MOJIBAKE_KARAKTER.test(tamMetin)) uyarilar.push("mojibake/bozuk karakter");

      const mufredatSonuc = mufredatSinirKontrolYap(k.ders);
      if (!mufredatSonuc.gecti) uyarilar.push(...mufredatSonuc.uyarilar);

      if (uyarilar.length > 0) {
        await kaliteLoglariniKaydet("soru_bankasi", k.id, [{ katman: "geriye_donuk_tarama", gecti: false, uyarilar }]);
        sorunluSayisi++;
        dersBazindaSorun[k.ders] = (dersBazindaSorun[k.ders] || 0) + 1;
        if (sorunluOrnekler.length < 30) sorunluOrnekler.push({ id: k.id, ders: k.ders, soru: (k.soru || "").slice(0, 80), uyarilar });
      }
    }

    return Response.json({
      toplamTarandi: kayitlar.length,
      sorunluSayisi,
      sorunsuzSayisi: kayitlar.length - sorunluSayisi,
      dersBazindaSorun,
      sorunluOrnekler,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
