import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { denemeKulubuUyeMi } from "@/lib/deneme-kulubu";
import { kitapcikOlustur, puanla, PUANLAMA_SURUMU } from "@/lib/puanlama";

// Ucretsiz ulusal-deneme/gonder'in aynisi AMA once kullanicinin kurumunun
// bu SPESIFIK denemeyi satin alip almadigini (odendi=true) kontrol ediyor.
// 4 Eylul: alt konu karnesi + hata_kitapcigi kaydi eklendi (ulusal deneme
// servisindeki (VPS) ile ayni zenginlik seviyesine getirildi).
export async function POST(req) {
  try {
    const { denemeId, cevaplar, cihazId } = await req.json();
    if (denemeId == null || !/^\d+$/.test(String(denemeId))) return Response.json({ error: "denemeId gerekli" }, { status: 400 });
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    // 24 Eylul - Deneme Kulubu (MASTER v2): bireysel uye ise kurum/satin-alma
    // GEREKMEZ - kurum_id NULL kalir (asagida siralama bunu dogru ele alir).
    const uyelik = await denemeKulubuUyeMi(kullaniciId);
    let kurumId = null;
    if (!uyelik.uye) {
      const kullanici = await sql`SELECT kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
      kurumId = kullanici[0]?.kurum_id;
      if (!kurumId) {
        return Response.json({ error: "Bu deneme sadece bir kuruma bagli ogrenciler icin - kurum baglantin yok" }, { status: 403 });
      }

      const satinAlma = await sql`
        SELECT 1 FROM kurum_deneme_satin_alma WHERE kurum_id = ${kurumId} AND deneme_id = ${denemeId} AND odendi = true
      `;
      if (satinAlma.length === 0) {
        return Response.json({ error: "Kurumun bu denemeye erisimi yok" }, { status: 403 });
      }
    }

    const deneme = await sql`SELECT sorular, ders FROM ucretli_denemeler WHERE id = ${denemeId} AND aktif = true`;
    if (deneme.length === 0) return Response.json({ error: "Deneme bulunamadi" }, { status: 404 });

    const zaten = await sql`SELECT id FROM ucretli_deneme_sonuclari WHERE deneme_id = ${denemeId} AND kullanici_id = ${kullaniciId}`;
    if (zaten.length > 0) return Response.json({ error: "Bu denemeyi zaten cozdun" }, { status: 400 });

    const ders = deneme[0].ders;
    // Faz E: ogrenci SORULAR ucunda kullaniciId-denemeId seed'iyle KARISTIRILMIS
    // kitapcigi gordu ve cevaplari o siraya gore verdi. Puanlama ayni kitapcik
    // yeniden kurularak yapilir (onceki surum orijinal siraya gore puanliyordu).
    const sorular = kitapcikOlustur(deneme[0].sorular, `${kullaniciId}-${denemeId}`);
    const puan = puanla(sorular, cevaplar);
    const { dogru, yanlis, bos, net } = puan;
    const yanlisSoruNo = [], bosSoruNo = [];
    const altKonuOzet = {};
    const hataSatirlari = [];
    for (const sat of puan.satirlar) {
      const s = sat.soru;
      const altKonu = s.altKonu || "Genel";
      if (!altKonuOzet[altKonu]) altKonuOzet[altKonu] = { dogru: 0, yanlis: 0, bos: 0 };
      if (sat.durum === "bos") {
        bosSoruNo.push(sat.no); altKonuOzet[altKonu].bos++;
      } else if (sat.durum === "dogru") {
        altKonuOzet[altKonu].dogru++;
      } else {
        yanlisSoruNo.push(sat.no); altKonuOzet[altKonu].yanlis++;
        hataSatirlari.push([kullaniciId, ders, altKonu, s.soru, JSON.stringify(s.secenekler), s.dogruIndex, sat.verilen, s.aciklama || null]);
      }
    }

    // 12 Ekim: Dalga 9 (Sinav Merkezi) 3. adim - sinav-sonuc/seviye-tespit'teki
    // AYNI cografi snapshot deseni (bkz KAREMUX-DALGA9-10-TARA-RAPORU-v1.md).
    // kullanicilar'daki hedef_il/hedef_ilce kayit aninda KOPYALANIR, kullanici
    // sonra bu bilgileri degistirse bile o anki sonuc kaydi bozulmaz.
    const kullaniciSatiri = await sql`SELECT hedef_il, hedef_ilce FROM kullanicilar WHERE id = ${kullaniciId}`;
    const il = kullaniciSatiri[0]?.hedef_il || null;
    const ilce = kullaniciSatiri[0]?.hedef_ilce || null;

    // Faz E: atomik tek-gonderim korumasi. SELECT-sonra-INSERT yarisa aciktı
    // (ayni anda iki istek ikisi de gecebilirdi); artik tek ifade icinde
    // "yoksa ekle" yapilir, UNIQUE index varsa 23505 de ayni sekilde ele alinir.
    let eklenen;
    try {
      eklenen = await sql`
        INSERT INTO ucretli_deneme_sonuclari (deneme_id, kullanici_id, kurum_id, dogru, yanlis, bos, net, il, ilce, puanlama_surumu)
        SELECT ${denemeId}, ${kullaniciId}, ${kurumId}, ${dogru}, ${yanlis}, ${bos}, ${net}, ${il}, ${ilce}, ${PUANLAMA_SURUMU}
        WHERE NOT EXISTS (
          SELECT 1 FROM ucretli_deneme_sonuclari WHERE deneme_id = ${denemeId} AND kullanici_id = ${kullaniciId}
        )
        RETURNING id
      `;
    } catch (e) {
      if (e && e.code === "23505") eklenen = [];
      else throw e;
    }
    if (eklenen.length === 0) return Response.json({ error: "Bu denemeyi zaten cozdun" }, { status: 400 });

    // Hata kitapcigi: sonuc satiri alindiktan SONRA yazilir (cift gonderimde tekrar yazilmaz).
    // Secenekler ve indeksler ogrencinin GORDUGU kitapcik sirasindadir.
    if (hataSatirlari.length > 0) {
      try {
        for (const h of hataSatirlari) {
          await sql`
            INSERT INTO hata_kitapcigi (kullanici_id, ders, alt_konu, soru, secenekler, dogru_index, verilen_index, aciklama)
            VALUES (${h[0]}, ${h[1]}, ${h[2]}, ${h[3]}, ${h[4]}, ${h[5]}, ${h[6]}, ${h[7]})
          `;
        }
      } catch (e) { console.error("Hata kitapcigi kaydi basarisiz:", e); }
    }

    // 24 Eylul: GERCEK testte bulundu - DB net'i yuvarlanmis (numeric kolon)
    // saklarken JS'deki HAM (yuvarlanmamis) net ile karsilastirma yapiliyordu,
    // bu da kendi sonucunu bulamayip siram=0 donmesine yol aciyordu (1 olmasi
    // gerekirken). Karsilastirma da AYNI yuvarlanmis hassasiyetle yapiliyor simdi.
    const netYuvarlanmis = Math.round(net * 100) / 100;
    // kurumId null ise (Deneme Kulubu bireysel uyesi) kurum siralamasi anlamsiz - atlanir.
    let kurumKatilimci = null, kurumSiram = null, kurumOrtalama = null;
    if (kurumId) {
      const kurumSiralama = await sql`SELECT net FROM ucretli_deneme_sonuclari WHERE deneme_id = ${denemeId} AND kurum_id = ${kurumId} ORDER BY net DESC`;
      kurumKatilimci = kurumSiralama.length;
      kurumSiram = kurumSiralama.findIndex((r) => Number(r.net) <= netYuvarlanmis) + 1;
      kurumOrtalama = kurumKatilimci > 0 ? Math.round((kurumSiralama.reduce((t, r) => t + Number(r.net), 0) / kurumKatilimci) * 100) / 100 : null;
    }

    const genelSiralama = await sql`SELECT net FROM ucretli_deneme_sonuclari WHERE deneme_id = ${denemeId} ORDER BY net DESC`;
    const genelKatilimci = genelSiralama.length;
    const genelSiram = genelSiralama.findIndex((r) => Number(r.net) <= netYuvarlanmis) + 1;
    const genelOrtalama = genelKatilimci > 0 ? Math.round((genelSiralama.reduce((t, r) => t + Number(r.net), 0) / genelKatilimci) * 100) / 100 : null;

    const karne = Object.keys(altKonuOzet).map((k) => ({ altKonu: k, ...altKonuOzet[k] }));
    // Kitapcik sirasinda: ekranda gorulen soru sirasiyla birebir eslesir.
    const cevapAnahtari = sorular.map((s) => ({ dogruIndex: s.dogruIndex, aciklama: s.aciklama || null }));

    return Response.json({
      dogru, yanlis, bos, net,
      yanlisSoruNo, bosSoruNo, cevapAnahtari, karne,
      kurumSiram, kurumKatilimci, kurumOrtalama,
      genelSiram, genelKatilimci, genelOrtalama,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Gonderilemedi: " + e.message }, { status: 500 });
  }
}
