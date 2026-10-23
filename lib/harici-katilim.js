import { sql } from "@/lib/db";

// Harici katilimci (Sinav Merkezi madde 20): hesapsiz biri cihaz kimligiyle ulusal denemeye
// girer (golge kullanici, e-posta "<cihazId>@anon.karemux.com", sifre_hash 'anon'). Sonra hesap
// acinca ya da giris yapinca sonuclari yeni hesaba tasinir ("Sonucumu Karemux'a aktar").
// Tablo ilk kullanimda kendiliginden olusur (elle SQL gerekmez).
let hazir = false;
async function tabloHazirla() {
  if (hazir) return;
  await sql`CREATE TABLE IF NOT EXISTS harici_katilim_aktarim (
    id serial PRIMARY KEY,
    golge_id integer NOT NULL UNIQUE,
    kullanici_id integer NOT NULL,
    tasinan jsonb NOT NULL DEFAULT '{}'::jsonb,
    olusturulma timestamptz NOT NULL DEFAULT now()
  )`;
  hazir = true;
}

export function cihazIdGecerliMi(v) {
  return typeof v === "string" && /^[A-Za-z0-9_-]{8,80}$/.test(v);
}

// Her kalem kendi try/catch'inde: bir tablodaki cakisma (ornegin ayni kayit hesapta da var) digerlerini durdurmaz.
async function kalemTasi(ad, sonuc, fn) {
  try {
    const r = await fn();
    sonuc.tasinan[ad] = Array.isArray(r) ? r.length : 0;
  } catch (e) {
    sonuc.atlanan.push(ad);
    console.error(`Harici aktarim '${ad}' atlandi:`, e.message);
  }
}

export async function golgeHesabiAktar(gercekId, cihazId) {
  const sonuc = { aktarilan: false, tasinan: {}, atlanan: [] };
  if (!Number.isInteger(gercekId) || !cihazIdGecerliMi(cihazId)) return sonuc;
  await tabloHazirla();

  const golge = await sql`
    SELECT id FROM kullanicilar WHERE eposta = ${cihazId + "@anon.karemux.com"} AND sifre_hash = 'anon'
  `;
  const g = golge[0]?.id;
  if (!g || g === gercekId) return sonuc;

  // Ayni golge hesap yalniz bir kez aktarilir (baska birinin sonradan "ben de aktaririm" demesini engeller).
  const kayit = await sql`
    INSERT INTO harici_katilim_aktarim (golge_id, kullanici_id) VALUES (${g}, ${gercekId})
    ON CONFLICT (golge_id) DO NOTHING RETURNING id
  `;
  if (kayit.length === 0) return sonuc;

  // Ulusal deneme sonucu: ayni denemeyi gercek hesap da cozduyse golgeninki tasinmaz (tek deneme / kisi).
  await kalemTasi("ulusal_deneme_sonuclari", sonuc, () => sql`
    UPDATE ulusal_deneme_sonuclari SET kullanici_id = ${gercekId}
    WHERE kullanici_id = ${g}
      AND ulusal_deneme_id NOT IN (SELECT ulusal_deneme_id FROM ulusal_deneme_sonuclari WHERE kullanici_id = ${gercekId})
    RETURNING id`);
  await kalemTasi("hata_kitapcigi", sonuc, () => sql`UPDATE hata_kitapcigi SET kullanici_id = ${gercekId} WHERE kullanici_id = ${g} RETURNING id`);
  await kalemTasi("sinav_sonuclari", sonuc, () => sql`UPDATE sinav_sonuclari SET kullanici_id = ${gercekId} WHERE kullanici_id = ${g} RETURNING id`);
  await kalemTasi("ilerleme", sonuc, () => sql`UPDATE ilerleme SET kullanici_id = ${gercekId} WHERE kullanici_id = ${g} RETURNING id`);

  const toplam = Object.values(sonuc.tasinan).reduce((a, b) => a + b, 0);
  sonuc.aktarilan = toplam > 0;
  // Hicbir sey tasinamadiysa ve hata varsa isareti geri al: sonraki giriste yeniden denenir.
  if (toplam === 0 && sonuc.atlanan.length > 0) {
    await sql`DELETE FROM harici_katilim_aktarim WHERE golge_id = ${g}`;
    return sonuc;
  }
  await sql`UPDATE harici_katilim_aktarim SET tasinan = ${JSON.stringify({ ...sonuc.tasinan, atlanan: sonuc.atlanan })}::jsonb WHERE golge_id = ${g}`;
  return sonuc;
}
