// KAREMUX Auto Health Check v1
// Calistirma: node --env-file=.env.production.local scripts/health-check.js
const { neon } = require("@neondatabase/serverless");

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://karemux-nu.vercel.app";

const BEKLENEN_TABLOLAR = {
  kullanicilar: ["id", "eposta", "sifre_hash", "rol", "eposta_dogrulandi", "veli_baglanti_kodu", "veli_eposta", "veli_onay_verildi", "veli_onay_token", "hedef_il", "hedef_ilce", "hedef_okul", "hedef_puan", "okul", "telefon", "sinif", "sifre_sifirlama_kodu", "sifre_sifirlama_son_tarih"],
  hata_kitapcigi: ["id", "kullanici_id", "ders", "alt_konu", "soru", "secenekler", "dogru_index", "cozuldu", "sonraki_tekrar", "tekrar_asamasi"],
  seviye_tespit_kademe: ["id", "kullanici_id", "ders", "unite", "kaynak_sinif", "kademe", "tamamlandi"],
  seviye_tespit_sonuc: ["id", "kullanici_id", "toplam_soru", "dogru_sayisi", "zayif_unite_sayisi"],
  sinav_sonuclari: ["id", "kullanici_id", "tur", "ders", "dogru", "yanlis", "bos", "net"],
  soru_bankasi: ["id", "ders", "sinif", "unite", "alt_konu", "zorluk", "soru", "secenekler", "dogru_index", "kaynak_turu"],
  ulusal_denemeler: ["id", "ad", "sinif", "ders", "sorular", "acilis", "kapanis"],
  ulusal_deneme_sonuclari: ["id", "ulusal_deneme_id", "kullanici_id", "kurum_id", "dogru", "yanlis", "bos", "net"],
  veli_ogrenci: ["id", "veli_id", "ogrenci_id"],
  gunluk_kullanim: ["id", "kullanici_id", "tarih", "ai_istek_sayisi"],
  abonelikler: ["id", "kullanici_id", "plan", "durum", "iyzico_abonelik_id"],
  odemeler: ["id", "kullanici_id", "iyzico_odeme_id", "tutar", "durum"],
  ilerleme: ["id", "kullanici_id", "ders", "konu", "dogru_sayisi", "toplam_soru"],
  kurumlar: ["id", "ad", "kurum_kodu"],
  gunluk_gorevler: ["id", "kullanici_id", "hafta_baslangic", "gun", "ders", "gorev", "tamamlandi"],
  cariler: ["id", "ad", "tur"],
  cari_hareketleri: ["id", "cari_id", "tur", "tutar_tl"],
  banka_hesaplari: ["id", "hesap_adi", "tur", "baslangic_bakiyesi"],
  kasa_hareketleri: ["id", "hesap_id", "tur", "tutar_tl"],
  finansal_hedefler: ["id", "yil", "ay", "gelir_hedefi_tl", "gider_hedefi_tl"],
  randevular: ["id", "ogretmen_id", "ogrenci_id", "baslangic_zamani", "ucret_tl", "odendi"],
  ogretmenler: ["id", "ad", "brans", "saatlik_ucret_tl"],
};

const KRITIK_API_UCLARI = [
  { yol: "/api/auth/me", beklenen: 200 },
  { yol: "/api/istatistik", beklenen: 200 },
  { yol: "/api/soru-bankasi", beklenen: 200 },
  { yol: "/api/ulusal-deneme/aktif", beklenen: 200 },
  { yol: "/api/basarilar", beklenen: 200 },
  { yol: "/api/paketler", beklenen: 200 },
  { yol: "/api/canli-ders/listele", beklenen: 200 },
  // OPSIYONEL FILTRELI cagri - 19 Agustos'ta bulunan gizli hatanin (Neon sql
  // sablon etiketi ic ice sql`` desteklemiyor) tekrarlanmamasi icin.
  { yol: "/api/canli-ders/listele?tur=grup", beklenen: 200 },
];

