import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { puanla, netHesapla } from "@/lib/puanlama";
import { sinavSonucuKaydet } from "@/lib/sinav-sonuc-kaydet";
import { hataKitapcigiKaydet } from "@/lib/hata-kitapcigi-kaydet";

// Faz E - SINAV OTURUMU puanlamasi. Puanlama, hata kitapcigi ve sinav_sonuclari kaydi
// TAMAMEN sunucuda; tarayicidan yalnizca { oturumId, cevaplar } gelir. Cevap anahtari
// ancak sinav gonderildikten SONRA tarayiciya doner. Her oturum tek kullanimliktir.
export async function POST(req) {
  let kullaniciId = null, oturumId = null, talepZamani = null, meta = {};
  try {
    const { cihazId, oturumId: gelenId, cevaplar } = await req.json();
    if (gelenId == null || !/^\d+$/.test(String(gelenId)) || !cevaplar || typeof cevaplar !== "object") {
      return Response.json({ error: "Sinav bilgisi eksik, sinavi yeniden baslat" }, { status: 400 });
    }
    kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    // Atomik tek kullanim: ikinci gonderim ve baskasinin oturumu reddedilir.
    const oturum = await sql`
      UPDATE sinav_oturumlari SET kullanildi = true
      WHERE id = ${gelenId} AND kullanici_id = ${kullaniciId} AND kullanildi = false
      RETURNING id, sorular, meta, now() AS talep
    `;
    if (oturum.length === 0) return Response.json({ error: "Sinav bulunamadi veya zaten gonderilmis" }, { status: 400 });
    oturumId = oturum[0].id;
    talepZamani = oturum[0].talep instanceof Date ? oturum[0].talep.toISOString() : String(oturum[0].talep);

    const sorular = oturum[0].sorular;
    meta = oturum[0].meta || {};
    const puan = puanla(sorular, cevaplar);

    const zorlukKirilim = { kolay: { dogru: 0, toplam: 0 }, orta: { dogru: 0, toplam: 0 }, zor: { dogru: 0, toplam: 0 } };
    const altKonuKirilim = {};
    const hatalar = [];
    for (const sat of puan.satirlar) {
      const s = sat.soru;
      const z = s.zorluk || "orta";
      if (!zorlukKirilim[z]) zorlukKirilim[z] = { dogru: 0, toplam: 0 };
      zorlukKirilim[z].toplam += 1;
      if (sat.durum === "dogru") zorlukKirilim[z].dogru += 1;
      if (s.altKonu) {
        if (!altKonuKirilim[s.altKonu]) altKonuKirilim[s.altKonu] = { dogru: 0, toplam: 0 };
        altKonuKirilim[s.altKonu].toplam += 1;
        if (sat.durum === "dogru") altKonuKirilim[s.altKonu].dogru += 1;
      }
      if (sat.durum === "yanlis") hatalar.push(sat);
    }

    // Ders seviye: sonuc UNITE BASINA ayri satir ("Ders::Unite"), genel satir yazilmaz.
    const dersSeviye = meta.kayitTuru === "ders_seviye";
    const uniteKirilim = {};
    let oncekiNet = null, testNo = 1;
    if (dersSeviye) {
      for (const sat of puan.satirlar) {
        const u = sat.soru.unite || "Genel";
        if (!uniteKirilim[u]) uniteKirilim[u] = { dogru: 0, yanlis: 0, bos: 0, toplam: 0 };
        uniteKirilim[u].toplam += 1;
        uniteKirilim[u][sat.durum === "dogru" ? "dogru" : sat.durum === "yanlis" ? "yanlis" : "bos"] += 1;
      }
      const dersAdi = meta.kayitDersAdi || meta.ders || "Genel";
      for (const u of Object.keys(uniteKirilim)) {
        const k = uniteKirilim[u];
        await sinavSonucuKaydet(kullaniciId, { tur: "ders_seviye", ders: `${dersAdi}::${u}`, dogru: k.dogru, yanlis: k.yanlis, bos: k.bos, net: Math.round(netHesapla(k.dogru, k.yanlis) * 100) / 100 });
      }
    } else {
      ({ oncekiNet, testNo } = await sinavSonucuKaydet(kullaniciId, {
        tur: meta.kayitTuru || "deneme", ders: meta.kayitDersAdi || meta.ders || "Genel",
        dogru: puan.dogru, yanlis: puan.yanlis, bos: puan.bos, net: Math.round(puan.net * 100) / 100,
      }));
    }

    // Yanlis cevaplanan sorular Hata Kitapcigi'na (Koc "odev" olarak takip eder). Hata olsa sonucu bozmaz.
    for (const sat of ((meta.kayitTuru === "gecen_yil_genel" || dersSeviye) ? [] : hatalar)) {
      try {
        await hataKitapcigiKaydet({
          kullaniciId, cihazId, ders: meta.ders, altKonu: sat.soru.altKonu || null, soru: sat.soru.soru,
          secenekler: sat.soru.secenekler, dogruIndex: sat.soru.dogruIndex, verilenIndex: sat.verilen, aciklama: sat.soru.aciklama || null,
        });
      } catch (e) { console.error("Hata kitapcigi kaydi basarisiz:", e.message); }
    }

    return Response.json({
      dogru: puan.dogru, yanlis: puan.yanlis, bos: puan.bos, net: puan.net, toplam: sorular.length,
      zorlukKirilim, altKonuKirilim, uniteKirilim, oncekiNet, testNo, kayitDersAdi: meta.kayitDersAdi || meta.ders || "",
      anahtar: sorular.map((s) => ({ dogruIndex: s.dogruIndex, aciklama: s.aciklama || null })),
    });
  } catch (e) {
    console.error(e);
    // Sonuc satiri YAZILMADIYSA oturumu geri ac ki ogrenci tekrar gonderebilsin
    // (talep aninden sonra bu tur/ders icin sonuc satiri varsa oturum kapali kalir, cift kayit olmaz).
    if (oturumId !== null && talepZamani) {
      try {
        const sonucDers = meta.kayitDersAdi || meta.ders || "Genel";
        const yazildi = meta.kayitTuru === "ders_seviye"
          ? await sql`
            SELECT 1 FROM sinav_sonuclari
            WHERE kullanici_id = ${kullaniciId} AND tur = 'ders_seviye' AND ders LIKE ${sonucDers + "::%"} AND olusturulma >= ${talepZamani}
            LIMIT 1
          `
          : await sql`
            SELECT 1 FROM sinav_sonuclari
            WHERE kullanici_id = ${kullaniciId} AND tur = ${meta.kayitTuru || "deneme"} AND ders = ${sonucDers} AND olusturulma >= ${talepZamani}
            LIMIT 1
          `;
        if (yazildi.length === 0) await sql`UPDATE sinav_oturumlari SET kullanildi = false WHERE id = ${oturumId} AND kullanici_id = ${kullaniciId}`;
      } catch (e2) { console.error("Oturum geri acilamadi:", e2.message); }
    }
    return Response.json({ error: "Sonuc kaydedilemedi, tekrar dene" }, { status: 500 });
  }
}
