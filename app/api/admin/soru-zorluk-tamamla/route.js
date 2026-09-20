import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { aiCagir } from "@/lib/ai";
import { jsonAyikla } from "@/lib/json-ayikla";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Zorluk etiketi eksik soruları (icerik degismez) AI'ya siniflandirtir.
// 227 kayit tek istekte sigmayabilir - zaman asimina yaklasinca durur,
// tekrar cagrilinca (HALA zorluk IS NULL olanlari sectigi icin) idempotent
// sekilde kaldigi yerden devam eder.
export async function GET(req) {
  if (!(await personelAdminMi(req))) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const baslangicZamani = Date.now();
  const ZAMAN_BUDCESI_MS = 45000; // 45sn sonra dur, 60sn siniri icin pay birak

  try {
    const eksikler = await sql`SELECT id, ders, sinif, soru, secenekler FROM soru_bankasi WHERE zorluk IS NULL OR zorluk = '' ORDER BY id LIMIT 250`;

    let toplamGuncellenen = 0;
    let toplamBasarisiz = 0;
    const grupBoyutu = 20;

    for (let i = 0; i < eksikler.length; i += grupBoyutu) {
      if (Date.now() - baslangicZamani > ZAMAN_BUDCESI_MS) break;

      const grup = eksikler.slice(i, i + grupBoyutu);
      const soruListesi = grup.map((s, idx) => {
        const secenekler = Array.isArray(s.secenekler) ? s.secenekler : (s.secenekler ? JSON.parse(s.secenekler) : []);
        return `${idx + 1}. [id:${s.id}] (${s.ders}, ${s.sinif}.sinif) ${s.soru} | Secenekler: ${secenekler.join(" / ")}`;
      }).join("\n");

      const p = `Sen deneyimli bir ogretmensin. Asagidaki sorularin HER BIRI icin zorluk seviyesini belirle: "kolay", "orta" veya "zor". Kritere gore degerlendir: kolay=temel bilgi/dogrudan uygulama, orta=birden fazla adim/kavram birlestirme, zor=derin analiz/coklu adim/ceza noktasi iceren.

${soruListesi}

SADECE JSON dizisi dondur, HER soru icin id ve zorluk, sirayla:
[{"id":123,"zorluk":"kolay"}]`;

      try {
        const cevap = await aiCagir({ prompt: p, maxTokens: 1500, jsonModu: true });
        const sonuclar = jsonAyikla(cevap.startsWith("[") ? `{"veri":${cevap}}` : cevap);
        const dizi = Array.isArray(sonuclar) ? sonuclar : sonuclar.veri;

        for (const s of dizi || []) {
          if (!s.id || !["kolay", "orta", "zor"].includes(s.zorluk)) continue;
          await sql`UPDATE soru_bankasi SET zorluk = ${s.zorluk} WHERE id = ${s.id}`;
          toplamGuncellenen++;
        }
        toplamBasarisiz += grup.length - (dizi?.length || 0);
      } catch (e) {
        console.error("Grup basarisiz:", e.message);
        toplamBasarisiz += grup.length;
      }
    }

    const kalanSayisi = await sql`SELECT COUNT(*) as sayi FROM soru_bankasi WHERE zorluk IS NULL OR zorluk = ''`;

    return Response.json({
      buCagridaGuncellenen: toplamGuncellenen,
      buCagridaBasarisiz: toplamBasarisiz,
      kalanToplam: kalanSayisi[0].sayi,
      tamamlandiMi: Number(kalanSayisi[0].sayi) === 0,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