async function veritabaniKontrolEt() {
  console.log("\n=== DATABASE HEALTH CHECK ===");
  if (!process.env.DATABASE_URL) {
    console.log("HATA: DATABASE_URL tanimli degil, veritabani kontrolu atlaniyor.");
    return { gecen: 0, toplam: 0 };
  }
  const sql = neon(process.env.DATABASE_URL);
  let gecen = 0, toplam = 0;

  for (const [tablo, kolonlar] of Object.entries(BEKLENEN_TABLOLAR)) {
    toplam++;
    try {
      const sonuc = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${tablo}`;
      if (sonuc.length === 0) {
        console.log(`  RED  ${tablo}: tablo bulunamadi`);
        continue;
      }
      const mevcutKolonlar = new Set(sonuc.map((r) => r.column_name));
      const eksikler = kolonlar.filter((k) => !mevcutKolonlar.has(k));
      if (eksikler.length > 0) {
        console.log(`  RED  ${tablo}: eksik kolonlar -> ${eksikler.join(", ")}`);
      } else {
        console.log(`  OK   ${tablo}`);
        gecen++;
      }
    } catch (e) {
      console.log(`  RED  ${tablo}: sorgu hatasi -> ${e.message}`);
    }
  }
  return { gecen, toplam };
}

async function apiKontrolEt() {
  console.log(`\n=== API HEALTH CHECK (${BASE_URL}) ===`);
  let gecen = 0, toplam = 0;

  for (const { yol, beklenen } of KRITIK_API_UCLARI) {
    toplam++;
    try {
      const res = await fetch(`${BASE_URL}${yol}`);
      const durum = res.status;
      if (durum === beklenen) {
        console.log(`  OK   ${yol} (${durum})`);
        gecen++;
      } else {
        console.log(`  RED  ${yol}: beklenen ${beklenen}, gelen ${durum}`);
      }
    } catch (e) {
      console.log(`  RED  ${yol}: istek basarisiz -> ${e.message}`);
    }
  }
  return { gecen, toplam };
}

// Bugun (19 Agustos) eklenen Muhasebe/Randevu/Simulasyon sistemlerinin
// gercekten canli ve calisir durumda oldugunu dogrular - sifre gerektiren
// admin uc noktalari icin ULUSAL_DENEME_YONETICI_SIFRESI kullanilir.
async function finansPaneliKontrolEt() {
  console.log("\n=== FINANS/RANDEVU/SIMULASYON PANELI TESTI ===");
  let gecen = 0, toplam = 0;
  const sifre = process.env.ULUSAL_DENEME_YONETICI_SIFRESI;
  if (!sifre) {
    console.log("  UYARI ULUSAL_DENEME_YONETICI_SIFRESI tanimli degil, bu test atlaniyor.");
    return { gecen: 0, toplam: 0 };
  }
  const ucLar = [
    "/api/admin/cari", "/api/admin/kasa", "/api/admin/maliyet",
    "/api/admin/planlama", "/api/admin/simulasyon", "/api/admin/kurum",
  ];
  for (const yol of ucLar) {
    toplam++;
    try {
      const res = await fetch(`${BASE_URL}${yol}?sifre=${encodeURIComponent(sifre)}`);
      if (res.status === 200) {
        console.log(`  OK   ${yol}`);
        gecen++;
      } else {
        console.log(`  RED  ${yol}: beklenen 200, gelen ${res.status}`);
      }
    } catch (e) {
      console.log(`  RED  ${yol}: istek basarisiz -> ${e.message}`);
    }
  }
  // Ozel ders randevu sistemi PUBLIC (sifre gerektirmiyor) - ayri kontrol.
  toplam++;
  try {
    const res = await fetch(`${BASE_URL}/api/randevu/musaitlik`);
    if (res.status === 200) { console.log("  OK   /api/randevu/musaitlik"); gecen++; }
    else console.log(`  RED  /api/randevu/musaitlik: beklenen 200, gelen ${res.status}`);
  } catch (e) {
    console.log(`  RED  /api/randevu/musaitlik: istek basarisiz -> ${e.message}`);
  }
  return { gecen, toplam };
}

// Gercek bir kullanicinin yasayacagi akisi uctan uca dener: kayit ol -> giris
// yapilmis oturumu dogrula -> soru bankasindan soru cek. Test sonunda olusturdugu
// hesabi veritabanindan TEMIZLER, kalinti birakmaz.
async function senaryoTestiCalistir() {
  console.log("\n=== SENARYO TESTI (E2E: kayit -> giris -> soru cekme) ===");
  let gecen = 0, toplam = 0;
  const testEposta = `healthcheck-${Date.now()}@example.com`;
  let cerez = null;

  toplam++;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.HEALTH_CHECK_SECRET ? { "x-health-check-secret": process.env.HEALTH_CHECK_SECRET } : {}),
      },
      body: JSON.stringify({
        eposta: testEposta, sifre: "TestSifre123", ad: "Health Check Test",
        rol: "ogrenci", veliEposta: `healthcheck-veli-${Date.now()}@example.com`,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      cerez = res.headers.get("set-cookie");
      console.log(`  OK   Kayit olusturuldu (${testEposta})`);
      gecen++;
    } else {
      console.log(`  RED  Kayit basarisiz: ${data.error || res.status}`);
    }
  } catch (e) {
    console.log(`  RED  Kayit istegi basarisiz: ${e.message}`);
  }

  if (cerez) {
    toplam++;
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Cookie: cerez } });
      const data = await res.json();
      if (res.ok && data.girisYapmis && data.kullanici?.eposta === testEposta) {
        console.log("  OK   Oturum dogrulandi (/api/auth/me)");
        gecen++;
      } else {
        console.log(`  RED  Oturum dogrulanamadi: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      console.log(`  RED  /api/auth/me istegi basarisiz: ${e.message}`);
    }

    toplam++;
    try {
      const res = await fetch(`${BASE_URL}/api/soru-bankasi/getir?ders=Matematik&sinif=6&unite=Kesirler&adet=5`, { headers: { Cookie: cerez } });
      const data = await res.json();
      if (res.ok && typeof data.yeterliMi === "boolean") {
        console.log(`  OK   Soru bankasi cagrisi calisti (yeterliMi: ${data.yeterliMi})`);
        gecen++;
      } else {
        console.log(`  RED  Soru bankasi beklenmedik cevap: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      console.log(`  RED  Soru bankasi istegi basarisiz: ${e.message}`);
    }
  } else {
    console.log("  ATLA Kayit basarisiz oldugu icin sonraki adimlar atlandi");
  }

  // Temizlik: test hesabini veritabanindan sil, kalinti birakma.
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`DELETE FROM kullanicilar WHERE eposta = ${testEposta} OR eposta LIKE ${"healthcheck-veli-%@example.com"}`;
      console.log("  TEMIZ Test hesabi veritabanindan silindi");
    } catch (e) {
      console.log(`  UYARI Test hesabi silinemedi (elle temizlik gerekebilir): ${e.message}`);
    }
  }

  return { gecen, toplam };
}

// Zincirin gercekten calistigini dener: Hata Kitapcigi -> Zayif Konu Haritasi.
// Bir test kullanicisi olusturur, POST /api/hata-kitapcigi ile bir "yanlis cevap"
// kaydeder, sonra GET /api/hata-kitapcigi?istatistik=true ile bu kaydin haritada
// gercekten gorunup gorunmedigini dogrular. Sonunda hepsini temizler.
async function entegrasyonTestiCalistir() {
  console.log("\n=== ENTEGRASYON TESTI (Hata Kitapcigi -> Zayif Konu Haritasi) ===");
  let gecen = 0, toplam = 0;
  const testEposta = `healthcheck-entegrasyon-${Date.now()}@example.com`;
  const isaretKonu = `HealthCheckKonu-${Date.now()}`;
  let cerez = null;

  toplam++;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.HEALTH_CHECK_SECRET ? { "x-health-check-secret": process.env.HEALTH_CHECK_SECRET } : {}),
      },
      body: JSON.stringify({
        eposta: testEposta, sifre: "TestSifre123", ad: "Health Check Entegrasyon",
        rol: "ogrenci", veliEposta: `healthcheck-entegrasyon-veli-${Date.now()}@example.com`,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      cerez = res.headers.get("set-cookie");
      console.log("  OK   Test hesabi olusturuldu");
      gecen++;
    } else {
      console.log(`  RED  Kayit basarisiz: ${data.error || res.status}`);
    }
  } catch (e) {
    console.log(`  RED  Kayit istegi basarisiz: ${e.message}`);
  }

  if (cerez) {
    toplam++;
    try {
      const res = await fetch(`${BASE_URL}/api/hata-kitapcigi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cerez },
        body: JSON.stringify({
          ders: "Matematik", altKonu: isaretKonu,
          soru: "Health check test sorusu", secenekler: ["A", "B", "C", "D"],
          dogruIndex: 0, verilenIndex: 1,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        console.log("  OK   Hata kitapcigina kayit yazildi");
        gecen++;
      } else {
        console.log(`  RED  Hata kitapcigina yazilamadi: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      console.log(`  RED  Hata kitapcigi istegi basarisiz: ${e.message}`);
    }

    toplam++;
    try {
      const res = await fetch(`${BASE_URL}/api/hata-kitapcigi?istatistik=true`, { headers: { Cookie: cerez } });
      const data = await res.json();
      const bulundu = (data.istatistik || []).some((r) => r.alt_konu === isaretKonu);
      if (res.ok && bulundu) {
        console.log("  OK   Zayif Konu Haritasi'nda goruldu (zincir calisiyor)");
        gecen++;
      } else {
        console.log("  RED  Zayif Konu Haritasi'nda GORUNMEDI - zincir kopuk olabilir");
      }
    } catch (e) {
      console.log(`  RED  Istatistik istegi basarisiz: ${e.message}`);
    }

    // OPSIYONEL FILTRE testi - 19 Agustos'ta bulunan gizli hatanin (Neon sql
    // sablon etiketi ic ice sql`` parcalarini desteklemiyor) tekrarlanmamasi
    // icin BILEREK eklendi. Bu tur filtreli cagrilar mutlaka test edilmeli.
    toplam++;
    try {
      const res = await fetch(`${BASE_URL}/api/hata-kitapcigi?ders=Matematik`, { headers: { Cookie: cerez } });
      if (res.ok) {
        console.log("  OK   /api/hata-kitapcigi?ders= (opsiyonel filtre) calisiyor");
        gecen++;
      } else {
        console.log(`  RED  /api/hata-kitapcigi?ders= HATA VERDI (durum ${res.status}) - gizli SQL hatasi olabilir`);
      }
    } catch (e) {
      console.log(`  RED  Filtreli istek basarisiz: ${e.message}`);
    }
  } else {
    console.log("  ATLA Kayit basarisiz oldugu icin sonraki adimlar atlandi");
  }

  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`DELETE FROM hata_kitapcigi WHERE alt_konu = ${isaretKonu}`;
      await sql`DELETE FROM kullanicilar WHERE eposta = ${testEposta} OR eposta LIKE ${"healthcheck-entegrasyon-veli-%@example.com"}`;
      console.log("  TEMIZ Test verisi silindi");
    } catch (e) {
      console.log(`  UYARI Temizlik basarisiz: ${e.message}`);
    }
  }

  return { gecen, toplam };
}

// Yetki sizintisi olup olmadigini dener: (1) girissiz istek korumali uca erisemiyor
// mu, (2) bir ogrenci baska bir ogrencinin verisini gorebiliyor mu.
async function rolYetkiTestiCalistir() {
  console.log("\n=== ROL/YETKI TESTI ===");
  let gecen = 0, toplam = 0;

  toplam++;
  try {
    const res = await fetch(`${BASE_URL}/api/veli/ilerleme`);
    if (res.status === 401) {
      console.log("  OK   Girissiz istek /api/veli/ilerleme'ye erisemiyor (401)");
      gecen++;
    } else {
      console.log(`  RED  Girissiz istek beklenmedik durum kodu dondu: ${res.status}`);
    }
  } catch (e) {
    console.log(`  RED  Istek basarisiz: ${e.message}`);
  }

  const zamanDamgasi = Date.now();
  const epostaA = `healthcheck-yetki-a-${zamanDamgasi}@example.com`;
  const epostaB = `healthcheck-yetki-b-${zamanDamgasi}@example.com`;
  const isaretKonu = `HealthCheckYetki-${zamanDamgasi}`;
  let cerezA = null, cerezB = null;

  async function kayitOl(eposta) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.HEALTH_CHECK_SECRET ? { "x-health-check-secret": process.env.HEALTH_CHECK_SECRET } : {}),
      },
      body: JSON.stringify({
        eposta, sifre: "TestSifre123", ad: "Health Check Yetki",
        rol: "ogrenci", veliEposta: `healthcheck-yetki-veli-${zamanDamgasi}-${Math.random()}@example.com`,
      }),
    });
    const data = await res.json();
    return res.ok && data.ok ? res.headers.get("set-cookie") : null;
  }

  toplam++;
  try {
    cerezA = await kayitOl(epostaA);
    cerezB = await kayitOl(epostaB);
    if (cerezA && cerezB) {
      console.log("  OK   Iki ayri test hesabi olusturuldu");
      gecen++;
    } else {
      console.log("  RED  Test hesaplari olusturulamadi");
    }
  } catch (e) {
    console.log(`  RED  Kayit basarisiz: ${e.message}`);
  }

  if (cerezA && cerezB) {
    toplam++;
    try {
      await fetch(`${BASE_URL}/api/hata-kitapcigi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cerezA },
        body: JSON.stringify({
          ders: "Matematik", altKonu: isaretKonu,
          soru: "Yetki testi sorusu", secenekler: ["A", "B", "C", "D"],
          dogruIndex: 0, verilenIndex: 1,
        }),
      });
      const res = await fetch(`${BASE_URL}/api/hata-kitapcigi?istatistik=true`, { headers: { Cookie: cerezB } });
      const data = await res.json();
      const sizinti = (data.istatistik || []).some((r) => r.alt_konu === isaretKonu);
      if (!sizinti) {
        console.log("  OK   B hesabi, A'nin verisini GOREMIYOR (izolasyon saglam)");
        gecen++;
      } else {
        console.log("  RED  KRITIK: B hesabi A'nin verisini GOREBILIYOR - yetki sizintisi!");
      }
    } catch (e) {
      console.log(`  RED  Izolasyon testi basarisiz: ${e.message}`);
    }
  } else {
    console.log("  ATLA Test hesaplari olusmadigi icin izolasyon testi atlandi");
  }

  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`DELETE FROM hata_kitapcigi WHERE alt_konu = ${isaretKonu}`;
      await sql`DELETE FROM kullanicilar WHERE eposta IN (${epostaA}, ${epostaB}) OR eposta LIKE ${`healthcheck-yetki-veli-${zamanDamgasi}%`}`;
      console.log("  TEMIZ Test verisi silindi");
    } catch (e) {
      console.log(`  UYARI Temizlik basarisiz: ${e.message}`);
    }
  }

  return { gecen, toplam };
}

