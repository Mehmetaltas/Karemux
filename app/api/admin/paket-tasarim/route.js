import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi, personelCoz } from "@/lib/personel";

// V3 Dalga 3 - Paket Tasarim Merkezi: paketleri tek ekrandan kurma/duzenleme (fiyat, sure/kredi, AI limiti,
// haklar, kapsam, aktiflik). Paket SILINMEZ (abonelik/odeme kayitlari buna bagli); yalnizca pasife alinir.
// Yeni paket HER ZAMAN pasif baslar; satisa acmak bilincli bir ikinci adimdir.

const HAK_KATALOGU = [
  ["exam_access", "Sınav erişimi"],
  ["online_exam_access", "Online sınav"],
  ["analysis_access", "Sınav analizi"],
  ["result_access", "Sonuç ekranı"],
  ["ranking_access", "Sıralama"],
  ["remediation_access", "Telafi / eksik kapatma"],
  ["learning_memory_access", "Öğrenme Hafızası"],
];
const HAK_ANAHTARLARI = HAK_KATALOGU.map((h) => h[0]);
const SINIFLAR = [4, 5, 6, 7, 8];
const DERSLER = ["Matematik", "Fen Bilimleri", "Turkce", "Sosyal Bilgiler", "T.C. Inkilap Tarihi", "Din Kulturu", "Ingilizce"];

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "paket_tasarim", 8, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Çok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "paket_tasarim", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "paket_tasarim", true);
  return { izinVar: true };
}

let hazir = false;
async function kolonlariHazirla() {
  if (hazir) return;
  await sql`ALTER TABLE paketler ADD COLUMN IF NOT EXISTS haklar jsonb NOT NULL DEFAULT '{}'::jsonb`;
  await sql`ALTER TABLE paketler ADD COLUMN IF NOT EXISTS kapsam jsonb NOT NULL DEFAULT '{}'::jsonb`;
  hazir = true;
}

// Girdiyi dogrular, temizlenmis alanlari veya hata dondurur.
function alanlariDogrula(g, yeni) {
  const h = (m) => ({ hata: m });
  const ad = String(g.ad ?? "").trim();
  if (ad.length < 3 || ad.length > 80) return h("Paket adı 3-80 karakter olmalı");
  const aciklama = String(g.aciklama ?? "").trim().slice(0, 400) || null;
  const fiyat = Number(g.fiyatTl);
  if (!Number.isFinite(fiyat) || fiyat < 0 || fiyat > 100000) return h("Fiyat 0 - 100.000 ₺ arasında olmalı");
  const sure = g.sureGun === "" || g.sureGun == null ? null : Number(g.sureGun);
  const kredi = g.krediMiktari === "" || g.krediMiktari == null ? null : Number(g.krediMiktari);
  if (sure != null && (!Number.isInteger(sure) || sure < 1 || sure > 1100)) return h("Süre 1-1100 gün (tam sayı) olmalı");
  if (kredi != null && (!Number.isInteger(kredi) || kredi < 1 || kredi > 100000)) return h("Kredi pozitif tam sayı olmalı");
  if (sure == null && kredi == null) return h("Süre (gün) ya da kredi miktarından en az biri gerekli");
  const aiLimit = g.gunlukAiLimiti === "" || g.gunlukAiLimiti == null ? null : Number(g.gunlukAiLimiti);
  if (aiLimit != null && (!Number.isInteger(aiLimit) || aiLimit < 0 || aiLimit > 100000)) return h("Günlük AI limiti 0 veya pozitif tam sayı olmalı");
  const haklar = {};
  for (const k of HAK_ANAHTARLARI) if (g.haklar && g.haklar[k] === true) haklar[k] = true;
  const siniflar = (Array.isArray(g.kapsam?.siniflar) ? g.kapsam.siniflar : []).map(Number).filter((n) => SINIFLAR.includes(n));
  const dersler = (Array.isArray(g.kapsam?.dersler) ? g.kapsam.dersler : []).filter((d) => DERSLER.includes(d));
  const kapsam = { siniflar: [...new Set(siniflar)], dersler: [...new Set(dersler)] };
  let anahtar = null;
  if (yeni) {
    anahtar = String(g.anahtar ?? "").trim();
    if (!/^[a-z][a-z0-9_]{2,40}$/.test(anahtar)) return h("Anahtar küçük harf, rakam ve alt çizgiden oluşmalı (3-41 karakter, harfle başlar)");
  }
  return { ad, aciklama, fiyat, sure, kredi, aiLimit, haklar, kapsam, anahtar };
}

