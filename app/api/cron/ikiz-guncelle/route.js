import { sql } from "@/lib/db";

// Dijital Ikiz motoru gunluk guncelleme (30 Agustos): otomatik hesaplanabilen
// degiskenleri taze sorgularla gunceller, esik asilirsa strateji_onerisi
// olusturur (ONERIR - otonom karar VERMEZ, admin onaylar/reddeder).
async function degiskenGuncelle(kod, deger) {
  await sql`UPDATE ikiz_degisken SET guncel_deger = ${deger}, guncelleme = now() WHERE kod = ${kod}`;
}

async function oneriVarMi(baslik) {
  // Ayni baslikla ONCEDEN hic oneri olusturulmus mu (durumdan bagimsiz) -
  // tekrar tekrar ayni oneriyi olusturup kullaniciyi rahatsiz etmemek icin.
  const sonuc = await sql`SELECT 1 FROM strateji_onerisi WHERE baslik = ${baslik} LIMIT 1`;
  return sonuc.length > 0;
}

async function oneriOlustur(baslik, aciklama, dayanak, oncelik) {
  if (await oneriVarMi(baslik)) return false;
  await sql`INSERT INTO strateji_onerisi (baslik, aciklama, dayanak, oncelik) VALUES (${baslik}, ${aciklama}, ${dayanak}, ${oncelik})`;
  return true;
}

export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const guncellenenler = [];
  const yeniOneriler = [];

  try {
    // Reddedilen strateji onerileri 30 gun sonra otomatik yeniden degerlendirmeye
    // aciliyor - admin bir daha bakabilsin, sonsuza kadar "reddedildi" kalmasin.
    await sql`
      UPDATE strateji_onerisi SET durum = 'oneriliyor', karar_notu = COALESCE(karar_notu, '') || ' [30 gun sonra otomatik yeniden acildi]'
      WHERE durum = 'reddedildi' AND olusturulma < now() - interval '30 days'
    `;

    // --- Otomatik hesaplanabilir degiskenler ---
    const mufredatToplam = await sql`SELECT COUNT(*)::int AS c FROM mufredat`;
    await degiskenGuncelle("toplam_mufredat_kaydi", mufredatToplam[0].c);
    guncellenenler.push("toplam_mufredat_kaydi");

    const sekizEksik = await sql`SELECT COUNT(*)::int AS c FROM mufredat WHERE sinif = 8 AND dogrulanma_kaynagi = 'eksik_ai_tahmini'`;
    await degiskenGuncelle("sekizinci_sinif_eksik_unite_sayisi", sekizEksik[0].c);
    guncellenenler.push("sekizinci_sinif_eksik_unite_sayisi");

    const aktifOgrenci = await sql`SELECT COUNT(*)::int AS c FROM abonelikler WHERE durum = 'aktif'`;
    await degiskenGuncelle("aktif_ogrenci_sayisi", aktifOgrenci[0].c);
    guncellenenler.push("aktif_ogrenci_sayisi");

    const neonKullanim = await sql`SELECT pg_database_size(current_database())::bigint AS boyut`;
    const neonMB = Math.round(Number(neonKullanim[0].boyut) / 1024 / 1024);
    await degiskenGuncelle("neon_depolama_kullanim", neonMB);
    guncellenenler.push("neon_depolama_kullanim");

    // Son 30 gunun gercek geliri (satislar tablosundan)
    const aylikGelirSonuc = await sql`SELECT COALESCE(SUM(net_gelir_tl), 0)::numeric AS toplam FROM satislar WHERE olusturulma >= now() - interval '30 days'`;
    const aylikGelir = Number(aylikGelirSonuc[0].toplam);

    // --- Esik bazli oneri uretimi (30 Agustos kararlari, tavsiye niteliginde) ---

    // Neon depolama esigi
    const neonLimitSonuc = await sql`SELECT guncel_deger FROM ikiz_degisken WHERE kod = 'neon_depolama_limit'`;
    const neonLimit = Number(neonLimitSonuc[0]?.guncel_deger || 540);
    if (neonMB / neonLimit > 0.85) {
      if (await oneriOlustur(
        "Neon depolama %85 esigini asti",
        `Mevcut kullanim ${neonMB}MB / ${neonLimit}MB limit. Ucretli plana gecis (Neon Launch) degerlendirilmeli.`,
        "neon_depolama_kullanim / neon_depolama_limit > 0.85",
        "yuksek"
      )) yeniOneriler.push("Neon depolama esigi");
    }

    // 8. sinif eksik unite
    if (sekizEksik[0].c > 0) {
      if (await oneriOlustur(
        "8. sınıf müfredat derinliği eksik",
        `8. sınıfın ${sekizEksik[0].c} ünitesinde alt-konu doğrulaması yok - tam da LGS sınav yılı, en az araştırılmış durumda.`,
        "sekizinci_sinif_eksik_unite_sayisi > 0",
        "orta"
      )) yeniOneriler.push("8. sınıf müfredat eksikliği");
    }

    // Ogretmen kadrosu
    const ogretmenSayisi = await sql`SELECT guncel_deger FROM ikiz_degisken WHERE kod = 'ogretmen_sayisi'`;
    if (Number(ogretmenSayisi[0]?.guncel_deger || 0) === 0) {
      if (await oneriOlustur(
        "Öğretmen kadrosu hâlâ sıfır",
        "Platformun asıl değer önerisi (AI+gerçek öğretmen) operasyonel olarak başlamamış. Küçük çekirdek kadro (2-3 branş+1 rehberlik) önerilir.",
        "ogretmen_sayisi = 0",
        "yuksek"
      )) yeniOneriler.push("Öğretmen kadrosu");
    }

    // Guvenlik: dogrulanmamis kritik degiskenler
    const dogrulanmamis = await sql`SELECT kod, ad FROM ikiz_degisken WHERE boyut_id = (SELECT id FROM ikiz_boyut WHERE kod='risk_uyum') AND guncel_deger IS NULL`;
    for (const d of dogrulanmamis) {
      if (await oneriOlustur(
        `Doğrulanmamış güvenlik durumu: ${d.ad}`,
        `${d.ad} henüz kontrol edilmedi - ödeme+çocuk verisi işleyen bir sistemde bu belirsizlik risk taşır.`,
        `ikiz_degisken.${d.kod} IS NULL`,
        "yuksek"
      )) yeniOneriler.push(d.ad);
    }

    return Response.json({ ok: true, guncellenenler, aylikGelir, yeniOneriler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