(async () => {
  console.log(`KAREMUX HEALTH CHECK — ${new Date().toISOString()}`);
  const db = await veritabaniKontrolEt();
  const api = await apiKontrolEt();
  const senaryo = await senaryoTestiCalistir();
  const entegrasyon = await entegrasyonTestiCalistir();
  const rolYetki = await rolYetkiTestiCalistir();
  const finans = await finansPaneliKontrolEt();

  const toplamGecen = db.gecen + api.gecen + senaryo.gecen + entegrasyon.gecen + rolYetki.gecen + finans.gecen;
  const toplamTest = db.toplam + api.toplam + senaryo.toplam + entegrasyon.toplam + rolYetki.toplam + finans.toplam;
  console.log("\n=== SONUC ===");
  console.log(`Database:    ${db.gecen}/${db.toplam}`);
  console.log(`API:         ${api.gecen}/${api.toplam}`);
  console.log(`Senaryo:     ${senaryo.gecen}/${senaryo.toplam}`);
  console.log(`Entegrasyon: ${entegrasyon.gecen}/${entegrasyon.toplam}`);
  console.log(`Rol/Yetki:   ${rolYetki.gecen}/${rolYetki.toplam}`);
  console.log(`Finans/Randevu: ${finans.gecen}/${finans.toplam}`);
  console.log(`TOPLAM:      ${toplamGecen}/${toplamTest} ${toplamGecen === toplamTest ? "— HEPSI GECTI" : "— BAZI TESTLER BASARISIZ"}`);

  process.exit(toplamGecen === toplamTest ? 0 : 1);
})();
