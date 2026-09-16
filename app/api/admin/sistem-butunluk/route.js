import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

// Sistem Butunluk Haritasi (16 Eylul) - 11 departmanli referans sirket
// yapisinin, Karemux'taki GERCEK karsiligini TEK ekranda gosterir.
// Master Yol Haritasi'ndaki "Company Twin"in vitrin ekrani.
export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const tutarlilikRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.karemux.com"}/api/admin/tutarlilik-denetimi?sifre=${encodeURIComponent(process.env.ULUSAL_DENEME_YONETICI_SIFRESI)}`);
    const tutarlilik = await tutarlilikRes.json();

    const kasaToplam = await sql`
      SELECT COALESCE(SUM(h.baslangic_bakiyesi + COALESCE(hareket.net, 0)), 0)::float AS toplam
      FROM banka_hesaplari h
      LEFT JOIN (
        SELECT hesap_id, SUM(CASE WHEN tur = 'giris' THEN tutar_tl WHEN tur = 'cikis' THEN -tutar_tl ELSE 0 END) AS net
        FROM kasa_hareketleri GROUP BY hesap_id
      ) hareket ON hareket.hesap_id = h.id
    `;
    const personelSayisi = await sql`SELECT COUNT(*)::int AS adet FROM personel`;
    const mufredatOzet = await sql`SELECT COUNT(*)::int AS adet FROM mufredat`;
    const konuPaketiSayisi = await sql`SELECT COUNT(*)::int AS adet FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi'`;
    const ikizBoyutSayisi = await sql`SELECT COUNT(*)::int AS adet FROM ikiz_boyut`;
    const sonSenaryo = await sql`SELECT sonuc_json, olusturulma FROM ikiz_senaryo ORDER BY olusturulma DESC LIMIT 1`;

    const departmanlar = [
      { ad: "Finans", ikon: "💰", durum: "tam", kaynak: "Company Twin (finansal boyut) + Kasa/Banka", detay: `Kasa toplamı: ${kasaToplam[0].toplam.toFixed(0)}₺, günlük gerçek veri akıyor` },
      { ad: "İnsan Kaynakları", ikon: "👥", durum: "kismi", kaynak: "Personel tablosu", detay: `${personelSayisi[0].adet} personel kaydı var, performans/KPI ölçümü YOK` },
      { ad: "Hukuk / KVKK", ikon: "⚖️", durum: "eksik", kaynak: "—", detay: "Merkezi ekran yok, bilinçli ertelendi (launch öncesi profesyonel kontrol gerekiyor)" },
      { ad: "Ürün / Eğitim", ikon: "📚", durum: "tam", kaynak: "Müfredat + İçerik Havuzu + Kalite Kontrolü", detay: `${mufredatOzet[0].adet} müfredat kaydı, ${konuPaketiSayisi[0].adet} konu paketi üretildi, otomatik kalite denetimi aktif` },
      { ad: "Teknoloji", ikon: "🖥️", durum: "tam", kaynak: "Company Twin (güvenlik+altyapı boyutu)", detay: "20.000 kişi kapasite testi kanıtlı, yedekli AI sağlayıcı, otomatik yedekleme" },
      { ad: "Satış", ikon: "📈", durum: "kismi", kaynak: "Company Twin (müşteri boyutu) + Dönüşüm Hunisi", detay: "Altyapı hazır, henüz gerçek satış/launch yok" },
      { ad: "Pazarlama", ikon: "📣", durum: "eksik", kaynak: "Company Twin (pazar boyutu)", detay: "Boyut var ama YouTube/reklam verisi henüz akmıyor" },
      { ad: "Operasyon", ikon: "⚙️", durum: "tam", kaynak: "Teknoloji boyutuyla birleşik", detay: "Günlük kapasite/kullanım izleniyor" },
      { ad: "Veri / AI", ikon: "🤖", durum: "tam", kaynak: "AI Kullanım Log + Sağlayıcı Sıralaması", detay: "Maliyet, sağlayıcı performansı gerçek zamanlı izleniyor" },
      { ad: "İç Kontrol / Risk", ikon: "🛡️", durum: tutarlilik.toplamBulgu === 0 ? "tam" : "kismi", kaynak: "Tutarlılık Denetimi (haftalık otomasyon)", detay: tutarlilik.toplamBulgu === 0 ? "Son taramada bulgu yok" : `Son taramada ${tutarlilik.toplamBulgu} açık bulgu var` },
      { ad: "Şirket Yönetimi", ikon: "🏛️", durum: "kismi", kaynak: "Dijital İkiz Senaryoları", detay: `${ikizBoyutSayisi[0].adet} boyut izleniyor, resmi karar/kurul süreci henüz yok` },
    ];

    return Response.json({
      calistirilmaZamani: new Date().toISOString(),
      departmanlar,
      tutarlilikBulgulari: tutarlilik.bulgular || [],
      tutarlilikSonKontrol: tutarlilik.calistirilmaZamani,
      gercekDurumSon: sonSenaryo[0] || null,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
