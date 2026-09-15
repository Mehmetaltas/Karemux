import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { aiCagir } from "@/lib/ai";

// 227 eski soru zorluk-etiketsiz kalmis (Tutarlilik Denetimi ile bulundu,
// 14 Eylul) - 7 Eylul'deki prompt duzeltmesinden ONCE uretilmislerdi.
// Bu route, 30'luk gruplar halinde AI'ya sorulari gosterip zorluk
// (kolay/orta/zor) siniflandirmasi istiyor ve DB'ye yaziyor.
export async function GET(req) {
  const sifreParam = new URL(req.url).searchParams.get("sifre");
  const otomasyonGecerli = sifreParam && sifreParam === process.env.ULUSAL_DENEME_YONETICI_SIFRESI;
  if (!otomasyonGecerli && !(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const GRUP_BUYUKLUGU = 30;
    const sorular = await sql`
      SELECT id, ders, sinif, soru FROM soru_bankasi
      WHERE kaynak_turu IN ('ders_seviye', 'gecen_yil_genel', 'otomatik_arkaplan', 'yeniden_uretim_7eylul')
      AND zorluk IS NULL
      ORDER BY id
      LIMIT ${GRUP_BUYUKLUGU}
    `;

    if (sorular.length === 0) {
      return Response.json({ ok: true, kalan: 0, mesaj: "Hepsi etiketlendi." });
    }

    const soruListesi = sorular.map((s) => `${s.id}: [${s.ders}, ${s.sinif}.sinif] ${s.soru}`).join("\n");
    const p = `Sen bir LGS/ortaokul olcme-degerlendirme uzmanisin. Asagidaki sorularin HER BIRI icin zorluk seviyesini (kolay/orta/zor) belirle. KOLAY = tek adimda dogrudan kazanim/kavram hatirlama. ORTA = 2 adimli uygulama. ZOR = cok asamali muhakeme/analiz gerektirir. Sorular:\n${soruListesi}\n\nSADECE JSON dondur, markdown kullanma: {"etiketler":[{"id":31,"zorluk":"kolay"}, ...]} (id'ler yukarida verilen gercek id numaralari olmali, TUM sorular icin bir tane olmali)`;

    const cevap = await aiCagir({ prompt: p, maxTokens: 2000, jsonModu: true, tur: "zorluk_etiketle" });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const veri = JSON.parse(temiz.slice(temiz.indexOf("{"), temiz.lastIndexOf("}") + 1));

    let guncellenen = 0;
    for (const e of veri.etiketler || []) {
      if (!["kolay", "orta", "zor"].includes(e.zorluk)) continue;
      await sql`UPDATE soru_bankasi SET zorluk = ${e.zorluk} WHERE id = ${e.id}`;
      guncellenen++;
    }

    const kalanSayi = await sql`
      SELECT COUNT(*)::int AS adet FROM soru_bankasi
      WHERE kaynak_turu IN ('ders_seviye', 'gecen_yil_genel', 'otomatik_arkaplan', 'yeniden_uretim_7eylul')
      AND zorluk IS NULL
    `;

    return Response.json({ ok: true, buTurGuncellenen: guncellenen, kalan: kalanSayi[0].adet });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
