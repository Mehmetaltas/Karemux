import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";
import { tumCekirdek } from "@/lib/icerik-cekirdegi";
import { videoTablosuHazirla, VIDEO_DURUMLARI, VIDEO_TURLERI, gecisGecerliMi, videoUrlGecerliMi } from "@/lib/video-katalogu";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "video_katalogu_admin", 8, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "video_katalogu_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "video_katalogu_admin", true);
  return { izinVar: true };
}

// GET: durum sayilari + (opsiyonel) liste. ?sifre=
export async function GET(req) {
  const u = new URL(req.url).searchParams;
  const yetki = await yetkiKontrol(req, u.get("sifre"));
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
  await videoTablosuHazirla();
  const durumlar = await sql`SELECT durum, COUNT(*)::int AS adet FROM video_katalogu GROUP BY durum`;
  const liste = await sql`SELECT id, sinif, ders, unite, alt_konu, video_turu, durum, url, sure_sn FROM video_katalogu ORDER BY id DESC LIMIT 100`;
  return Response.json({ durumlar, liste, izinliDurumlar: VIDEO_DURUMLARI, izinliTurler: VIDEO_TURLERI });
}

// POST { sifre, islem: "planla_hepsi" | "durum" | "url", ... }
export async function POST(req) {
  let g;
  try { g = await req.json(); } catch { return Response.json({ error: "Gecersiz istek" }, { status: 400 }); }
  const yetki = await yetkiKontrol(req, g.sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
  await videoTablosuHazirla();

  if (g.islem === "planla_hepsi") {
    // Her resmi unite icin 1 'mini_ders' kaydi 'planli' acilir (idempotent: kimlik indeksi cift kaydi engeller).
    let eklenen = 0;
    for (const c of tumCekirdek()) {
      for (const un of c.uniteler) {
        const r = await sql`INSERT INTO video_katalogu (sinif, ders, unite, video_turu) VALUES (${c.sinif}, ${c.ders}, ${un.unite}, 'mini_ders') ON CONFLICT DO NOTHING RETURNING id`;
        eklenen += r.length;
      }
    }
    return Response.json({ ok: true, eklenen });
  }
  const id = Number(g.id);
  if (!Number.isInteger(id)) return Response.json({ error: "id gerekli" }, { status: 400 });
  const mevcut = await sql`SELECT durum, url FROM video_katalogu WHERE id = ${id}`;
  if (!mevcut[0]) return Response.json({ error: "Kayit yok" }, { status: 404 });

  if (g.islem === "url") {
    if (!videoUrlGecerliMi(g.url)) return Response.json({ error: "Gecersiz video adresi (https; YouTube/Vimeo/Vercel Blob)" }, { status: 400 });
    await sql`UPDATE video_katalogu SET url = ${g.url}, guncelleme = now() WHERE id = ${id}`;
    return Response.json({ ok: true });
  }
  if (g.islem === "durum") {
    if (!VIDEO_DURUMLARI.includes(g.durum) || !gecisGecerliMi(mevcut[0].durum, g.durum)) return Response.json({ error: `Gecersiz gecis: ${mevcut[0].durum} -> ${g.durum}` }, { status: 400 });
    if (g.durum === "yayinda" && !mevcut[0].url) return Response.json({ error: "Yayina almak icin once video adresi girilmeli" }, { status: 400 });
    await sql`UPDATE video_katalogu SET durum = ${g.durum}, guncelleme = now() WHERE id = ${id}`;
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Bilinmeyen islem" }, { status: 400 });
}