async function gecmiseYaz(req, tur, detay) {
  try {
    const personel = await personelCoz(req);
    await sql`INSERT INTO muhasebe_islem_gecmisi (personel_id, personel_ad, islem_turu, detay) VALUES (${personel?.id || null}, ${personel?.ad || null}, ${tur}, ${detay})`;
  } catch (e) { console.error("Paket tasarim gecmis yazilamadi:", e.message); }
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    await kolonlariHazirla();
    const paketler = await sql`
      SELECT p.id, p.anahtar, p.ad, p.aciklama, p.fiyat_tl, p.sure_gun, p.kredi_miktari, p.gunluk_ai_limiti, p.aktif, p.haklar, p.kapsam,
        (SELECT count(*)::int FROM abonelikler a WHERE a.durum = 'aktif' AND (a.bitis IS NULL OR a.bitis > now())
           AND (a.paket_id = p.id OR (a.paket_id IS NULL AND a.plan = p.anahtar))) AS aktif_abone
      FROM paketler p ORDER BY p.aktif DESC, p.fiyat_tl DESC, p.id`;
    return Response.json({ paketler, haklar: HAK_KATALOGU, siniflar: SINIFLAR, dersler: DERSLER });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Paketler alınamadı" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const g = await req.json();
    const yetki = await yetkiKontrol(req, g.sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    await kolonlariHazirla();
    const v = alanlariDogrula(g, true);
    if (v.hata) return Response.json({ error: v.hata }, { status: 400 });
    const var_ = await sql`SELECT 1 FROM paketler WHERE anahtar = ${v.anahtar}`;
    if (var_.length > 0) return Response.json({ error: "Bu anahtarla bir paket zaten var" }, { status: 409 });
    const r = await sql`
      INSERT INTO paketler (anahtar, ad, aciklama, fiyat_tl, sure_gun, kredi_miktari, gunluk_ai_limiti, aktif, haklar, kapsam)
      VALUES (${v.anahtar}, ${v.ad}, ${v.aciklama}, ${v.fiyat}, ${v.sure}, ${v.kredi}, ${v.aiLimit}, false, ${JSON.stringify(v.haklar)}::jsonb, ${JSON.stringify(v.kapsam)}::jsonb)
      RETURNING id`;
    await gecmiseYaz(req, "paket_olusturuldu", `${v.ad} (${v.anahtar}) pasif olarak oluşturuldu, ${v.fiyat}₺`);
    return Response.json({ ok: true, id: r[0].id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Paket oluşturulamadı" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const g = await req.json();
    const yetki = await yetkiKontrol(req, g.sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    await kolonlariHazirla();
    const id = Number(g.paketId);
    if (!Number.isInteger(id)) return Response.json({ error: "Geçersiz paket" }, { status: 400 });
    const eski = await sql`SELECT ad, fiyat_tl, aktif, haklar FROM paketler WHERE id = ${id}`;
    if (eski.length === 0) return Response.json({ error: "Paket bulunamadı" }, { status: 404 });
    const v = alanlariDogrula(g, false);
    if (v.hata) return Response.json({ error: v.hata }, { status: 400 });
    const aktif = g.aktif === true;
    await sql`
      UPDATE paketler SET ad = ${v.ad}, aciklama = ${v.aciklama}, fiyat_tl = ${v.fiyat}, sure_gun = ${v.sure}, kredi_miktari = ${v.kredi},
        gunluk_ai_limiti = ${v.aiLimit}, aktif = ${aktif}, haklar = ${JSON.stringify(v.haklar)}::jsonb, kapsam = ${JSON.stringify(v.kapsam)}::jsonb
      WHERE id = ${id}`;
    const degisen = [];
    if (Number(eski[0].fiyat_tl) !== v.fiyat) degisen.push(`fiyat ${eski[0].fiyat_tl}₺→${v.fiyat}₺`);
    if (eski[0].aktif !== aktif) degisen.push(aktif ? "satışa açıldı" : "satıştan kaldırıldı");
    if (JSON.stringify(eski[0].haklar || {}) !== JSON.stringify(v.haklar)) degisen.push("haklar değişti");
    await gecmiseYaz(req, "paket_guncellendi", `${v.ad}: ${degisen.join(", ") || "alanlar güncellendi"}`);
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Paket güncellenemedi" }, { status: 500 });
  }
}
