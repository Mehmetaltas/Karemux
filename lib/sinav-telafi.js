import { sql } from "@/lib/db";

// Sinav Merkezi madde 19: (a) sinavin SURE kaydi (oturum 3 gun sonra silindigi icin kalici ayri tablo),
// (b) TELAFI ZINCIRI: sinavda zayif cikan alt konulari ertesi gune koc gorevi olarak yazar; gorev, mevcut
// "dogrulandi" mantigiyla (o gun o derste gercek calisma kaydi) kendiliginden dogrulanir.
// Tablo ilk kullanimda olusur (elle SQL yok). Hata sinav sonucunu ASLA bozmaz.
let hazir = false;
async function tabloHazirla() {
  if (hazir) return;
  await sql`CREATE TABLE IF NOT EXISTS sinav_sure_kaydi (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    tur TEXT,
    ders TEXT,
    sure_sn INTEGER NOT NULL,
    soru_sayisi INTEGER NOT NULL,
    dogru INTEGER NOT NULL DEFAULT 0,
    yanlis INTEGER NOT NULL DEFAULT 0,
    bos INTEGER NOT NULL DEFAULT 0,
    olusturulma TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS sinav_sure_kaydi_kullanici ON sinav_sure_kaydi (kullanici_id, olusturulma DESC)`;
  hazir = true;
}

const istanbulTarih = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(d); // YYYY-MM-DD
function pazartesi(tarihStr) {
  const t = new Date(`${tarihStr}T00:00:00Z`);
  const gun = (t.getUTCDay() + 6) % 7; // 0 = pazartesi
  t.setUTCDate(t.getUTCDate() - gun);
  return t.toISOString().slice(0, 10);
}

export async function sureKaydet({ kullaniciId, tur, ders, oturumBaslangic, talep, puan, soruSayisi }) {
  await tabloHazirla();
  const sure = Math.round((new Date(talep).getTime() - new Date(oturumBaslangic).getTime()) / 1000);
  // Gercek disi degerler (bos/gecersiz tarih, 6 saatten uzun terk edilmis oturum) kaydedilmez: analizi bozar.
  if (!Number.isFinite(sure) || sure < 5 || sure > 6 * 3600 || !(soruSayisi > 0)) return null;
  await sql`INSERT INTO sinav_sure_kaydi (kullanici_id, tur, ders, sure_sn, soru_sayisi, dogru, yanlis, bos)
    VALUES (${kullaniciId}, ${tur}, ${ders}, ${sure}, ${soruSayisi}, ${puan.dogru}, ${puan.yanlis}, ${puan.bos})`;
  return sure;
}

// Zayif alt konulari (en az 2 soru, dogru orani <= %50) ertesi gune en fazla 2 gorev olarak yazar.
export async function telafiGorevleriYaz({ kullaniciId, cihazId, ders, altKonuKirilim }) {
  const zayiflar = Object.entries(altKonuKirilim || {})
    .filter(([, v]) => v.toplam >= 2 && v.dogru / v.toplam <= 0.5)
    .sort((a, b) => (a[1].dogru / a[1].toplam) - (b[1].dogru / b[1].toplam) || b[1].toplam - a[1].toplam)
    .slice(0, 2);
  if (zayiflar.length === 0 || !ders) return 0;
  const yarin = istanbulTarih(new Date(Date.now() + 24 * 3600 * 1000));
  const hafta = pazartesi(yarin);
  let yazilan = 0;
  for (const [altKonu, v] of zayiflar) {
    const gorev = `Telafi: "${String(altKonu).slice(0, 80)}" konusunu tekrar et ve bu konudan 5 soru coz (son sinavda ${v.dogru}/${v.toplam} dogru)`;
    const var_ = await sql`SELECT 1 FROM gunluk_gorevler WHERE kullanici_id = ${kullaniciId} AND gun = ${yarin} AND ders = ${ders} AND gorev LIKE ${`Telafi: "${String(altKonu).slice(0, 80)}"%`} LIMIT 1`;
    if (var_.length > 0) continue;
    await sql`INSERT INTO gunluk_gorevler (kullanici_id, cihaz_id, hafta_baslangic, gun, ders, gorev, kaynak)
      VALUES (${kullaniciId}, ${cihazId || null}, ${hafta}, ${yarin}, ${ders}, ${gorev}, 'koc')`;
    yazilan++;
  }
  return yazilan;
}
