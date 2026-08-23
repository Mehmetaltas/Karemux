import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ucretsiz ulusal-deneme/gonder'in aynisi AMA once kullanicinin kurumunun
// bu SPESIFIK denemeyi satin alip almadigini (odendi=true) kontrol ediyor.
export async function POST(req) {
  try {
    const { denemeId, cevaplar, cihazId } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const kullanici = await sql`SELECT kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    const kurumId = kullanici[0]?.kurum_id;
    if (!kurumId) {
      return Response.json({ error: "Bu deneme sadece bir kuruma bagli ogrenciler icin - kurum baglantin yok" }, { status: 403 });
    }

    const satinAlma = await sql`
      SELECT 1 FROM kurum_deneme_satin_alma WHERE kurum_id = ${kurumId} AND deneme_id = ${denemeId} AND odendi = true
    `;
    if (satinAlma.length === 0) {
      return Response.json({ error: "Kurumun bu denemeye erisimi yok" }, { status: 403 });
    }

    const deneme = await sql`SELECT sorular, ders FROM ucretli_denemeler WHERE id = ${denemeId} AND aktif = true`;
    if (deneme.length === 0) return Response.json({ error: "Deneme bulunamadi" }, { status: 404 });

    const zaten = await sql`SELECT id FROM ucretli_deneme_sonuclari WHERE deneme_id = ${denemeId} AND kullanici_id = ${kullaniciId}`;
    if (zaten.length > 0) return Response.json({ error: "Bu denemeyi zaten cozdun" }, { status: 400 });

    const sorular = deneme[0].sorular;
    let dogru = 0, yanlis = 0, bos = 0;
    const yanlisSoruNo = [], bosSoruNo = [];
    for (let i = 0; i < sorular.length; i++) {
      const verilen = cevaplar[i];
      if (verilen === undefined || verilen === null) { bos++; bosSoruNo.push(i + 1); }
      else if (verilen === sorular[i].dogruIndex) dogru++;
      else { yanlis++; yanlisSoruNo.push(i + 1); }
    }
    const net = Math.max(0, dogru - yanlis / 3);

    await sql`
      INSERT INTO ucretli_deneme_sonuclari (deneme_id, kullanici_id, kurum_id, dogru, yanlis, bos, net)
      VALUES (${denemeId}, ${kullaniciId}, ${kurumId}, ${dogru}, ${yanlis}, ${bos}, ${net})
    `;

    // Zenginlestirilmis karne verisi - ulusal-deneme/gonder ile AYNI desen
    // (siralama, yuzdelik dilim), UZERINE kurum ortalamasi karsilastirmasi eklendi
    // (Pozitif ornegindeki "sube/okul ortalamasi" mantigi - kurumun KENDI
    // ogrencileri arasindaki karsilastirma, disaridaki kurumlarla degil).
    const kurumSiralama = await sql`SELECT net FROM ucretli_deneme_sonuclari WHERE deneme_id = ${denemeId} AND kurum_id = ${kurumId} ORDER BY net DESC`;
    const kurumKatilimci = kurumSiralama.length;
    const kurumSiram = kurumSiralama.findIndex((r) => Number(r.net) <= net) + 1;
    const kurumOrtalama = kurumKatilimci > 0 ? Math.round((kurumSiralama.reduce((t, r) => t + Number(r.net), 0) / kurumKatilimci) * 100) / 100 : null;

    const genelSiralama = await sql`SELECT net FROM ucretli_deneme_sonuclari WHERE deneme_id = ${denemeId} ORDER BY net DESC`;
    const genelKatilimci = genelSiralama.length;
    const genelSiram = genelSiralama.findIndex((r) => Number(r.net) <= net) + 1;
    const genelOrtalama = genelKatilimci > 0 ? Math.round((genelSiralama.reduce((t, r) => t + Number(r.net), 0) / genelKatilimci) * 100) / 100 : null;

    const cevapAnahtari = sorular.map((s) => ({ dogruIndex: s.dogruIndex, aciklama: s.aciklama || null }));

    return Response.json({
      dogru, yanlis, bos, net,
      yanlisSoruNo, bosSoruNo, cevapAnahtari,
      kurumSiram, kurumKatilimci, kurumOrtalama,
      genelSiram, genelKatilimci, genelOrtalama,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Gonderilemedi: " + e.message }, { status: 500 });
  }
}
