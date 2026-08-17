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
};

const KRITIK_API_UCLARI = [
  { yol: "/api/auth/me", beklenen: 200 },
  { yol: "/api/istatistik", beklenen: 200 },
  { yol: "/api/soru-bankasi", beklenen: 200 },
  { yol: "/api/ulusal-deneme/aktif", beklenen: 200 },
  { yol: "/api/basarilar", beklenen: 200 },
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

(async () => {
  console.log(`KAREMUX HEALTH CHECK — ${new Date().toISOString()}`);
  const db = await veritabaniKontrolEt();
  const api = await apiKontrolEt();
  const senaryo = await senaryoTestiCalistir();

  const toplamGecen = db.gecen + api.gecen + senaryo.gecen;
  const toplamTest = db.toplam + api.toplam + senaryo.toplam;
  console.log("\n=== SONUC ===");
  console.log(`Database: ${db.gecen}/${db.toplam}`);
  console.log(`API:      ${api.gecen}/${api.toplam}`);
  console.log(`Senaryo:  ${senaryo.gecen}/${senaryo.toplam}`);
  console.log(`TOPLAM:   ${toplamGecen}/${toplamTest} ${toplamGecen === toplamTest ? "— HEPSI GECTI" : "— BAZI TESTLER BASARISIZ"}`);

  process.exit(toplamGecen === toplamTest ? 0 : 1);
})();
