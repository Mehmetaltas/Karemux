import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";
import { aiCagir } from "@/lib/ai";
import { gunlukLimitKontrolEt } from "@/lib/ratelimit";

// Veli AI Asistani: veli serbest metinle soru sorar, gercek ogrenci verisine
// dayanan, eyleme donuk bir cevap alir. AI Privacy Shield ilkesine uyulur:
// ogrencinin GERCEK ADI AI'a hic gonderilmez, sadece "ogrenciniz" denir.
export async function POST(req) {
  try {
    const veliId = oturumdanKullaniciId(req);
    if (!veliId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const { ogrenciId, soru } = await req.json();
    if (!ogrenciId || !soru || typeof soru !== "string" || soru.length > 500) {
      return Response.json({ error: "Gecersiz istek" }, { status: 400 });
    }

    const baglanti = await sql`SELECT 1 FROM veli_ogrenci WHERE veli_id = ${veliId} AND ogrenci_id = ${ogrenciId}`;
    if (baglanti.length === 0) return Response.json({ error: "Bu ogrenciye erisim yetkin yok" }, { status: 403 });

    const limit = await gunlukLimitKontrolEt(req, null);
    if (!limit.izinVar) {
      return Response.json({ error: `Gunluk ucretsiz kullanim hakkin doldu (${limit.limit}/gun).` }, { status: 429 });
    }

    const ogrenciSatiri = await sql`SELECT sinif FROM kullanicilar WHERE id = ${ogrenciId}`;
    const sinif = ogrenciSatiri[0]?.sinif;

    const netSatirlari = await sql`
      SELECT ders, AVG(net)::numeric(5,2) AS ortalama_net, COUNT(*)::int AS test_sayisi
      FROM sinav_sonuclari
      WHERE kullanici_id = ${ogrenciId} AND olusturulma >= now() - interval '30 days' AND (tur = 'deneme' OR tur = 'yazili')
      GROUP BY ders
    `;
    const hataGrup = await sql`
      SELECT ders, alt_konu, COUNT(*)::int AS hata_sayisi
      FROM hata_kitapcigi
      WHERE kullanici_id = ${ogrenciId} AND cozuldu = false AND alt_konu IS NOT NULL
      GROUP BY ders, alt_konu
      ORDER BY hata_sayisi DESC
      LIMIT 5
    `;
    const aktifGunler = await sql`
      SELECT COUNT(*)::int AS gun FROM gunluk_kullanim
      WHERE kullanici_id = ${ogrenciId} AND tarih >= (CURRENT_DATE - interval '7 days') AND ai_istek_sayisi > 0
    `;

    const veriMetni = [
      sinif ? `Sinif: ${sinif}` : "",
      netSatirlari.length > 0 ? `Son 30 gun ders bazinda ortalama net: ${netSatirlari.map((r) => `${r.ders}: ${r.ortalama_net} (${r.test_sayisi} test)`).join(", ")}` : "Son 30 gunde deneme/yazili verisi yok",
      hataGrup.length > 0 ? `En cok zorlandigi konular: ${hataGrup.map((r) => `${r.ders}/${r.alt_konu} (${r.hata_sayisi} hata)`).join(", ")}` : "Belirgin zayif konu yok",
      `Bu hafta aktif calisma gunu: ${aktifGunler[0]?.gun || 0}/7`,
    ].filter(Boolean).join("\n");

    const p = `Sen bir egitim danismanisin, bir velinin sorusunu yanitliyorsun. ASAGIDAKI GERCEK VERIYE dayanarak, samimi ama net, EYLEME DONUK bir cevap ver (sadece durumu ozetleme, somut bir oneri de ver - orn "bugun X yerine Y yapmasini onerebilirsin"). Ogrencinin ismini KULLANMA, "ogrenciniz"/"cocugunuz" de. 100-150 kelime, SADECE Turkce, markdown kullanma.

OGRENCI VERISI:
${veriMetni}

VELININ SORUSU: "${soru}"`;

    const cevap = await aiCagir({ prompt: p, maxTokens: 500 });
    return Response.json({ cevap });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Cevap alinamadi: " + e.message }, { status: 502 });
  }
}
