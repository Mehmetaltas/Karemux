import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { puanla, PUANLAMA_SURUMU } from "@/lib/puanlama";

// Cevaplanan sorulari degerlendirir. Yanlis cevaplanan HER unite icin,
// seviye_tespit_kademe tablosunda kademe=1 (tamamlanmamis) bir satir acar -
// boylece "3 kademeli tamamlama" sureci baslamis olur.
//
// Faz E: puanlama SUNUCUDA. Istemci yalnizca { testId, cevaplar } gonderir;
// dogru cevaplar seviye_tespit_sinavlari'ndan okunur. Istemcinin bildirdigi
// "dogruMu" ARTIK kabul edilmez. Her sinav tek kullanimliktir.
export async function POST(req) {
  try {
    const { cihazId, testId, cevaplar } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });
    if (testId == null || !/^\d+$/.test(String(testId)) || !cevaplar || typeof cevaplar !== "object") {
      return Response.json({ error: "Sinav bilgisi eksik, sayfayi yenileyip sinavi yeniden baslat" }, { status: 400 });
    }

    // Atomik tek kullanim: ayni sinav ikinci kez gonderilemez, baskasinin sinavi gonderilemez.
    const sinav = await sql`
      UPDATE seviye_tespit_sinavlari SET kullanildi = true
      WHERE id = ${testId} AND kullanici_id = ${kullaniciId} AND kullanildi = false
      RETURNING sorular
    `;
    if (sinav.length === 0) {
      return Response.json({ error: "Sinav bulunamadi veya zaten gonderilmis" }, { status: 400 });
    }
    const sorular = sinav[0].sorular;
    const puan = puanla(sorular, cevaplar);
    const dogruSayisi = puan.dogru;
    const zayifOlanlar = puan.satirlar.filter((s) => s.durum !== "dogru").map((s) => s.soru);

    for (const z of zayifOlanlar) {
      await sql`
        INSERT INTO seviye_tespit_kademe (kullanici_id, ders, unite, kaynak_sinif, kademe, tamamlandi)
        VALUES (${kullaniciId}, ${z.ders}, ${z.unite}, ${z.sinif}, 1, false)
        ON CONFLICT (kullanici_id, ders, unite, kaynak_sinif) DO NOTHING
      `;
    }

    // 12 Ekim: Dalga 9 (Sinav Merkezi) 2. adim - sinav-sonuc'taki AYNI cografi
    // snapshot deseni (bkz KAREMUX-DALGA9-10-TARA-RAPORU-v1.md). kullanicilar'daki
    // hedef_il/hedef_ilce/kurum_id kayit aninda KOPYALANIR, kullanici sonra
    // bu bilgileri degistirse bile o anki sonuc kaydi bozulmaz.
    const kullaniciSatiri = await sql`SELECT hedef_il, hedef_ilce, kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    const il = kullaniciSatiri[0]?.hedef_il || null;
    const ilce = kullaniciSatiri[0]?.hedef_ilce || null;
    const kurumId = kullaniciSatiri[0]?.kurum_id || null;

    await sql`
      INSERT INTO seviye_tespit_sonuc (kullanici_id, toplam_soru, dogru_sayisi, zayif_unite_sayisi, il, ilce, kurum_id, puanlama_surumu)
      VALUES (${kullaniciId}, ${sorular.length}, ${dogruSayisi}, ${zayifOlanlar.length}, ${il}, ${ilce}, ${kurumId}, ${PUANLAMA_SURUMU})
    `;

    return Response.json({ ok: true, dogruSayisi, toplam: sorular.length, zayifUniteSayisi: zayifOlanlar.length });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
