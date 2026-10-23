import { sql } from "@/lib/db";
import { videoTablosuHazirla } from "@/lib/video-katalogu";

// Ogrenci: yalniz YAYINDAKI videolar. ?sinif=&ders=[&unite=]
export async function GET(req) {
  try {
    const u = new URL(req.url).searchParams;
    const sinif = Number(u.get("sinif")), ders = u.get("ders"), unite = u.get("unite");
    if (!Number.isInteger(sinif) || !ders) return Response.json({ error: "sinif ve ders gerekli" }, { status: 400 });
    await videoTablosuHazirla();
    const l = unite
      ? await sql`SELECT id, unite, alt_konu, video_turu, yayin_yeri, seviye, sure_sn, url FROM video_katalogu WHERE sinif = ${sinif} AND ders = ${ders} AND unite = ${unite} AND durum = 'yayinda' AND url IS NOT NULL ORDER BY id`
      : await sql`SELECT id, unite, alt_konu, video_turu, yayin_yeri, seviye, sure_sn, url FROM video_katalogu WHERE sinif = ${sinif} AND ders = ${ders} AND durum = 'yayinda' AND url IS NOT NULL ORDER BY unite, id`;
    return Response.json({ videolar: l }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  } catch (e) {
    console.error("video-katalogu:", e);
    return Response.json({ videolar: [] });
  }
}
