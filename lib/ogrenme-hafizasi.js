import { sql } from "@/lib/db";
import { aiCagir } from "@/lib/ai";

// Ogrenme Hafizasi v1 (8 Eylul) - SADECE Premium (yillik_* abonelik) icin.
// Ogrencinin hata_kitapcigi + sinav_sonuclari verisinden periyodik olarak
// (her +15 yeni veri noktasinda) kisa bir "ogrenci profil ozeti" (200-300
// kelime) uretir, saklar. Bu ozet, sonraki AI icerik uretimlerine (konu
// anlatimi, soru uretimi) baglam olarak eklenir - ucretsiz kullaniciya
// hicbir zaman jenerik olmayan, kisisellesmis icerik saglar.
const YENILEME_ESIGI = 15; // en az bu kadar YENI veri noktasi birikmeden yeniden uretme
const MINIMUM_VERI_NOKTASI = 10; // bu sayidan az veri varsa hic ozet uretme (anlamli olmaz)

export async function ogrenciPremiumMi(kullaniciId) {
  if (!kullaniciId) return false;
  const sonuc = await sql`
    SELECT 1 FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' AND plan LIKE 'yillik_%' LIMIT 1
  `;
  return sonuc.length > 0;
}

async function veriNoktasiSayisi(kullaniciId) {
  const hata = await sql`SELECT COUNT(*)::int AS adet FROM hata_kitapcigi WHERE kullanici_id = ${kullaniciId}`;
  const sinav = await sql`SELECT COUNT(*)::int AS adet FROM sinav_sonuclari WHERE kullanici_id = ${kullaniciId}`;
  return hata[0].adet + sinav[0].adet;
}

async function ozetUret(kullaniciId) {
  const yanlislar = await sql`
    SELECT ders, alt_konu FROM hata_kitapcigi
    WHERE kullanici_id = ${kullaniciId}
    ORDER BY id DESC LIMIT 40
  `;
  const sinavlar = await sql`
    SELECT ders, net, dogru, yanlis FROM sinav_sonuclari
    WHERE kullanici_id = ${kullaniciId}
    ORDER BY id DESC LIMIT 20
  `;

  const yanlisOzet = yanlislar.map((y) => `${y.ders}: ${y.alt_konu || "genel"}`).join("; ") || "yok";
  const sinavOzet = sinavlar.map((s) => `${s.ders} net=${s.net}`).join("; ") || "yok";

  const p = `Bir ogrencinin son calisma verisine bak. Yanlis yaptigi konular: ${yanlisOzet}. Sinav sonuclari: ${sinavOzet}. Bu veriden, ogrencinin GENEL guclu ve zayif oldugu alanlari, tekrar eden hata kaliplarini ozetleyen, 150-200 kelimelik KISA bir "ogrenci profili" yaz. Ucuncu kisil bakis acisiyla ("bu ogrenci...") yaz. Sadece gercek veriden cikan sonuclari yaz, veri yoksa uydurma yapma. SADECE Turkce, duz metin, markdown kullanma.`;

  try {
    const ozet = await aiCagir({ prompt: p, maxTokens: 500 });
    return ozet.trim();
  } catch (e) {
    return null;
  }
}

// Premium kullanici icin profil ozetini dondurur - gerekirse once guncelleyip
// sonra dondurur. Ucretsiz kullanici veya yeterli veri yoksa null doner.
export async function ogrenmeHafizasiGetir(kullaniciId) {
  if (!(await ogrenciPremiumMi(kullaniciId))) return null;

  const mevcutSayisi = await veriNoktasiSayisi(kullaniciId);
  if (mevcutSayisi < MINIMUM_VERI_NOKTASI) return null;

  const profil = await sql`SELECT ozet_metni, son_veri_noktasi_sayisi FROM ogrenci_ogrenme_profili WHERE kullanici_id = ${kullaniciId}`;

  if (profil.length === 0 || (mevcutSayisi - profil[0].son_veri_noktasi_sayisi) >= YENILEME_ESIGI) {
    const yeniOzet = await ozetUret(kullaniciId);
    if (!yeniOzet) return profil[0]?.ozet_metni || null; // uretim basarisizsa eskiyi kullan (varsa)
    await sql`
      INSERT INTO ogrenci_ogrenme_profili (kullanici_id, ozet_metni, veri_noktasi_sayisi, son_veri_noktasi_sayisi)
      VALUES (${kullaniciId}, ${yeniOzet}, ${mevcutSayisi}, ${mevcutSayisi})
      ON CONFLICT (kullanici_id) DO UPDATE SET
        ozet_metni = ${yeniOzet}, veri_noktasi_sayisi = ${mevcutSayisi}, son_veri_noktasi_sayisi = ${mevcutSayisi}, guncellenme = now()
    `;
    return yeniOzet;
  }

  return profil[0].ozet_metni;
}
