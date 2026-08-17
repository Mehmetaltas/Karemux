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

(async () => {
  console.log(`KAREMUX HEALTH CHECK — ${new Date().toISOString()}`);
  const db = await veritabaniKontrolEt();
  const api = await apiKontrolEt();

  const toplamGecen = db.gecen + api.gecen;
  const toplamTest = db.toplam + api.toplam;
  console.log("\n=== SONUC ===");
  console.log(`Database: ${db.gecen}/${db.toplam}`);
  console.log(`API:      ${api.gecen}/${api.toplam}`);
  console.log(`TOPLAM:   ${toplamGecen}/${toplamTest} ${toplamGecen === toplamTest ? "— HEPSI GECTI" : "— BAZI TESTLER BASARISIZ"}`);

  process.exit(toplamGecen === toplamTest ? 0 : 1);
})();
