import { YILLIK_PLAN } from "@/lib/yillik-plan.data";
import { KAZANIMLAR } from "@/lib/kazanimlar.data";
import { sql } from "@/lib/db";
import { createHash } from "node:crypto";

// Video Uretim Plani: her resmi alt konu icin TEK satir; konu paketi -> senaryo -> ses -> video asamalari ve kalite kapilari.
// Bir kez uretilir, kalici saklanir; mufredat yili degisince yalniz kaynagi (plan satiri) degisen konular 'yeniden_uretim' isaretlenir.
export const MUFREDAT_YILI = "2026-2027";
export const ASAMALAR = ["paket", "senaryo", "ses", "video"];
export const SENARYO_DURUMLARI = ["yok", "taslak", "denetimde", "gecti", "onayli", "reddedildi"];
export const SES_DURUMLARI = ["yok", "gemini", "klon", "dis_seslendirme", "kalite_hatali"];
export const VIDEO_PLAN_DURUMLARI = ["yok", "uretildi", "kalite_bekliyor", "yayinda", "yeniden_uretim"];

const HARITA = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u", "’": "'", "‘": "'" };
export const katla = (s) => String(s || "").replace(/İ/g, "i").replace(/I/g, "i").toLowerCase().replace(/i̇|[çğıöşüâîû’‘]/g, (c) => HARITA[c] || c).replace(/\s+/g, " ").trim();
export const kaynakHash = (...p) => createHash("sha1").update(p.map(katla).join("|")).digest("hex").slice(0, 12);

// Resmi plandaki alt konular (5-8). Ingilizce planda serbest metin oldugu icin temalar DB 'mufredat' tablosundan eklenir.
export function planAltKonulari(siniflar = [5, 6, 7, 8]) {
  const harita = new Map();
  for (const [key, rows] of Object.entries(YILLIK_PLAN)) {
    const [ders, sinifS] = key.split("::"); const sinif = Number(sinifS);
    if (!siniflar.includes(sinif) || ders === "Ingilizce") continue;
    for (const [hafta, unite, konu] of rows) for (const k of String(konu || "").split("; ")) {
      const t = k.trim(); if (!t) continue;
      const id = [sinif, ders, katla(unite), katla(t)].join("|");
      if (!harita.has(id)) harita.set(id, { sinif, ders, unite, konu: t, ilk_hafta: hafta });
    }
  }
  return [...harita.values()];
}

// Kaynakta (resmi plan/kazanim) eksik olanlar: uydurma yapilmaz, liste halinde gosterilir.
export function kaynakBosluklari(siniflar = [5, 6, 7, 8]) {
  const out = [];
  for (const [key, rows] of Object.entries(YILLIK_PLAN)) {
    const [ders, sinifS] = key.split("::"); const sinif = Number(sinifS);
    if (!siniflar.includes(sinif)) continue;
    const bos = rows.filter((r) => !String(r[2] || "").trim()).map((r) => r[0]);
    const kz = (KAZANIMLAR[key] || []).length;
    out.push({ sinif, ders, konusuz_hafta: ders === "Ingilizce" ? null : bos.length, konusuz_haftalar: ders === "Ingilizce" ? [] : bos, kazanim_sayisi: kz, kazanim_eksik: kz === 0 });
  }
  return out;
}

export async function planTablosuHazirla() {
  await sql`CREATE TABLE IF NOT EXISTS video_uretim_plani (
    id serial PRIMARY KEY, mufredat_yili text NOT NULL, sinif integer NOT NULL, ders text NOT NULL, unite text NOT NULL, konu text NOT NULL,
    kaynak_hash text NOT NULL, paket_id integer, paket_durum text NOT NULL DEFAULT 'yok',
    senaryo_durum text NOT NULL DEFAULT 'yok', senaryo_json jsonb, senaryo_hatalar jsonb, senaryo_denetim_tur integer,
    ses_durum text NOT NULL DEFAULT 'yok', ses_kalite jsonb, hoca text,
    video_durum text NOT NULL DEFAULT 'yok', video_id integer, maliyet_tl numeric(10,2) NOT NULL DEFAULT 0,
    guncelleme timestamptz NOT NULL DEFAULT now())`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS video_uretim_plani_kimlik ON video_uretim_plani (mufredat_yili, sinif, ders, unite, konu)`;
}

export async function planiTohumla() {
  await planTablosuHazirla();
  const liste = planAltKonulari();
  const ing = await sql`SELECT DISTINCT sinif, ders, unite, alt_konu FROM mufredat WHERE ders = 'Ingilizce' AND alt_konu IS NOT NULL AND alt_konu <> '' AND sinif IN (5,6,7,8)`;
  for (const r of ing) liste.push({ sinif: r.sinif, ders: r.ders, unite: r.unite, konu: r.alt_konu });
  let yeni = 0, degisen = 0;
  for (const k of liste) {
    const h = kaynakHash(k.sinif, k.ders, k.unite, k.konu);
    const ek = await sql`INSERT INTO video_uretim_plani (mufredat_yili, sinif, ders, unite, konu, kaynak_hash) VALUES (${MUFREDAT_YILI}, ${k.sinif}, ${k.ders}, ${k.unite}, ${k.konu}, ${h})
      ON CONFLICT (mufredat_yili, sinif, ders, unite, konu) DO NOTHING RETURNING id`;
    yeni += ek.length;
  }
  // paket durumu: icerik_onbellek'te sunulabilir paket (sinif + ders + konu adi eslesmesi)
  const paketler = await sql`SELECT DISTINCT ON (sinif, ders, konu) id, sinif, ders, konu FROM icerik_onbellek WHERE icerik_turu = 'konu_paketi' AND (onay_durumu = 'onaylandi' OR onay_durumu IS NULL) AND icerik_json IS NOT NULL ORDER BY sinif, ders, konu, id DESC`;
  const pk = new Map(paketler.map((p) => [`${p.sinif}|${p.ders}|${katla(p.konu)}`, p.id]));
  const satirlar = await sql`SELECT id, sinif, ders, konu, paket_id FROM video_uretim_plani WHERE mufredat_yili = ${MUFREDAT_YILI}`;
  let paketHazir = 0;
  for (const s of satirlar) {
    const pid = pk.get(`${s.sinif}|${s.ders}|${katla(s.konu)}`);
    if (pid && pid !== s.paket_id) { await sql`UPDATE video_uretim_plani SET paket_id = ${pid}, paket_durum = 'hazir', guncelleme = now() WHERE id = ${s.id}`; }
    if (pid) paketHazir++;
  }
  return { yeniSatir: yeni, toplam: satirlar.length, paketHazir, degisen };
}
