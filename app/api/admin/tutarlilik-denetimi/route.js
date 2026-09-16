import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";
import { paketKaliteKontrol } from "@/app/api/konu-paketi/route";

// Tutarlilik Denetimi (14 Eylul) - "Ingilizce'nin tek-seviyeli kaldigi
// fark edilmeden kalmasi" turunden zafiyetlerin OTOMATIK yakalanmasi icin.
// Kalici bir cozum: bu route her calistiginda KALITE_REFERANSLARI'ndaki
// HER dersi tarar, KOLAY/ORTA/ZOR ucunu de icermeyen (tek-seviyeli kalmis)
// referanslari otomatik isaretler - insan "fark edince" degil, sistem
// KENDISI soyler.
export async function GET(req) {
  const sifreParam = new URL(req.url).searchParams.get("sifre");
  const otomasyonGecerli = sifreParam && sifreParam === process.env.ULUSAL_DENEME_YONETICI_SIFRESI;
  if (!otomasyonGecerli && !(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const bulgular = [];

    // 1. Kalite referanslarinin 3-seviyeli olup olmadigi kontrolu
    for (const [ders, aciklama] of Object.entries(KALITE_REFERANSLARI)) {
      const buyukHal = aciklama.toUpperCase();
      const kolayVar = buyukHal.includes("KOLAY");
      const ortaVar = buyukHal.includes("ORTA");
      const zorVar = buyukHal.includes("ZOR");
      if (!(kolayVar && ortaVar && zorVar)) {
        bulgular.push({
          tur: "eksik_seviye_referansi",
          ders,
          detay: `KOLAY:${kolayVar} ORTA:${ortaVar} ZOR:${zorVar} - uc seviye de yok, tek-seviyeli kalmis olabilir`,
        });
      }
    }

    // 2. Soru bankasinda zorluk etiketi HIC dolmamis (kaynak_turu) var mi
    const etiketsizKaynaklar = await sql`
      SELECT kaynak_turu, COUNT(*)::int AS toplam,
        COUNT(*) FILTER (WHERE zorluk IS NOT NULL)::int AS etiketli
      FROM soru_bankasi GROUP BY kaynak_turu
      HAVING COUNT(*) FILTER (WHERE zorluk IS NOT NULL) = 0
    `;
    for (const k of etiketsizKaynaklar) {
      bulgular.push({
        tur: "zorluk_etiketi_hic_yok",
        kaynakTuru: k.kaynak_turu,
        detay: `${k.toplam} soru, hicbirinde zorluk etiketi yok`,
      });
    }

    // 3. mufredat tablosunda hangi ders/sinif kombinasyonlari HIC yok
    const dersSinifKombinasyonlari = await sql`
      SELECT DISTINCT sinif, ders FROM mufredat ORDER BY sinif, ders
    `;

    // 4. konu_paketi kayitlarinin kalite kontrolu (16 Eylul) - eski kayitlarda
    // kaliteKontrol alani hic yok, yeni kayitlarda var ama gecti:false olabilir.
    // Her ikisini de tek seferde taze calistirip yakalar.
    const konuPaketleri = await sql`
      SELECT id, ders, sinif, konu, icerik_json FROM icerik_onbellek
      WHERE icerik_turu = 'konu_paketi'
    `;
    for (const kp of konuPaketleri) {
      const sonuc = paketKaliteKontrol(kp.icerik_json);
      if (!sonuc.gecti) {
        bulgular.push({
          tur: "konu_paketi_kalite_sorunu",
          id: kp.id,
          ders: kp.ders,
          sinif: kp.sinif,
          konu: kp.konu,
          detay: sonuc.uyarilar.join("; "),
        });
      }
    }

    // 5. soru_bankasi'nda yabanci karakter iceren sorular (16 Eylul,
    // kutuphanenin en buyuk parcasi - SQL regex ile hizli/olceklenebilir tarama,
    // 2777+ satiri JS'e cekmeden)
    const yabanciKarakterliSorular = await sql`
      SELECT COUNT(*)::int AS adet FROM soru_bankasi
      WHERE soru ~ '[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]'
    `;
    if (yabanciKarakterliSorular[0].adet > 0) {
      bulgular.push({
        tur: "soru_bankasi_yabanci_karakter",
        detay: `${yabanciKarakterliSorular[0].adet} soruda yabanci karakter tespit edildi`,
      });
    }

    // 6. soru_bankasi'nda secenek sayisi 4 olmayan veya dogru_index gecersiz sorular
    const bozukYapiliSorular = await sql`
      SELECT COUNT(*)::int AS adet FROM soru_bankasi
      WHERE jsonb_array_length(secenekler) != 4 OR dogru_index < 0 OR dogru_index > 3
    `;
    if (bozukYapiliSorular[0].adet > 0) {
      bulgular.push({
        tur: "soru_bankasi_bozuk_yapi",
        detay: `${bozukYapiliSorular[0].adet} soruda secenek sayisi 4 degil veya dogru_index gecersiz`,
      });
    }

    // 7. icerik_onbellek'in DIGER turlerinde (konu_anlatimi, tek_konu_anlatimi vb.)
    // yabanci karakter veya cok kisa icerik
    const bozukAnlatimlar = await sql`
      SELECT icerik_turu, COUNT(*)::int AS adet FROM icerik_onbellek
      WHERE icerik_turu != 'konu_paketi'
        AND (icerik ~ '[\u4e00-\u9fff\u0600-\u06ff\u0400-\u04ff\u0900-\u097f\u0e00-\u0e7f\u0590-\u05ff]' OR LENGTH(icerik) < 80)
      GROUP BY icerik_turu
    `;
    for (const b of bozukAnlatimlar) {
      bulgular.push({
        tur: "icerik_onbellek_kalite_sorunu",
        icerikTuru: b.icerik_turu,
        detay: `${b.adet} kayitta yabanci karakter veya cok kisa icerik (80 karakterden az)`,
      });
    }

    return Response.json({
      calistirilmaZamani: new Date().toISOString(),
      toplamBulgu: bulgular.length,
      bulgular,
      not: bulgular.length === 0 ? "Su an bilinen desenlerde tutarsizlik bulunamadi." : "Yukaridaki bulgular manuel incelenmeli.",
      mufredatKapsamiDersSinifSayisi: dersSinifKombinasyonlari.length,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
