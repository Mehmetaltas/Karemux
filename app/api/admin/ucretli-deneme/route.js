import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "ucretli_deneme_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "ucretli_deneme_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "ucretli_deneme_admin", true);
  return { izinVar: true };
}

// GET: tum ucretli denemeleri + hangi kurumlarin hangisini satin aldigini listeler.
export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const denemeler = await sql`SELECT id, ad, ders, sinif, fiyat_tl, aktif, kapsam, il FROM ucretli_denemeler ORDER BY olusturulma DESC`;
  const satinAlmalar = await sql`
    SELECT k.kurum_id, k.deneme_id, k.tutar_tl, k.odendi, ku.ad AS kurum_adi
    FROM kurum_deneme_satin_alma k JOIN kurumlar ku ON ku.id = k.kurum_id
  `;
  return Response.json({ denemeler, satinAlmalar });
}

// POST: kurumun bir ucretli denemeyi satin aldigini isaretler (admin tarafindan,
// gercek odeme/fatura sureci sistem disinda yurutuluyor - bu sadece erisim kaydini acar).
export async function POST(req) {
  try {
    const { sifre, kurumId, denemeId, tutarTl, odendi } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!kurumId || !denemeId) return Response.json({ error: "kurumId ve denemeId gerekli" }, { status: 400 });

    await sql`
      INSERT INTO kurum_deneme_satin_alma (kurum_id, deneme_id, tutar_tl, odendi)
      VALUES (${kurumId}, ${denemeId}, ${tutarTl}, ${!!odendi})
      ON CONFLICT (kurum_id, deneme_id) DO UPDATE SET tutar_tl = ${tutarTl}, odendi = ${!!odendi}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
