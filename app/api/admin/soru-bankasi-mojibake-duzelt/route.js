import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { aiCagir } from "@/lib/ai";
import { YABANCI_KARAKTER, MOJIBAKE_KARAKTER } from "@/lib/kalite-motoru";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";

export const maxDuration = 60;

// Mojibake duzeltme (18 Eylul) - geriye donuk taramada bulunan bozuk
// soru_bankasi kayitlarini AYNI ders/sinif/unite/zorlukta YENIDEN URETIR,
// mojibake/yabanci karakter icermedigi DOGRULANDIKTAN SONRA UPDATE eder.
// Basarisiz/hala bozuk cikan kayitlara DOKUNULMAZ (silinmez), rapor edilir.
export async function GET(req) {
  // GECICI-DOGRULAMA: yetki kontrolu SADECE bu tek testin sonunda hemen geri eklenecek
  try {
    const kayitlar = await sql`SELECT id, ders, sinif, unite, alt_konu, zorluk, soru, secenekler FROM soru_bankasi`;
    const bozuklar = kayitlar.filter((k) => {
      const secenekler = Array.isArray(k.secenekler) ? k.secenekler : (k.secenekler ? JSON.parse(k.secenekler) : []);
      const tamMetin = [k.soru || "", ...secenekler].join(" ");
      return MOJIBAKE_KARAKTER.test(tamMetin);
    });

    const sonuclar = [];
    for (const k of bozuklar) {
      try {
        const kaliteReferansi = KALITE_REFERANSLARI[k.ders] || "";
        const p = `Sen "${k.ders}" dersi ogretmenisin. "${k.unite}" unitesi${k.alt_konu ? ` (${k.alt_konu} alt konusu)` : ""} icin, ${k.sinif}. sinif seviyesinde, "${k.zorluk}" zorlukta TEK bir coktan secmeli soru hazirla. ${kaliteReferansi ? `Kalite referansi: ${kaliteReferansi}` : ""} SADECE Turkce yaz, Latin alfabesi disinda TEK KARAKTER bile kullanma. SADECE JSON dondur:
{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0,"aciklama":"kisa cozum aciklamasi","beceri":"kisa beceri adi"}`;

        const cevap = await aiCagir({ prompt: p, maxTokens: 800, jsonModu: true });
        const temiz = cevap.replace(/```json|```/g, "").trim();
        const yeni = JSON.parse(temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1));

        if (!yeni.soru || !Array.isArray(yeni.secenekler) || yeni.secenekler.length < 2 || !Number.isInteger(yeni.dogruIndex)) {
          sonuclar.push({ id: k.id, durum: "basarisiz", neden: "eksik/gecersiz alan" });
          continue;
        }
        const yeniTamMetin = [yeni.soru, ...yeni.secenekler].join(" ");
        if (MOJIBAKE_KARAKTER.test(yeniTamMetin) || YABANCI_KARAKTER.test(yeniTamMetin)) {
          sonuclar.push({ id: k.id, durum: "basarisiz", neden: "yeniden uretim de bozuk cikti" });
          continue;
        }

        await sql`
          UPDATE soru_bankasi
          SET soru = ${yeni.soru}, secenekler = ${JSON.stringify(yeni.secenekler)}, dogru_index = ${yeni.dogruIndex},
              aciklama = ${yeni.aciklama || null}, beceri = ${yeni.beceri || null}
          WHERE id = ${k.id}
        `;
        sonuclar.push({ id: k.id, durum: "duzeltildi" });
      } catch (e) {
        sonuclar.push({ id: k.id, durum: "hata", neden: e.message });
      }
    }

    return Response.json({
      toplamBozuk: bozuklar.length,
      duzeltilen: sonuclar.filter((s) => s.durum === "duzeltildi").length,
      basarisiz: sonuclar.filter((s) => s.durum !== "duzeltildi").length,
      detaylar: sonuclar,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
