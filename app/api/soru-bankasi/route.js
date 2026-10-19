import { sql } from "@/lib/db";

// GET: ders bazinda banka sayilari (kisisel veri / cevap anahtari icermez).

// Faz E kilitleme (19 Ekim): bu uc herkese aciktı ve istemciden gelen sorulari
// (cevap anahtariyla) bankaya yaziyordu - banka zehirlenebilirdi. Bankaya yazimi
// artik sadece sunucu tarafi uretim yapar (lib/pratik-uretimi.js soruBankasinaArsivle).
export async function POST() {
  return Response.json({ error: "Soru bankasina yazim sunucuda yapilir; bu uc nokta kapatildi" }, { status: 410 });
}

export async function GET() {
  try {
    const sonuc = await sql`
      SELECT ders, COUNT(*)::int AS adet
      FROM soru_bankasi
      GROUP BY ders
      ORDER BY adet DESC
    `;
    const toplam = sonuc.reduce((t, r) => t + r.adet, 0);
    return Response.json({ dersBazinda: sonuc, toplam });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
