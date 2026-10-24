import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";
import { MUFREDAT_YILI, kaynakBosluklari, planTablosuHazirla, planiTohumla, yilDevri } from "@/lib/video-plani";

export const maxDuration = 60;

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "video_plani_admin", 8, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "video_plani_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "video_plani_admin", true);
  return { izinVar: true };
}

// GET: asama bazli ozet (sinif/ders) + kaynak bosluklari. ?sifre=
export async function GET(req) {
  const u = new URL(req.url).searchParams;
  const yetki = await yetkiKontrol(req, u.get("sifre"));
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
  await planTablosuHazirla();
  const ozet = await sql`SELECT sinif, ders, COUNT(*)::int AS toplam,
      COUNT(*) FILTER (WHERE paket_durum = 'hazir')::int AS paket,
      COUNT(*) FILTER (WHERE senaryo_durum IN ('gecti','onayli'))::int AS senaryo,
      COUNT(*) FILTER (WHERE ses_durum IN ('gemini','klon','dis_seslendirme'))::int AS ses,
      COUNT(*) FILTER (WHERE video_durum IN ('uretildi','kalite_bekliyor','yayinda'))::int AS video,
      COUNT(*) FILTER (WHERE video_durum = 'yayinda')::int AS yayinda,
      COUNT(*) FILTER (WHERE video_durum = 'yeniden_uretim')::int AS yeniden,
      COALESCE(SUM(maliyet_tl), 0)::numeric(10,2) AS maliyet_tl
    FROM video_uretim_plani WHERE mufredat_yili = ${MUFREDAT_YILI} GROUP BY sinif, ders ORDER BY sinif, ders`;
  return Response.json({ mufredatYili: MUFREDAT_YILI, ozet, kaynakBosluklari: kaynakBosluklari().filter((b) => b.gercek_bosluk_hafta || b.kazanim_eksik) });
}

// POST {sifre, islem:"tohumla"}: plandaki tum alt konulari satir olarak acar (idempotent), paket/video durumlarini senkronlar,
// kaynagi degisen satirlari 'yeniden_uretim' isaretler.
export async function POST(req) {
  const g = await req.json().catch(() => ({}));
  const yetki = await yetkiKontrol(req, g.sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
  if (g.islem === "yil_devri") {
    try { return Response.json({ ok: true, ...(await yilDevri(String(g.eskiYil || ""), String(g.yeniYil || ""))) }); }
    catch (e) { return Response.json({ error: e.message }, { status: 400 }); }
  }
  if (g.islem !== "tohumla") return Response.json({ error: "bilinmeyen islem" }, { status: 400 });
  const r = await planiTohumla();
  return Response.json({ ok: true, ...r });
}
